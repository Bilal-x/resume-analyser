# AI Resume Analyser

A production-ready, full-stack application that deeply evaluates candidate resumes against job descriptions (JDs). It identifies explicit qualifications as well as indirect skills demonstrated through project implementations and technical architectures, generating an explainable, deterministic match score out of 10.

---

## Quick Start (One-Command Launch)

From the project root directory (`c:\Users\Bilal\Documents\APP\resume analyser`):

### 1. One-Time Setup (or when dependencies change)

```powershell
npm install
```
> Running `npm install` in the root installs the orchestration tools (`concurrently`) and automatically triggers the installation of all frontend dependencies.

### 2. Start Both Backend & Frontend Together

```powershell
npm run dev
```

Both services will launch simultaneously in your terminal with colored, named output:
- **`[backend]`** — FastAPI + Uvicorn server running at [http://localhost:8000](http://localhost:8000)
- **`[frontend]`** — React + Vite dev server running at [http://localhost:5173](http://localhost:5173)

### 3. Stop the Application
Press **`Ctrl + C`** in the terminal. Both services will shut down cleanly at the same time.

---

## Application Access Points

| Component | URL | Description |
| :--- | :--- | :--- |
| **Web Application** | [http://localhost:5173/](http://localhost:5173/) | Main UI (Candidate & Recruiter dashboards, analysis dossier, comparisons) |
| **Interactive API Docs** | [http://localhost:8000/api/docs](http://localhost:8000/api/docs) | Swagger UI for exploring and testing backend REST endpoints |
| **Alternative API Docs** | [http://localhost:8000/api/redoc](http://localhost:8000/api/redoc) | ReDoc OpenAPI documentation |

---

## Available Root Scripts

| Command | Action |
| :--- | :--- |
| `npm run dev` | Starts both FastAPI backend and React frontend concurrently |
| `npm run dev:backend` | Starts only the FastAPI backend with hot reload |
| `npm run dev:frontend` | Starts only the React Vite dev server |
| `npm run test:backend` | Runs the automated backend test suite (8 tests) via pytest |
| `npm run build` | Builds the production bundle of the React frontend |
| `npm run lint` | Runs the oxlint linter across the frontend codebase |

---

## Project Structure

```
resume-analyser/
├── package.json              # Root orchestrator with concurrently scripts
├── README.md                 # Project documentation and launch instructions
├── backend/                  # Python FastAPI Backend
│   ├── app/
│   │   ├── main.py           # FastAPI entrypoint, middleware, and router mounting
│   │   ├── database.py       # SQLite connection and schema migrations
│   │   ├── auth.py           # JWT token generation and verification
│   │   ├── config.py         # Configurable scoring weights and environment settings
│   │   ├── models/           # Pydantic schemas (resumes, JDs, analyses)
│   │   ├── routers/          # API endpoints (auth, resumes, jds, analyses)
│   │   └── services/         # Pipeline services (parser, direct matcher,
│   │                         # indirect discoverer, scoring engine, project analyzer)
│   ├── tests/                # Automated pytest suite (pipeline and API integration tests)
│   └── resume_analyzer.db    # SQLite database
└── frontend/                 # React 19 + TypeScript + Vite + Tailwind CSS
    ├── package.json
    ├── src/
    │   ├── App.tsx           # Router with protected routes & role-based guards
    │   ├── contexts/         # AuthContext (JWT session management)
    │   ├── components/       # Layout, Sidebar, UI design system
    │   └── pages/            # CandidateDashboard, RecruiterDashboard, ResumesPage,
    │                         # JDsPage, AnalysesListPage, AnalysisDetailPage,
    │                         # CandidateComparisonPage, LandingPage, AuthPages
```

---

## Python Environment

The backend runs using the installed Python runtime (`C:\Python314\python.exe` or whatever `python` is active in your PATH).
All dependencies (`fastapi`, `uvicorn`, `pymupdf`, `python-docx`, `pytest`, `httpx`) are installed and ready.
