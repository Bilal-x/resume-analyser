import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppLayout, PageHeader } from '../components/Layout';
import { Button, Card, Badge, ScoreRing, ProgressBar, Skeleton, EmptyState } from '../components/ui';
import { analysesApi, type AnalysisResponse, type DirectFinding, type IndirectFinding, type ProjectAnalysisItem, type RequirementMatrixItem, type InterviewQuestion } from '../lib/api';
import {
  ChevronDown, ChevronUp, CheckCircle2, XCircle, AlertCircle, Info,
  Sparkles, ArrowLeft, Download, Trash2, MessageSquare, Wrench,
  BarChart3, Search, FolderOpen, BookOpen, Target, HelpCircle
} from 'lucide-react';

const TABS = [
  { id: 'overview', label: 'Overview', icon: BarChart3 },
  { id: 'skills', label: 'Skill Match', icon: Target },
  { id: 'projects', label: 'Projects', icon: FolderOpen },
  { id: 'direct', label: 'Direct Findings', icon: CheckCircle2 },
  { id: 'indirect', label: 'Indirect Findings', icon: Search },
  { id: 'missing', label: 'Gaps', icon: XCircle },
  { id: 'recommendations', label: 'Recommendations', icon: Wrench },
  { id: 'interview', label: 'Interview Qs', icon: MessageSquare },
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
  return <Badge variant={map[status] || 'neutral'}>{status}</Badge>;
}

function ConfidenceBadge({ confidence }: { confidence: string }) {
  const c = confidence?.toLowerCase();
  return <Badge variant={c === 'high' ? 'success' : c === 'medium' ? 'warning' : 'danger'}>{confidence}</Badge>;
}

