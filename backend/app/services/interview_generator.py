from typing import List, Dict, Any
from ..models.schemas import (
    JDRequirement, ExtractedResumeData, DirectFinding,
    IndirectFinding, ProjectAnalysisItem, InterviewQuestion
)

def generate_interview_questions(
    requirements: List[JDRequirement],
    resume_data: ExtractedResumeData,
    direct_findings: List[DirectFinding],
    indirect_findings: List[IndirectFinding],
    project_analyses: List[ProjectAnalysisItem]
) -> List[InterviewQuestion]:
    """
    Generate evidence-based technical interview questions conforming to Section 9.
    Validates implementation depth, verifies transferable claims, and investigates unverified requirements.
    """
    questions: List[InterviewQuestion] = []
    
    # 1. Questions targeting Project-Level Deep Implementation
    for p in project_analyses[:2]:
        p_name = p.project_name
        techs = ", ".join(p.technologies_mentioned[:3]) if p.technologies_mentioned else "the core stack"
        excerpt = p.supporting_excerpts[0] if p.supporting_excerpts else p_name
        
        questions.append(
            InterviewQuestion(
                question=f"In your project '{p_name}', you utilized {techs}. Can you describe the system architecture, how data flowed between components, and a difficult technical bug you solved during development?",
                purpose_reason="Validate individual implementation ownership, debugging capability, and architectural comprehension.",
                related_jd_requirement=f"System Architecture & {techs}",
                resume_evidence=f"Project '{p_name}': {excerpt}",
                evaluation_criteria="Candidate clearly explains internal data flow, component boundaries, trade-offs made, and demonstrates genuine individual ownership."
            )
        )
        
    # 2. Questions targeting Indirect / Inferred capabilities
    for inf in indirect_findings[:2]:
        questions.append(
            InterviewQuestion(
                question=f"Your experience demonstrates hands-on work with {inf.related_technology_or_activity} in {inf.source_project_or_experience}. How would you translate those principles when working with {inf.requirement_name} in our production environment?",
                purpose_reason=f"Assess transferability of knowledge from {inf.related_technology_or_activity} to the target role's {inf.requirement_name} requirement.",
                related_jd_requirement=inf.requirement_name,
                resume_evidence=f"{inf.source_project_or_experience}: '{inf.supporting_excerpt[:80]}...'",
                evaluation_criteria="Candidate recognizes shared underlying concepts (e.g., concurrency, data persistence, modularity) and candidly discusses what is new vs familiar."
            )
        )
        
    # 3. Questions targeting Unverified or Claimed Skills (Listed in skills but no project details)
    for df in direct_findings:
        if df.strength_of_evidence == "Unverified":
            questions.append(
                InterviewQuestion(
                    question=f"You listed {df.requirement_name} in your technical skills. Could you walk us through a recent feature or production workflow where you applied {df.requirement_name} end to end?",
                    purpose_reason=f"Verify practical depth for {df.requirement_name}, which is listed in skills but lacks detailed narrative in project descriptions.",
                    related_jd_requirement=df.requirement_name,
                    resume_evidence=df.supporting_excerpt,
                    evaluation_criteria="Look for specific practical examples, command line/API familiarity, and nuances rather than high-level textbook definitions."
                )
            )
            if len(questions) >= 5:
                break
                
    # 4. Questions targeting Missing Mandatory Requirements
    direct_and_indirect_names = {f.requirement_name.lower() for f in direct_findings} | {f.requirement_name.lower() for f in indirect_findings}
    for r in requirements:
        if r.importance.lower() == "mandatory" and r.skill.lower() not in direct_and_indirect_names:
            questions.append(
                InterviewQuestion(
                    question=f"Our team relies heavily on {r.skill} for core responsibilities. Have you had exposure to {r.skill} or comparable paradigms, and how would you approach ramping up in your first 30 days?",
                    purpose_reason=f"Explore familiarity and learning velocity for mandatory requirement {r.skill} which is not evidenced in the resume.",
                    related_jd_requirement=r.skill,
                    resume_evidence="Not evidenced in resume documents.",
                    evaluation_criteria="Honesty about gaps, coupled with strong understanding of foundational computer science concepts and a proactive learning plan."
                )
            )
            if len(questions) >= 6:
                break
                
    return questions[:6]
