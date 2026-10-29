import { Link } from 'react-router-dom';
import {
  ArrowRight, CheckCircle2, BarChart3, FileSearch,
  Zap, Users, Shield, ChevronRight, Brain, Target,
  TrendingUp, Eye, Layers, Compass
} from 'lucide-react';
import { Button } from '../components/ui';

const features = [
  {
    icon: FileSearch,
    title: 'Deep Project Analysis',
    description: 'Discovers skills demonstrated in real projects — not just listed keywords. Every implementation detail is verified as evidence.',
  },
  {
    icon: BarChart3,
    title: 'Explainable Match Scoring',
    description: 'Transparent weighted scoring out of 10 with full dimension breakdown, verifiable excerpts, and confidence ratings.',
  },
  {
    icon: Zap,
    title: 'Indirect Skill Discovery',
    description: 'Identifies implied skills from project implementations — distinguishing between listing a library and architecting production systems.',
  },
  {
    icon: Users,
    title: 'Candidate Comparison',
    description: 'Side-by-side candidate evaluations with structured reasoning, requirement coverage, and objective shortlisting for hiring teams.',
  },
  {
    icon: Brain,
    title: 'Targeted Interview Prompts',
    description: 'Generates evidence-backed technical questions targeting candidate gaps and strengths specific to each job description.',
  },
  {
    icon: Shield,
    title: 'Strict Provenance & Verification',
    description: 'Zero hallucinations. Direct, indirect, and unverified findings are strictly referenced against exact excerpts from the resume.',
  },
];

const steps = [
  { step: '01', icon: FileSearch, title: 'Upload Resume', desc: 'PDF or DOCX — extracts technical background, projects, and career history.' },
  { step: '02', icon: Target, title: 'Job Description', desc: 'Parses the target role requirements into a structured competency matrix.' },
  { step: '03', icon: Brain, title: 'Evidence Mapping', desc: 'Evaluates real demonstrated project impact, inferred capabilities, and technical depth.' },
  { step: '04', icon: TrendingUp, title: 'Actionable Report', desc: 'Delivers clear scoring breakdown, targeted resume advice, and interview questions.' },
];

const benefits = {
  candidates: [
    'Benchmark your resume against specific role requirements with transparent scoring',
    'Identify which projects showcase your highest-impact technical abilities',
    'Receive targeted phrasing and structural suggestions to highlight real achievements',
    'Prepare for technical interviews with questions generated from your background',
  ],
  recruiters: [
    'Cut initial review cycles with objective, evidence-based score breakdowns',
    'Compare applicant pools across standardized competency benchmarks',
    'Uncover high-caliber talent whose skills are demonstrated in code and projects',
    'Conduct targeted interviews with candidate-specific technical question sets',
  ],
};

