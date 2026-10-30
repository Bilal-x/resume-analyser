import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppLayout } from '../components/Layout';
import { Button, Card, Badge, ScoreRing, ProgressBar, Skeleton, EmptyState, Alert, Tabs } from '../components/ui';
import { analysesApi, type AnalysisResponse } from '../lib/api';
import {
  ChevronDown, ChevronUp, CheckCircle2, AlertCircle, Info,
  ArrowLeft, Trash2, MessageSquare, Wrench,
  BarChart3, Search, FolderOpen, BookOpen, Target, HelpCircle,
  FileJson, Printer, Plus, Sparkles, Building2, Star, X, Check,
  ArrowRight, Clock, Copy, Briefcase, AlertTriangle, ShieldCheck,
  TrendingUp
} from 'lucide-react';

const TABS = [
  { id: 'overview', label: 'Overview', icon: <BarChart3 size={13} /> },
  { id: 'experience', label: 'Experience Analysis', icon: <Clock size={13} /> },
  { id: 'skills', label: 'Skills Analysis', icon: <Target size={13} /> },
  { id: 'projects', label: 'Project Analysis', icon: <FolderOpen size={13} /> },
  { id: 'evidence', label: 'Evidence Explorer', icon: <Search size={13} /> },
  { id: 'improvements', label: 'Resume Improvement Center', icon: <Wrench size={13} /> },
  { id: 'interview', label: 'Interview Prep', icon: <MessageSquare size={13} /> },
];

function ScoreInterpretationBadge({ score }: { score: number }) {
  if (score >= 9) return <Badge variant="success">Very Strong Alignment</Badge>;
  if (score >= 7.5) return <Badge variant="success">Strong Alignment</Badge>;
  if (score >= 6) return <Badge variant="warning">Moderate Alignment</Badge>;
  if (score >= 4) return <Badge variant="warning">Partial Alignment</Badge>;
  return <Badge variant="danger">Limited Alignment</Badge>;
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, 'success' | 'warning' | 'danger' | 'info' | 'neutral'> = {
    Supported: 'success',
    'Project-derived': 'info',
    Transferable: 'info',
    Partial: 'warning',
    Unverified: 'warning',
    'Not evidenced': 'danger',
  };
  return <Badge variant={map[status] || 'neutral'} size="xs">{status}</Badge>;
}

function ConfidenceBadge({ confidence }: { confidence: string }) {
  const c = confidence?.toLowerCase();
  return <Badge variant={c === 'high' ? 'success' : c === 'medium' ? 'warning' : 'danger'} size="xs">{confidence}</Badge>;
}

/* ============================================================
   OVERVIEW TAB
   ============================================================ */
