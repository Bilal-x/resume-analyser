# AI Resume Analyzer — Full-Stack Application Development Prompt

## 1. Project Overview

Build a production-ready, AI-powered web application called **AI Resume Analyzer** designed for two primary user groups:

1. **HR / Recruiters:** Evaluate candidates against a Job Description (JD), identify relevant skills and experience, understand project relevance, and make evidence-based shortlisting decisions.
2. **Job Candidates:** Analyze their own resumes against a target JD, understand their strengths and skill gaps, and receive specific recommendations to improve their resume and job alignment.

The core objective is to go beyond simple keyword matching. The application must deeply analyze the resume, identify skills demonstrated indirectly through projects and experience, map those skills to the JD, and generate a transparent, explainable match score out of 10.

**Important principle:** A skill should not be considered absent simply because it is missing from the resume's Skills section. The system must examine the entire resume, including project descriptions, internships, work experience, certifications, achievements, and technical implementations.

Build a functional application, not just a UI prototype. All major workflows, file uploads, analysis, persistence, dashboards, and reports must work end to end.

---

## 2. User Roles and Workflows

### A. HR / Recruiter Dashboard

Recruiters should be able to:

- Create and manage job descriptions.
- Paste a JD or upload a JD document.
- Upload multiple candidate resumes.
- Analyze each candidate against a specific JD.
- View an overall match score out of 10.
- Compare candidates side by side.
- View direct and indirect skill matches separately.
- Identify missing, weak, and transferable skills.
- Inspect evidence from specific resume sections.
- Review project-level technical analysis.
- Generate candidate-specific evaluation reports.
- Filter, sort, and shortlist candidates.
- Export reports in PDF or CSV format.
- Maintain a history of analyses associated with each JD.

The system should assist recruiters with evidence-based screening, not automatically reject candidates based on a score.

### B. Candidate Dashboard

Candidates should be able to:

- Upload a resume in PDF or DOCX format.
- Paste or upload a target JD.
- Analyze their resume against the JD.
- View their match score out of 10.
- Discover skills that match the JD, including skills demonstrated through projects.
- Understand which requirements are supported by strong evidence and which lack evidence.
- Review project relevance and technical depth.
- Identify missing keywords and genuine skill gaps.
- Receive specific resume improvement suggestions.
- View rewritten bullet-point suggestions based only on their actual experience.
- Download their analysis report.
- Compare analyses against multiple JDs.

Candidate analyses must remain private and must not become visible to recruiters unless the candidate explicitly shares them.

---

## 3. Core Intelligence: Deep Resume and JD Analysis

Implement a multi-stage analysis pipeline rather than asking an LLM to compare two documents in a single generic prompt.

### Stage 1: Resume Parsing

Extract and normalize the complete contents of each resume.

Support:

- PDF files.
- DOCX files.
- Text-based resumes.
- Scanned PDFs using OCR when necessary.

Identify and structure:

- Personal and contact information.
- Professional summary.
- Technical skills.
- Programming languages.
- Frameworks and libraries.
- Databases.
- Cloud platforms.
- DevOps and infrastructure tools.
- Work experience and internships.
- Academic and personal projects.
- Education.
- Certifications.
- Achievements.
- Publications and other relevant sections.

Preserve the source section, page number when available, and supporting text for every extracted claim.

Do not discard information just because it does not appear under a conventional resume heading.

### Stage 2: Job Description Analysis

Parse the JD into structured requirements.

For every requirement, extract:

- Skill or competency.
- Requirement category.
- Importance.
- Whether it is mandatory or preferred.
- Minimum experience, if specified.
- Expected proficiency, if specified.
- Relevant synonyms and related technologies.
- Related frameworks, libraries, tools, and concepts.
- Evidence that would demonstrate the requirement.

Classify requirements into:

1. Mandatory technical skills.
2. Preferred technical skills.
3. Programming languages.
4. Frameworks and libraries.
5. Tools and platforms.
6. Relevant work experience.
7. Project experience.
8. Domain knowledge.
9. Soft skills and communication.
10. Education and certifications, where relevant.

Avoid treating every JD keyword as equally important. Give higher weight to explicit mandatory requirements and the core responsibilities of the role.

### Stage 3: Direct Skill Matching

Compare each JD requirement against explicit resume evidence.

Example:

JD requirement: Python programming.

Resume Skills section: Python, JavaScript, SQL.

Result:

- Python: Direct match.
- JavaScript: Not necessarily relevant to Python; evaluate separately against the JD.
- SQL: Match only if the JD requires SQL or a relevant database skill.

A direct match requires explicit evidence, such as a skill listing, work experience, project description, or certification.

The presence of a skill in the Skills section should not automatically imply professional-level proficiency.

Classify direct evidence as:

- Strong: Supported by substantial work or detailed implementation.
- Moderate: Supported by a relevant project or internship.
- Limited: Mentioned briefly with little supporting detail.
- Unverified: Listed without supporting evidence.

### Stage 4: Indirect Skill Discovery — Critical Feature

This is one of the most important features of the application.

The system must inspect the entire resume to identify skills that are not explicitly listed in the Skills section but may be demonstrated through projects, work experience, internships, or technical descriptions.

For example:

**Job Description**

Required skill: Python.

**Resume Skills Section**

JavaScript, React, Node.js, MongoDB.

**Resume Project**

"Developed a network intrusion detection system using Python, pandas, scikit-learn, and Random Forest to classify network traffic."

**Expected Analysis**

- Python: Indirect or project-derived evidence, because it appears in the project rather than the Skills section.
- pandas: Direct textual evidence within the project.
- scikit-learn: Direct textual evidence within the project.
- Machine learning: Supported by the described model and classification task.
- Network security: Supported by the intrusion detection domain.
- Professional Python experience: Not established unless the resume provides relevant employment evidence.

Important distinction: A technology explicitly mentioned in a project is a direct textual mention, but it is an indirect match relative to the Skills section. The application must preserve this distinction.

#### Indirect matching rules

The system must:

1. Scan every resume section, not only the Skills section.
2. Detect technologies, frameworks, libraries, tools, and technical concepts.
3. Map related technologies to JD requirements using a verified technology relationship map and semantic reasoning.
4. Identify when project activities demonstrate a relevant capability.
5. Explain why each inferred relationship is relevant.
6. Assign a confidence level to each inference.
7. Quote or reference the supporting resume text.
8. Clearly distinguish explicit evidence from inferred capability.
9. Avoid claiming a candidate used a technology that is not supported by the resume.
10. Avoid assuming that familiarity with one framework proves proficiency in another.

Examples of valid relationships:

- FastAPI or Django project implementation → evidence of Python ecosystem experience when the resume explicitly identifies the framework or language used.
- React application development → evidence of JavaScript ecosystem experience when supported by the project details.
- Docker deployment and CI/CD pipelines → evidence relevant to containerization and deployment automation.
- AWS Lambda and event-driven processing → evidence relevant to serverless computing.
- scikit-learn models and data preprocessing → evidence relevant to applied machine learning.

Examples of invalid or weak inferences:

- HTML and CSS alone do not establish JavaScript proficiency.
- Using React does not automatically establish Python proficiency.
- Using MongoDB does not establish SQL proficiency.
- Deploying a website does not automatically establish Kubernetes expertise.
- Mentioning an AI project does not establish experience training large language models.

If a relationship is plausible but unconfirmed, label it as a potential transferable skill rather than a confirmed match.

### Stage 5: Project-Level Technical Analysis

Analyze each project individually.

Extract:

- Project name.
- Problem addressed.
- Purpose and domain.
- Technologies explicitly mentioned.
- Architecture and components.
- Candidate's stated contribution.
- Implementation details.
- Complexity indicators.
- Technical concepts demonstrated.
- Relevance to the target JD.
- Evidence gaps and uncertainties.

