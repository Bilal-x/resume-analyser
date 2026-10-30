import React from 'react';
import { clsx } from 'clsx';
import { Sparkles, X } from 'lucide-react';

/* ============================================================
   BUTTON (Minimal, Tactile, Crisp Light Theme)
   ============================================================ */
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
}

export function Button({
  children, variant = 'primary', size = 'md', loading, icon, iconRight, className, disabled, ...props
}: ButtonProps) {
  const base = [
    'relative inline-flex items-center justify-center gap-2 font-medium rounded-lg',
    'transition-all duration-150 ease-out select-none cursor-pointer',
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-slate-900',
    'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
  ].join(' ');

  const variants = {
    primary: [
      'bg-slate-900 text-white font-semibold',
      'hover:bg-slate-800 hover:shadow-sm',
      'border border-slate-900',
      'active:scale-[0.99]',
    ].join(' '),
    secondary: [
      'bg-white text-slate-800 border border-slate-300',
      'hover:bg-slate-50 hover:text-slate-900 hover:border-slate-400 shadow-xs',
      'active:scale-[0.99]',
    ].join(' '),
    ghost: [
      'text-slate-600 bg-transparent',
      'hover:text-slate-900 hover:bg-slate-100',
      'active:scale-[0.99]',
    ].join(' '),
    danger: [
      'bg-red-50 text-red-700 border border-red-200',
      'hover:bg-red-100 hover:border-red-300',
      'active:scale-[0.99]',
    ].join(' '),
    success: [
      'bg-emerald-50 text-emerald-700 border border-emerald-200',
      'hover:bg-emerald-100 hover:border-emerald-300',
      'active:scale-[0.99]',
    ].join(' '),
  };

  const sizes = {
    xs: 'px-2.5 py-1 text-xs',
    sm: 'px-3 py-1.5 text-xs sm:text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-2.5 text-sm sm:text-base',
  };

  return (
    <button
      className={clsx(base, variants[variant], sizes[size], className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <svg className="animate-spin h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : icon ? (
        <span className="shrink-0">{icon}</span>
      ) : null}
      {children}
      {!loading && iconRight && <span className="shrink-0">{iconRight}</span>}
    </button>
  );
}

/* ============================================================
   CARD (Quiet, High-Craft Surface)
   ============================================================ */
interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
  gradient?: boolean;
}

export function Card({ children, className, hover, onClick, gradient }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={clsx(
        'relative overflow-hidden rounded-xl border transition-all duration-200',
        gradient
          ? 'bg-slate-50/80 border-slate-200'
          : 'bg-white border-slate-200 shadow-xs',
        hover && [
          'cursor-pointer',
          'hover:border-slate-300 hover:shadow-md hover:-translate-y-0.5',
        ],
        onClick && 'cursor-pointer',
        className
      )}
    >
      {children}
    </div>
  );
}

/* ============================================================
   BADGE (Crisp, High-Legibility Marker)
   ============================================================ */
interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'purple';
  size?: 'xs' | 'sm' | 'md';
  dot?: boolean;
  className?: string;
}

export function Badge({ children, variant = 'neutral', size = 'sm', dot, className }: BadgeProps) {
  const variants = {
    success: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    warning: 'bg-amber-50 text-amber-800 border-amber-200',
    danger: 'bg-red-50 text-red-800 border-red-200',
    info: 'bg-blue-50 text-blue-800 border-blue-200',
    neutral: 'bg-slate-100 text-slate-700 border-slate-200',
    purple: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  };

  const dotColors = {
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    danger: 'bg-red-500',
    info: 'bg-blue-500',
    neutral: 'bg-slate-500',
    purple: 'bg-indigo-500',
  };

  const sizes = {
    xs: 'px-1.5 py-0.5 text-[10px]',
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-xs',
  };

  return (
    <span className={clsx(
      'inline-flex items-center gap-1.5 border rounded-md font-medium leading-none',
      variants[variant],
      sizes[size],
      className
    )}>
      {dot && <span className={clsx('w-1.5 h-1.5 rounded-full shrink-0', dotColors[variant])} />}
      {children}
    </span>
  );
}

/* ============================================================
   INPUT
   ============================================================ */
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
}

