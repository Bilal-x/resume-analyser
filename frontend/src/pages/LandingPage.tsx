import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, CheckCircle2, BarChart3, FileSearch, Zap, Users, Shield, Star } from 'lucide-react';
import { Button } from '../components/ui';

const features = [
  {
    icon: FileSearch,
    title: 'Deep Resume Analysis',
    description: 'Goes beyond keyword matching — discovers skills demonstrated in projects, internships, and indirect experience.',
    color: 'from-indigo-500 to-violet-600',
  },
  {
    icon: BarChart3,
    title: 'Explainable Match Score',
    description: 'Transparent weighted scoring out of 10 with a full breakdown by dimension, evidence, and confidence.',
    color: 'from-violet-500 to-purple-600',
  },
  {
    icon: Zap,
    title: 'Indirect Skill Discovery',
    description: 'Identifies skills implied by project implementations — not just what\'s listed in the Skills section.',
    color: 'from-purple-500 to-pink-600',
  },
  {
    icon: Users,
    title: 'Candidate Comparison',
    description: 'HR teams can compare candidates side-by-side, filter by score, and shortlist with evidence-backed reasoning.',
    color: 'from-pink-500 to-rose-600',
  },
  {
    icon: Shield,
    title: 'Privacy First',
    description: 'Candidate resumes are private by default. Analyses stay separate unless explicitly shared.',
    color: 'from-emerald-500 to-teal-600',
  },
  {
    icon: Star,
    title: 'Interview Questions',
    description: 'Auto-generates evidence-based interview questions tailored to each candidate\'s resume and the JD.',
    color: 'from-amber-500 to-orange-600',
  },
];

const steps = [
  { step: '01', title: 'Upload Resume', desc: 'PDF or DOCX — our parser extracts every detail.' },
  { step: '02', title: 'Add Job Description', desc: 'Paste or upload the JD and we\'ll structure its requirements.' },
  { step: '03', title: 'Run Deep Analysis', desc: 'Multi-stage AI pipeline maps skills, evidence, and gaps.' },
  { step: '04', title: 'Review & Act', desc: 'Get scores, recommendations, and interview questions.' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-gray-950/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
              <Sparkles size={16} />
            </div>
            <span className="font-bold text-lg">AI Resume Analyzer</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" size="sm">Sign in</Button>
            </Link>
            <Link to="/register">
              <Button size="sm">Get started free</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-24 px-6 overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-40 left-1/4 w-[300px] h-[300px] bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-sm font-medium mb-6">
            <Sparkles size={14} />
            AI-powered resume analysis
          </div>

          <h1 className="text-5xl lg:text-7xl font-bold leading-tight mb-6">
            Understand every resume
            <span className="block gradient-text">deeply and fairly</span>
          </h1>

          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10">
            Stop relying on keyword matching. Our AI discovers skills demonstrated in projects,
            maps them to job requirements, and generates transparent, explainable match scores.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register">
              <Button size="lg" icon={<Sparkles size={18} />}>
                Start analyzing for free
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="secondary" size="lg" icon={<ArrowRight size={18} />}>
                Sign in to dashboard
              </Button>
            </Link>
          </div>

          {/* Trust indicators */}
          <div className="flex flex-wrap items-center justify-center gap-6 mt-12 text-sm text-gray-500">
            {['No credit card required', 'Free tier available', 'Privacy-first design'].map(t => (
              <span key={t} className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-emerald-400" />
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Features grid */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Built for evidence-based hiring</h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              Every feature is designed to surface real skills with verifiable evidence — not assumptions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(f => {
              const Icon = f.icon;
              return (
                <div
                  key={f.title}
                  className="p-6 rounded-2xl bg-gray-900/60 border border-white/10 hover:border-white/20 transition-colors duration-200 group"
                >
                  <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200`}>
                    <Icon size={20} className="text-white" />
                  </div>
                  <h3 className="text-base font-semibold text-white mb-2">{f.title}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">{f.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-6 bg-gray-900/30">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">How it works</h2>
            <p className="text-gray-400">Four simple steps to a complete resume analysis</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((s, i) => (
              <div key={s.step} className="relative text-center">
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-5 left-3/4 w-1/2 h-px bg-gradient-to-r from-white/20 to-transparent" />
                )}
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-sm font-bold mb-4">
                  {s.step}
                </div>
                <h3 className="font-semibold text-white mb-2">{s.title}</h3>
                <p className="text-sm text-gray-400">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="p-8 lg:p-12 rounded-3xl bg-gradient-to-br from-indigo-900/40 to-violet-900/40 border border-indigo-500/20">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Ready to analyze your first resume?</h2>
            <p className="text-gray-400 mb-8">
              Join HR teams and candidates who use evidence-based analysis to make better decisions.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/register?role=candidate">
                <Button size="lg">I'm a candidate →</Button>
              </Link>
              <Link to="/register?role=recruiter">
                <Button variant="secondary" size="lg">I'm recruiting →</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-white/10">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <Sparkles size={14} className="text-indigo-400" />
            <span>AI Resume Analyzer</span>
          </div>
          <span>Evidence-based. Transparent. Privacy-first.</span>
        </div>
      </footer>
    </div>
  );
}