Evaluate projects using the following dimensions:

**Technical relevance:** How closely does the project align with the JD?

**Implementation depth:** Does the resume describe actual development, integration, testing, deployment, or only an idea?

**Technology evidence:** Which languages, frameworks, databases, and tools are explicitly identified?

**Problem-solving:** What technical challenge was addressed, and how?

**Production readiness:** Is there evidence of testing, security, deployment, monitoring, scalability, or automation?

**Ownership:** Does the resume clarify what the candidate personally implemented?

**Transferability:** Does the project demonstrate concepts that are useful for the target role, even if the exact JD technology is not mentioned?

For each project, produce:

- Project relevance score out of 10.
- Relevant JD requirements.
- Explicit technologies found.
- Indirectly demonstrated capabilities.
- Evidence of implementation depth.
- Supporting resume excerpts.
- Unverified claims or missing details.
- Suggestions for presenting the project more effectively.

Do not assign high technical depth merely because a project has an impressive title or a long technology list.

---

## 4. Explainable JD Match Score Out of 10

Every analysis must generate an overall match score from 0 to 10, supported by transparent reasoning.

Use a configurable weighted scoring model.

### Default scoring model

| Evaluation Dimension | Weight |
|---|---:|
| Mandatory technical skills | 30% |
| Core technical skills and related technologies | 20% |
| Project relevance and implementation depth | 20% |
| Relevant experience and demonstrated application | 15% |
| Role-specific responsibilities and domain knowledge | 10% |
| Other relevant qualifications | 5% |
| Total | 100% |

These weights are defaults and should be configurable per role.

For each dimension, calculate a normalized score between 0 and 1, apply its weight, and calculate:

`Overall Score = 10 × Σ (Dimension Score × Dimension Weight)`

The weights must sum to 1.0.

Use a consistent, documented scoring rubric for individual dimensions. Missing evidence should reduce confidence in the assessment, but the system must distinguish "not mentioned" from "candidate does not possess the skill."

Do not apply arbitrary score bonuses or penalties for keyword frequency, resume length, formatting, institution prestige, demographic information, or unrelated personal characteristics.

### Required score breakdown

Display:

- Overall match score out of 10.
- Mandatory skills score.
- Core technical skills score.
- Project relevance score.
- Experience and implementation score.
- Domain knowledge score.
- Other qualifications score.
- Evidence coverage.
- Analysis confidence.
- Key factors increasing the score.
- Key factors reducing the score.
- Requirements that remain unverified.

The score must be reproducible from the underlying evidence and scoring configuration. Store the component scores, weights, and calculation details.

### Score interpretation

Use these configurable default labels:

- 9.0–10.0: Very strong alignment.
- 7.5–8.9: Strong alignment.
- 6.0–7.4: Moderate alignment.
- 4.0–5.9: Partial alignment.
- 0.0–3.9: Limited demonstrated alignment.

These are indicators of resume-to-JD alignment, not predictions of job performance or hiring success.

Do not imply that the score represents a probability of getting hired.

---

## 5. Direct Findings vs. Indirect Findings

This distinction must be clearly visible throughout the report.

### Direct Findings

Requirements explicitly supported by resume text.

For each finding, display:

- JD requirement.
- Evidence classification.
- Resume section.
- Supporting excerpt.
- Relevance explanation.
- Strength of evidence.

Example:

**Requirement:** Python programming.

**Evidence:** "Developed a network intrusion detection system using Python and scikit-learn."

**Source:** Projects section.

**Classification:** Explicit project evidence.

**Strength:** Strong project-level evidence.

### Indirect Findings

Requirements that may be demonstrated through related technologies, project activities, or transferable technical concepts.

For each finding, display:

- JD requirement.
- Related technology or activity.
- Source project or experience.
- Supporting excerpt.
- Relationship explanation.
- Confidence level.
- What remains unverified.

