import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout, PageHeader, SectionHeader } from '../components/Layout';
import { Button, Card, Badge, Skeleton, EmptyState, StatCard } from '../components/ui';
import { useAuth } from '../contexts/AuthContext';
import { jdsApi, analysesApi, resumesApi, type JobDescriptionResponse, type AnalysisResponse, type ResumeResponse } from '../lib/api';
import {
  Briefcase, Users, Plus, ArrowRight, CheckCircle2,
  TrendingUp, Scale, FileText
} from 'lucide-react';

function ScoreChip({ score }: { score: number }) {
  const style =
    score >= 7.5
      ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25'
      : score >= 6.0
      ? 'bg-amber-500/15 text-amber-400 border-amber-500/25'
      : 'bg-red-500/15 text-red-400 border-red-500/25';

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border tabular-nums ${style}`}>
      {score.toFixed(1)}/10
    </span>
  );
}

export default function RecruiterDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [jds, setJds] = useState<JobDescriptionResponse[]>([]);
  const [analyses, setAnalyses] = useState<AnalysisResponse[]>([]);
  const [resumes, setResumes] = useState<ResumeResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      jdsApi.list().catch(() => []),
      analysesApi.list().catch(() => []),
      resumesApi.list().catch(() => [])
    ]).then(([j, a, r]) => {
      setJds(j);
      setAnalyses(a);
      setResumes(r);
    }).finally(() => setLoading(false));
  }, []);

  const strongMatchesCount = analyses.filter(a => a.overall_score >= 7.5).length;
  const avgScore = analyses.length > 0
    ? analyses.reduce((acc, a) => acc + a.overall_score, 0) / analyses.length
    : 0;

  if (loading) {
    return (
      <AppLayout>
        <div className="space-y-6 animate-fade-in">
          <Skeleton className="h-14 w-80" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28" />)}
          </div>
          <Skeleton className="h-64" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <PageHeader
        title={`Recruiter Portal`}
        subtitle={`Welcome back, ${user?.name || 'HR Team'}. Manage positions, evaluate candidates, and compare applicant pools.`}
        actions={
          <div className="flex items-center gap-3">
            <Button variant="secondary" icon={<FileText size={15} />} onClick={() => navigate('/jds')}>
              Post New JD
            </Button>
            <Button icon={<Plus size={15} />} onClick={() => navigate('/analyses/new')}>
              Evaluate Candidate
            </Button>
          </div>
        }
      />

      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        <StatCard label="Active Positions" value={jds.length} icon={<Briefcase size={20} />} color="indigo" />
        <StatCard label="Resumes in Pool" value={resumes.length} icon={<FileText size={20} />} color="blue" />
        <StatCard label="Evaluations Run" value={analyses.length} icon={<Users size={20} />} color="violet" />
        <StatCard label="Strong Matches" value={strongMatchesCount} icon={<CheckCircle2 size={20} />} color="emerald" />
        <StatCard
          label="Average Score"
          value={avgScore > 0 ? `${avgScore.toFixed(1)}/10` : '—'}
          icon={<TrendingUp size={20} />}
          color="amber"
        />
      </div>

      {/* Active Positions */}
      <div className="mb-10">
        <SectionHeader
          title="Active Positions & Pipelines"
          subtitle="Compare candidate pools and review evidence rankings for each role"
          action={
            <Button variant="ghost" size="sm" onClick={() => navigate('/jds')}>
              Manage All JDs
            </Button>
          }
        />

        {jds.length === 0 ? (
          <Card className="p-10">
            <EmptyState
              icon={<Briefcase size={28} />}
              title="No Job Descriptions Created"
              description="Create a job description to start evaluating and comparing applicants against structured requirements."
              action={
                <Button icon={<Plus size={15} />} onClick={() => navigate('/jds')}>
                  Create First Job Description
                </Button>
              }
            />
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {jds.map(jd => {
              const jdAnalyses = analyses.filter(a => a.job_description_id === jd.id);
              const topScore = jdAnalyses.length > 0
                ? Math.max(...jdAnalyses.map(a => a.overall_score))
                : null;
              const strongCandidates = jdAnalyses.filter(a => a.overall_score >= 7.5).length;

              return (
                <Card key={jd.id} className="p-5 flex flex-col">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-white text-sm truncate">{jd.title}</h3>
                      <p className="text-xs text-zinc-500 mt-0.5">{jd.company || 'Internal Role'}</p>
                    </div>
                    <Badge variant="neutral" size="xs">
                      {jd.structured_requirements?.length || 0} reqs
                    </Badge>
                  </div>

                  <div className="bg-zinc-800/40 border border-zinc-700/30 rounded-xl p-3 mb-4 space-y-2 text-xs">
                    <div className="flex justify-between text-zinc-400">
                      <span>Candidates screened</span>
                      <span className="font-semibold text-zinc-200">{jdAnalyses.length}</span>
                    </div>
                    {topScore !== null && (
                      <div className="flex justify-between text-zinc-400">
                        <span>Top candidate score</span>
                        <ScoreChip score={topScore} />
                      </div>
                    )}
                    {strongCandidates > 0 && (
                      <div className="flex justify-between text-zinc-400">
                        <span>Strong matches</span>
                        <span className="font-semibold text-emerald-400">{strongCandidates}</span>
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-zinc-800/60 flex items-center gap-2 mt-auto">
                    <Button
                      size="xs"
                      variant="secondary"
                      icon={<Scale size={12} />}
                      onClick={() => navigate(`/compare/${jd.id}`)}
                      disabled={jdAnalyses.length === 0}
                      className="flex-1"
                    >
                      Compare ({jdAnalyses.length})
                    </Button>
                    <Button
                      size="xs"
                      icon={<Plus size={12} />}
                      onClick={() => navigate(`/analyses/new?jd_id=${jd.id}`)}
                    >
                      Evaluate
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Recent Evaluations Table */}
      <div>
        <SectionHeader
          title="Recent Candidate Evaluations"
          subtitle="Latest evidence-backed screenings across all postings"
          action={
            analyses.length > 0 ? (
              <Button variant="ghost" size="sm" iconRight={<ArrowRight size={13} />}
                onClick={() => navigate('/analyses')}>
                All Analyses ({analyses.length})
              </Button>
            ) : undefined
          }
        />

        {analyses.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-zinc-500 text-sm">No evaluations completed yet.</p>
            <Button
              className="mt-4"
              size="sm"
              icon={<Plus size={14} />}
              onClick={() => navigate('/analyses/new')}
            >
              Evaluate First Candidate
            </Button>
          </Card>
        ) : (
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm min-w-[640px]">
                <thead className="bg-zinc-800/40 border-b border-zinc-700/40">
                  <tr>
                    <th className="py-3.5 px-5 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Candidate</th>
                    <th className="py-3.5 px-5 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Role</th>
                    <th className="py-3.5 px-5 text-xs font-semibold text-zinc-400 uppercase tracking-wider text-center">Score</th>
                    <th className="py-3.5 px-5 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Matches</th>
                    <th className="py-3.5 px-5 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Confidence</th>
                    <th className="py-3.5 px-5 text-xs font-semibold text-zinc-400 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/40">
                  {analyses.slice(0, 10).map(a => (
                    <tr key={a.id} className="hover:bg-zinc-800/20 transition-colors">
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 border border-indigo-500/20 text-indigo-300 flex items-center justify-center text-xs font-bold shrink-0">
                            {a.candidate_name.charAt(0)}
                          </div>
                          <span className="font-medium text-zinc-100 truncate max-w-[140px]">{a.candidate_name}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-5">
                        <div className="font-medium text-zinc-200 truncate max-w-[180px] text-xs">{a.job_title}</div>
                        <div className="text-xs text-zinc-500 truncate">{a.company_name}</div>
                      </td>
                      <td className="py-3.5 px-5 text-center">
                        <ScoreChip score={a.overall_score} />
                      </td>
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-3 text-xs">
                          <span className="text-emerald-400 font-medium">{a.direct_findings.length} direct</span>
                          <span className="text-blue-400">{a.indirect_findings.length} indirect</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-5">
                        <Badge
                          variant={a.score_breakdown.analysis_confidence.toLowerCase() === 'high' ? 'success' : 'neutral'}
                          size="xs"
                        >
                          {a.score_breakdown.analysis_confidence}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        <Button
                          size="xs"
                          variant="ghost"
                          onClick={() => navigate(`/analyses/${a.id}`)}
                          className="text-indigo-400 hover:text-indigo-300"
                        >
                          View Report →
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
