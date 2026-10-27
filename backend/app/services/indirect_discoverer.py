import re
from typing import List, Dict, Any, Optional, Set
from ..models.schemas import JDRequirement, ExtractedResumeData, IndirectFinding
from .skill_taxonomy import normalize_skill_name, get_inferred_skills, ECOSYSTEM_MAP, SYNONYM_MAP

def discover_indirect_skills(
    requirements: List[JDRequirement],
    resume_data: ExtractedResumeData,
    direct_matched_skills: Set[str]
) -> List[IndirectFinding]:
    """
    Perform Stage 4 Indirect Skill Discovery.
    Identifies skills demonstrated through projects, internships, or ecosystem mappings
    that are NOT in the Skills section or require architectural inference.
    """
    indirect_findings: List[IndirectFinding] = []
    explicit_skills_lower = {s.lower() for s in resume_data.technical_skills}
    
    # 1. Inspect all projects
    for proj in resume_data.projects:
        p_name = proj.get("name", "Project")
        p_techs = proj.get("technologies", [])
        p_bullets = proj.get("bullets", [])
        p_text = f"{p_name} " + " ".join(p_bullets)
        
        # Check explicit technologies in project that were NOT in Skills section
        for tech in p_techs:
            tech_norm = normalize_skill_name(tech)
            tech_low = tech_norm.lower()
            
            # Find which JD requirement this satisfies
            for req in requirements:
                req_norm = normalize_skill_name(req.skill)
                req_low = req_norm.lower()
                
                # Case A: Technology is directly in project text, but omitted from Skills section!
                if (req_low == tech_low or tech_low in [s.lower() for s in req.synonyms_and_related]) and (tech_low not in explicit_skills_lower):
                    # Find exact bullet
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
                            relationship_explanation=f"Project-derived evidence: {tech_norm} is actively implemented in '{p_name}', but was not declared in the candidate's Skills section.",
                            confidence_level="High",
                            what_remains_unverified="Professional commercial employment scale unless corroborated by work experience"
                        )
                    )
                    
            # Case B: Framework implies parent ecosystem (e.g. FastAPI -> Python, React -> JavaScript)
            inferred_info = get_inferred_skills(tech_norm)
            if inferred_info:
                for implied in inferred_info["implied_skills"]:
                    implied_norm = normalize_skill_name(implied)
                    implied_low = implied_norm.lower()
                    
                    for req in requirements:
                        req_norm = normalize_skill_name(req.skill)
                        if req_norm.lower() == implied_low and req_norm.lower() not in [f.requirement_name.lower() for f in indirect_findings]:
                            # Find excerpt
                            bullet_match = p_bullets[0] if p_bullets else f"Implemented in {p_name}"
                            indirect_findings.append(
                                IndirectFinding(
                                    requirement_name=req_norm,
                                    related_technology_or_activity=f"Used {tech_norm}",
                                    source_project_or_experience=f"Project: {p_name}",
                                    supporting_excerpt=bullet_match,
                                    relationship_explanation=f"{tech_norm} directly relies on {req_norm}. Building with {tech_norm} establishes practical competency in {req_norm}.",
                                    confidence_level=inferred_info.get("confidence", "High"),
                                    what_remains_unverified=inferred_info.get("unverified", "Specific enterprise configurations")
                                )
                            )
                            
        # Case C: Domain inference from project text
        p_text_lower = p_text.lower()
        
        # Machine learning domain inference
        if any(w in p_text_lower for w in ["random forest", "logistic regression", "neural network", "classification", "clustering", "trained model", "accuracy score", "auc-roc"]):
            for req in requirements:
                if req.skill.lower() in ["machine learning", "ai / machine learning"] and req.skill.lower() not in [f.requirement_name.lower() for f in indirect_findings]:
                    indirect_findings.append(
                        IndirectFinding(
                            requirement_name=req.skill,
                            related_technology_or_activity="Trained & Evaluated ML Models",
                            source_project_or_experience=f"Project: {p_name}",
                            supporting_excerpt=p_bullets[0] if p_bullets else p_name,
                            relationship_explanation="Model training, algorithm selection, and metric evaluation demonstrate applied Machine Learning capabilities.",
                            confidence_level="High",
                            what_remains_unverified="Deployment to real-time MLOps pipeline or distributed training"
                        )
                    )
                    
        # Network security / Cybersecurity domain inference
        if any(w in p_text_lower for w in ["intrusion detection", "packet analysis", "wireshark", "snort", "cryptography", "firewall", "vulnerability scan", "penetration test"]):
            for req in requirements:
                if "security" in req.skill.lower() and req.skill.lower() not in [f.requirement_name.lower() for f in indirect_findings]:
                    indirect_findings.append(
                        IndirectFinding(
                            requirement_name=req.skill,
                            related_technology_or_activity="Security analysis & Threat detection",
                            source_project_or_experience=f"Project: {p_name}",
                            supporting_excerpt=p_bullets[0] if p_bullets else p_name,
                            relationship_explanation="Analyzing threat traffic and building detection workflows demonstrate foundational cybersecurity principles.",
                            confidence_level="Medium",
                            what_remains_unverified="Compliance frameworks (SOC2, ISO27001) or enterprise incident response"
                        )
                    )
                    
        # DevOps / Containerization inference
        if any(w in p_text_lower for w in ["dockerfile", "docker container", "docker-compose", "github actions", "ci/cd pipeline"]):
            for req in requirements:
                if req.skill.lower() in ["devops", "ci/cd", "containerization"] and req.skill.lower() not in [f.requirement_name.lower() for f in indirect_findings]:
                    indirect_findings.append(
                        IndirectFinding(
                            requirement_name=req.skill,
                            related_technology_or_activity="Automated containerization & build pipeline",
                            source_project_or_experience=f"Project: {p_name}",
                            supporting_excerpt=p_bullets[0] if p_bullets else p_name,
                            relationship_explanation="Containerizing apps with Docker and writing CI/CD workflows demonstrates automated DevOps practices.",
                            confidence_level="High",
                            what_remains_unverified="Cloud-scale cluster orchestration or multi-environment staging"
                        )
                    )
                    
    # 2. Inspect Work Experience for Transferable / Inferred Skills
    for exp in resume_data.work_experience:
        title = exp.get("title_company", "")
        bullets = exp.get("bullets", [])
        exp_full = f"{title} " + " ".join(bullets)
        exp_low = exp_full.lower()
        
        # Check cloud ecosystem in work experience
        if "aws" in exp_low and not any(f.requirement_name == "Cloud Architecture" for f in indirect_findings):
            for req in requirements:
                if req.skill.lower() in ["cloud platforms", "cloud architecture"]:
                    indirect_findings.append(
                        IndirectFinding(
                            requirement_name=req.skill,
                            related_technology_or_activity="Cloud Infrastructure Deployment",
                            source_project_or_experience=f"Experience: {title}",
                            supporting_excerpt=bullets[0] if bullets else title,
                            relationship_explanation="Hands-on cloud usage in professional role demonstrates foundational cloud architecture proficiency.",
                            confidence_level="Medium",
                            what_remains_unverified="Multi-cloud governance or disaster recovery architectures"
                        )
                    )
                    
    return indirect_findings