Example:

**Requirement:** Cloud deployment automation.

**Evidence:** Resume describes Docker-based deployment and a CI/CD workflow.

**Classification:** Related capability / potential indirect match.

**Reasoning:** Containerization and CI/CD are relevant to deployment automation, but they do not independently establish proficiency in a specific cloud provider.

**Confidence:** Medium.

**Unverified:** Hands-on AWS deployment experience.

Never silently combine direct and indirect findings into one category.

---

## 6. Requirement-by-Requirement Evidence Matrix

Generate a comprehensive matrix for every JD requirement.

| JD Requirement | Importance | Direct Evidence | Project Evidence | Indirect Match | Confidence | Status |
|---|---|---|---|---|---|---|
| Python | Mandatory | Not in Skills section | Found in project | Not needed for existence | High | Supported |
| FastAPI | Preferred | Not explicitly listed | Not found | No reliable evidence | Low | Not evidenced |
| Machine Learning | Mandatory | Not in Skills section | scikit-learn and classification model | Supported by implementation | High | Supported |
| AWS | Mandatory | Not found | No AWS project evidence | Docker alone is insufficient | Low | Not evidenced |

This is an illustrative example only. Populate the actual matrix exclusively from the uploaded resume and supplied JD.

For every requirement, distinguish:

- Confirmed direct match.
- Confirmed project-derived match.
- Supported transferable skill.
- Partial evidence.
- Unverified.
- Not evidenced in the resume.

Do not equate "not evidenced" with "does not know the skill."

---

## 7. Resume Improvement Recommendations

Generate practical recommendations based on the actual evidence.

Include:

### A. Skills Section Improvements

Identify relevant skills already supported elsewhere in the resume but omitted from the Skills section.

Explain where the evidence was found and recommend adding the skill only when the candidate can accurately substantiate it.

### B. Project Description Improvements

Rewrite weak project bullets to emphasize:

- Technical contribution.
- Technologies used.
- Implementation details.
- Problems solved.
- Testing and deployment.
- Measurable results, if documented.

Never fabricate metrics, business impact, project ownership, or technical experience.

If important information is missing, ask the candidate to confirm it before including it.

### C. Keyword Alignment

Identify relevant JD terminology that is missing from the resume.

Separate keywords into:

- Supported by existing evidence.
- Potentially supported but requiring candidate confirmation.
- Genuine experience gaps.

Do not recommend inserting unsupported keywords just to improve ATS performance.

### D. Prioritized Action Plan

Provide:

1. Three highest-impact resume changes.
2. Skills to strengthen for the role.
3. Project details worth expanding.
4. Suggested interview preparation topics.
5. Optional projects or learning exercises to address genuine gaps.

---

## 8. HR Candidate Comparison

Allow recruiters to compare multiple candidates against the same JD.

Display:

- Overall match score.
- Mandatory requirements coverage.
- Direct skill matches.
- Project-derived skills.
- Relevant project depth.
- Relevant experience.
- Missing or unverified requirements.
- Evidence confidence.
- Interview questions based on each candidate's documented experience.

Allow sorting by overall score, mandatory skill coverage, and project relevance.

Use a consistent rubric across all candidates for the same JD. Do not compare scores calculated under incompatible scoring configurations without warning the recruiter.

Do not make an automatic reject decision solely from the score.

---

## 9. Evidence-Based Interview Questions

Generate role-specific interview questions based on:

- Required skills in the JD.
- Technologies explicitly mentioned in projects.
- Claims with limited evidence.
- Potential transferable skills.
- Important mandatory requirements that remain unverified.

For each question, include:

- Question.
- Reason for asking.
- Related JD requirement.
- Resume evidence that motivated the question.
- Optional evaluation criteria for HR.

Example:

Resume evidence: A candidate developed a machine learning intrusion detection project using scikit-learn.

