import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout, PageHeader } from '../components/Layout';
import { Button, Card, EmptyState, Badge, Skeleton, Input, Textarea, Alert } from '../components/ui';
import { jdsApi, type JobDescriptionResponse } from '../lib/api';
import { Briefcase, Plus, Trash2, Calendar, ChevronDown, ChevronUp, X, Sparkles, AlertCircle } from 'lucide-react';

function CreateJDModal({ onClose, onCreate }: {
  onClose: () => void;
  onCreate: (jd: JobDescriptionResponse) => void;
}) {
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) { setError('Job description text is required.'); return; }
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/70 backdrop-blur-md" onClick={onClose}>
      <Card
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto p-8"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-white">Add Job Description</h2>
            <p className="text-xs text-zinc-500 mt-0.5">Requirements will be automatically extracted by AI</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800/60 transition-colors"
          >
            <X size={17} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <Alert variant="danger" icon={<AlertCircle size={14} />}>{error}</Alert>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Input
              id="jd-title"
              label="Job Title"
              placeholder="e.g. Senior Backend Engineer"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
            />
            <Input
              id="jd-company"
              label="Company"
              placeholder="e.g. Acme Corp"
              value={company}
              onChange={e => setCompany(e.target.value)}
            />
          </div>

          <Textarea
            id="jd-description"
            label="Job Description"
            placeholder="Paste the complete job description here. Include responsibilities, requirements, and qualifications for best results..."
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={12}
            hint="The more complete the JD, the better the analysis quality."
            required
          />

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" loading={loading} icon={<Sparkles size={15} />} className="flex-1">
              {loading ? 'Analyzing JD...' : 'Create & Extract Requirements'}
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
          <div className="w-12 h-12 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center shrink-0">
            <Briefcase size={20} className="text-violet-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-zinc-100 font-semibold">{jd.title}</h3>
            {jd.company && <p className="text-zinc-500 text-sm mt-0.5">{jd.company}</p>}
            <div className="flex flex-wrap items-center gap-2 mt-2.5">
              <Badge variant="danger" size="xs">{mandatoryCount} mandatory</Badge>
              <Badge variant="neutral" size="xs">{preferredCount} preferred</Badge>
              <span className="flex items-center gap-1 text-xs text-zinc-600">
                <Calendar size={11} />
                {new Date(jd.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
          <Button size="sm" icon={<Sparkles size={13} />} onClick={onAnalyze}>
            Analyze Candidate
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setExpanded(!expanded)}
            iconRight={expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          >
            {expanded ? 'Hide' : 'Requirements'}
          </Button>
          <Button size="sm" variant="danger" icon={<Trash2 size={13} />} onClick={onDelete}>
            Delete
          </Button>
        </div>
      </div>

      {expanded && (
        <div className="mt-5 pt-5 border-t border-zinc-800/60 space-y-5">
          <div>
            <h4 className="text-sm font-semibold text-zinc-300 mb-3">
              Extracted Requirements
              <span className="text-zinc-500 font-normal ml-2">({jd.structured_requirements.length} total)</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {jd.structured_requirements.map((req, i) => (
                <div key={i} className="flex items-center gap-2 text-sm py-1">
                  <Badge
                    variant={req.importance === 'Mandatory' ? 'danger' : 'neutral'}
                    size="xs"
                  >
                    {req.importance === 'Mandatory' ? 'M' : 'P'}
                  </Badge>
                  <span className="text-zinc-300">{req.skill}</span>
                  <span className="text-zinc-600 text-xs truncate">{req.category}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-zinc-300 mb-2">Description Preview</h4>
            <div className="text-xs text-zinc-500 bg-zinc-800/30 border border-zinc-700/30 rounded-xl p-4 max-h-36 overflow-y-auto whitespace-pre-wrap leading-relaxed font-mono">
              {jd.description.slice(0, 800)}{jd.description.length > 800 ? '...' : ''}
            </div>
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

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"? This will also remove associated analyses.`)) return;
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
        subtitle="Create and manage job descriptions. AI will extract structured requirements automatically."
        actions={
          <Button icon={<Plus size={15} />} onClick={() => setShowCreate(true)}>
            Add Job Description
          </Button>
        }
      />

      {error && (
        <Alert variant="danger" icon={<AlertCircle size={14} />} className="mb-4">
          {error}
        </Alert>
      )}

      {loading ? (
        <div className="space-y-4">
          {[1, 2].map(i => <Skeleton key={i} className="h-32" />)}
        </div>
      ) : jds.length === 0 ? (
        <EmptyState
          icon={<Briefcase size={28} />}
          title="No job descriptions yet"
          description="Create a JD by pasting the requirements text. AI will automatically extract and structure the requirements."
          action={
            <Button icon={<Plus size={15} />} onClick={() => setShowCreate(true)}>
              Add your first JD
            </Button>
          }
        />
      ) : (
        <div className="space-y-5">
          <p className="text-xs text-zinc-500">{jds.length} job description{jds.length !== 1 ? 's' : ''}</p>
          {jds.map(jd => (
            <JDCard
              key={jd.id}
              jd={jd}
              onDelete={() => handleDelete(jd.id, jd.title)}
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
