import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight, CheckCircle2, FileSearch, Zap,
  Shield, Brain, Sparkles, UploadCloud, FileText,
  FileCheck, AlertCircle, Layers, TrendingUp
} from 'lucide-react';
import { Button, ScoreRing, DevWorkingModal } from '../components/ui';
import { analysesApi, type AnalysisResponse } from '../lib/api';

const SAMPLE_RESUME_TEXT = `Alex Chen
alex.chen@example.com | (555) 234-5678 | San Francisco, CA
linkedin.com/in/alexchen-eng | github.com/alexchen-dev

PROFESSIONAL SUMMARY
Senior Full-Stack & Systems Engineer with 6+ years of experience architecting distributed checkout services, high-concurrency payment APIs, and responsive React/Next.js interfaces. Proven track record scaling multi-region cloud services to 40,000 req/sec while optimizing p99 latency under 45ms.

TECHNICAL SKILLS
Languages: TypeScript, JavaScript, Python, Go, SQL, HTML5, CSS3
Frameworks & Libraries: React, Next.js, Node.js, Express, FastAPI, TailwindCSS
Databases & Cache: PostgreSQL, Redis, DynamoDB, MongoDB
Infrastructure & Cloud: Docker, Kubernetes, AWS (Lambda, ECS, S3, RDS), CI/CD, Git
Architectural Principles: Distributed Systems, Microservices, REST APIs, GraphQL, Event-Driven Architecture

KEY PROJECTS & EXPERIENCE
Stripe Checkout Platform Overhaul (Senior Full-Stack Engineer)
- Architected and delivered high-throughput payment processing engine in Go and TypeScript, processing $18M+ daily volume across 3 AWS regions with 99.99% availability.
- Optimized database indexing and Redis read-through caching layers, cutting p99 checkout response times from 180ms to 42ms.
- Built developer-facing analytics dashboard in React and Next.js App Router with real-time WebSocket transaction streams.

Enterprise Cloud Billing Engine (Full-Stack Engineer)
- Designed resilient microservices architecture in Python and FastAPI backed by PostgreSQL and Celery asynchronous task workers.
- Implemented robust multi-tenant authorization policies and containerized deployments using Docker and Kubernetes.
- Authored automated integration test suites achieving 92% code coverage across billing webhooks and payment gateways.

EDUCATION
B.S. in Computer Science — University of California, Berkeley (2018)`;

const SAMPLE_JD_TEXT = `We are seeking a Senior Full-Stack Engineer to lead the architecture of our core checkout and payment surfaces.

Key Requirements:
- 5+ years of software engineering experience with modern full-stack web applications.
- Strong proficiency in TypeScript, React, and Next.js for high-performance frontend engineering.
- Deep hands-on experience building backend microservices in Go, Python, or Node.js.
- Verifiable track record with distributed systems, high-concurrency APIs, and p99 latency optimization.
- Solid database fundamentals with PostgreSQL and Redis caching.
- Familiarity with containerized workflows using Docker and Kubernetes.
- Excellent technical communication and ability to mentor team members.`;

