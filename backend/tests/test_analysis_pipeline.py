import pytest
from app.models.schemas import JDRequirement, ExtractedResumeData, DirectFinding, IndirectFinding
from app.services.direct_matcher import evaluate_direct_matching
from app.services.indirect_discoverer import discover_indirect_skills
from app.services.project_analyzer import evaluate_all_projects
from app.services.scoring_engine import calculate_explainable_score

def test_direct_skill_matching():
    # JD requires Python (mandatory) and SQL (preferred)
    requirements = [
        JDRequirement(
            skill="Python",
            category="Programming Languages",
            importance="Mandatory",
            synonyms_and_related=["Python3", "py"]
        ),
        JDRequirement(
            skill="SQL",
            category="Databases",
            importance="Preferred",
            synonyms_and_related=["PostgreSQL", "MySQL"]
        )
    ]

    resume = ExtractedResumeData(
        full_name="Alice Candidate",
        technical_skills=["Python", "JavaScript", "Docker"],
        work_experience=[
            {
                "role": "Software Engineer",
                "company": "Tech Corp",
                "bullets": ["Engineered high-throughput microservices using Python and Redis for 2 years."]
            }
        ],
        projects=[]
    )

    findings = evaluate_direct_matching(requirements, resume)
    matched_names = [f.requirement_name for f in findings]

    assert "Python" in matched_names
    # SQL is not in resume skills or experience, should not be directly matched
    assert "SQL" not in matched_names

    py_finding = next(f for f in findings if f.requirement_name == "Python")
    assert py_finding.strength_of_evidence in ["Strong", "Moderate"]
    assert "Python" in py_finding.supporting_excerpt or "Skills" in py_finding.resume_section

def test_indirect_skill_discovery_project_evidence():
    """
    Critical requirement: If Python is missing from Skills section but demonstrated
    in a project description, it must be discovered as indirect / project-derived evidence.
    """
    requirements = [
        JDRequirement(
            skill="Python",
            category="Programming Languages",
            importance="Mandatory",
            synonyms_and_related=["Python3"]
        ),
        JDRequirement(
            skill="Machine Learning",
            category="AI / Machine Learning",
            importance="Mandatory",
            synonyms_and_related=["scikit-learn", "ML"]
        )
    ]

    # Candidate omitted Python and Machine Learning from technical_skills list!
    resume = ExtractedResumeData(
        full_name="Bob Developer",
        technical_skills=["JavaScript", "React", "Node.js", "MongoDB"],
        projects=[
            {
                "name": "Network Intrusion Detection System",
                "technologies": ["Python", "scikit-learn", "pandas"],
                "bullets": [
                    "Developed a network intrusion detection system using Python, pandas, and scikit-learn to classify suspicious network traffic."
                ]
            }
        ]
    )

    direct_matched_skills = set()
    indirect_findings = discover_indirect_skills(requirements, resume, direct_matched_skills)
    discovered_skills = [f.requirement_name for f in indirect_findings]

    # Python must be found via project evidence
    assert "Python" in discovered_skills
    py_finding = next(f for f in indirect_findings if f.requirement_name == "Python")
    assert py_finding.confidence_level in ["High", "Medium"]
    assert "Project" in py_finding.source_project_or_experience
    assert "Network Intrusion" in py_finding.source_project_or_experience

    # scikit-learn in project demonstrates Machine Learning requirement
    assert "Machine Learning" in discovered_skills or any("Machine Learning" in f.relationship_explanation for f in indirect_findings)

def test_indirect_ecosystem_inference():
    """
    FastAPI in project implies Python ecosystem experience.
    """
    requirements = [
        JDRequirement(
            skill="Python",
            category="Programming Languages",
            importance="Mandatory",
            synonyms_and_related=[]
        )
    ]

    resume = ExtractedResumeData(
        full_name="Carol Engineer",
        technical_skills=["FastAPI", "PostgreSQL", "Docker"],
        projects=[
            {
                "name": "E-Commerce API Gateway",
                "technologies": ["FastAPI", "PostgreSQL"],
                "bullets": ["Architected async REST APIs using FastAPI and PostgreSQL with 99.9% uptime."]
            }
        ]
    )

    indirect_findings = discover_indirect_skills(requirements, resume, direct_matched_skills=set())
    req_names = [f.requirement_name for f in indirect_findings]

    assert "Python" in req_names
    py_finding = next(f for f in indirect_findings if f.requirement_name == "Python")
    assert "FastAPI" in py_finding.related_technology_or_activity or "FastAPI" in py_finding.relationship_explanation

def test_explainable_scoring_formula():
    """
    Overall score must be 10 * sum(dimension_score * dimension_weight),
    with weights summing to 1.0, and bounds [0.0, 10.0].
    """
    requirements = [
        JDRequirement(skill="Python", category="Programming Languages", importance="Mandatory", synonyms_and_related=[]),
        JDRequirement(skill="FastAPI", category="Frameworks", importance="Mandatory", synonyms_and_related=[]),
        JDRequirement(skill="Docker", category="DevOps", importance="Preferred", synonyms_and_related=[])
    ]

    resume = ExtractedResumeData(
        full_name="Dave Programmer",
        technical_skills=["Python", "FastAPI", "Docker", "Git"],
        work_experience=[
            {
                "role": "Backend Developer",
                "company": "SaaS Co",
                "bullets": [
                    "Built microservices with Python and FastAPI.",
                    "Containerized deployments using Docker and GitHub Actions."
                ]
            }
        ],
        projects=[
            {
                "name": "Cloud API Platform",
                "technologies": ["Python", "FastAPI", "Docker"],
                "bullets": ["Implemented production-ready backend API service with Docker containerization."]
            }
        ],
        education=[{"degree": "B.S. Computer Science", "institution": "State University"}]
    )

    direct = evaluate_direct_matching(requirements, resume)
    indirect = discover_indirect_skills(requirements, resume, set())
    proj_analyses = evaluate_all_projects(resume.projects, requirements)

    score, breakdown = calculate_explainable_score(
        requirements=requirements,
        resume_data=resume,
        direct_findings=direct,
        indirect_findings=indirect,
        project_analyses=proj_analyses
    )

    assert 0.0 <= score <= 10.0
    assert breakdown.overall_score == score
    assert sum(breakdown.dimension_weights.values()) == pytest.approx(1.0, 0.01)
    assert breakdown.evidence_coverage_percent > 80.0
    assert breakdown.analysis_confidence in ["High", "Medium"]
