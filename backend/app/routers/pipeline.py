import uuid
import json
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, HTTPException, Depends
from ..models.schemas import (
    CandidatePipelineItem, UpdateCandidateStageRequest,
    AddRecruiterNoteRequest, AddInterviewFeedbackRequest,
    PIPELINE_STAGES, StageHistoryItem, RecruiterNoteItem,
    InterviewFeedbackItem
)
from ..database import get_connection
from ..auth import get_current_user

router = APIRouter(prefix="/pipeline", tags=["ATS Pipeline"])

def _db_row_to_pipeline_item(row) -> CandidatePipelineItem:
    history = [StageHistoryItem(**x) for x in json.loads(row["stage_history"] or "[]")]
    notes = [RecruiterNoteItem(**x) for x in json.loads(row["notes"] or "[]")]
    feedbacks = [InterviewFeedbackItem(**x) for x in json.loads(row["interview_feedbacks"] or "[]")]

    return CandidatePipelineItem(
        application_id=row["id"],
        analysis_id=row["analysis_id"],
        resume_id=row["resume_id"],
        job_description_id=row["job_description_id"],
        candidate_name=row["candidate_name"],
        resume_file_name=row["resume_file_name"],
        job_title=row["job_title"],
        company_name=row["company_name"],
        overall_score=row["overall_score"],
        current_stage=row["current_stage"],
        experience_status=row["experience_status"],
        total_experience_months=row["total_experience_months"],
        relevant_experience_months=row["relevant_experience_months"],
        key_strengths=json.loads(row["key_strengths"] or "[]"),
        key_gaps=json.loads(row["key_gaps"] or "[]"),
        notes_count=len(notes),
        created_at=row["created_at"],
        updated_at=row["updated_at"],
        stage_history=history,
        notes=notes,
        interview_feedbacks=feedbacks
    )

@router.get("/stages", response_model=List[str])
def get_pipeline_stages():
    """Return the official 11 recruitment stages."""
    return PIPELINE_STAGES

@router.get("/jd/{jd_id}", response_model=List[CandidatePipelineItem])
def get_pipeline_candidates(jd_id: str, current_user: dict = Depends(get_current_user)):
    """Retrieve all candidates in the ATS pipeline for a target JD."""
    conn = get_connection()
    if current_user.get("role") == "recruiter":
        rows = conn.execute(
            "SELECT * FROM applications WHERE job_description_id = ? ORDER BY overall_score DESC",
            (jd_id,)
        ).fetchall()
    else:
        rows = conn.execute(
            """
            SELECT a.* FROM applications a
            JOIN resume_analyses ra ON a.analysis_id = ra.id
            WHERE a.job_description_id = ? AND ra.owner_id = ?
            ORDER BY a.created_at DESC
            """,
            (jd_id, current_user["sub"])
        ).fetchall()
    conn.close()
    return [_db_row_to_pipeline_item(r) for r in rows]

@router.get("/application/{app_id}", response_model=CandidatePipelineItem)
def get_application_detail(app_id: str, current_user: dict = Depends(get_current_user)):
    """Get full profile and history of a candidate application."""
    conn = get_connection()
    row = conn.execute("SELECT * FROM applications WHERE id = ?", (app_id,)).fetchone()
    conn.close()
    if not row:
        raise HTTPException(status_code=404, detail="Application not found.")
    return _db_row_to_pipeline_item(row)

@router.patch("/application/{app_id}/stage", response_model=CandidatePipelineItem)
def update_application_stage(
    app_id: str,
    req: UpdateCandidateStageRequest,
    current_user: dict = Depends(get_current_user)
):
    """Move candidate to a new hiring stage in Kanban or Table view."""
    if req.new_stage not in PIPELINE_STAGES:
        raise HTTPException(status_code=400, detail=f"Invalid stage. Must be one of: {PIPELINE_STAGES}")

    conn = get_connection()
    row = conn.execute("SELECT * FROM applications WHERE id = ?", (app_id,)).fetchone()
    if not row:
        conn.close()
        raise HTTPException(status_code=404, detail="Application not found.")

    history = json.loads(row["stage_history"] or "[]")
    now_iso = datetime.now(timezone.utc).isoformat()
    history.append({
        "stage": req.new_stage,
        "timestamp": now_iso,
        "changed_by": current_user.get("name", "Recruiter"),
        "notes": req.notes or f"Moved from {row['current_stage']} to {req.new_stage}."
    })

    conn.execute(
        """
        UPDATE applications
        SET current_stage = ?, stage_history = ?, updated_at = ?
        WHERE id = ?
        """,
        (req.new_stage, json.dumps(history), now_iso, app_id)
    )
    conn.commit()

    updated_row = conn.execute("SELECT * FROM applications WHERE id = ?", (app_id,)).fetchone()
    conn.close()
    return _db_row_to_pipeline_item(updated_row)

@router.post("/application/{app_id}/notes", response_model=CandidatePipelineItem)
def add_recruiter_note(
    app_id: str,
    req: AddRecruiterNoteRequest,
    current_user: dict = Depends(get_current_user)
):
    """Add an internal recruiter evaluation note to candidate's file."""
    conn = get_connection()
    row = conn.execute("SELECT * FROM applications WHERE id = ?", (app_id,)).fetchone()
    if not row:
        conn.close()
        raise HTTPException(status_code=404, detail="Application not found.")

    notes = json.loads(row["notes"] or "[]")
    now_iso = datetime.now(timezone.utc).isoformat()
    notes.append({
        "id": str(uuid.uuid4())[:8],
        "author_name": current_user.get("name", "Recruiter"),
        "timestamp": now_iso,
        "content": req.content
    })

    conn.execute(
        "UPDATE applications SET notes = ?, updated_at = ? WHERE id = ?",
        (json.dumps(notes), now_iso, app_id)
    )
    conn.commit()

    updated_row = conn.execute("SELECT * FROM applications WHERE id = ?", (app_id,)).fetchone()
    conn.close()
    return _db_row_to_pipeline_item(updated_row)

@router.post("/application/{app_id}/interview-feedback", response_model=CandidatePipelineItem)
def add_interview_feedback(
    app_id: str,
    req: AddInterviewFeedbackRequest,
    current_user: dict = Depends(get_current_user)
):
    """Add interview round feedback and hiring recommendation."""
    conn = get_connection()
    row = conn.execute("SELECT * FROM applications WHERE id = ?", (app_id,)).fetchone()
    if not row:
        conn.close()
        raise HTTPException(status_code=404, detail="Application not found.")

    feedbacks = json.loads(row["interview_feedbacks"] or "[]")
    now_iso = datetime.now(timezone.utc).isoformat()
    feedbacks.append({
        "id": str(uuid.uuid4())[:8],
        "interviewer": current_user.get("name", "Interviewer"),
        "round_name": req.round_name,
        "rating": req.rating,
        "recommendation": req.recommendation,
        "feedback": req.feedback,
        "timestamp": now_iso
    })

    conn.execute(
        "UPDATE applications SET interview_feedbacks = ?, updated_at = ? WHERE id = ?",
        (json.dumps(feedbacks), now_iso, app_id)
    )
    conn.commit()

    updated_row = conn.execute("SELECT * FROM applications WHERE id = ?", (app_id,)).fetchone()
    conn.close()
    return _db_row_to_pipeline_item(updated_row)
