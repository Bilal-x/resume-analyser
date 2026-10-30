import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight, CheckCircle2, FileSearch, Zap,
  Shield, Brain, Sparkles, UploadCloud, FileText,
  FileCheck, AlertCircle, Layers, TrendingUp,
  Clock, Flame, Dices, RotateCcw, MessageSquare
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

const SAMPLE_FRESHER_RESUME_TEXT = `Priya Sharma
priya.sharma@example.com | (555) 987-6543 | New York, NY
github.com/priyasharma-dev | linkedin.com/in/priyasharma

OBJECTIVE
Recent Computer Science graduate (Class of 2025) seeking an entry-level software engineering role to apply web development and algorithmic problem solving skills.

EDUCATION
B.S. in Computer Science — State University (Graduated May 2025)
GPA: 3.8 / 4.0 | Dean's Honor List

TECHNICAL SKILLS
Languages: Python, JavaScript, HTML5, CSS3, SQL, C++
Frameworks & Libraries: React, Node.js, Express, TailwindCSS
Databases & Tools: PostgreSQL, SQLite, Git, GitHub, VS Code

ACADEMIC PROJECTS
Campus Event Portal (Full-Stack Web App)
- Developed a web application using React and Node.js for managing college student club registrations.
- Designed REST API endpoints with Express and stored attendee data in PostgreSQL.
- Implemented responsive mobile UI using TailwindCSS and deployed on Vercel.

Algorithm Visualizer (Frontend Project)
- Built an interactive web app visualising graph traversal (BFS/DFS) and sorting algorithms using HTML5 canvas and JavaScript.

INTERNSHIP
Summer Software Intern — Local Tech Solutions (June 2024 - August 2024)
- Assisted backend team in writing unit tests for Python services.`;

const SAMPLE_JD_TEXT = `We are seeking a Senior Full-Stack Engineer to lead the architecture of our core checkout and payment surfaces.

Key Requirements:
- 5+ years of software engineering experience with modern full-stack web applications.
- Strong proficiency in TypeScript, React, and Next.js for high-performance frontend engineering.
- Deep hands-on experience building backend microservices in Go, Python, or Node.js.
- Verifiable track record with distributed systems, high-concurrency APIs, and p99 latency optimization.
- Solid database fundamentals with PostgreSQL and Redis caching.
- Familiarity with containerized workflows using Docker and Kubernetes.
- Excellent technical communication and ability to mentor team members.`;

// Creative summary variations for the "Shuffle verdict" button
const CREATIVE_SUMMARY_POOLS = {
  fresher_vs_senior: [
    "Buddy, they are clearly looking for an experienced veteran with 5+ years in the trenches. You're not their best fit right now, but love the ambition!",
    "Whoa champion! This JD is hunting for someone with 5+ years of production battle scars, while your resume says fresh out of the gate. Respect the hustle, but an HR screener will probably ghost this one.",
    "Reality check time: they're asking for senior firepower (5+ yrs) and you're bringing fresh enthusiasm to a senior battlefield. Don't take it personally — aim for roles where your raw talent actually gets celebrated!",
    "Hold your horses! They want someone who's survived 5+ years of production outages. You've got great raw talent, but this JD is strictly looking for seasoned heavyweights.",
    "Shooting for the stars is awesome, but they literally asked for 5+ years of war stories you haven't lived yet. Aim for Junior or Associate roles first and dominate there!"
  ],
  high_match: [
    "Hot damn! You check their boxes like you ghostwrote their JD. Polish those project metrics and expect recruiter slide-ins.",
    "Chef's kiss! You're basically their dream candidate on paper. Review their culture tips and go crush the behavioral round.",
    "Green flags all over! Your demonstrated project depth and seniority line up with exactly what they're crying out for. Go get that offer!",
    "Bulls-eye! You bring the exact weapons they asked for. Walk into that interview with your head held high."
  ],
  moderate_match: [
    "Decent puncher's chance! You've got the core technical chops, but you're hiding your light under a bushel. Connect your project bullets to their keywords and you're in the running.",
    "You're in the race, but it's a tight pack! Your tech foundation is solid, but you'll need to demonstrate real depth on a couple of their mandatory tools.",
    "Solid contender with a few blind spots. Beef up your quantifiable impact numbers and you can easily turn this into an interview."
  ],
  low_match: [
    "Oof, square peg in a round hole here. They're demanding stack A and you're flexing stack B. Might want to pivot or re-aim your ammo for this one.",
    "Tough sell, chief! Your resume is telling a completely different story from what this job needs. Either re-tune your bullets for this niche or scout better-aligned roles.",
    "Not quite vibing with this JD. The core skills they care most about barely show up in your projects. Don't waste application rounds without tailoring your resume!"
  ],
  overqualified: [
    "Honestly? You're wildly overqualified for this gig. You could probably teach the hiring manager a thing or two — make sure you won't get bored out of your mind!",
    "Overkill alert! You brought a bazooka to a knife fight. With your experience, they'll either snap you up in seconds or panic that you'll cost double their budget.",
    "You're playing on easy mode here! Your years of engineering dwarf what they asked for. Expect quick callbacks if their salary matches your caliber."
  ]
};

