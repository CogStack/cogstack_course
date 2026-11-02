# CogStack for Clinical Leaders: What Clinical AI Can Really Do With Your Hospital's Records

## Course overview

This course is written for people who run hospitals and clinical services: medical directors, chief nurses, divisional leads, senior consultants, ward and department managers, chief operating officers, information governance leads and board members. It assumes no technical background. It assumes you are busy, sceptical of hype, and responsible for decisions about whether a technology is safe, worth the money and good for patients.

CogStack is an open-source platform, built inside the NHS, that reads the free text in a hospital's electronic records (clinic letters, discharge summaries, nursing notes, radiology reports) and turns it into information a computer can count, search, monitor and learn from. It was first deployed at King's College Hospital and South London and Maudsley, then at University College London Hospitals and a growing number of other trusts. It sits underneath a wide range of published clinical work, from stroke audit to COVID-19 early warning to predicting a patient's future diagnoses.

The course has two halves, matching the two things a leader needs to understand:

- **Part A and Part B: the building blocks.** What the technology can actually do, shown as a set of distinct capabilities (find, extract, watch, summarise, protect), each illustrated with real deployments and the evidence behind them.
- **Part C: assembling the blocks into point solutions.** How those capabilities are combined into a tool that helps a specific clinical team with a specific problem, what it takes to validate and govern it, and how to tell a good proposal from a poor one.

Every section ends with a short quiz. The quizzes are not a formality. Each one checks that the learner has absorbed the specific claims and the specific limits taught in that section, because the purpose of the course is to leave you able to separate what this technology does from what it is often said to do.

### Running theme: real capabilities, not marketing

Throughout the course, each capability is presented with three things side by side:

1. **What it does**, in plain language.
2. **Where it has been used**, with the published evidence and the honest numbers.
3. **What it cannot do, or cannot yet do safely**, and what that means for your decision.

### Time and format

Twelve sections of roughly 15 to 25 minutes each, around five hours in total. Sections can be taken in any order after Part A, but Part A should be done first and Part C last. Content is text with illustrative case studies, followed by a quiz of five to eight questions. A pass is required on each quiz before the next section unlocks.

---

## What the learner will have by the end

By the end of the course a learner will be able to:

1. **Explain, in one minute, what CogStack is**: a platform that connects to the hospital's existing record systems, indexes every document, extracts clinical concepts from free text, and makes the result available for search, dashboards, alerts and research. And explain what it is not: it is not an electronic patient record, not a chatbot, and not a product that works out of the box.
2. **Describe why free text matters.** Most of what clinicians know about a patient is written in prose, not entered into coded fields. Any strategy for data, audit, research or AI that ignores the text is working from a minority of the record.
3. **Name the five building blocks** (find, extract, watch, summarise, protect), give an example deployment of each, and say which are mature and which are still research.
4. **Read an accuracy claim critically.** Understand precision, recall and F1 in everyday terms, know why a model trained in one hospital must be checked in yours, and know what a "gold standard" is and who produces it.
5. **Recognise the anatomy of a clinical NLP point solution**: a clinical question, a defined population, a data flow, an extraction model, a validation step, a route into the clinical workflow, and a way of measuring whether anything improved.
6. **Ask the right questions of a proposal or a vendor**: about information governance, about who annotates and maintains the model, about clinical safety case requirements, about total cost, about what happens when the model is wrong.
7. **Sketch a point solution for their own service**, on one page, using the template from the capstone section, and judge whether it is a realistic first project.

---

## Course structure

### Part A: Foundations

#### Section 1. Where the information in your hospital actually lives

The problem the whole field exists to solve. Structured, coded data (diagnoses, drugs, observations) is the part of the record that systems can count. Free text is where clinicians record reasoning, uncertainty, symptoms, social context, family history, plans and intentions. Studies of real hospital records consistently find that most clinically meaningful detail is only in the text. Manual coding and audit are slow, expensive, inconsistent and often incomplete. The section introduces the "right data, right place, right time" principle that motivated the original CogStack work at King's, and the cost of not having it: audits done by hand, research cohorts built by reading notes, patients lost to follow-up because an intention was written but never actioned.

