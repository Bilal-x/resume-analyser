import pytest
from app.models.schemas import JDRequirement, ExtractedResumeData
from app.services.direct_matcher import evaluate_direct_matching
from app.services.indirect_discoverer import discover_indirect_skills
from app.services.scoring_engine import calculate_explainable_score, is_fresher_job
from app.services.company_intelligence import generate_company_intelligence
from app.services.skill_taxonomy import normalize_skill_name

def test_declared_skill_not_penalized_without_project():
    """
    User instruction: If Javascript is mentioned in skills section but not in projects,
    do NOT mark it as a false skill or unverified gap. Credit it as a declared competency.
    """
    requirements = [
        JDRequirement(skill="JavaScript", category="Programming Languages", importance="Mandatory")
    ]
    resume = ExtractedResumeData(
        full_name="Alex Doe",
        technical_skills=["JavaScript", "Git"],
        work_experience=[],
        projects=[{"name": "Python CLI tool", "technologies": ["Python"], "bullets": ["Built terminal utility"]}]
    )

    findings = evaluate_direct_matching(requirements, resume)
    assert len(findings) == 1
    f = findings[0]
    assert f.requirement_name == "JavaScript"
    assert f.strength_of_evidence == "Declared"
    assert "Declared Technical Skill" in f.evidence_classification
    assert "false" not in f.relevance_explanation.lower()
    assert "lacks" not in f.relevance_explanation.lower()

def test_web_app_project_infers_html_css_js():
    """
    User instruction: If project says created a web app without tech mentioned,
    assume he knows html, css, js.
    """
    requirements = [
        JDRequirement(skill="HTML", category="Frontend", importance="Mandatory"),
        JDRequirement(skill="CSS", category="Frontend", importance="Mandatory"),
        JDRequirement(skill="JavaScript", category="Frontend", importance="Mandatory"),
    ]
    resume = ExtractedResumeData(
        full_name="Beta Dev",
        technical_skills=[],  # Omitted from skills!
        projects=[
            {
                "name": "Personal Portfolio Web App",
                "technologies": [],  # No explicit tech
                "bullets": ["Designed and created a responsive web app with interactive user dashboards."]
            }
        ]
    )

    indirect = discover_indirect_skills(requirements, resume, direct_matched_skills=set())
    discovered = {f.requirement_name for f in indirect}
    assert "HTML" in discovered
    assert "CSS" in discovered
    assert "JavaScript" in discovered

def test_ai_project_credits_ai_engineering():
    """
    User instruction: If AI engineering is required, no skill in skill set but has done
    an AI project, assume it as AI engineering and credit it.
    """
    requirements = [
        JDRequirement(skill="AI Engineering", category="Engineering Discipline", importance="Mandatory")
    ]
    resume = ExtractedResumeData(
        full_name="Dana ML",
        technical_skills=["Python", "SQL"],  # 'AI Engineering' not in skills
        projects=[
            {
                "name": "Customer Churn Prediction",
                "technologies": ["Python", "scikit-learn"],
                "bullets": ["Trained neural network and random forest classification models achieving 94% accuracy."]
            }
        ]
    )

    indirect = discover_indirect_skills(requirements, resume, direct_matched_skills=set())
    discovered = {f.requirement_name for f in indirect}
    assert "AI Engineering" in discovered

def test_fresher_job_calibration():
    """
    User instruction: For fresher roles, do not penalize for lack of 5-year enterprise history.
    Score should reflect high potential based on projects and declared skills.
    """
    requirements = [
        JDRequirement(skill="JavaScript", category="Languages", importance="Mandatory"),
        JDRequirement(skill="React", category="Frontend", importance="Mandatory"),
    ]
    resume = ExtractedResumeData(
        full_name="Fresh Graduate",
        technical_skills=["JavaScript", "React", "HTML", "CSS"],
        work_experience=[],  # No corporate experience!
        projects=[
            {
                "name": "Campus Event Portal",
                "technologies": ["React", "JavaScript"],
                "bullets": ["Built full web dashboard for 2000+ university students."]
            },
            {
                "name": "Task Tracker App",
                "technologies": ["React"],
                "bullets": ["Interactive task management app with local storage state."]
            }
        ]
    )

    assert is_fresher_job("Junior Frontend Developer (Fresher)", requirements) is True

    direct = evaluate_direct_matching(requirements, resume)
    indirect = discover_indirect_skills(requirements, resume, {f.requirement_name for f in direct})
    
    score, breakdown = calculate_explainable_score(
        requirements=requirements,
        resume_data=resume,
        direct_findings=direct,
        indirect_findings=indirect,
        project_analyses=[],
        job_title="Junior Frontend Engineer (Fresher)"
    )

    # A fresher with matching skills & 2 projects should get a strong alignment score (>= 7.5/10), NOT failing!
    assert score >= 7.5
    assert breakdown.overall_score >= 7.5

def test_company_intelligence_generation():
    """
    User instruction: Web intelligence on company culture, interview norms, and candidate tips.
    """
    intel = generate_company_intelligence("Vercel")
    assert intel is not None
    assert intel.company_name == "Vercel"
    assert intel.work_culture_rating >= 4.0
    assert len(intel.candidate_tips) >= 2
    assert "Next.js" in " ".join(intel.candidate_tips) or "frontend" in intel.culture_summary.lower()

    # Custom / unknown company fallback
    custom_intel = generate_company_intelligence("Acme AI Labs")
    assert custom_intel is not None
    assert custom_intel.company_name == "Acme AI Labs"
    assert len(custom_intel.candidate_tips) >= 2

