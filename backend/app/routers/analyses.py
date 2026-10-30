import uuid
import json
from datetime import datetime
from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Form
from pydantic import BaseModel
from typing import Optional, List
from ..services.analysis_pipeline import run_analysis_pipeline
from ..models.schemas import AnalysisResponse, CandidateComparisonResponse, CandidateComparisonSummary
from ..database import get_connection
from ..auth import get_current_user

router = APIRouter(prefix="/analyses", tags=["Analyses"])

class AnalysisRequest(BaseModel):
    resume_id: str
    jd_id: str
    custom_weights: Optional[dict] = None

def _db_row_to_analysis(row) -> AnalysisResponse:
    from ..models.schemas import (
        ScoreBreakdown, RequirementMatrixItem, DirectFinding,
        IndirectFinding, ProjectAnalysisItem, RecommendationsSection,
        InterviewQuestion, SkillImprovement, BulletRewrite, KeywordAlignment
    )
    def parse_recommendations(raw_dict):
        return RecommendationsSection(
            skills_section_improvements=[SkillImprovement(**x) for x in raw_dict.get("skills_section_improvements", [])],
            project_bullet_rewrites=[BulletRewrite(**x) for x in raw_dict.get("project_bullet_rewrites", [])],
            keyword_alignment=KeywordAlignment(**raw_dict.get("keyword_alignment", {"supported_keywords": [], "potential_keywords_needs_confirmation": [], "genuine_experience_gaps": []})),
            prioritized_action_plan=raw_dict.get("prioritized_action_plan", []),
            interview_prep_topics=raw_dict.get("interview_prep_topics", []),
            optional_learning_exercises=raw_dict.get("optional_learning_exercises", [])
        )

    from ..services.company_intelligence import generate_company_intelligence
    from ..services.scoring_engine import is_fresher_job
    from ..services.experience_analyzer import (
        extract_jd_experience,
        extract_resume_experience,
        assess_experience,
        generate_creative_summary
    )

    conn_exp = get_connection()
    jd_row_exp = conn_exp.execute("SELECT description, structured_requirements FROM job_descriptions WHERE id = ?", (row["job_description_id"],)).fetchone()
    resume_row_exp = conn_exp.execute("SELECT extracted_text, structured_data FROM resumes WHERE id = ?", (row["resume_id"],)).fetchone()
    conn_exp.close()

    jd_desc_exp = jd_row_exp["description"] if jd_row_exp else ""
    resume_raw_exp = resume_row_exp["extracted_text"] if resume_row_exp else ""
    from ..models.schemas import ExtractedResumeData
    structured_resume_exp = ExtractedResumeData(**json.loads(resume_row_exp["structured_data"])) if resume_row_exp else ExtractedResumeData()
    reqs_exp = [RequirementMatrixItem(**x) for x in json.loads(row["requirements_matrix"])]

    req_years = extract_jd_experience(jd_desc_exp, [], row["job_title"])
    found_years = extract_resume_experience(structured_resume_exp, resume_raw_exp)
    exp_assessment = assess_experience(req_years, found_years)
    creative_summary = generate_creative_summary(row["overall_score"], req_years, found_years, row["candidate_name"])

    return AnalysisResponse(
        id=row["id"],
        resume_id=row["resume_id"],
        job_description_id=row["job_description_id"],
        owner_id=row["owner_id"],
        candidate_name=row["candidate_name"],
        resume_file_name=row["resume_file_name"],
        job_title=row["job_title"],
        company_name=row["company_name"],
        overall_score=row["overall_score"],
        score_breakdown=ScoreBreakdown(**json.loads(row["score_breakdown"])),
        requirements_matrix=[RequirementMatrixItem(**x) for x in json.loads(row["requirements_matrix"])],
        direct_findings=[DirectFinding(**x) for x in json.loads(row["direct_findings"])],
        indirect_findings=[IndirectFinding(**x) for x in json.loads(row["indirect_findings"])],
        project_analyses=[ProjectAnalysisItem(**x) for x in json.loads(row["project_analyses"])],
        missing_requirements=json.loads(row["missing_requirements"]),
        recommendations=parse_recommendations(json.loads(row["recommendations"])),
        interview_questions=[InterviewQuestion(**x) for x in json.loads(row["interview_questions"])],
        analysis_limitations=json.loads(row["analysis_limitations"]),
        created_at=row["created_at"],
        company_intel=generate_company_intelligence(row["company_name"]),
        role_level="Fresher / Early-Career" if is_fresher_job(row["job_title"], []) else "Experienced / Mid-Senior",
        years_experience_required=req_years,
        years_experience_found=found_years,
        experience_assessment=exp_assessment,
        creative_summary=creative_summary
    )

