import uuid
import json
from fastapi import APIRouter, HTTPException, Depends
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
        created_at=row["created_at"]
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
