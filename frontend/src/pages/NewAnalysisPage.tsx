import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AppLayout, PageHeader } from '../components/Layout';
import { Button, Card, Skeleton } from '../components/ui';
import { resumesApi, jdsApi, analysesApi, type ResumeResponse, type JobDescriptionResponse } from '../lib/api';
import { Sparkles, FileText, Briefcase, Info } from 'lucide-react';

export default function NewAnalysisPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [resumes, setResumes] = useState<ResumeResponse[]>([]);
  const [jds, setJds] = useState<JobDescriptionResponse[]>([]);
  const [selectedResume, setSelectedResume] = useState(params.get('resume_id') || '');
  const [selectedJd, setSelectedJd] = useState(params.get('jd_id') || '');
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    Promise.all([resumesApi.list(), jdsApi.list()])
      .then(([r, j]) => { setResumes(r); setJds(j); })
      .catch(() => setError('Failed to load data.'))
      .finally(() => setLoading(false));
  }, []);

  const handleRun = async () => {
    if (!selectedResume) { setError('Please select a resume.'); return; }
    if (!selectedJd) { setError('Please select a job description.'); return; }
    setError('');
    setRunning(true);

    // Fake progress animation
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 90) { clearInterval(interval); return p; }
        return p + Math.random() * 8;
      });
    }, 400);

    try {
      const analysis = await analysesApi.run(selectedResume, selectedJd);
      clearInterval(interval);
      setProgress(100);
      setTimeout(() => navigate(`/analyses/${analysis.id}`), 300);
    } catch (err: unknown) {
      clearInterval(interval);
      setProgress(0);
      setError(err instanceof Error ? err.message : 'Analysis failed.');
    } finally {
      setRunning(false);
    }
  };

  const selectedResumeData = resumes.find(r => r.id === selectedResume);
  const selectedJdData = jds.find(j => j.id === selectedJd);

  const pipeline = [
    'Parsing resume sections',
    'Extracting JD requirements',
    'Matching direct skills',
    'Discovering indirect skills',
    'Analyzing projects',
    'Computing weighted score',
    'Generating recommendations',
    'Building interview questions',
  ];

  return (
    <AppLayout>
      <PageHeader
        title="New Analysis"
        subtitle="Select a resume and job description to run a deep AI analysis"
      />

      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
        </div>
      ) : (
        <div className="max-w-3xl space-y-6">
          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 text-sm">{error}</div>
          )}

          {/* Step 1 - Resume */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-sm font-bold text-indigo-400">1</div>
              <div>
                <h2 className="font-semibold text-white">Select Resume</h2>
                <p className="text-xs text-gray-500">Choose which resume to analyze</p>
              </div>
            </div>

            {resumes.length === 0 ? (
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-400 text-sm flex items-start gap-2">
                <Info size={16} className="flex-shrink-0 mt-0.5" />
                No resumes uploaded yet.{' '}
                <button onClick={() => navigate('/resumes')} className="underline">Upload one first →</button>
              </div>
            ) : (
              <div className="space-y-3">
                {resumes.map(r => (
                  <button
                    key={r.id}
                    onClick={() => setSelectedResume(r.id)}
                    className={`w-full text-left p-4 rounded-xl border transition-all duration-200 flex items-center gap-3 ${
                      selectedResume === r.id
                        ? 'border-indigo-500/50 bg-indigo-500/10'
                        : 'border-white/10 hover:border-white/20 bg-gray-800/30'
                    }`}
                  >
                    <FileText size={18} className={selectedResume === r.id ? 'text-indigo-400' : 'text-gray-500'} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{r.file_name}</p>
                      <p className="text-xs text-gray-500">
                        {(r.structured_data as Record<string, unknown>).full_name as string || 'Unknown candidate'} •{' '}
                        {new Date(r.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    {selectedResume === r.id && (
                      <div className="w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center flex-shrink-0">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </Card>

          {/* Step 2 - JD */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-8 rounded-full bg-violet-500/20 flex items-center justify-center text-sm font-bold text-violet-400">2</div>
              <div>
                <h2 className="font-semibold text-white">Select Job Description</h2>
                <p className="text-xs text-gray-500">Which role to compare against</p>
              </div>
            </div>

            {jds.length === 0 ? (
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-400 text-sm flex items-start gap-2">
                <Info size={16} className="flex-shrink-0 mt-0.5" />
                No JDs yet.{' '}
                <button onClick={() => navigate('/jds')} className="underline">Create one first →</button>
              </div>
            ) : (
              <div className="space-y-3">
                {jds.map(j => (
                  <button
                    key={j.id}
                    onClick={() => setSelectedJd(j.id)}
                    className={`w-full text-left p-4 rounded-xl border transition-all duration-200 flex items-center gap-3 ${
                      selectedJd === j.id
                        ? 'border-violet-500/50 bg-violet-500/10'
                        : 'border-white/10 hover:border-white/20 bg-gray-800/30'
                    }`}
                  >
                    <Briefcase size={18} className={selectedJd === j.id ? 'text-violet-400' : 'text-gray-500'} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{j.title}</p>
                      <p className="text-xs text-gray-500">{j.company} • {j.structured_requirements.length} requirements</p>
                    </div>
                    {selectedJd === j.id && (
                      <div className="w-5 h-5 rounded-full bg-violet-500 flex items-center justify-center flex-shrink-0">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </Card>

          {/* Analysis pipeline preview */}
          {running && (
            <Card className="p-6">
              <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                <Sparkles size={16} className="text-indigo-400" />
                Running Analysis Pipeline...
              </h3>
              <div className="mb-4">
                <div className="flex justify-between text-xs text-gray-400 mb-2">
                  <span>Progress</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {pipeline.map((stage, i) => {
                  const stageProgress = (i / pipeline.length) * 100;
                  const done = progress > stageProgress + 10;
                  const active = progress > stageProgress && !done;
                  return (
                    <div key={stage} className={`flex items-center gap-2 text-xs py-1 ${done ? 'text-emerald-400' : active ? 'text-indigo-300' : 'text-gray-600'}`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${done ? 'bg-emerald-400' : active ? 'bg-indigo-400 animate-pulse' : 'bg-gray-700'}`} />
                      {stage}
                    </div>
                  );
                })}
              </div>
            </Card>
          )}

          {/* Run button */}
          {!running && (
            <Button
              onClick={handleRun}
              size="lg"
              className="w-full"
              disabled={!selectedResume || !selectedJd}
              icon={<Sparkles size={18} />}
            >
              Run Deep Analysis
              {selectedResumeData && selectedJdData && (
                <span className="text-white/60 text-sm ml-1">
                  — {selectedResumeData.file_name} vs {selectedJdData.title}
                </span>
              )}
            </Button>
          )}
        </div>
      )}
    </AppLayout>
  );
}
