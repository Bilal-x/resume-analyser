import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button, Input, Card } from '../components/ui';
import { Sparkles, Mail, Lock, User, Briefcase, ArrowLeft, Eye, EyeOff } from 'lucide-react';

function AuthShell({ children, title, subtitle }: {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] opacity-20"
          style={{ background: 'radial-gradient(ellipse at center, rgba(99,102,241,0.5) 0%, transparent 70%)' }} />
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
          maskImage: 'radial-gradient(ellipse 60% 50% at 50% 0%, black 50%, transparent 100%)',
        }} />
      </div>

      <div className="relative w-full max-w-md animate-fade-in-up">
        {/* Back to home */}
        <Link to="/" className="flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-300 transition-colors mb-8 group">
          <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
          Back to home
        </Link>

        {/* Logo */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
            <Sparkles size={18} className="text-white" />
          </div>
          <div>
            <div className="font-bold text-white text-sm">AI Resume Analyzer</div>
            <div className="text-xs text-zinc-500">Evidence-based hiring intelligence</div>
          </div>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">{title}</h1>
          <p className="text-zinc-400 mt-1.5 text-sm">{subtitle}</p>
        </div>

        {children}
      </div>
    </div>
  );
}

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
    <AuthShell title="Welcome back" subtitle="Sign in to your account to continue">
      <Card className="p-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="p-3.5 rounded-xl bg-red-500/8 border border-red-500/20 text-red-400 text-sm flex items-start gap-2.5">
              <div className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 shrink-0" />
              {error}
            </div>
          )}

          <Input
            id="login-email"
            label="Email address"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            icon={<Mail size={16} />}
            autoComplete="email"
            required
          />

          <div className="space-y-1.5">
            <label htmlFor="login-password" className="block text-sm font-medium text-zinc-300">
              Password
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none">
                <Lock size={16} />
              </span>
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Your password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="current-password"
                required
                className="w-full bg-zinc-900/70 border border-zinc-700/50 rounded-xl text-zinc-100 placeholder-zinc-600 pl-10 pr-11 py-2.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 hover:border-zinc-600/60"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <Button type="submit" loading={loading} className="w-full mt-2" size="lg">
            {loading ? 'Signing in...' : 'Sign in'}
          </Button>
        </form>

        <div className="mt-6 pt-6 border-t border-zinc-800/60 text-center">
          <p className="text-sm text-zinc-500">
            Don't have an account?{' '}
            <Link to="/register" className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors">
              Create one free
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
    <AuthShell title="Create your account" subtitle="Start analyzing resumes for free">
      <Card className="p-8">
        {/* Role picker */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {[
            { id: 'candidate', label: "I'm a candidate", icon: User, desc: 'Analyze my resume', color: 'indigo' },
            { id: 'recruiter', label: "I'm recruiting", icon: Briefcase, desc: 'Evaluate candidates', color: 'amber' },
          ].map(r => {
            const Icon = r.icon;
            const active = role === r.id;
            return (
              <button
                key={r.id}
                type="button"
                onClick={() => setRole(r.id)}
                className={`p-4 rounded-xl border text-left transition-all duration-200 ${
                  active
                    ? r.color === 'indigo'
                      ? 'border-indigo-500/40 bg-indigo-500/8 text-white'
                      : 'border-amber-500/40 bg-amber-500/8 text-white'
                    : 'border-zinc-700/50 text-zinc-400 hover:border-zinc-600/60 hover:text-zinc-300'
                }`}
              >
                <Icon
                  size={18}
                  className={`mb-2 ${active
                    ? r.color === 'indigo' ? 'text-indigo-400' : 'text-amber-400'
                    : 'text-zinc-500'
                  }`}
                />
                <div className="text-sm font-semibold">{r.label}</div>
                <div className="text-xs opacity-60 mt-0.5">{r.desc}</div>
              </button>
            );
          })}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3.5 rounded-xl bg-red-500/8 border border-red-500/20 text-red-400 text-sm flex items-start gap-2.5">
              <div className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 shrink-0" />
              {error}
            </div>
          )}

          <Input
            id="register-name"
            label="Full name"
            placeholder="Jane Smith"
            value={name}
            onChange={e => setName(e.target.value)}
            icon={<User size={16} />}
            autoComplete="name"
            required
          />

          <Input
            id="register-email"
            label="Email address"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            icon={<Mail size={16} />}
            autoComplete="email"
            required
          />

          <div className="space-y-1.5">
            <label htmlFor="register-password" className="block text-sm font-medium text-zinc-300">
              Password
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none">
                <Lock size={16} />
              </span>
              <input
                id="register-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Min. 8 characters"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="new-password"
                required
                className="w-full bg-zinc-900/70 border border-zinc-700/50 rounded-xl text-zinc-100 placeholder-zinc-600 pl-10 pr-11 py-2.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 hover:border-zinc-600/60"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {password.length > 0 && (
              <div className="flex gap-1.5 mt-2">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className={`flex-1 h-1 rounded-full transition-colors duration-300 ${
                      password.length >= [4, 7, 10, 14][i]
                        ? password.length >= 10 ? 'bg-emerald-500' : password.length >= 7 ? 'bg-amber-500' : 'bg-red-500'
                        : 'bg-zinc-700'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          <Button type="submit" loading={loading} className="w-full mt-2" size="lg">
            {loading ? 'Creating account...' : 'Create account'}
          </Button>
        </form>

        <div className="mt-6 pt-6 border-t border-zinc-800/60 text-center">
          <p className="text-sm text-zinc-500">
            Already have an account?{' '}
            <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </Card>

      <p className="text-center text-xs text-zinc-600 mt-4">
        By creating an account, you agree to evidence-based, privacy-first AI analysis.
      </p>
    </AuthShell>
  );
}