@router.post("/", response_model=AnalysisResponse)
def run_analysis(req: AnalysisRequest, current_user: dict = Depends(get_current_user)):
    conn = get_connection()
    
    # Fetch resume (ownership check)
    resume_row = conn.execute("SELECT * FROM resumes WHERE id = ?", (req.resume_id,)).fetchone()
    if not resume_row:
        conn.close()
        raise HTTPException(status_code=404, detail="Resume not found.")
    if resume_row["owner_id"] != current_user["sub"] and current_user.get("role") != "recruiter":
        conn.close()
        raise HTTPException(status_code=403, detail="Access denied to this resume.")
    
    # Fetch JD
    jd_row = conn.execute("SELECT * FROM job_descriptions WHERE id = ?", (req.jd_id,)).fetchone()
    conn.close()
    if not jd_row:
        raise HTTPException(status_code=404, detail="Job description not found.")
    
    # Parse stored structured data
    from ..models.schemas import ExtractedResumeData, JDRequirement
    structured_data = ExtractedResumeData(**json.loads(resume_row["structured_data"]))
    requirements = [JDRequirement(**r) for r in json.loads(jd_row["structured_requirements"])]
    
    analysis_id = str(uuid.uuid4())
    
    result = run_analysis_pipeline(
        analysis_id=analysis_id,
        resume_id=req.resume_id,
        job_description_id=req.jd_id,
        owner_id=current_user["sub"],
        candidate_name=structured_data.full_name or "Candidate",
        resume_file_name=resume_row["file_name"],
        job_title=jd_row["title"],
        company_name=jd_row["company"],
        requirements=requirements,
        resume_data=structured_data,
        custom_weights=req.custom_weights
    )
    return result