Question: "Can you explain how you prepared your dataset, selected the model, and evaluated the intrusion detection system?"

Purpose: Validate implementation depth and the candidate's actual contribution.

Questions must validate relevant technical capabilities, not speculate about personality or personal background.

---

## 10. AI Output Requirements

Use structured, validated AI responses rather than unrestricted narrative-only output.

The analysis response should contain:

- Resume summary.
- JD summary.
- Overall score.
- Score breakdown.
- Requirement-by-requirement evidence.
- Direct findings.
- Indirect findings.
- Project analysis.
- Missing and unverified requirements.
- Improvement recommendations.
- Interview questions.
- Analysis limitations.

Use a strict schema such as Pydantic models or equivalent JSON Schema validation.

Validate that:

- Scores remain within the permitted range.
- Weights sum to 1.0.
- Every evidence-backed finding references a real resume excerpt.
- Source sections exist.
- Inferences are explicitly labeled.
- Required fields are present.
- The overall score matches the weighted calculation.

If the model produces invalid or unsupported evidence, retry validation where appropriate or mark the finding for review rather than inventing a result.

### Recommended AI architecture

Use a multi-step pipeline:

1. Document ingestion and text extraction.
2. Resume section parsing.
3. JD requirement extraction.
4. Skill and technology normalization.
5. Direct evidence matching.
6. Project-level analysis.
7. Indirect relationship analysis.
8. Evidence verification.
9. Weighted scoring.
10. Recommendations and report generation.

Keep the scoring engine separate from the LLM's narrative generation. The LLM may extract evidence and propose classifications, but deterministic application code should calculate the final weighted score.

Use configurable LLM providers so the application can support an appropriate hosted model or an alternative provider.

---

## 11. Recommended Technology Stack

Use the existing project structure if one already exists. Inspect the repository before changing files, and avoid replacing working features unnecessarily.

If starting from scratch, use:

### Frontend
- React.
- Vite.
- TypeScript.
- Tailwind CSS.
- A reusable component library such as shadcn/ui.
- Recharts for score visualizations.
- React Router for navigation.
- A robust form validation library.

### Backend
- Python.
- FastAPI.
- Pydantic.
- Uvicorn.
- PyMuPDF for PDF extraction.
- python-docx for DOCX extraction.
- OCR integration for scanned documents when required.
- A background task system for large batch analyses if necessary.

### Database and Authentication
- PostgreSQL.
- Supabase for managed PostgreSQL and authentication, if appropriate.
- Row-level security or equivalent access controls.
- Private storage for uploaded resumes.

### AI Integration
- A provider abstraction for LLM APIs.
- Structured outputs and schema validation.
- Embeddings or semantic similarity where useful.
- A configurable skill taxonomy and technology relationship map.

Use semantic similarity as a supporting signal, not the sole basis for determining skill proficiency.

### Reporting
- PDF report generation.
- CSV export for recruiter comparisons.
- Persistent analysis history.

If the current project already uses a different stack, retain it when technically reasonable instead of performing an unnecessary migration.

---

## 12. UI / UX Requirements

Build a modern, professional SaaS interface suitable for HR teams and individual candidates.

### Design direction

- Clean, minimal interface.
- Professional typography.
- Neutral background with restrained accent colors.
- Responsive desktop, tablet, and mobile layouts.
- Accessible color contrast.
- Clear loading and error states.
- Progress indicators for lengthy analyses.
- Skeleton loaders while results are generated.
- Helpful empty states and onboarding.
- Consistent spacing and reusable components.

### Main pages

1. Landing page.
2. Sign-up and login.
3. Role selection or role-based navigation.
4. Candidate dashboard.
5. HR dashboard.
6. Resume upload page.
7. JD editor and upload page.
8. Analysis results dashboard.
9. Project analysis detail view.
10. Direct vs. indirect findings view.
11. Candidate comparison page.
12. Analysis history.
13. Downloadable report view.
14. Settings and privacy controls.

