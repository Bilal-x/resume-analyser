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
    Perform Stage 3 Direct Skill Matching.
    Find explicit evidence in Skills, Experience, Projects, or Certifications.
    """
    direct_findings: List[DirectFinding] = []
    explicit_skills_lower = {s.lower(): s for s in resume_data.technical_skills}
    
    for req in requirements:
        skill = req.skill
        skill_norm = normalize_skill_name(skill)
        skill_low = skill_norm.lower()
        
        # Check explicit Skills section
        in_skills_section = (skill_low in explicit_skills_lower)
        
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
            explanation = f"Directly applied in professional role: {excerpt[:80]}..."
            classification = "Explicit professional experience"
        elif proj_mentions:
            strength = "Moderate"
            section = "Projects"
            excerpt = proj_mentions[0]
            explanation = f"Hands-on implementation demonstrated in project: {excerpt[:80]}..."
            classification = "Explicit project implementation"
        elif cert_mentions:
            strength = "Moderate"
            section = "Certifications"
            excerpt = cert_mentions[0]
            explanation = f"Verified through formal accreditation/certification: {cert_mentions[0]}."
            classification = "Verified Certification"
        elif in_skills_section:
            # Listed in skills, but no project or work details found
            strength = "Unverified"
            section = "Skills"
            excerpt = f"Listed in skills: '{explicit_skills_lower[skill_low]}'"
            explanation = f"Claimed in Skills section, but lacks detailed implementation evidence in work or project descriptions."
            classification = "Claimed without project backing"
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
