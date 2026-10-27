import uuid
import json
from datetime import datetime
from typing import List, Dict, Any, Optional, Tuple

from ..models.schemas import (
    ExtractedResumeData, JDRequirement, DirectFinding,
    IndirectFinding, RequirementMatrixItem, ProjectAnalysisItem,
    ScoreBreakdown, RecommendationsSection, InterviewQuestion,
    AnalysisResponse
)
from .direct_matcher import evaluate_direct_matching
from .indirect_discoverer import discover_indirect_skills
from .project_analyzer import evaluate_all_projects
from .scoring_engine import calculate_explainable_score
from .recommendation_engine import generate_recommendations
from .interview_generator import generate_interview_questions
from ..database import get_connection

def build_requirement_matrix(
    requirements: List[JDRequirement],
    direct_findings: List[DirectFinding],
    indirect_findings: List[IndirectFinding]
) -> List[RequirementMatrixItem]:
    """Construct Section 6: Requirement-by-Requirement Evidence Matrix."""
    matrix: List[RequirementMatrixItem] = []
    
    direct_map = {f.requirement_name.lower(): f for f in direct_findings}
    indirect_map = {f.requirement_name.lower(): f for f in indirect_findings}
    
    for req in requirements:
        req_name = req.skill
        req_low = req_name.lower()
        
        df = direct_map.get(req_low)
        inf = indirect_map.get(req_low)
        
        direct_ev_text = "Not in Skills section"
        proj_ev_text = "Not found"
        indirect_text = "No reliable evidence"
        status = "Not evidenced"
        confidence = "Low"
        score_contrib = 0.0
        excerpt = None
        source_sec = None
        
        if df:
            source_sec = df.resume_section
            excerpt = df.supporting_excerpt
            if df.resume_section == "Skills":
                direct_ev_text = f"Explicitly listed ({df.strength_of_evidence})"
                status = "Unverified" if df.strength_of_evidence == "Unverified" else "Supported"
                confidence = "Medium"
                score_contrib = 0.4
            elif df.resume_section == "Projects":
                proj_ev_text = f"Found in project ({df.strength_of_evidence})"
                status = "Supported"
                confidence = "High"
                score_contrib = 0.85
            elif df.resume_section == "Work Experience":
                direct_ev_text = f"Applied in work role ({df.strength_of_evidence})"
                status = "Supported"
                confidence = "High"
                score_contrib = 1.0
            elif df.resume_section == "Certifications":
                direct_ev_text = f"Verified Certification"
                status = "Supported"
                confidence = "High"
                score_contrib = 0.8
                
        if inf:
            indirect_text = f"{inf.related_technology_or_activity} ({inf.confidence_level} confidence)"
            if not excerpt:
                excerpt = inf.supporting_excerpt
                source_sec = inf.source_project_or_experience
            if status in ["Not evidenced", "Unverified"]:
                status = "Project-derived" if "Project" in inf.source_project_or_experience else "Transferable"
                confidence = inf.confidence_level
                score_contrib = 0.75 if confidence == "High" else 0.5
                
        matrix.append(
            RequirementMatrixItem(
                requirement_name=req_name,
                category=req.category,
                importance=req.importance,
                direct_evidence=direct_ev_text,
                project_evidence=proj_ev_text,
                indirect_match=indirect_text,
                confidence=confidence,
                status=status,
                score_contribution=score_contrib,
                supporting_excerpt=excerpt,
                source_section=source_sec
            )
        )
        
    return matrix

