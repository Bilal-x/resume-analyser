import pytest
from app.models.schemas import (
    ExtractedResumeData, JDRequirement, EmploymentEntry,
    DirectFinding, IndirectFinding, ProjectAnalysisItem
)
from app.services.experience_analyzer import (
    evaluate_professional_experience,
    extract_resume_experience,
    extract_jd_experience_details
)
from app.services.scoring_engine import calculate_explainable_score

# ==============================================================================
# Mandatory Test 1: Education dates must never contribute to YOE
# ==============================================================================
def test_case_1_education_dates_never_contribute_to_yoe():
    resume = ExtractedResumeData(
        full_name="Student Bob",
        education=[{"details": "B.S. in Computer Science (2018 - 2022)"}],
        raw_sections={"education": "B.S. in Computer Science (2018 - 2022)"},
        structured_work_experience=[],
        projects=[]
    )
    eval_res = evaluate_professional_experience(
        resume_data=resume,
        jd_text="Looking for a Software Engineer with 2+ years of experience.",
        requirements=[]
    )
    assert eval_res.total_experience_months is None
    assert eval_res.experience_status == "not_available"
    assert eval_res.is_excluded_from_scoring is True
    assert extract_resume_experience(resume) == 0.0

# ==============================================================================
# Mandatory Test 2: Graduation dates must never contribute to YOE
# ==============================================================================
def test_case_2_graduation_dates_never_contribute_to_yoe():
    resume = ExtractedResumeData(
        full_name="Graduated Candidate",
        professional_summary="Graduated with honors in May 2018.",
        education=[{"details": "Graduated May 2018"}],
        raw_sections={"education": "Graduated May 2018"},
        structured_work_experience=[]
    )
    eval_res = evaluate_professional_experience(
        resume_data=resume,
        jd_text="Senior Developer 5+ years experience required.",
        requirements=[]
    )
    assert eval_res.total_experience_months is None
    assert eval_res.experience_status == "not_available"

# ==============================================================================
# Mandatory Test 3: Project dates must never contribute to YOE
# ==============================================================================
def test_case_3_project_dates_never_contribute_to_yoe():
    resume = ExtractedResumeData(
        full_name="Project Builder",
        projects=[
            {
                "name": "E-Commerce System",
                "raw_header": "E-Commerce System (Jan 2021 - Dec 2023)",
                "bullets": ["Engineered distributed store"],
                "technologies": ["Python", "Django"]
            }
        ],
        raw_sections={"projects": "E-Commerce System (Jan 2021 - Dec 2023)\n- Engineered distributed store"},
        structured_work_experience=[]
    )
    eval_res = evaluate_professional_experience(
        resume_data=resume,
        jd_text="Requires 3+ years professional software development experience.",
        requirements=[]
    )
    assert eval_res.total_experience_months is None
    assert eval_res.experience_status == "not_available"

# ==============================================================================
# Mandatory Test 4: Employment dates contribute to YOE
# ==============================================================================
def test_case_4_employment_dates_contribute_to_yoe():
    resume = ExtractedResumeData(
        full_name="Jane Doe",
        raw_sections={"experience": "Software Engineer at Tech Solutions\nJan 2022 - Dec 2023\n- Built microservices"},
        structured_work_experience=[
            EmploymentEntry(
                job_title="Software Engineer",
                company="Tech Solutions",
                employment_type="Full-time",
                start_date="2022-01",
                end_date="2023-12",
                duration_months=24,
                source_section="Work Experience",
                relevant_technologies=["Python", "FastAPI"]
            )
        ]
    )
    eval_res = evaluate_professional_experience(
        resume_data=resume,
        jd_text="Requires 2 years software engineering experience.",
        requirements=[]
    )
    assert eval_res.total_experience_months == 24
    assert eval_res.experience_status == "meets_requirement"
    assert eval_res.experience_gap_months == 0

