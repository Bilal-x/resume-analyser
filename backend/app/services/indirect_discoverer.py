import re
from typing import List, Dict, Any, Optional, Set
from ..models.schemas import JDRequirement, ExtractedResumeData, IndirectFinding
from .skill_taxonomy import (
    normalize_skill_name, get_inferred_skills, detect_domain_archetypes,
    FRONTEND_CLUSTER, BACKEND_CLUSTER, AI_CLUSTER, SYNONYM_MAP
)

def discover_indirect_skills(
    requirements: List[JDRequirement],
    resume_data: ExtractedResumeData,
    direct_matched_skills: Set[str]
) -> List[IndirectFinding]:
    """
    Perform Indirect Skill Discovery & Technical Deductions.
    Applies human-recruiter deduction rules:
    - Web app project without explicit stack assumes HTML, CSS, JavaScript.
    - React implementation implies core JavaScript, HTML, CSS, and Component Architecture.
    - Multiple UI/web skills establish overall Frontend Engineering capability.
    - Any AI/ML based project establishes applied AI Engineering capability.
    """
    indirect_findings: List[IndirectFinding] = []
    explicit_skills_lower = {s.lower() for s in resume_data.technical_skills}
    direct_matched_lower = {s.lower() for s in direct_matched_skills}
    
    # Run domain archetype detection
    archetypes = detect_domain_archetypes(
        skills=resume_data.technical_skills,
        projects=resume_data.projects,
        work_exp=resume_data.work_experience
    )
    
    # 1. Inspect all projects
    for proj in resume_data.projects:
        p_name = proj.get("name", "Project")
        p_techs = proj.get("technologies", [])
        p_bullets = proj.get("bullets", [])
        p_text = f"{p_name} " + " ".join(p_bullets)
        p_text_lower = p_text.lower()
        
        # Deduction A: "Web app" or "Website" without explicit stack deduction
        is_web_project = any(term in p_text_lower for term in [
            "web app", "website", "web application", "dashboard",
            "frontend", "web portal", "e-commerce site", "landing page"
        ])
        if is_web_project:
            web_inferred = ["HTML", "CSS", "JavaScript", "Web Development", "Frontend Engineering"]
            for implied in web_inferred:
                implied_norm = normalize_skill_name(implied)
                implied_low = implied_norm.lower()
                for req in requirements:
                    req_norm = normalize_skill_name(req.skill)
                    req_low = req_norm.lower()
                    if req_low == implied_low and req_low not in direct_matched_lower and not any(f.requirement_name.lower() == req_low for f in indirect_findings):
                        indirect_findings.append(
                            IndirectFinding(
                                requirement_name=req_norm,
                                related_technology_or_activity="Web Application Development",
                                source_project_or_experience=f"Project: {p_name}",
                                supporting_excerpt=p_bullets[0] if p_bullets else f"Developed {p_name}",
                                relationship_explanation=f"Building a web application ('{p_name}') fundamentally demonstrates practical proficiency in {req_norm}.",
                                confidence_level="High",
                                what_remains_unverified="Specific framework architectures unless declared"
                            )
                        )

        # Deduction B: Explicit project technologies
        for tech in p_techs:
            tech_norm = normalize_skill_name(tech)
            tech_low = tech_norm.lower()
            
            # Find which JD requirement this satisfies
            for req in requirements:
                req_norm = normalize_skill_name(req.skill)
                req_low = req_norm.lower()
                
                # Tech is in project, but omitted from Skills section
                if (req_low == tech_low or tech_low in [s.lower() for s in req.synonyms_and_related]) and (req_low not in direct_matched_lower) and not any(f.requirement_name.lower() == req_low for f in indirect_findings):
                    bullet_match = ""
                    for b in p_bullets:
                        if tech_low in b.lower():
                            bullet_match = b
                            break
                    if not bullet_match:
                        bullet_match = f"Demonstrated in project '{p_name}' tech stack: {', '.join(p_techs)}."
                        
                    indirect_findings.append(
                        IndirectFinding(
                            requirement_name=req_norm,
                            related_technology_or_activity=tech_norm,
                            source_project_or_experience=f"Project: {p_name}",
                            supporting_excerpt=bullet_match,
                            relationship_explanation=f"Project-derived evidence: {tech_norm} is actively implemented in '{p_name}'.",
                            confidence_level="High",
                            what_remains_unverified="Commercial enterprise deployment scale"
                        )
                    )
                    
            # Ecosystem inference (e.g. React -> JavaScript, HTML, CSS, Component Architecture)
            inferred_info = get_inferred_skills(tech_norm)
            if inferred_info:
                for implied in inferred_info["implied_skills"]:
                    implied_norm = normalize_skill_name(implied)
                    implied_low = implied_norm.lower()
                    
                    for req in requirements:
                        req_norm = normalize_skill_name(req.skill)
                        req_low = req_norm.lower()
                        if req_low == implied_low and req_low not in direct_matched_lower and not any(f.requirement_name.lower() == req_low for f in indirect_findings):
                            bullet_match = p_bullets[0] if p_bullets else f"Implemented in {p_name}"
                            indirect_findings.append(
                                IndirectFinding(
                                    requirement_name=req_norm,
                                    related_technology_or_activity=f"Used {tech_norm}",
                                    source_project_or_experience=f"Project: {p_name}",
                                    supporting_excerpt=bullet_match,
                                    relationship_explanation=f"Demonstrated competency in {tech_norm} naturally establishes {req_norm} foundational capability.",
                                    confidence_level=inferred_info.get("confidence", "High"),
                                    what_remains_unverified=inferred_info.get("unverified", "Advanced production configuration")
                                )
                            )

        # Deduction C: AI / Machine Learning project deduction
        is_ai_proj = any(w in p_text_lower for w in [
            "random forest", "logistic regression", "neural network", "classification",
            "clustering", "trained model", "accuracy score", "auc-roc", "machine learning",
            "llm", "large language model", "hugging face", "langchain", "sentiment analysis",
            "predictive", "recommendation system", "computer vision", "yolo", "opencv",
            "embeddings", "rag", "pytorch", "tensorflow", "scikit-learn"
        ])
        if is_ai_proj:
            for req in requirements:
                req_norm = normalize_skill_name(req.skill)
                req_low = req_norm.lower()
                if any(ai_term in req_low for ai_term in ["machine learning", "ai", "artificial intelligence", "deep learning", "ai engineering"]) and req_low not in direct_matched_lower and not any(f.requirement_name.lower() == req_low for f in indirect_findings):
                    indirect_findings.append(
                        IndirectFinding(
                            requirement_name=req_norm,
                            related_technology_or_activity="AI / ML Project Implementation",
                            source_project_or_experience=f"Project: {p_name}",
                            supporting_excerpt=p_bullets[0] if p_bullets else p_name,
                            relationship_explanation=f"Demonstrated in '{p_name}': Successfully built and evaluated AI models, confirming applied AI Engineering capability.",
                            confidence_level="High",
                            what_remains_unverified="Distributed MLOps deployment at commercial scale"
                        )
                    )

    # 2. Domain Archetype synthesis across the entire profile
    for req in requirements:
        req_norm = normalize_skill_name(req.skill)
        req_low = req_norm.lower()
        if req_low in direct_matched_lower or any(f.requirement_name.lower() == req_low for f in indirect_findings):
            continue

        # Check Frontend Engineering Cluster
        if any(term in req_low for term in ["frontend", "front-end", "web engineering", "ui engineering", "ui development"]) and archetypes["Frontend Engineering"]:
            indirect_findings.append(
                IndirectFinding(
                    requirement_name=req_norm,
                    related_technology_or_activity="Synthesized Frontend Competency Stack",
                    source_project_or_experience="Profile Synthesized Evidence",
                    supporting_excerpt="Demonstrated cross-cutting web technologies (HTML/CSS, JS/TS, React/UI)",
                    relationship_explanation="Candidate demonstrates cohesive frontend engineering capability across web design, component hierarchy, and client interactivity.",
                    confidence_level="High",
                    what_remains_unverified="Specific design system governance"
                )
            )

        # Check Backend Engineering Cluster
        elif any(term in req_low for term in ["backend", "back-end", "server development", "api engineering"]) and archetypes["Backend Engineering"]:
            indirect_findings.append(
                IndirectFinding(
                    requirement_name=req_norm,
                    related_technology_or_activity="Synthesized Backend Competency Stack",
                    source_project_or_experience="Profile Synthesized Evidence",
                    supporting_excerpt="Demonstrated server-side languages, database interactions, and REST APIs",
                    relationship_explanation="Candidate demonstrates cohesive backend engineering capability across data modeling, server routing, and API integration.",
                    confidence_level="High",
                    what_remains_unverified="High-availability cluster orchestration"
                )
            )

        # Check AI Engineering Cluster
        elif any(term in req_low for term in ["ai engineering", "machine learning engineering", "applied ai"]) and archetypes["AI Engineering"]:
            indirect_findings.append(
                IndirectFinding(
                    requirement_name=req_norm,
                    related_technology_or_activity="Synthesized AI Project Capabilities",
                    source_project_or_experience="Project Implementations",
                    supporting_excerpt="Hands-on machine learning model development and algorithmic data pipelines",
                    relationship_explanation="Candidate has successfully completed AI/ML projects, establishing practical AI Engineering foundations.",
                    confidence_level="High",
                    what_remains_unverified="Large-scale production model serving"
                )
            )

    return indirect_findings