// --- Tabs ---
function OverviewTab({ analysis }: { analysis: AnalysisResponse }) {
  const sb = analysis.score_breakdown;
  const dimensionLabels: Record<string, string> = {
    mandatory_skills: 'Mandatory Skills',
    core_technical_skills: 'Core Technical Skills',
    project_relevance: 'Project Relevance',
    experience_implementation: 'Experience & Implementation',
    domain_knowledge: 'Domain Knowledge',
    other_qualifications: 'Other Qualifications',
  };

  return (
    <div className="space-y-6">
      {/* Score hero */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-8 flex flex-col items-center justify-center text-center col-span-1">
          <ScoreRing score={analysis.overall_score} size={150} strokeWidth={10} />
          <div className="mt-4 space-y-2">
            <ScoreInterpretationBadge score={analysis.overall_score} />
            <p className="text-xs text-gray-500">{sb.analysis_confidence} Confidence</p>
          </div>
        </Card>

        <Card className="p-6 col-span-2 space-y-4">
          <h3 className="font-semibold text-white">Score Dimensions</h3>
          {[
            { key: 'mandatory_skills_score', label: 'Mandatory Skills', weight: 0.30 },
            { key: 'core_technical_skills_score', label: 'Core Technical', weight: 0.20 },
            { key: 'project_relevance_score', label: 'Project Relevance', weight: 0.20 },
            { key: 'experience_implementation_score', label: 'Experience', weight: 0.15 },
            { key: 'domain_knowledge_score', label: 'Domain Knowledge', weight: 0.10 },
            { key: 'other_qualifications_score', label: 'Other', weight: 0.05 },
          ].map(d => (
            <ProgressBar
              key={d.key}
              value={(sb as unknown as Record<string, number>)[d.key] || 0}
              max={10}
              label={`${d.label} (${Math.round(d.weight * 100)}%)`}
            />
          ))}
        </Card>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold text-emerald-400">{analysis.direct_findings.length}</p>
          <p className="text-xs text-gray-500 mt-1">Direct Matches</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold text-blue-400">{analysis.indirect_findings.length}</p>
          <p className="text-xs text-gray-500 mt-1">Indirect Matches</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold text-amber-400">{analysis.project_analyses.length}</p>
          <p className="text-xs text-gray-500 mt-1">Projects Analyzed</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold text-rose-400">{analysis.missing_requirements.length}</p>
          <p className="text-xs text-gray-500 mt-1">Gaps Found</p>
        </Card>
      </div>

      {/* Evidence coverage */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-white">Evidence Coverage</h3>
          <Badge variant={sb.evidence_coverage_percent >= 70 ? 'success' : sb.evidence_coverage_percent >= 40 ? 'warning' : 'danger'}>
            {sb.evidence_coverage_percent.toFixed(0)}%
          </Badge>
        </div>
        <div className="h-3 bg-white/10 rounded-full overflow-hidden mb-4">
          <div
            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-emerald-500 transition-all duration-1000"
            style={{ width: `${sb.evidence_coverage_percent}%` }}
          />
        </div>
      </Card>

      {/* Key factors */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="font-semibold text-emerald-400 mb-4 flex items-center gap-2">
            <CheckCircle2 size={16} />Key Strengths
          </h3>
          <ul className="space-y-2">
            {sb.key_positive_factors.map((f, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                <span className="text-emerald-400 mt-0.5 flex-shrink-0">+</span>
                {f}
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold text-rose-400 mb-4 flex items-center gap-2">
            <AlertCircle size={16} />Key Gaps
          </h3>
          <ul className="space-y-2">
            {sb.key_negative_factors.map((f, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                <span className="text-rose-400 mt-0.5 flex-shrink-0">−</span>
                {f}
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}

function SkillMatchTab({ analysis }: { analysis: AnalysisResponse }) {
  return (
    <div>
      <h3 className="font-semibold text-white mb-4">Requirements Matrix ({analysis.requirements_matrix.length} requirements)</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left py-3 px-4 text-gray-400 font-medium">Requirement</th>
              <th className="text-left py-3 px-4 text-gray-400 font-medium">Category</th>
              <th className="text-left py-3 px-4 text-gray-400 font-medium">Importance</th>
              <th className="text-left py-3 px-4 text-gray-400 font-medium">Status</th>
              <th className="text-left py-3 px-4 text-gray-400 font-medium">Confidence</th>
              <th className="text-right py-3 px-4 text-gray-400 font-medium">Score</th>
            </tr>
          </thead>
          <tbody>
            {analysis.requirements_matrix.map((item, i) => (
              <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                <td className="py-3 px-4">
                  <span className="text-white font-medium">{item.requirement_name}</span>
                  {item.supporting_excerpt && (
                    <p className="text-xs text-gray-500 mt-0.5 max-w-xs truncate" title={item.supporting_excerpt}>
                      "{item.supporting_excerpt}"
                    </p>
                  )}
                </td>
                <td className="py-3 px-4 text-gray-400">{item.category}</td>
                <td className="py-3 px-4">
                  <Badge variant={item.importance === 'Mandatory' ? 'danger' : 'neutral'}>
                    {item.importance}
                  </Badge>
                </td>
                <td className="py-3 px-4"><StatusBadge status={item.status} /></td>
                <td className="py-3 px-4"><ConfidenceBadge confidence={item.confidence} /></td>
                <td className="py-3 px-4 text-right">
                  <span className="text-indigo-400 font-semibold">{item.score_contribution.toFixed(2)}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ProjectsTab({ analysis }: { analysis: AnalysisResponse }) {
  const [expanded, setExpanded] = useState<number | null>(0);

  if (analysis.project_analyses.length === 0) {
    return <EmptyState icon={<FolderOpen size={32} />} title="No projects analyzed" description="No projects were found in the resume." />;
  }

  return (
    <div className="space-y-4">
      {analysis.project_analyses.map((p, i) => (
        <Card key={i} className="overflow-hidden">
          <button
            onClick={() => setExpanded(expanded === i ? null : i)}
            className="w-full p-5 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/15 flex items-center justify-center">
                <span className="text-lg font-bold text-amber-400">{p.jd_relevance_score.toFixed(0)}</span>
              </div>
              <div>
                <h3 className="font-semibold text-white">{p.project_name}</h3>
                <p className="text-sm text-gray-400">{p.purpose_domain}</p>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  {p.technologies_mentioned.slice(0, 4).map(t => (
                    <Badge key={t} variant="info" size="sm">{t}</Badge>
                  ))}
                  {p.technologies_mentioned.length > 4 && (
                    <span className="text-xs text-gray-500">+{p.technologies_mentioned.length - 4} more</span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <div className="text-right hidden sm:block">
                <Badge variant={p.production_readiness === 'High' ? 'success' : p.production_readiness === 'Medium' ? 'warning' : 'danger'}>
                  {p.production_readiness} readiness
                </Badge>
              </div>
              {expanded === i ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
            </div>
          </button>

          {expanded === i && (
            <div className="px-5 pb-5 space-y-4 border-t border-white/10 pt-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">JD Relevance</p>
                  <ProgressBar value={p.jd_relevance_score} label="" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500">Ownership</p>
                  <Badge variant={p.ownership_clarity === 'High' ? 'success' : 'warning'}>{p.ownership_clarity}</Badge>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-semibold text-gray-400 mb-2">Problem Addressed</p>
                  <p className="text-sm text-gray-300">{p.problem_addressed}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-400 mb-2">Candidate Contribution</p>
                  <p className="text-sm text-gray-300">{p.candidate_contribution}</p>
                </div>
              </div>

              {p.implementation_details && (
                <div>
                  <p className="text-xs font-semibold text-gray-400 mb-2">Implementation Details</p>
                  <p className="text-sm text-gray-300">{p.implementation_details}</p>
                </div>
              )}

              {p.technical_concepts.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-400 mb-2">Technical Concepts</p>
                  <div className="flex flex-wrap gap-2">
                    {p.technical_concepts.map(t => <Badge key={t} variant="neutral">{t}</Badge>)}
                  </div>
                </div>
              )}

              {p.improvement_suggestions.length > 0 && (
                <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                  <p className="text-xs font-semibold text-indigo-400 mb-2">💡 Improvement Suggestions</p>
                  <ul className="space-y-1.5">
                    {p.improvement_suggestions.map((s, j) => (
                      <li key={j} className="text-sm text-gray-300 flex items-start gap-2">
                        <span className="text-indigo-400 flex-shrink-0">→</span>{s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {p.supporting_excerpts.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-400 mb-2">Resume Excerpts</p>
                  {p.supporting_excerpts.map((ex, j) => (
                    <blockquote key={j} className="border-l-2 border-indigo-500/50 pl-3 text-sm text-gray-400 italic mb-2">
                      "{ex}"
                    </blockquote>
                  ))}
                </div>
              )}
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}

function DirectFindingsTab({ analysis }: { analysis: AnalysisResponse }) {
  const strengthColor: Record<string, string> = {
    Strong: 'text-emerald-400', Moderate: 'text-amber-400', Limited: 'text-orange-400', Unverified: 'text-gray-400'
  };
  return (
    <div className="space-y-4">
      <div className="flex items-start gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">
        <CheckCircle2 size={16} className="flex-shrink-0 mt-0.5" />
        Direct findings are skills and requirements explicitly supported by resume text — no inference required.
      </div>
      {analysis.direct_findings.length === 0 ? (
        <EmptyState icon={<CheckCircle2 size={32} />} title="No direct findings" description="No direct evidence was found." />
      ) : (
        analysis.direct_findings.map((f, i) => (
          <Card key={i} className="p-5">
            <div className="flex items-start justify-between gap-4 mb-3">
              <div>
                <h3 className="font-semibold text-white">{f.requirement_name}</h3>
                <p className="text-xs text-gray-500">{f.evidence_classification} · {f.resume_section}</p>
              </div>
              <Badge variant="neutral" size="sm">
                <span className={strengthColor[f.strength_of_evidence] || 'text-gray-400'}>{f.strength_of_evidence}</span>
              </Badge>
            </div>
            <blockquote className="border-l-2 border-emerald-500/40 pl-3 text-sm text-gray-300 italic mb-3">
              "{f.supporting_excerpt}"
            </blockquote>
            <p className="text-sm text-gray-400">{f.relevance_explanation}</p>
          </Card>
        ))
      )}
    </div>
  );
}

function IndirectFindingsTab({ analysis }: { analysis: AnalysisResponse }) {
  return (
    <div className="space-y-4">
      <div className="flex items-start gap-2 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm">
        <Info size={16} className="flex-shrink-0 mt-0.5" />
        Indirect findings are skills inferred from related technologies, projects, or transferable experience. Each includes a confidence level and what remains unverified.
      </div>
      {analysis.indirect_findings.length === 0 ? (
        <EmptyState icon={<Search size={32} />} title="No indirect findings" description="No indirect evidence was inferred." />
      ) : (
        analysis.indirect_findings.map((f, i) => (
          <Card key={i} className="p-5">
            <div className="flex items-start justify-between gap-4 mb-3">
              <div>
                <h3 className="font-semibold text-white">{f.requirement_name}</h3>
                <p className="text-xs text-gray-500">{f.related_technology_or_activity} · {f.source_project_or_experience}</p>
              </div>
              <ConfidenceBadge confidence={f.confidence_level} />
            </div>
            <blockquote className="border-l-2 border-blue-500/40 pl-3 text-sm text-gray-300 italic mb-3">
              "{f.supporting_excerpt}"
            </blockquote>
            <p className="text-sm text-gray-400 mb-3">{f.relationship_explanation}</p>
            <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-400">
              <span className="font-semibold">⚠ Unverified: </span>{f.what_remains_unverified}
            </div>
          </Card>
        ))
      )}
    </div>
  );
}

function MissingTab({ analysis }: { analysis: AnalysisResponse }) {
  const missingFromMatrix = analysis.requirements_matrix.filter(r => r.status === 'Not evidenced');
  const unverified = analysis.score_breakdown.unverified_requirements;

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
        <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
        "Not evidenced" does not mean the candidate lacks a skill — it means the resume provides no evidence. These are important discussion points for interviews.
      </div>

      {analysis.missing_requirements.length > 0 && (
        <Card className="p-6">
          <h3 className="font-semibold text-white mb-4">Missing Requirements Summary</h3>
          <ul className="space-y-2">
            {analysis.missing_requirements.map((r, i) => (
              <li key={i} className="flex items-center gap-2 text-sm text-gray-300">
                <XCircle size={14} className="text-rose-400 flex-shrink-0" />
                {r}
              </li>
            ))}
          </ul>
        </Card>
      )}

      {missingFromMatrix.length > 0 && (
        <Card className="p-6">
          <h3 className="font-semibold text-white mb-4">Not Evidenced in Matrix ({missingFromMatrix.length})</h3>
          <div className="space-y-3">
            {missingFromMatrix.map((item, i) => (
              <div key={i} className="flex items-center justify-between gap-4 py-2 border-b border-white/5 last:border-0">
                <div>
                  <span className="text-white text-sm font-medium">{item.requirement_name}</span>
                  <span className="text-gray-500 text-xs ml-2">{item.category}</span>
                </div>
                <Badge variant={item.importance === 'Mandatory' ? 'danger' : 'neutral'}>{item.importance}</Badge>
              </div>
            ))}
          </div>
        </Card>
      )}

      {unverified.length > 0 && (
        <Card className="p-6">
          <h3 className="font-semibold text-amber-400 mb-4 flex items-center gap-2">
            <AlertCircle size={16} />Unverified Claims
          </h3>
          <ul className="space-y-2">
            {unverified.map((r, i) => (
              <li key={i} className="flex items-center gap-2 text-sm text-gray-300">
                <AlertCircle size={14} className="text-amber-400 flex-shrink-0" />
                {r}
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}

function RecommendationsTab({ analysis }: { analysis: AnalysisResponse }) {
  const rec = analysis.recommendations;
  return (
    <div className="space-y-6">
      {/* Prioritized Action Plan */}
      {rec.prioritized_action_plan.length > 0 && (
        <Card className="p-6">
          <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
            <Target size={16} className="text-indigo-400" />
            Prioritized Action Plan
          </h3>
          <ol className="space-y-3">
            {rec.prioritized_action_plan.map((action, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <span className="text-sm text-gray-300">{action}</span>
              </li>
            ))}
          </ol>
        </Card>
      )}

      {/* Skills section improvements */}
      {rec.skills_section_improvements.length > 0 && (
        <Card className="p-6">
          <h3 className="font-semibold text-white mb-4">Skills Section Improvements</h3>
          <div className="space-y-4">
            {rec.skills_section_improvements.map((s, i) => (
              <div key={i} className="p-3 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="success" size="sm">Add: {s.skill}</Badge>
                  <span className="text-xs text-gray-500">Found in: {s.evidence_location}</span>
                </div>
                <p className="text-sm text-gray-300">{s.recommendation}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Project bullet rewrites */}
      {rec.project_bullet_rewrites.length > 0 && (
        <Card className="p-6">
          <h3 className="font-semibold text-white mb-4">Project Description Improvements</h3>
          <div className="space-y-5">
            {rec.project_bullet_rewrites.map((r, i) => (
              <div key={i} className="space-y-2">
                <p className="text-sm font-semibold text-gray-300">{r.project_name}</p>
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                  <p className="text-xs text-red-400 mb-1 font-medium">Original:</p>
                  <p className="text-sm text-gray-400 italic">"{r.original_bullet}"</p>
                </div>
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <p className="text-xs text-emerald-400 mb-1 font-medium">Suggested:</p>
                  <p className="text-sm text-gray-300">"{r.suggested_rewrite}"</p>
                </div>
                <p className="text-xs text-gray-500">{r.rationale}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Keyword alignment */}
      <Card className="p-6">
        <h3 className="font-semibold text-white mb-4">Keyword Alignment</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-emerald-400 font-semibold mb-2">✓ Supported Keywords</p>
            <div className="flex flex-wrap gap-1.5">
              {rec.keyword_alignment.supported_keywords.map(k => <Badge key={k} variant="success" size="sm">{k}</Badge>)}
            </div>
          </div>
          <div>
            <p className="text-xs text-amber-400 font-semibold mb-2">? Needs Confirmation</p>
            <div className="flex flex-wrap gap-1.5">
              {rec.keyword_alignment.potential_keywords_needs_confirmation.map(k => <Badge key={k} variant="warning" size="sm">{k}</Badge>)}
            </div>
          </div>
          <div>
            <p className="text-xs text-rose-400 font-semibold mb-2">✗ Genuine Gaps</p>
            <div className="flex flex-wrap gap-1.5">
              {rec.keyword_alignment.genuine_experience_gaps.map(k => <Badge key={k} variant="danger" size="sm">{k}</Badge>)}
            </div>
          </div>
        </div>
      </Card>

      {/* Learning exercises */}
      {rec.optional_learning_exercises.length > 0 && (
        <Card className="p-6">
          <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
            <BookOpen size={16} className="text-violet-400" />Optional Learning Exercises
          </h3>
          <ul className="space-y-2">
            {rec.optional_learning_exercises.map((e, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                <span className="text-violet-400 flex-shrink-0">📚</span>{e}
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Interview prep topics */}
      {rec.interview_prep_topics.length > 0 && (
        <Card className="p-6">
          <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
            <MessageSquare size={16} className="text-blue-400" />Interview Preparation Topics
          </h3>
          <ul className="space-y-2">
            {rec.interview_prep_topics.map((t, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                <span className="text-blue-400 flex-shrink-0">→</span>{t}
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}

function InterviewTab({ analysis }: { analysis: AnalysisResponse }) {
  return (
    <div className="space-y-4">
      <div className="flex items-start gap-2 p-3 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400 text-sm">
        <HelpCircle size={16} className="flex-shrink-0 mt-0.5" />
        These questions were generated based on resume evidence, JD requirements, and gaps. Each includes rationale and evaluation criteria.
      </div>
      {analysis.interview_questions.map((q, i) => (
        <Card key={i} className="p-5">
          <div className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-violet-500/20 text-violet-400 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
              Q{i + 1}
            </span>
            <div className="space-y-3 flex-1">
              <p className="text-white font-medium">{q.question}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-2.5 rounded-lg bg-white/5">
                  <p className="text-xs text-gray-500 mb-1">Related Requirement</p>
                  <p className="text-sm text-gray-300">{q.related_jd_requirement}</p>
                </div>
                <div className="p-2.5 rounded-lg bg-white/5">
                  <p className="text-xs text-gray-500 mb-1">Why this question</p>
                  <p className="text-sm text-gray-300">{q.purpose_reason}</p>
                </div>
              </div>
              {q.resume_evidence && (
                <div className="p-2.5 rounded-lg bg-indigo-500/10 border border-indigo-500/15">
                  <p className="text-xs text-indigo-400 mb-1">Resume evidence that prompted this</p>
                  <p className="text-sm text-gray-400 italic">"{q.resume_evidence}"</p>
                </div>
              )}
              {q.evaluation_criteria && (
                <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/15">
                  <p className="text-xs text-emerald-400 mb-1">Evaluation criteria (HR)</p>
                  <p className="text-sm text-gray-300">{q.evaluation_criteria}</p>
                </div>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

// --- Main Page ---
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
    if (!analysis || !confirm('Delete this analysis permanently?')) return;
    try {
      await analysesApi.delete(analysis.id);
      navigate('/analyses');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Delete failed.');
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="space-y-4">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-48" />
          <Skeleton className="h-32" />
        </div>
      </AppLayout>
    );
  }

  if (error || !analysis) {
    return (
      <AppLayout>
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400">
          {error || 'Analysis not found.'}
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      {/* Back & actions */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={16} />Back
        </button>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="danger" icon={<Trash2 size={14} />} onClick={handleDelete}>
            Delete
          </Button>
        </div>
      </div>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start gap-4">
          <ScoreRing score={analysis.overall_score} size={90} strokeWidth={7} />
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white">
              {analysis.candidate_name}
            </h1>
            <p className="text-gray-400">
              {analysis.job_title} at {analysis.company_name}
            </p>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <ScoreInterpretationBadge score={analysis.overall_score} />
              <Badge variant="neutral">{analysis.score_breakdown.analysis_confidence} Confidence</Badge>
              <span className="text-xs text-gray-500">
                {new Date(analysis.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto pb-2 mb-6 scrollbar-thin">
        {TABS.map(tab => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200 flex-shrink-0 ${
                active
                  ? 'bg-indigo-500/20 text-white border border-indigo-500/30'
                  : 'text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              <Icon size={14} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div className="fade-in-up">
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
          <h3 className="text-sm font-semibold text-gray-400 mb-3 flex items-center gap-2">
            <Info size={14} />Analysis Limitations
          </h3>
          <ul className="space-y-1">
            {analysis.analysis_limitations.map((l, i) => (
              <li key={i} className="text-xs text-gray-500 flex items-start gap-2">
                <span className="flex-shrink-0">•</span>{l}
              </li>
            ))}
          </ul>
        </Card>
      )}
    </AppLayout>
  );
}