export default function LandingPage() {
  return (
    <div className="min-h-screen w-full bg-zinc-950 text-zinc-100 overflow-x-hidden flex flex-col font-sans antialiased selection:bg-zinc-800 selection:text-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md">
        <div className="w-full max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group shrink-0">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-200 group-hover:border-zinc-700 transition-colors">
              <Layers size={14} />
            </div>
            <span className="font-semibold text-zinc-100 text-xs sm:text-sm tracking-tight whitespace-nowrap">
              Resume <span className="hidden sm:inline text-zinc-500 font-normal">Analyzer</span>
            </span>
          </Link>
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            <Link to="/login" className="text-xs text-zinc-400 hover:text-zinc-100 px-2 py-1 transition-colors font-medium">
              Sign in
            </Link>
            <Link to="/register">
              <Button size="sm" icon={<ArrowRight size={12} />} className="text-xs px-2.5 py-1 sm:px-3 sm:py-1.5">
                <span className="sm:hidden">Start</span>
                <span className="hidden sm:inline">Get started</span>
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-16 sm:pt-36 sm:pb-28 px-3.5 sm:px-6 lg:px-8 border-b border-zinc-800/60 overflow-hidden">
        {/* Subtle geometric dot grid background */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)',
            backgroundSize: '32px 32px',
          }}
        />

        <div className="relative max-w-4xl mx-auto text-center px-1">
          {/* Tag */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-zinc-800 bg-zinc-900/60 text-zinc-400 text-[11px] sm:text-xs font-mono mb-5 sm:mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Evidence-Based Resume Intelligence
          </div>

          {/* Clean human headline */}
          <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-snug sm:leading-[1.15] mb-4 sm:mb-6">
            Understand every resume <br className="sm:hidden" />through verified evidence.
          </h1>

          {/* Subtitle */}
          <p className="text-xs sm:text-base lg:text-lg text-zinc-400 max-w-2xl mx-auto mb-7 sm:mb-10 leading-relaxed font-normal px-2">
            Move beyond superficial keyword matching. Evaluate candidates on actual skills demonstrated in projects,
            with fully transparent scoring and verifiable excerpts.
          </p>

          {/* Call to Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 sm:gap-3 px-2 sm:px-0">
            <Link to="/register" className="w-full sm:w-auto">
              <Button size="lg" iconRight={<ChevronRight size={16} />} className="w-full sm:w-auto px-6 py-2.5 text-xs sm:text-sm">
                Start evaluating free
              </Button>
            </Link>
            <Link to="/login" className="w-full sm:w-auto">
              <Button variant="secondary" size="lg" icon={<Eye size={16} />} className="w-full sm:w-auto px-6 py-2.5 text-xs sm:text-sm">
                Explore demo
              </Button>
            </Link>
          </div>

          {/* Trust Row */}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 mt-8 sm:mt-12 text-[11px] sm:text-xs text-zinc-500">
            {[
              { text: 'No credit card required' },
              { text: 'Deterministic scoring' },
              { text: 'Source-backed citations' },
            ].map(t => (
              <span key={t.text} className="flex items-center gap-1.5">
                <CheckCircle2 size={13} className="text-zinc-400 shrink-0" />
                {t.text}
              </span>
            ))}
          </div>

          {/* Dashboard Preview Frame */}
          <div className="mt-16 sm:mt-20 w-full text-left">
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-1 sm:p-2 shadow-2xl backdrop-blur-sm">
              <div className="rounded-lg border border-zinc-800/80 bg-zinc-950 overflow-hidden">
                {/* Clean macOS-style header */}
                <div className="flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3 border-b border-zinc-800/80 bg-zinc-900/50 min-w-0">
                  <div className="flex items-center gap-1.5 shrink-0">
                    <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                    <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                    <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                  </div>
                  <div className="text-[10px] sm:text-[11px] font-mono text-zinc-500 bg-zinc-900 px-2 sm:px-3 py-0.5 rounded border border-zinc-800 truncate max-w-[180px] sm:max-w-none">
                    app.resumeanalyzer.com/evaluations/demo
                  </div>
                  <div className="w-6 shrink-0" />
                </div>

                {/* Clean developer interface mockup */}
                <div className="p-4 sm:p-7 grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 min-w-0">
                  {/* Summary metric card 1 */}
                  <div className="p-3.5 sm:p-4 rounded-lg bg-zinc-900/50 border border-zinc-800 min-w-0">
                    <div className="text-xs text-zinc-500 font-medium">Evaluations Run</div>
                    <div className="text-xl sm:text-2xl font-mono font-semibold text-zinc-100 mt-1">24</div>
                    <div className="text-[11px] text-zinc-400 mt-1.5 sm:mt-2">Across 6 active engineering roles</div>
                  </div>

                  {/* Summary metric card 2 */}
                  <div className="p-3.5 sm:p-4 rounded-lg bg-zinc-900/50 border border-zinc-800 min-w-0">
                    <div className="text-xs text-zinc-500 font-medium">Median Match Index</div>
                    <div className="text-xl sm:text-2xl font-mono font-semibold text-zinc-100 mt-1">7.8<span className="text-xs text-zinc-500 font-normal">/10</span></div>
                    <div className="text-[11px] text-emerald-400 mt-1.5 sm:mt-2 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> High alignment threshold
                    </div>
                  </div>

                  {/* Summary metric card 3 */}
                  <div className="p-3.5 sm:p-4 rounded-lg bg-zinc-900/50 border border-zinc-800 min-w-0">
                    <div className="text-xs text-zinc-500 font-medium">Qualified Shortlist</div>
                    <div className="text-xl sm:text-2xl font-mono font-semibold text-zinc-100 mt-1">11</div>
                    <div className="text-[11px] text-zinc-400 mt-1.5 sm:mt-2">Passed all mandatory criteria</div>
                  </div>

                  {/* Candidate evaluation table */}
                  <div className="col-span-1 md:col-span-2 p-3.5 sm:p-4 rounded-lg bg-zinc-900/30 border border-zinc-800 space-y-2.5 sm:space-y-3 min-w-0 overflow-hidden">
                    <div className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Recent Evaluations</div>
                    {[
                      { role: 'Staff Frontend Engineer', score: '8.8', level: 'High Match', status: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5' },
                      { role: 'Senior ML Engineer', score: '7.4', level: 'Moderate', status: 'text-amber-400 border-amber-500/20 bg-amber-500/5' },
                      { role: 'Distributed Systems Lead', score: '6.2', level: 'Review', status: 'text-zinc-400 border-zinc-700 bg-zinc-800/40' },
                    ].map(item => (
                      <div key={item.role} className="flex items-center justify-between p-2.5 rounded-md bg-zinc-900/60 border border-zinc-800/80 text-xs min-w-0 gap-2">
                        <div className="truncate text-zinc-200 font-medium min-w-0 flex-1">{item.role}</div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className={`px-2 py-0.5 rounded text-[11px] border font-mono ${item.status}`}>
                            {item.score}/10
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Score Breakdown box */}
                  <div className="p-3.5 sm:p-4 rounded-lg bg-zinc-900/30 border border-zinc-800 flex flex-col justify-between min-w-0">
                    <div>
                      <div className="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2 sm:mb-3">Overall Confidence</div>
                      <div className="text-2xl sm:text-3xl font-mono font-bold text-white mb-1">94%</div>
                      <p className="text-xs text-zinc-500 leading-relaxed">
                        Deterministic project citation rate across verified repository milestones.
                      </p>
                    </div>
                    <div className="pt-3 border-t border-zinc-800 text-[11px] text-zinc-400 flex items-center gap-1.5 mt-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      Auditable evidence log ready
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 sm:py-24 px-4 sm:px-6 lg:px-8 border-b border-zinc-800/60">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-2xl mb-14">
            <p className="text-xs font-mono uppercase tracking-wider text-zinc-500 mb-2">Capabilities</p>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-3">
              Engineered for objective, defensible hiring
            </h2>
            <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
              Every evaluation traces directly back to resume text and project descriptions. No opaque scores, no keyword illusions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.title}
                  className="p-6 rounded-xl bg-zinc-900/30 border border-zinc-800/80 hover:border-zinc-700 transition-colors"
                >
                  <div className="w-9 h-9 rounded-lg bg-zinc-850 border border-zinc-800 flex items-center justify-center text-zinc-300 mb-4">
                    <Icon size={18} />
                  </div>
                  <h3 className="text-sm font-semibold text-zinc-100 mb-1.5">{f.title}</h3>
                  <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">{f.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Candidates & Recruiters Perspectives */}
      <section className="py-20 sm:py-24 px-4 sm:px-6 lg:px-8 border-b border-zinc-800/60">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-2xl mb-14">
            <p className="text-xs font-mono uppercase tracking-wider text-zinc-500 mb-2">Dual Workflows</p>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-3">
              Clarity for job seekers and hiring teams
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Candidates Card */}
            <div className="p-7 sm:p-8 rounded-xl bg-zinc-900/40 border border-zinc-800 flex flex-col justify-between">
              <div>
                <div className="w-9 h-9 rounded-lg bg-zinc-850 border border-zinc-800 flex items-center justify-center text-zinc-300 mb-5">
                  <Compass size={18} />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">For Candidates</h3>
                <p className="text-sm text-zinc-400 mb-6 leading-relaxed">
                  Test your application against exact requirements to know where your resume shines and where to strengthen it.
                </p>
                <ul className="space-y-3 mb-8">
                  {benefits.candidates.map(b => (
                    <li key={b} className="flex items-start gap-2.5 text-xs sm:text-sm text-zinc-300">
                      <CheckCircle2 size={15} className="text-zinc-500 mt-0.5 shrink-0" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="pt-5 border-t border-zinc-800/80">
                <Link to="/register?role=candidate">
                  <Button variant="secondary" icon={<ArrowRight size={14} />}>
                    Analyze your resume
                  </Button>
                </Link>
              </div>
            </div>

            {/* Recruiters Card */}
            <div className="p-7 sm:p-8 rounded-xl bg-zinc-900/40 border border-zinc-800 flex flex-col justify-between">
              <div>
                <div className="w-9 h-9 rounded-lg bg-zinc-850 border border-zinc-800 flex items-center justify-center text-zinc-300 mb-5">
                  <Users size={18} />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">For Recruiters</h3>
                <p className="text-sm text-zinc-400 mb-6 leading-relaxed">
                  Systematize inbound evaluation with transparent, auditable scoring criteria across candidate cohorts.
                </p>
                <ul className="space-y-3 mb-8">
                  {benefits.recruiters.map(b => (
                    <li key={b} className="flex items-start gap-2.5 text-xs sm:text-sm text-zinc-300">
                      <CheckCircle2 size={15} className="text-zinc-500 mt-0.5 shrink-0" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="pt-5 border-t border-zinc-800/80">
                <Link to="/register?role=recruiter">
                  <Button variant="secondary" icon={<ArrowRight size={14} />}>
                    Start evaluating candidates
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="py-20 sm:py-24 px-4 sm:px-6 lg:px-8 border-b border-zinc-800/60">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-2xl mb-14">
            <p className="text-xs font-mono uppercase tracking-wider text-zinc-500 mb-2">Process</p>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-3">
              How the analysis pipeline operates
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {steps.map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.step} className="p-5 rounded-xl bg-zinc-900/30 border border-zinc-800/80">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-8 h-8 rounded-lg bg-zinc-850 border border-zinc-800 flex items-center justify-center text-zinc-300">
                      <Icon size={16} />
                    </div>
                    <span className="font-mono text-xs text-zinc-500 font-semibold">{s.step}</span>
                  </div>
                  <h3 className="font-medium text-zinc-100 text-sm mb-1.5">{s.title}</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">{s.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Clean Call to Action */}
      <section className="py-20 sm:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="p-8 sm:p-14 rounded-2xl bg-zinc-900/40 border border-zinc-800">
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-3">
              Start evaluating with evidence today
            </h2>
            <p className="text-sm sm:text-base text-zinc-400 max-w-lg mx-auto mb-8 leading-relaxed">
              Transparent match scores and verifiable citations for engineers and hiring teams.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link to="/register" className="w-full sm:w-auto">
                <Button size="lg" iconRight={<ChevronRight size={15} />} className="w-full sm:w-auto px-6">
                  Create free account
                </Button>
              </Link>
              <Link to="/login" className="w-full sm:w-auto">
                <Button variant="secondary" size="lg" className="w-full sm:w-auto px-6">
                  Sign in
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 sm:px-6 lg:px-8 border-t border-zinc-800/80 bg-zinc-950 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-md bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300">
              <Layers size={13} />
            </div>
            <span className="text-xs font-semibold text-zinc-400">Resume Analyzer</span>
          </div>
          <div className="flex items-center gap-6 text-xs text-zinc-500">
            <Link to="/login" className="hover:text-zinc-300 transition-colors">Sign in</Link>
            <Link to="/register" className="hover:text-zinc-300 transition-colors">Register</Link>
            <span>Evidence-first architecture</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
