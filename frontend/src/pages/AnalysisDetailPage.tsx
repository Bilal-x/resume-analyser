import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppLayout } from '../components/Layout';
import { Button, Card, Badge, ScoreRing, ProgressBar, Skeleton, EmptyState, Alert, Tabs } from '../components/ui';
import { analysesApi, type AnalysisResponse } from '../lib/api';
import {
  ChevronDown, ChevronUp, CheckCircle2, XCircle, AlertCircle, Info,
  ArrowLeft, Trash2, MessageSquare, Wrench,
  BarChart3, Search, FolderOpen, BookOpen, Target, HelpCircle,
  FileJson, Printer, Plus
} from 'lucide-react';

const TABS = [
  { id: 'overview', label: 'Overview', icon: <BarChart3 size={13} /> },
  { id: 'skills', label: 'Skill Match', icon: <Target size={13} /> },
  { id: 'projects', label: 'Projects', icon: <FolderOpen size={13} /> },
  { id: 'direct', label: 'Direct Findings', icon: <CheckCircle2 size={13} /> },
  { id: 'indirect', label: 'Indirect Findings', icon: <Search size={13} /> },
  { id: 'missing', label: 'Gaps', icon: <XCircle size={13} /> },
  { id: 'recommendations', label: 'Resume Tips', icon: <Wrench size={13} /> },
  { id: 'interview', label: 'Interview Qs', icon: <MessageSquare size={13} /> },
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
   DIRECT FINDINGS TAB
   ============================================================ */
function DirectFindingsTab({ analysis }: { analysis: AnalysisResponse }) {
  const strengthColors: Record<string, string> = {
    Strong: 'text-emerald-400',
    Moderate: 'text-amber-400',
    Limited: 'text-orange-400',
    Unverified: 'text-zinc-400',
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <Alert variant="success" icon={<CheckCircle2 size={15} />}>
        Direct findings are skills and requirements explicitly supported by resume text — no inference required.
      </Alert>

      {analysis.direct_findings.length === 0 ? (
        <EmptyState icon={<CheckCircle2 size={28} />} title="No direct findings" description="No direct evidence was found." />
      ) : (
        analysis.direct_findings.map((f, i) => (
          <Card key={i} className="p-5">
            <div className="flex items-start justify-between gap-4 mb-3">
              <div>
                <h3 className="font-semibold text-zinc-100 text-sm">{f.requirement_name}</h3>
                <p className="text-xs text-zinc-500 mt-0.5">{f.evidence_classification} · {f.resume_section}</p>
              </div>
              <Badge variant="neutral" size="xs">
                <span className={strengthColors[f.strength_of_evidence] || 'text-zinc-400'}>
                  {f.strength_of_evidence}
                </span>
              </Badge>
            </div>
            <blockquote className="border-l-2 border-emerald-500/40 pl-3.5 text-sm text-zinc-300 italic mb-3 leading-relaxed">
              "{f.supporting_excerpt}"
            </blockquote>
            <p className="text-sm text-zinc-400 leading-relaxed">{f.relevance_explanation}</p>
          </Card>
        ))
      )}
    </div>
  );
}

/* ============================================================
   INDIRECT FINDINGS TAB
   ============================================================ */
function IndirectFindingsTab({ analysis }: { analysis: AnalysisResponse }) {
  return (
    <div className="space-y-4 animate-fade-in">
      <Alert variant="info" icon={<Info size={15} />}>
        Indirect findings are skills inferred from related technologies, projects, or transferable experience. Each includes a confidence level and what remains unverified.
      </Alert>

      {analysis.indirect_findings.length === 0 ? (
        <EmptyState icon={<Search size={28} />} title="No indirect findings" description="No indirect evidence was inferred." />
      ) : (
        analysis.indirect_findings.map((f, i) => (
          <Card key={i} className="p-5">
            <div className="flex items-start justify-between gap-4 mb-3">
              <div>
                <h3 className="font-semibold text-zinc-100 text-sm">{f.requirement_name}</h3>
                <p className="text-xs text-zinc-500 mt-0.5">{f.related_technology_or_activity} · {f.source_project_or_experience}</p>
              </div>
              <ConfidenceBadge confidence={f.confidence_level} />
            </div>
            <blockquote className="border-l-2 border-blue-500/40 pl-3.5 text-sm text-zinc-300 italic mb-3 leading-relaxed">
              "{f.supporting_excerpt}"
            </blockquote>
            <p className="text-sm text-zinc-400 mb-3 leading-relaxed">{f.relationship_explanation}</p>
            <Alert variant="warning" icon={<AlertCircle size={13} />}>
              <span className="font-semibold">Unverified: </span>{f.what_remains_unverified}
            </Alert>
          </Card>
        ))
      )}
    </div>
  );
}

/* ============================================================
   MISSING / GAPS TAB
   ============================================================ */
function MissingTab({ analysis }: { analysis: AnalysisResponse }) {
  const missingFromMatrix = analysis.requirements_matrix.filter(r => r.status === 'Not evidenced');
  const unverified = analysis.score_breakdown.unverified_requirements;

  return (
    <div className="space-y-6 animate-fade-in">
      <Alert variant="danger" icon={<AlertCircle size={15} />}>
        "Not evidenced" does not mean the candidate lacks a skill — it means the resume provides no evidence. These are important discussion points for interviews.
      </Alert>

      {analysis.missing_requirements.length > 0 && (
        <Card className="p-6">
          <h3 className="font-semibold text-zinc-100 mb-4 text-sm">Missing Requirements Summary</h3>
          <ul className="space-y-2.5">
            {analysis.missing_requirements.map((r, i) => (
              <li key={i} className="flex items-center gap-2.5 text-sm text-zinc-300">
                <XCircle size={14} className="text-rose-400 shrink-0" />
                {r}
              </li>
            ))}
          </ul>
        </Card>
      )}

      {missingFromMatrix.length > 0 && (
        <Card className="p-6">
          <h3 className="font-semibold text-zinc-100 mb-4 text-sm">
            Not Evidenced in Matrix
            <span className="text-zinc-500 font-normal ml-2">({missingFromMatrix.length})</span>
          </h3>
          <div className="space-y-2">
            {missingFromMatrix.map((item, i) => (
              <div key={i} className="flex items-center justify-between gap-4 py-2.5 border-b border-zinc-800/40 last:border-0">
                <div>
                  <span className="text-zinc-100 text-sm font-medium">{item.requirement_name}</span>
                  <span className="text-zinc-500 text-xs ml-2">{item.category}</span>
                </div>
                <Badge variant={item.importance === 'Mandatory' ? 'danger' : 'neutral'} size="xs">{item.importance}</Badge>
              </div>
            ))}
          </div>
        </Card>
      )}

      {unverified.length > 0 && (
        <Card className="p-6">
          <h3 className="font-semibold text-amber-400 mb-4 text-sm flex items-center gap-2">
            <AlertCircle size={15} /> Unverified Claims
          </h3>
          <ul className="space-y-2.5">
            {unverified.map((r, i) => (
              <li key={i} className="flex items-center gap-2.5 text-sm text-zinc-300">
                <AlertCircle size={14} className="text-amber-400 shrink-0" />
                {r}
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}

/* ============================================================
   RECOMMENDATIONS TAB
   ============================================================ */
function RecommendationsTab({ analysis }: { analysis: AnalysisResponse }) {
  const rec = analysis.recommendations;
  return (
    <div className="space-y-6 animate-fade-in">
      {rec.prioritized_action_plan.length > 0 && (
        <Card className="p-6">
          <h3 className="font-semibold text-zinc-100 mb-4 flex items-center gap-2 text-sm">
            <Target size={15} className="text-indigo-400" /> Prioritized Action Plan
          </h3>
          <ol className="space-y-3">
            {rec.prioritized_action_plan.map((action, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-lg bg-indigo-500/15 text-indigo-400 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <span className="text-sm text-zinc-300">{action}</span>
              </li>
            ))}
          </ol>
        </Card>
      )}

      {rec.skills_section_improvements.length > 0 && (
        <Card className="p-6">
          <h3 className="font-semibold text-zinc-100 mb-4 text-sm">Skills Section Improvements</h3>
          <div className="space-y-3">
            {rec.skills_section_improvements.map((s, i) => (
              <div key={i} className="p-4 rounded-xl bg-zinc-800/30 border border-zinc-700/30">
                <div className="flex items-center gap-2 mb-1.5">
                  <Badge variant="success" size="xs">Add: {s.skill}</Badge>
                  <span className="text-xs text-zinc-500">Found in: {s.evidence_location}</span>
                </div>
                <p className="text-sm text-zinc-300">{s.recommendation}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {rec.project_bullet_rewrites.length > 0 && (
        <Card className="p-6">
          <h3 className="font-semibold text-zinc-100 mb-4 text-sm">Project Description Improvements</h3>
          <div className="space-y-5">
            {rec.project_bullet_rewrites.map((r, i) => (
              <div key={i} className="space-y-2">
                <p className="text-sm font-semibold text-zinc-200">{r.project_name}</p>
                <div className="p-3.5 rounded-xl bg-red-500/6 border border-red-500/15">
                  <p className="text-xs text-red-400 mb-1 font-semibold uppercase tracking-wide">Original</p>
                  <p className="text-sm text-zinc-400 italic">"{r.original_bullet}"</p>
                </div>
                <div className="p-3.5 rounded-xl bg-emerald-500/6 border border-emerald-500/15">
                  <p className="text-xs text-emerald-400 mb-1 font-semibold uppercase tracking-wide">Suggested</p>
                  <p className="text-sm text-zinc-200">"{r.suggested_rewrite}"</p>
                </div>
                <p className="text-xs text-zinc-500">{r.rationale}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card className="p-6">
        <h3 className="font-semibold text-zinc-100 mb-4 text-sm">Keyword Alignment</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div>
            <p className="text-xs text-emerald-400 font-semibold mb-2.5 uppercase tracking-wide">✓ Supported</p>
            <div className="flex flex-wrap gap-1.5">
              {rec.keyword_alignment.supported_keywords.map(k => <Badge key={k} variant="success" size="xs">{k}</Badge>)}
            </div>
          </div>
          <div>
            <p className="text-xs text-amber-400 font-semibold mb-2.5 uppercase tracking-wide">? Needs Confirmation</p>
            <div className="flex flex-wrap gap-1.5">
              {rec.keyword_alignment.potential_keywords_needs_confirmation.map(k => <Badge key={k} variant="warning" size="xs">{k}</Badge>)}
            </div>
          </div>
          <div>
            <p className="text-xs text-rose-400 font-semibold mb-2.5 uppercase tracking-wide">✗ Genuine Gaps</p>
            <div className="flex flex-wrap gap-1.5">
              {rec.keyword_alignment.genuine_experience_gaps.map(k => <Badge key={k} variant="danger" size="xs">{k}</Badge>)}
            </div>
          </div>
        </div>
      </Card>

      {rec.optional_learning_exercises.length > 0 && (
        <Card className="p-6">
          <h3 className="font-semibold text-zinc-100 mb-4 flex items-center gap-2 text-sm">
            <BookOpen size={15} className="text-violet-400" /> Optional Learning Exercises
          </h3>
          <ul className="space-y-2.5">
            {rec.optional_learning_exercises.map((e, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-zinc-300">
                <span className="text-violet-400 shrink-0">📚</span>{e}
              </li>
            ))}
          </ul>
        </Card>
      )}
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
   MAIN PAGE
   ============================================================ */
export default function AnalysisDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

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
      {/* Breadcrumb / Back */}
      <div className="flex items-center justify-between mb-6 gap-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors group"
        >
          <ArrowLeft size={15} className="group-hover:-translate-x-0.5 transition-transform" />
          Back
        </button>
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

      {/* Header card */}
      <Card className="p-6 mb-6">
        <div className="flex flex-col sm:flex-row items-start gap-5">
          <ScoreRing score={analysis.overall_score} size={100} strokeWidth={8} />
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-white">{analysis.candidate_name}</h1>
            <p className="text-zinc-400 mt-1">
              <span className="font-medium text-zinc-300">{analysis.job_title}</span>
              {analysis.company_name && <span className="text-zinc-500"> at {analysis.company_name}</span>}
            </p>
            <div className="flex flex-wrap items-center gap-2 mt-3">
              <ScoreInterpretationBadge score={analysis.overall_score} />
              <Badge variant="neutral">
                {analysis.score_breakdown.analysis_confidence} Confidence
              </Badge>
              <Badge variant="neutral">
                {analysis.score_breakdown.evidence_coverage_percent.toFixed(0)}% Evidence Coverage
              </Badge>
              <span className="text-xs text-zinc-500">
                {new Date(analysis.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
          </div>
        </div>
      </Card>

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
        {activeTab === 'skills' && <SkillMatchTab analysis={analysis} />}
        {activeTab === 'projects' && <ProjectsTab analysis={analysis} />}
        {activeTab === 'direct' && <DirectFindingsTab analysis={analysis} />}
        {activeTab === 'indirect' && <IndirectFindingsTab analysis={analysis} />}
        {activeTab === 'missing' && <MissingTab analysis={analysis} />}
        {activeTab === 'recommendations' && <RecommendationsTab analysis={analysis} />}
        {activeTab === 'interview' && <InterviewTab analysis={analysis} />}
      </div>

      {/* Limitations */}
      {analysis.analysis_limitations.length > 0 && (
        <Card className="mt-8 p-5">
          <h3 className="text-xs font-semibold text-zinc-500 mb-3 flex items-center gap-2 uppercase tracking-wider">
            <Info size={13} /> Analysis Limitations
          </h3>
          <ul className="space-y-1.5">
            {analysis.analysis_limitations.map((l, i) => (
              <li key={i} className="text-xs text-zinc-600 flex items-start gap-2">
                <span className="shrink-0 mt-0.5">•</span>{l}
              </li>
            ))}
          </ul>
        </Card>
      )}
    </AppLayout>
  );
}
