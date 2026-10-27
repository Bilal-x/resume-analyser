import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout, PageHeader } from '../components/Layout';
import { Button, Card, EmptyState, Badge, Skeleton, Input, Textarea } from '../components/ui';
import { jdsApi, type JobDescriptionResponse } from '../lib/api';
import { Briefcase, Plus, Trash2, Calendar, ChevronDown, ChevronUp, X } from 'lucide-react';

function CreateJDModal({ onClose, onCreate }: { onClose: () => void; onCreate: (jd: JobDescriptionResponse) => void }) {
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) { setError('Job description is required.'); return; }
    setLoading(true);
    try {
      const jd = await jdsApi.create({ title, company, description });
      onCreate(jd);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create JD.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Add Job Description</h2>
          <button onClick={onClose} className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 text-sm">{error}</div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Input
              label="Job Title *"
              placeholder="e.g. Senior Backend Engineer"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
            />
            <Input
              label="Company"
              placeholder="e.g. Acme Corp"
              value={company}
              onChange={e => setCompany(e.target.value)}
            />
          </div>

          <Textarea
            label="Job Description *"
            placeholder="Paste the complete job description here..."
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={12}
            required
          />

          <p className="text-xs text-gray-500">
            The description will be automatically analyzed to extract structured requirements.
          </p>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={onClose} className="flex-1">Cancel</Button>
            <Button type="submit" loading={loading} className="flex-1">
              {loading ? 'Analyzing...' : 'Create & Analyze'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

function JDCard({ jd, onDelete, onAnalyze }: {
  jd: JobDescriptionResponse;
  onDelete: () => void;
  onAnalyze: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const mandatoryCount = jd.structured_requirements.filter(r => r.importance === 'Mandatory').length;
  const preferredCount = jd.structured_requirements.filter(r => r.importance !== 'Mandatory').length;

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4 flex-1 min-w-0">
          <div className="w-12 h-12 rounded-xl bg-violet-500/15 flex items-center justify-center flex-shrink-0">
            <Briefcase size={20} className="text-violet-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-semibold text-lg">{jd.title}</h3>
            <p className="text-gray-400 text-sm">{jd.company}</p>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <Badge variant="danger">{mandatoryCount} mandatory</Badge>
              <Badge variant="neutral">{preferredCount} preferred</Badge>
              <span className="flex items-center gap-1 text-xs text-gray-500">
                <Calendar size={11} />
                {new Date(jd.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Button size="sm" onClick={onAnalyze}>Analyze Candidate</Button>
          <Button size="sm" variant="ghost" onClick={() => setExpanded(!expanded)} icon={expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}>
            {expanded ? 'Hide' : 'View'}
          </Button>
          <Button size="sm" variant="danger" icon={<Trash2 size={14} />} onClick={onDelete}>
            Delete
          </Button>
        </div>
      </div>

      {expanded && (
        <div className="mt-5 pt-5 border-t border-white/10 space-y-4">
          {/* Requirements list */}
          <div>
            <h4 className="text-sm font-semibold text-gray-300 mb-3">Extracted Requirements ({jd.structured_requirements.length})</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {jd.structured_requirements.map((req, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <Badge variant={req.importance === 'Mandatory' ? 'danger' : 'neutral'} size="sm">
                    {req.importance === 'Mandatory' ? 'M' : 'P'}
                  </Badge>
                  <span className="text-gray-300">{req.skill}</span>
                  <span className="text-gray-600 text-xs">{req.category}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Raw description preview */}
          <div>
            <h4 className="text-sm font-semibold text-gray-300 mb-2">Description Preview</h4>
            <p className="text-xs text-gray-500 bg-gray-800/50 rounded-xl p-3 max-h-32 overflow-y-auto whitespace-pre-wrap">
              {jd.description.slice(0, 600)}{jd.description.length > 600 ? '...' : ''}
            </p>
          </div>
        </div>
      )}
    </Card>
  );
}

export default function JDsPage() {
  const navigate = useNavigate();
  const [jds, setJds] = useState<JobDescriptionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      const data = await jdsApi.list();
      setJds(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this job description and all its analyses?')) return;
    try {
      await jdsApi.delete(id);
      setJds(prev => prev.filter(j => j.id !== id));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Delete failed.');
    }
  };

  return (
    <AppLayout>
      <PageHeader
        title="Job Descriptions"
        subtitle="Manage and analyze JDs"
        actions={
          <Button icon={<Plus size={16} />} onClick={() => setShowCreate(true)}>
            Add JD
          </Button>
        }
      />

      {error && (
        <div className="p-3 mb-4 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {[1, 2].map(i => <Skeleton key={i} className="h-28" />)}
        </div>
      ) : jds.length === 0 ? (
        <EmptyState
          icon={<Briefcase size={32} />}
          title="No job descriptions yet"
          description="Create a JD to start analyzing candidates against it."
          action={
            <Button icon={<Plus size={16} />} onClick={() => setShowCreate(true)}>
              Add your first JD
            </Button>
          }
        />
      ) : (
        <div className="space-y-6">
          {jds.map(jd => (
            <JDCard
              key={jd.id}
              jd={jd}
              onDelete={() => handleDelete(jd.id)}
              onAnalyze={() => navigate(`/analyses/new?jd_id=${jd.id}`)}
            />
          ))}
        </div>
      )}

      {showCreate && (
        <CreateJDModal
          onClose={() => setShowCreate(false)}
          onCreate={jd => setJds(prev => [jd, ...prev])}
        />
      )}
    </AppLayout>
  );
}