# ==============================================================================
# Mandatory Test 5: Overlapping jobs are not double-counted (Interval Merge)
# ==============================================================================
def test_case_5_overlapping_jobs_not_double_counted():
    # Job A: January 2022 – December 2023 (24 months)
    # Job B: July 2023 – June 2025 (24 months)
    # Combined span: January 2022 – June 2025 (42 months, NOT 48 months)
    resume = ExtractedResumeData(
        full_name="Dual Worker",
        raw_sections={"experience": "Job A\nJan 2022 - Dec 2023\nJob B\nJul 2023 - Jun 2025"},
        structured_work_experience=[
            EmploymentEntry(
                job_title="Backend Developer",
                company="Company A",
                employment_type="Full-time",
                start_date="2022-01",
                end_date="2023-12",
                duration_months=24
            ),
            EmploymentEntry(
                job_title="Contract Engineer",
                company="Company B",
                employment_type="Full-time",
                start_date="2023-07",
                end_date="2025-06",
                duration_months=24
            )
        ]
    )
    eval_res = evaluate_professional_experience(
        resume_data=resume,
        jd_text="Looking for 3+ years experienced engineer.",
        requirements=[]
    )
    assert eval_res.total_experience_months == 42  # 3.5 years, not 48 months

# ==============================================================================
# Mandatory Test 6: Current jobs use the current date
# ==============================================================================
def test_case_6_current_jobs_use_the_current_date():
    resume = ExtractedResumeData(
        full_name="Current Role Worker",
        raw_sections={"experience": "Engineer at LiveCorp\nJan 2024 - Present"},
        structured_work_experience=[
            EmploymentEntry(
                job_title="Engineer",
                company="LiveCorp",
                employment_type="Full-time",
                start_date="2024-01",
                end_date=None,
                is_current=True
            )
        ]
    )
    # Testing against current_year=2026, current_month=10:
    # (2026 * 12 + 10) - (2024 * 12 + 1) + 1 = 34 months
    eval_res = evaluate_professional_experience(
        resume_data=resume,
        jd_text="Requires 2+ years experience.",
        requirements=[],
        current_year=2026,
        current_month=10
    )
    assert eval_res.total_experience_months == 34
    assert eval_res.experience_status == "meets_requirement"

# ==============================================================================
# Mandatory Test 7: Missing work experience does not stop analysis
# ==============================================================================
def test_case_7_missing_work_experience_does_not_stop_analysis():
    from app.services.analysis_pipeline import run_analysis_pipeline
    resume = ExtractedResumeData(
        full_name="Fresher Coder",
        technical_skills=["Python", "FastAPI", "PostgreSQL"],
        projects=[
            {
                "name": "Smart Analytics",
                "raw_header": "Smart Analytics App",
                "bullets": ["Built API endpoints with FastAPI and PostgreSQL"],
                "technologies": ["Python", "FastAPI", "PostgreSQL"]
            }
        ],
        raw_sections={"skills": "Python, FastAPI, PostgreSQL", "projects": "Smart Analytics App"}
    )
    reqs = [
        JDRequirement(skill="Python", category="Mandatory technical skills", importance="Mandatory"),
        JDRequirement(skill="FastAPI", category="Frameworks", importance="Preferred")
    ]
    # Execute analysis without Work Experience section
    res = run_analysis_pipeline(
        analysis_id="test_no_exp_id",
        resume_id="r1",
        job_description_id="jd1",
        owner_id="guest",
        candidate_name="Fresher Coder",
        resume_file_name="fresher.pdf",
        job_title="Python Developer",
        company_name="Innovate Ltd",
        requirements=reqs,
        resume_data=resume
    )
    assert res.overall_score > 0.0
    assert res.experience_evaluation.experience_status == "not_available"
    assert res.experience_evaluation.is_excluded_from_scoring is True
    assert len(res.direct_findings) > 0

