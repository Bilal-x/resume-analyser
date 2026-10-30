import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  pipelineApi,
  type CandidatePipelineItem,
  type JobDescriptionResponse
} from '../lib/api';
import { Badge, Button, Card, Skeleton } from './ui';
import {
  Kanban, Table, MessageSquare, Plus, User, Filter
} from 'lucide-react';

interface Props {
  jds: JobDescriptionResponse[];
  selectedJdId?: string;
}

export function CandidatePipelineView({ jds, selectedJdId }: Props) {
  const navigate = useNavigate();
  const [activeJdId, setActiveJdId] = useState<string>(selectedJdId || (jds[0]?.id ?? ''));
  const [stages, setStages] = useState<string[]>([]);
  const [candidates, setCandidates] = useState<CandidatePipelineItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
  const [selectedCandidate, setSelectedCandidate] = useState<CandidatePipelineItem | null>(null);
  const [noteContent, setNoteContent] = useState('');
  const [feedbackRound, setFeedbackRound] = useState('Technical Round');
  const [feedbackRating, setFeedbackRating] = useState(4);
  const [feedbackRec, setFeedbackRec] = useState('Hire');
  const [feedbackText, setFeedbackText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    pipelineApi.getStages().then(setStages).catch(() => []);
  }, []);

  useEffect(() => {
    if (!activeJdId && jds.length > 0) {
      setActiveJdId(jds[0].id);
    }
  }, [jds, activeJdId]);

  const loadCandidates = () => {
    if (!activeJdId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    pipelineApi.getCandidates(activeJdId)
      .then(setCandidates)
      .catch(() => setCandidates([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadCandidates();
  }, [activeJdId]);

  const handleStageChange = async (appId: string, newStage: string) => {
    try {
      const updated = await pipelineApi.updateStage(appId, newStage, `Advanced to ${newStage}`);
      setCandidates(prev => prev.map(c => c.application_id === appId ? updated : c));
      if (selectedCandidate?.application_id === appId) {
        setSelectedCandidate(updated);
      }
    } catch (e) {
      console.error('Failed to update stage:', e);
    }
  };

  const handleAddNote = async () => {
    if (!selectedCandidate || !noteContent.trim()) return;
    setSubmitting(true);
    try {
      const updated = await pipelineApi.addNote(selectedCandidate.application_id, noteContent.trim());
      setCandidates(prev => prev.map(c => c.application_id === updated.application_id ? updated : c));
      setSelectedCandidate(updated);
      setNoteContent('');
    } catch (e) {
      console.error('Failed to add note:', e);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddFeedback = async () => {
    if (!selectedCandidate || !feedbackText.trim()) return;
    setSubmitting(true);
    try {
      const updated = await pipelineApi.addFeedback(selectedCandidate.application_id, {
        round_name: feedbackRound,
        rating: feedbackRating,
        recommendation: feedbackRec,
        feedback: feedbackText.trim()
      });
      setCandidates(prev => prev.map(c => c.application_id === updated.application_id ? updated : c));
      setSelectedCandidate(updated);
      setFeedbackText('');
    } catch (e) {
      console.error('Failed to add feedback:', e);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-zinc-900/60 border border-zinc-800">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Filter size={15} className="text-zinc-500" />
          <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider font-mono">Position:</span>
          <select
            value={activeJdId}
            onChange={(e) => setActiveJdId(e.target.value)}
            className="bg-zinc-850 border border-zinc-700/60 rounded-lg px-3 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500 max-w-xs"
          >
            {jds.map(j => (
              <option key={j.id} value={j.id}>
                {j.title} ({j.company || 'Internal'})
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center">
          <div className="inline-flex p-1 bg-zinc-950 border border-zinc-800 rounded-lg text-xs font-medium">
            <button
              onClick={() => setViewMode('kanban')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-all ${
                viewMode === 'kanban'
                  ? 'bg-zinc-100 text-zinc-950 font-semibold shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Kanban size={13} />
              Kanban Board
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-all ${
                viewMode === 'table'
                  ? 'bg-zinc-100 text-zinc-950 font-semibold shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Table size={13} />
              Table View
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-64" />)}
        </div>
      ) : candidates.length === 0 ? (
        <Card className="p-12 text-center border-dashed border-zinc-800">
          <User size={32} className="mx-auto text-zinc-600 mb-3" />
          <h3 className="text-base font-semibold text-zinc-200">No applicants in this pipeline</h3>
          <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
            Evaluate resumes against this position to automatically populate candidates across the 11 recruitment stages.
          </p>
          <Button
            size="sm"
            className="mt-4"
            icon={<Plus size={13} />}
            onClick={() => navigate(`/analyses/new?jd_id=${activeJdId}`)}
          >
            Screen First Resume
          </Button>
        </Card>
      ) : viewMode === 'kanban' ? (
        /* ================= 11-STAGE KANBAN BOARD ================= */
        <div className="overflow-x-auto pb-4">
          <div className="flex gap-4 min-w-[2200px]">
            {stages.map(stage => {
              const stageCandidates = candidates.filter(c => c.current_stage === stage);
              return (
                <div
                  key={stage}
                  className="w-72 shrink-0 bg-zinc-900/40 rounded-xl border border-zinc-800 flex flex-col"
                >
                  {/* Column Header */}
                  <div className="p-3.5 border-b border-zinc-800 flex items-center justify-between">
                    <span className="text-xs font-semibold text-zinc-300 truncate">{stage}</span>
                    <Badge variant={stageCandidates.length > 0 ? 'info' : 'neutral'} size="xs">
                      {stageCandidates.length}
                    </Badge>
                  </div>

                  {/* Cards container */}
                  <div className="p-2.5 space-y-3 min-h-[350px] flex-1">
                    {stageCandidates.map(cand => (
                      <div
                        key={cand.application_id}
                        onClick={() => setSelectedCandidate(cand)}
                        className="p-3.5 rounded-lg bg-zinc-850/80 border border-zinc-750 hover:border-indigo-500/50 hover:bg-zinc-800 transition-all cursor-pointer shadow-sm group"
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h4 className="font-semibold text-zinc-100 text-xs truncate group-hover:text-indigo-300 transition-colors">
                            {cand.candidate_name}
                          </h4>
                          <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded ${
                            cand.overall_score >= 7.5 ? 'bg-emerald-500/15 text-emerald-400' :
                            cand.overall_score >= 5.0 ? 'bg-amber-500/15 text-amber-400' : 'bg-red-500/15 text-red-400'
                          }`}>
                            {cand.overall_score.toFixed(1)}
                          </span>
                        </div>

                        <p className="text-[11px] text-zinc-500 truncate mb-2">{cand.resume_file_name}</p>

                        <div className="flex flex-wrap items-center gap-1.5 mb-2.5">
                          <Badge variant="neutral" size="xs">
                            {cand.total_experience_months != null
                              ? `${(cand.total_experience_months / 12).toFixed(1)} yrs`
                              : 'No Exp Sec'}
                          </Badge>
                          {cand.notes_count > 0 && (
                            <span className="inline-flex items-center gap-1 text-[10px] text-zinc-400 bg-zinc-800 px-1.5 py-0.5 rounded">
                              <MessageSquare size={10} /> {cand.notes_count}
                            </span>
                          )}
                        </div>

                        {/* Stage Selector */}
                        <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between" onClick={(e) => e.stopPropagation()}>
                          <span className="text-[10px] text-zinc-500">Move:</span>
                          <select
                            value={cand.current_stage}
                            onChange={(e) => handleStageChange(cand.application_id, e.target.value)}
                            className="bg-zinc-900 border border-zinc-700/60 rounded px-1.5 py-0.5 text-[10px] text-zinc-300 focus:outline-none"
                          >
                            {stages.map(s => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    ))}
                    {stageCandidates.length === 0 && (
                      <div className="h-full flex items-center justify-center text-[11px] text-zinc-600 py-10">
                        Drop candidate here
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* ================= DETAILED TABLE VIEW ================= */
        <Card className="overflow-hidden border-zinc-800">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[800px]">
              <thead className="bg-zinc-850 border-b border-zinc-800">
                <tr>
                  <th className="py-3 px-4 font-semibold text-zinc-400 uppercase tracking-wider">Candidate</th>
                  <th className="py-3 px-4 font-semibold text-zinc-400 uppercase tracking-wider">Overall Score</th>
                  <th className="py-3 px-4 font-semibold text-zinc-400 uppercase tracking-wider">Current Stage</th>
                  <th className="py-3 px-4 font-semibold text-zinc-400 uppercase tracking-wider">Experience</th>
                  <th className="py-3 px-4 font-semibold text-zinc-400 uppercase tracking-wider">Notes</th>
                  <th className="py-3 px-4 font-semibold text-zinc-400 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {candidates.map(c => (
                  <tr key={c.application_id} className="hover:bg-zinc-850/40 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-zinc-100 text-xs">{c.candidate_name}</div>
                      <div className="text-[11px] text-zinc-500">{c.resume_file_name}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex px-2 py-0.5 rounded text-xs font-bold ${
                        c.overall_score >= 7.5 ? 'bg-emerald-500/15 text-emerald-400' :
                        c.overall_score >= 5.0 ? 'bg-amber-500/15 text-amber-400' : 'bg-red-500/15 text-red-400'
                      }`}>
                        {c.overall_score.toFixed(1)} / 10
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <select
                        value={c.current_stage}
                        onChange={(e) => handleStageChange(c.application_id, e.target.value)}
                        className="bg-zinc-850 border border-zinc-700/60 rounded px-2 py-1 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500"
                      >
                        {stages.map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="neutral" size="xs">
                        {c.total_experience_months != null
                          ? `${(c.total_experience_months / 12).toFixed(1)} yrs`
                          : 'Not Documented'}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-zinc-400">
                      {c.notes_count} internal notes
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="xs"
                          variant="secondary"
                          onClick={() => setSelectedCandidate(c)}
                        >
                          Profile & Notes
                        </Button>
                        <Button
                          size="xs"
                          onClick={() => navigate(`/analyses/${c.analysis_id}`)}
                        >
                          Full Report →
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* ================= CANDIDATE PROFILE & HISTORY MODAL ================= */}
      {selectedCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/40">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-sm">
                  {selectedCandidate.candidate_name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">{selectedCandidate.candidate_name}</h3>
                  <p className="text-xs text-zinc-400">
                    Stage: <span className="text-indigo-400 font-semibold">{selectedCandidate.current_stage}</span> · Match: <span className="text-emerald-400 font-bold">{selectedCandidate.overall_score.toFixed(1)}/10</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCandidate(null)}
                className="text-zinc-500 hover:text-white text-lg p-1"
              >
                ✕
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-5 overflow-y-auto space-y-5 flex-1">
              {/* Advance Stage Control */}
              <div className="p-3.5 rounded-xl bg-zinc-850/60 border border-zinc-750 flex items-center justify-between">
                <div>
                  <span className="text-xs text-zinc-400">Current Hiring Stage</span>
                  <p className="text-sm font-semibold text-zinc-100">{selectedCandidate.current_stage}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-zinc-400">Advance to:</span>
                  <select
                    value={selectedCandidate.current_stage}
                    onChange={(e) => handleStageChange(selectedCandidate.application_id, e.target.value)}
                    className="bg-zinc-900 border border-zinc-700 rounded-lg px-2.5 py-1 text-xs text-zinc-100 focus:outline-none"
                  >
                    {stages.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Stage History Timeline */}
              <div>
                <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider font-mono mb-3">
                  Application Stage Timeline
                </h4>
                <div className="space-y-2 border-l border-zinc-800 ml-2 pl-4">
                  {selectedCandidate.stage_history.map((h, i) => (
                    <div key={i} className="relative text-xs">
                      <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-indigo-500 border-2 border-zinc-900" />
                      <div className="flex items-center justify-between text-zinc-400">
                        <span className="font-semibold text-zinc-200">{h.stage}</span>
                        <span className="text-[10px] text-zinc-500">{new Date(h.timestamp).toLocaleDateString()}</span>
                      </div>
                      <p className="text-[11px] text-zinc-500 mt-0.5">By {h.changed_by} {h.notes ? `— "${h.notes}"` : ''}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Interview Feedback */}
              <div>
                <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider font-mono mb-3">
                  Interview Round Feedbacks ({selectedCandidate.interview_feedbacks.length})
                </h4>
                {selectedCandidate.interview_feedbacks.length === 0 ? (
                  <p className="text-xs text-zinc-500 italic">No interview feedbacks recorded yet.</p>
                ) : (
                  <div className="space-y-2">
                    {selectedCandidate.interview_feedbacks.map((f) => (
                      <div key={f.id} className="p-3 rounded-lg bg-zinc-850 border border-zinc-750 text-xs">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-zinc-200">{f.round_name}</span>
                          <span className="text-indigo-400 font-bold">{f.recommendation} ({f.rating}/5)</span>
                        </div>
                        <p className="text-zinc-400 text-xs">"{f.feedback}"</p>
                        <p className="text-[10px] text-zinc-600 mt-1">Interviewer: {f.interviewer}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add Feedback Form */}
                <div className="mt-3 p-3 bg-zinc-950/40 rounded-xl border border-zinc-800 space-y-2">
                  <div className="grid grid-cols-3 gap-2">
                    <select
                      value={feedbackRound}
                      onChange={(e) => setFeedbackRound(e.target.value)}
                      className="bg-zinc-850 border border-zinc-700/60 rounded px-2 py-1 text-xs text-zinc-200"
                    >
                      <option value="Technical Round">Technical Round</option>
                      <option value="HR Round">HR Round</option>
                      <option value="System Design">System Design</option>
                    </select>
                    <select
                      value={feedbackRec}
                      onChange={(e) => setFeedbackRec(e.target.value)}
                      className="bg-zinc-850 border border-zinc-700/60 rounded px-2 py-1 text-xs text-zinc-200"
                    >
                      <option value="Strong Hire">Strong Hire</option>
                      <option value="Hire">Hire</option>
                      <option value="Leaning Hire">Leaning Hire</option>
                      <option value="No Hire">No Hire</option>
                    </select>
                    <input
                      type="number"
                      min="1"
                      max="5"
                      step="0.5"
                      value={feedbackRating}
                      onChange={(e) => setFeedbackRating(parseFloat(e.target.value))}
                      className="bg-zinc-850 border border-zinc-700/60 rounded px-2 py-1 text-xs text-zinc-200"
                      placeholder="Rating (1-5)"
                    />
                  </div>
                  <textarea
                    rows={2}
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    placeholder="Enter candidate interview feedback notes..."
                    className="w-full bg-zinc-850 border border-zinc-700/60 rounded-lg p-2 text-xs text-zinc-200 focus:outline-none"
                  />
                  <div className="flex justify-end">
                    <Button size="xs" onClick={handleAddFeedback} disabled={submitting || !feedbackText.trim()}>
                      Submit Round Feedback
                    </Button>
                  </div>
                </div>
              </div>

              {/* Recruiter Notes */}
              <div>
                <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider font-mono mb-3">
                  Internal Recruiter Notes ({selectedCandidate.notes.length})
                </h4>
                {selectedCandidate.notes.length === 0 ? (
                  <p className="text-xs text-zinc-500 italic">No notes recorded yet.</p>
                ) : (
                  <div className="space-y-2">
                    {selectedCandidate.notes.map((n) => (
                      <div key={n.id} className="p-2.5 rounded-lg bg-zinc-850 border border-zinc-750 text-xs">
                        <div className="flex items-center justify-between text-zinc-500 text-[10px] mb-1">
                          <span className="font-semibold text-zinc-300">{n.author_name}</span>
                          <span>{new Date(n.timestamp).toLocaleDateString()}</span>
                        </div>
                        <p className="text-zinc-300">{n.content}</p>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-3 flex gap-2">
                  <input
                    type="text"
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                    placeholder="Add an internal evaluation note..."
                    className="flex-1 bg-zinc-850 border border-zinc-700/60 rounded-lg px-3 py-1.5 text-xs text-zinc-200 focus:outline-none"
                    onKeyDown={(e) => e.key === 'Enter' && handleAddNote()}
                  />
                  <Button size="xs" onClick={handleAddNote} disabled={submitting || !noteContent.trim()}>
                    Add Note
                  </Button>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-zinc-800 bg-zinc-950 flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedCandidate(null)}
              >
                Close
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  navigate(`/analyses/${selectedCandidate.analysis_id}`);
                }}
              >
                Open Full Evidence Report →
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
