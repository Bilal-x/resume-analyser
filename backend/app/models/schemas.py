from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

# --- Auth & User Schemas ---
class UserBase(BaseModel):
    email: str
    name: str
    role: str = "candidate"  # "candidate" or "recruiter"

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class UserResponse(UserBase):
    id: str
    created_at: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

# --- Resume Schemas ---
class ExtractedSection(BaseModel):
    section_name: str
    content: str
    page_number: Optional[int] = 1

class ExtractedResumeData(BaseModel):
    full_name: Optional[str] = "Candidate"
    email: Optional[str] = None
    phone: Optional[str] = None
    linkedin: Optional[str] = None
    github: Optional[str] = None
    professional_summary: Optional[str] = None
    technical_skills: List[str] = Field(default_factory=list)
    programming_languages: List[str] = Field(default_factory=list)
    frameworks_libraries: List[str] = Field(default_factory=list)
    databases: List[str] = Field(default_factory=list)
    cloud_platforms: List[str] = Field(default_factory=list)
    devops_tools: List[str] = Field(default_factory=list)
    work_experience: List[Dict[str, Any]] = Field(default_factory=list)
    projects: List[Dict[str, Any]] = Field(default_factory=list)
    education: List[Dict[str, Any]] = Field(default_factory=list)
    certifications: List[str] = Field(default_factory=list)
    achievements: List[str] = Field(default_factory=list)
    raw_sections: Dict[str, str] = Field(default_factory=dict)

class ResumeResponse(BaseModel):
    id: str
    owner_id: str
    file_name: str
    file_type: str
    extracted_text: str
    structured_data: ExtractedResumeData
    created_at: str

# --- Job Description Schemas ---
class JDRequirement(BaseModel):
    skill: str
    category: str
    importance: str = "Mandatory"  # "Mandatory" or "Preferred"
    minimum_experience_years: Optional[float] = None
    expected_proficiency: Optional[str] = None
    synonyms_and_related: List[str] = Field(default_factory=list)
    demonstration_criteria: Optional[str] = None

class JobDescriptionCreate(BaseModel):
    title: str
    company: Optional[str] = "Company"
    description: str

class JobDescriptionResponse(BaseModel):
    id: str
    owner_id: str
    title: str
    company: str
    description: str
    structured_requirements: List[JDRequirement]
    created_at: str

# --- Findings & Evidence Schemas ---
class DirectFinding(BaseModel):
    requirement_name: str
    evidence_classification: str
    resume_section: str
    supporting_excerpt: str
    relevance_explanation: str
    strength_of_evidence: str  # Strong, Moderate, Limited, Unverified

class IndirectFinding(BaseModel):
    requirement_name: str
    related_technology_or_activity: str
    source_project_or_experience: str
    supporting_excerpt: str
    relationship_explanation: str
    confidence_level: str  # High, Medium, Low
    what_remains_unverified: str

class RequirementMatrixItem(BaseModel):
    requirement_name: str
    category: str
    importance: str  # Mandatory, Preferred
    direct_evidence: str
    project_evidence: str
    indirect_match: str
    confidence: str  # High, Medium, Low
    status: str  # Supported, Project-derived, Transferable, Partial, Unverified, Not evidenced
    score_contribution: float
    supporting_excerpt: Optional[str] = None
    source_section: Optional[str] = None

class ProjectAnalysisItem(BaseModel):
    project_name: str
    problem_addressed: str
    purpose_domain: str
    technologies_mentioned: List[str]
    architecture_components: str
    candidate_contribution: str
    implementation_details: str
    complexity_indicators: List[str]
    technical_concepts: List[str]
    jd_relevance_score: float  # 0 to 10
    production_readiness: str  # High, Medium, Low
    ownership_clarity: str  # High, Moderate, Vague
    transferability: str
    supporting_excerpts: List[str]
    unverified_claims: List[str]
    improvement_suggestions: List[str]

class ScoreBreakdown(BaseModel):
    overall_score: float  # 0 to 10
    mandatory_skills_score: float  # 0 to 10
    core_technical_skills_score: float  # 0 to 10
    project_relevance_score: float  # 0 to 10
    experience_implementation_score: float  # 0 to 10
    domain_knowledge_score: float  # 0 to 10
    other_qualifications_score: float  # 0 to 10
    evidence_coverage_percent: float  # 0 to 100
    analysis_confidence: str  # High, Medium, Low
    score_interpretation: str
    key_positive_factors: List[str]
    key_negative_factors: List[str]
    unverified_requirements: List[str]
    dimension_weights: Dict[str, float]

class BulletRewrite(BaseModel):
    project_name: str
    original_bullet: str
    suggested_rewrite: str
    rationale: str
    focus_areas: List[str]

class SkillImprovement(BaseModel):
    skill: str
    evidence_location: str
    recommendation: str

class KeywordAlignment(BaseModel):
    supported_keywords: List[str]
    potential_keywords_needs_confirmation: List[str]
    genuine_experience_gaps: List[str]

class RecommendationsSection(BaseModel):
    skills_section_improvements: List[SkillImprovement]
    project_bullet_rewrites: List[BulletRewrite]
    keyword_alignment: KeywordAlignment
    prioritized_action_plan: List[str]
    interview_prep_topics: List[str]
    optional_learning_exercises: List[str]

class InterviewQuestion(BaseModel):
    question: str
    purpose_reason: str
    related_jd_requirement: str
    resume_evidence: str
    evaluation_criteria: Optional[str] = None

# --- Company Intelligence Schema ---
class CompanyIntelligence(BaseModel):
    company_name: str
    work_culture_rating: float = 4.2
    culture_summary: str
    hiring_and_interview_style: str
    candidate_tips: List[str] = Field(default_factory=list)
    positive_sentiments: List[str] = Field(default_factory=list)
    cautionary_notes: List[str] = Field(default_factory=list)
    verified_sources: List[str] = Field(default_factory=list)

# --- Complete Analysis Result Schema ---
class AnalysisResponse(BaseModel):
    id: str
    resume_id: str
    job_description_id: str
    owner_id: str
    candidate_name: str
    resume_file_name: str
    job_title: str
    company_name: str
    overall_score: float
    score_breakdown: ScoreBreakdown
    requirements_matrix: List[RequirementMatrixItem]
    direct_findings: List[DirectFinding]
    indirect_findings: List[IndirectFinding]
    project_analyses: List[ProjectAnalysisItem]
    missing_requirements: List[str]
    recommendations: RecommendationsSection
    interview_questions: List[InterviewQuestion]
    analysis_limitations: List[str]
    created_at: str
    company_intel: Optional[CompanyIntelligence] = None
    role_level: Optional[str] = "Standard"
    years_experience_required: Optional[float] = None
    years_experience_found: Optional[float] = None
    experience_assessment: Optional[str] = None
    creative_summary: Optional[str] = None

# --- Candidate Comparison Schemas ---
class CandidateComparisonSummary(BaseModel):
    analysis_id: str
    resume_id: str
    candidate_name: str
    file_name: str
    overall_score: float
    mandatory_coverage_percent: float
    direct_matches_count: int
    indirect_matches_count: int
    project_depth_score: float
    experience_score: float
    confidence: str
    top_strengths: List[str]
    key_gaps: List[str]
    shortlist_status: Optional[str] = "review"  # shortlisted, rejected, review

class CandidateComparisonResponse(BaseModel):
    job_description_id: str
    job_title: str
    company: str
    scoring_weights: Dict[str, float]
    candidates: List[CandidateComparisonSummary]
    requirements_cross_matrix: List[Dict[str, Any]]