export default function LandingPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Instant Analysis Form State
  const [file, setFile] = useState<File | null>(null);
  const [resumeText, setResumeText] = useState<string>('');
  const [jobTitle, setJobTitle] = useState<string>('Senior Full-Stack Engineer');
  const [companyName, setCompanyName] = useState<string>('Stripe');
  const [jdText, setJdText] = useState<string>(SAMPLE_JD_TEXT);

  // Execution State
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResponse | null>(null);

  // Modal State for Options 2 & 3
  const [isDevModalOpen, setIsDevModalOpen] = useState<boolean>(false);
  const [devModalTitle, setDevModalTitle] = useState<string>('Feature in Active Development');

  // Drag and drop state
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    setResumeText('');
    setError(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleLoadSample = () => {
    setFile(null);
    setResumeText(SAMPLE_RESUME_TEXT);
    setJobTitle('Senior Full-Stack Engineer');
    setCompanyName('Stripe');
    setJdText(SAMPLE_JD_TEXT);
    setError(null);
  };

  const handleRunInstantAnalysis = async () => {
    if (!file && !resumeText.trim()) {
      setError('Please upload a resume file (PDF/DOCX/TXT) or click "Load Sample Resume".');
      return;
    }
    if (!jdText.trim()) {
      setError('Please provide the job description requirements.');
      return;
    }

    setError(null);
    setIsAnalyzing(true);

    try {
      const result = await analysesApi.instant(
        file,
        jdText,
        jobTitle || 'Target Role',
        companyName || '',
        file ? undefined : resumeText
      );
      setAnalysisResult(result);
      // Smooth scroll to the basic analysis results
      setTimeout(() => {
        const resultSection = document.getElementById('basic-analysis-section');
        if (resultSection) {
          resultSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 150);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Analysis failed. Please verify your file format and try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Option 1 Click Handler: Redirect to Login with Typewriter Prompt
  const handleOption1MoreFindings = () => {
    navigate('/login?from=instant&prompt=unlock');
  };

  // Option 2 & 3 Click Handlers: Show Stylish Popup
  const handleOption2AtsResume = () => {
    setDevModalTitle('Create an ATS-Friendly Resume (will implement soon)');
    setIsDevModalOpen(true);
  };

  const handleOption3InterviewPrep = () => {
    setDevModalTitle('Interview Preparation Matrix (will implement soon)');
    setIsDevModalOpen(true);
  };

  return (
    <div className="min-h-screen w-full bg-white text-slate-900 flex flex-col font-sans antialiased selection:bg-slate-200 selection:text-slate-900">
      {/* Dev Working Modal for Options 2 & 3 */}
      <DevWorkingModal
        isOpen={isDevModalOpen}
        onClose={() => setIsDevModalOpen(false)}
        featureTitle={devModalTitle}
      />

      {/* ============================================================
          TOP NAVIGATION BAR (Clean White Header)
          ============================================================ */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-2xs">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center shadow-xs group-hover:bg-slate-800 transition-colors">
              <Layers size={17} />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-bold text-slate-900 text-base tracking-tight">Resume Analyzer</span>
              <span className="text-[10px] font-mono font-medium px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200">
                v2.4
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm text-slate-600 font-medium">
            <a href="#instant-tool" className="text-slate-900 hover:text-slate-950 font-semibold transition-colors">
              Instant Analysis
            </a>
            <a href="#how-it-works" className="hover:text-slate-900 transition-colors">
              How It Works
            </a>
            <a href="#capabilities" className="hover:text-slate-900 transition-colors">
              Forensic Capabilities
            </a>
          </nav>

          <div className="flex items-center gap-2.5 shrink-0">
            <Link to="/login" className="text-xs sm:text-sm text-slate-600 hover:text-slate-900 font-medium px-2.5 py-1.5 transition-colors">
              Sign in
            </Link>
            <Link to="/register">
              <Button size="sm" variant="primary" iconRight={<ArrowRight size={13} />} className="text-xs sm:text-sm px-3.5 py-1.5">
                Get started free
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* ============================================================
          HERO & INSTANT WORKSPACE (White Bg with Subtle Micro-Grid Texture)
          ============================================================ */}
      <main className="flex-1 micro-grid relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14 pb-16">
          
          {/* Hero Header */}
          <section className="max-w-3xl mx-auto text-center mb-10 sm:mb-12">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100/90 border border-slate-200 mb-4 shadow-2xs">
              <Sparkles size={14} className="text-amber-500" />
              <span className="text-xs font-mono text-slate-700 font-medium">
                Instant ATS & Role Fit Engine • No sign-in required
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-slate-950 leading-tight mb-3">
              Evaluate your resume against any role instantly.
            </h1>
            <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Upload your resume and paste a job description without signing in to get immediate, evidence-based scoring and verified project citations.
            </p>
          </section>

          {/* ============================================================
              DUAL-COLUMN WORKSPACE: 1. RESUME + 2. JOB DESCRIPTION
              ============================================================ */}
          <section id="instant-tool" className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-7 shadow-sm mb-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
              
              {/* LEFT COLUMN: 1. UPLOAD RESUME */}
              <div className="flex flex-col">
                <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-200/80">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200">
                      STEP 01
                    </span>
                    <h2 className="text-sm sm:text-base font-semibold text-slate-900">1. Upload Resume</h2>
                  </div>
                  <button
                    type="button"
                    onClick={handleLoadSample}
                    className="text-xs font-mono text-blue-600 hover:text-blue-800 underline underline-offset-2 transition-colors cursor-pointer"
                  >
                    Load sample resume
                  </button>
                </div>

                {/* Tactile Drop Zone */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={e => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                  accept=".pdf,.docx,.txt"
                  className="hidden"
                />

                <div
                  onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-6 sm:p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-150 ${
                    isDragging
                      ? 'border-slate-900 bg-slate-50'
                      : file || resumeText
                      ? 'border-emerald-300 bg-emerald-50/20 hover:border-emerald-400'
                      : 'border-slate-300 bg-slate-50/60 hover:bg-slate-50 hover:border-slate-400'
                  }`}
                >
                  <div className="w-12 h-12 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-700 shadow-2xs mb-3 group-hover:scale-105 transition-transform">
                    <UploadCloud size={24} className="text-slate-800" />
                  </div>

                  <p className="text-sm font-semibold text-slate-900 mb-1">
                    {file ? 'File selected (click to change)' : 'Drop your resume here or click to browse'}
                  </p>
                  <p className="text-xs text-slate-500 max-w-xs">
                    Supports PDF, DOCX, or TXT up to 10MB
                  </p>

                  <div className="flex items-center gap-3 mt-4 pt-3 border-t border-slate-200/80 w-full justify-center text-[11px] font-mono text-slate-500">
                    <span className="flex items-center gap-1">
                      <FileText size={12} /> PDF Engine
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <FileCheck size={12} /> DOCX Support
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Sparkles size={12} /> Local Parsing
                    </span>
                  </div>
                </div>

                {/* Selected File / Sample Preview Bar */}
                {(file || resumeText) && (
                  <div className="mt-3.5 p-3 rounded-lg border border-slate-200 bg-slate-50/80 flex items-center justify-between">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded bg-white border border-slate-200 text-slate-700 flex items-center justify-center shrink-0">
                        <FileText size={15} />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-mono font-semibold text-slate-900 truncate">
                          {file ? file.name : 'alex_chen_senior_fullstack_resume.txt (Sample)'}
                        </div>
                        <div className="text-[11px] text-emerald-700 flex items-center gap-1">
                          <CheckCircle2 size={11} className="text-emerald-600" />
                          Ready for vector parsing
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => { setFile(null); setResumeText(''); }}
                      className="text-xs text-slate-500 hover:text-red-600 transition-colors px-2 py-1 cursor-pointer"
                    >
                      Clear
                    </button>
                  </div>
                )}
              </div>

              {/* RIGHT COLUMN: 2. TARGET JOB ROLE */}
              <div className="flex flex-col">
                <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-200/80">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200">
                      STEP 02
                    </span>
                    <h2 className="text-sm sm:text-base font-semibold text-slate-900">2. Target Job Role</h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setJobTitle('Senior Full-Stack Engineer');
                      setCompanyName('Stripe');
                      setJdText(SAMPLE_JD_TEXT);
                    }}
                    className="text-xs font-mono text-blue-600 hover:text-blue-800 underline underline-offset-2 transition-colors cursor-pointer"
                  >
                    Reset sample JD
                  </button>
                </div>

                {/* Job Title & Company */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="block text-[11px] font-mono font-semibold text-slate-600 mb-1 uppercase tracking-wide">
                      Job Title
                    </label>
                    <input
                      type="text"
                      value={jobTitle}
                      onChange={e => setJobTitle(e.target.value)}
                      placeholder="e.g. Senior Full-Stack Engineer"
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 shadow-2xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-mono font-semibold text-slate-600 mb-1 uppercase tracking-wide">
                      Company
                    </label>
                    <input
                      type="text"
                      value={companyName}
                      onChange={e => setCompanyName(e.target.value)}
                      placeholder="e.g. Stripe, Linear, Vercel"
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 shadow-2xs"
                    />
                  </div>
                </div>

                {/* JD Requirements Textarea */}
                <div className="flex-1 flex flex-col">
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[11px] font-mono font-semibold text-slate-600 uppercase tracking-wide">
                      Job Description Requirements
                    </label>
                    <span className="text-[10px] font-mono text-slate-500">
                      {jdText.trim().split(/\s+/).filter(Boolean).length} words
                    </span>
                  </div>
                  <textarea
                    rows={6}
                    value={jdText}
                    onChange={e => setJdText(e.target.value)}
                    placeholder="Paste job description requirements, responsibilities, and required qualifications..."
                    className="w-full flex-1 bg-white border border-slate-200 rounded-lg p-3 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 font-sans resize-none shadow-2xs leading-relaxed"
                  />
                </div>
              </div>
            </div>

            {/* Error Message Notice */}
            {error && (
              <div className="mt-4 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5">
                <AlertCircle size={16} className="text-red-600 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{error}</span>
              </div>
            )}

            {/* Central High-Craft CTA */}
            <div className="mt-6 pt-5 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-slate-500 text-xs font-mono">
                <Zap size={14} className="text-amber-500" />
                <span>Computed with deterministic, auditable evidence extraction</span>
              </div>

              <Button
                size="lg"
                variant="primary"
                loading={isAnalyzing}
                onClick={handleRunInstantAnalysis}
                icon={<Zap size={16} />}
                className="w-full sm:w-auto px-7 py-3 text-sm font-semibold shadow-md"
              >
                {isAnalyzing ? 'Analyzing Resume & JD Requirements...' : 'Analyze Match Instantly'}
              </Button>
            </div>
          </section>

          {/* ============================================================
              BASIC ANALYSIS RESULT SECTION
              Rendered immediately when instant analysis completes
              ============================================================ */}
          {analysisResult && (
            <section
              id="basic-analysis-section"
              className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-md mb-12 animate-fade-in-up"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-6 border-b border-slate-200 gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                      DIAGNOSTIC REPORT
                    </span>
                    <span className="text-xs font-mono text-slate-500">
                      Job Fit & Evidence Analysis
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-slate-950 tracking-tight">
                    Basic Analysis: {analysisResult.job_title} {analysisResult.company_name ? `@ ${analysisResult.company_name}` : ''}
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
                    Candidate: {analysisResult.candidate_name}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
                {/* Score Visualizer (Left Column: 4 cols) */}
                <div className="lg:col-span-4 bg-slate-50 border border-slate-200 rounded-xl p-6 flex flex-col items-center justify-center text-center">
                  <div className="mb-4">
                    <ScoreRing score={analysisResult.overall_score} size={140} strokeWidth={8} />
                  </div>

                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-mono font-medium border border-emerald-200 mb-2.5">
                    <CheckCircle2 size={13} className="text-emerald-700" />
                    <span>{analysisResult.score_breakdown.score_interpretation}</span>
                  </div>

                  <p className="text-xs text-slate-600 max-w-xs leading-relaxed">
                    Evaluated across {analysisResult.requirements_matrix.length} job requirements with {analysisResult.score_breakdown.evidence_coverage_percent.toFixed(0)}% verified evidence coverage.
                  </p>
                </div>

                {/* Alignment Breakdown (Right Column: 8 cols) */}
                <div className="lg:col-span-8 flex flex-col justify-between">
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900 mb-1.5">Executive Summary</h4>
                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed mb-5">
                      Candidate demonstrates strong alignment with <span className="font-semibold text-slate-900">{analysisResult.job_title}</span>. 
                      Evidence trails confirm direct proficiency in core technical requirements, supported by verified project contributions.
                    </p>

                    {/* Verified Technical Skills */}
                    <div className="mb-5">
                      <div className="text-[11px] font-mono font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <CheckCircle2 size={13} className="text-emerald-600" />
                        <span>Verified Skills Found ({analysisResult.direct_findings.length + analysisResult.indirect_findings.length})</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {analysisResult.direct_findings.slice(0, 8).map((df, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white border border-slate-200 text-slate-800 text-xs font-mono shadow-2xs"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            {df.requirement_name}
                          </span>
                        ))}
                        {analysisResult.indirect_findings.slice(0, 4).map((inf, idx) => (
                          <span
                            key={`inf-${idx}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white border border-slate-200 text-slate-700 text-xs font-mono shadow-2xs"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                            {inf.requirement_name} (Demonstrated)
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Demonstrated Strengths & Gap Summary */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                      <div className="p-3 rounded-lg border border-slate-200 bg-slate-50">
                        <span className="text-xs font-semibold text-slate-900 flex items-center gap-1.5 mb-1">
                          <TrendingUp size={13} className="text-emerald-600" />
                          Demonstrated Strengths
                        </span>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          {analysisResult.score_breakdown.key_positive_factors?.[0] || 'Strong project depth and relevant technical stack alignment.'}
                        </p>
                      </div>

                      <div className="p-3 rounded-lg border border-slate-200 bg-slate-50">
                        <span className="text-xs font-semibold text-slate-900 flex items-center gap-1.5 mb-1">
                          <AlertCircle size={13} className="text-amber-600" />
                          Areas for Optimization
                        </span>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          {analysisResult.score_breakdown.key_negative_factors?.[0] || 'Consider expanding bullet points with quantifiable business impact metrics.'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="text-[11px] font-mono text-slate-500 pt-3 border-t border-slate-200 flex items-center justify-between">
                    <span>Analysis ID: {analysisResult.id.slice(0, 8)}...</span>
                    <span>Role Level: {analysisResult.role_level || 'Mid-Senior'}</span>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* ============================================================
              THE 3 ACTION CARDS BELOW BASIC ANALYSIS
              1. More analytical findings (redirects to login with typewriter)
              2. Create an ATS-friendly resume (popup: dev is working on this)
              3. Interview prep (popup: dev is working on this)
              ============================================================ */}
          <section className="mb-14">
            <div className="mb-6">
              <h3 className="text-xl sm:text-2xl font-bold text-slate-950 tracking-tight">
                Next Steps & Deep Diagnostic Modules
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Take full command of your application intelligence with specialized modules.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              
              {/* OPTION 1: More analytical findings */}
              <div className="bg-white border-2 border-slate-900 rounded-2xl p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow relative">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs">
                      <FileSearch size={18} />
                    </div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-900 text-white">
                      RECOMMENDED
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-slate-900 mb-1.5">
                    1. More Analytical Findings
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed mb-4">
                    Unlock full forensic evidence mapping, ATS schema parseability telemetry, project provenance trails, and interviewer defense matrices.
                  </p>

                  <ul className="space-y-2 mb-6 text-xs text-slate-700">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                      <span>Full requirement-by-requirement evidence matrix</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                      <span>Detailed project depth & architecture audit</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                      <span>Company culture & hiring style intelligence</span>
                    </li>
                  </ul>
                </div>

                <Button
                  variant="primary"
                  size="md"
                  onClick={handleOption1MoreFindings}
                  iconRight={<ArrowRight size={14} />}
                  className="w-full text-xs font-semibold py-2.5 cursor-pointer"
                >
                  Unlock More Findings
                </Button>
              </div>

              {/* OPTION 2: Create an ATS-friendly resume */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col justify-between shadow-xs hover:border-slate-300 transition-colors">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center">
                      <FileText size={18} />
                    </div>
                    <span className="text-[10px] font-mono font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                      WILL IMPLEMENT SOON
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-slate-900 mb-1.5">
                    2. Create an ATS-Friendly Resume
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed mb-4">
                    Automatically optimize and format your resume for maximum ATS compliance, keyword alignment, and single-column parseability.
                  </p>

                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80 mb-6">
                    <div className="h-2 w-28 bg-slate-200 rounded mb-2" />
                    <div className="h-1.5 w-full bg-slate-200/70 rounded mb-1.5" />
                    <div className="h-1.5 w-4/5 bg-slate-200/70 rounded mb-1.5" />
                    <div className="h-1.5 w-2/3 bg-slate-200/70 rounded" />
                  </div>
                </div>

                <Button
                  variant="secondary"
                  size="md"
                  onClick={handleOption2AtsResume}
                  className="w-full text-xs font-medium py-2.5 cursor-pointer"
                >
                  Create ATS Resume
                </Button>
              </div>

              {/* OPTION 3: Interview prep */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col justify-between shadow-xs hover:border-slate-300 transition-colors">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center">
                      <Brain size={18} />
                    </div>
                    <span className="text-[10px] font-mono font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                      WILL IMPLEMENT SOON
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-slate-900 mb-1.5">
                    3. Interview Prep
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed mb-4">
                    Generate tailored behavioral and technical interview questions based directly on your resume gaps and specific role expectations.
                  </p>

                  <ul className="space-y-2 mb-6 text-xs text-slate-600">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 size={14} className="text-slate-400 shrink-0" />
                      <span>STAR behavioral response templates</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 size={14} className="text-slate-400 shrink-0" />
                      <span>System design defense prompts</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 size={14} className="text-slate-400 shrink-0" />
                      <span>Company culture interview insights</span>
                    </li>
                  </ul>
                </div>

                <Button
                  variant="secondary"
                  size="md"
                  onClick={handleOption3InterviewPrep}
                  className="w-full text-xs font-medium py-2.5 cursor-pointer"
                >
                  Interview Prep
                </Button>
              </div>

            </div>
          </section>

          {/* ============================================================
              CAPABILITIES & FORENSIC EXCELLENCE (Minimalist White Section)
              ============================================================ */}
          <section id="capabilities" className="pt-12 pb-6 border-t border-slate-200">
            <div className="max-w-2xl mb-10">
              <span className="text-[11px] font-mono font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                EVIDENCE ENGINE
              </span>
              <h3 className="text-2xl font-bold tracking-tight text-slate-950">
                Engineered for objective, defensible hiring
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                Every score traces back to concrete proof in project implementations and declared experience. No arbitrary keyword counting or hallucinations.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="p-5 rounded-xl border border-slate-200 bg-white shadow-2xs">
                <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-800 mb-3">
                  <FileSearch size={16} />
                </div>
                <h4 className="text-sm font-semibold text-slate-900 mb-1">Deep Project Analysis</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Discovers skills demonstrated in real projects. Every implementation detail is verified as evidence.
                </p>
              </div>

              <div className="p-5 rounded-xl border border-slate-200 bg-white shadow-2xs">
                <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-800 mb-3">
                  <Zap size={16} />
                </div>
                <h4 className="text-sm font-semibold text-slate-900 mb-1">Indirect Skill Discovery</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Identifies implied capabilities from architecture — discerning between knowing a tool and building production systems.
                </p>
              </div>

              <div className="p-5 rounded-xl border border-slate-200 bg-white shadow-2xs">
                <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-800 mb-3">
                  <Shield size={16} />
                </div>
                <h4 className="text-sm font-semibold text-slate-900 mb-1">Real HR Calibration</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Calibrated to human recruiter judgment: credits skills mentioned in skill sections and scales rigor for fresher vs experienced roles.
                </p>
              </div>
            </div>
          </section>

        </div>
      </main>

      {/* ============================================================
          FOOTER (Clean White Footer)
          ============================================================ */}
      <footer className="w-full bg-white border-t border-slate-200 py-6">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800">Resume Analyzer</span>
            <span>•</span>
            <span>Evidence-Based Career Intelligence</span>
          </div>
          <div className="flex items-center gap-4 text-slate-500">
            <Link to="/login" className="hover:text-slate-800 transition-colors">Sign In</Link>
            <Link to="/register" className="hover:text-slate-800 transition-colors">Register</Link>
            <span>© 2026 Resume Analyzer</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
