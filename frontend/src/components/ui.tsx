import React from 'react';
import { clsx } from 'clsx';

/* ============================================================
   BUTTON (Minimal, Tactile, Human)
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
    'transition-all duration-150 ease-out select-none',
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 focus-visible:ring-zinc-400',
    'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
  ].join(' ');

  const variants = {
    primary: [
      'bg-zinc-100 text-zinc-950 font-semibold',
      'hover:bg-white hover:shadow-md',
      'border border-white/20',
      'active:scale-[0.99]',
    ].join(' '),
    secondary: [
      'bg-zinc-900 text-zinc-200 border border-zinc-800',
      'hover:bg-zinc-850 hover:text-white hover:border-zinc-700',
      'active:scale-[0.99]',
    ].join(' '),
    ghost: [
      'text-zinc-400 bg-transparent',
      'hover:text-zinc-200 hover:bg-zinc-900',
      'active:scale-[0.99]',
    ].join(' '),
    danger: [
      'bg-red-500/10 text-red-400 border border-red-500/20',
      'hover:bg-red-500/15 hover:border-red-500/30 hover:text-red-300',
      'active:scale-[0.99]',
    ].join(' '),
    success: [
      'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
      'hover:bg-emerald-500/15 hover:border-emerald-500/30',
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
   CARD (Quiet, Structured Surface)
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
          ? 'bg-zinc-900/60 border-zinc-800'
          : 'bg-zinc-900/40 border-zinc-800/80',
        hover && [
          'cursor-pointer',
          'hover:border-zinc-700 hover:bg-zinc-900/70',
          'hover:-translate-y-0.5',
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
   BADGE (Clean, Legible Status Marker)
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
    success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    warning: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    danger: 'bg-red-500/10 text-red-400 border-red-500/20',
    info: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    neutral: 'bg-zinc-800/70 text-zinc-300 border-zinc-700/50',
    purple: 'bg-zinc-800/70 text-zinc-300 border-zinc-700/50',
  };

  const dotColors = {
    success: 'bg-emerald-400',
    warning: 'bg-amber-400',
    danger: 'bg-red-400',
    info: 'bg-blue-400',
    neutral: 'bg-zinc-400',
    purple: 'bg-zinc-400',
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
        <label htmlFor={inputId} className="block text-xs font-medium text-zinc-400">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none">
            {icon}
          </span>
        )}
        <input
          id={inputId}
          className={clsx(
            'w-full bg-zinc-900/60 border rounded-lg text-zinc-100 placeholder-zinc-500 text-sm',
            'transition-colors duration-150',
            'focus:outline-none focus:ring-1 focus:ring-zinc-400 focus:border-zinc-400',
            error
              ? 'border-red-500/50 focus:ring-red-500/50'
              : 'border-zinc-800 hover:border-zinc-700',
            icon ? 'pl-10 pr-4 py-2' : 'px-3.5 py-2',
            iconRight ? 'pr-10' : '',
            className
          )}
          {...props}
        />
        {iconRight && (
          <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500">
            {iconRight}
          </span>
        )}
      </div>
      {error && <p className="text-xs text-red-400 flex items-center gap-1">{error}</p>}
      {hint && !error && <p className="text-xs text-zinc-500">{hint}</p>}
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
        <label htmlFor={inputId} className="block text-xs font-medium text-zinc-400">
          {label}
        </label>
      )}
      <textarea
        id={inputId}
        className={clsx(
          'w-full bg-zinc-900/60 border rounded-lg text-zinc-100 placeholder-zinc-500 text-sm',
          'transition-colors duration-150 resize-none',
          'focus:outline-none focus:ring-1 focus:ring-zinc-400 focus:border-zinc-400',
          error
            ? 'border-red-500/50 focus:ring-red-500/50'
            : 'border-zinc-800 hover:border-zinc-700',
          'px-3.5 py-2.5',
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
      {hint && !error && <p className="text-xs text-zinc-500">{hint}</p>}
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
        <label htmlFor={inputId} className="block text-xs font-medium text-zinc-400">
          {label}
        </label>
      )}
      <select
        id={inputId}
        className={clsx(
          'w-full bg-zinc-900/60 border rounded-lg text-zinc-100 text-sm',
          'transition-colors duration-150 cursor-pointer',
          'focus:outline-none focus:ring-1 focus:ring-zinc-400 focus:border-zinc-400',
          error
            ? 'border-red-500/50'
            : 'border-zinc-800 hover:border-zinc-700',
          'px-3.5 py-2',
          className
        )}
        {...props}
      >
        {options.map(o => (
          <option key={o.value} value={o.value} className="bg-zinc-900">
            {o.label}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}

/* ============================================================
   SCORE RING (Precise, Clean Radial Indicator)
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
    score >= 8 ? '#10b981' :
    score >= 6.5 ? '#f59e0b' :
    score >= 4.5 ? '#f97316' :
    '#ef4444';

  return (
    <div className={clsx('relative inline-flex items-center justify-center shrink-0', className)}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={strokeWidth}
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
        <span className="font-mono font-bold text-white tracking-tight" style={{ fontSize: size * 0.24 }}>
          {score.toFixed(1)}
        </span>
        <span className="text-zinc-500 font-mono text-[10px]">/10</span>
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
    pct >= 75 ? '#10b981' :
    pct >= 50 ? '#f59e0b' :
    pct >= 30 ? '#f97316' :
    '#ef4444'
  );

  const heights = { xs: 'h-1', sm: 'h-1.5', md: 'h-2' };

  return (
    <div className="space-y-1.5">
      {(label || showValue) && (
        <div className="flex justify-between items-center text-xs">
          {label && <span className="text-zinc-400">{label}</span>}
          {showValue && (
            <span className="text-zinc-300 font-mono tabular-nums">
              {value.toFixed(1)}<span className="text-zinc-500">/{max}</span>
            </span>
          )}
        </div>
      )}
      <div className={clsx('bg-zinc-800/80 rounded-full overflow-hidden', heights[size])}>
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
  return <div className={clsx('bg-zinc-800/50 rounded-lg animate-pulse', className)} />;
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
      <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 flex items-center justify-center mb-3">
        {icon}
      </div>
      <h3 className="text-sm font-semibold text-zinc-200 mb-1.5">{title}</h3>
      <p className="text-xs text-zinc-500 max-w-sm mb-5 leading-relaxed">{description}</p>
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
        <div className="w-10 h-10 rounded-lg border border-zinc-800 bg-zinc-900 flex items-center justify-center text-zinc-300 shrink-0">
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-xl sm:text-2xl font-bold text-white tracking-tight tabular-nums">{value}</p>
          <p className="text-xs text-zinc-400 mt-0.5">{label}</p>
          {trend && <p className="text-[11px] text-emerald-400 mt-0.5">{trend}</p>}
        </div>
      </div>
    </Card>
  );
}

/* ============================================================
   DIVIDER
   ============================================================ */
export function Divider({ className }: { className?: string }) {
  return <div className={clsx('border-t border-zinc-800/60', className)} />;
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
    info: 'bg-blue-500/5 border-blue-500/20 text-blue-300',
    success: 'bg-emerald-500/5 border-emerald-500/20 text-emerald-300',
    warning: 'bg-amber-500/5 border-amber-500/20 text-amber-300',
    danger: 'bg-red-500/5 border-red-500/20 text-red-300',
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
      className={clsx('flex items-center gap-1 p-1 bg-zinc-900/60 border border-zinc-800/80 rounded-lg overflow-x-auto', className)}
      style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}
    >
      {tabs.map(tab => {
        const active = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={clsx(
              'flex items-center gap-2 px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium whitespace-nowrap shrink-0',
              'transition-colors duration-150',
              active
                ? 'bg-zinc-800 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850'
            )}
          >
            {tab.icon && <span className="shrink-0 opacity-70">{tab.icon}</span>}
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
