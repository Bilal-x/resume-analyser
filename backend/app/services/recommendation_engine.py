from typing import List, Dict, Any
from ..models.schemas import (
    JDRequirement, ExtractedResumeData, DirectFinding,
    IndirectFinding, ProjectAnalysisItem, RecommendationsSection,
    SkillImprovement, BulletRewrite, KeywordAlignment
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
            # If bullet is short or starts with a weak word
            first_word = b_clean.split()[0].lower() if b_clean.split() else ""
            if len(b_clean) < 70 or first_word in ACTION_VERB_MAP:
                verb_replacement = ACTION_VERB_MAP.get(first_word, "Engineered")
                
                # Build rewrite grounded in their actual text
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
            
    # 3. Keyword Alignment (Supported vs Needs Confirmation vs Genuine Gaps)
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
    
    # 4. Prioritized Action Plan
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
