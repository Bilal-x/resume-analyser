from typing import List, Dict, Any, Tuple, Optional
from ..models.schemas import (
    JDRequirement, ExtractedResumeData, DirectFinding,
    IndirectFinding, ProjectAnalysisItem, ScoreBreakdown,
    ExperienceEvaluation
)
from ..config import DEFAULT_SCORING_WEIGHTS

def is_fresher_job(job_title: str, requirements: List[JDRequirement]) -> bool:
    """Detect whether this role is targeted at freshers, interns, or junior engineers."""
    title_low = job_title.lower() if job_title else ""
    fresher_indicators = [
        "fresher", "intern", "internship", "graduate", "entry level", "entry-level",
        "junior", "jr", "associate", "trainee", "campus", "apprentice"
    ]
    if any(ind in title_low for ind in fresher_indicators):
        return True
        
    # Check requirement minimum experience
    avg_exp = [r.minimum_experience_years for r in requirements if r.minimum_experience_years is not None]
    if avg_exp and max(avg_exp) <= 1.0:
        return True
        
    return False

def get_interpretation_label(score: float, is_fresher: bool = False) -> str:
    if score >= 9.0:
        return "Very Strong Alignment"
    elif score >= 7.5:
        return "Strong Alignment"
    elif score >= 6.0:
        return "Moderate Alignment"
    elif score >= 4.0:
        return "Partial Alignment"
    else:
        return "Limited Demonstrated Alignment"

