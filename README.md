# AI Resume Analyzer

<p align="center">
  <strong>Evidence-Based Hiring Intelligence & Deterministic Resume Scoring</strong>
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#quick-start">Quick Start</a> •
  <a href="#architecture">Architecture</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#evaluation-methodology">HR Methodology</a> •
  <a href="#api-reference">API Reference</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/FastAPI-009688?style=flat-square&logo=fastapi&logoColor=white" alt="FastAPI" />
  <img src="https://img.shields.io/badge/React_19-20232A?style=flat-square&logo=react&logoColor=61DAFB" alt="React 19" />
  <img src="https://img.shields.io/badge/Tailwind_CSS_v4-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Python-3.10+-3776AB?style=flat-square&logo=python&logoColor=white" alt="Python" />
  <img src="https://img.shields.io/badge/Tests-33%2F33_Passing-success?style=flat-square" alt="Tests" />
  <img src="https://img.shields.io/badge/License-MIT-blue?style=flat-square" alt="License" />
</p>

---

## Overview

Traditional Applicant Tracking Systems (ATS) rely on superficial keyword matching. They reward keyword stuffing and unfairly reject high-potential candidates who demonstrate deep technical competency in their projects rather than spamming lists of buzzwords.

**AI Resume Analyzer** reimagines resume screening with **evidence-based technical analysis** and **real HR evaluation logic**:

- **No Opaque AI Hallucinations**: Every match, deduction, and score is computed deterministically through a transparent, 6-dimension weighted formula backed by exact excerpts from the resume.
- **Humanized HR Intelligence**: Differentiates between **Freshers / Early-Career** and **Experienced / Senior** roles—evaluating foundational potential and projects without demanding multi-year commercial history from junior engineers.
- **Skill Inventory Respect**: Skills stated in the candidate's skills section are credited as confirmed competencies rather than flagged as false skills.
- **Company & Hiring Culture Intelligence**: Automatically synthesizes work culture ratings, review sentiments (Glassdoor/Blind), and interview formats for target employers.

---

## Key Features

### 1. Real HR Evaluation & Role Calibration
- **Adaptive Level Scoring**: Automatically detects role seniority (`fresher`, `intern`, `junior`, vs `senior`, `lead`).
  - **Junior / Fresher**: Prioritizes demonstrated project depth, technical curiosity, coursework, and declared competencies (8.0+/10 reachable with strong projects).
  - **Senior / Lead**: Weights architectural trade-offs, commercial tenure, scalability, and system ownership.
- **Declared Skill Honor**: Recognizes declared skills in the skills inventory with high standing, avoiding false-skill penalties when a skill wasn't explicitly repeated in project bullets.

### 2. Intelligent Technical Deductions & Ecosystem Inference
- **Deductive Stack Reasoning**: If a project mentions *"built a responsive web app"*, the engine intelligently credits foundational **HTML, CSS, and JavaScript**.
- **Framework Ecosystem Mapping**: Using `React` automatically infers practical capability in **JavaScript, HTML, CSS, and Component Architecture**.
- **Domain Archetype Synthesis**: Clusters individual skills into broad disciplines (**Frontend Engineering**, **Backend Engineering**, **AI / ML Engineering**).
- **AI Project Recognition**: Any machine learning or neural network project automatically credits **AI Engineering** requirements even if omitted from the raw skills list.

### 3. Company & Hiring Culture Briefings
When a target company is specified (e.g., Google, Vercel, Stripe, Amazon, or custom startups), the analysis surfaces:
- **Work Culture Rating** (e.g., 4.4 / 5.0) and engineering velocity summary.
- **Interview & Hiring Style** (DSA rounds, take-home projects, system design, behavioral format).
- **Candidate Tips**: Direct advice on what hiring managers at that company look for.
- **Employee Sentiments**: Aggregated positive highlights and cautionary notes.

