# Clinical Text AI for Healthcare Leaders

A self-contained, static CPD course for clinical and operational leaders on what natural language processing can
really do with hospital records. Twelve sections, each with a quiz, and a printable certificate on completion.

The application is plain HTML, CSS and JavaScript. **All course content lives in YAML** under `content/`. Nothing is
sent to a server; learner progress is stored in the browser's local storage.

## Run locally

Browsers block loading YAML from `file://` URLs, so serve the folder over HTTP:

```bash
python3 -m http.server 8000
# then open http://localhost:8000/
```

## Deploy to GitHub Pages

1. Push this repository to GitHub.
2. In the repository, open **Settings → Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**, select the `main` branch and the `/ (root)`
   folder, then save.
4. The site will be published at `https://<user>.github.io/<repository>/` within a minute or two.

No build step is required. The `.nojekyll` file tells GitHub Pages to serve the files exactly as they are.

## Editing the course

| File | Purpose |
|---|---|
| `content/course.yaml` | Title, description, learning outcomes, CPD settings (hours, pass mark), parts and the ordered list of sections |
| `content/sections/*.yaml` | One file per section: objectives, content blocks and the quiz |
| `index.html`, `css/styles.css`, `js/app.js` | The player. You should not need to touch these to change content |
| `js/vendor/js-yaml.min.js` | YAML parser (MIT licence) |

### Section file format

```yaml
id: 04-find                     # must match the id in course.yaml
part: b                         # part id from course.yaml
title: "Find: searching the whole record"
core_question: "Can we find the patients we need to find?"
duration_minutes: 20
objectives:
  - First learning objective
content:
  - type: paragraph             # paragraphs separated by blank lines; **bold**, *italic*, `code` supported
    text: |
      Body text...
  - type: heading               # or subheading
    text: "A heading"
  - type: list                  # style: bullet (default) or number
    items:
      - Plain item
      - term: "Bold lead-in."
        text: "followed by text."
  - type: callout               # kind: key-message | limits | evidence | warning
    kind: key-message
    title: "Optional title"
    text: "Callout text"
  - type: case_study
    title: "Case title"
    text: "Narrative"
    details:
      Capability: "Find"
      Scale: "1,200 patients"
  - type: table
    headers: ["Col A", "Col B"]
    rows:
      - ["a1", "b1"]
quiz:
  intro: "Optional text shown above the questions"
  questions:
    - question: "Question text?"
      type: single              # single (one correct) or multiple (select all that apply)
      options:
        - text: "Correct answer"
          correct: true
        - text: "Distractor"
      explanation: "Shown after submission."
```

Answer options are shuffled on each attempt. Add `shuffle: false` to a question to keep its order fixed.

### Unlock rules

Parts unlock in order. Within a part, `unlock: sequential` requires each section to be passed before the next
opens; `unlock: any` lets learners take the sections in any order. The pass mark is set in `course.yaml` under
`cpd.pass_mark`.

## Reviewer access

To open every section without completing the course, visit `#/unlock` (for example
`https://<user>.github.io/<repository>/#/unlock`). This toggles a preview mode, shown by a banner at the top of the
page, and the same address turns it off again. Preview mode never marks a section complete and the certificate still
requires every quiz to be passed. The switch is not linked from the interface.

## Licence

Course text: © the authors. Player code: MIT. js-yaml: MIT.
