import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout, PageHeader } from '../components/Layout';
import { Button, Card, EmptyState, Badge, Skeleton } from '../components/ui';
import { resumesApi, type ResumeResponse } from '../lib/api';
import { Upload, FileText, Trash2, CheckCircle2, AlertCircle, Calendar } from 'lucide-react';

export default function ResumesPage() {
  const navigate = useNavigate();
  const [resumes, setResumes] = useState<ResumeResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
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
    if (!['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'].includes(file.type)) {
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
      setUploadSuccess(`"${file.name}" uploaded successfully!`);
      setTimeout(() => setUploadSuccess(''), 3000);
      load();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this resume? This cannot be undone.')) return;
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
        subtitle="Upload and manage your resume files"
      />

      {/* Upload zone */}
      <Card className="mb-8">
        <div
          onDrop={handleDrop}
          onDragOver={e => e.preventDefault()}
          className="p-10 text-center border-2 border-dashed border-white/10 rounded-2xl hover:border-indigo-500/40 transition-colors duration-200 cursor-pointer"
          onClick={() => document.getElementById('resume-file-input')?.click()}
        >
          <input
            id="resume-file-input"
            type="file"
            accept=".pdf,.docx,.txt"
            className="hidden"
            onChange={e => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
          />
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/15 flex items-center justify-center mx-auto mb-4">
            <Upload size={24} className="text-indigo-400" />
          </div>
          <h3 className="text-white font-semibold mb-1">Drop your resume here</h3>
          <p className="text-gray-400 text-sm">or click to browse — PDF, DOCX, or TXT up to 10 MB</p>

          {uploading && (
            <div className="mt-4 flex items-center justify-center gap-2 text-indigo-400 text-sm">
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Uploading and parsing...
            </div>
          )}
        </div>
      </Card>

      {/* Messages */}
      {error && (
        <div className="flex items-center gap-2 p-3 mb-4 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 text-sm">
          <AlertCircle size={16} />
          {error}
          <button onClick={() => setError('')} className="ml-auto text-xs hover:text-red-300">✕</button>
        </div>
      )}
      {uploadSuccess && (
        <div className="flex items-center gap-2 p-3 mb-4 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-sm">
          <CheckCircle2 size={16} />
          {uploadSuccess}
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-20" />)}
        </div>
      ) : resumes.length === 0 ? (
        <EmptyState
          icon={<FileText size={32} />}
          title="No resumes yet"
          description="Upload a resume above and we'll parse it automatically."
        />
      ) : (
        <div className="space-y-4">
          {resumes.map(r => (
            <Card key={r.id} className="p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/15 flex items-center justify-center flex-shrink-0">
                <FileText size={22} className="text-indigo-400" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-medium truncate">{r.file_name}</h3>
                <div className="flex items-center gap-3 mt-1">
                  <Badge variant="info">{r.file_type}</Badge>
                  <span className="flex items-center gap-1 text-xs text-gray-500">
                    <Calendar size={12} />
                    {new Date(r.created_at).toLocaleDateString()}
                  </span>
                </div>
                {r.structured_data && (
                  <p className="text-xs text-gray-500 mt-1 truncate">
                    {(r.structured_data as Record<string, unknown>).full_name as string || ''} • {
                      ((r.structured_data as Record<string, unknown>).technical_skills as string[] || []).slice(0, 4).join(', ')
                    }
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => navigate(`/analyses/new?resume_id=${r.id}`)}
                >
                  Analyze
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  icon={<Trash2 size={14} />}
                  onClick={() => handleDelete(r.id)}
                >
                  Delete
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </AppLayout>
  );
}