const SCANNING_STEPS = [
  { title: "Extracting Work History & Years of Experience", detail: "Parsing tenure, employment spans, graduation year, and career seniority..." },
  { title: "Auditing Tech Stack & Architecture Evidence", detail: "Mapping direct skills and verified project implementations against JD..." },
  { title: "Evaluating Seniority Calibration (Fresher vs Experienced)", detail: "Cross-referencing candidate tenure against stated minimum job requirements..." },
  { title: "Synthesizing Real HR Verdict & Competitive Match Score", detail: "Running deterministic evaluation model and drafting candid HR feedback..." }
];

export default function LandingPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State — defaulted to Fresher vs 5+ yrs Senior JD for immediate testing
  const [file, setFile] = useState<File | null>(null);
  const [resumeText, setResumeText] = useState<string>(SAMPLE_FRESHER_RESUME_TEXT);
  const [resumeTypeLabel, setResumeTypeLabel] = useState<string>('Priya Sharma (Sample Fresher, 0 yrs)');
  const [jobTitle, setJobTitle] = useState<string>('Senior Full-Stack Engineer');
  const [companyName, setCompanyName] = useState<string>('Stripe');
  const [jdText, setJdText] = useState<string>(SAMPLE_JD_TEXT);

  // Scanning Screen & Execution State
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [scanStepIndex, setScanStepIndex] = useState<number>(0);
  const [scanProgress, setScanProgress] = useState<number>(10);
  const [error, setError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResponse | null>(null);
  const [activeCreativeSummary, setActiveCreativeSummary] = useState<string>('');

  // Modals for Options 2 & 3
  const [isDevModalOpen, setIsDevModalOpen] = useState<boolean>(false);
  const [devModalTitle, setDevModalTitle] = useState<string>('Feature in Active Development');

  const [isDragging, setIsDragging] = useState<boolean>(false);

  // Update creative summary whenever result changes
  useEffect(() => {
    if (analysisResult?.creative_summary) {
      setActiveCreativeSummary(analysisResult.creative_summary);
    }
  }, [analysisResult]);

  // Support ?demo=fresher to trigger auto-analysis for instant testing
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('demo') === 'fresher') {
      const timer = setTimeout(() => {
        handleRunInstantAnalysis();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    setResumeText('');
    setResumeTypeLabel(selectedFile.name);
    setError(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleLoadSeniorSample = () => {
    setFile(null);
    setResumeText(SAMPLE_RESUME_TEXT);
    setResumeTypeLabel('Alex Chen (Senior SWE, 6+ yrs experience)');
    setJobTitle('Senior Full-Stack Engineer');
    setCompanyName('Stripe');
    setJdText(SAMPLE_JD_TEXT);
    setError(null);
  };

  const handleLoadFresherSample = () => {
    setFile(null);
    setResumeText(SAMPLE_FRESHER_RESUME_TEXT);
    setResumeTypeLabel('Priya Sharma (Fresher / Grad 2025, 0 yrs)');
    setJobTitle('Senior Full-Stack Engineer');
    setCompanyName('Stripe');
    setJdText(SAMPLE_JD_TEXT);
    setError(null);
  };

  const handleShuffleVerdict = () => {
    if (!analysisResult) return;
    const req = analysisResult.years_experience_required ?? 2.0;
    const found = analysisResult.years_experience_found ?? 0.0;
    const score = analysisResult.overall_score;

    let pool = CREATIVE_SUMMARY_POOLS.moderate_match;
    if (found <= 1.0 && req >= 3.0) {
      pool = CREATIVE_SUMMARY_POOLS.fresher_vs_senior;
    } else if (found >= 5.0 && req <= 1.5) {
      pool = CREATIVE_SUMMARY_POOLS.overqualified;
    } else if (score >= 7.5) {
      pool = CREATIVE_SUMMARY_POOLS.high_match;
    } else if (score < 5.0) {
      pool = CREATIVE_SUMMARY_POOLS.low_match;
    }

    const otherChoices = pool.filter(s => s !== activeCreativeSummary);
    const chosen = otherChoices.length > 0
      ? otherChoices[Math.floor(Math.random() * otherChoices.length)]
      : pool[0];
    setActiveCreativeSummary(chosen);
  };

  const handleRunInstantAnalysis = async () => {
    if (!file && !resumeText.trim()) {
      setError('Please upload a resume file (PDF/DOCX/TXT) or choose one of the sample resumes above.');
      return;
    }
    if (!jdText.trim()) {
      setError('Please provide the target job description requirements.');
      return;
    }

    setError(null);
    setIsAnalyzing(true);
    setScanStepIndex(0);
    setScanProgress(15);

    // Scroll to the scanner HUD smoothly
    setTimeout(() => {
      const scannerElem = document.getElementById('scanning-screen-anchor');
      if (scannerElem) {
        scannerElem.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 50);

    // Dynamic scanning step animation interval
    const stepInterval = setInterval(() => {
      setScanStepIndex(prev => {
        const next = Math.min(prev + 1, 3);
        setScanProgress(25 + next * 24);
        return next;
      });
    }, 500);

    const startTime = Date.now();

    try {
      const result = await analysesApi.instant(
        file,
        jdText,
        jobTitle || 'Target Role',
        companyName || '',
        file ? undefined : resumeText
      );

      // Guarantee minimum scanning visual time of 1.8 seconds so user experiences the screen transformation
      const elapsed = Date.now() - startTime;
      const remainingWait = Math.max(0, 1800 - elapsed);

      setTimeout(() => {
        clearInterval(stepInterval);
        setScanProgress(100);
        setAnalysisResult(result);
        setIsAnalyzing(false);

        // Smooth scroll to the basic analysis results
        setTimeout(() => {
          const resultSection = document.getElementById('basic-analysis-section');
          if (resultSection) {
            resultSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 120);
      }, remainingWait);

    } catch (err: unknown) {
      clearInterval(stepInterval);
      setIsAnalyzing(false);
      setError(err instanceof Error ? err.message : 'Analysis failed. Please verify your file format and try again.');
    }
  };

  // Creative Option 1: Spill the Whole Truth
  const handleOption1MoreFindings = () => {
    navigate('/login?from=instant&prompt=unlock');
  };

  // Creative Option 2: Fix My Resume for Bots
  const handleOption2AtsResume = () => {
    setDevModalTitle('Fix My Resume for Bots 🤖 (will implement soon)');
    setIsDevModalOpen(true);
  };

  // Creative Option 3: Grill Me Like a Senior VP
  const handleOption3InterviewPrep = () => {
    setDevModalTitle('Grill Me Like a Senior VP 🔥 (will implement soon)');
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
              Seniority Calibration
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
                Instant Seniority & Experience Calibration • No sign-in required
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-slate-950 leading-tight mb-3">
              Evaluate your resume against any role instantly.
            </h1>
            <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Upload your resume and paste a job description without signing in. Get immediate, unfiltered HR judgment on your years of experience, skill depth, and true role fit.
            </p>
          </section>

          {/* ============================================================
              DUAL-COLUMN WORKSPACE: 1. RESUME + 2. JOB DESCRIPTION
              ============================================================ */}
          <section id="instant-tool" className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-7 shadow-sm mb-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
              
              {/* LEFT COLUMN: 1. UPLOAD RESUME */}
              <div className="flex flex-col">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-4 border-b border-slate-200/80 gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200">
                      STEP 01
                    </span>
                    <h2 className="text-sm sm:text-base font-semibold text-slate-900">1. Upload Resume</h2>
                  </div>
                  
                  {/* Sample Resumes (Senior & Fresher for testing) */}
                  <div className="flex items-center gap-2 text-xs">
                    <button
                      type="button"
                      onClick={handleLoadSeniorSample}
                      className="text-[11px] font-mono text-blue-600 hover:text-blue-800 underline underline-offset-2 transition-colors cursor-pointer"
                    >
                      Sample Senior (6+ yrs)
                    </button>
                    <span className="text-slate-300">•</span>
                    <button
                      type="button"
                      onClick={handleLoadFresherSample}
                      className="text-[11px] font-mono text-purple-600 hover:text-purple-800 underline underline-offset-2 transition-colors cursor-pointer"
                    >
                      Sample Fresher (0 yrs)
                    </button>
                  </div>
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
                      <FileText size={12} /> Work History
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock size={12} /> Tenure Scanner
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <FileCheck size={12} /> Project Proof
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
                          {file ? file.name : (resumeTypeLabel || 'Loaded Sample Resume')}
                        </div>
                        <div className="text-[11px] text-emerald-700 flex items-center gap-1">
                          <CheckCircle2 size={11} className="text-emerald-600" />
                          Ready for seniority & skill extraction
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => { setFile(null); setResumeText(''); setResumeTypeLabel(''); }}
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
                    placeholder="Paste job description requirements, responsibilities, and years of experience needed..."
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

            {/* Central Creative Action Bar */}
            <div className="mt-6 pt-5 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-slate-500 text-xs font-mono">
                <Zap size={14} className="text-amber-500" />
                <span>Audits years of experience, project depth, and HR hiring feasibility</span>
              </div>

              {/* Creative Button Text */}
              <Button
                size="lg"
                variant="primary"
                loading={isAnalyzing}
                onClick={handleRunInstantAnalysis}
                icon={<Flame size={16} className="text-amber-400" />}
                className="w-full sm:w-auto px-7 py-3 text-sm font-semibold shadow-md cursor-pointer"
              >
                Judge My Resume 🎯 (Run Real HR Scan)
              </Button>
            </div>
          </section>

          {/* ============================================================
              ACTIVE SCANNING HUD SCREEN (Appears while analyzing)
              Transitions the screen with dynamic telemetry & scanlines
              ============================================================ */}
          <div id="scanning-screen-anchor" />
          {isAnalyzing && (
            <section className="mb-12 rounded-2xl border-2 border-slate-900 bg-slate-950 text-slate-100 p-6 sm:p-8 shadow-2xl relative overflow-hidden animate-fade-in-up">
              {/* Laser scanning line animation */}
              <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent animate-pulse" />

              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-6 border-b border-slate-800 gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                    <Sparkles size={20} className="animate-spin" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                      LIVE HR TELEMETRY IN PROGRESS
                    </span>
                    <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight mt-1">
                      Analyzing Resume & Running Real HR Simulation...
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-slate-400">Progress:</span>
                  <span className="font-mono text-sm font-bold text-emerald-400">{scanProgress}%</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mb-6">
                <div
                  className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-300"
                  style={{ width: `${scanProgress}%` }}
                />
              </div>

              {/* Step Telemetry Rows */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 font-mono text-xs">
                {SCANNING_STEPS.map((step, idx) => {
                  const isDone = scanStepIndex > idx;
                  const isCurrent = scanStepIndex === idx;

                  return (
                    <div
                      key={step.title}
                      className={`p-3.5 rounded-xl border transition-all ${
                        isDone
                          ? 'border-emerald-500/40 bg-emerald-950/20 text-slate-200'
                          : isCurrent
                          ? 'border-amber-500/50 bg-slate-900 text-white shadow-lg'
                          : 'border-slate-800/80 bg-slate-900/40 text-slate-500'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
                          STAGE 0{idx + 1}
                        </span>
                        {isDone ? (
                          <span className="text-emerald-400 flex items-center gap-1 text-[11px]">
                            <CheckCircle2 size={12} /> Complete
                          </span>
                        ) : isCurrent ? (
                          <span className="text-amber-400 flex items-center gap-1 text-[11px] animate-pulse">
                            <RotateCcw size={12} className="animate-spin" /> Scanning...
                          </span>
                        ) : (
                          <span className="text-slate-600 text-[11px]">Queued</span>
                        )}
                      </div>
                      <div className="font-semibold text-slate-100">{step.title}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{step.detail}</div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* ============================================================
              PARTIAL ANALYSIS REPORT SECTION
              Rendered immediately when instant analysis completes
              ============================================================ */}
          {analysisResult && (
            <section
              id="basic-analysis-section"
              className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-md mb-12 animate-fade-in-up"
            >
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-6 border-b border-slate-200 gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                      PARTIAL ANALYSIS REPORT
                    </span>
                    <span className="text-xs font-mono text-slate-500">
                      Seniority & Fit Intelligence
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-slate-950 tracking-tight">
                    Basic Match Analysis: {analysisResult.job_title} {analysisResult.company_name ? `@ ${analysisResult.company_name}` : ''}
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-slate-600 bg-slate-100 px-3 py-1 rounded-md border border-slate-200">
                    Candidate: <strong className="text-slate-900">{analysisResult.candidate_name}</strong>
                  </span>
                </div>
              </div>

              {/* ========================================================
                  CREATIVE HUMAN VERDICT (Raw & Unfiltered)
                  "buddy they are clearly looking for an experienced one..."
                  ======================================================== */}
              <div className="mb-6 p-4 sm:p-5 rounded-xl border-2 border-slate-900 bg-slate-900 text-slate-100 shadow-sm relative overflow-hidden">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="p-1 rounded bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center">
                      <MessageSquare size={13} />
                    </span>
                    <span className="font-mono text-xs font-bold uppercase tracking-wider text-amber-300">
                      Real HR Verdict (Raw & Unfiltered)
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleShuffleVerdict}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] font-mono transition-colors cursor-pointer border border-slate-700"
                    title="Click to see another creative phrasing"
                  >
                    <Dices size={12} className="text-amber-400" />
                    <span>Shuffle Verdict 🎲</span>
                  </button>
                </div>

                <p className="text-sm sm:text-base font-medium text-slate-100 leading-relaxed font-sans italic">
                  "{activeCreativeSummary || analysisResult.creative_summary}"
                </p>
              </div>

              {/* ========================================================
                  YEARS OF EXPERIENCE & SENIORITY COMPARISON
                  ======================================================== */}
              <div className="mb-6 p-4 rounded-xl border border-slate-200 bg-slate-50/80">
                <div className="flex items-center gap-2 mb-3">
                  <Clock size={16} className="text-slate-700" />
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700">
                    Years of Experience & Seniority Calibration
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  {/* JD Requirement */}
                  <div className="p-3 rounded-lg bg-white border border-slate-200">
                    <span className="text-[11px] font-mono text-slate-500 block">JD Required Experience</span>
                    <span className="text-base sm:text-lg font-bold text-slate-900 mt-0.5 block">
                      {analysisResult.years_experience_required !== null && analysisResult.years_experience_required !== undefined
                        ? analysisResult.years_experience_required === 0
                          ? '0 Yrs (Freshers Welcome)'
                          : `${analysisResult.years_experience_required.toFixed(1)}+ Years`
                        : 'Not specified'}
                    </span>
                  </div>

                  {/* Resume Found */}
                  <div className="p-3 rounded-lg bg-white border border-slate-200">
                    <span className="text-[11px] font-mono text-slate-500 block">Resume Experience Found</span>
                    <span className="text-base sm:text-lg font-bold text-slate-900 mt-0.5 block">
                      {analysisResult.experience_evaluation?.total_experience_months != null
                        ? `${(analysisResult.experience_evaluation.total_experience_months / 12).toFixed(1)} Years Documented`
                        : analysisResult.years_experience_found !== null && analysisResult.years_experience_found !== undefined
                        ? analysisResult.years_experience_found === 0
                          ? '0 Yrs (Fresher / Early-Career)'
                          : `${analysisResult.years_experience_found.toFixed(1)} Years Documented`
                        : 'Not Stated in Resume'}
                    </span>
                  </div>

                  {/* Seniority Alignment Assessment */}
                  <div className="p-3 rounded-lg bg-white border border-slate-200 flex flex-col justify-between">
                    <span className="text-[11px] font-mono text-slate-500 block">Seniority Alignment</span>
                    <span className={`text-xs font-semibold mt-1 inline-flex items-center gap-1 ${
                      analysisResult.experience_evaluation?.experience_status === 'not_available'
                        ? 'text-indigo-700'
                        : (analysisResult.years_experience_found ?? 0) >= (analysisResult.years_experience_required ?? 2)
                        ? 'text-emerald-700'
                        : (analysisResult.years_experience_found ?? 0) <= 1.0 && (analysisResult.years_experience_required ?? 2) >= 3.0
                        ? 'text-red-700'
                        : 'text-amber-700'
                    }`}>
                      {analysisResult.experience_evaluation?.experience_status === 'not_available'
                        ? 'ℹ Excluded from Scoring (No Penalty)'
                        : (analysisResult.years_experience_found ?? 0) >= (analysisResult.years_experience_required ?? 2)
                        ? '✓ Target Met / Qualified'
                        : (analysisResult.years_experience_found ?? 0) <= 1.0 && (analysisResult.years_experience_required ?? 2) >= 3.0
                        ? '⚠ Significant Seniority Gap'
                        : '⚡ Minor Experience Gap'}
                    </span>
                  </div>
                </div>

                {analysisResult.experience_assessment && (
                  <p className="text-xs text-slate-600 mt-2.5 pt-2 border-t border-slate-200/80 leading-relaxed">
                    <strong>HR Assessment:</strong> {analysisResult.experience_assessment}
                  </p>
                )}
              </div>

              {/* Main Score & Core Highlights Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
                {/* Score Visualizer (Left Column: 4 cols) */}
                <div className="lg:col-span-4 bg-slate-50 border border-slate-200 rounded-xl p-6 flex flex-col items-center justify-center text-center">
                  <div className="mb-4">
                    <ScoreRing score={analysisResult.overall_score} size={135} strokeWidth={8} />
                  </div>

                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-mono font-medium border border-emerald-200 mb-2.5">
                    <CheckCircle2 size={13} className="text-emerald-700" />
                    <span>{analysisResult.score_breakdown.score_interpretation}</span>
                  </div>

                  <p className="text-xs text-slate-600 max-w-xs leading-relaxed">
                    Evaluated across {analysisResult.requirements_matrix.length} core job competencies with {analysisResult.score_breakdown.evidence_coverage_percent.toFixed(0)}% verified proof in your resume.
                  </p>
                </div>

                {/* Alignment Breakdown (Right Column: 8 cols) */}
                <div className="lg:col-span-8 flex flex-col justify-between">
                  <div>
                    {/* Verified Technical Skills */}
                    <div className="mb-4">
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
                          Key Optimization Focus
                        </span>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          {analysisResult.score_breakdown.key_negative_factors?.[0] || 'Expand bullet points with quantifiable business impact metrics.'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="text-[11px] font-mono text-slate-500 pt-3 border-t border-slate-200 flex items-center justify-between">
                    <span>Report ID: {analysisResult.id.slice(0, 8)}...</span>
                    <span>Role Level: {analysisResult.role_level || 'Mid-Senior'}</span>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* ============================================================
              THE 3 CREATIVE ACTION CARDS BELOW BASIC ANALYSIS
              1. Spill the Whole Truth 🔍 (Typewriter effect on login)
              2. Fix My Resume for Bots 🤖 (Popup modal)
              3. Grill Me Like a Senior VP 🔥 (Popup modal)
              ============================================================ */}
          <section className="mb-14">
            <div className="mb-6">
              <h3 className="text-xl sm:text-2xl font-bold text-slate-950 tracking-tight">
                Next Steps: Level Up Your Application
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Take full command of your career moves with our dedicated AI tooling.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              
              {/* CREATIVE OPTION 1: Spill the Whole Truth 🔍 */}
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
                    1. Spill the Whole Truth 🔍
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed mb-4">
                    Unmask the raw HR dossier — forensic skill telemetry, project provenance trails, and interviewer defense rubrics.
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
                  Give Me the Raw Truth →
                </Button>
              </div>

              {/* CREATIVE OPTION 2: Fix My Resume for Bots 🤖 */}
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
                    2. Fix My Resume for Bots 🤖
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed mb-4">
                    Auto-reformat into 100% parseable standard ATS format with zero robotic rejection risk. (will implement soon)
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
                  Make It ATS-Proof
                </Button>
              </div>

              {/* CREATIVE OPTION 3: Grill Me Like a Senior VP 🔥 */}
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
                    3. Grill Me Like a Senior VP 🔥
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed mb-4">
                    Get roasted with tailored technical & behavioral curveballs before the real interviewers do. (will implement soon)
                  </p>

                  <ul className="space-y-2 mb-6 text-xs text-slate-600">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 size={14} className="text-slate-400 shrink-0" />
                      <span>STAR behavioral response templates</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 size={14} className="text-slate-400 shrink-0" />
                      <span>System architecture defense curveballs</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 size={14} className="text-slate-400 shrink-0" />
                      <span>Company culture interview secrets</span>
                    </li>
                  </ul>
                </div>

                <Button
                  variant="secondary"
                  size="md"
                  onClick={handleOption3InterviewPrep}
                  className="w-full text-xs font-medium py-2.5 cursor-pointer"
                >
                  Prep Me for the Hot Seat
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
