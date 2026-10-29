import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout, PageHeader, SectionHeader } from '../components/Layout';
import { Button, Card, Badge, ScoreRing, Skeleton, EmptyState, StatCard } from '../components/ui';
import { useAuth } from '../contexts/AuthContext';
import { analysesApi, resumesApi, type AnalysisResponse, type ResumeResponse } from '../lib/api';
import {
  FileText, Briefcase, Plus, ArrowRight, CheckCircle2,
  BarChart3, TrendingUp, Upload, Circle, Sparkles, X, Check
} from 'lucide-react';

function AnalysisCard({ analysis, onClick }: { analysis: AnalysisResponse; onClick: () => void }) {
  const score = analysis.overall_score;
  const scoreColor =
    score >= 8 ? 'text-emerald-400' :
    score >= 6.5 ? 'text-amber-400' :
    'text-red-400';

  return (
    <Card
      hover
      onClick={onClick}
      className="p-5 flex flex-col"
    >
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-white text-sm truncate">{analysis.job_title}</h3>
          <p className="text-xs text-zinc-500 truncate mt-0.5">{analysis.company_name || 'Target Company'}</p>
          <div className="mt-2">
            <Badge variant={score >= 7.5 ? 'success' : score >= 6 ? 'warning' : 'danger'} size="xs">
              {analysis.score_breakdown.score_interpretation}
            </Badge>
          </div>
        </div>
        <ScoreRing score={score} size={70} strokeWidth={6} />
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs mb-4">
        <div className="flex items-center gap-1.5 text-emerald-400">
          <CheckCircle2 size={12} />
          <span>{analysis.direct_findings.length} Direct</span>
        </div>
        <div className="flex items-center gap-1.5 text-blue-400">
          <Circle size={12} />
          <span>{analysis.indirect_findings.length} Indirect</span>
        </div>
        <div className="flex items-center gap-1.5 text-zinc-400">
          <BarChart3 size={12} />
          <span>Coverage: {analysis.score_breakdown.evidence_coverage_percent.toFixed(0)}%</span>
        </div>
        <div className="flex items-center gap-1.5 text-zinc-400">
          <span className={`font-semibold ${scoreColor}`}>{analysis.score_breakdown.analysis_confidence}</span>
          <span className="text-zinc-600">conf.</span>
        </div>
      </div>

      <div className="pt-3 border-t border-zinc-800/60 flex items-center justify-between">
        <span className="text-xs text-zinc-600">
          {new Date(analysis.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </span>
        <span className="text-xs text-indigo-400 font-semibold flex items-center gap-1">
          Full Report <ArrowRight size={11} />
        </span>
      </div>
    </Card>
  );
}

export default function CandidateDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [analyses, setAnalyses] = useState<AnalysisResponse[]>([]);
  const [resumes, setResumes] = useState<ResumeResponse[]>([]);
  const [loading, setLoading] = useState(true);

  const [showOptimizerModal, setShowOptimizerModal] = useState(false);

  useEffect(() => {
    Promise.all([
      analysesApi.list().catch(() => []),
      resumesApi.list().catch(() => []),
    ]).then(([a, r]) => {
      setAnalyses(a);
      setResumes(r);
    }).finally(() => setLoading(false));
  }, []);

  const highestScore = analyses.length > 0
    ? Math.max(...analyses.map(a => a.overall_score))
    : 0;

  const averageScore = analyses.length > 0
    ? analyses.reduce((acc, a) => acc + a.overall_score, 0) / analyses.length
    : 0;

  if (loading) {
    return (
      <AppLayout>
        <div className="space-y-6 animate-fade-in">
          <Skeleton className="h-14 w-80" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <Skeleton className="h-48" />
            <Skeleton className="h-48" />
            <Skeleton className="h-48" />
          </div>
        </div>
        {/* Optimizer Coming Soon Modal */}
      {showOptimizerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-zinc-900 border border-zinc-800 p-6 sm:p-7 shadow-2xl relative">
            <button
              onClick={() => setShowOptimizerModal(false)}
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
              Select any target Job Description and automatically tailor your resume to pass automated ATS filters with 99%+ compliance and strong interview readiness.
            </p>

            <div className="space-y-3 mb-6">
              {[
                {
                  title: 'Single-Column ATS Layout',
                  desc: 'Re-exports your resume into an ATS-friendly single-column layout without tables or graphic blocks.'
                },
                {
                  title: 'Project Bullet Rewriting',
                  desc: 'Rewords existing project accomplishments with action verbs and metrics tailored to the target role.'
                },
                {
                  title: 'Keyword Gap Integration',
                  desc: 'Naturally integrates required skills and framework equivalents into your experience narrative.'
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
              <Button variant="secondary" size="sm" onClick={() => setShowOptimizerModal(false)}>
                Close
              </Button>
              <Button size="sm" onClick={() => setShowOptimizerModal(false)}>
                Notify Me When Live
              </Button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
    );
  }

  return (
    <AppLayout>
      <PageHeader
        title={`Welcome back, ${user?.name?.split(' ')[0] || 'there'} 👋`}
        subtitle="Track your resume alignment, discover project-backed skills, and improve your chances."
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              icon={<Sparkles size={14} className="text-amber-400" />}
              onClick={() => setShowOptimizerModal(true)}
            >
              Optimize Resume (ATS)
            </Button>
            <Button size="sm" icon={<Plus size={14} />} onClick={() => navigate('/analyses/new')}>
              New AI Analysis
            </Button>
          </div>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Resumes Stored"
          value={resumes.length}
          icon={<FileText size={20} />}
          color="indigo"
        />
        <StatCard
          label="Analyses Run"
          value={analyses.length}
          icon={<BarChart3 size={20} />}
          color="violet"
        />
        <StatCard
          label="Best Match Score"
          value={highestScore > 0 ? `${highestScore.toFixed(1)}/10` : '—'}
          icon={<TrendingUp size={20} />}
          color="emerald"
        />
        <StatCard
          label="Average Score"
          value={averageScore > 0 ? `${averageScore.toFixed(1)}/10` : '—'}
          icon={<Briefcase size={20} />}
          color="blue"
        />
      </div>

      {/* Quick Start if no resumes */}
      {resumes.length === 0 && (
        <Card className="mb-8 p-6 border-zinc-800 bg-zinc-900/40">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="w-10 h-10 rounded-lg bg-zinc-850 border border-zinc-800 flex items-center justify-center shrink-0 text-zinc-300">
              <Upload size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <Badge variant="info" size="xs" dot className="mb-2">Get Started</Badge>
              <h2 className="text-base font-semibold text-white">Upload your first resume</h2>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                Extract skills, technical projects, and career milestones — then benchmark them against target job descriptions with transparent evidence.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 shrink-0">
              <Button icon={<FileText size={14} />} onClick={() => navigate('/resumes')}>
                Upload Resume
              </Button>
              <Button variant="secondary" size="sm" onClick={() => navigate('/jds')}>
                Add Job Description
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Recent Analyses */}
      <div className="mb-10">
        <SectionHeader
          title="Recent Analyses"
          subtitle="Deep evaluations against specific job descriptions"
          action={
            analyses.length > 0 ? (
              <Button variant="ghost" size="sm" iconRight={<ArrowRight size={13} />}
                onClick={() => navigate('/analyses')}>
                View all ({analyses.length})
              </Button>
            ) : undefined
          }
        />

        {analyses.length === 0 ? (
          <Card className="p-10">
            <EmptyState
              icon={<BarChart3 size={28} />}
              title="No analyses yet"
              description="Pair a resume with a job description to compute a transparent alignment score with direct, indirect, and project-based evidence."
              action={
                <Button icon={<Plus size={15} />} onClick={() => navigate('/analyses/new')}>
                  Start First Analysis
                </Button>
              }
            />
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {analyses.slice(0, 6).map(a => (
              <AnalysisCard
                key={a.id}
                analysis={a}
                onClick={() => navigate(`/analyses/${a.id}`)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Resumes Quick View */}
      {resumes.length > 0 && (
        <div>
          <SectionHeader
            title={`Your Resumes (${resumes.length})`}
            action={
              <Button variant="ghost" size="sm" onClick={() => navigate('/resumes')}>
                Manage Resumes
              </Button>
            }
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {resumes.map(r => {
              const techSkills = (r.structured_data?.technical_skills as string[]) || [];
              const fullName = (r.structured_data?.full_name as string) || '';
              return (
                <Card key={r.id} className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
                      <FileText size={18} className="text-indigo-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-white text-sm truncate">{r.file_name}</h3>
                      {fullName && <p className="text-xs text-zinc-500 mt-0.5">{fullName}</p>}
                      <p className="text-xs text-zinc-600 mt-0.5">
                        Uploaded {new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                      {techSkills.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2.5">
                          {techSkills.slice(0, 6).map(s => (
                            <span key={s} className="px-2 py-0.5 rounded-lg text-[11px] bg-zinc-800/60 border border-zinc-700/40 text-zinc-400 font-medium">
                              {s}
                            </span>
                          ))}
                          {techSkills.length > 6 && (
                            <span className="px-2 py-0.5 rounded-lg text-[11px] bg-zinc-800/30 text-zinc-600">
                              +{techSkills.length - 6} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    <Button
                      size="xs"
                      variant="secondary"
                      onClick={() => navigate(`/analyses/new?resume_id=${r.id}`)}
                    >
                      Analyze
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}
      {/* Optimizer Coming Soon Modal */}
      {showOptimizerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-zinc-900 border border-zinc-800 p-6 sm:p-7 shadow-2xl relative">
            <button
              onClick={() => setShowOptimizerModal(false)}
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
              Select any target Job Description and automatically tailor your resume to pass automated ATS filters with 99%+ compliance and strong interview readiness.
            </p>

            <div className="space-y-3 mb-6">
              {[
                {
                  title: 'Single-Column ATS Layout',
                  desc: 'Re-exports your resume into an ATS-friendly single-column layout without tables or graphic blocks.'
                },
                {
                  title: 'Project Bullet Rewriting',
                  desc: 'Rewords existing project accomplishments with action verbs and metrics tailored to the target role.'
                },
                {
                  title: 'Keyword Gap Integration',
                  desc: 'Naturally integrates required skills and framework equivalents into your experience narrative.'
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
              <Button variant="secondary" size="sm" onClick={() => setShowOptimizerModal(false)}>
                Close
              </Button>
              <Button size="sm" onClick={() => setShowOptimizerModal(false)}>
                Notify Me When Live
              </Button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
