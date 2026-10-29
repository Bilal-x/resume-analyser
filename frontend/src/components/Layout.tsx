import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  LayoutDashboard, FileText, Briefcase, BarChart3,
  LogOut, Sparkles, Menu, X, Plus, ChevronRight
} from 'lucide-react';
import { useState } from 'react';
import { clsx } from 'clsx';

const candidateNav = [
  { to: '/candidate', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { to: '/resumes', label: 'My Resumes', icon: FileText },
  { to: '/jds', label: 'Job Descriptions', icon: Briefcase },
  { to: '/analyses', label: 'Analyses', icon: BarChart3 },
];

const recruiterNav = [
  { to: '/recruiter', label: 'Dashboard', icon: LayoutDashboard, exact: true },
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
  const isRecruiter = user?.role === 'recruiter';

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (item: typeof candidateNav[0]) => {
    if (item.exact) return location.pathname === item.to;
    return location.pathname === item.to || location.pathname.startsWith(item.to + '/');
  };

  const userInitial = user?.name?.charAt(0).toUpperCase() || '?';

  return (
    <>
      {/* Mobile toggle button */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Toggle navigation"
        className={clsx(
          'lg:hidden fixed top-4 left-4 z-50 w-9 h-9 rounded-xl flex items-center justify-center',
          'bg-zinc-900/90 border border-zinc-700/60 text-zinc-300',
          'backdrop-blur-xl transition-all duration-200',
          'hover:bg-zinc-800 hover:text-white',
          mobileOpen && 'bg-zinc-800'
        )}
      >
        {mobileOpen ? <X size={18} /> : <Menu size={18} />}
      </button>

      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={clsx(
        'fixed left-0 top-0 bottom-0 w-64 flex flex-col z-40',
        'bg-zinc-950/95 border-r border-zinc-800/60 backdrop-blur-xl',
        'transition-transform duration-300 ease-in-out',
        mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      )}>

        {/* Logo */}
        <div className="p-5 border-b border-zinc-800/60">
          <Link to="/" className="flex items-center gap-3 group" onClick={() => setMobileOpen(false)}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/30 transition-shadow">
              <Sparkles size={17} className="text-white" />
            </div>
            <div>
              <div className="font-bold text-white text-sm leading-tight">AI Resume</div>
              <div className="text-[10px] text-zinc-500 font-medium uppercase tracking-widest">Analyzer</div>
            </div>
          </Link>
        </div>

        {/* Role indicator */}
        <div className="px-4 pt-4 pb-2">
          <div className={clsx(
            'px-3 py-1.5 rounded-lg text-center text-xs font-semibold border',
            isRecruiter
              ? 'bg-amber-500/8 border-amber-500/20 text-amber-400'
              : 'bg-indigo-500/8 border-indigo-500/20 text-indigo-400'
          )}>
            {isRecruiter ? 'Recruiter Portal' : 'Candidate View'}
          </div>
        </div>

        {/* Quick action */}
        <div className="px-4 py-2">
          <button
            onClick={() => { navigate('/analyses/new'); setMobileOpen(false); }}
            className={clsx(
              'w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold',
              'bg-gradient-to-r from-indigo-600 to-violet-600 text-white',
              'hover:from-indigo-500 hover:to-violet-500 transition-all duration-200',
              'shadow-md shadow-indigo-500/20'
            )}
          >
            <span className="flex items-center gap-2">
              <Plus size={15} />
              New Analysis
            </span>
            <ChevronRight size={14} className="opacity-70" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-3 space-y-1 overflow-y-auto">
          {nav.map(item => {
            const Icon = item.icon;
            const active = isActive(item);
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                className={clsx(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium',
                  'transition-all duration-200 group',
                  active
                    ? [
                        'bg-indigo-500/12 text-white border border-indigo-500/25',
                        'shadow-sm',
                      ]
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
                )}
              >
                <Icon
                  size={16}
                  className={clsx(
                    'transition-colors',
                    active ? 'text-indigo-400' : 'text-zinc-500 group-hover:text-zinc-400'
                  )}
                />
                {item.label}
                {active && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-400" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* User section */}
        <div className="p-4 border-t border-zinc-800/60">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-sm font-bold text-white shrink-0 shadow-md">
              {userInitial}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-zinc-100 truncate">{user?.name}</p>
              <p className="text-xs text-zinc-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className={clsx(
              'w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm',
              'text-zinc-500 hover:text-red-400 hover:bg-red-500/8',
              'transition-all duration-200'
            )}
          >
            <LogOut size={14} />
            Sign out
          </button>
        </div>
      </aside>
    </>
  );
}

/* ============================================================
   APP LAYOUT WRAPPER
   ============================================================ */
export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-zinc-950">
      <Sidebar />
      <div className="lg:pl-64">
        <main className="p-5 lg:p-8 pt-16 lg:pt-8 max-w-[1400px]">
          {children}
        </main>
      </div>
    </div>
  );
}

/* ============================================================
   PAGE HEADER
   ============================================================ */
export function PageHeader({
  title, subtitle, actions, breadcrumb
}: {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  breadcrumb?: string;
}) {
  return (
    <div className="flex items-start justify-between mb-8 gap-4">
      <div className="min-w-0">
        {breadcrumb && (
          <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider mb-1">{breadcrumb}</p>
        )}
        <h1 className="text-2xl font-bold text-white leading-tight">{title}</h1>
        {subtitle && (
          <p className="text-sm text-zinc-400 mt-1.5 leading-relaxed max-w-2xl">{subtitle}</p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-3 shrink-0 flex-wrap justify-end">
          {actions}
        </div>
      )}
    </div>
  );
}

/* ============================================================
   SECTION HEADER
   ============================================================ */
export function SectionHeader({
  title, subtitle, action
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between mb-5">
      <div>
        <h2 className="text-base font-semibold text-zinc-100">{title}</h2>
        {subtitle && <p className="text-xs text-zinc-500 mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