@router.post("/instant", response_model=AnalysisResponse)
async def run_instant_analysis(
    file: Optional[UploadFile] = File(None),
    resume_text: Optional[str] = Form(None),
    jd_text: str = Form(...),
    job_title: Optional[str] = Form("Target Role"),
    company_name: Optional[str] = Form("")
):
    if not file and not resume_text:
        raise HTTPException(status_code=400, detail="Please provide either a resume file or resume text.")
    
    conn = get_connection()
    cursor = conn.cursor()
    # Ensure guest user exists
    cursor.execute("SELECT id FROM users WHERE id = 'guest'")
    if not cursor.fetchone():
        cursor.execute(
            "INSERT INTO users (id, email, name, password_hash, role, created_at) VALUES (?, ?, ?, ?, ?, ?)",
            ('guest', 'guest@analyzer.local', 'Guest User', 'guest_hash', 'candidate', datetime.utcnow().isoformat())
        )
        conn.commit()

    from ..services.parser import extract_raw_text, parse_resume
    from ..services.jd_analyzer import parse_job_description

    if file and file.filename:
        file_bytes = await file.read()
        filename = file.filename
    else:
        file_bytes = (resume_text or "").encode("utf-8")
        filename = "resume.txt"

    raw_resume_text = extract_raw_text(file_bytes, filename)
    structured_resume = parse_resume(file_bytes, filename)
    requirements = parse_job_description(jd_text)

    resume_id = str(uuid.uuid4())
    jd_id = str(uuid.uuid4())
    analysis_id = str(uuid.uuid4())
    now_iso = datetime.utcnow().isoformat()
    file_type = "pdf" if filename.lower().endswith(".pdf") else ("docx" if filename.lower().endswith(".docx") else "txt")

    cursor.execute("""
        INSERT INTO resumes (id, owner_id, file_name, file_type, extracted_text, structured_data, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (
        resume_id,
        "guest",
        filename,
        file_type,
        raw_resume_text,
        json.dumps(structured_resume.model_dump()),
        now_iso
    ))

    cursor.execute("""
        INSERT INTO job_descriptions (id, owner_id, title, company, description, structured_requirements, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (
        jd_id,
        "guest",
        job_title or "Target Role",
        company_name or "",
        jd_text,
        json.dumps([r.model_dump() for r in requirements]),
        now_iso
    ))
    conn.commit()
    conn.close()

    result = run_analysis_pipeline(
        analysis_id=analysis_id,
        resume_id=resume_id,
        job_description_id=jd_id,
        owner_id="guest",
        candidate_name=structured_resume.full_name or "Candidate",
        resume_file_name=filename,
        job_title=job_title or "Target Role",
        company_name=company_name or "",
        requirements=requirements,
        resume_data=structured_resume
    )
    return result

@router.get("/", response_model=list[AnalysisResponse])
def list_analyses(current_user: dict = Depends(get_current_user)):
    conn = get_connection()
    rows = conn.execute(
        "SELECT * FROM resume_analyses WHERE owner_id = ? ORDER BY created_at DESC",
        (current_user["sub"],)
    ).fetchall()
    conn.close()
    return [_db_row_to_analysis(r) for r in rows]

@router.get("/jd/{jd_id}", response_model=list[AnalysisResponse])
def list_analyses_for_jd(jd_id: str, current_user: dict = Depends(get_current_user)):
    """Recruiter: list all analyses across candidates for a specific JD."""
    conn = get_connection()
    # Allow recruiter to see all analyses for their own JD
    if current_user.get("role") == "recruiter":
        rows = conn.execute(
            "SELECT * FROM resume_analyses WHERE job_description_id = ? ORDER BY overall_score DESC",
            (jd_id,)
        ).fetchall()
    else:
        rows = conn.execute(
            "SELECT * FROM resume_analyses WHERE job_description_id = ? AND owner_id = ? ORDER BY created_at DESC",
            (jd_id, current_user["sub"])
        ).fetchall()
    conn.close()
    return [_db_row_to_analysis(r) for r in rows]

@router.get("/compare/{jd_id}", response_model=CandidateComparisonResponse)
def compare_candidates(jd_id: str, current_user: dict = Depends(get_current_user)):
    """HR comparative view for all candidates analyzed against a JD."""
    if current_user.get("role") != "recruiter":
        raise HTTPException(status_code=403, detail="Candidate comparison is a recruiter-only feature.")
    
    conn = get_connection()
    jd_row = conn.execute("SELECT * FROM job_descriptions WHERE id = ?", (jd_id,)).fetchone()
    if not jd_row:
        conn.close()
        raise HTTPException(status_code=404, detail="Job description not found.")
    
    rows = conn.execute(
        "SELECT * FROM resume_analyses WHERE job_description_id = ? ORDER BY overall_score DESC",
        (jd_id,)
    ).fetchall()
    conn.close()
    
    from ..config import DEFAULT_SCORING_WEIGHTS
    summaries = []
    for row in rows:
        sb = json.loads(row["score_breakdown"])
        df = json.loads(row["direct_findings"])
        inf = json.loads(row["indirect_findings"])
        matrix = json.loads(row["requirements_matrix"])
        mandatory_total = len([m for m in matrix if m["importance"] == "Mandatory"])
        mandatory_covered = len([m for m in matrix if m["importance"] == "Mandatory" and m["status"] in ["Supported", "Project-derived", "Transferable"]])
        
        summaries.append(CandidateComparisonSummary(
            analysis_id=row["id"],
            resume_id=row["resume_id"],
            candidate_name=row["candidate_name"],
            file_name=row["resume_file_name"],
            overall_score=row["overall_score"],
            mandatory_coverage_percent=round((mandatory_covered/mandatory_total*100) if mandatory_total else 0, 1),
            direct_matches_count=len(df),
            indirect_matches_count=len(inf),
            project_depth_score=sb.get("project_relevance_score", 0),
            experience_score=sb.get("experience_implementation_score", 0),
            confidence=sb.get("analysis_confidence", "Low"),
            top_strengths=sb.get("key_positive_factors", [])[:3],
            key_gaps=sb.get("key_negative_factors", [])[:3],
            shortlist_status="review"
        ))
    
    # Collect all requirements for cross matrix
    jd_reqs = json.loads(jd_row["structured_requirements"])
    cross_matrix = []
    for req_dict in jd_reqs[:10]:
        req_name = req_dict["skill"]
        row_data = {"requirement": req_name, "importance": req_dict["importance"]}
        for row in rows:
            matrix = json.loads(row["requirements_matrix"])
            matched = next((m for m in matrix if m["requirement_name"] == req_name), None)
            row_data[row["candidate_name"]] = matched["status"] if matched else "Not evidenced"
        cross_matrix.append(row_data)
    
    return CandidateComparisonResponse(
        job_description_id=jd_id,
        job_title=jd_row["title"],
        company=jd_row["company"],
        scoring_weights=DEFAULT_SCORING_WEIGHTS,
        candidates=summaries,
        requirements_cross_matrix=cross_matrix
    )

@router.get("/{analysis_id}", response_model=AnalysisResponse)
def get_analysis(analysis_id: str, current_user: dict = Depends(get_current_user)):
    conn = get_connection()
    row = conn.execute("SELECT * FROM resume_analyses WHERE id = ?", (analysis_id,)).fetchone()
    conn.close()
    if not row:
        raise HTTPException(status_code=404, detail="Analysis not found.")
    if row["owner_id"] != current_user["sub"] and current_user.get("role") != "recruiter":
        raise HTTPException(status_code=403, detail="Access denied.")
    return _db_row_to_analysis(row)

@router.delete("/{analysis_id}")
def delete_analysis(analysis_id: str, current_user: dict = Depends(get_current_user)):
    conn = get_connection()
    row = conn.execute("SELECT owner_id FROM resume_analyses WHERE id = ?", (analysis_id,)).fetchone()
    if not row:
        conn.close()
        raise HTTPException(status_code=404, detail="Analysis not found.")
    if row["owner_id"] != current_user["sub"]:
        conn.close()
        raise HTTPException(status_code=403, detail="Cannot delete another user's analysis.")
    conn.execute("DELETE FROM resume_analyses WHERE id = ?", (analysis_id,))
    conn.commit()
    conn.close()
    return {"message": "Analysis deleted."}
