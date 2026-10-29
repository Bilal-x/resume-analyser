import { Link } from 'react-router-dom';
import {
  Sparkles, ArrowRight, CheckCircle2, BarChart3, FileSearch,
  Zap, Users, Shield, Star, ChevronRight, Brain, Target,
  TrendingUp, Eye
} from 'lucide-react';
import { Button } from '../components/ui';

const features = [
  {
    icon: FileSearch,
    title: 'Deep Project Analysis',
    description: 'Discovers skills demonstrated in real projects — not just listed keywords. Every implementation detail is evidence.',
    color: 'from-indigo-500 to-violet-600',
    glow: 'rgba(99, 102, 241, 0.3)',
  },
  {
    icon: BarChart3,
    title: 'Explainable Match Score',
    description: 'Transparent weighted scoring out of 10 with full dimension breakdown, evidence trails, and confidence ratings.',
    color: 'from-violet-500 to-purple-600',
    glow: 'rgba(139, 92, 246, 0.3)',
  },
  {
    icon: Zap,
    title: 'Indirect Skill Discovery',
    description: 'Identifies implied skills from project implementations — the difference between knowing React vs. having built production apps with it.',
    color: 'from-amber-500 to-orange-500',
    glow: 'rgba(245, 158, 11, 0.3)',
  },
  {
    icon: Users,
    title: 'Candidate Comparison',
    description: 'Side-by-side candidate ranking with evidence-backed reasoning, mandatory skill coverage, and shortlisting tools for HR teams.',
    color: 'from-emerald-500 to-teal-600',
    glow: 'rgba(16, 185, 129, 0.3)',
  },
  {
    icon: Brain,
    title: 'AI Interview Questions',
    description: 'Auto-generates evidence-based questions targeting each candidate\'s gaps and strengths relative to the specific JD.',
    color: 'from-pink-500 to-rose-600',
    glow: 'rgba(236, 72, 153, 0.3)',
  },
  {
    icon: Shield,
    title: 'Evidence-Based Only',
    description: 'Never fabricates. Direct, indirect, and unverified findings are clearly distinguished with source excerpts from the resume.',
    color: 'from-sky-500 to-blue-600',
    glow: 'rgba(14, 165, 233, 0.3)',
  },
];

const steps = [
  { step: '01', icon: FileSearch, title: 'Upload Resume', desc: 'PDF or DOCX — our parser extracts every technical detail, project, and skill.' },
  { step: '02', icon: Target, title: 'Add Job Description', desc: 'Paste the JD and we structure its requirements into a searchable skill matrix.' },
  { step: '03', icon: Brain, title: 'Run Deep Analysis', desc: 'Multi-stage AI pipeline maps direct skills, infers indirect capabilities, and scores projects.' },
  { step: '04', icon: TrendingUp, title: 'Review & Decide', desc: 'Get transparent scores, improvement plans, and custom interview questions.' },
];

