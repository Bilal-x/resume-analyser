import uuid
import json
from datetime import datetime
from fastapi import APIRouter, HTTPException, Depends
from ..models.schemas import JobDescriptionCreate, JobDescriptionResponse
from ..services.jd_analyzer import parse_job_description
from ..database import get_connection
from ..auth import get_current_user

router = APIRouter(prefix="/jds", tags=["Job Descriptions"])

def _row_to_response(row) -> JobDescriptionResponse:
    reqs_raw = json.loads(row["structured_requirements"]) if isinstance(row["structured_requirements"], str) else row["structured_requirements"]
    from ..models.schemas import JDRequirement
    return JobDescriptionResponse(
        id=row["id"],
        owner_id=row["owner_id"],
        title=row["title"],
        company=row["company"],
        description=row["description"],
        structured_requirements=[JDRequirement(**r) for r in reqs_raw],
        created_at=row["created_at"]
    )

@router.post("/", response_model=JobDescriptionResponse)
def create_jd(jd_data: JobDescriptionCreate, current_user: dict = Depends(get_current_user)):
    requirements = parse_job_description(jd_data.description)
    jd_id = str(uuid.uuid4())
    created_at = datetime.utcnow().isoformat()
    
    conn = get_connection()
    conn.execute(
        """INSERT INTO job_descriptions (id, owner_id, title, company, description, structured_requirements, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?)""",
        (jd_id, current_user["sub"], jd_data.title, jd_data.company or "Company",
         jd_data.description, json.dumps([r.model_dump() for r in requirements]), created_at)
    )
    conn.commit()
    conn.close()
    
    return JobDescriptionResponse(
        id=jd_id,
        owner_id=current_user["sub"],
        title=jd_data.title,
        company=jd_data.company or "Company",
        description=jd_data.description,
        structured_requirements=requirements,
        created_at=created_at
    )

@router.get("/", response_model=list[JobDescriptionResponse])
def list_jds(current_user: dict = Depends(get_current_user)):
    conn = get_connection()
    rows = conn.execute(
        "SELECT * FROM job_descriptions WHERE owner_id = ? ORDER BY created_at DESC",
        (current_user["sub"],)
    ).fetchall()
    conn.close()
    return [_row_to_response(r) for r in rows]

@router.get("/{jd_id}", response_model=JobDescriptionResponse)
def get_jd(jd_id: str, current_user: dict = Depends(get_current_user)):
    conn = get_connection()
    row = conn.execute("SELECT * FROM job_descriptions WHERE id = ?", (jd_id,)).fetchone()
    conn.close()
    if not row:
        raise HTTPException(status_code=404, detail="Job description not found.")
    return _row_to_response(row)

@router.delete("/{jd_id}")
def delete_jd(jd_id: str, current_user: dict = Depends(get_current_user)):
    conn = get_connection()
    row = conn.execute("SELECT owner_id FROM job_descriptions WHERE id = ?", (jd_id,)).fetchone()
    if not row:
        conn.close()
        raise HTTPException(status_code=404, detail="Job description not found.")
    if row["owner_id"] != current_user["sub"]:
        conn.close()
        raise HTTPException(status_code=403, detail="Cannot delete another user's job description.")
    conn.execute("DELETE FROM resume_analyses WHERE job_description_id = ?", (jd_id,))
    conn.execute("DELETE FROM job_descriptions WHERE id = ?", (jd_id,))
    conn.commit()
    conn.close()
    return {"message": "Job description deleted."}
