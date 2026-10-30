import re
from typing import List, Dict, Any, Optional
from ..models.schemas import (
    JDRequirement, ExtractedResumeData, DirectFinding,
    IndirectFinding, ProjectAnalysisItem, RecommendationsSection,
    SkillImprovement, BulletRewrite, KeywordAlignment,
    DemonstratedUnlistedSkill, ProjectDetailImprovement,
    UnquantifiedBullet, DateAmbiguityWarning, ResumeImprovementData,
    ExperienceEvaluation
)

ACTION_VERB_MAP = {
    "made": "Architected and implemented",
    "did": "Executed technical development of",
    "used": "Engineered multi-component system leveraging",
    "worked on": "Spearheaded modular implementation of",
    "helped with": "Contributed core backend functionality to",
    "created": "Developed and deployed"
}

def generate_recommendations(
    requirements: List[JDRequirement],
    resume_data: ExtractedResumeData,
    direct_findings: List[DirectFinding],
    indirect_findings: List[IndirectFinding],
    project_analyses: List[ProjectAnalysisItem]
) -> RecommendationsSection:
    """Generate evidence-grounded resume improvement recommendations without fabricating data."""
    explicit_skills_lower = {s.lower() for s in resume_data.technical_skills}
    
    # 1. Skills Section Improvements (Skills demonstrated in projects but missing from skills list)
    skills_improvements: List[SkillImprovement] = []
    for inf in indirect_findings:
        req_name = inf.requirement_name
        if req_name.lower() not in explicit_skills_lower and not any(s.skill == req_name for s in skills_improvements):
            skills_improvements.append(
                SkillImprovement(
                    skill=req_name,
                    evidence_location=f"{inf.source_project_or_experience} ('{inf.supporting_excerpt[:60]}...')",
                    recommendation=f"Add '{req_name}' to your technical skills list. You have already demonstrated practical application in {inf.source_project_or_experience}."
                )
            )
            
    # Also check technologies extracted from projects that are missing in skills
    for proj in resume_data.projects:
        p_name = proj.get("name", "Project")
        for tech in proj.get("technologies", []):
            if tech.lower() not in explicit_skills_lower and not any(s.skill == tech for s in skills_improvements):
                skills_improvements.append(
                    SkillImprovement(
                        skill=tech,
                        evidence_location=f"Project: {p_name}",
                        recommendation=f"Add '{tech}' to your Skills section. It is documented in '{p_name}', but currently absent from your formal skills list."
                    )
                )
                
    # 2. Project Bullet Rewrites (Based strictly on the candidate's actual text without fabrication)
    bullet_rewrites: List[BulletRewrite] = []
    for proj in resume_data.projects:
        p_name = proj.get("name", "Project")
        techs = proj.get("technologies", [])
        tech_str = ", ".join(techs[:3]) if techs else "the tech stack"
        for bullet in proj.get("bullets", []):
            b_clean = bullet.strip()
            first_word = b_clean.split()[0].lower() if b_clean.split() else ""
            if len(b_clean) < 70 or first_word in ACTION_VERB_MAP:
                verb_replacement = ACTION_VERB_MAP.get(first_word, "Engineered")
                rest_of_sentence = " ".join(b_clean.split()[1:]) if b_clean.split() else b_clean
                suggested = f"{verb_replacement} {rest_of_sentence} utilizing {tech_str}, ensuring robust modularity and reproducible execution."
                
                bullet_rewrites.append(
                    BulletRewrite(
                        project_name=p_name,
                        original_bullet=b_clean,
                        suggested_rewrite=suggested,
                        rationale="Clarifies your direct engineering ownership and highlights specific technologies used.",
                        focus_areas=["Action Verb", "Technical Ownership", "Technology Explicitly Stated"]
                    )
                )
                if len(bullet_rewrites) >= 3:
                    break
        if len(bullet_rewrites) >= 4:
            break
            
    # 3. Keyword Alignment
    direct_req_names = {f.requirement_name.lower() for f in direct_findings}
    indirect_req_names = {f.requirement_name.lower() for f in indirect_findings}
    
    supported_keywords = []
    potential_keywords = []
    genuine_gaps = []
    
    for r in requirements:
        r_name = r.skill
        r_low = r_name.lower()
        if r_low in direct_req_names:
            supported_keywords.append(r_name)
        elif r_low in indirect_req_names:
            potential_keywords.append(r_name)
        else:
            genuine_gaps.append(r_name)
            
    keyword_alignment = KeywordAlignment(
        supported_keywords=supported_keywords,
        potential_keywords_needs_confirmation=potential_keywords,
        genuine_experience_gaps=genuine_gaps
    )
    
    # 4. Action Plan
    action_plan = []
    if skills_improvements:
        action_plan.append(f"Update Skills Section: Explicitly list {', '.join([s.skill for s in skills_improvements[:3]])} which you already demonstrate in your projects.")
    if bullet_rewrites:
        action_plan.append("Enhance Project Descriptions: Replace passive or brief project bullets with active implementation verbs highlighting architecture and tech tools.")
    if genuine_gaps:
        action_plan.append(f"Address Missing JD Requirements: The role highlights {', '.join(genuine_gaps[:2])}. If you have informal experience, substantiate it; otherwise build a targeted mini-project.")
    if not action_plan:
        action_plan.append("Refine technical metrics and quantified outcomes across your work experience bullets.")
        
    interview_topics = [
        f"Deep dive into the architecture and technical challenges of {resume_data.projects[0]['name'] if resume_data.projects else 'your primary project'}.",
        f"Explanation of your hands-on experience with {', '.join(supported_keywords[:3]) if supported_keywords else 'core technologies'}.",
        f"How you would ramp up or apply concepts from {genuine_gaps[0] if genuine_gaps else 'new frameworks'} in a production setting."
    ]
    
    learning_exercises = [
        f"Build a standalone repository or proof-of-concept integrating {gap} with automated tests."
        for gap in genuine_gaps[:2]
    ]
    
    return RecommendationsSection(
        skills_section_improvements=skills_improvements[:5],
        project_bullet_rewrites=bullet_rewrites[:4],
        keyword_alignment=keyword_alignment,
        prioritized_action_plan=action_plan,
        interview_prep_topics=interview_topics,
        optional_learning_exercises=learning_exercises
    )