### 4. Accurate Professional Experience Engine
- **Strict Work Experience Extraction**: Professional YOE is extracted exclusively from designated employment sections (`Work Experience`, `Professional Experience`, `Employment History`). Never inflated by graduation dates, courses, or academic projects.
- **Interval Merging & Overlap Elimination**: Overlapping jobs are merged into contiguous calendar periods so no month is double-counted.
- **Separate Internship Accounting**: Identifies internships within work experience and accounts for them separately (`internship_months`) rather than treating them as full-time employment.
- **Missing Experience Safeguard**: Resumes without work experience have the YOE dimension excluded from scoring and its weight proportionally redistributed, ensuring no unfair 0-point penalty.
- **Domain & Tech-Specific Tenure**: Differentiates general career tenure from targeted technology experience (e.g., 3 years general vs 1.5 years Python).

### 5. 11-Stage ATS Candidate Hiring Pipeline
- **Dual Recruiter Views**: Interactive **Kanban Board** and high-density **Table View**.
- **11 Lifecycle Stages**: `New Application` → `Resume Processing` → `AI Analysis Completed` → `Pending HR Review` → `Shortlisted` → `Interview Scheduled` → `Technical Round` → `HR Round` → `Selected` / `Rejected` / `On Hold`.
- **Collaborative Review**: Recruiter stage progression, timestamped internal notes, and interview feedback recording.

### 6. Candidate Resume Improvement Center
Actionable, evidence-backed recommendations covering 6 core dimensions:
1. Demonstrated skills missing from the Skills section
2. Measurable achievement & quantification improvements (with copyable rewrites)
3. Project technical depth & architecture clarifications
4. Supported JD terminology to include for ATS alignment
5. Genuine skill gaps requiring targeted learning
6. Work experience date ambiguity warnings

### 7. Dual Workspace Experiences & 7 Analysis Modules
- **At-a-Glance Executive View**: Instant HR score ring, confirmed competency badges, and plain-English evaluation summary.
- **7 Detailed Modules**: Overview, Experience Analysis, Skills Analysis, Project Analysis, Evidence Explorer, Resume Improvement Center, and Interview Prep.

---

## Architecture & Pipeline Flow

```mermaid
flowchart TD
    A["Resume (PDF / DOCX)"] --> B["Multi-Format Parser (PyMuPDF / Docx)"]
    C["Job Description"] --> D["JD Analyzer & Competency Matrix"]
    
    B --> E["Extracted Sections & Structured Employment Entries"]
    D --> F["Structured Requirements & Experience Specs"]
    
    E & F --> G["Stage 1: Deterministic Experience Engine (Interval Merging)"]
    E & F --> H["Stage 2: Direct Skill Matcher & Ecosystem Inference"]
    E & F --> I["Stage 3: Project Technical Architecture Analyzer"]
    
    G & H & I --> J["Stage 4: Proportional Weight Redistributing Scoring Engine"]
    F --> K["Stage 5: Company Intelligence & Culture Synthesis"]
    
    J & K --> L["Stage 6: Resume Improvement Center & Interview Q&A Generator"]
    L --> M["Final Analysis Dossier (At-a-Glance + 7 Deep-Dive Modules)"]
    M --> N["11-Stage ATS Pipeline Tracking"]
```

---

## Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS v4, Lucide Icons, Recharts |
| **Backend** | Python 3.10+, FastAPI, Uvicorn, Pydantic v2 |
| **Document Parsing** | PyMuPDF (fitz), python-docx |
| **Persistence** | SQLite with structured JSON serialization |
| **Authentication** | JWT (JSON Web Tokens) with Argon2/PBKDF2 hashing |
| **Testing** | Pytest, HTTPX TestClient (33/33 unit and integration tests passing) |

---

## Quick Start

### Prerequisites
- **Node.js** (v18 or higher)
- **Python** (v3.10 or higher)
- **Git**