### Analysis dashboard layout

At the top, show:

- Overall match score out of 10.
- Score interpretation.
- Evidence coverage.
- Confidence level.
- Main strengths.
- Main gaps.

Below that, create separate tabs for:

- Overview.
- Skill Match.
- Project Analysis.
- Direct Findings.
- Indirect Findings.
- Missing Requirements.
- Recommendations.
- Interview Questions.

Use evidence-linked findings: selecting a match should reveal the supporting resume excerpt and its source section.

Do not rely on color alone to distinguish findings. Include text labels and accessible indicators.

---

## 13. Database Design

Create a normalized schema with appropriate indexes and access controls.

Suggested entities:

### Users
- id
- name
- email
- role
- created_at

### Resumes
- id
- owner_id
- file_name
- file_type
- extracted_text
- structured_data
- created_at

### Job Descriptions
- id
- owner_id
- title
- company
- description
- structured_requirements
- created_at

### Resume Analyses
- id
- resume_id
- job_description_id
- owner_id
- overall_score
- scoring_configuration
- score_breakdown
- analysis_confidence
- analysis_status
- model_metadata
- created_at

### Requirement Findings
- id
- analysis_id
- requirement_name
- importance
- match_status
- evidence_type
- evidence_strength
- confidence
- explanation
- source_section
- source_excerpt
- score_contribution

### Project Analyses
- id
- analysis_id
- project_name
- extracted_technologies
- technical_depth
- jd_relevance
- supporting_evidence
- analysis_details

### Candidate Shortlists
- id
- recruiter_id
- job_description_id
- analysis_id
- status
- notes
- created_at

Add the necessary relationships, constraints, indexes, and timestamps.

Use a secure sharing model: recruiter-owned analyses and candidate-owned analyses must remain separate unless explicit sharing is enabled.

Avoid storing unnecessary sensitive personal data in AI prompts, logs, or analysis metadata.

---

## 14. Security, Privacy, and Fairness

Implement the following requirements:

- Validate file types and file sizes.
- Protect against malicious uploads.
- Keep resumes private by default.
- Enforce authentication and authorization on the backend.
- Prevent users from accessing other users' resumes or analyses.
- Apply database row-level security where appropriate.
- Use environment variables for API keys and database credentials.
- Never expose secrets in frontend code.
- Avoid logging full resumes or unnecessary personal information.
- Provide resume deletion and analysis deletion.
- Support configurable data retention.
- Explain when external AI providers process resume content.
- Do not use resumes to train models without explicit, informed consent.
- Treat uploaded resume and JD content as untrusted input, not as instructions for the AI system.

### Fairness requirements

The analyzer must evaluate job-relevant qualifications and evidence.

Do not use age, gender, race, religion, disability, marital status, photographs, names, or other protected or irrelevant personal characteristics to calculate match scores.

Do not infer protected characteristics from names or other resume content.

Do not automatically penalize career breaks, nontraditional education, college prestige, or unconventional career paths without a job-relevant reason.

Keep the evaluation explainable and suitable for human review. The system must not present its score as an objective determination of a person's worth or future job performance.

---

## 15. Testing and Evaluation

Create unit tests, integration tests, and end-to-end tests.

Test the following cases:

1. A skill appears explicitly in the Skills section.
2. A skill appears only in a project description.
3. A framework suggests a related language but does not prove every related capability.
4. A technology is mentioned without implementation details.
5. A project description contains a list of technologies without clear candidate ownership.
6. The JD includes mandatory and preferred skills.
7. The resume contains synonyms for JD terminology.
8. The resume does not provide evidence for a mandatory requirement.
9. The resume is scanned or has malformed formatting.
10. The AI produces an unsupported claim.
11. The weighted score calculation is correct.
12. A candidate attempts to access another user's analysis.
13. A recruiter compares candidates using the same JD.
14. A candidate deletes their resume and associated data.
15. An uploaded document contains prompt injection instructions.

