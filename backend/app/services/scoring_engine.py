from typing import List, Dict, Any, Tuple
from ..models.schemas import (
    JDRequirement, ExtractedResumeData, DirectFinding,
    IndirectFinding, ProjectAnalysisItem, ScoreBreakdown
)
from ..config import DEFAULT_SCORING_WEIGHTS

def get_interpretation_label(score: float) -> str:
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
    custom_weights: Dict[str, float] = None
) -> Tuple[float, ScoreBreakdown]:
    """
    Deterministic explainable weighted scoring model conforming strictly to Section 4.
    Weights sum to 1.0. Overall score is strictly:
    Overall Score = 10 * sum(Dimension Score * Dimension Weight)
    """
    weights = custom_weights or DEFAULT_SCORING_WEIGHTS.copy()
    
    # Ensure weights sum to 1.0
    total_w = sum(weights.values())
    if abs(total_w - 1.0) > 0.001 and total_w > 0:
        weights = {k: v / total_w for k, v in weights.items()}
        
    direct_dict = {f.requirement_name.lower(): f for f in direct_findings}
    indirect_dict = {f.requirement_name.lower(): f for f in indirect_findings}
    
    mandatory_reqs = [r for r in requirements if r.importance.lower() == "mandatory"]
    preferred_reqs = [r for r in requirements if r.importance.lower() != "mandatory"]
    domain_reqs = [r for r in requirements if "domain" in r.category.lower()]
    core_reqs = [r for r in requirements if "core" in r.category.lower() or "framework" in r.category.lower() or "programming" in r.category.lower()]
    
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
                    mand_points += 0.8
                elif df.strength_of_evidence == "Limited":
                    mand_points += 0.5
                else:  # Unverified
                    mand_points += 0.35
            elif r_low in indirect_dict:
                inf = indirect_dict[r_low]
                mand_points += 0.75 if inf.confidence_level == "High" else 0.5
        mand_dim = mand_points / len(mandatory_reqs)
    else:
        mand_dim = 0.8
        
    # 2. Core Technical Skills & Related Tech Dimension (0.0 to 1.0)
    eval_core = core_reqs if core_reqs else requirements
    if eval_core:
        core_points = 0.0
        for r in eval_core:
            r_low = r.skill.lower()
            if r_low in direct_dict:
                core_points += 1.0 if direct_dict[r_low].strength_of_evidence in ["Strong", "Moderate"] else 0.6
            elif r_low in indirect_dict:
                core_points += 0.8
        core_dim = core_points / len(eval_core)
    else:
        core_dim = 0.75
        
    # 3. Project Relevance & Depth Dimension (0.0 to 1.0)
    if project_analyses:
        avg_proj_relevance = sum(p.jd_relevance_score for p in project_analyses) / len(project_analyses)
        # Normalize 0-10 to 0.0-1.0
        proj_dim = min(max(avg_proj_relevance / 10.0, 0.0), 1.0)
    else:
        proj_dim = 0.2
        
    # 4. Relevant Experience & Application Dimension (0.0 to 1.0)
    exp_count = len(resume_data.work_experience)
    exp_bullets = sum(len(e.get("bullets", [])) for e in resume_data.work_experience)
    if exp_count >= 2 and exp_bullets >= 4:
        exp_dim = 0.95
    elif exp_count >= 1 and exp_bullets >= 2:
        exp_dim = 0.75
    elif exp_count >= 1:
        exp_dim = 0.55
    else:
        # Candidate might have substantial academic/personal projects instead
        exp_dim = 0.4 if project_analyses else 0.2
        
    # 5. Role-Specific Domain Knowledge Dimension (0.0 to 1.0)
    if domain_reqs:
        dom_points = 0.0
        for r in domain_reqs:
            r_low = r.skill.lower()
            if r_low in direct_dict or r_low in indirect_dict:
                dom_points += 1.0
        dom_dim = dom_points / len(domain_reqs)
    else:
        # Check if project analyses demonstrate technical domains
        dom_dim = 0.85 if any(p.technical_concepts for p in project_analyses) else 0.5
        
    # 6. Other Relevant Qualifications Dimension (0.0 to 1.0)
    other_dim = 0.5
    if resume_data.education:
        other_dim += 0.25
    if resume_data.certifications:
        other_dim += 0.25
    other_dim = min(other_dim, 1.0)
    
    # Calculate Overall Score: 10 * sum(Dimension * Weight)
    overall_score = 10.0 * (
        (mand_dim * weights.get("mandatory_technical_skills", 0.30)) +
        (core_dim * weights.get("core_technical_skills", 0.20)) +
        (proj_dim * weights.get("project_relevance_depth", 0.20)) +
        (exp_dim * weights.get("relevant_experience", 0.15)) +
        (dom_dim * weights.get("domain_knowledge", 0.10)) +
        (other_dim * weights.get("other_qualifications", 0.05))
    )
    overall_score = round(min(max(overall_score, 0.0), 10.0), 1)
    
    # Evidence Coverage Calculation
    total_req_count = len(requirements)
    evidenced_count = sum(
        1 for r in requirements
        if r.skill.lower() in direct_dict or r.skill.lower() in indirect_dict
    )
    coverage_pct = round((evidenced_count / total_req_count * 100.0) if total_req_count else 0.0, 1)
    
    # Confidence Level
    if coverage_pct >= 75.0 and len(direct_findings) >= 3:
        confidence = "High"
    elif coverage_pct >= 45.0:
        confidence = "Medium"
    else:
        confidence = "Low"
        
    # Factors
    pos_factors = []
    neg_factors = []
    unverified_reqs = []
    
    for r in requirements:
        r_name = r.skill
        r_low = r_name.lower()
        if r_low in direct_dict:
            df = direct_dict[r_low]
            if df.strength_of_evidence in ["Strong", "Moderate"]:
                pos_factors.append(f"Strong evidence for {r_name} in {df.resume_section}.")
            else:
                unverified_reqs.append(f"{r_name} (claimed in skills but unverified in work/projects)")
        elif r_low in indirect_dict:
            inf = indirect_dict[r_low]
            pos_factors.append(f"Indirectly demonstrated {r_name} via {inf.related_technology_or_activity} in {inf.source_project_or_experience}.")
        else:
            neg_factors.append(f"No direct or project evidence found for {r_name} ({r.importance}).")
            if r.importance.lower() == "mandatory":
                unverified_reqs.append(r_name)
                
    breakdown = ScoreBreakdown(
        overall_score=overall_score,
        mandatory_skills_score=round(mand_dim * 10.0, 1),
        core_technical_skills_score=round(core_dim * 10.0, 1),
        project_relevance_score=round(proj_dim * 10.0, 1),
        experience_implementation_score=round(exp_dim * 10.0, 1),
        domain_knowledge_score=round(dom_dim * 10.0, 1),
        other_qualifications_score=round(other_dim * 10.0, 1),
        evidence_coverage_percent=coverage_pct,
        analysis_confidence=confidence,
        score_interpretation=get_interpretation_label(overall_score),
        key_positive_factors=pos_factors[:4],
        key_negative_factors=neg_factors[:4],
        unverified_requirements=unverified_reqs,
        dimension_weights=weights
    )
    
    return overall_score, breakdown