const benefits = {
  candidates: [
    'Know exactly how well your resume matches before applying',
    'Discover which projects demonstrate the most relevant skills',
    'Get specific resume improvements with suggested rewrites',
    'Prepare for interviews with AI-generated evidence-based questions',
  ],
  recruiters: [
    'Reduce screening time with instant AI-scored evaluations',
    'Compare candidates objectively on a transparent scoring matrix',
    'Surface hidden talent whose skills are shown in projects',
    'Generate structured interview questions for each candidate',
  ],
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/6 bg-zinc-950/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Sparkles size={17} className="text-white" />
            </div>
            <div>
              <span className="font-bold text-white text-sm">AI Resume Analyzer</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" size="sm">Sign in</Button>
            </Link>
            <Link to="/register">
              <Button size="sm" icon={<Sparkles size={14} />}>Get started free</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-36 pb-28 px-6 overflow-hidden">
        {/* Background elements */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] opacity-20"
            style={{ background: 'radial-gradient(ellipse at center, rgba(99,102,241,0.4) 0%, transparent 70%)' }} />
          <div className="absolute top-24 left-1/4 w-96 h-96 opacity-10 rounded-full blur-3xl"
            style={{ background: 'rgba(139, 92, 246, 0.6)' }} />
          <div className="absolute top-32 right-1/4 w-72 h-72 opacity-8 rounded-full blur-3xl"
            style={{ background: 'rgba(99, 102, 241, 0.5)' }} />
          {/* Grid pattern */}
          <div className="absolute inset-0" style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
            maskImage: 'radial-gradient(ellipse 80% 60% at 50% 0%, black 50%, transparent 100%)',
          }} />
        </div>

        <div className="relative max-w-5xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/8 text-indigo-300 text-xs font-semibold mb-8 animate-fade-in-up">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
            AI-Powered Evidence-Based Analysis
          </div>

          {/* Headline */}
          <h1 className="text-5xl lg:text-7xl font-extrabold leading-[1.1] tracking-tight mb-6 animate-fade-in-up stagger-1">
            Understand every resume
            <span className="block text-gradient mt-2">deeply and fairly</span>
          </h1>

          {/* Sub */}
          <p className="text-lg lg:text-xl text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in-up stagger-2">
            Stop relying on keyword matching. Our AI discovers skills demonstrated in projects,
            maps them to job requirements, and generates{' '}
            <span className="text-zinc-200 font-medium">transparent, explainable match scores</span>.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up stagger-3">
            <Link to="/register">
              <Button size="lg" icon={<Sparkles size={17} />} iconRight={<ChevronRight size={15} />}
                className="animate-pulse-glow">
                Start analyzing for free
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="secondary" size="lg" icon={<Eye size={17} />}>
                View dashboard demo
              </Button>
            </Link>
          </div>

          {/* Trust row */}
          <div className="flex flex-wrap items-center justify-center gap-6 mt-12 text-sm text-zinc-500 animate-fade-in-up stagger-4">
            {[
              { icon: CheckCircle2, text: 'No credit card required' },
              { icon: CheckCircle2, text: 'Free tier available' },
              { icon: Shield, text: 'Privacy-first design' },
            ].map(t => (
              <span key={t.text} className="flex items-center gap-2">
                <t.icon size={14} className="text-emerald-400" />
                {t.text}
              </span>
            ))}
          </div>

          {/* Dashboard Preview */}
          <div className="mt-20 animate-fade-in-up stagger-5">
            <div className="relative mx-auto max-w-4xl">
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/20 via-violet-500/20 to-purple-500/20 rounded-3xl blur-xl" />
              <div className="relative rounded-2xl border border-white/8 bg-zinc-900/80 backdrop-blur-sm overflow-hidden shadow-2xl">
                {/* Fake browser bar */}
                <div className="flex items-center gap-2 px-4 py-3 border-b border-white/6 bg-zinc-900/60">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/60" />
                    <div className="w-3 h-3 rounded-full bg-amber-500/60" />
                    <div className="w-3 h-3 rounded-full bg-emerald-500/60" />
                  </div>
                  <div className="flex-1 mx-4">
                    <div className="bg-zinc-800/60 rounded-lg px-3 py-1 text-xs text-zinc-500 text-center max-w-48 mx-auto">
                      app.airesumeanalyzer.com
                    </div>
                  </div>
                </div>
                {/* Dashboard mockup */}
                <div className="p-6 grid grid-cols-3 gap-4">
                  <div className="col-span-3 flex items-center justify-between mb-2">
                    <div>
                      <div className="h-5 w-48 bg-zinc-800/80 rounded-lg" />
                      <div className="h-3 w-64 bg-zinc-800/50 rounded mt-2" />
                    </div>
                    <div className="flex gap-2">
                      <div className="h-8 w-20 bg-zinc-800/60 rounded-lg" />
                      <div className="h-8 w-28 bg-indigo-500/30 border border-indigo-500/40 rounded-lg" />
                    </div>
                  </div>
                  {[
                    { label: 'Analyses Run', value: '24', color: 'bg-indigo-500/15 border-indigo-500/20' },
                    { label: 'Avg Score', value: '7.8', color: 'bg-violet-500/15 border-violet-500/20' },
                    { label: 'Strong Matches', value: '11', color: 'bg-emerald-500/15 border-emerald-500/20' },
                  ].map(stat => (
                    <div key={stat.label} className={`p-4 rounded-xl border ${stat.color}`}>
                      <div className="text-2xl font-bold text-white">{stat.value}</div>
                      <div className="text-xs text-zinc-400 mt-1">{stat.label}</div>
                    </div>
                  ))}
                  <div className="col-span-2 p-4 rounded-xl bg-zinc-800/40 border border-white/5 space-y-3">
                    {['Senior Frontend Dev @ Vercel', 'ML Engineer @ Hugging Face', 'Backend Lead @ Stripe'].map((job, i) => (
                      <div key={job} className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center shrink-0">
                          <div className="w-3 h-3 rounded-full bg-indigo-400" />
                        </div>
                        <div className="flex-1">
                          <div className="text-xs font-medium text-zinc-200">{job}</div>
                          <div className="flex gap-1 mt-1">
                            <div className="h-1.5 rounded-full bg-indigo-500/50" style={{ width: `${[85, 72, 60][i]}%` }} />
                            <div className="h-1.5 w-3 rounded-full bg-zinc-700" />
                          </div>
                        </div>
                        <div className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                          i === 0 ? 'bg-emerald-500/20 text-emerald-400' :
                          i === 1 ? 'bg-amber-500/20 text-amber-400' :
                          'bg-zinc-700/50 text-zinc-400'
                        }`}>
                          {['8.5', '7.2', '6.0'][i]}/10
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-4 rounded-xl bg-zinc-800/40 border border-white/5">
                    <div className="text-xs text-zinc-500 mb-2">Match Score</div>
                    <div className="flex items-center justify-center py-2">
                      <div className="relative">
                        <svg width="80" height="80" style={{ transform: 'rotate(-90deg)' }}>
                          <circle cx="40" cy="40" r="32" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="7" />
                          <circle cx="40" cy="40" r="32" fill="none" stroke="#10b981" strokeWidth="7"
                            strokeDasharray="201" strokeDashoffset="30" strokeLinecap="round" />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-lg font-extrabold text-white">8.5</span>
                          <span className="text-[9px] text-zinc-500">/10</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-center">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                        Strong Match
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/8 border border-violet-500/20 text-violet-400 text-xs font-semibold mb-4">
              Features
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold mb-4 tracking-tight">
              Built for evidence-based hiring
            </h2>
            <p className="text-zinc-400 max-w-xl mx-auto text-base leading-relaxed">
              Every feature is designed to surface real skills with verifiable evidence — not assumptions or keyword spam.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.title}
                  className="group p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800/60 hover:border-zinc-700/60 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl animate-fade-in-up"
                  style={{ animationDelay: `${i * 0.05}s`, boxShadow: 'none' }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.boxShadow = `0 20px 40px ${f.glow}`;
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                  }}
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-5 shadow-lg transition-transform duration-300 group-hover:scale-105`}
                    style={{ boxShadow: `0 8px 24px ${f.glow}` }}>
                    <Icon size={22} className="text-white" />
                  </div>
                  <h3 className="text-base font-semibold text-white mb-2">{f.title}</h3>
                  <p className="text-sm text-zinc-400 leading-relaxed">{f.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* For Candidates / For Recruiters */}
      <section className="py-24 px-6 bg-gradient-to-b from-transparent to-zinc-900/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4 tracking-tight">
              Built for both sides of the table
            </h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Candidates */}
            <div className="p-8 rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-indigo-950/30 to-zinc-900/60">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/15 border border-indigo-500/20 flex items-center justify-center mb-5">
                <Star size={22} className="text-indigo-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">For Candidates</h3>
              <p className="text-zinc-400 text-sm mb-6">Know exactly how you measure up before submitting.</p>
              <ul className="space-y-3">
                {benefits.candidates.map(b => (
                  <li key={b} className="flex items-start gap-3 text-sm text-zinc-300">
                    <CheckCircle2 size={16} className="text-indigo-400 mt-0.5 shrink-0" />
                    {b}
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <Link to="/register?role=candidate">
                  <Button icon={<ArrowRight size={15} />}>
                    Analyze my resume
                  </Button>
                </Link>
              </div>
            </div>

            {/* Recruiters */}
            <div className="p-8 rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-950/20 to-zinc-900/60">
              <div className="w-12 h-12 rounded-xl bg-amber-500/15 border border-amber-500/20 flex items-center justify-center mb-5">
                <Users size={22} className="text-amber-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">For Recruiters</h3>
              <p className="text-zinc-400 text-sm mb-6">Make faster, fairer, and more defensible hiring decisions.</p>
              <ul className="space-y-3">
                {benefits.recruiters.map(b => (
                  <li key={b} className="flex items-start gap-3 text-sm text-zinc-300">
                    <CheckCircle2 size={16} className="text-amber-400 mt-0.5 shrink-0" />
                    {b}
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <Link to="/register?role=recruiter">
                  <Button variant="secondary" icon={<ArrowRight size={15} />}>
                    Start evaluating candidates
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/8 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-4">
              How it works
            </div>
            <h2 className="text-3xl font-bold mb-4 tracking-tight">Four steps to complete analysis</h2>
            <p className="text-zinc-400 max-w-md mx-auto">From upload to actionable insights in under 2 minutes.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={s.step} className="relative text-center group">
                  {i < steps.length - 1 && (
                    <div className="hidden lg:block absolute top-7 left-[calc(75%+8px)] right-[-25%] h-px bg-gradient-to-r from-zinc-700 to-transparent" />
                  )}
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white font-bold text-lg mb-5 shadow-lg shadow-indigo-500/20 transition-transform duration-300 group-hover:scale-105">
                    <Icon size={24} />
                  </div>
                  <div className="text-xs text-zinc-600 font-mono mb-2">{s.step}</div>
                  <h3 className="font-semibold text-zinc-100 mb-2 text-sm">{s.title}</h3>
                  <p className="text-xs text-zinc-500 leading-relaxed px-2">{s.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/20 via-violet-500/20 to-purple-500/20 rounded-3xl blur-xl" />
            <div className="relative p-10 lg:p-14 rounded-2xl bg-gradient-to-br from-indigo-950/50 to-zinc-900/80 border border-indigo-500/20 text-center">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-indigo-500/25">
                <Sparkles size={24} className="text-white" />
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold mb-4 tracking-tight">
                Ready to start?
              </h2>
              <p className="text-zinc-400 mb-10 text-base max-w-lg mx-auto leading-relaxed">
                Join teams and candidates using evidence-based AI analysis to make better, faster hiring decisions.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/register?role=candidate">
                  <Button size="lg" icon={<Sparkles size={17} />}>
                    I'm a candidate
                  </Button>
                </Link>
                <Link to="/register?role=recruiter">
                  <Button variant="secondary" size="lg" icon={<Users size={17} />}>
                    I'm recruiting
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-6 border-t border-zinc-800/60">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
              <Sparkles size={14} className="text-white" />
            </div>
            <span className="font-semibold text-zinc-300 text-sm">AI Resume Analyzer</span>
          </div>
          <div className="flex items-center gap-6 text-xs text-zinc-500">
            <Link to="/login" className="hover:text-zinc-300 transition-colors">Sign in</Link>
            <Link to="/register" className="hover:text-zinc-300 transition-colors">Get started</Link>
            <span>Evidence-based · Transparent · Privacy-first</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
