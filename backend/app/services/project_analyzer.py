import re
from typing import List, Dict, Any, Optional
from ..models.schemas import ProjectAnalysisItem, JDRequirement
from .skill_taxonomy import normalize_skill_name

ACTION_VERBS = {"architected", "designed", "implemented", "developed", "built", "created", "engineered", "deployed", "optimized", "integrated", "refactored", "automated"}

PRODUCTION_KEYWORDS = {"docker", "kubernetes", "ci/cd", "deployed", "aws", "gcp", "azure", "unit tests", "pytest", "monitored", "prometheus", "redis", "nginx", "load balancer", "production", "ssl", "oauth"}

def analyze_single_project(
    proj: Dict[str, Any],
    requirements: List[JDRequirement]
) -> ProjectAnalysisItem:
    """Analyze an individual project across 7 dimensions according to task.md specification."""
    name = proj.get("name", "Technical Project")
    bullets = proj.get("bullets", [])
    technologies = proj.get("technologies", [])
    all_text = f"{name} " + " ".join(bullets)
    all_text_lower = all_text.lower()
    
    # 1. Problem & Domain Identification
    problem = "Engineering application or technical system development."
    domain = "Software Engineering"
    for b in bullets:
        b_low = b.lower()
        if any(w in b_low for w in ["to solve", "addressed", "enabling", "designed to", "classification", "detection"]):
            problem = b
            break
            
    if any(w in all_text_lower for w in ["machine learning", "model", "prediction", "neural", "dataset"]):
        domain = "Artificial Intelligence / Machine Learning"
    elif any(w in all_text_lower for w in ["frontend", "react", "ui", "ux", "responsive"]):
        domain = "Full-Stack / Frontend Web"
    elif any(w in all_text_lower for w in ["intrusion", "security", "vulnerability", "auth"]):
        domain = "Cybersecurity"
    elif any(w in all_text_lower for w in ["pipeline", "etl", "warehouse", "analytics", "data"]):
        domain = "Data Engineering"
        
    # 2. Candidate Ownership & Contribution
    ownership_score = "Moderate"
    first_words = [b.split()[0].lower() for b in bullets if b.split()]
    strong_action_count = sum(1 for w in first_words if w in ACTION_VERBS)
    
    if strong_action_count >= 2:
        ownership_score = "High"
        contribution = f"Direct technical implementation led by candidate using active verbs ({', '.join([w for w in first_words if w in ACTION_VERBS][:3])})."
    elif strong_action_count == 1:
        ownership_score = "Moderate"
        contribution = "Hands-on implementation of core project modules."
    else:
        ownership_score = "Vague"
        contribution = "Passive or team-level description without explicit breakdown of individual candidate ownership."
        
    # 3. Production Readiness
    prod_matches = [w for w in PRODUCTION_KEYWORDS if w in all_text_lower]
    if len(prod_matches) >= 2:
        production_readiness = "High"
    elif len(prod_matches) == 1:
        production_readiness = "Medium"
    else:
        production_readiness = "Low"
        
    # 4. Technical Concepts Demonstrated
    concepts = []
    if "api" in all_text_lower or "rest" in all_text_lower:
        concepts.append("RESTful API Architecture")
    if "async" in all_text_lower or "await" in all_text_lower or "fastapi" in all_text_lower:
        concepts.append("Asynchronous I/O Programming")
    if "database" in all_text_lower or "sql" in all_text_lower or "orm" in all_text_lower:
        concepts.append("Database Modeling & Schema Design")
    if "model" in all_text_lower or "training" in all_text_lower or "classification" in all_text_lower:
        concepts.append("Predictive Modeling & Feature Engineering")
    if "docker" in all_text_lower or "container" in all_text_lower:
        concepts.append("Containerized Environment Isolation")
    if not concepts:
        concepts.append("Software System Architecture")
        
    # 5. Complexity Indicators
    complexity = []
    if len(technologies) >= 4:
        complexity.append("Multi-tier technology stack integration")
    if re.search(r'\b\d+(?:%|x|k|ms|s|gb|mb)\b', all_text_lower):
        complexity.append("Contains measurable performance or scale indicators")
    if production_readiness in ["High", "Medium"]:
        complexity.append("Includes deployment, packaging, or monitoring aspects")
    if not complexity:
        complexity.append("Standard application architecture")
        
    # 6. JD Relevance Scoring (0 to 10)
    jd_skills_set = {normalize_skill_name(r.skill).lower() for r in requirements}
    tech_matches = [t for t in technologies if normalize_skill_name(t).lower() in jd_skills_set]
    
    # Calculate relevance based on tech overlap and domain alignment
    base_score = 3.0
    base_score += min(len(tech_matches) * 1.8, 5.0)
    if production_readiness == "High":
        base_score += 1.2
    elif production_readiness == "Medium":
        base_score += 0.6
    if ownership_score == "High":
        base_score += 0.8
        
    jd_relevance_score = min(round(base_score, 1), 10.0)
    
    # 7. Unverified Claims & Missing Details
    unverified = []
    if ownership_score == "Vague":
        unverified.append("Individual vs team contribution boundaries are unstated.")
    if production_readiness == "Low":
        unverified.append("Lack of testing coverage, staging deployment, or CI/CD evidence.")
    if not any(re.search(r'\d+', b) for b in bullets):
        unverified.append("No quantified impact metrics, data volumes, or user scale documented.")
        
    # 8. Improvement Suggestions
    suggestions = []
    if ownership_score == "Vague":
        suggestions.append("Rephrase bullets starting with strong action verbs (e.g., 'Architected', 'Implemented', 'Engineered') to clarify personal ownership.")
    if production_readiness == "Low":
        suggestions.append("Specify how the application was packaged, tested (unit/integration tests), or hosted.")
    if unverified:
        suggestions.append("Add measurable outcomes, such as query latency reduction, test coverage %, or dataset size processed.")
        
    architecture = f"Full-stack architecture with {', '.join(technologies[:4]) if technologies else 'modular software structure'}."
    implementation = f"Developed components in {', '.join(technologies)}. " + (" ".join(bullets[:2]) if bullets else "")
    
    return ProjectAnalysisItem(
        project_name=name,
        problem_addressed=problem,
        purpose_domain=domain,
        technologies_mentioned=technologies,
        architecture_components=architecture,
        candidate_contribution=contribution,
        implementation_details=implementation,
        complexity_indicators=complexity,
        technical_concepts=concepts,
        jd_relevance_score=jd_relevance_score,
        production_readiness=production_readiness,
        ownership_clarity=ownership_score,
        transferability=f"Demonstrates practical hands-on problem solving relevant to modern {domain} roles.",
        supporting_excerpts=bullets[:3] if bullets else [name],
        unverified_claims=unverified,
        improvement_suggestions=suggestions
    )

def evaluate_all_projects(
    projects: List[Dict[str, Any]],
    requirements: List[JDRequirement]
) -> List[ProjectAnalysisItem]:
    """Analyze all projects extracted from the resume."""
    return [analyze_single_project(p, requirements) for p in projects]
