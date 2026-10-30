const BASE_URL = 'http://localhost:8000/api';

function getToken(): string | null {
  return localStorage.getItem('token');
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Request failed' }));
    throw new Error(err.detail || `HTTP ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

// --- Auth ---
export interface UserResponse {
  id: string; email: string; name: string; role: string; created_at: string;
}
export interface TokenResponse {
  access_token: string; token_type: string; user: UserResponse;
}

export const authApi = {
  register: (data: { email: string; name: string; password: string; role: string }) =>
    request<TokenResponse>('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  login: (email: string, password: string) =>
    request<TokenResponse>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  profile: () => request<UserResponse>('/auth/profile'),
};

// --- Resumes ---
export interface ResumeResponse {
  id: string; owner_id: string; file_name: string; file_type: string;
  extracted_text: string; structured_data: Record<string, unknown>; created_at: string;
}

export const resumesApi = {
  upload: (file: File) => {
    const fd = new FormData();
    fd.append('file', file);
    return request<ResumeResponse>('/resumes/upload', { method: 'POST', body: fd });
  },
  list: () => request<ResumeResponse[]>('/resumes/'),
  get: (id: string) => request<ResumeResponse>(`/resumes/${id}`),
  delete: (id: string) => request<void>(`/resumes/${id}`, { method: 'DELETE' }),
};

// --- Job Descriptions ---
export interface JDRequirement {
  skill: string; category: string; importance: string;
  minimum_experience_years?: number | null; expected_proficiency?: string | null;
  synonyms_and_related: string[]; demonstration_criteria?: string | null;
}
export interface JobDescriptionResponse {
  id: string; owner_id: string; title: string; company: string;
  description: string; structured_requirements: JDRequirement[]; created_at: string;
}

export const jdsApi = {
  create: (data: { title: string; company?: string; description: string }) =>
    request<JobDescriptionResponse>('/jds/', { method: 'POST', body: JSON.stringify(data) }),
  list: () => request<JobDescriptionResponse[]>('/jds/'),
  get: (id: string) => request<JobDescriptionResponse>(`/jds/${id}`),
  delete: (id: string) => request<void>(`/jds/${id}`, { method: 'DELETE' }),
};

// --- Analyses ---
export interface ScoreBreakdown {
  overall_score: number; mandatory_skills_score: number; core_technical_skills_score: number;
  project_relevance_score: number; experience_implementation_score: number;
  domain_knowledge_score: number; other_qualifications_score: number;
  evidence_coverage_percent: number; analysis_confidence: string; score_interpretation: string;
  key_positive_factors: string[]; key_negative_factors: string[];
  unverified_requirements: string[]; dimension_weights: Record<string, number>;
}
export interface DirectFinding {
  requirement_name: string; evidence_classification: string; resume_section: string;
  supporting_excerpt: string; relevance_explanation: string; strength_of_evidence: string;
}
export interface IndirectFinding {
  requirement_name: string; related_technology_or_activity: string;
  source_project_or_experience: string; supporting_excerpt: string;
  relationship_explanation: string; confidence_level: string; what_remains_unverified: string;
}
export interface RequirementMatrixItem {
  requirement_name: string; category: string; importance: string;
  direct_evidence: string; project_evidence: string; indirect_match: string;
  confidence: string; status: string; score_contribution: number;
  supporting_excerpt?: string | null; source_section?: string | null;
}
export interface ProjectAnalysisItem {
  project_name: string; problem_addressed: string; purpose_domain: string;
  technologies_mentioned: string[]; architecture_components: string; candidate_contribution: string;
  implementation_details: string; complexity_indicators: string[]; technical_concepts: string[];
  jd_relevance_score: number; production_readiness: string; ownership_clarity: string;
  transferability: string; supporting_excerpts: string[]; unverified_claims: string[];
  improvement_suggestions: string[];
}
export interface InterviewQuestion {
  question: string; purpose_reason: string; related_jd_requirement: string;
  resume_evidence: string; evaluation_criteria?: string | null;
}
export interface RecommendationsSection {
  skills_section_improvements: Array<{ skill: string; evidence_location: string; recommendation: string }>;
  project_bullet_rewrites: Array<{ project_name: string; original_bullet: string; suggested_rewrite: string; rationale: string; focus_areas: string[] }>;
  keyword_alignment: { supported_keywords: string[]; potential_keywords_needs_confirmation: string[]; genuine_experience_gaps: string[] };
  prioritized_action_plan: string[];
  interview_prep_topics: string[];
  optional_learning_exercises: string[];
}
export interface CompanyIntelligence {
  company_name: string;
  work_culture_rating: number;
  culture_summary: string;
  hiring_and_interview_style: string;
  candidate_tips: string[];
  positive_sentiments: string[];
  cautionary_notes: string[];
  verified_sources: string[];
}
export interface AnalysisResponse {
  id: string; resume_id: string; job_description_id: string; owner_id: string;
  candidate_name: string; resume_file_name: string; job_title: string; company_name: string;
  overall_score: number; score_breakdown: ScoreBreakdown;
  requirements_matrix: RequirementMatrixItem[];
  direct_findings: DirectFinding[]; indirect_findings: IndirectFinding[];
  project_analyses: ProjectAnalysisItem[]; missing_requirements: string[];
  recommendations: RecommendationsSection; interview_questions: InterviewQuestion[];
  analysis_limitations: string[]; created_at: string;
  company_intel?: CompanyIntelligence | null;
  role_level?: string;
}
export interface CandidateComparisonSummary {
  analysis_id: string; resume_id: string; candidate_name: string; file_name: string;
  overall_score: number; mandatory_coverage_percent: number; direct_matches_count: number;
  indirect_matches_count: number; project_depth_score: number; experience_score: number;
  confidence: string; top_strengths: string[]; key_gaps: string[]; shortlist_status: string;
}
export interface CandidateComparisonResponse {
  job_description_id: string; job_title: string; company: string;
  scoring_weights: Record<string, number>; candidates: CandidateComparisonSummary[];
  requirements_cross_matrix: Array<Record<string, string>>;
}

export const analysesApi = {
  instant: (file: File | null, jd_text: string, job_title?: string, company_name?: string, resume_text?: string) => {
    const fd = new FormData();
    if (file) {
      fd.append('file', file);
    }
    if (resume_text) {
      fd.append('resume_text', resume_text);
    }
    fd.append('jd_text', jd_text);
    if (job_title) fd.append('job_title', job_title);
    if (company_name) fd.append('company_name', company_name);
    return request<AnalysisResponse>('/analyses/instant', { method: 'POST', body: fd });
  },
  run: (resume_id: string, jd_id: string) =>
    request<AnalysisResponse>('/analyses/', { method: 'POST', body: JSON.stringify({ resume_id, jd_id }) }),
  list: () => request<AnalysisResponse[]>('/analyses/'),
  get: (id: string) => request<AnalysisResponse>(`/analyses/${id}`),
  listForJd: (jd_id: string) => request<AnalysisResponse[]>(`/analyses/jd/${jd_id}`),
  compare: (jd_id: string) => request<CandidateComparisonResponse>(`/analyses/compare/${jd_id}`),
  delete: (id: string) => request<void>(`/analyses/${id}`, { method: 'DELETE' }),
};