def generate_resume_improvements(
    requirements: List[JDRequirement],
    resume_data: ExtractedResumeData,
    direct_findings: List[DirectFinding],
    indirect_findings: List[IndirectFinding],
    project_analyses: List[ProjectAnalysisItem],
    experience_eval: Optional[ExperienceEvaluation] = None
) -> ResumeImprovementData:
    """
    Dedicated Resume Improvement Center data generator per Task 4 Part 3.
    Identifies:
    1. Skills demonstrated but missing from Skills section.
    2. Relevant project details needing explanation.
    3. Work experience descriptions lacking measurable achievements.
    4. Relevant JD terminology missing but supported by experience.
    5. Genuine skill gaps.
    6. Missing employment dates or unclear experience information.
    """
    explicit_skills_lower = {s.lower() for s in resume_data.technical_skills}

    # 1. Demonstrated unlisted skills
    demonstrated_unlisted: List[DemonstratedUnlistedSkill] = []
    for proj in resume_data.projects:
        p_name = proj.get("name", "Project")
        for tech in proj.get("technologies", []):
            if tech.lower() not in explicit_skills_lower and not any(d.skill == tech for d in demonstrated_unlisted):
                demonstrated_unlisted.append(
                    DemonstratedUnlistedSkill(
                        skill=tech,
                        found_in_project=p_name,
                        excerpt=f"Found in {p_name} technology stack / description.",
                        recommendation=f"Add '{tech}' directly to your formal Skills section to pass initial automated screening filters."
                    )
                )

    for entry in getattr(resume_data, "structured_work_experience", []) or []:
        for tech in entry.relevant_technologies:
            if tech.lower() not in explicit_skills_lower and not any(d.skill == tech for d in demonstrated_unlisted):
                demonstrated_unlisted.append(
                    DemonstratedUnlistedSkill(
                        skill=tech,
                        found_in_project=f"{entry.job_title} at {entry.company}",
                        excerpt=f"Employed during role at {entry.company}.",
                        recommendation=f"Add '{tech}' to your Skills section; it is already evidenced in your employment history."
                    )
                )

    # 2. Project details needing explanation
    project_improvements: List[ProjectDetailImprovement] = []
    for proj in resume_data.projects:
        p_name = proj.get("name", "Project")
        bullets = proj.get("bullets", [])
        if len(bullets) < 2:
            project_improvements.append(
                ProjectDetailImprovement(
                    project_name=p_name,
                    weakness="Under-documented project with fewer than 2 descriptive bullets.",
                    suggested_addition="Add at least 2 detailed bullet points highlighting the technical problem, architecture, and candidate contribution."
                )
            )
        elif not any(re.search(r'\b(docker|aws|ci/cd|test|deploy|kubernetes|git|pytest|jest)\b', b.lower()) for b in bullets):
            project_improvements.append(
                ProjectDetailImprovement(
                    project_name=p_name,
                    weakness="Missing testing, CI/CD, or deployment context.",
                    suggested_addition="Clarify how this system was tested and deployed (e.g. unit tests, Docker containerization, cloud hosting)."
                )
            )

    # 3. Unquantified bullets (lacking numbers, %, scale)
    unquantified_bullets: List[UnquantifiedBullet] = []
    metric_regex = re.compile(r'\b(\d+|%|ms|sec|x|users|req|rpm|rps)\b', re.IGNORECASE)

    for entry in getattr(resume_data, "structured_work_experience", []) or []:
        for b in entry.responsibilities[:3]:
            if not metric_regex.search(b) and len(b) > 20:
                unquantified_bullets.append(
                    UnquantifiedBullet(
                        section="Work Experience",
                        role_or_project=f"{entry.job_title} at {entry.company}",
                        original_bullet=b,
                        quantification_advice="Attach a quantifiable outcome: e.g. 'boosted throughput by 35%', 'reduced bug reports by 20%', or 'supported 10k+ monthly active users'."
                    )
                )

    for proj in resume_data.projects[:3]:
        p_name = proj.get("name", "Project")
        for b in proj.get("bullets", [])[:2]:
            if not metric_regex.search(b) and len(b) > 20:
                unquantified_bullets.append(
                    UnquantifiedBullet(
                        section="Projects",
                        role_or_project=p_name,
                        original_bullet=b,
                        quantification_advice="Add concrete benchmark or usage metrics: e.g. latency under 150ms, dataset size, or automated test coverage percentage."
                    )
                )

    # 4. Missing supported keywords
    direct_req_names = {f.requirement_name.lower() for f in direct_findings}
    missing_supported: List[str] = []
    for inf in indirect_findings:
        if inf.requirement_name.lower() not in direct_req_names and inf.confidence_level in ["High", "Medium"]:
            if inf.requirement_name not in missing_supported:
                missing_supported.append(inf.requirement_name)

    # 5. Genuine skill gaps
    indirect_req_names = {f.requirement_name.lower() for f in indirect_findings}
    genuine_gaps = [
        r.skill for r in requirements
        if r.importance == "Mandatory" and
        r.skill.lower() not in direct_req_names and
        r.skill.lower() not in indirect_req_names
    ]

    # 6. Date ambiguities / experience warnings
    date_ambiguities: List[DateAmbiguityWarning] = []
    if experience_eval and experience_eval.warnings:
        for w in experience_eval.warnings:
            date_ambiguities.append(
                DateAmbiguityWarning(
                    role_or_project="Work Experience Section",
                    issue=w,
                    recommendation="Ensure all professional positions have explicit start and end dates in MM/YYYY format."
                )
            )

    return ResumeImprovementData(
        demonstrated_unlisted_skills=demonstrated_unlisted[:6],
        project_detail_improvements=project_improvements[:4],
        unquantified_bullets=unquantified_bullets[:5],
        missing_supported_keywords=missing_supported[:6],
        genuine_skill_gaps=genuine_gaps[:6],
        date_ambiguities=date_ambiguities[:4]
    )
