import re
from typing import List, Dict, Any, Optional, Tuple
from ..models.schemas import JDRequirement, ExtractedResumeData, DirectFinding
from .skill_taxonomy import normalize_skill_name, SYNONYM_MAP

def find_mentions_in_text(skill: str, text: str) -> List[str]:
    """Find sentences or bullet points in text mentioning the skill or its synonyms."""
    if not text:
        return []
    
    # Generate search variants
    variants = [skill.lower()]
    for syn, norm in SYNONYM_MAP.items():
        if norm.lower() == skill.lower():
            variants.append(syn.lower())
    variants = list(set(variants))
    
    lines = [l.strip() for l in re.split(r'[\n\r.]+', text) if l.strip()]
    matches = []
    
    for line in lines:
        line_low = line.lower()
        for v in variants:
            if re.search(r'\b' + re.escape(v) + r'\b', line_low):
                matches.append(line)
                break
    return matches

def evaluate_direct_matching(
    requirements: List[JDRequirement],
    resume_data: ExtractedResumeData
) -> List[DirectFinding]:
    """
    Perform Direct Skill Matching.
    Finds evidence in Skills, Experience, Projects, or Certifications.
    Skills declared in the Skills section are respected and credited as declared competencies,
    not flagged as false skills or penalized.
    """
    direct_findings: List[DirectFinding] = []
    
    # Build dictionary of all normalized skills in candidate's skills list
    explicit_skills_map: Dict[str, str] = {}
    for s in resume_data.technical_skills:
        s_norm = normalize_skill_name(s).lower()
        s_raw_low = s.strip().lower()
        explicit_skills_map[s_norm] = s
        explicit_skills_map[s_raw_low] = s

    for req in requirements:
        skill = req.skill
        skill_norm = normalize_skill_name(skill)
        skill_low = skill_norm.lower()
        req_synonyms = [s.lower() for s in req.synonyms_and_related]
        
        # Check explicit Skills section (direct match or synonym match)
        in_skills_section = (skill_low in explicit_skills_map) or any(syn in explicit_skills_map for syn in req_synonyms)
        matched_skill_label = explicit_skills_map.get(skill_low)
        if not matched_skill_label:
            for syn in req_synonyms:
                if syn in explicit_skills_map:
                    matched_skill_label = explicit_skills_map[syn]
                    break
        
        # Check Experience section
        exp_text = "\n".join([
            f"{e.get('title_company', '')}: " + " ".join(e.get('bullets', []))
            for e in resume_data.work_experience
        ])
        exp_mentions = find_mentions_in_text(skill_norm, exp_text)
        
        # Check Projects section
        proj_text = "\n".join([
            f"{p.get('name', '')}: " + " ".join(p.get('bullets', [])) + " Tech: " + " ".join(p.get('technologies', []))
            for p in resume_data.projects
        ])
        proj_mentions = find_mentions_in_text(skill_norm, proj_text)
        
        # Check Certifications
        cert_text = "\n".join(resume_data.certifications)
        cert_mentions = find_mentions_in_text(skill_norm, cert_text)
        
        # Evaluate evidence strength
        if exp_mentions and len(exp_mentions) >= 2:
            strength = "Strong"
            section = "Work Experience"
            excerpt = exp_mentions[0]
            explanation = f"Substantial professional experience applying {skill_norm} across key responsibilities."
            classification = "Explicit professional experience"
        elif exp_mentions:
            strength = "Strong"
            section = "Work Experience"
            excerpt = exp_mentions[0]
            explanation = f"Directly applied in professional role: {excerpt[:100]}..."
            classification = "Explicit professional experience"
        elif proj_mentions:
            strength = "Moderate"
            section = "Projects"
            excerpt = proj_mentions[0]
            explanation = f"Hands-on implementation demonstrated in project: {excerpt[:100]}..."
            classification = "Explicit project implementation"
        elif cert_mentions:
            strength = "Moderate"
            section = "Certifications"
            excerpt = cert_mentions[0]
            explanation = f"Verified through formal accreditation/certification: {cert_mentions[0]}."
            classification = "Verified Certification"
        elif in_skills_section:
            # Stated in Skills section: HR recognizes stated competencies
            strength = "Declared"
            section = "Skills"
            excerpt = f"Listed in skills inventory: '{matched_skill_label or skill_norm}'"
            explanation = f"Directly declared in technical skills section. Validated as an active candidate competency."
            classification = "Declared Technical Skill"
        else:
            # No direct evidence found
            continue
            
        direct_findings.append(
            DirectFinding(
                requirement_name=skill_norm,
                evidence_classification=classification,
                resume_section=section,
                supporting_excerpt=excerpt,
                relevance_explanation=explanation,
                strength_of_evidence=strength
            )
        )
        
    return direct_findings
