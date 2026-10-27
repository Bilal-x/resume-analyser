from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import init_db
from .routers import auth, resumes, jds, analyses

# Initialize database tables
init_db()

app = FastAPI(
    title="AI Resume Analyzer API",
    description="Production-ready AI-powered resume analysis platform for HR teams and job candidates.",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc"
)

# CORS — allow frontend dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth.router, prefix="/api")
app.include_router(resumes.router, prefix="/api")
app.include_router(jds.router, prefix="/api")
app.include_router(analyses.router, prefix="/api")

@app.get("/api/health")
def health_check():
    return {"status": "healthy", "service": "AI Resume Analyzer API", "version": "1.0.0"}
