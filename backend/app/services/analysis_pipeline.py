import uuid
import json
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional, Tuple

from ..models.schemas import (
    ExtractedResumeData, JDRequirement, DirectFinding,
    IndirectFinding, RequirementMatrixItem, ProjectAnalysisItem,
    ScoreBreakdown, RecommendationsSection, InterviewQuestion,
    AnalysisResponse, CompanyIntelligence
)
from .direct_matcher import evaluate_direct_matching
from .indirect_discoverer import discover_indirect_skills
from .project_analyzer import evaluate_all_projects
from .scoring_engine import calculate_explainable_score, is_fresher_job
from .recommendation_engine import generate_recommendations
from .interview_generator import generate_interview_questions
from .company_intelligence import generate_company_intelligence
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
        indirect_text = "No direct evidence"
        status = "Not evidenced"
        confidence = "Low"
        score_contrib = 0.0
        excerpt = None
        source_sec = None
        
        if df:
            source_sec = df.resume_section
            excerpt = df.supporting_excerpt
            if df.resume_section == "Skills":
                direct_ev_text = "Declared competency in Technical Skills"
                status = "Supported"
                confidence = "High"
                score_contrib = 0.90
            elif df.resume_section == "Projects":
                proj_ev_text = f"Demonstrated in project ({df.strength_of_evidence})"
                status = "Supported"
                confidence = "High"
                score_contrib = 0.90
            elif df.resume_section == "Work Experience":
                direct_ev_text = f"Applied in professional role ({df.strength_of_evidence})"
                status = "Supported"
                confidence = "High"
                score_contrib = 1.0
            elif df.resume_section == "Certifications":
                direct_ev_text = "Verified Certification"
                status = "Supported"
                confidence = "High"
                score_contrib = 0.85
                
        if inf:
            indirect_text = f"{inf.related_technology_or_activity} ({inf.confidence_level} confidence)"
            if not excerpt:
                excerpt = inf.supporting_excerpt
                source_sec = inf.source_project_or_experience
            if status in ["Not evidenced"]:
                status = "Project-derived" if "Project" in inf.source_project_or_experience else "Transferable"
                confidence = inf.confidence_level
                score_contrib = 0.85 if confidence == "High" else 0.70
                
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
    """Execute complete HR-calibrated multi-stage analysis pipeline and persist results."""
    
    # Identify role level (Fresher / Junior vs Experienced)
    is_fresher = is_fresher_job(job_title, requirements)
    role_level = "Fresher / Early-Career" if is_fresher else "Experienced / Mid-Senior"

    # Stage 3: Direct Skill Matching (respects declared skills in skills inventory)
    direct_findings = evaluate_direct_matching(requirements, resume_data)
    direct_matched_set = {f.requirement_name for f in direct_findings}
    
    # Stage 4: Indirect Skill Discovery (deduces web stack, AI engineering, ecosystems)
    indirect_findings = discover_indirect_skills(requirements, resume_data, direct_matched_set)
    
    # Stage 5: Project-Level Technical Analysis
    project_analyses = evaluate_all_projects(resume_data.projects, requirements)
    
    # Requirement Matrix
    matrix = build_requirement_matrix(requirements, direct_findings, indirect_findings)
    
    # Stage 6: Deterministic Explainable Scoring (adapted for role level)
    overall_score, score_breakdown = calculate_explainable_score(
        requirements=requirements,
        resume_data=resume_data,
        direct_findings=direct_findings,
        indirect_findings=indirect_findings,
        project_analyses=project_analyses,
        job_title=job_title,
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
    
    # Company Intelligence (hiring culture & reviews)
    company_intel = generate_company_intelligence(company_name)

    limitations = [
        "Assessment evaluates alignment between resume evidence and JD requirements as an objective screening aid.",
        "Skills stated in the technical skills inventory are respected as claimed competencies.",
        "Indirect findings reflect verified technical deductions and framework ecosystems."
    ]
    
    created_at = datetime.now(timezone.utc).isoformat()
    
    # Experience intelligence & creative summary
    from .experience_analyzer import (
        extract_jd_experience,
        extract_resume_experience,
        assess_experience,
        generate_creative_summary
    )
    
    conn = get_connection()
    jd_row = conn.execute("SELECT description FROM job_descriptions WHERE id = ?", (job_description_id,)).fetchone()
    resume_row = conn.execute("SELECT extracted_text FROM resumes WHERE id = ?", (resume_id,)).fetchone()
    conn.close()
    
    jd_desc = jd_row["description"] if jd_row else ""
    resume_raw = resume_row["extracted_text"] if resume_row else (resume_data.professional_summary or "")
    
    req_years = extract_jd_experience(jd_desc, requirements, job_title)
    found_years = extract_resume_experience(resume_data, resume_raw)
    exp_assessment = assess_experience(req_years, found_years)
    creative_summary = generate_creative_summary(overall_score, req_years, found_years, candidate_name)

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
        created_at=created_at,
        company_intel=company_intel,
        role_level=role_level,
        years_experience_required=req_years,
        years_experience_found=found_years,
        experience_assessment=exp_assessment,
        creative_summary=creative_summary
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