def run_analysis_pipeline(
    analysis_id: str,
    resume_id: str,
    job_description_id: str,
    owner_id: str,
    candidate_name: str,
    resume_file_name: str,
    job_title: str,
    company_name: str,
    requirements: List[JDRequirement],
    resume_data: ExtractedResumeData,
    custom_weights: Optional[Dict[str, float]] = None
) -> AnalysisResponse:
    """Execute complete multi-stage analysis pipeline and persist results."""
    
    # Stage 3: Direct Skill Matching
    direct_findings = evaluate_direct_matching(requirements, resume_data)
    direct_matched_set = {f.requirement_name for f in direct_findings}
    
    # Stage 4: Indirect Skill Discovery
    indirect_findings = discover_indirect_skills(requirements, resume_data, direct_matched_set)
    
    # Stage 5: Project-Level Technical Analysis
    project_analyses = evaluate_all_projects(resume_data.projects, requirements)
    
    # Requirement Matrix
    matrix = build_requirement_matrix(requirements, direct_findings, indirect_findings)
    
    # Stage 6: Deterministic Explainable Scoring
    overall_score, score_breakdown = calculate_explainable_score(
        requirements=requirements,
        resume_data=resume_data,
        direct_findings=direct_findings,
        indirect_findings=indirect_findings,
        project_analyses=project_analyses,
        custom_weights=custom_weights
    )
    
    # Missing Requirements
    matrix_names_evidenced = {m.requirement_name.lower() for m in matrix if m.status in ["Supported", "Project-derived", "Transferable"]}
    missing = [r.skill for r in requirements if r.skill.lower() not in matrix_names_evidenced]
    
    # Stage 7: Recommendations
    recommendations = generate_recommendations(
        requirements=requirements,
        resume_data=resume_data,
        direct_findings=direct_findings,
        indirect_findings=indirect_findings,
        project_analyses=project_analyses
    )
    
    # Stage 9: Interview Questions
    interview_questions = generate_interview_questions(
        requirements=requirements,
        resume_data=resume_data,
        direct_findings=direct_findings,
        indirect_findings=indirect_findings,
        project_analyses=project_analyses
    )
    
    limitations = [
        "Assessment is grounded strictly in the provided resume document. Omitted background, private GitHub repositories, or undocumented accomplishments cannot be evaluated.",
        "Indirect matches indicate relevant technical proximity and conceptual transferability, not guaranteed proficiency.",
        "Scoring evaluates alignment between resume evidence and JD requirements, and should serve as an objective screening aid rather than an automated hiring decision."
    ]
    
    created_at = datetime.utcnow().isoformat()
    
    response = AnalysisResponse(
        id=analysis_id,
        resume_id=resume_id,
        job_description_id=job_description_id,
        owner_id=owner_id,
        candidate_name=candidate_name,
        resume_file_name=resume_file_name,
        job_title=job_title,
        company_name=company_name,
        overall_score=overall_score,
        score_breakdown=score_breakdown,
        requirements_matrix=matrix,
        direct_findings=direct_findings,
        indirect_findings=indirect_findings,
        project_analyses=project_analyses,
        missing_requirements=missing,
        recommendations=recommendations,
        interview_questions=interview_questions,
        analysis_limitations=limitations,
        created_at=created_at
    )
    
    # Persist in SQLite
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT OR REPLACE INTO resume_analyses (
            id, resume_id, job_description_id, owner_id,
            candidate_name, resume_file_name, job_title, company_name,
            overall_score, score_breakdown, requirements_matrix,
            direct_findings, indirect_findings, project_analyses,
            missing_requirements, recommendations, interview_questions,
            analysis_limitations, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        response.id,
        response.resume_id,
        response.job_description_id,
        response.owner_id,
        response.candidate_name,
        response.resume_file_name,
        response.job_title,
        response.company_name,
        response.overall_score,
        json.dumps(response.score_breakdown.model_dump()),
        json.dumps([m.model_dump() for m in response.requirements_matrix]),
        json.dumps([d.model_dump() for d in response.direct_findings]),
        json.dumps([i.model_dump() for i in response.indirect_findings]),
        json.dumps([p.model_dump() for p in response.project_analyses]),
        json.dumps(response.missing_requirements),
        json.dumps(response.recommendations.model_dump()),
        json.dumps([q.model_dump() for q in response.interview_questions]),
        json.dumps(response.analysis_limitations),
        response.created_at
    ))
    conn.commit()
    conn.close()
    
    return response
