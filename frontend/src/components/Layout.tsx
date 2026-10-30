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
          'lg:hidden fixed top-3 left-4 z-50 w-9 h-9 rounded-lg flex items-center justify-center',
          'bg-white border border-slate-200 text-slate-700 shadow-sm',
          'transition-colors duration-150',
          'hover:bg-slate-50',
          mobileOpen && 'bg-slate-100'
        )}
      >
        {mobileOpen ? <X size={18} /> : <Menu size={18} />}
      </button>

      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-slate-950/40 z-40 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={clsx(
        'fixed left-0 top-0 bottom-0 w-64 flex flex-col z-40',
        'bg-white border-r border-slate-200',
        'transition-transform duration-200 ease-in-out',
        mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      )}>

        {/* Logo */}
        <div className="p-5 border-b border-slate-200">
          <Link to="/" className="flex items-center gap-3 group" onClick={() => setMobileOpen(false)}>
            <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-white group-hover:bg-slate-800 transition-colors shadow-2xs">
              <Layers size={16} />
            </div>
            <div>
              <div className="font-semibold text-slate-900 text-sm tracking-tight">Resume Analyzer</div>
              <div className="text-[10px] text-slate-500 font-mono tracking-wider">v2.4 · evidence</div>
            </div>
          </Link>
        </div>

        {/* Role indicator */}
        <div className="px-4 pt-4 pb-2">
          <div className={clsx(
            'px-2.5 py-1 rounded-md text-xs font-mono font-medium border text-center',
            isRecruiter
              ? 'bg-amber-50 border-amber-200 text-amber-800'
              : 'bg-slate-100 border-slate-200 text-slate-700'
          )}>
            {isRecruiter ? 'recruiter-workspace' : 'candidate-workspace'}
          </div>
        </div>

        {/* Quick action button */}
        <div className="px-4 py-2">
          <button
            onClick={() => { navigate('/analyses/new'); setMobileOpen(false); }}
            className={clsx(
              'w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer',
              'bg-slate-900 text-white hover:bg-slate-800 active:scale-[0.98]',
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
                    ? 'bg-slate-100 text-slate-900 border border-slate-200/90 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                )}
              >
                <Icon
                  size={15}
                  className={clsx(
                    'transition-colors shrink-0',
                    active ? 'text-slate-900' : 'text-slate-400'
                  )}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Profile & Logout */}
        <div className="p-4 border-t border-slate-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-mono font-bold text-slate-800 shrink-0">
              {userInitial}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-slate-900 truncate">{user?.name}</p>
              <p className="text-[11px] text-slate-500 truncate font-mono">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className={clsx(
              'w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs cursor-pointer',
              'text-slate-600 hover:text-red-600 hover:bg-red-50',
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
    <div className="min-h-screen bg-slate-50/70 text-slate-900 flex flex-col font-sans antialiased selection:bg-slate-200 selection:text-slate-900">
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
    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4 pb-5 border-b border-slate-200">
      <div className="min-w-0">
        {breadcrumb && (
          <p className="text-[11px] text-slate-500 font-mono uppercase tracking-wider mb-1">{breadcrumb}</p>
        )}
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight leading-tight">{title}</h1>
        {subtitle && (
          <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed max-w-2xl">{subtitle}</p>
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
        <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
        {subtitle && <p className="text-[11px] text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