Build a representative evaluation dataset with manually reviewed examples. Evaluate evidence precision, evidence recall, false-positive inferences, scoring consistency, and agreement with human reviewers.

Include regression tests to ensure that prompt or model changes do not silently alter scoring behavior.

---

## 16. Implementation Plan

Build the application in phases.

### Phase 1 — Functional MVP

- Authentication.
- Candidate and recruiter roles.
- Resume upload and extraction.
- JD entry and parsing.
- Direct skill matching.
- Project-level analysis.
- Indirect skill discovery.
- Explainable weighted score out of 10.
- Requirement evidence matrix.
- Analysis results dashboard.
- Persistent database storage.

### Phase 2 — Advanced Analysis

- Batch resume processing.
- Candidate comparison.
- Advanced project analysis.
- Resume improvement suggestions.
- Interview question generation.
- PDF and CSV exports.
- Analysis history.

### Phase 3 — Production Readiness

- OCR support.
- Background processing.
- Evaluation datasets and regression testing.
- Rate limiting and cost controls.
- Enhanced privacy controls.
- Observability and error monitoring.
- Deployment configuration.
- Performance optimization.

Complete Phase 1 end to end before prioritizing optional enhancements.

---

## 17. Instructions for Antigravity

Act as a senior full-stack engineer, AI engineer, product designer, and software architect.

Before coding:

1. Inspect the existing repository and understand its structure.
2. Identify existing features, dependencies, and incomplete implementations.
3. Create a concise implementation plan.
4. Define the data models and analysis response schema.
5. Identify the required environment variables and integrations.
6. Preserve existing working functionality.

While coding:

- Implement real functionality rather than mock results.
- Keep frontend, backend, database, and AI responsibilities clearly separated.
- Build reusable components.
- Use typed interfaces and schema validation.
- Handle loading, error, empty, and partial-result states.
- Use deterministic scoring logic.
- Preserve evidence provenance throughout the pipeline.
- Avoid hardcoded AI analysis results.
- Do not expose API keys in the client.
- Include database migrations and setup instructions.
- Add automated tests for core functionality.
- Use realistic demo data only in clearly labeled demo mode.
- Do not silently replace real AI functionality with static mock responses.

If an API key or external service is unavailable, implement the integration boundary, provide clear configuration instructions, and report what cannot yet be tested. Never claim that an integration works without verifying it.

After implementation:

1. Run the available tests.
2. Start the application and verify the main user workflows.
3. Fix errors encountered during testing.
4. Verify that resume evidence correctly maps to JD requirements.
5. Verify that indirect matches are clearly labeled and justified.
6. Verify the score against the weighted scoring formula.
7. Verify authentication and data isolation.
8. Document setup, environment variables, migrations, and deployment.

## 18. Definition of Done

The application is considered complete when:

- A user can upload a resume and provide a JD.
- The system extracts and structures the documents.
- Every relevant JD requirement is evaluated against resume evidence.
- Skills found in projects are recognized even if absent from the Skills section.
- Direct and indirect findings are clearly separated.
- Every match has a traceable explanation and source evidence.
- Project relevance and implementation depth are evaluated separately.
- The overall score is calculated deterministically out of 10.
- Score components and weights are visible to the user.
- The report includes strengths, gaps, uncertainties, and recommendations.
- HR can analyze and compare multiple candidates.
- Candidates can privately analyze and improve their resumes.
- Reports can be saved and retrieved.
- Authentication, authorization, and privacy controls are enforced.
- Core workflows pass automated tests and have been manually verified.

**Final objective:** Build an explainable AI Resume Analyzer that evaluates the relationship between a job description and a candidate's demonstrated capabilities—not just matching words in two documents. It must uncover relevant project-based evidence, distinguish confirmed facts from inferences, quantify alignment transparently, and help both recruiters and candidates make better-informed decisions.