# ==============================================================================
# Mandatory Test 8: Missing experience does not automatically reduce overall score
# ==============================================================================
def test_case_8_missing_experience_does_not_automatically_reduce_score():
    resume = ExtractedResumeData(
        full_name="Skilled Fresher",
        technical_skills=["Python", "Django", "PostgreSQL", "Docker"],
        projects=[
            {
                "name": "Cloud Platform",
                "bullets": ["Architected backend using Django and PostgreSQL with Docker deployment."],
                "technologies": ["Python", "Django", "PostgreSQL", "Docker"]
            }
        ],
        raw_sections={"skills": "Python, Django, PostgreSQL, Docker"}
    )
    reqs = [
        JDRequirement(skill="Python", category="Mandatory technical skills", importance="Mandatory"),
        JDRequirement(skill="Django", category="Frameworks", importance="Mandatory")
    ]
    eval_no_exp = evaluate_professional_experience(resume, "Python Developer", reqs)
    score, breakdown = calculate_explainable_score(
        requirements=reqs,
        resume_data=resume,
        direct_findings=[
            DirectFinding(
                requirement_name="Python",
                evidence_classification="Direct match",
                resume_section="Skills",
                supporting_excerpt="Python",
                relevance_explanation="Direct match",
                strength_of_evidence="Declared"
            ),
            DirectFinding(
                requirement_name="Django",
                evidence_classification="Direct match",
                resume_section="Skills",
                supporting_excerpt="Django",
                relevance_explanation="Direct match",
                strength_of_evidence="Declared"
            )
        ],
        indirect_findings=[],
        project_analyses=[],
        job_title="Junior Python Developer",
        experience_eval=eval_no_exp
    )
    # The score should remain high (>= 7.5) because weight was redistributed, not zeroed out!
    assert score >= 7.5
    assert breakdown.dimension_weights.get("relevant_experience_application") == 0.0

# ==============================================================================
# Mandatory Test 9: General YOE and technology-specific YOE evaluated separately
# ==============================================================================
def test_case_9_general_yoe_and_tech_specific_yoe_evaluated_separately():
    resume = ExtractedResumeData(
        full_name="Java Developer Pivoting to Python",
        raw_sections={"experience": "Job 1\nJan 2021 - Dec 2023\nJob 2\nJan 2024 - Jun 2024"},
        structured_work_experience=[
            EmploymentEntry(
                job_title="Java Developer",
                company="Legacy Bank",
                employment_type="Full-time",
                start_date="2021-01",
                end_date="2023-12",
                duration_months=36,
                relevant_technologies=["Java", "Spring Boot"]
            ),
            EmploymentEntry(
                job_title="Python Developer",
                company="Modern AI",
                employment_type="Full-time",
                start_date="2024-01",
                end_date="2024-06",
                duration_months=6,
                relevant_technologies=["Python", "FastAPI"]
            )
        ]
    )
    jd_text = "Minimum 2 years of Python development experience required."
    eval_res = evaluate_professional_experience(
        resume_data=resume,
        jd_text=jd_text,
        requirements=[],
        job_title="Python Engineer"
    )
    assert eval_res.total_experience_months == 42  # 3.5 years general
    assert eval_res.relevant_experience_months == 6  # 0.5 years in Python
    assert eval_res.experience_gap_months == 18     # 24 - 6 = 18 months gap
    assert eval_res.experience_status == "partially_meets_requirement"

# ==============================================================================
# Mandatory Test 10: Invalid or ambiguous dates are not silently invented
# ==============================================================================
def test_case_10_ambiguous_dates_not_silently_invented():
    from app.services.parser import extract_dates_from_text
    # "Worked in 2023" lacks start/end interval
    start, end, is_current, dur, is_uncertain = extract_dates_from_text("Worked at Startup in 2023")
    assert is_uncertain is True
    assert dur is None

    # Resume with ambiguous dates
    resume = ExtractedResumeData(
        full_name="Ambiguous Dates",
        raw_sections={"experience": "Developer at Startup\n2023"},
        structured_work_experience=[
            EmploymentEntry(
                job_title="Developer",
                company="Startup",
                is_uncertain_date=True,
                duration_months=None
            )
        ]
    )
    eval_res = evaluate_professional_experience(
        resume_data=resume,
        jd_text="Requires 2 years experience.",
        requirements=[]
    )
    assert eval_res.experience_status == "unable_to_verify"
    assert eval_res.total_experience_months is None
    assert eval_res.confidence_level == "Low"

