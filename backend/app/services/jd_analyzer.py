import re
from typing import List, Dict, Any, Optional
from ..models.schemas import JDRequirement
from .skill_taxonomy import normalize_skill_name, KNOWN_LANGUAGES, KNOWN_FRAMEWORKS, KNOWN_DATABASES, KNOWN_CLOUD, KNOWN_DEVOPS, SYNONYM_MAP

EXPERIENCE_REGEX = re.compile(r'(\d+)\+?\s*(?:-\s*(\d+))?\s*(?:years?|yrs?)(?:\s+of)?(?:\s+experience)?', re.IGNORECASE)

MANDATORY_TRIGGERS = ["must have", "required", "minimum", "essential", "proven experience", "strong proficiency", "core requirement", "solid understanding"]
PREFERRED_TRIGGERS = ["nice to have", "plus", "bonus", "preferred", "advantageous", "familiarity with", "good to have"]

DOMAIN_KEYWORDS = {
    "machine learning": "AI / Machine Learning",
    "deep learning": "AI / Machine Learning",
    "natural language processing": "Natural Language Processing",
    "computer vision": "Computer Vision",
    "cybersecurity": "Cybersecurity & Network Security",
    "network security": "Cybersecurity & Network Security",
    "cloud": "Cloud Architecture",
    "distributed systems": "Distributed Systems",
    "fintech": "Financial Technology",
    "healthcare": "Healthcare Systems",
    "microservices": "Microservices & Distributed Systems",
    "data engineering": "Data Engineering & Analytics",
    "devops": "DevOps & Infrastructure",
    "frontend": "Frontend Engineering",
    "backend": "Backend Engineering",
    "full-stack": "Full-Stack Web Development",
}

def parse_job_description(jd_text: str) -> List[JDRequirement]:
    """Parse raw job description text into structured, categorized requirements."""
    requirements: List[JDRequirement] = []
    lines = [l.strip() for l in jd_text.split("\n") if l.strip()]
    seen_skills = set()
    
    current_section_is_preferred = False
    
    for line in lines:
        line_lower = line.lower()
        
        # Check if header implies Preferred or Mandatory
        if any(trig in line_lower for trig in PREFERRED_TRIGGERS) and len(line) < 60:
            current_section_is_preferred = True
        elif any(trig in line_lower for trig in MANDATORY_TRIGGERS) and len(line) < 60:
            current_section_is_preferred = False
            
        # Check for years of experience
        exp_match = EXPERIENCE_REGEX.search(line)
        exp_years = float(exp_match.group(1)) if exp_match else None
        
        # Determine importance
        is_mandatory = True
        if current_section_is_preferred or any(p in line_lower for p in PREFERRED_TRIGGERS):
            is_mandatory = False
            
        # Scan for technical keywords
        all_tech_vocab = (
            KNOWN_LANGUAGES | KNOWN_FRAMEWORKS | KNOWN_DATABASES |
            KNOWN_CLOUD | KNOWN_DEVOPS | set(SYNONYM_MAP.keys())
        )
        
        for tech in all_tech_vocab:
            # Word boundary check
            pattern = r'\b' + re.escape(tech) + r'\b'
            if re.search(pattern, line_lower):
                standard_name = normalize_skill_name(tech)
                if standard_name.lower() in seen_skills:
                    continue
                seen_skills.add(standard_name.lower())
                
                # Determine category
                tech_low = standard_name.lower()
                if tech_low in KNOWN_LANGUAGES:
                    cat = "Programming languages"
                elif tech_low in KNOWN_FRAMEWORKS:
                    cat = "Frameworks and libraries"
                elif tech_low in KNOWN_DATABASES:
                    cat = "Databases & Storage"
                elif tech_low in KNOWN_CLOUD:
                    cat = "Cloud platforms"
                elif tech_low in KNOWN_DEVOPS:
                    cat = "DevOps and infrastructure tools"
                else:
                    cat = "Core technical skills"
                    
                requirements.append(
                    JDRequirement(
                        skill=standard_name,
                        category="Mandatory technical skills" if is_mandatory else "Preferred technical skills",
                        importance="Mandatory" if is_mandatory else "Preferred",
                        minimum_experience_years=exp_years,
                        expected_proficiency="Advanced" if (exp_years and exp_years >= 3) or "strong" in line_lower else "Working knowledge",
                        synonyms_and_related=[k for k, v in SYNONYM_MAP.items() if v == standard_name],
                        demonstration_criteria=f"Demonstrated proficiency in {standard_name} through production work, technical projects, or architecture design."
                    )
                )
                
        # Scan for domain areas
        for domain_key, domain_val in DOMAIN_KEYWORDS.items():
            if domain_key in line_lower and domain_val.lower() not in seen_skills:
                seen_skills.add(domain_val.lower())
                requirements.append(
                    JDRequirement(
                        skill=domain_val,
                        category="Domain knowledge",
                        importance="Mandatory" if is_mandatory else "Preferred",
                        minimum_experience_years=exp_years,
                        expected_proficiency="Conceptual & Practical",
                        synonyms_and_related=[domain_key],
                        demonstration_criteria=f"Applied experience or projects solving problems in {domain_val}."
                    )
                )
                
    # If no requirements were extracted (e.g. non-standard text), extract significant technical nouns
    if not requirements:
        words = re.findall(r'\b[A-Z][a-zA-Z0-9+#.]*\b', jd_text)
        for w in words[:6]:
            if len(w) > 2 and w.lower() not in {"the", "and", "for", "with", "you", "will"}:
                requirements.append(
                    JDRequirement(
                        skill=w,
                        category="Mandatory technical skills",
                        importance="Mandatory",
                        expected_proficiency="Working knowledge",
                        demonstration_criteria=f"Evidence of {w} in resume projects or experience."
                    )
                )
                
    return requirements
