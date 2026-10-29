import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout, PageHeader } from '../components/Layout';
import { Button, Card, EmptyState, Badge, Skeleton, Alert } from '../components/ui';
import { resumesApi, type ResumeResponse } from '../lib/api';
import { Upload, FileText, Trash2, CheckCircle2, AlertCircle, Calendar, Sparkles, X } from 'lucide-react';
import { clsx } from 'clsx';

export default function ResumesPage() {
  const navigate = useNavigate();
  const [resumes, setResumes] = useState<ResumeResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');

  const load = async () => {
    try {
      const data = await resumesApi.list();
      setResumes(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load resumes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleFileUpload = async (file: File) => {
    const allowed = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
    ];
    if (!allowed.includes(file.type)) {
      setError('Only PDF, DOCX, and TXT files are supported.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must not exceed 10 MB.');
      return;
    }
    setError('');
    setUploading(true);
    try {
      await resumesApi.upload(file);
      setUploadSuccess(`"${file.name}" uploaded and parsed successfully!`);
      setTimeout(() => setUploadSuccess(''), 4000);
      load();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
      await resumesApi.delete(id);
      setResumes(prev => prev.filter(r => r.id !== id));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Delete failed.');
    }
  };

  return (
    <AppLayout>
      <PageHeader
        title="Resumes"
        subtitle="Upload and manage resume files for AI analysis"
      />

      {/* Upload Zone */}
      <Card className="mb-6">
        <div
          onDrop={handleDrop}
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onClick={() => document.getElementById('resume-file-input')?.click()}
          className={clsx(
            'p-12 text-center rounded-xl border-2 border-dashed cursor-pointer',
            'transition-all duration-200',
            dragOver
              ? 'border-indigo-500/60 bg-indigo-500/6'
              : 'border-zinc-700/50 hover:border-indigo-500/40 hover:bg-indigo-500/4'
          )}
        >
          <input
            id="resume-file-input"
            type="file"
            accept=".pdf,.docx,.txt"
            className="hidden"
            onChange={e => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
          />

          {uploading ? (
            <div className="flex flex-col items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center">
                <svg className="animate-spin h-7 w-7 text-indigo-400" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-indigo-300">Uploading and parsing...</p>
                <p className="text-xs text-zinc-500 mt-1">Extracting skills, projects, and experience</p>
              </div>
            </div>
          ) : (
            <>
              <div className={clsx(
                'w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-all duration-200',
                dragOver
                  ? 'bg-indigo-500/20 border-indigo-500/30'
                  : 'bg-zinc-800/60 border-zinc-700/40',
                'border'
              )}>
                <Upload size={24} className={dragOver ? 'text-indigo-400' : 'text-zinc-400'} />
              </div>
              <h3 className="text-zinc-100 font-semibold mb-1.5">
                {dragOver ? 'Release to upload' : 'Drop your resume here'}
              </h3>
              <p className="text-zinc-500 text-sm">or click to browse — PDF, DOCX, or TXT up to 10 MB</p>
              <div className="flex items-center justify-center gap-2 mt-4">
                {['PDF', 'DOCX', 'TXT'].map(type => (
                  <span key={type} className="px-2 py-0.5 rounded text-xs bg-zinc-800/60 border border-zinc-700/40 text-zinc-400 font-medium">
                    {type}
                  </span>
                ))}
              </div>
            </>
          )}
        </div>
      </Card>

      {/* Messages */}
      {error && (
        <Alert variant="danger" icon={<AlertCircle size={15} />} className="mb-4">
          <div className="flex items-center justify-between gap-2">
            {error}
            <button onClick={() => setError('')} className="ml-auto shrink-0 hover:text-red-200 transition-colors">
              <X size={14} />
            </button>
          </div>
        </Alert>
      )}
      {uploadSuccess && (
        <Alert variant="success" icon={<CheckCircle2 size={15} />} className="mb-4">
          {uploadSuccess}
        </Alert>
      )}

      {/* Resume List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-24" />)}
        </div>
      ) : resumes.length === 0 ? (
        <EmptyState
          icon={<FileText size={28} />}
          title="No resumes yet"
          description="Upload a resume above. Our AI parser will automatically extract skills, projects, work history, and more."
        />
      ) : (
        <div className="space-y-3">
          <p className="text-xs text-zinc-500 mb-1">{resumes.length} resume{resumes.length !== 1 ? 's' : ''} stored</p>
          {resumes.map(r => {
            const techSkills = (r.structured_data?.technical_skills as string[]) || [];
            const fullName = (r.structured_data?.full_name as string) || '';

            return (
              <Card key={r.id} className="p-5">
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
                    <FileText size={20} className="text-indigo-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-zinc-100 font-semibold text-sm truncate">{r.file_name}</h3>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <Badge variant="info" size="xs">{r.file_type}</Badge>
                      {fullName && <span className="text-xs text-zinc-500">{fullName}</span>}
                      <span className="flex items-center gap-1 text-xs text-zinc-600">
                        <Calendar size={11} />
                        {new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                    {techSkills.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {techSkills.slice(0, 6).map(s => (
                          <span key={s} className="px-2 py-0.5 rounded-lg text-[11px] bg-zinc-800/60 border border-zinc-700/40 text-zinc-400">
                            {s}
                          </span>
                        ))}
                        {techSkills.length > 6 && (
                          <span className="px-2 py-0.5 rounded-lg text-[11px] text-zinc-600">+{techSkills.length - 6} more</span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      size="sm"
                      variant="secondary"
                      icon={<Sparkles size={13} />}
                      onClick={() => navigate(`/analyses/new?resume_id=${r.id}`)}
                    >
                      Analyze
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      icon={<Trash2 size={13} />}
                      onClick={() => handleDelete(r.id, r.file_name)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </AppLayout>
  );
}
