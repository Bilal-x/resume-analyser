import os
from typing import Dict

# Application Configuration
APP_NAME = "AI Resume Analyzer"
VERSION = "1.0.0"
DEBUG = os.getenv("DEBUG", "true").lower() == "true"
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./resume_analyzer.db")
SECRET_KEY = os.getenv("SECRET_KEY", "resume-analyzer-secret-key-super-secure-production-ready-2026")
UPLOAD_DIR = os.getenv("UPLOAD_DIR", os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "uploads")))

# Default Scoring Weights (Must sum to 1.0)
DEFAULT_SCORING_WEIGHTS: Dict[str, float] = {
    "mandatory_technical_skills": 0.30,
    "core_technical_skills": 0.20,
    "project_relevance_depth": 0.20,
    "relevant_experience": 0.15,
    "domain_knowledge": 0.10,
    "other_qualifications": 0.05,
}

# Score Interpretation Tiers
SCORE_TIERS = [
    {"min": 9.0, "max": 10.0, "label": "Very Strong Alignment", "badge": "success", "color": "emerald"},
    {"min": 7.5, "max": 8.99, "label": "Strong Alignment", "badge": "primary", "color": "blue"},
    {"min": 6.0, "max": 7.49, "label": "Moderate Alignment", "badge": "warning", "color": "amber"},
    {"min": 4.0, "max": 5.99, "label": "Partial Alignment", "badge": "amber", "color": "orange"},
    {"min": 0.0, "max": 3.99, "label": "Limited Alignment", "badge": "danger", "color": "rose"},
]

# Supported File Extensions
ALLOWED_EXTENSIONS = {".pdf", ".docx", ".txt"}
MAX_FILE_SIZE_MB = 15