Key message: your data strategy is incomplete if it treats the text as unreachable.

Quiz checks: why coded data under-represents the record, examples of information that lives only in text, the business and safety costs of manual extraction.

#### Section 2. What CogStack is, and what it is not

A plain-language tour of the platform. It connects to existing systems (the EPR, document stores, legacy databases, PDFs, scanned letters) and copies documents into a searchable index. A natural language processing (NLP) component called MedCAT reads each document and tags the clinical concepts in it, linking them to SNOMED CT, the standard clinical vocabulary used across the NHS. Dashboards, alerts, search and research tools then sit on top. The section covers where it has been deployed (King's College Hospital processed over 300 million lines of clinical data in its first years; a hospital-wide run later produced 157 million SNOMED concepts from 9.5 million documents for just over one million patients across nine years; UCLH, SLaM and others followed), who built it, and what "open source" means in practice: free to use, not free to run.

Equally important is what it is not. It is not an electronic patient record and does not replace one. It is not a large language model chatbot, although it can feed one. It is not a medical device in itself, although tools built on it may become devices. It is not a finished product; it is infrastructure that a hospital team configures and maintains.

Quiz checks: the components and their roles, where it sits relative to the EPR, correct and incorrect descriptions of what it does, what "open source" does and does not imply for cost.

#### Section 3. How a computer reads a clinical note

The one genuinely technical section, kept concrete. The learner follows a single discharge summary through the pipeline. The computer finds mentions of concepts ("chest pain", "metformin", "mother had breast cancer"), decides which SNOMED concept each one means (is "cold" a temperature, a symptom or an infection?), and then works out the context: is the concept present or negated ("no chest pain"), does it belong to the patient or a relative, is it current or historical, confirmed or suspected. The section explains why this is hard, why dictionary matching fails, and how MedCAT learns from clinicians correcting its output in a tool called MedCATtrainer. It also introduces the vocabulary of accuracy in plain words: precision (when it says something is there, how often is it right?), recall (of everything that is really there, how much does it find?), and F1 (a single number combining the two). It closes with an honest look at how far the technology has come: a 2021 systematic review and a 2021 study of reporting quality in clinical NLP both found that many published tools were poorly described and rarely tested outside the hospital that built them. That is why local validation is a recurring theme in Part C.

Quiz checks: the three steps (find, link, contextualise), why negation and family history matter, what precision and recall mean, why a model must be checked locally.

---

### Part B: The building blocks

Each section in Part B is one capability. Each follows the same pattern: what it does, where it has been used, the evidence, the limits.

#### Section 4. Find: searching the whole record and building cohorts

The simplest and most mature capability. Once every document is indexed, a clinician or analyst can search the entire hospital's text the way they would search the web, with the extracted concepts making the search clinically precise (find patients with a mention of a condition, not just a word). This is the foundation for research cohort building, rare disease identification, service planning and answering "how many patients do we have with X?" in minutes rather than months. Case studies include rare disease identification from clinical notes, the characterisation of patients with normal pressure hydrocephalus, the characterisation of an aortic disease population, and the COVID-19 inpatient studies at King's in 2020 that answered urgent clinical questions (for example whether ACE inhibitors worsened outcomes in 1,200 consecutive inpatients) within weeks because the text was already structured.

Limits: search finds what was written. It does not find what was never documented, and it inherits every inconsistency in how clinicians write.

Quiz checks: the difference between keyword and concept search, examples of questions this answers, what it cannot tell you.

#### Section 5. Extract: structuring the record for coding, audit and registries

Turning text into structured fields at scale. The flagship example is the Sentinel Stroke National Audit Programme (SSNAP) study across three NHS hospitals, which compared the comorbidities recorded by routine manual curation against MedCAT extraction from the notes and found the manual process missed a substantial share of what the text contained. Other examples: checking the accuracy of ICD-10 coding against the clinical narrative, measuring the real burden of hyperkalaemia in a hospital, extracting otology symptoms from clinic letters, identifying surgical procedures in spinal clinic letters and linking them automatically to patient education material (199 letters, 582 procedures identified), and the MiADE work at UCLH that puts concept extraction in front of the clinician inside the EPR so that coding happens as the note is written rather than months later.

Limits: extraction is only as good as the model's training and the local validation. Rare conditions, unusual phrasing and copied-and-pasted text (a 2021 study measured how much clinical text is redundant) all degrade results.

Quiz checks: what the SSNAP comparison showed, what "structured at the point of writing" means, which kinds of content extraction handles poorly.

#### Section 6. Watch: real-time monitoring, alerts and decision support

Reading documents as they are written, not months later. Three deployments anchor the section. First, the real-time viral pneumonia signal built from clinicians' own notes during COVID-19, which gave hospital capacity planners up to four days' warning and was deliberately independent of social media or search engine data. Second, the detection of "clinical intent": a clinician writes that a scan should be ordered or a follow-up booked, the order is never placed, and the patient is lost to follow-up. A model trained on real hospital notes detected these intentions with around 90 percent precision and recall and was piloted as an alerting dashboard. Third, decision support in mental health: a guideline-based alert for dysglycaemia monitoring in inpatients with severe mental illness, and an earlier psychosis risk calculator embedded in the SLaM record whose evaluation focused not on the model's accuracy but on whether clinicians actually responded to the alerts.

Limits: alerts are only valuable if someone acts on them, alert fatigue is real, and anything that influences individual clinical decisions enters medical device and clinical safety territory.

Quiz checks: what makes real-time use different from retrospective use, the lost-to-follow-up mechanism, why clinician response matters more than model accuracy in deployment.

#### Section 7. Summarise and predict: generative models and forecasting

The most talked-about and least mature capability, treated honestly. The section covers three strands. Generating a hospital course summary for a discharge letter from the notes. Foresight, a generative transformer trained on structured concepts extracted from patient records, which forecasts a patient's likely future diagnoses, procedures and findings and was evaluated by clinicians across hospitals in a Lancet Digital Health study. And current work on grounding large language models in the patient's own record so that answers come with evidence from the notes, including a 2025 shared task entry on answering patient questions from the record. The section explains what a transformer is in two paragraphs, why these models can be fluent and wrong at the same time, and why every one of these examples is still research or early evaluation rather than routine service.

Limits: hallucination, lack of explainability, the difficulty of evaluating a generated summary, and regulatory status. The learner should leave able to say why a leader can be excited about this strand and still decline to deploy it this year.

Quiz checks: the difference between extraction and generation, what Foresight predicts and how it was evaluated, why fluency is not accuracy, the research versus service distinction.

#### Section 8. Protect: de-identification, trusted research environments and the limits of anonymity

Nothing in Parts B or C is possible without information governance. This section covers how free text is de-identified. AnonCAT, a model trained on annotated documents from three UK hospitals using different record systems, removed directly identifying information with recall of 0.96 to 0.99 across those sites, and the section is honest about why 99 percent is both very good and not perfect. It covers trusted research environments: the hospital's data stays inside the hospital, researchers come to the data, outputs are checked. And it covers recent work showing that even de-identified text carries re-identification risk through the clinical details themselves, which is why de-identification is a control within a governance framework rather than a substitute for one. Caldicott principles, the national data opt-out, data protection impact assessments and the distinction between direct care, service evaluation and research are explained for someone who has to sign the forms rather than write them.

Quiz checks: what de-identification removes and what it leaves, why de-identified is not the same as anonymous, what a trusted research environment is, which uses need which approvals.

---

### Part C: Building point solutions

#### Section 9. The anatomy of a clinical NLP point solution

The bridge between capabilities and tools. A point solution is a narrow tool that helps a specific team with a specific problem. Every successful one in the literature has the same seven parts: a clinical question stated so that a non-technical person can tell whether it was answered; a defined population; a data flow (which documents, from where, how often); an extraction or classification model; a validation against a human gold standard in the local hospital; a route into the workflow (a dashboard, an alert, a worklist, a field in the EPR); and an outcome measure that is about patients or staff, not about the model. The section dissects three published deployments against this template: the lost-to-follow-up alerting pilot, the dysglycaemia decision support system in mental health inpatients, and the VIEWER audit-and-feedback platform for psychosis care, which was co-designed with clinical teams and evaluated for feasibility across three use cases.

Quiz checks: the seven parts, which part each case study got right or struggled with, what distinguishes an outcome measure from a model metric.

#### Section 10. Validation, safety and knowing when a number is good enough

How to be the person in the room who asks the hard question. The section teaches how to read a validation: how big was the test set, who created the gold standard, was it from your hospital, were rare cases included, what happens to the error rate on the cases that matter most. It explains why a model's performance drifts as documentation habits change, and why a tool deployed in 2022 needs re-checking in 2025. It introduces the regulatory landscape in plain terms: when software becomes a medical device under UK regulation, what the NHS clinical safety standards for health IT (DCB0129 and DCB0160) require, and why a research study and a live service are governed differently. It uses the reporting quality findings from Section 3 to give the learner a checklist for reading any paper or vendor claim.

Quiz checks: questions to ask about a validation, drift and re-validation, the medical device boundary, the difference between research and deployment governance.

#### Section 11. People, money and governance: what it really takes to run this

The operational truth. The software is free; the capability is not. The section describes the team a hospital actually needs (a clinical informatics lead, data engineering, clinicians who annotate and review, information governance, clinical safety officer), the infrastructure (servers inside the hospital network, integration with the EPR, a trusted research environment), the timelines seen in real deployments (months to a first search index, longer to a validated extraction model, longer still to a safe alerting tool), and the ways hospitals have funded it, including the early cost-saving use cases at King's and the research income that a well-governed text corpus attracts. It also covers the choice between building in-house, working with the CogStack community and academic partners, and buying a commercial service, and gives a set of procurement questions for each.

Quiz checks: the roles required, realistic timelines, where costs sit, questions to ask a vendor or partner.

#### Section 12. Capstone: design a point solution for your own service

The learner applies everything. Using a one-page template built from the seven-part anatomy in Section 9, they choose a real problem from their own service (a missed-follow-up risk, an audit that currently takes weeks, a cohort they cannot count, an alert their team wishes existed) and write a proposal: question, population, documents, capability required, how it would be validated locally, how it enters the workflow, what outcome would be measured, what governance route applies, what team and time it needs, and what the honest limits are. Worked examples are provided at three levels of ambition, from a search-only project that could start in weeks to an alerting tool that would need a clinical safety case. The final quiz tests the whole course, with an emphasis on distinguishing realistic from unrealistic proposals.

Quiz checks: ability to classify a proposed project by capability, maturity and governance route; identification of missing parts in a flawed proposal; the course-wide learning outcomes.

---

## Summary of sections

| # | Section | Part | Core question answered |
|---|---|---|---|
| 1 | Where the information in your hospital actually lives | A | Why does free text matter? |
| 2 | What CogStack is, and what it is not | A | What am I actually being offered? |
| 3 | How a computer reads a clinical note | A | How does it work, and how is accuracy measured? |
| 4 | Find: search and cohorts | B | Can we find the patients we need to find? |
| 5 | Extract: coding, audit and registries | B | Can we stop doing this by hand? |
| 6 | Watch: real-time alerts and decision support | B | Can it warn us in time to act? |
| 7 | Summarise and predict: generative models | B | What is real and what is still research? |
| 8 | Protect: de-identification and governance | B | How do we do this lawfully and safely? |
| 9 | The anatomy of a point solution | C | What does a good tool consist of? |
| 10 | Validation, safety and good enough | C | How do I know whether to trust it? |
| 11 | People, money and governance | C | What does it really take to run? |
| 12 | Capstone: design your own | C | What should my service do first? |

## Notes for building the learning management system

Each section above maps to one YAML file containing the section text, its case studies, and its quiz. The quiz items will be written directly against the "Quiz checks" lines in each section so that passing the quiz demonstrates the stated learning. Sections 1 to 3 are prerequisites for everything else; sections 4 to 8 can be unlocked in any order once Part A is complete; sections 9 to 12 unlock in sequence after Part B. The capstone template in Section 12 will be a downloadable worksheet rather than a quiz item.

All case studies and figures in this overview come from the published CogStack literature (85 entries on the CogStack publications list, resolved to 78 unique works), and each section's YAML will cite the specific papers it draws on so that learners who want the evidence can go to it.