### One-Command Setup & Launch

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Bilal-x/resume-analyser.git
   cd resume-analyser
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```
   > Automatically sets up root orchestration tools and installs frontend packages.

3. **Install Python backend dependencies:**
   ```bash
   pip install -r backend/requirements.txt
   ```
   *(Or install core dependencies directly: `pip install fastapi uvicorn pymupdf python-docx pytest httpx pydantic`)*

4. **Start the application:**
   ```bash
   npm run dev
   ```

Both servers will launch simultaneously:
- **Frontend UI**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:8000](http://localhost:8000)
- **Interactive Swagger Docs**: [http://localhost:8000/api/docs](http://localhost:8000/api/docs)

---

## Available Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts FastAPI backend and React frontend concurrently |
| `npm run dev:backend` | Runs only the FastAPI server with auto-reload |
| `npm run dev:frontend` | Runs only the Vite dev server |
| `npm run test:backend` | Executes the 33-test automated pytest suite (including 12 mandatory experience cases) |
| `npm run build` | Compiles the production React bundle with Tailwind v4 |
| `npm run lint` | Runs the oxlint linter across frontend files |

---

## Evaluation Methodology & Scoring Formula

The overall match score (out of 10.0) is strictly deterministic and auditable:

$$\text{Overall Score} = 10 \times \sum_{i=1}^{n} (\text{Dimension Score}_i \times \text{Dimension Weight}_i)$$

### Dimension Weights (Adaptive Calibration)

| Dimension | Experienced Role | Fresher / Junior Role | Real HR Evaluation Criteria |
| :--- | :---: | :---: | :--- |
| **Mandatory Skills** | **30%** | **25%** | Verifies declared competencies and direct evidence |
| **Core Technical Skills** | **25%** | **30%** | Assesses broad foundation and technical literacy |
| **Project Relevance & Depth** | **25%** | **35%** | Rewards hands-on implementations and architecture |
| **Relevant Experience** | **20%** | **10%** | Evaluates professional tenure or academic projects |

---

## Project Structure

```
resume-analyser/
├── backend/
│   ├── app/
│   │   ├── main.py                   # FastAPI entrypoint & middleware
│   │   ├── database.py               # SQLite schema & connection pooling
│   │   ├── auth.py                   # JWT security & role-based guards
│   │   ├── models/schemas.py         # Pydantic data schemas
│   │   ├── routers/                  # REST endpoints (auth, resumes, jds, analyses)
│   │   └── services/
│   │       ├── analysis_pipeline.py  # Multi-stage evaluation coordinator
│   │       ├── direct_matcher.py     # Skills inventory & experience matching
│   │       ├── indirect_discoverer.py# Technical deductions & domain synthesis
│   │       ├── scoring_engine.py     # HR role calibration & scoring logic
│   │       ├── skill_taxonomy.py     # Typo normalization & ecosystem maps
│   │       ├── company_intelligence.py# Culture, reviews & interview insights
│   │       ├── project_analyzer.py   # Project architecture inspector
│   │       ├── recommendation_engine.py# Resume bullet rewrite generator
│   │       └── interview_generator.py # Tailored interview Q&A engine
│   └── tests/                        # Automated pytest test suites
└── frontend/
    ├── src/
    │   ├── components/               # Layout, Sidebar, Minimal UI system
    │   ├── contexts/                 # AuthContext & token management
    │   ├── lib/api.ts                # Type-safe API client
    │   └── pages/
    │       ├── LandingPage.tsx       # Minimalist, humanized landing page
    │       ├── CandidateDashboard.tsx# Candidate portal with ATS optimizer
    │       ├── RecruiterDashboard.tsx# Recruiter pipeline & shortlist tools
    │       ├── AnalysisDetailPage.tsx# At-a-glance & technical deep-dive
    │       ├── CandidateComparisonPage.tsx# Multi-candidate matrix comparison
    │       ├── ResumesPage.tsx       # Resume upload & parsing manager
    │       └── JDsPage.tsx           # Job description requirement manager
```

---

## License

This project is licensed under the [MIT License](LICENSE).