# ==============================================================================
# Mandatory Test 11: Internships are classified separately
# ==============================================================================
def test_case_11_internships_classified_separately():
    resume = ExtractedResumeData(
        full_name="Intern then Engineer",
        raw_sections={"experience": "Intern at BigCorp\nJan 2023 - Jun 2023\nEngineer at BigCorp\nJul 2023 - Dec 2024"},
        structured_work_experience=[
            EmploymentEntry(
                job_title="Software Engineering Intern",
                company="BigCorp",
                employment_type="Internship",
                start_date="2023-01",
                end_date="2023-06",
                duration_months=6
            ),
            EmploymentEntry(
                job_title="Software Engineer",
                company="BigCorp",
                employment_type="Full-time",
                start_date="2023-07",
                end_date="2024-12",
                duration_months=18
            )
        ]
    )
    eval_res = evaluate_professional_experience(
        resume_data=resume,
        jd_text="Requires 2 years of professional software engineering experience.",
        requirements=[]
    )
    assert eval_res.internship_months == 6
    assert eval_res.total_experience_months == 18  # Internship kept separate from regular employment

# ==============================================================================
# Mandatory Test 12: Score calculations remain correct when dimension excluded
# ==============================================================================
def test_case_12_score_calculations_correct_when_dimension_excluded():
    resume = ExtractedResumeData(
        full_name="Dimension Test",
        technical_skills=["React", "TypeScript"],
        raw_sections={"skills": "React, TypeScript"}
    )
    reqs = [
        JDRequirement(skill="React", category="Mandatory technical skills", importance="Mandatory"),
        JDRequirement(skill="TypeScript", category="Mandatory technical skills", importance="Mandatory")
    ]
    eval_excluded = evaluate_professional_experience(resume, "React Developer", reqs)
    assert eval_excluded.is_excluded_from_scoring is True

    score, breakdown = calculate_explainable_score(
        requirements=reqs,
        resume_data=resume,
        direct_findings=[
            DirectFinding(
                requirement_name="React",
                evidence_classification="Direct match",
                resume_section="Skills",
                supporting_excerpt="React",
                relevance_explanation="Direct match",
                strength_of_evidence="Strong"
            ),
            DirectFinding(
                requirement_name="TypeScript",
                evidence_classification="Direct match",
                resume_section="Skills",
                supporting_excerpt="TypeScript",
                relevance_explanation="Direct match",
                strength_of_evidence="Strong"
            )
        ],
        indirect_findings=[],
        project_analyses=[],
        job_title="Senior React Developer",
        custom_weights={
            "mandatory_technical_skills": 0.30,
            "core_technical_skills": 0.25,
            "project_relevance_depth": 0.25,
            "relevant_experience_application": 0.20
        },
        experience_eval=eval_excluded
    )
    # Proportional redistribution:
    # 0.30 / 0.80 = 0.375
    # 0.25 / 0.80 = 0.3125
    # 0.25 / 0.80 = 0.3125
    weights = breakdown.dimension_weights
    assert weights["relevant_experience_application"] == 0.0
    assert pytest.approx(weights["mandatory_technical_skills"], 0.001) == 0.375
    assert pytest.approx(weights["core_technical_skills"], 0.001) == 0.3125
    assert pytest.approx(weights["project_relevance_depth"], 0.001) == 0.3125
    assert pytest.approx(sum(weights.values()), 0.001) == 1.0
    assert 0.0 <= score <= 10.0
