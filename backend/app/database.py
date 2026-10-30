import sqlite3
import json
import os
import uuid
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any

DB_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "resume_analyzer.db"))

def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_connection()
    cursor = conn.cursor()
    
    # 1. Users Table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            email TEXT UNIQUE NOT NULL,
            name TEXT NOT NULL,
            password_hash TEXT NOT NULL,
            role TEXT NOT NULL DEFAULT 'candidate',
            created_at TEXT NOT NULL
        )
    """)
    
    # 2. Resumes Table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS resumes (
            id TEXT PRIMARY KEY,
            owner_id TEXT NOT NULL,
            file_name TEXT NOT NULL,
            file_type TEXT NOT NULL,
            extracted_text TEXT NOT NULL,
            structured_data TEXT NOT NULL,
            created_at TEXT NOT NULL,
            FOREIGN KEY (owner_id) REFERENCES users (id)
        )
    """)
    
    # 3. Job Descriptions Table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS job_descriptions (
            id TEXT PRIMARY KEY,
            owner_id TEXT NOT NULL,
            title TEXT NOT NULL,
            company TEXT NOT NULL,
            description TEXT NOT NULL,
            structured_requirements TEXT NOT NULL,
            created_at TEXT NOT NULL,
            FOREIGN KEY (owner_id) REFERENCES users (id)
        )
    """)
    
    # 4. Resume Analyses Table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS resume_analyses (
            id TEXT PRIMARY KEY,
            resume_id TEXT NOT NULL,
            job_description_id TEXT NOT NULL,
            owner_id TEXT NOT NULL,
            candidate_name TEXT NOT NULL,
            resume_file_name TEXT NOT NULL,
            job_title TEXT NOT NULL,
            company_name TEXT NOT NULL,
            overall_score REAL NOT NULL,
            score_breakdown TEXT NOT NULL,
            requirements_matrix TEXT NOT NULL,
            direct_findings TEXT NOT NULL,
            indirect_findings TEXT NOT NULL,
            project_analyses TEXT NOT NULL,
            missing_requirements TEXT NOT NULL,
            recommendations TEXT NOT NULL,
            interview_questions TEXT NOT NULL,
            analysis_limitations TEXT NOT NULL,
            created_at TEXT NOT NULL,
            experience_evaluation TEXT,
            resume_improvements TEXT,
            years_experience_required REAL,
            years_experience_found REAL,
            experience_assessment TEXT,
            creative_summary TEXT,
            role_level TEXT,
            FOREIGN KEY (resume_id) REFERENCES resumes (id),
            FOREIGN KEY (job_description_id) REFERENCES job_descriptions (id),
            FOREIGN KEY (owner_id) REFERENCES users (id)
        )
    """)
    
    # 5. Candidate Shortlists Table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS shortlists (
            id TEXT PRIMARY KEY,
            recruiter_id TEXT NOT NULL,
            job_description_id TEXT NOT NULL,
            analysis_id TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'review',
            notes TEXT DEFAULT '',
            created_at TEXT NOT NULL,
            FOREIGN KEY (recruiter_id) REFERENCES users (id),
            FOREIGN KEY (job_description_id) REFERENCES job_descriptions (id),
            FOREIGN KEY (analysis_id) REFERENCES resume_analyses (id)
        )
    """)

    # 6. Applications Pipeline Table (11 Stages ATS)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS applications (
            id TEXT PRIMARY KEY,
            analysis_id TEXT NOT NULL,
            resume_id TEXT NOT NULL,
            job_description_id TEXT NOT NULL,
            recruiter_id TEXT NOT NULL,
            candidate_name TEXT NOT NULL,
            resume_file_name TEXT NOT NULL,
            job_title TEXT NOT NULL,
            company_name TEXT NOT NULL,
            overall_score REAL NOT NULL,
            current_stage TEXT NOT NULL DEFAULT 'AI Analysis Completed',
            experience_status TEXT NOT NULL DEFAULT 'not_available',
            total_experience_months INTEGER,
            relevant_experience_months INTEGER,
            key_strengths TEXT NOT NULL DEFAULT '[]',
            key_gaps TEXT NOT NULL DEFAULT '[]',
            stage_history TEXT NOT NULL DEFAULT '[]',
            notes TEXT NOT NULL DEFAULT '[]',
            interview_feedbacks TEXT NOT NULL DEFAULT '[]',
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            FOREIGN KEY (analysis_id) REFERENCES resume_analyses (id),
            FOREIGN KEY (resume_id) REFERENCES resumes (id),
            FOREIGN KEY (job_description_id) REFERENCES job_descriptions (id)
        )
    """)
    
    # 7. Safe Migration for existing resume_analyses table
    cursor.execute("PRAGMA table_info(resume_analyses)")
    existing_cols = [row["name"] for row in cursor.fetchall()]
    new_cols = [
        ("experience_evaluation", "TEXT"),
        ("resume_improvements", "TEXT"),
        ("years_experience_required", "REAL"),
        ("years_experience_found", "REAL"),
        ("experience_assessment", "TEXT"),
        ("creative_summary", "TEXT"),
        ("role_level", "TEXT"),
    ]
    for col_name, col_type in new_cols:
        if col_name not in existing_cols:
            cursor.execute(f"ALTER TABLE resume_analyses ADD COLUMN {col_name} {col_type}")

    # 8. Default Guest User (for unauthenticated instant analysis)
    cursor.execute("SELECT id FROM users WHERE id = 'guest'")
    if not cursor.fetchone():
        cursor.execute(
            "INSERT INTO users (id, email, name, password_hash, role, created_at) VALUES (?, ?, ?, ?, ?, ?)",
            ('guest', 'guest@analyzer.local', 'Guest User', 'guest_hash', 'candidate', datetime.now(timezone.utc).isoformat())
        )

    conn.commit()
    conn.close()

# Initialize DB on module import
init_db()
