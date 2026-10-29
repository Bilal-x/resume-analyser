import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppLayout, PageHeader } from '../components/Layout';
import { Button, Card, Badge, Skeleton, EmptyState } from '../components/ui';
import { analysesApi, type CandidateComparisonResponse } from '../lib/api';
import {
  ArrowLeft, Download, Plus, Scale,
  CheckCircle2, FolderOpen
} from 'lucide-react';

export default function CandidateComparisonPage() {
  const { jdId } = useParams<{ jdId: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<CandidateComparisonResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortBy, setSortBy] = useState<'overall' | 'mandatory' | 'project'>('overall');

  useEffect(() => {
    if (!jdId) return;
    analysesApi.compare(jdId)
      .then(res => setData(res))
      .catch(err => setError(err.message || 'Failed to load candidate comparison.'))
      .finally(() => setLoading(false));
  }, [jdId]);

  const handleExportCsv = () => {
    if (!data || data.candidates.length === 0) return;

    const headers = [
      'Candidate Name',
      'File Name',
      'Overall Match Score (/10)',
      'Mandatory Coverage (%)',
      'Direct Matches',
      'Indirect Discoveries',
      'Project Depth Score',
      'Experience Score',
      'Analysis Confidence',
      'Top Strengths',
      'Key Gaps'
    ];

    const rows = data.candidates.map(c => [
      `"${c.candidate_name}"`,
      `"${c.file_name}"`,
      c.overall_score.toFixed(1),
      `${c.mandatory_coverage_percent}%`,
      c.direct_matches_count,
      c.indirect_matches_count,
      c.project_depth_score.toFixed(1),
      c.experience_score.toFixed(1),
      c.confidence,
      `"${c.top_strengths.join('; ')}"`,
      `"${c.key_gaps.join('; ')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Candidate_Comparison_${data.job_title.replace(/\s+/g, '_')}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="space-y-4">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-40" />
          <Skeleton className="h-64" />
        </div>
      </AppLayout>
    );
  }

  if (error || !data) {
    return (
      <AppLayout>
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={16} />Back
          </button>
        </div>
        <Card className="p-8">
          <EmptyState
            icon={<Scale size={32} />}
            title="Unable to Load Comparison"
            description={error || 'No candidate analyses available for this job opening.'}
            action={
              <Button icon={<Plus size={16} />} onClick={() => navigate(`/analyses/new?jd_id=${jdId}`)}>
                Evaluate Candidate
              </Button>
            }
          />
        </Card>
      </AppLayout>
    );
  }

  const sortedCandidates = [...data.candidates].sort((a, b) => {
    if (sortBy === 'mandatory') return b.mandatory_coverage_percent - a.mandatory_coverage_percent;
    if (sortBy === 'project') return b.project_depth_score - a.project_depth_score;
    return b.overall_score - a.overall_score;
  });

  return (
    <AppLayout>
      {/* Back button */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={16} />Back
        </button>

        <div className="flex items-center gap-3">
          <Button
            size="sm"
            variant="secondary"
            icon={<Download size={14} />}
            onClick={handleExportCsv}
            disabled={data.candidates.length === 0}
          >
            Export Comparison CSV
          </Button>
          <Button
            size="sm"
            icon={<Plus size={14} />}
            onClick={() => navigate(`/analyses/new?jd_id=${jdId}`)}
          >
            Evaluate Another Candidate
          </Button>
        </div>
      </div>

      <PageHeader
        title={`Candidate Comparison: ${data.job_title}`}
        subtitle={`Side-by-side evidence analysis for ${data.company || 'Role'} • ${data.candidates.length} candidates evaluated under identical scoring weights`}
      />

      {data.candidates.length === 0 ? (
        <Card className="p-12">
          <EmptyState
            icon={<Scale size={32} />}
            title="No Candidates Evaluated Yet"
            description="Run an AI resume evaluation against this job description to populate candidate comparison metrics."
            action={
              <Button icon={<Plus size={16} />} onClick={() => navigate(`/analyses/new?jd_id=${jdId}`)}>
                Evaluate First Candidate
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="space-y-8">
          {/* Sorting Controls */}
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-2 text-xs">
              <span className="text-gray-400">Sort candidates by:</span>
              <button
                onClick={() => setSortBy('overall')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  sortBy === 'overall' ? 'bg-indigo-500 text-white' : 'bg-white/5 text-gray-400 hover:text-white'
                }`}
              >
                Overall Score
              </button>
              <button
                onClick={() => setSortBy('mandatory')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  sortBy === 'mandatory' ? 'bg-indigo-500 text-white' : 'bg-white/5 text-gray-400 hover:text-white'
                }`}
              >
                Mandatory Skills Coverage
              </button>
              <button
                onClick={() => setSortBy('project')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  sortBy === 'project' ? 'bg-indigo-500 text-white' : 'bg-white/5 text-gray-400 hover:text-white'
                }`}
              >
                Project Depth
              </button>
            </div>
          </div>

          {/* Candidates Comparison Leaderboard */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {sortedCandidates.map((c, idx) => (
              <Card
                key={c.analysis_id}
                className={`p-6 flex flex-col justify-between border-t-4 ${
                  c.overall_score >= 7.5
                    ? 'border-t-emerald-500'
                    : c.overall_score >= 6.0
                    ? 'border-t-amber-500'
                    : 'border-t-rose-500'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-400">#{idx + 1}</span>
                        <h3 className="font-bold text-white text-base truncate max-w-[170px]">{c.candidate_name}</h3>
                      </div>
                      <p className="text-xs text-gray-400 truncate mt-0.5">{c.file_name}</p>
                    </div>

                    <div className="text-right">
                      <div className="text-2xl font-bold text-white">{c.overall_score.toFixed(1)}</div>
                      <div className="text-[10px] text-gray-400">out of 10</div>
                    </div>
                  </div>

                  {/* Core Metrics Grid */}
                  <div className="grid grid-cols-2 gap-2 text-xs mb-4">
                    <div className="bg-white/5 p-2.5 rounded-xl">
                      <div className="text-gray-400 text-[11px]">Mandatory Match</div>
                      <div className="text-emerald-400 font-bold mt-0.5">{c.mandatory_coverage_percent}%</div>
                    </div>
                    <div className="bg-white/5 p-2.5 rounded-xl">
                      <div className="text-gray-400 text-[11px]">Project Depth</div>
                      <div className="text-indigo-400 font-bold mt-0.5">{c.project_depth_score.toFixed(1)}/10</div>
                    </div>
                    <div className="bg-white/5 p-2.5 rounded-xl">
                      <div className="text-gray-400 text-[11px]">Direct Skills</div>
                      <div className="text-white font-medium mt-0.5">{c.direct_matches_count} verified</div>
                    </div>
                    <div className="bg-white/5 p-2.5 rounded-xl">
                      <div className="text-gray-400 text-[11px]">Indirect Skills</div>
                      <div className="text-blue-400 font-medium mt-0.5">{c.indirect_matches_count} discovered</div>
                    </div>
                  </div>

                  {/* Top Strengths */}
                  {c.top_strengths.length > 0 && (
                    <div className="mb-3">
                      <p className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1 mb-1">
                        <CheckCircle2 size={11} /> Top Strengths
                      </p>
                      <ul className="text-xs text-gray-300 space-y-1">
                        {c.top_strengths.slice(0, 2).map((s, i) => (
                          <li key={i} className="truncate">• {s}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Key Gaps */}
                  {c.key_gaps.length > 0 && (
                    <div className="mb-4">
                      <p className="text-[11px] font-semibold text-amber-400 flex items-center gap-1 mb-1">
                        <FolderOpen size={11} /> Key Evidence Gaps
                      </p>
                      <ul className="text-xs text-gray-400 space-y-1">
                        {c.key_gaps.slice(0, 2).map((g, i) => (
                          <li key={i} className="truncate">• {g}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                  <Badge variant={c.confidence.toLowerCase() === 'high' ? 'success' : 'neutral'}>
                    {c.confidence} Confidence
                  </Badge>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => navigate(`/analyses/${c.analysis_id}`)}
                    className="text-xs text-indigo-400 hover:text-indigo-300"
                  >
                    View Dossier →
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          {/* Requirements Cross-Matrix Table */}
          {data.requirements_cross_matrix.length > 0 && (
            <Card className="p-6">
              <div className="mb-4">
                <h3 className="font-bold text-white text-base">Requirements Cross-Matrix</h3>
                <p className="text-xs text-gray-400">Compare candidate evidence coverage across key job requirements</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-white/5 border-b border-white/10 uppercase tracking-wider text-gray-400">
                    <tr>
                      <th className="py-3 px-3 font-semibold">Requirement</th>
                      <th className="py-3 px-3 font-semibold">Priority</th>
                      {data.candidates.map(c => (
                        <th key={c.analysis_id} className="py-3 px-3 font-semibold text-center truncate max-w-[120px]">
                          {c.candidate_name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {data.requirements_cross_matrix.map((row, i) => (
                      <tr key={i} className="hover:bg-white/5 transition-colors">
                        <td className="py-2.5 px-3 font-medium text-white">{row.requirement}</td>
                        <td className="py-2.5 px-3">
                          <Badge variant={row.importance === 'Mandatory' ? 'danger' : 'neutral'} size="sm">
                            {row.importance}
                          </Badge>
                        </td>
                        {data.candidates.map(c => {
                          const status = row[c.candidate_name] || 'Not evidenced';
                          return (
                            <td key={c.analysis_id} className="py-2.5 px-3 text-center">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                                status === 'Supported'
                                  ? 'bg-emerald-500/20 text-emerald-400'
                                  : status === 'Project-derived' || status === 'Transferable'
                                  ? 'bg-blue-500/20 text-blue-400'
                                  : 'bg-white/5 text-gray-500'
                              }`}>
                                {status}
                              </span>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>
      )}
    </AppLayout>
  );
}
