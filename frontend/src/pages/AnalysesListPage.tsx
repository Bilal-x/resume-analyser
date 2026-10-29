import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout, PageHeader } from '../components/Layout';
import { Button, Card, Badge, ScoreRing, EmptyState, Skeleton, Input } from '../components/ui';
import { analysesApi, type AnalysisResponse } from '../lib/api';
import {
  BarChart3, Plus, Search, Trash2, ArrowRight,
  CheckCircle2, FolderOpen, SlidersHorizontal
} from 'lucide-react';

export default function AnalysesListPage() {
  const navigate = useNavigate();
  const [analyses, setAnalyses] = useState<AnalysisResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterTier, setFilterTier] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'score'>('date');

  const loadAnalyses = async () => {
    try {
      const data = await analysesApi.list();
      setAnalyses(data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalyses();
  }, []);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm('Delete this analysis permanently? This cannot be undone.')) return;
    try {
      await analysesApi.delete(id);
      setAnalyses(prev => prev.filter(a => a.id !== id));
    } catch {
      alert('Failed to delete analysis');
    }
  };

  const filtered = analyses
    .filter(a => {
      const matchesSearch =
        a.candidate_name.toLowerCase().includes(search.toLowerCase()) ||
        a.job_title.toLowerCase().includes(search.toLowerCase()) ||
        a.company_name.toLowerCase().includes(search.toLowerCase());

      if (!matchesSearch) return false;

      if (filterTier === 'very_strong') return a.overall_score >= 9.0;
      if (filterTier === 'strong') return a.overall_score >= 7.5 && a.overall_score < 9.0;
      if (filterTier === 'moderate') return a.overall_score >= 6.0 && a.overall_score < 7.5;
      if (filterTier === 'partial') return a.overall_score < 6.0;

      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'score') return b.overall_score - a.overall_score;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

  if (loading) {
    return (
      <AppLayout>
        <div className="space-y-4 animate-fade-in">
          <Skeleton className="h-10 w-64" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <Skeleton className="h-52" />
            <Skeleton className="h-52" />
            <Skeleton className="h-52" />
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <PageHeader
        title="Analysis History"
        subtitle={`${analyses.length} evaluation${analyses.length !== 1 ? 's' : ''} — review evidence reports, scores, and improvement plans.`}
        actions={
          <Button icon={<Plus size={15} />} onClick={() => navigate('/analyses/new')}>
            New Analysis
          </Button>
        }
      />

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-6">
        <div className="flex-1 max-w-md">
          <Input
            icon={<Search size={15} />}
            placeholder="Search by candidate, role, or company..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-zinc-500">
            <SlidersHorizontal size={14} />
          </div>
          <select
            value={filterTier}
            onChange={e => setFilterTier(e.target.value)}
            className="bg-zinc-900/70 border border-zinc-700/50 rounded-xl px-3 py-2.5 text-xs text-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all cursor-pointer"
          >
            <option value="all">All Scores</option>
            <option value="very_strong">Very Strong (≥ 9.0)</option>
            <option value="strong">Strong (7.5 – 8.9)</option>
            <option value="moderate">Moderate (6.0 – 7.4)</option>
            <option value="partial">Partial (&lt; 6.0)</option>
          </select>

          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as 'date' | 'score')}
            className="bg-zinc-900/70 border border-zinc-700/50 rounded-xl px-3 py-2.5 text-xs text-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all cursor-pointer"
          >
            <option value="date">Latest First</option>
            <option value="score">Highest Score</option>
          </select>
        </div>
      </div>

      {/* Count label */}
      {analyses.length > 0 && (
        <p className="text-xs text-zinc-500 mb-4">
          Showing {filtered.length} of {analyses.length} analyses
        </p>
      )}

      {filtered.length === 0 ? (
        <Card className="p-12">
          <EmptyState
            icon={<BarChart3 size={28} />}
            title="No analyses found"
            description={
              search
                ? `No analyses match "${search}". Try a different search term.`
                : 'Run your first resume analysis against a job description to get started.'
            }
            action={
              <Button icon={<Plus size={15} />} onClick={() => navigate('/analyses/new')}>
                Start Analysis
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(a => (
            <Card
              key={a.id}
              hover
              onClick={() => navigate(`/analyses/${a.id}`)}
              className="p-5 flex flex-col"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-zinc-100 text-sm truncate">{a.candidate_name}</h3>
                  <p className="text-xs text-indigo-400 font-medium truncate mt-0.5">{a.job_title}</p>
                  <p className="text-xs text-zinc-500 truncate">{a.company_name}</p>
                </div>
                <ScoreRing score={a.overall_score} size={66} strokeWidth={5} />
              </div>

              <div className="flex flex-wrap gap-1.5 my-3">
                <Badge
                  variant={a.overall_score >= 7.5 ? 'success' : a.overall_score >= 6.0 ? 'warning' : 'danger'}
                  size="xs"
                >
                  {a.score_breakdown.score_interpretation}
                </Badge>
                <Badge variant="neutral" size="xs">
                  {a.score_breakdown.analysis_confidence} conf.
                </Badge>
              </div>

              <div className="bg-zinc-800/40 border border-zinc-700/30 rounded-xl p-3 space-y-1.5 text-xs text-zinc-400 mb-4">
                <div className="flex justify-between">
                  <span className="flex items-center gap-1 text-emerald-400">
                    <CheckCircle2 size={11} /> Direct Evidence:
                  </span>
                  <span className="text-zinc-200 font-medium">{a.direct_findings.length} skills</span>
                </div>
                <div className="flex justify-between">
                  <span className="flex items-center gap-1 text-blue-400">
                    <Search size={11} /> Indirect Discoveries:
                  </span>
                  <span className="text-zinc-200 font-medium">{a.indirect_findings.length} skills</span>
                </div>
                <div className="flex justify-between">
                  <span className="flex items-center gap-1 text-amber-400">
                    <FolderOpen size={11} /> Projects Evaluated:
                  </span>
                  <span className="text-zinc-200 font-medium">{a.project_analyses.length}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-zinc-800/60 flex items-center justify-between mt-auto">
                <span className="text-xs text-zinc-600">
                  {new Date(a.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={e => handleDelete(e, a.id)}
                    className="text-zinc-600 hover:text-red-400 transition-colors p-1 rounded-lg hover:bg-red-500/8"
                    title="Delete analysis"
                  >
                    <Trash2 size={13} />
                  </button>
                  <span className="text-xs text-indigo-400 font-semibold flex items-center gap-1">
                    Details <ArrowRight size={11} />
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </AppLayout>
  );
}
