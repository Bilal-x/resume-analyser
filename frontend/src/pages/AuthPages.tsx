import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button, Input, Card } from '../components/ui';
import { Mail, Lock, User, Briefcase, ArrowLeft, Eye, EyeOff, Layers, Terminal } from 'lucide-react';

/* ============================================================
   TYPEWRITER PROMPT COMPONENT
   Creative terminal animation when redirected from Option 1
   ============================================================ */
function TypewriterPrompt({ text }: { text: string }) {
  const [displayed, setDisplayed] = useState('');
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setDisplayed(text.slice(0, i + 1));
      i++;
      if (i >= text.length) {
        clearInterval(interval);
        setIsDone(true);
      }
    }, 22);
    return () => clearInterval(interval);
  }, [text]);

  return (
    <div className="mb-6 rounded-xl border border-slate-900 bg-slate-900 text-slate-100 p-4 shadow-xl animate-fade-in-up">
      <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-slate-800">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-400 inline-block" />
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" />
          <span className="ml-2 font-mono text-[11px] uppercase tracking-wider text-slate-400 flex items-center gap-1">
            <Terminal size={12} className="text-emerald-400" />
            Forensic Telemetry Locked
          </span>
        </div>
        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/70 px-2 py-0.5 rounded border border-emerald-800">
          DEEP DOSSIER
        </span>
      </div>
      <div className="font-mono text-xs leading-relaxed text-slate-200">
        <span className="text-emerald-400 font-bold mr-1.5">&gt;</span>
        <span>{displayed}</span>
        {!isDone && (
          <span className="inline-block w-2 h-4 bg-emerald-400 ml-1 animate-pulse align-middle" />
        )}
      </div>
      <div className="mt-3 pt-2 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
        <span>Sign in to unlock candidate dossier & interview matrix.</span>
      </div>
    </div>
  );
}

function AuthShell({ children, title, subtitle }: {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="min-h-screen bg-slate-50 micro-grid flex items-center justify-center p-4 sm:p-6 relative">
      <div className="relative w-full max-w-md">
        {/* Back to home */}
        <Link to="/" className="inline-flex items-center gap-2 text-xs text-slate-500 hover:text-slate-900 transition-colors mb-6 group font-mono">
          <ArrowLeft size={13} className="group-hover:-translate-x-0.5 transition-transform" />
          Back to overview
        </Link>

        {/* Logo */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-white shadow-xs">
            <Layers size={16} />
          </div>
          <div>
            <div className="font-semibold text-slate-900 text-sm tracking-tight">Resume Analyzer</div>
            <div className="text-[11px] text-slate-500">Evidence-based hiring intelligence</div>
          </div>
        </div>

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">{title}</h1>
          <p className="text-slate-500 mt-1 text-xs">{subtitle}</p>
        </div>

        {children}
      </div>
    </div>
  );
}

export function LoginPage() {
  const [params] = useSearchParams();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isFromUnlock = params.get('prompt') === 'unlock' || params.get('from') === 'instant';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const loggedUser = await login(email, password);
      navigate(loggedUser.role === 'recruiter' ? '/recruiter' : '/candidate');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell title="Sign in" subtitle="Enter your credentials to access your dashboard">
      {isFromUnlock && (
        <TypewriterPrompt
          text="Initializing deep diagnostic telemetry... Mapping 42 forensic competencies, project provenance chains, and recruiter defense rubrics. Sign in to view full unredacted findings."
        />
      )}

      <Card className="p-6 bg-white border border-slate-200 shadow-md">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <Input
            id="login-email"
            label="Email address"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            icon={<Mail size={15} />}
            autoComplete="email"
            required
          />

          <div className="space-y-1.5">
            <label htmlFor="login-password" className="block text-xs font-medium text-slate-700">
              Password
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                <Lock size={15} />
              </span>
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="current-password"
                required
                className="w-full bg-white border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 pl-9 pr-10 py-2 text-xs transition-colors focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          <Button type="submit" loading={loading} className="w-full mt-2" size="md">
            {loading ? 'Authenticating...' : 'Sign in'}
          </Button>
        </form>

        <div className="mt-5 pt-5 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-500">
            Don't have an account?{' '}
            <Link
              to={isFromUnlock ? '/register?prompt=unlock' : '/register'}
              className="text-slate-900 hover:text-slate-700 font-semibold transition-colors underline underline-offset-4"
            >
              Create an account
            </Link>
          </p>
        </div>
      </Card>
    </AuthShell>
  );
}

export function RegisterPage() {
  const [params] = useSearchParams();
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState(params.get('role') || 'candidate');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isFromUnlock = params.get('prompt') === 'unlock';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    setLoading(true);
    try {
      await register(name, email, password, role);
      navigate(role === 'recruiter' ? '/recruiter' : '/candidate');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell title="Create account" subtitle="Set up your workspace to start analyzing">
      {isFromUnlock && (
        <TypewriterPrompt
          text="Welcome to evidence-based hiring intelligence. Register to unlock full ATS parsing breakdown, verified project trails, and custom interview simulations."
        />
      )}

      <Card className="p-6 bg-white border border-slate-200 shadow-md">
        {/* Role picker */}
        <div className="grid grid-cols-2 gap-2.5 mb-5">
          {[
            { id: 'candidate', label: "Candidate", icon: User, desc: 'Analyze own resume' },
            { id: 'recruiter', label: "Recruiter", icon: Briefcase, desc: 'Review applicants' },
          ].map(r => {
            const Icon = r.icon;
            const active = role === r.id;
            return (
              <button
                key={r.id}
                type="button"
                onClick={() => setRole(r.id)}
                className={`p-3 rounded-lg border text-left transition-colors cursor-pointer ${
                  active
                    ? 'border-slate-900 bg-slate-900 text-white font-medium shadow-xs'
                    : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <Icon size={16} className={`mb-1.5 ${active ? 'text-white' : 'text-slate-400'}`} />
                <div className="text-xs font-semibold">{r.label}</div>
                <div className={`text-[11px] ${active ? 'text-slate-300' : 'text-slate-400'}`}>{r.desc}</div>
              </button>
            );
          })}
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <Input
            id="register-name"
            label="Full name"
            placeholder="Alex Chen"
            value={name}
            onChange={e => setName(e.target.value)}
            icon={<User size={15} />}
            autoComplete="name"
            required
          />

          <Input
            id="register-email"
            label="Email address"
            type="email"
            placeholder="alex@example.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            icon={<Mail size={15} />}
            autoComplete="email"
            required
          />

          <div className="space-y-1.5">
            <label htmlFor="register-password" className="block text-xs font-medium text-slate-700">
              Password
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                <Lock size={15} />
              </span>
              <input
                id="register-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="At least 8 characters"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="new-password"
                required
                className="w-full bg-white border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 pl-9 pr-10 py-2 text-xs transition-colors focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          <Button type="submit" loading={loading} className="w-full mt-2" size="md">
            {loading ? 'Creating account...' : 'Create account'}
          </Button>
        </form>

        <div className="mt-5 pt-5 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-500">
            Already have an account?{' '}
            <Link
              to={isFromUnlock ? '/login?prompt=unlock' : '/login'}
              className="text-slate-900 hover:text-slate-700 font-semibold transition-colors underline underline-offset-4"
            >
              Sign in
            </Link>
          </p>
        </div>
      </Card>
    </AuthShell>
  );
}
