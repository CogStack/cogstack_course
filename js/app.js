/* Clinical Text AI for Healthcare Leaders — YAML-driven course player.
 * All course content lives in content/*.yaml. This file only renders it.
 */
(function () {
  'use strict';

  var STORAGE_KEY = 'ctai-course-progress-v1';
  var PREVIEW_KEY = 'ctai-course-preview';   // reviewer switch: toggled by visiting #/unlock
  var CONTENT_ROOT = 'content/';

  var state = {
    course: null,         // parsed content/course.yaml
    sections: {},         // id -> parsed section yaml
    order: [],            // section ids in course order
    progress: loadProgress(),
    preview: localStorage.getItem('ctai-course-preview') === '1',  // opens every section; never marks anything complete
    quiz: null            // live quiz attempt state
  };

  var app = document.getElementById('app');

  /* ---------------- Progress persistence ---------------- */
  function loadProgress() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) { /* ignore */ }
    return { completed: {}, attempts: {}, started: null, learner: '' };
  }
  function saveProgress() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state.progress)); } catch (e) { /* ignore */ }
  }
  function resetProgress() {
    if (!confirm('Reset all progress and quiz results? This cannot be undone.')) return;
    state.progress = { completed: {}, attempts: {}, started: null, learner: '' };
    saveProgress();
    location.hash = '#/';
    render();
  }

  /* ---------------- Loading ---------------- */
  function fetchYaml(path) {
    return fetch(CONTENT_ROOT + path, { cache: 'no-cache' }).then(function (r) {
      if (!r.ok) throw new Error('Could not load ' + path + ' (' + r.status + ')');
      return r.text();
    }).then(function (txt) { return jsyaml.load(txt); });
  }

  function loadCourse() {
    return fetchYaml('course.yaml').then(function (course) {
      state.course = course;
      state.order = course.sections.map(function (s) { return s.id; });
      return Promise.all(course.sections.map(function (s) {
        return fetchYaml(s.file).then(function (sec) {
          sec.id = sec.id || s.id;
          sec.part = sec.part || s.part;
          state.sections[s.id] = sec;
        });
      }));
    });
  }

  /* ---------------- Helpers ---------------- */
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  // Minimal inline formatting: **bold**, *italic*, `code`.
  function inline(s) {
    return esc(s)
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/(^|[^*])\*([^*\n]+?)\*/g, '$1<em>$2</em>')
      .replace(/`([^`]+?)`/g, '<code>$1</code>');
  }
  function paras(text) {
    if (Array.isArray(text)) return text.map(function (t) { return '<p>' + inline(t) + '</p>'; }).join('');
    return String(text || '').trim().split(/\n\s*\n/).map(function (t) {
      return '<p>' + inline(t.replace(/\s*\n\s*/g, ' ')) + '</p>';
    }).join('');
  }
  function partById(id) {
    return (state.course.parts || []).find(function (p) { return p.id === id; }) || { id: id, title: id };
  }
  function sectionsInPart(partId) {
    return state.order.filter(function (id) { return state.sections[id].part === partId; });
  }
  function isComplete(id) { return !!state.progress.completed[id]; }
  function partComplete(partId) { return sectionsInPart(partId).every(isComplete); }
  function sectionNumber(id) { return state.order.indexOf(id) + 1; }
  function passMark() {
    return (state.course.cpd && state.course.cpd.pass_mark) || 80;
  }

  // Unlock rules: a part opens when all previous parts are complete.
  // Inside a part, `unlock: sequential` requires the previous section; `unlock: any` does not.
  function isUnlocked(id) {
    if (state.preview) return true;
    var sec = state.sections[id];
    var parts = state.course.parts || [];
    var pIndex = parts.findIndex(function (p) { return p.id === sec.part; });
    for (var i = 0; i < pIndex; i++) {
      if (!partComplete(parts[i].id)) return false;
    }
    var part = parts[pIndex] || {};
    if (part.unlock === 'sequential') {
      var ids = sectionsInPart(sec.part);
      var idx = ids.indexOf(id);
      if (idx > 0 && !isComplete(ids[idx - 1])) return false;
    }
    return true;
  }
  function lockReason(id) {
    var sec = state.sections[id];
    var parts = state.course.parts || [];
    var pIndex = parts.findIndex(function (p) { return p.id === sec.part; });
    for (var i = 0; i < pIndex; i++) {
      if (!partComplete(parts[i].id)) return 'Complete ' + parts[i].title + ' first.';
    }
    var ids = sectionsInPart(sec.part);
    var idx = ids.indexOf(id);
    if (idx > 0) return 'Complete section ' + sectionNumber(ids[idx - 1]) + ' first.';
    return 'Locked.';
  }
  function nextSectionId(id) {
    var i = state.order.indexOf(id);
    return i >= 0 && i < state.order.length - 1 ? state.order[i + 1] : null;
  }
  function prevSectionId(id) {
    var i = state.order.indexOf(id);
    return i > 0 ? state.order[i - 1] : null;
  }
  function allComplete() { return state.order.every(isComplete); }
  function totalMinutes() {
    return state.order.reduce(function (sum, id) { return sum + (state.sections[id].duration_minutes || 0); }, 0);
  }
  function fmtDate(iso) {
    var d = new Date(iso);
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  }
  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }
  function hashCode(str) {
    var h = 5381;
    for (var i = 0; i < str.length; i++) h = ((h << 5) + h + str.charCodeAt(i)) >>> 0;
    return h.toString(16).toUpperCase().padStart(8, '0');
  }

  /* ---------------- Views ---------------- */
  function renderHome() {
    var c = state.course;
    var done = state.order.filter(isComplete).length;
    var pct = Math.round((done / state.order.length) * 100);
    var html = '';

    html += '<section class="card hero">';
    html += '<p class="badge">' + esc(c.cpd ? c.cpd.label || 'CPD course' : 'Course') + '</p>';
    html += '<h1>' + inline(c.title) + '</h1>';
    if (c.subtitle) html += '<p class="lead">' + inline(c.subtitle) + '</p>';
    html += paras(c.description);
    if (c.audience) html += '<p class="small muted"><strong>Who this is for:</strong> ' + inline(c.audience) + '</p>';
    html += '<div class="progress-wrap"><div class="progress-bar"><span style="width:' + pct + '%"></span></div>';
    html += '<p class="small muted">' + done + ' of ' + state.order.length + ' sections complete (' + pct + '%). ';
    html += 'Estimated time: ' + Math.round(totalMinutes() / 60 * 10) / 10 + ' hours. Pass mark for each quiz: ' + passMark() + '%.</p></div>';
    var resume = state.order.find(function (id) { return !isComplete(id) && isUnlocked(id); });
    html += '<div class="btn-row">';
    if (allComplete()) html += '<a class="btn" href="#/certificate">Get your certificate</a>';
    else if (resume) html += '<a class="btn" href="#/section/' + esc(resume) + '">' + (done ? 'Continue' : 'Start the course') + '</a>';
    html += '</div></section>';

    if (c.outcomes && c.outcomes.length) {
      html += '<section class="card"><h2>What you will be able to do by the end</h2><ol class="outcomes">';
      c.outcomes.forEach(function (o) { html += '<li>' + inline(o) + '</li>'; });
      html += '</ol></section>';
    }

    if (c.how_it_works) {
      html += '<section class="card"><h2>How the course works</h2>' + paras(c.how_it_works) + '</section>';
    }

    (c.parts || []).forEach(function (p) {
      html += '<div class="part-heading"><span class="badge part">' + esc(p.label || p.id) + '</span><h2>' + inline(p.title) + '</h2></div>';
      if (p.description) html += '<p class="muted">' + inline(p.description) + '</p>';
      html += '<ul class="section-list">';
      sectionsInPart(p.id).forEach(function (id) {
        var s = state.sections[id];
        var unlocked = isUnlocked(id);
        var complete = isComplete(id);
        var cls = 'section-item' + (unlocked ? '' : ' is-locked');
        var tag = unlocked ? 'a href="#/section/' + esc(id) + '"' : 'div title="' + esc(lockReason(id)) + '"';
        var close = unlocked ? 'a' : 'div';
        html += '<li><' + tag + ' class="' + cls + '">';
        html += '<span class="num">' + sectionNumber(id) + '</span>';
        html += '<span><span class="title">' + inline(s.title) + '</span><br><span class="meta">';
        if (s.core_question) html += inline(s.core_question) + ' · ';
        html += (s.duration_minutes || '?') + ' min · ' + ((s.quiz && s.quiz.questions) ? s.quiz.questions.length : 0) + ' quiz questions</span></span>';
        html += '<span class="status">';
        if (complete) html += '<span class="badge done">Complete · ' + state.progress.completed[id].score + '%</span>';
        else if (!unlocked) html += '<span class="badge locked">Locked</span>';
        else html += '<span class="badge">Available</span>';
        html += '</span></' + close + '></li>';
      });
      html += '</ul>';
    });

    app.innerHTML = html;
  }

  function renderBlock(b) {
    if (typeof b === 'string') return paras(b);
    switch (b.type) {
      case 'heading':
        return '<h2>' + inline(b.text) + '</h2>';
      case 'subheading':
        return '<h3>' + inline(b.text) + '</h3>';
      case 'paragraph':
        return paras(b.text);
      case 'list': {
        var tag = b.style === 'number' ? 'ol' : 'ul';
        return '<' + tag + '>' + (b.items || []).map(function (i) {
          if (typeof i === 'object' && i.term) return '<li><strong>' + inline(i.term) + '</strong> ' + inline(i.text) + '</li>';
          return '<li>' + inline(i) + '</li>';
        }).join('') + '</' + tag + '>';
      }
      case 'callout': {
        var kind = b.kind || 'evidence';
        var defaultTitles = { 'key-message': 'Key message', limits: 'What it cannot do', evidence: 'Evidence', warning: 'Caution' };
        return '<aside class="callout ' + esc(kind) + '"><span class="callout-title">' + inline(b.title || defaultTitles[kind] || '') + '</span>' + paras(b.text) + '</aside>';
      }
      case 'case_study': {
        var h = '<article class="case-study"><span class="cs-label">Case study</span><h3>' + inline(b.title) + '</h3>' + paras(b.text);
        if (b.details) {
          h += '<dl>';
          Object.keys(b.details).forEach(function (k) { h += '<dt>' + inline(k) + '</dt><dd>' + inline(b.details[k]) + '</dd>'; });
          h += '</dl>';
        }
        return h + '</article>';
      }
      case 'table': {
        var t = '<table class="content-table">';
        if (b.headers) t += '<thead><tr>' + b.headers.map(function (x) { return '<th>' + inline(x) + '</th>'; }).join('') + '</tr></thead>';
        t += '<tbody>' + (b.rows || []).map(function (r) {
          return '<tr>' + r.map(function (x) { return '<td>' + inline(x) + '</td>'; }).join('') + '</tr>';
        }).join('') + '</tbody></table>';
        return t;
      }
      default:
        return paras(b.text || '');
    }
  }

  function renderSection(id) {
    var s = state.sections[id];
    if (!s) return renderNotFound();
    if (!isUnlocked(id)) {
      app.innerHTML = '<div class="card"><h1>Section locked</h1><p>' + esc(lockReason(id)) + '</p><a class="btn" href="#/">Back to course home</a></div>';
      return;
    }
    var part = partById(s.part);
    var html = '<article class="card">';
    html += '<header class="section-header"><p class="kicker">' + esc(part.label || part.title) + ' · Section ' + sectionNumber(id) + ' of ' + state.order.length + ' · ' + (s.duration_minutes || '?') + ' minutes</p>';
    html += '<h1>' + inline(s.title) + '</h1>';
    if (s.core_question) html += '<p class="lead muted">' + inline(s.core_question) + '</p>';
    html += '</header>';
    if (s.objectives && s.objectives.length) {
      html += '<ul class="objectives"><li class="objectives-title" style="list-style:none">By the end of this section you should be able to:</li>';
      s.objectives.forEach(function (o) { html += '<li>' + inline(o) + '</li>'; });
      html += '</ul>';
    }
    html += '<div class="content">' + (s.content || []).map(renderBlock).join('') + '</div>';
    html += '<div class="section-nav no-print">';
    var prev = prevSectionId(id);
    html += prev ? '<a class="btn secondary" href="#/section/' + esc(prev) + '">&larr; Previous section</a>' : '<span></span>';
    if (s.quiz && s.quiz.questions && s.quiz.questions.length) {
      var done = isComplete(id);
      html += '<a class="btn" href="#/section/' + esc(id) + '/quiz">' + (done ? 'Retake quiz' : 'Take the quiz') + ' &rarr;</a>';
    }
    html += '</div></article>';
    app.innerHTML = html;
    window.scrollTo(0, 0);
  }

  /* ---------------- Quiz ---------------- */
  function startQuiz(id) {
    var s = state.sections[id];
    state.quiz = {
      sectionId: id,
      questions: s.quiz.questions.map(function (q, qi) {
        var opts = q.options.map(function (o, oi) { return { text: o.text, correct: !!o.correct, key: qi + '-' + oi }; });
        return {
          id: q.id || 'q' + (qi + 1),
          type: q.type || 'single',
          question: q.question,
          explanation: q.explanation || '',
          options: q.shuffle === false ? opts : shuffle(opts)
        };
      }),
      submitted: false,
      answers: {}
    };
  }

  function renderQuiz(id) {
    var s = state.sections[id];
    if (!s || !s.quiz) return renderNotFound();
    if (!isUnlocked(id)) return renderSection(id);
    if (!state.quiz || state.quiz.sectionId !== id || state.quiz.submitted) startQuiz(id);
    var q = state.quiz;
    var html = '<article class="card">';
    html += '<header class="section-header"><p class="kicker">Section ' + sectionNumber(id) + ' quiz</p><h1>' + inline(s.title) + '</h1></header>';
    html += '<div class="quiz-intro">' + paras(s.quiz.intro || ('Answer every question. You need ' + passMark() + '% to complete this section. You can retake the quiz as many times as you like.')) + '</div>';
    html += '<form id="quiz-form" novalidate>';
    q.questions.forEach(function (qq, qi) {
      var multi = qq.type === 'multiple';
      html += '<fieldset class="question" data-q="' + qi + '"><legend class="q-text">' + (qi + 1) + '. ' + inline(qq.question) + '</legend>';
      if (multi && !/select all/i.test(qq.question)) html += '<p class="q-hint">Select all that apply.</p>';
      html += '<ul class="options">';
      qq.options.forEach(function (o, oi) {
        var name = 'q' + qi;
        html += '<li class="option" data-o="' + oi + '"><label><input type="' + (multi ? 'checkbox' : 'radio') + '" name="' + name + '" value="' + oi + '"><span>' + inline(o.text) + '</span></label></li>';
      });
      html += '</ul><div class="feedback-slot"></div></fieldset>';
    });
    html += '<div class="btn-row"><button type="submit" class="btn">Submit answers</button><a class="btn secondary" href="#/section/' + esc(id) + '">Back to section</a></div>';
    html += '<p class="small muted" id="quiz-warning" hidden>Please answer every question before submitting.</p>';
    html += '</form></article>';
    app.innerHTML = html;
    window.scrollTo(0, 0);
    document.getElementById('quiz-form').addEventListener('submit', onSubmitQuiz);
  }

  function onSubmitQuiz(ev) {
    ev.preventDefault();
    var q = state.quiz;
    var form = ev.target;
    var unanswered = false;
    var correctCount = 0;

    q.questions.forEach(function (qq, qi) {
      var chosen = Array.prototype.slice.call(form.querySelectorAll('input[name="q' + qi + '"]:checked')).map(function (i) { return parseInt(i.value, 10); });
      if (!chosen.length) unanswered = true;
      q.answers[qi] = chosen;
    });
    if (unanswered) {
      document.getElementById('quiz-warning').hidden = false;
      return;
    }

    q.questions.forEach(function (qq, qi) {
      var chosen = q.answers[qi];
      var correctIdx = qq.options.map(function (o, i) { return o.correct ? i : -1; }).filter(function (i) { return i >= 0; });
      var isRight = chosen.length === correctIdx.length && chosen.every(function (c) { return correctIdx.indexOf(c) >= 0; });
      if (isRight) correctCount++;
      var fs = form.querySelector('.question[data-q="' + qi + '"]');
      fs.querySelectorAll('input').forEach(function (i) { i.disabled = true; });
      fs.querySelectorAll('.option').forEach(function (li) {
        var oi = parseInt(li.getAttribute('data-o'), 10);
        var picked = chosen.indexOf(oi) >= 0;
        var correct = qq.options[oi].correct;
        if (picked && correct) li.classList.add('correct');
        else if (picked && !correct) li.classList.add('incorrect');
        else if (!picked && correct) li.classList.add('missed');
      });
      var fb = fs.querySelector('.feedback-slot');
      fb.innerHTML = '<div class="feedback ' + (isRight ? 'ok' : 'bad') + '"><strong>' + (isRight ? 'Correct.' : 'Not quite.') + '</strong>' +
        (qq.explanation ? '<div class="explain">' + inline(qq.explanation) + '</div>' : '') + '</div>';
    });

    var score = Math.round((correctCount / q.questions.length) * 100);
    var passed = score >= passMark();
    q.submitted = true;
    var id = q.sectionId;
    state.progress.attempts[id] = (state.progress.attempts[id] || 0) + 1;
    if (!state.progress.started) state.progress.started = new Date().toISOString();
    if (passed) {
      var prevBest = state.progress.completed[id] ? state.progress.completed[id].score : -1;
      state.progress.completed[id] = { score: Math.max(score, prevBest), date: state.progress.completed[id] ? state.progress.completed[id].date : new Date().toISOString() };
    }
    saveProgress();

    var next = nextSectionId(id);
    var result = '<div class="card result ' + (passed ? 'pass' : 'fail') + '" id="quiz-result">';
    result += '<div class="score">' + score + '%</div>';
    result += '<p>' + correctCount + ' of ' + q.questions.length + ' correct. Pass mark ' + passMark() + '%.</p>';
    if (passed) {
      result += '<p><strong>Section complete.</strong> Review the feedback below, then carry on.</p><div class="btn-row" style="justify-content:center">';
      if (next && isUnlocked(next)) result += '<a class="btn" href="#/section/' + esc(next) + '">Next section &rarr;</a>';
      else if (allComplete()) result += '<a class="btn" href="#/certificate">Get your certificate &rarr;</a>';
      else result += '<a class="btn" href="#/">Back to course home</a>';
      result += '<a class="btn secondary" href="#/">Course home</a></div>';
    } else {
      result += '<p>Read the feedback below, revisit the section, and try again.</p><div class="btn-row" style="justify-content:center">';
      result += '<a class="btn" href="#/section/' + esc(id) + '">Re-read the section</a>';
      result += '<button type="button" class="btn secondary" id="retry-quiz">Retry quiz now</button></div>';
    }
    result += '</div>';
    app.insertAdjacentHTML('afterbegin', result);
    var submit = form.querySelector('button[type="submit"]');
    if (submit) submit.remove();
    document.getElementById('quiz-warning').hidden = true;
    var retry = document.getElementById('retry-quiz');
    if (retry) retry.addEventListener('click', function () { startQuiz(id); renderQuiz(id); });
    window.scrollTo(0, 0);
  }

  /* ---------------- Certificate ---------------- */
  function renderCertificate() {
    var c = state.course;
    var cpd = c.cpd || {};
    var html = '';
    if (!allComplete()) {
      var done = state.order.filter(isComplete).length;
      html += '<div class="card"><h1>Certificate of completion</h1>';
      html += '<p>Your certificate becomes available once every section quiz has been passed. You have completed ' + done + ' of ' + state.order.length + ' sections.</p>';
      html += '<a class="btn" href="#/">Back to course home</a></div>';
      app.innerHTML = html;
      return;
    }
    var name = state.progress.learner || '';
    var dates = state.order.map(function (id) { return state.progress.completed[id].date; }).sort();
    var completedOn = dates[dates.length - 1];
    var code = hashCode((name || 'anon') + '|' + dates.join('|'));
    var hours = cpd.hours || Math.round(totalMinutes() / 60 * 10) / 10;

    html += '<div class="card no-print cert-form"><h1>Certificate of completion</h1>';
    html += '<p>Enter your name as you would like it to appear, then print or save the certificate as a PDF for your CPD portfolio.</p>';
    html += '<label for="learner-name">Your full name</label><input id="learner-name" type="text" value="' + esc(name) + '" placeholder="e.g. Dr A. Example" autocomplete="name">';
    html += '<div class="btn-row"><button type="button" class="btn" id="save-name">Update certificate</button><button type="button" class="btn secondary" id="print-cert">Print / save as PDF</button></div></div>';

    html += '<div class="certificate" id="certificate">';
    html += '<div class="cert-title">' + esc(cpd.certificate_heading || 'Certificate of completion') + '</div>';
    html += '<p class="muted" style="margin-top:1.5rem">This is to certify that</p>';
    html += '<div class="cert-name">' + (name ? esc(name) : '<span class="muted">[your name]</span>') + '</div>';
    html += '<p class="muted">has completed the course</p>';
    html += '<div class="cert-course">' + inline(c.title) + '</div>';
    if (c.subtitle) html += '<p class="muted">' + inline(c.subtitle) + '</p>';
    html += '<div class="cert-meta">';
    html += '<div><span>Completed on</span>' + esc(fmtDate(completedOn)) + '</div>';
    html += '<div><span>CPD time</span>' + esc(hours) + ' hours</div>';
    html += '<div><span>Sections passed</span>' + state.order.length + ' of ' + state.order.length + '</div>';
    html += '<div><span>Average quiz score</span>' + Math.round(state.order.reduce(function (s, id) { return s + state.progress.completed[id].score; }, 0) / state.order.length) + '%</div>';
    html += '</div>';
    if (cpd.statement) html += '<p class="small" style="margin-top:1.5rem">' + inline(cpd.statement) + '</p>';
    html += '<ol class="cert-sections">' + state.order.map(function (id) {
      return '<li>' + inline(state.sections[id].title) + ' <span class="muted">(' + state.progress.completed[id].score + '%)</span></li>';
    }).join('') + '</ol>';
    html += '<div class="cert-code">Completion reference: ' + code + '</div>';
    html += '</div>';
    app.innerHTML = html;

    document.getElementById('save-name').addEventListener('click', function () {
      state.progress.learner = document.getElementById('learner-name').value.trim();
      saveProgress();
      renderCertificate();
    });
    document.getElementById('print-cert').addEventListener('click', function () {
      state.progress.learner = document.getElementById('learner-name').value.trim();
      saveProgress();
      renderCertificate();
      setTimeout(function () { window.print(); }, 50);
    });
  }

  function togglePreview() {
    state.preview = !state.preview;
    try {
      if (state.preview) localStorage.setItem(PREVIEW_KEY, '1'); else localStorage.removeItem(PREVIEW_KEY);
    } catch (e) { /* ignore */ }
    updatePreviewBanner();
    location.hash = '#/';
    render();
  }
  function updatePreviewBanner() {
    var el = document.getElementById('preview-banner');
    if (!el) return;
    el.hidden = !state.preview;
  }

  function renderNotFound() {
    app.innerHTML = '<div class="card"><h1>Page not found</h1><a class="btn" href="#/">Back to course home</a></div>';
  }

  /* ---------------- Router ---------------- */
  function render() {
    if (!state.course) return;
    var hash = location.hash.replace(/^#\/?/, '');
    var parts = hash.split('/').filter(Boolean);
    if (!parts.length) return renderHome();
    if (parts[0] === 'section' && parts[1]) {
      if (parts[2] === 'quiz') return renderQuiz(decodeURIComponent(parts[1]));
      return renderSection(decodeURIComponent(parts[1]));
    }
    if (parts[0] === 'certificate') return renderCertificate();
    if (parts[0] === 'unlock') return togglePreview();
    renderNotFound();
  }

  window.addEventListener('hashchange', render);
  document.getElementById('reset-progress').addEventListener('click', resetProgress);
  var previewOff = document.getElementById('preview-off');
  if (previewOff) previewOff.addEventListener('click', togglePreview);
  updatePreviewBanner();

  loadCourse().then(function () {
    document.title = state.course.title;
    document.getElementById('brand').textContent = state.course.short_title || state.course.title;
    if (state.course.footer) document.getElementById('footer-text').innerHTML = inline(state.course.footer);
    render();
  }).catch(function (err) {
    app.innerHTML = '<div class="error-box"><strong>Could not load the course.</strong><br>' + esc(err.message) +
      '<br><br>If you opened this file directly from disk, serve the folder over HTTP instead (for example <code>python3 -m http.server</code>) or deploy it to GitHub Pages. Browsers block YAML loading from <code>file://</code> URLs.</div>';
  });
})();