def calculate_explainable_score(
    requirements: List[JDRequirement],
    resume_data: ExtractedResumeData,
    direct_findings: List[DirectFinding],
    indirect_findings: List[IndirectFinding],
    project_analyses: List[ProjectAnalysisItem],
    job_title: str = "",
    custom_weights: Dict[str, float] = None,
    experience_eval: Optional[ExperienceEvaluation] = None
) -> Tuple[float, ScoreBreakdown]:
    """
    Deterministic explainable weighted scoring model calibrated to real HR evaluation practices.
    Differentiates between Fresher / Junior vs Experienced job expectations.
    
    RULE 1.6 & 6.12: When professional experience is missing or not available,
    the experience dimension is excluded from scoring and its weight is proportionally
    redistributed among remaining dimensions without penalizing the candidate with zero points.
    """
    is_fresher = is_fresher_job(job_title, requirements)
    
    # Adaptive HR weights based on role level
    if custom_weights:
        weights = custom_weights.copy()
    elif is_fresher:
        weights = {
            "mandatory_technical_skills": 0.25,
            "core_technical_skills": 0.30,
            "project_relevance_depth": 0.35,
            "relevant_experience_application": 0.10,
        }
    else:
        weights = {
            "mandatory_technical_skills": 0.30,
            "core_technical_skills": 0.25,
            "project_relevance_depth": 0.25,
            "relevant_experience_application": 0.20,
        }
    
    # Check if experience dimension should be excluded and weight redistributed
    exclude_experience = False
    if experience_eval is not None:
        if (
            experience_eval.is_excluded_from_scoring or
            experience_eval.experience_status in ["not_available", "unable_to_verify"] or
            experience_eval.total_experience_months is None
        ):
            exclude_experience = True

    if exclude_experience:
        # Exclude relevant_experience_application and redistribute weight proportionally
        rem_weights = {k: v for k, v in weights.items() if k != "relevant_experience_application"}
        rem_sum = sum(rem_weights.values())
        if rem_sum > 0:
            weights = {k: v / rem_sum for k, v in rem_weights.items()}
        weights["relevant_experience_application"] = 0.0
    else:
        # Ensure weights sum to 1.0
        total_w = sum(weights.values())
        if total_w > 0:
            weights = {k: v / total_w for k, v in weights.items()}
        
    direct_dict = {f.requirement_name.lower(): f for f in direct_findings}
    indirect_dict = {f.requirement_name.lower(): f for f in indirect_findings}
    
    mandatory_reqs = [r for r in requirements if r.importance.lower() == "mandatory"]
    core_reqs = [r for r in requirements if "core" in r.category.lower() or "framework" in r.category.lower() or "programming" in r.category.lower()]
    eval_core = core_reqs if core_reqs else requirements
    
    # 1. Mandatory Technical Skills Dimension (0.0 to 1.0)
    if mandatory_reqs:
        mand_points = 0.0
        for r in mandatory_reqs:
            r_low = r.skill.lower()
            if r_low in direct_dict:
                df = direct_dict[r_low]
                if df.strength_of_evidence == "Strong":
                    mand_points += 1.0
                elif df.strength_of_evidence == "Moderate":
                    mand_points += 0.90
                elif df.strength_of_evidence == "Declared":
                    # Directly declared in Skills: Full credit for freshers, high credit for experienced
                    mand_points += 1.0 if is_fresher else 0.88
                elif df.strength_of_evidence == "Limited":
                    mand_points += 0.70
                else:
                    mand_points += 0.60
            elif r_low in indirect_dict:
                inf = indirect_dict[r_low]
                mand_points += 0.85 if inf.confidence_level == "High" else 0.70
        mand_dim = min(mand_points / len(mandatory_reqs), 1.0)
    else:
        mand_dim = 0.90
        
    # 2. Core Technical Skills & Related Tech Dimension (0.0 to 1.0)
    if eval_core:
        core_points = 0.0
        for r in eval_core:
            r_low = r.skill.lower()
            if r_low in direct_dict:
                df = direct_dict[r_low]
                if df.strength_of_evidence in ["Strong", "Moderate", "Declared"]:
                    core_points += 1.0
                else:
                    core_points += 0.75
            elif r_low in indirect_dict:
                core_points += 0.85
        core_dim = min(core_points / len(eval_core), 1.0)
    else:
        core_dim = 0.85
        
    # 3. Project Relevance & Depth Dimension (0.0 to 1.0)
    if project_analyses:
        avg_proj_relevance = sum(p.jd_relevance_score for p in project_analyses) / len(project_analyses)
        # Scale to 0.0 - 1.0 with a generous baseline for active projects
        proj_dim = min(max(avg_proj_relevance / 10.0, 0.35), 1.0)
    elif resume_data.projects:
        proj_dim = 0.75
    else:
        proj_dim = 0.40 if is_fresher else 0.25
        
    # 4. Relevant Experience & Application Dimension (0.0 to 1.0)
    if exclude_experience:
        exp_dim = 0.0
    elif experience_eval is not None:
        if experience_eval.experience_status == "meets_requirement":
            exp_dim = 1.0
        elif experience_eval.experience_status == "partially_meets_requirement":
            exp_dim = 0.75
        elif experience_eval.experience_status == "does_not_meet_requirement":
            gap = experience_eval.experience_gap_months or 12
            req_m = int((experience_eval.jd_required_years or 1.0) * 12)
            exp_dim = max(0.25, min(0.65, 1.0 - (gap / (req_m if req_m > 0 else 12))))
        else:
            exp_dim = 0.50
    else:
        # Fallback heuristic
        exp_count = len(resume_data.work_experience)
        proj_count = len(resume_data.projects)
        if is_fresher:
            if exp_count >= 1 or proj_count >= 2:
                exp_dim = 0.95
            elif proj_count >= 1:
                exp_dim = 0.80
            else:
                exp_dim = 0.60
        else:
            exp_bullets = sum(len(e.get("bullets", [])) for e in resume_data.work_experience)
            if exp_count >= 2 and exp_bullets >= 4:
                exp_dim = 0.95
            elif exp_count >= 1 and exp_bullets >= 2:
                exp_dim = 0.80
            elif exp_count >= 1:
                exp_dim = 0.65
            else:
                exp_dim = 0.45 if proj_count >= 2 else 0.30
            
    # Calculate weighted overall score (0.0 to 10.0)
    if exclude_experience:
        raw_score = (
            (mand_dim * weights.get("mandatory_technical_skills", 0.0)) +
            (core_dim * weights.get("core_technical_skills", 0.0)) +
            (proj_dim * weights.get("project_relevance_depth", 0.0))
        ) * 10.0
    else:
        raw_score = (
            (mand_dim * weights.get("mandatory_technical_skills", 0.30)) +
            (core_dim * weights.get("core_technical_skills", 0.25)) +
            (proj_dim * weights.get("project_relevance_depth", 0.25)) +
            (exp_dim * weights.get("relevant_experience_application", 0.20))
        ) * 10.0
    
    overall_score = round(min(max(raw_score, 0.0), 10.0), 1)
    
    # Evidence coverage
    total_req_count = len(requirements) if requirements else 1
    evidenced_count = len(direct_findings) + len(indirect_findings)
    coverage_pct = round(min((evidenced_count / total_req_count) * 100.0, 100.0), 1)
    
    interpretation = get_interpretation_label(overall_score, is_fresher)
    confidence = "High" if (coverage_pct >= 75.0 or len(direct_findings) >= 2) else "Medium"
    
    # Positive and negative factors
    positives = []
    if exclude_experience:
        positives.append("Work experience section was not available; experience dimension weight was redistributed to skills and projects.")
    if is_fresher:
        positives.append("Role evaluated against entry-level / junior hiring benchmarks.")
    if mand_dim >= 0.8:
        positives.append(f"Strong coverage across mandatory technical prerequisites ({round(mand_dim*100)}%).")
    if direct_dict:
        positives.append(f"{len(direct_dict)} key technical requirements directly verified in profile.")
    if indirect_dict:
        positives.append(f"{len(indirect_dict)} competencies evidenced through projects and implied frameworks.")
    if len(resume_data.projects) >= 2:
        positives.append(f"Multiple demonstrated technical projects ({len(resume_data.projects)}) showcasing practical development.")

    negatives = []
    missing_mandatory = [r.skill for r in mandatory_reqs if r.skill.lower() not in direct_dict and r.skill.lower() not in indirect_dict]
    if missing_mandatory:
        negatives.append(f"Mandatory requirements without direct evidence: {', '.join(missing_mandatory[:3])}")
    if not is_fresher and not exclude_experience and exp_dim < 0.6:
        negatives.append("Documented professional experience falls below target expectations for this role.")

    score_breakdown = ScoreBreakdown(
        overall_score=overall_score,
        mandatory_skills_score=round(mand_dim * 10.0, 1),
        core_technical_skills_score=round(core_dim * 10.0, 1),
        project_relevance_score=round(proj_dim * 10.0, 1),
        experience_implementation_score=round(exp_dim * 10.0, 1) if not exclude_experience else 0.0,
        domain_knowledge_score=round(((mand_dim + core_dim) / 2.0) * 10.0, 1),
        other_qualifications_score=round(exp_dim * 10.0, 1) if not exclude_experience else 0.0,
        evidence_coverage_percent=coverage_pct,
        analysis_confidence=confidence,
        score_interpretation=interpretation,
        key_positive_factors=positives,
        key_negative_factors=negatives,
        unverified_requirements=[],
        dimension_weights=weights
    )
    
    return overall_score, score_breakdown