export function Input({ label, error, hint, icon, iconRight, className, id, ...props }: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-medium text-slate-700">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
            {icon}
          </span>
        )}
        <input
          id={inputId}
          className={clsx(
            'w-full bg-white border rounded-lg text-slate-900 placeholder-slate-400 text-sm shadow-xs',
            'transition-colors duration-150',
            'focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900',
            error
              ? 'border-red-400 focus:border-red-500'
              : 'border-slate-200 hover:border-slate-300',
            icon ? 'pl-10 pr-4 py-2' : 'px-3.5 py-2',
            iconRight ? 'pr-10' : '',
            className
          )}
          {...props}
        />
        {iconRight && (
          <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400">
            {iconRight}
          </span>
        )}
      </div>
      {error && <p className="text-xs text-red-600 flex items-center gap-1">{error}</p>}
      {hint && !error && <p className="text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

/* ============================================================
   TEXTAREA
   ============================================================ */
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export function Textarea({ label, error, hint, className, id, ...props }: TextareaProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-medium text-slate-700">
          {label}
        </label>
      )}
      <textarea
        id={inputId}
        className={clsx(
          'w-full bg-white border rounded-lg text-slate-900 placeholder-slate-400 text-sm shadow-xs',
          'transition-colors duration-150 resize-none',
          'focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900',
          error
            ? 'border-red-400 focus:border-red-500'
            : 'border-slate-200 hover:border-slate-300',
          'px-3.5 py-2.5',
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
      {hint && !error && <p className="text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

/* ============================================================
   SELECT
   ============================================================ */
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: Array<{ value: string; label: string }>;
}

export function Select({ label, error, options, className, id, ...props }: SelectProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-medium text-slate-700">
          {label}
        </label>
      )}
      <select
        id={inputId}
        className={clsx(
          'w-full bg-white border rounded-lg text-slate-900 text-sm shadow-xs',
          'transition-colors duration-150 cursor-pointer',
          'focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900',
          error
            ? 'border-red-400'
            : 'border-slate-200 hover:border-slate-300',
          'px-3.5 py-2',
          className
        )}
        {...props}
      >
        {options.map(o => (
          <option key={o.value} value={o.value} className="bg-white text-slate-900">
            {o.label}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

/* ============================================================
   SCORE RING (Precise, Radial Indicator for Light Canvas)
   ============================================================ */
interface ScoreRingProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
  animated?: boolean;
}

export function ScoreRing({ score, size = 120, strokeWidth = 7, className, animated = true }: ScoreRingProps) {
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 10) * circumference;

  const color =
    score >= 8 ? '#059669' :
    score >= 6.5 ? '#d97706' :
    score >= 4.5 ? '#ea580c' :
    '#dc2626';

  return (
    <div className={clsx('relative inline-flex items-center justify-center shrink-0', className)}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke="#e2e8f0" strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke={color} strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{
            transition: animated ? 'stroke-dashoffset 1.2s cubic-bezier(0.16, 1, 0.3, 1)' : 'none',
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-mono font-bold text-slate-900 tracking-tight" style={{ fontSize: size * 0.24 }}>
          {score.toFixed(1)}
        </span>
        <span className="text-slate-500 font-mono text-[10px]">/10</span>
      </div>
    </div>
  );
}

/* ============================================================
   PROGRESS BAR
   ============================================================ */
interface ProgressBarProps {
  value: number;
  max?: number;
  label?: string;
  color?: string;
  size?: 'xs' | 'sm' | 'md';
  showValue?: boolean;
}

export function ProgressBar({ value, max = 10, label, color, size = 'md', showValue = true }: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  const barColor = color || (
    pct >= 75 ? '#059669' :
    pct >= 50 ? '#d97706' :
    pct >= 30 ? '#ea580c' :
    '#dc2626'
  );

  const heights = { xs: 'h-1', sm: 'h-1.5', md: 'h-2' };

  return (
    <div className="space-y-1.5">
      {(label || showValue) && (
        <div className="flex justify-between items-center text-xs">
          {label && <span className="text-slate-600 font-medium">{label}</span>}
          {showValue && (
            <span className="text-slate-700 font-mono tabular-nums">
              {value.toFixed(1)}<span className="text-slate-400">/{max}</span>
            </span>
          )}
        </div>
      )}
      <div className={clsx('bg-slate-100 border border-slate-200 rounded-full overflow-hidden', heights[size])}>
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{
            width: `${pct}%`,
            backgroundColor: barColor,
          }}
        />
      </div>
    </div>
  );
}

/* ============================================================
   SKELETON
   ============================================================ */
export function Skeleton({ className }: { className?: string }) {
  return <div className={clsx('bg-slate-200/70 rounded-lg animate-pulse', className)} />;
}

/* ============================================================
   EMPTY STATE
   ============================================================ */
interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

export function EmptyState({ icon, title, description, action, size = 'md' }: EmptyStateProps) {
  const paddings = { sm: 'py-10', md: 'py-16', lg: 'py-20' };
  return (
    <div className={clsx('flex flex-col items-center justify-center text-center', paddings[size])}>
      <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 text-slate-500 flex items-center justify-center mb-3">
        {icon}
      </div>
      <h3 className="text-sm font-semibold text-slate-900 mb-1.5">{title}</h3>
      <p className="text-xs text-slate-500 max-w-sm mb-5 leading-relaxed">{description}</p>
      {action}
    </div>
  );
}

/* ============================================================
   STAT CARD
   ============================================================ */
interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color?: 'indigo' | 'violet' | 'emerald' | 'amber' | 'blue' | 'rose';
  trend?: string;
}

export function StatCard({ label, value, icon, trend }: StatCardProps) {
  return (
    <Card className="p-4 sm:p-5">
      <div className="flex items-center gap-3.5">
        <div className="w-10 h-10 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-center text-slate-700 shrink-0">
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight tabular-nums">{value}</p>
          <p className="text-xs text-slate-500 mt-0.5">{label}</p>
          {trend && <p className="text-[11px] text-emerald-600 mt-0.5">{trend}</p>}
        </div>
      </div>
    </Card>
  );
}

/* ============================================================
   DIVIDER
   ============================================================ */
export function Divider({ className }: { className?: string }) {
  return <div className={clsx('border-t border-slate-200', className)} />;
}

/* ============================================================
   ALERT / NOTICE
   ============================================================ */
interface AlertProps {
  children: React.ReactNode;
  variant?: 'info' | 'success' | 'warning' | 'danger';
  icon?: React.ReactNode;
  className?: string;
}

export function Alert({ children, variant = 'info', icon, className }: AlertProps) {
  const variants = {
    info: 'bg-blue-50 border-blue-200 text-blue-900',
    success: 'bg-emerald-50 border-emerald-200 text-emerald-900',
    warning: 'bg-amber-50 border-amber-200 text-amber-900',
    danger: 'bg-red-50 border-red-200 text-red-900',
  };

  return (
    <div className={clsx('flex items-start gap-3 p-3.5 rounded-lg border text-xs sm:text-sm', variants[variant], className)}>
      {icon && <span className="shrink-0 mt-0.5">{icon}</span>}
      <div>{children}</div>
    </div>
  );
}

/* ============================================================
   TABS
   ============================================================ */
interface TabsProps {
  tabs: Array<{ id: string; label: string; icon?: React.ReactNode }>;
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
}

export function Tabs({ tabs, activeTab, onChange, className }: TabsProps) {
  return (
    <div
      className={clsx('flex items-center gap-1 p-1 bg-slate-100 border border-slate-200 rounded-lg overflow-x-auto', className)}
      style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}
    >
      {tabs.map(tab => {
        const active = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={clsx(
              'flex items-center gap-2 px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium whitespace-nowrap shrink-0 cursor-pointer',
              'transition-all duration-150',
              active
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            )}
          >
            {tab.icon && <span className="shrink-0 opacity-75">{tab.icon}</span>}
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

/* ============================================================
   STYLISH POPUP: "dev is working on this..stay tuned"
   ============================================================ */
interface DevWorkingModalProps {
  isOpen: boolean;
  onClose: () => void;
  featureTitle?: string;
}

export function DevWorkingModal({ isOpen, onClose, featureTitle = 'Upcoming Feature' }: DevWorkingModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Blurred overlay */}
      <div
        className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modern crisp modal window */}
      <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 shadow-2xl z-10 animate-fade-in-up">
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X size={18} />
        </button>

        {/* Status Pill & Icon */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-sm">
            <Sparkles size={20} className="text-amber-300" />
          </div>
          <div>
            <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-200">
              In Active Development
            </span>
            <h3 className="text-sm font-semibold text-slate-900 mt-0.5">{featureTitle}</h3>
          </div>
        </div>

        {/* Exact User Required Message */}
        <div className="my-5 p-4 rounded-xl bg-slate-50 border border-slate-200/90 text-center">
          <p className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
            dev is working on this..stay tuned
          </p>
          <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
            Our engineering team is actively building this engine to bring automated ATS-friendly resume tailoring and real-time interview simulations to your workflow.
          </p>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-2 pt-2">
          <Button variant="primary" size="sm" onClick={onClose} className="w-full sm:w-auto">
            Got it, thanks!
          </Button>
        </div>
      </div>
    </div>
  );
}
