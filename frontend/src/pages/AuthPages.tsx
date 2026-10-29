import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button, Input, Card } from '../components/ui';
import { Mail, Lock, User, Briefcase, ArrowLeft, Eye, EyeOff, Layers } from 'lucide-react';

function AuthShell({ children, title, subtitle }: {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6 relative">
      <div className="relative w-full max-w-md">
        {/* Back to home */}
        <Link to="/" className="inline-flex items-center gap-2 text-xs text-zinc-500 hover:text-zinc-300 transition-colors mb-6 group font-mono">
          <ArrowLeft size={13} className="group-hover:-translate-x-0.5 transition-transform" />
          Back to overview
        </Link>

        {/* Logo */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-200">
            <Layers size={16} />
          </div>
          <div>
            <div className="font-semibold text-white text-sm tracking-tight">Resume Analyzer</div>
            <div className="text-[11px] text-zinc-500">Evidence-based hiring intelligence</div>
          </div>
        </div>

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-xl font-bold text-white tracking-tight">{title}</h1>
          <p className="text-zinc-400 mt-1 text-xs">{subtitle}</p>
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
    <AuthShell title="Sign in" subtitle="Enter your credentials to access your dashboard">
      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1 shrink-0" />
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
            <label htmlFor="login-password" className="block text-xs font-medium text-zinc-300">
              Password
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none">
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
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-100 placeholder-zinc-500 pl-9 pr-10 py-2 text-xs transition-colors focus:outline-none focus:ring-1 focus:ring-zinc-400 focus:border-zinc-400"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          <Button type="submit" loading={loading} className="w-full mt-2" size="md">
            {loading ? 'Authenticating...' : 'Sign in'}
          </Button>
        </form>

        <div className="mt-5 pt-5 border-t border-zinc-800 text-center">
          <p className="text-xs text-zinc-500">
            Don't have an account?{' '}
            <Link to="/register" className="text-zinc-200 hover:text-white font-medium transition-colors underline underline-offset-4">
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
      <Card className="p-6">
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
                className={`p-3 rounded-lg border text-left transition-colors ${
                  active
                    ? 'border-zinc-400 bg-zinc-900 text-white font-medium'
                    : 'border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-300'
                }`}
              >
                <Icon size={16} className={`mb-1.5 ${active ? 'text-zinc-100' : 'text-zinc-500'}`} />
                <div className="text-xs font-semibold">{r.label}</div>
                <div className="text-[11px] text-zinc-500">{r.desc}</div>
              </button>
            );
          })}
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <Input
            id="register-name"
            label="Full name"
            placeholder="Jane Smith"
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
            placeholder="you@example.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            icon={<Mail size={15} />}
            autoComplete="email"
            required
          />

          <div className="space-y-1.5">
            <label htmlFor="register-password" className="block text-xs font-medium text-zinc-300">
              Password
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none">
                <Lock size={15} />
              </span>
              <input
                id="register-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Min. 8 characters"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="new-password"
                required
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-100 placeholder-zinc-500 pl-9 pr-10 py-2 text-xs transition-colors focus:outline-none focus:ring-1 focus:ring-zinc-400 focus:border-zinc-400"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
            {password.length > 0 && (
              <div className="flex gap-1 mt-1.5">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className={`flex-1 h-0.5 rounded-full transition-colors ${
                      password.length >= [4, 7, 10, 14][i]
                        ? password.length >= 10 ? 'bg-emerald-500' : password.length >= 7 ? 'bg-amber-500' : 'bg-red-500'
                        : 'bg-zinc-800'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          <Button type="submit" loading={loading} className="w-full mt-2" size="md">
            {loading ? 'Creating account...' : 'Create account'}
          </Button>
        </form>

        <div className="mt-5 pt-5 border-t border-zinc-800 text-center">
          <p className="text-xs text-zinc-500">
            Already have an account?{' '}
            <Link to="/login" className="text-zinc-200 hover:text-white font-medium transition-colors underline underline-offset-4">
              Sign in
            </Link>
          </p>
        </div>
      </Card>

      <p className="text-center text-[11px] text-zinc-600 mt-4">
        Evidence-based, deterministic analysis. No keyword stuffing required.
      </p>
    </AuthShell>
  );
}
