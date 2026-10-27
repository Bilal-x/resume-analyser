import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  LayoutDashboard, FileText, Briefcase, BarChart3,
  LogOut, User, ChevronDown, Sparkles, Menu, X
} from 'lucide-react';
import { useState } from 'react';
import { clsx } from 'clsx';

const candidateNav = [
  { to: '/candidate', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/resumes', label: 'My Resumes', icon: FileText },
  { to: '/jds', label: 'Job Descriptions', icon: Briefcase },
  { to: '/analyses', label: 'My Analyses', icon: BarChart3 },
];

const recruiterNav = [
  { to: '/recruiter', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/jds', label: 'Job Descriptions', icon: Briefcase },
  { to: '/resumes', label: 'Candidate Resumes', icon: FileText },
  { to: '/analyses', label: 'All Analyses', icon: BarChart3 },
];

export function Sidebar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const nav = user?.role === 'recruiter' ? recruiterNav : candidateNav;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const NavLinks = () => (
    <>
      {nav.map(item => {
        const Icon = item.icon;
        const active = location.pathname === item.to || location.pathname.startsWith(item.to + '/');
        return (
          <Link
            key={item.to}
            to={item.to}
            onClick={() => setMobileOpen(false)}
            className={clsx(
              'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
              active
                ? 'bg-gradient-to-r from-indigo-500/20 to-violet-500/20 text-white border border-indigo-500/30'
                : 'text-gray-400 hover:text-white hover:bg-white/10'
            )}
          >
            <Icon size={16} />
            {item.label}
          </Link>
        );
      })}
    </>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-xl bg-gray-900 border border-white/10 text-white"
      >
        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={clsx(
        'fixed left-0 top-0 bottom-0 w-64 bg-gray-950 border-r border-white/10 flex flex-col z-40',
        'transition-transform duration-300',
        mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      )}>
        {/* Logo */}
        <div className="p-5 border-b border-white/10">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
              <Sparkles size={16} className="text-white" />
            </div>
            <div>
              <span className="font-bold text-white text-sm">AI Resume</span>
              <span className="block text-[10px] text-gray-500 font-medium uppercase tracking-wider">Analyzer</span>
            </div>
          </Link>
        </div>

        {/* Role badge */}
        <div className="px-4 pt-4 pb-2">
          <div className="px-3 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-center">
            <span className="text-xs text-indigo-400 font-medium capitalize">
              {user?.role === 'recruiter' ? '🏢 Recruiter View' : '👤 Candidate View'}
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <NavLinks />
        </nav>

        {/* User profile */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors duration-200"
          >
            <LogOut size={14} />
            Sign out
          </button>
        </div>
      </div>
    </>
  );
}

// Layout wrapper for authenticated pages
export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-950">
      <Sidebar />
      <div className="lg:pl-64">
        <main className="p-6 lg:p-8 pt-16 lg:pt-8">
          {children}
        </main>
      </div>
    </div>
  );
}

// Top page header
export function PageHeader({
  title, subtitle, actions
}: { title: string; subtitle?: string; actions?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between mb-8">
      <div>
        <h1 className="text-2xl font-bold text-white">{title}</h1>
        {subtitle && <p className="text-gray-400 mt-1">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-3">{actions}</div>}
    </div>
  );
}
