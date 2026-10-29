import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  LayoutDashboard, FileText, Briefcase, BarChart3,
  LogOut, Menu, X, Plus, Layers
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
          'lg:hidden fixed top-4 left-4 z-50 w-9 h-9 rounded-lg flex items-center justify-center',
          'bg-zinc-900 border border-zinc-800 text-zinc-300',
          'transition-colors duration-150',
          'hover:bg-zinc-800 hover:text-white',
          mobileOpen && 'bg-zinc-800'
        )}
      >
        {mobileOpen ? <X size={18} /> : <Menu size={18} />}
      </button>

      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/70 z-40 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={clsx(
        'fixed left-0 top-0 bottom-0 w-64 flex flex-col z-40',
        'bg-zinc-950 border-r border-zinc-800/80',
        'transition-transform duration-200 ease-in-out',
        mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      )}>

        {/* Logo */}
        <div className="p-5 border-b border-zinc-800/80">
          <Link to="/" className="flex items-center gap-3 group" onClick={() => setMobileOpen(false)}>
            <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-200 group-hover:border-zinc-700 transition-colors">
              <Layers size={16} />
            </div>
            <div>
              <div className="font-semibold text-white text-sm tracking-tight">Resume Analyzer</div>
              <div className="text-[10px] text-zinc-500 font-mono tracking-wider">v1.0 · evidence</div>
            </div>
          </Link>
        </div>

        {/* Role indicator */}
        <div className="px-4 pt-4 pb-2">
          <div className={clsx(
            'px-2.5 py-1 rounded-md text-xs font-mono font-medium border text-center',
            isRecruiter
              ? 'bg-zinc-900/80 border-zinc-800 text-amber-400'
              : 'bg-zinc-900/80 border-zinc-800 text-zinc-300'
          )}>
            {isRecruiter ? 'recruiter-workspace' : 'candidate-workspace'}
          </div>
        </div>

        {/* Quick action button */}
        <div className="px-4 py-2">
          <button
            onClick={() => { navigate('/analyses/new'); setMobileOpen(false); }}
            className={clsx(
              'w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold',
              'bg-zinc-100 text-zinc-950 hover:bg-white active:scale-[0.98]',
              'transition-all duration-150 shadow-sm'
            )}
          >
            <Plus size={14} />
            <span>New Analysis</span>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
          {nav.map(item => {
            const Icon = item.icon;
            const active = isActive(item);
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                className={clsx(
                  'flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium',
                  'transition-colors duration-150',
                  active
                    ? 'bg-zinc-900 text-white border border-zinc-800 font-semibold'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50'
                )}
              >
                <Icon
                  size={15}
                  className={clsx(
                    'transition-colors shrink-0',
                    active ? 'text-zinc-200' : 'text-zinc-500'
                  )}
                />
                <span className="flex-1">{item.label}</span>
                {active && (
                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Profile & Logout */}
        <div className="p-4 border-t border-zinc-800/80">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-xs font-mono font-medium text-zinc-200 shrink-0">
              {userInitial}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-zinc-200 truncate">{user?.name}</p>
              <p className="text-[11px] text-zinc-500 truncate font-mono">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className={clsx(
              'w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs',
              'text-zinc-400 hover:text-red-400 hover:bg-zinc-900',
              'transition-colors duration-150'
            )}
          >
            <LogOut size={13} />
            <span>Sign out</span>
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
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans antialiased selection:bg-zinc-800 selection:text-white">
      <Sidebar />
      <div className="lg:pl-64 flex-1 flex flex-col min-w-0">
        <main className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 pt-16 lg:pt-8 flex-1">
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
    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4 pb-5 border-b border-zinc-800/80">
      <div className="min-w-0">
        {breadcrumb && (
          <p className="text-[11px] text-zinc-500 font-mono uppercase tracking-wider mb-1">{breadcrumb}</p>
        )}
        <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-tight">{title}</h1>
        {subtitle && (
          <p className="text-xs sm:text-sm text-zinc-400 mt-1 leading-relaxed max-w-2xl">{subtitle}</p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
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
    <div className="flex items-center justify-between mb-4">
      <div>
        <h2 className="text-sm font-semibold text-zinc-200">{title}</h2>
        {subtitle && <p className="text-[11px] text-zinc-500 mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