function OverviewTab({ analysis }: { analysis: AnalysisResponse }) {
  const sb = analysis.score_breakdown;

  const dimensions = [
    { key: 'mandatory_skills_score', label: 'Mandatory Skills', weight: 0.30 },
    { key: 'core_technical_skills_score', label: 'Core Technical', weight: 0.20 },
    { key: 'project_relevance_score', label: 'Project Relevance', weight: 0.20 },
    { key: 'experience_implementation_score', label: 'Experience', weight: 0.15 },
    { key: 'domain_knowledge_score', label: 'Domain Knowledge', weight: 0.10 },
    { key: 'other_qualifications_score', label: 'Other Quals', weight: 0.05 },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Score hero + dimensions */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <Card className="p-8 flex flex-col items-center justify-center text-center">
          <ScoreRing score={analysis.overall_score} size={160} strokeWidth={12} />
          <div className="mt-5 space-y-2">
            <ScoreInterpretationBadge score={analysis.overall_score} />
            <p className="text-xs text-zinc-500">
              {sb.analysis_confidence} Confidence · {sb.evidence_coverage_percent.toFixed(0)}% Coverage
            </p>
          </div>
        </Card>

        <Card className="p-6 lg:col-span-4">
          <h3 className="font-semibold text-zinc-100 mb-5 text-sm">Score Dimensions</h3>
          <div className="space-y-4">
            {dimensions.map(d => (
              <ProgressBar
                key={d.key}
                value={(sb as unknown as Record<string, number>)[d.key] || 0}
                max={10}
                label={`${d.label} (${Math.round(d.weight * 100)}%)`}
              />
            ))}
          </div>
        </Card>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Direct Matches', value: analysis.direct_findings.length, color: 'text-emerald-400', bg: 'bg-emerald-500/8 border-emerald-500/15' },
          { label: 'Indirect Skills', value: analysis.indirect_findings.length, color: 'text-blue-400', bg: 'bg-blue-500/8 border-blue-500/15' },
          { label: 'Projects Analyzed', value: analysis.project_analyses.length, color: 'text-amber-400', bg: 'bg-amber-500/8 border-amber-500/15' },
          { label: 'Gaps Found', value: analysis.missing_requirements.length, color: 'text-rose-400', bg: 'bg-rose-500/8 border-rose-500/15' },
        ].map(stat => (
          <Card key={stat.label} className={`p-5 text-center border ${stat.bg}`}>
            <p className={`text-3xl font-extrabold ${stat.color} tabular-nums`}>{stat.value}</p>
            <p className="text-xs text-zinc-500 mt-1.5">{stat.label}</p>
          </Card>
        ))}
      </div>

      {/* Evidence coverage bar */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-zinc-100 text-sm">Evidence Coverage</h3>
          <Badge variant={sb.evidence_coverage_percent >= 70 ? 'success' : sb.evidence_coverage_percent >= 40 ? 'warning' : 'danger'}>
            {sb.evidence_coverage_percent.toFixed(0)}%
          </Badge>
        </div>
        <div className="h-3 bg-zinc-800/70 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-1000"
            style={{
              width: `${sb.evidence_coverage_percent}%`,
              background: 'linear-gradient(90deg, #6366f1, #10b981)',
              boxShadow: '0 0 12px rgba(99,102,241,0.3)',
            }}
          />
        </div>
        <p className="text-xs text-zinc-500 mt-2">
          Percentage of JD requirements with at least some evidence in the resume.
        </p>
      </Card>

      {/* Key factors */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="font-semibold text-emerald-400 mb-4 flex items-center gap-2 text-sm">
            <CheckCircle2 size={15} /> Key Strengths
          </h3>
          <ul className="space-y-2.5">
            {sb.key_positive_factors.map((f, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-zinc-300">
                <span className="text-emerald-400 mt-0.5 shrink-0 font-bold">+</span>
                {f}
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold text-rose-400 mb-4 flex items-center gap-2 text-sm">
            <AlertCircle size={15} /> Key Gaps
          </h3>
          <ul className="space-y-2.5">
            {sb.key_negative_factors.map((f, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-zinc-300">
                <span className="text-rose-400 mt-0.5 shrink-0 font-bold">−</span>
                {f}
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}

/* ============================================================
   EXPERIENCE ANALYSIS TAB (Part 1 & Part 5 YOE Intelligence)
   ============================================================ */
function ExperienceAnalysisTab({ analysis }: { analysis: AnalysisResponse }) {
  const exp = analysis.experience_evaluation;
  const reqYrs = exp?.jd_required_years ?? (analysis.years_experience_required ?? 0);
  const totalMos = exp?.total_experience_months;
  const relMos = exp?.relevant_experience_months;
  const internMos = exp?.internship_months ?? 0;
  const gapMos = exp?.experience_gap_months;
  const status = exp?.experience_status ?? 'not_available';

  const statusMap: Record<string, { label: string; variant: 'success' | 'warning' | 'danger' | 'info' | 'neutral' }> = {
    meets_requirement: { label: 'Meets Documented Requirement', variant: 'success' },
    partially_meets_requirement: { label: 'Partially Meets (Specific Tech Gap)', variant: 'warning' },
    does_not_meet_requirement: { label: 'Does Not Meet Stated Requirement', variant: 'danger' },
    not_available: { label: 'Work Experience Not Stated in Resume', variant: 'neutral' },
    unable_to_verify: { label: 'Unable to Verify Employment Dates', variant: 'warning' },
  };

  const statusConfig = statusMap[status] || { label: status, variant: 'neutral' };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Banner / Assessment */}
      <div className="p-5 rounded-xl bg-zinc-900 border border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider font-mono">Seniority Evaluation</span>
            <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
            {exp?.is_excluded_from_scoring && (
              <Badge variant="info">Score Weight Proportionally Redistributed</Badge>
            )}
          </div>
          <p className="text-sm font-semibold text-zinc-100">
            {analysis.experience_assessment || 'Professional experience evaluated against position requirements.'}
          </p>
        </div>
        {gapMos != null && gapMos > 0 ? (
          <div className="text-left sm:text-right shrink-0">
            <span className="text-xs text-rose-400 font-semibold block">Experience Shortfall</span>
            <span className="text-base font-bold text-rose-400">{gapMos} Months Delta</span>
          </div>
        ) : (
          <div className="text-left sm:text-right shrink-0">
            <span className="text-xs text-emerald-400 font-semibold block">Requirement Delta</span>
            <span className="text-sm font-bold text-emerald-400">Zero Gap</span>
          </div>
        )}
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4 text-center border-zinc-800">
          <span className="text-xs text-zinc-500 font-mono block mb-1">Target JD Requirement</span>
          <span className="text-2xl font-bold text-zinc-100">
            {reqYrs === 0 ? 'Fresher (0 yrs)' : `${reqYrs} yrs`}
          </span>
          <span className="text-[11px] text-zinc-500 block mt-1">
            {exp?.jd_experience_type === 'technology_specific' && exp.jd_required_technology
              ? `Specific to ${exp.jd_required_technology}`
              : 'General software experience'}
          </span>
        </Card>

        <Card className="p-4 text-center border-zinc-800">
          <span className="text-xs text-zinc-500 font-mono block mb-1">Total Documented</span>
          <span className="text-2xl font-bold text-zinc-100">
            {totalMos != null ? `${(totalMos / 12).toFixed(1)} yrs` : 'Not Available'}
          </span>
          <span className="text-[11px] text-zinc-500 block mt-1">
            {totalMos != null ? `${totalMos} months merged` : 'Excluded without penalty'}
          </span>
        </Card>

        <Card className="p-4 text-center border-zinc-800">
          <span className="text-xs text-zinc-500 font-mono block mb-1">Target Tech Relevant</span>
          <span className="text-2xl font-bold text-indigo-400">
            {relMos != null ? `${(relMos / 12).toFixed(1)} yrs` : '—'}
          </span>
          <span className="text-[11px] text-zinc-500 block mt-1">
            {relMos != null ? `${relMos} months matching` : 'No tech filter required'}
          </span>
        </Card>

        <Card className="p-4 text-center border-zinc-800">
          <span className="text-xs text-zinc-500 font-mono block mb-1">Internship Duration</span>
          <span className="text-2xl font-bold text-amber-400">
            {internMos > 0 ? `${internMos} mos` : '0 mos'}
          </span>
          <span className="text-[11px] text-zinc-500 block mt-1">
            Tracked separately
          </span>
        </Card>
      </div>

      {/* Warnings Callout if any */}
      {exp?.warnings && exp.warnings.length > 0 && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs space-y-1">
          <div className="font-semibold flex items-center gap-1.5 mb-1 text-amber-400">
            <AlertTriangle size={14} /> Attention Needed:
          </div>
          {exp.warnings.map((w, i) => (
            <p key={i}>• {w}</p>
          ))}
        </div>
      )}

      {/* Calculation Methodology Callout */}
      <Card className="p-5 border-zinc-800 bg-zinc-900/40">
        <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider font-mono mb-2 flex items-center gap-2">
          <ShieldCheck size={14} className="text-indigo-400" />
          Deterministic Calculation Methodology
        </h4>
        <p className="text-xs text-zinc-300 leading-relaxed">
          {exp?.calculation_methodology || 'Professional experience calculated exclusively from designated Work Experience section. Overlapping intervals merged deterministically without double counting. Education and projects strictly excluded from professional employment duration.'}
        </p>
      </Card>

      {/* Employment History Timeline */}
      <div>
        <h3 className="text-sm font-semibold text-zinc-200 mb-4 flex items-center gap-2">
          <Briefcase size={15} /> Documented Employment Records ({exp?.employment_history?.length || 0})
        </h3>
        {(!exp?.employment_history || exp.employment_history.length === 0) ? (
          <Card className="p-8 text-center border-dashed border-zinc-800">
            <AlertCircle size={28} className="mx-auto text-zinc-600 mb-2" />
            <p className="text-sm font-semibold text-zinc-300">No Professional Experience Section Detected</p>
            <p className="text-xs text-zinc-500 mt-1 max-w-md mx-auto">
              This candidate's resume contains no dedicated Work Experience section. Under deterministic evaluation rules, this dimension was safely excluded and its weight redistributed to skills and projects without penalizing the candidate.
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {exp.employment_history.map((job, i) => (
              <Card key={i} className="p-5 border-zinc-800 hover:border-zinc-700 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                  <div>
                    <h4 className="font-semibold text-zinc-100 text-base">{job.job_title}</h4>
                    <p className="text-xs text-zinc-400 font-medium">{job.company}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 self-start sm:self-center">
                    <Badge variant={job.employment_type === 'Internship' ? 'warning' : 'neutral'} size="xs">
                      {job.employment_type}
                    </Badge>
                    <Badge variant="info" size="xs">
                      {job.start_date || 'Unknown'} → {job.is_current ? 'Present' : (job.end_date || 'Unknown')}
                    </Badge>
                    {job.duration_months != null && (
                      <span className="text-xs font-mono font-bold text-zinc-300 bg-zinc-800 px-2 py-0.5 rounded">
                        {job.duration_months} mos
                      </span>
                    )}
                  </div>
                </div>

                {job.relevant_technologies.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 mb-3">
                    <span className="text-[11px] text-zinc-500 font-mono">Technologies:</span>
                    {job.relevant_technologies.map(t => (
                      <Badge key={t} variant="neutral" size="xs">{t}</Badge>
                    ))}
                  </div>
                )}

                {job.responsibilities.length > 0 && (
                  <ul className="space-y-1.5 border-t border-zinc-800/80 pt-3">
                    {job.responsibilities.map((r, ri) => (
                      <li key={ri} className="text-xs text-zinc-300 flex items-start gap-2">
                        <span className="text-zinc-500 shrink-0 mt-0.5">•</span>
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ============================================================
   SKILL MATCH TAB
   ============================================================ */
function SkillMatchTab({ analysis }: { analysis: AnalysisResponse }) {
  const [filter, setFilter] = useState('all');

  const filtered = analysis.requirements_matrix.filter(item => {
    if (filter === 'all') return true;
    if (filter === 'supported') return item.status === 'Supported' || item.status === 'Project-derived';
    if (filter === 'partial') return item.status === 'Partial' || item.status === 'Transferable';
    if (filter === 'missing') return item.status === 'Not evidenced';
    if (filter === 'mandatory') return item.importance === 'Mandatory';
    return true;
  });

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-zinc-100 text-sm">
          Requirements Matrix
          <span className="text-zinc-500 font-normal ml-2">({analysis.requirements_matrix.length} requirements)</span>
        </h3>
        <div className="flex gap-1.5">
          {[
            { value: 'all', label: 'All' },
            { value: 'supported', label: 'Matched' },
            { value: 'partial', label: 'Partial' },
            { value: 'missing', label: 'Missing' },
            { value: 'mandatory', label: 'Mandatory' },
          ].map(f => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filter === f.value
                  ? 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30'
                  : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/60'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[700px]">
            <thead className="bg-zinc-800/40 border-b border-zinc-700/40">
              <tr>
                <th className="text-left py-3 px-5 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Requirement</th>
                <th className="text-left py-3 px-5 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Category</th>
                <th className="text-left py-3 px-5 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Importance</th>
                <th className="text-left py-3 px-5 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Status</th>
                <th className="text-left py-3 px-5 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Confidence</th>
                <th className="text-right py-3 px-5 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/40">
              {filtered.map((item, i) => (
                <tr key={i} className="hover:bg-zinc-800/20 transition-colors">
                  <td className="py-3.5 px-5">
                    <span className="text-zinc-100 font-medium text-sm">{item.requirement_name}</span>
                    {item.supporting_excerpt && (
                      <p className="text-xs text-zinc-600 mt-0.5 max-w-xs truncate" title={item.supporting_excerpt}>
                        "{item.supporting_excerpt}"
                      </p>
                    )}
                  </td>
                  <td className="py-3.5 px-5 text-xs text-zinc-400">{item.category}</td>
                  <td className="py-3.5 px-5">
                    <Badge variant={item.importance === 'Mandatory' ? 'danger' : 'neutral'} size="xs">
                      {item.importance}
                    </Badge>
                  </td>
                  <td className="py-3.5 px-5"><StatusBadge status={item.status} /></td>
                  <td className="py-3.5 px-5"><ConfidenceBadge confidence={item.confidence} /></td>
                  <td className="py-3.5 px-5 text-right">
                    <span className="text-indigo-400 font-bold tabular-nums">{item.score_contribution.toFixed(2)}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="py-10 text-center text-sm text-zinc-500">No requirements match this filter.</div>
        )}
      </Card>
    </div>
  );
}

/* ============================================================
   PROJECTS TAB
   ============================================================ */
function ProjectsTab({ analysis }: { analysis: AnalysisResponse }) {
  const [expanded, setExpanded] = useState<number | null>(0);

  if (analysis.project_analyses.length === 0) {
    return <EmptyState icon={<FolderOpen size={28} />} title="No projects analyzed" description="No projects were found in the resume." />;
  }

  return (
    <div className="space-y-4 animate-fade-in">
      {analysis.project_analyses.map((p, i) => (
        <Card key={i} className="overflow-hidden">
          <button
            onClick={() => setExpanded(expanded === i ? null : i)}
            className="w-full p-5 flex items-center justify-between text-left hover:bg-zinc-800/20 transition-colors"
          >
            <div className="flex items-center gap-4 min-w-0">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex flex-col items-center justify-center shrink-0">
                <span className="text-lg font-extrabold text-amber-400 leading-none">{p.jd_relevance_score.toFixed(0)}</span>
                <span className="text-[9px] text-amber-600">/10</span>
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-zinc-100 text-sm">{p.project_name}</h3>
                <p className="text-xs text-zinc-500 mt-0.5">{p.purpose_domain}</p>
                <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                  {p.technologies_mentioned.slice(0, 5).map(t => (
                    <Badge key={t} variant="info" size="xs">{t}</Badge>
                  ))}
                  {p.technologies_mentioned.length > 5 && (
                    <span className="text-xs text-zinc-600">+{p.technologies_mentioned.length - 5}</span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0 ml-3">
              <div className="hidden sm:block">
                <Badge
                  variant={p.production_readiness === 'High' ? 'success' : p.production_readiness === 'Medium' ? 'warning' : 'danger'}
                  size="xs"
                >
                  {p.production_readiness} readiness
                </Badge>
              </div>
              {expanded === i ? <ChevronUp size={16} className="text-zinc-400" /> : <ChevronDown size={16} className="text-zinc-400" />}
            </div>
          </button>

          {expanded === i && (
            <div className="px-5 pb-5 space-y-4 border-t border-zinc-800/60 pt-5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-zinc-500 mb-2 font-medium">JD Relevance</p>
                  <ProgressBar value={p.jd_relevance_score} max={10} />
                </div>
                <div>
                  <p className="text-xs text-zinc-500 mb-2 font-medium">Ownership</p>
                  <Badge variant={p.ownership_clarity === 'High' ? 'success' : 'warning'}>{p.ownership_clarity}</Badge>
                </div>
                <div>
                  <p className="text-xs text-zinc-500 mb-2 font-medium">Transferability</p>
                  <Badge variant="neutral">{p.transferability}</Badge>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-zinc-800/30 rounded-xl p-4">
                  <p className="text-xs font-semibold text-zinc-400 mb-2">Problem Addressed</p>
                  <p className="text-sm text-zinc-300">{p.problem_addressed}</p>
                </div>
                <div className="bg-zinc-800/30 rounded-xl p-4">
                  <p className="text-xs font-semibold text-zinc-400 mb-2">Candidate Contribution</p>
                  <p className="text-sm text-zinc-300">{p.candidate_contribution}</p>
                </div>
              </div>

              {p.implementation_details && (
                <div className="bg-zinc-800/30 rounded-xl p-4">
                  <p className="text-xs font-semibold text-zinc-400 mb-2">Implementation Details</p>
                  <p className="text-sm text-zinc-300">{p.implementation_details}</p>
                </div>
              )}

              {p.technical_concepts.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-zinc-400 mb-2">Technical Concepts Demonstrated</p>
                  <div className="flex flex-wrap gap-2">
                    {p.technical_concepts.map(t => <Badge key={t} variant="neutral" size="xs">{t}</Badge>)}
                  </div>
                </div>
              )}

              {p.improvement_suggestions.length > 0 && (
                <div className="p-4 rounded-xl bg-indigo-500/8 border border-indigo-500/20">
                  <p className="text-xs font-semibold text-indigo-400 mb-2.5 flex items-center gap-1.5">
                    <Wrench size={12} /> Improvement Suggestions
                  </p>
                  <ul className="space-y-2">
                    {p.improvement_suggestions.map((s, j) => (
                      <li key={j} className="text-sm text-zinc-300 flex items-start gap-2">
                        <span className="text-indigo-400 shrink-0 font-medium">→</span>{s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {p.supporting_excerpts.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-zinc-400 mb-2.5">Resume Excerpts</p>
                  <div className="space-y-2">
                    {p.supporting_excerpts.map((ex, j) => (
                      <blockquote key={j} className="border-l-2 border-indigo-500/40 pl-3 text-sm text-zinc-400 italic">
                        "{ex}"
                      </blockquote>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}

/* ============================================================
   INTERVIEW TAB
   ============================================================ */
function InterviewTab({ analysis }: { analysis: AnalysisResponse }) {
  return (
    <div className="space-y-4 animate-fade-in">
      <Alert variant="info" icon={<HelpCircle size={15} />}>
        Questions generated based on resume evidence, JD requirements, and detected gaps. Each includes rationale and evaluation criteria.
      </Alert>

      {analysis.interview_questions.map((q, i) => (
        <Card key={i} className="p-5">
          <div className="flex items-start gap-3">
            <span className="w-7 h-7 rounded-xl bg-violet-500/15 border border-violet-500/20 text-violet-400 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
              Q{i + 1}
            </span>
            <div className="space-y-3 flex-1">
              <p className="text-zinc-100 font-semibold text-sm leading-relaxed">{q.question}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-zinc-800/30">
                  <p className="text-xs text-zinc-500 mb-1">Related Requirement</p>
                  <p className="text-sm text-zinc-300">{q.related_jd_requirement}</p>
                </div>
                <div className="p-3 rounded-xl bg-zinc-800/30">
                  <p className="text-xs text-zinc-500 mb-1">Why this question</p>
                  <p className="text-sm text-zinc-300">{q.purpose_reason}</p>
                </div>
              </div>
              {q.resume_evidence && (
                <div className="p-3 rounded-xl bg-indigo-500/6 border border-indigo-500/15">
                  <p className="text-xs text-indigo-400 mb-1">Resume evidence that prompted this</p>
                  <p className="text-sm text-zinc-400 italic">"{q.resume_evidence}"</p>
                </div>
              )}
              {q.evaluation_criteria && (
                <div className="p-3 rounded-xl bg-emerald-500/6 border border-emerald-500/15">
                  <p className="text-xs text-emerald-400 mb-1">Evaluation criteria (HR use)</p>
                  <p className="text-sm text-zinc-300">{q.evaluation_criteria}</p>
                </div>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

/* ============================================================
   EVIDENCE EXPLORER TAB (Part 5 Interactive Excerpt Inspector)
   ============================================================ */
function EvidenceExplorerTab({ analysis }: { analysis: AnalysisResponse }) {
  const [selectedItem, setSelectedItem] = useState<any>(analysis.requirements_matrix[0] || null);
  const [filter, setFilter] = useState('all');

  const items = analysis.requirements_matrix.filter(m => {
    if (filter === 'all') return true;
    if (filter === 'supported') return m.status === 'Supported';
    if (filter === 'project') return m.status === 'Project-derived';
    if (filter === 'transferable') return m.status === 'Transferable';
    if (filter === 'missing') return m.status === 'Not evidenced';
    return true;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <Alert variant="info" icon={<Search size={15} />}>
        Click on any evaluated requirement below to inspect the verified supporting resume excerpt, the origin section, and confidence rationale.
      </Alert>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        {[
          { id: 'all', label: `All (${analysis.requirements_matrix.length})` },
          { id: 'supported', label: 'Direct Matches' },
          { id: 'project', label: 'Project-Derived' },
          { id: 'transferable', label: 'Transferable' },
          { id: 'missing', label: 'Not Evidenced' },
        ].map(f => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              filter === f.id
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                : 'text-zinc-400 hover:text-white bg-zinc-900 border border-zinc-800'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Requirements List */}
        <div className="lg:col-span-5 space-y-2 max-h-[600px] overflow-y-auto pr-1">
          {items.map((item, i) => (
            <div
              key={i}
              onClick={() => setSelectedItem(item)}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                selectedItem?.requirement_name === item.requirement_name
                  ? 'bg-zinc-850 border-indigo-500 shadow-md'
                  : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-850/50'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <span className="font-semibold text-xs text-zinc-100">{item.requirement_name}</span>
                <StatusBadge status={item.status} />
              </div>
              <div className="flex items-center justify-between text-[11px] text-zinc-500">
                <span>{item.category}</span>
                <span className="font-mono">{item.confidence} Conf.</span>
              </div>
            </div>
          ))}
        </div>

        {/* Right Column: Deep Evidence Inspection Card */}
        <div className="lg:col-span-7">
          {selectedItem ? (
            <Card className="p-6 border-zinc-800 bg-zinc-900/40 space-y-5 sticky top-6">
              <div className="flex items-start justify-between gap-4 border-b border-zinc-800 pb-4">
                <div>
                  <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider">JD Requirement</span>
                  <h3 className="text-lg font-bold text-zinc-100">{selectedItem.requirement_name}</h3>
                  <p className="text-xs text-zinc-400 mt-0.5">Category: {selectedItem.category} · Priority: {selectedItem.importance}</p>
                </div>
                <div className="text-right">
                  <StatusBadge status={selectedItem.status} />
                  <p className="text-[11px] text-zinc-500 mt-1 font-mono">Score: +{selectedItem.score_contribution.toFixed(2)}</p>
                </div>
              </div>

              {/* Source Section & Excerpt */}
              <div>
                <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider font-mono block mb-2">
                  Verified Source Evidence ({selectedItem.source_section || 'Resume Profile'})
                </span>
                {selectedItem.supporting_excerpt ? (
                  <blockquote className="p-4 rounded-xl bg-zinc-850/80 border-l-4 border-indigo-500 text-xs sm:text-sm text-zinc-200 italic leading-relaxed">
                    "{selectedItem.supporting_excerpt}"
                  </blockquote>
                ) : (
                  <div className="p-4 rounded-xl bg-zinc-850/40 border border-dashed border-zinc-800 text-xs text-zinc-500 italic">
                    No explicit textual excerpt was identified in the resume for this requirement.
                  </div>
                )}
              </div>

              {/* Classification & Evaluation Logic */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-zinc-850/50 border border-zinc-800">
                  <span className="text-zinc-500 block mb-0.5">Direct Proof</span>
                  <span className="text-zinc-200 font-medium">{selectedItem.direct_evidence}</span>
                </div>
                <div className="p-3 rounded-lg bg-zinc-850/50 border border-zinc-800">
                  <span className="text-zinc-500 block mb-0.5">Project Proof</span>
                  <span className="text-zinc-200 font-medium">{selectedItem.project_evidence}</span>
                </div>
              </div>
            </Card>
          ) : (
            <Card className="p-12 text-center text-zinc-500 text-sm">
              Select a requirement on the left to inspect verbatim resume evidence.
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   RESUME IMPROVEMENT CENTER TAB (Part 3 Dedicated Candidate Feature)
   ============================================================ */
function ResumeImprovementCenterTab({ analysis }: { analysis: AnalysisResponse }) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const imp = analysis.resume_improvements;

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="p-5 rounded-xl bg-zinc-900 border border-zinc-800">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Sparkles size={16} className="text-amber-400" />
          Resume Improvement Center
        </h3>
        <p className="text-xs text-zinc-400 mt-1 max-w-2xl leading-relaxed">
          Evidence-grounded optimizations designed to help you build an ATS-friendly, job-ready resume without fabricating qualifications or experience.
        </p>
      </div>

      {/* 1. Demonstrated But Unlisted Skills */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold text-zinc-200 flex items-center gap-2">
            <CheckCircle2 size={15} className="text-emerald-400" />
            1. Demonstrated Skills Missing from Skills Section
          </h4>
          <Badge variant="success" size="xs">
            {imp?.demonstrated_unlisted_skills?.length || 0} Found
          </Badge>
        </div>
        {(!imp?.demonstrated_unlisted_skills || imp.demonstrated_unlisted_skills.length === 0) ? (
          <Card className="p-5 text-center text-xs text-zinc-500">
            All skills demonstrated in projects and work experience are already present in your skills list.
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {imp.demonstrated_unlisted_skills.map((s, i) => (
              <Card key={i} className="p-4 border-zinc-800 bg-zinc-900/50">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-sm text-emerald-400">{s.skill}</span>
                  <div className="flex items-center gap-1.5">
                    <Badge variant="neutral" size="xs">{s.found_in_project}</Badge>
                    <button
                      type="button"
                      onClick={() => handleCopy(s.skill, i)}
                      className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
                      title="Copy skill name"
                    >
                      {copiedIndex === i ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                    </button>
                  </div>
                </div>
                <p className="text-xs text-zinc-400">{s.recommendation}</p>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* 2. Unquantified Bullets with Copyable Rewrites */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold text-zinc-200 flex items-center gap-2">
            <TrendingUp size={15} className="text-indigo-400" />
            2. Measurable Achievements & Quantification Improvements
          </h4>
        </div>
        {(!imp?.unquantified_bullets || imp.unquantified_bullets.length === 0) ? (
          <Card className="p-5 text-center text-xs text-zinc-500">
            Your bullet points contain strong quantifiable metrics.
          </Card>
        ) : (
          <div className="space-y-4">
            {imp.unquantified_bullets.map((b, i) => (
              <Card key={i} className="p-4 border-zinc-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-zinc-300">{b.role_or_project} ({b.section})</span>
                  <Badge variant="warning" size="xs">Lacks Metrics</Badge>
                </div>
                <p className="text-xs text-zinc-400 italic bg-zinc-850 p-2.5 rounded-lg border border-zinc-800">
                  "{b.original_bullet}"
                </p>
                <div className="p-3 rounded-lg bg-indigo-500/8 border border-indigo-500/20 text-xs text-zinc-200">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-indigo-400">Recommended Metric Addition:</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(b.quantification_advice, 100 + i)}
                      className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-300 transition-colors"
                      title="Copy rewrite advice"
                    >
                      {copiedIndex === 100 + i ? (
                        <>
                          <Check size={11} className="text-emerald-400" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy size={11} />
                          <span>Copy Advice</span>
                        </>
                      )}
                    </button>
                  </div>
                  <p>{b.quantification_advice}</p>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* 3. Project Details Needing Better Explanation */}
      <div>
        <h4 className="text-sm font-semibold text-zinc-200 mb-3 flex items-center gap-2">
          <FolderOpen size={15} className="text-amber-400" />
          3. Project Technical Depth & Architecture Improvements
        </h4>
        {(!imp?.project_detail_improvements || imp.project_detail_improvements.length === 0) ? (
          <Card className="p-5 text-center text-xs text-zinc-500">
            Project descriptions provide sufficient technical depth and context.
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {imp.project_detail_improvements.map((p, i) => (
              <Card key={i} className="p-4 border-zinc-800">
                <h5 className="font-semibold text-xs text-zinc-100 mb-1">{p.project_name}</h5>
                <p className="text-xs text-amber-400 mb-1.5 font-medium">{p.weakness}</p>
                <p className="text-xs text-zinc-400">{p.suggested_addition}</p>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* 4. Supported Keywords & Genuine Gaps */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Card className="p-5 border-zinc-800">
          <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider font-mono mb-3">
            4. Supported JD Terminology to Include
          </h4>
          <p className="text-xs text-zinc-500 mb-3">
            Your technical ecosystem supports these keywords from the JD. Add them to enhance ATS alignment.
          </p>
          <div className="flex flex-wrap gap-1.5">
            {imp?.missing_supported_keywords?.map(k => (
              <Badge key={k} variant="info" size="xs">{k}</Badge>
            ))}
          </div>
        </Card>

        <Card className="p-5 border-zinc-800">
          <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider font-mono mb-3">
            5. Genuine Skill Gaps (Mandatory)
          </h4>
          <p className="text-xs text-zinc-500 mb-3">
            Skills requiring dedicated learning or a targeted portfolio mini-project before applying.
          </p>
          <div className="flex flex-wrap gap-1.5">
            {imp?.genuine_skill_gaps?.map(k => (
              <Badge key={k} variant="danger" size="xs">{k}</Badge>
            ))}
          </div>
        </Card>
      </div>

      {/* 6. Date Ambiguities */}
      {imp?.date_ambiguities && imp.date_ambiguities.length > 0 && (
        <Card className="p-5 border-amber-500/20 bg-amber-500/5">
          <h4 className="text-xs font-semibold text-amber-400 uppercase tracking-wider font-mono mb-2 flex items-center gap-2">
            <AlertTriangle size={14} /> 6. Date Ambiguity & Work Experience Warnings
          </h4>
          <ul className="space-y-1.5 text-xs text-zinc-300">
            {imp.date_ambiguities.map((d, i) => (
              <li key={i}>
                • <strong className="text-amber-300">{d.issue}</strong> — {d.recommendation}
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* 7. Strategic Action Plan */}
      {analysis.recommendations?.prioritized_action_plan && analysis.recommendations.prioritized_action_plan.length > 0 && (
        <Card className="p-5 border-zinc-800">
          <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider font-mono mb-3 flex items-center gap-2">
            <Target size={14} className="text-indigo-400" />
            7. Strategic Action Plan
          </h4>
          <ol className="space-y-2.5">
            {analysis.recommendations.prioritized_action_plan.map((action, i) => (
              <li key={i} className="flex items-start gap-2.5 text-xs text-zinc-300">
                <span className="w-5 h-5 rounded-md bg-indigo-500/15 text-indigo-400 text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <span className="leading-relaxed">{action}</span>
              </li>
            ))}
          </ol>
        </Card>
      )}

      {/* 8. Optional Learning Exercises */}
      {analysis.recommendations?.optional_learning_exercises && analysis.recommendations.optional_learning_exercises.length > 0 && (
        <Card className="p-5 border-zinc-800">
          <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider font-mono mb-3 flex items-center gap-2">
            <BookOpen size={14} className="text-violet-400" />
            8. Recommended Learning Roadmap
          </h4>
          <ul className="space-y-2">
            {analysis.recommendations.optional_learning_exercises.map((e, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-zinc-300">
                <span className="text-violet-400 shrink-0">→</span>
                <span>{e}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}

/* ============================================================
   AT A GLANCE SUMMARY COMPONENT (Executive / High-Signal)
   ============================================================ */
function AtAGlanceSummary({
  analysis,
  onOpenOptimizer,
  onSwitchToDetailed,
}: {
  analysis: AnalysisResponse;
  onOpenOptimizer: () => void;
  onSwitchToDetailed: () => void;
}) {
  const intel = analysis.company_intel;
  const sb = analysis.score_breakdown;
  const roleLevel = analysis.role_level || 'Fresher / Early-Career';

  // Detect engineering clusters from findings
  const allFindingNames = [
    ...analysis.direct_findings.map(f => f.requirement_name.toLowerCase()),
    ...analysis.indirect_findings.map(f => f.requirement_name.toLowerCase()),
    ...analysis.indirect_findings.map(f => f.related_technology_or_activity.toLowerCase())
  ].join(' ');

  const hasFrontend = ['html', 'css', 'javascript', 'react', 'frontend', 'ui', 'vue'].some(t => allFindingNames.includes(t));
  const hasBackend = ['python', 'node', 'django', 'fastapi', 'backend', 'sql', 'postgres', 'api'].some(t => allFindingNames.includes(t));
  const hasAI = ['ai', 'machine learning', 'neural', 'scikit', 'pytorch', 'model'].some(t => allFindingNames.includes(t));

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Banner: Real HR Mindset Takeaway */}
      <Card className="p-6 border-zinc-800 bg-zinc-900/40">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex items-start gap-5">
            <ScoreRing score={analysis.overall_score} size={110} strokeWidth={9} />
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <ScoreInterpretationBadge score={analysis.overall_score} />
                <Badge variant="neutral" size="xs">
                  Role Calibrated: {roleLevel}
                </Badge>
              </div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                {sb.score_interpretation}
              </h2>
              <p className="text-xs text-zinc-400 max-w-xl leading-relaxed">
                Evaluated with real HR hiring logic for <span className="text-zinc-200 font-medium">{analysis.job_title}</span>.
                Candidate demonstrates practical capability across <span className="text-emerald-400 font-semibold">{analysis.direct_findings.length + analysis.indirect_findings.length} verified competencies</span>.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2.5 w-full lg:w-auto shrink-0">
            <Button
              onClick={onOpenOptimizer}
              icon={<Sparkles size={14} className="text-amber-400" />}
              className="text-xs px-3.5 py-2"
            >
              Optimize Resume for this JD
            </Button>
            <Button
              variant="secondary"
              onClick={onSwitchToDetailed}
              icon={<Search size={14} />}
              className="text-xs px-3.5 py-2"
            >
              Full Technical Deep-Dive
            </Button>
          </div>
        </div>

        {/* Competency Clusters recognized */}
        <div className="mt-5 pt-4 border-t border-zinc-800/80 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-zinc-500 font-mono text-[11px] uppercase tracking-wider mr-1">Recognized Clusters:</span>
          {hasFrontend && (
            <Badge variant="success" size="xs">
              Frontend Engineering Verified
            </Badge>
          )}
          {hasBackend && (
            <Badge variant="info" size="xs">
              Backend Engineering Verified
            </Badge>
          )}
          {hasAI && (
            <Badge variant="warning" size="xs">
              Applied AI Engineering Demonstrated
            </Badge>
          )}
          {analysis.project_analyses.length > 0 && (
            <Badge variant="neutral" size="xs">
              {analysis.project_analyses.length} Hands-on Projects Evaluated
            </Badge>
          )}
        </div>
      </Card>

      {/* Experience Intelligence Summary Card (Part 1 Deterministic YOE) */}
      <Card className="p-6 border-zinc-800 bg-zinc-900/40">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4 pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-zinc-850 border border-zinc-800 flex items-center justify-center text-indigo-400">
              <Clock size={16} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">
                Professional Experience & Seniority Assessment
              </h3>
              <p className="text-[11px] text-zinc-500">
                Calculated exclusively from Work Experience section (no education/project inflation)
              </p>
            </div>
          </div>
          <Badge
            variant={
              analysis.experience_evaluation?.experience_status === 'meets_requirement' ? 'success' :
              analysis.experience_evaluation?.experience_status === 'partially_meets_requirement' ? 'warning' :
              analysis.experience_evaluation?.experience_status === 'not_available' ? 'info' : 'danger'
            }
          >
            {analysis.experience_evaluation?.experience_status === 'meets_requirement' ? 'Meets Requirement' :
             analysis.experience_evaluation?.experience_status === 'partially_meets_requirement' ? 'Partially Meets' :
             analysis.experience_evaluation?.experience_status === 'not_available' ? 'Not Stated in Resume' : 'Does Not Meet'}
          </Badge>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs mb-4">
          <div className="p-3 rounded-lg bg-zinc-850/60 border border-zinc-800">
            <span className="text-zinc-500 block mb-0.5">Required YOE</span>
            <span className="text-zinc-100 font-bold text-sm">
              {(analysis.experience_evaluation?.jd_required_years ?? analysis.years_experience_required ?? 0) === 0 ? 'Fresher (0 yrs)' : `${analysis.experience_evaluation?.jd_required_years ?? analysis.years_experience_required} yrs`}
            </span>
          </div>
          <div className="p-3 rounded-lg bg-zinc-850/60 border border-zinc-800">
            <span className="text-zinc-500 block mb-0.5">Total Documented</span>
            <span className="text-zinc-100 font-bold text-sm">
              {analysis.experience_evaluation?.total_experience_months != null
                ? `${(analysis.experience_evaluation.total_experience_months / 12).toFixed(1)} yrs (${analysis.experience_evaluation.total_experience_months} mos)`
                : 'Not Available'}
            </span>
          </div>
          <div className="p-3 rounded-lg bg-zinc-850/60 border border-zinc-800">
            <span className="text-zinc-500 block mb-0.5">Target Tech Relevant</span>
            <span className="text-indigo-400 font-bold text-sm">
              {analysis.experience_evaluation?.relevant_experience_months != null
                ? `${(analysis.experience_evaluation.relevant_experience_months / 12).toFixed(1)} yrs`
                : '—'}
            </span>
          </div>
          <div className="p-3 rounded-lg bg-zinc-850/60 border border-zinc-800">
            <span className="text-zinc-500 block mb-0.5">Internship Months</span>
            <span className="text-amber-400 font-bold text-sm">
              {analysis.experience_evaluation?.internship_months ? `${analysis.experience_evaluation.internship_months} mos` : '0 mos'}
            </span>
          </div>
        </div>

        {analysis.creative_summary && (
          <div className="p-3 rounded-lg bg-indigo-500/8 border border-indigo-500/20 text-xs text-indigo-300 italic flex items-start gap-2">
            <Sparkles size={14} className="text-indigo-400 shrink-0 mt-0.5" />
            <span>{analysis.creative_summary}</span>
          </div>
        )}
      </Card>

      {/* Company & Hiring Culture Briefing (if company specified) */}
      {intel && (
        <Card className="p-6 border-zinc-800 bg-zinc-900/30">
          <div className="flex items-center justify-between gap-4 mb-4 pb-3 border-b border-zinc-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-zinc-850 border border-zinc-800 flex items-center justify-center text-zinc-300">
                <Building2 size={16} />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">
                  {intel.company_name} — Culture & Hiring Intelligence
                </h3>
                <p className="text-[11px] text-zinc-500">Aggregated from employee reviews, Glassdoor, and technical interview reports</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-mono font-medium">
              <Star size={13} className="fill-amber-400 text-amber-400" />
              <span>{intel.work_culture_rating.toFixed(1)} / 5.0 Culture Rating</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Culture & Interview Style */}
            <div className="p-4 rounded-lg bg-zinc-900/60 border border-zinc-800/80 space-y-3">
              <div>
                <div className="text-[11px] text-zinc-400 font-medium uppercase tracking-wider mb-1">Work Culture</div>
                <p className="text-zinc-300 leading-relaxed">{intel.culture_summary}</p>
              </div>
              <div>
                <div className="text-[11px] text-zinc-400 font-medium uppercase tracking-wider mb-1">Hiring & Interview Format</div>
                <p className="text-zinc-300 leading-relaxed">{intel.hiring_and_interview_style}</p>
              </div>
            </div>

            {/* Candidate Advice & Sentiments */}
            <div className="p-4 rounded-lg bg-zinc-900/60 border border-zinc-800/80 space-y-3">
              <div>
                <div className="text-[11px] text-emerald-400 font-medium uppercase tracking-wider mb-1.5">What Hiring Managers Look For</div>
                <ul className="space-y-1.5">
                  {intel.candidate_tips.map((tip, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-zinc-300 leading-relaxed">
                      <CheckCircle2 size={13} className="text-emerald-400 mt-0.5 shrink-0" />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
              {intel.cautionary_notes.length > 0 && (
                <div className="pt-2 border-t border-zinc-800">
                  <div className="text-[11px] text-amber-400 font-medium uppercase tracking-wider mb-1">Community Note</div>
                  <p className="text-zinc-400">{intel.cautionary_notes.join(' · ')}</p>
                </div>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* 2-Column Summary: Verified Strengths vs Areas to Address */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Strengths Card */}
        <Card className="p-6 border-zinc-800 bg-zinc-900/30">
          <div className="flex items-center gap-2 mb-4 text-emerald-400">
            <CheckCircle2 size={16} />
            <h3 className="text-sm font-semibold text-zinc-100">Confirmed Strengths & Matches</h3>
          </div>
          <ul className="space-y-2.5 text-xs text-zinc-300">
            {sb.key_positive_factors.map((pos, i) => (
              <li key={i} className="flex items-start gap-2 leading-relaxed">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                <span>{pos}</span>
              </li>
            ))}
            {analysis.direct_findings.slice(0, 4).map((f, i) => (
              <li key={`df-${i}`} className="flex items-start gap-2 leading-relaxed text-zinc-400">
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-600 mt-1.5 shrink-0" />
                <span>
                  <strong className="text-zinc-200">{f.requirement_name}</strong>: {f.relevance_explanation}
                </span>
              </li>
            ))}
          </ul>
        </Card>

        {/* Missing Requirements Card */}
        <Card className="p-6 border-zinc-800 bg-zinc-900/30">
          <div className="flex items-center gap-2 mb-4 text-amber-400">
            <AlertCircle size={16} />
            <h3 className="text-sm font-semibold text-zinc-100">Areas to Strengthen for this Role</h3>
          </div>
          {analysis.missing_requirements.length > 0 ? (
            <div className="space-y-3">
              <p className="text-xs text-zinc-400 leading-relaxed">
                The following skills were not detected in either your technical inventory or demonstrated projects:
              </p>
              <div className="flex flex-wrap gap-2">
                {analysis.missing_requirements.map((req, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-md text-xs font-mono bg-zinc-900 border border-zinc-800 text-zinc-300"
                  >
                    {req}
                  </span>
                ))}
              </div>
              <div className="pt-3 border-t border-zinc-800 text-xs text-zinc-500">
                Tip: Click <strong>"Optimize Resume for this JD"</strong> above to see suggested bullet rewrites that highlight these capabilities.
              </div>
            </div>
          ) : (
            <p className="text-xs text-emerald-400 flex items-center gap-2">
              <CheckCircle2 size={14} /> All core role requirements are supported by your profile!
            </p>
          )}
        </Card>
      </div>

      {/* Switch to detailed view footer callout */}
      <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/50 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
        <div>
          <span className="font-semibold text-zinc-200">Need full technical granularity?</span>
          <p className="text-zinc-400 mt-0.5">Explore the complete requirement-by-requirement matrix, project architecture breakdowns, and tailored interview questions.</p>
        </div>
        <Button variant="secondary" size="sm" onClick={onSwitchToDetailed} iconRight={<ArrowRight size={13} />} className="shrink-0">
          Open Technical Breakdown
        </Button>
      </div>
    </div>
  );
}

/* ============================================================
   OPTIMIZE RESUME MODAL (Coming Soon)
   ============================================================ */
function OptimizeResumeModal({
  isOpen,
  onClose,
  jobTitle,
  companyName
}: {
  isOpen: boolean;
  onClose: () => void;
  jobTitle: string;
  companyName: string;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg rounded-2xl bg-zinc-900 border border-zinc-800 p-6 sm:p-7 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-500 hover:text-white p-1 rounded-lg hover:bg-zinc-800 transition-colors"
        >
          <X size={16} />
        </button>

        <div className="flex items-center gap-2 mb-3">
          <Badge variant="warning" size="xs">Coming Soon · Beta Preview</Badge>
          <span className="text-[11px] font-mono text-zinc-500">ATS Engine v1.2</span>
        </div>

        <h3 className="text-lg font-bold text-white mb-2">
          Automated Resume & ATS Optimizer
        </h3>
        <p className="text-xs text-zinc-400 leading-relaxed mb-5">
          Tailors your resume directly to <span className="text-zinc-200 font-medium">{jobTitle}</span> {companyName && <span>at <span className="text-zinc-200 font-medium">{companyName}</span></span>} to maximize interview callbacks without keyword stuffing.
        </p>

        <div className="space-y-3 mb-6">
          {[
            {
              title: 'Contextual Metric Rewrites',
              desc: 'Transforms project bullets to highlight quantifiable impact matching this specific role.'
            },
            {
              title: 'ATS Single-Column Format',
              desc: 'Generates cleanly formatted, parseable PDF/DOCX templates guaranteed for 99%+ ATS compliance.'
            },
            {
              title: 'Keyword Density Balancing',
              desc: 'Harmonizes phrasing (e.g. JavaScript vs React) to satisfy automated recruiter scanners.'
            }
          ].map((feature, i) => (
            <div key={i} className="p-3 rounded-xl bg-zinc-850/60 border border-zinc-800/80 flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                <Check size={12} />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-zinc-200">{feature.title}</h4>
                <p className="text-[11px] text-zinc-400 mt-0.5">{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
          <Button variant="secondary" size="sm" onClick={onClose}>
            Close
          </Button>
          <Button size="sm" onClick={onClose}>
            Got it, Notify Me!
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   MAIN PAGE
   ============================================================ */
export default function AnalysisDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [viewMode, setViewMode] = useState<'glance' | 'detailed'>('glance');
  const [showOptimizerModal, setShowOptimizerModal] = useState(false);

  useEffect(() => {
    if (!id) return;
    analysesApi.get(id)
      .then(setAnalysis)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    if (!analysis || !confirm('Delete this analysis permanently? This action cannot be undone.')) return;
    try {
      await analysesApi.delete(analysis.id);
      navigate('/analyses');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Delete failed.');
    }
  };

  const handleExportJson = () => {
    if (!analysis) return;
    const blob = new Blob([JSON.stringify(analysis, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Analysis_${analysis.candidate_name.replace(/[^a-zA-Z0-9]/g, '_')}_${analysis.job_title.replace(/[^a-zA-Z0-9]/g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="space-y-4 animate-fade-in">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-56" />
          <Skeleton className="h-12" />
          <Skeleton className="h-96" />
        </div>
      </AppLayout>
    );
  }

  if (error || !analysis) {
    return (
      <AppLayout>
        <Alert variant="danger" icon={<AlertCircle size={16} />}>
          {error || 'Analysis not found.'}
        </Alert>
        <Button variant="ghost" className="mt-4" onClick={() => navigate('/analyses')} icon={<ArrowLeft size={15} />}>
          Back to Analyses
        </Button>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      {/* Top Bar: Navigation, View Mode Switcher, and Export Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors group w-fit"
        >
          <ArrowLeft size={15} className="group-hover:-translate-x-0.5 transition-transform" />
          Back
        </button>

        {/* View Mode Switcher (Simple At a Glance vs Detailed) */}
        <div className="inline-flex p-1 bg-zinc-900 border border-zinc-800 rounded-lg text-xs font-medium self-start sm:self-center">
          <button
            onClick={() => setViewMode('glance')}
            className={`px-3.5 py-1.5 rounded-md transition-all ${
              viewMode === 'glance'
                ? 'bg-zinc-100 text-zinc-950 font-semibold shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            At a Glance
          </button>
          <button
            onClick={() => setViewMode('detailed')}
            className={`px-3.5 py-1.5 rounded-md transition-all ${
              viewMode === 'detailed'
                ? 'bg-zinc-100 text-zinc-950 font-semibold shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Detailed Technical Deep-Dive
          </button>
        </div>

        <div className="flex items-center gap-2 flex-wrap justify-end">
          <Button size="sm" variant="secondary" icon={<FileJson size={13} />} onClick={handleExportJson}>
            Export JSON
          </Button>
          <Button size="sm" variant="secondary" icon={<Printer size={13} />} onClick={() => window.print()}>
            Print
          </Button>
          <Button size="sm" variant="ghost" icon={<Plus size={13} />} onClick={() => navigate('/analyses/new')}>
            New Analysis
          </Button>
          <Button size="sm" variant="danger" icon={<Trash2 size={13} />} onClick={handleDelete}>
            Delete
          </Button>
        </div>
      </div>

      {/* Header card with candidate details and optimize action */}
      <Card className="p-6 mb-6 border-zinc-800 bg-zinc-900/40">
        <div className="flex flex-col sm:flex-row items-start justify-between gap-5">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-zinc-850 border border-zinc-800 flex items-center justify-center text-sm font-bold font-mono text-zinc-200 shrink-0">
              {analysis.candidate_name.charAt(0)}
            </div>
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">{analysis.candidate_name}</h1>
              <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
                Target Role: <span className="font-medium text-zinc-200">{analysis.job_title}</span>
                {analysis.company_name && <span className="text-zinc-500 font-normal"> at {analysis.company_name}</span>}
              </p>
              <div className="flex flex-wrap items-center gap-2 mt-2.5">
                <Badge variant="neutral" size="xs">
                  {analysis.role_level || 'Role Level: Standard'}
                </Badge>
                <Badge variant="neutral" size="xs">
                  {analysis.score_breakdown.analysis_confidence} Confidence
                </Badge>
                <Badge variant="neutral" size="xs">
                  {analysis.score_breakdown.evidence_coverage_percent.toFixed(0)}% Coverage
                </Badge>
              </div>
            </div>
          </div>

          <Button
            size="sm"
            onClick={() => setShowOptimizerModal(true)}
            icon={<Sparkles size={13} className="text-amber-400" />}
            className="text-xs shrink-0 self-start sm:self-center"
          >
            Optimize Resume for this JD (ATS)
          </Button>
        </div>
      </Card>

      {/* Conditional View: At-a-Glance vs Detailed Technical Tabs */}
      {viewMode === 'glance' ? (
        <AtAGlanceSummary
          analysis={analysis}
          onOpenOptimizer={() => setShowOptimizerModal(true)}
          onSwitchToDetailed={() => setViewMode('detailed')}
        />
      ) : (
        <div className="space-y-6 animate-fade-in">
          {/* Tabs */}
          <div className="mb-6">
            <Tabs
              tabs={TABS}
              activeTab={activeTab}
              onChange={setActiveTab}
            />
          </div>

          {/* Tab content */}
          <div>
            {activeTab === 'overview' && <OverviewTab analysis={analysis} />}
            {activeTab === 'experience' && <ExperienceAnalysisTab analysis={analysis} />}
            {activeTab === 'skills' && <SkillMatchTab analysis={analysis} />}
            {activeTab === 'projects' && <ProjectsTab analysis={analysis} />}
            {activeTab === 'evidence' && <EvidenceExplorerTab analysis={analysis} />}
            {activeTab === 'improvements' && <ResumeImprovementCenterTab analysis={analysis} />}
            {activeTab === 'interview' && <InterviewTab analysis={analysis} />}
          </div>
        </div>
      )}

      {/* Limitations */}
      {analysis.analysis_limitations.length > 0 && (
        <Card className="mt-8 p-5 border-zinc-800 bg-zinc-900/30">
          <h3 className="text-xs font-semibold text-zinc-500 mb-2 flex items-center gap-2 uppercase tracking-wider font-mono">
            <Info size={13} /> Evaluation Notes & HR Methodology
          </h3>
          <ul className="space-y-1">
            {analysis.analysis_limitations.map((l, i) => (
              <li key={i} className="text-xs text-zinc-500 flex items-start gap-2">
                <span className="shrink-0 mt-0.5">•</span>{l}
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Optimizer Coming Soon Modal */}
      <OptimizeResumeModal
        isOpen={showOptimizerModal}
        onClose={() => setShowOptimizerModal(false)}
        jobTitle={analysis.job_title}
        companyName={analysis.company_name}
      />
    </AppLayout>
  );
}
