import pytest
from app.models.schemas import ExtractedResumeData, JDRequirement
from app.services.experience_analyzer import (
    extract_jd_experience,
    extract_resume_experience,
    assess_experience,
    generate_creative_summary
)

def test_extract_jd_experience_senior():
    jd_text = "We are seeking a Senior Full-Stack Engineer. Must have 5+ years of experience with React."
    reqs = [JDRequirement(skill="React", category="Mandatory technical skills", importance="Mandatory", minimum_experience_years=5.0)]
    years = extract_jd_experience(jd_text, reqs, "Senior Full-Stack Engineer")
    assert years >= 5.0

def test_extract_jd_experience_fresher():
    jd_text = "We are looking for Graduate Trainee / Fresher Engineers. 0-1 years experience."
    years = extract_jd_experience(jd_text, [], "Junior Software Engineer")
    assert years == 0.0

def test_extract_resume_experience_stated():
    resume = ExtractedResumeData(
        full_name="Alex Chen",
        professional_summary="Senior Full-Stack Engineer with 6+ years of experience building distributed systems.",
        projects=[]
    )
    years = extract_resume_experience(resume, resume.professional_summary)
    assert years == 6.0

def test_extract_resume_experience_fresher():
    resume = ExtractedResumeData(
        full_name="Recent Grad",
        professional_summary="Recent Computer Science graduate seeking an entry-level software engineer role.",
        education=[{"details": "B.Tech in Computer Science (2025)"}],
        work_experience=[],
        projects=[{"name": "Calculator App", "technologies": ["HTML", "CSS", "JS"]}]
    )
    raw = "Recent Computer Science graduate seeking entry-level role. B.Tech 2025."
    years = extract_resume_experience(resume, raw)
    assert years <= 1.0

def test_creative_summary_fresher_to_senior_jd():
    # Run multiple times to verify all random pool variations
    for _ in range(10):
        summary = generate_creative_summary(overall_score=3.5, req_years=5.0, found_years=0.0)
        assert any(phrase in summary.lower() for phrase in [
            "buddy", "experienced", "senior", "veteran", "champion", "battlefield"
        ])

def test_creative_summary_high_match():
    # Senior candidate with 6 years applying to 5+ years JD with 8.5 score
    summary = generate_creative_summary(overall_score=8.5, req_years=5.0, found_years=6.0)
    assert any(phrase in summary.lower() for phrase in [
        "hot damn", "chef's kiss", "green flags", "bulls-eye", "boxes"
    ])
