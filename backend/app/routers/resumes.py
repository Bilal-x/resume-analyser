import uuid
import json
import os
from datetime import datetime
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from ..models.schemas import ResumeResponse
from ..services.parser import parse_resume
from ..database import get_connection
from ..auth import get_current_user
from ..config import ALLOWED_EXTENSIONS, MAX_FILE_SIZE_MB

router = APIRouter(prefix="/resumes", tags=["Resumes"])

UPLOAD_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "uploads"))
os.makedirs(UPLOAD_DIR, exist_ok=True)

def _row_to_response(row) -> ResumeResponse:
    structured = json.loads(row["structured_data"]) if isinstance(row["structured_data"], str) else row["structured_data"]
    from ..models.schemas import ExtractedResumeData
    return ResumeResponse(
        id=row["id"],
        owner_id=row["owner_id"],
        file_name=row["file_name"],
        file_type=row["file_type"],
        extracted_text=row["extracted_text"],
        structured_data=ExtractedResumeData(**structured),
        created_at=row["created_at"]
    )

@router.post("/upload", response_model=ResumeResponse)
async def upload_resume(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    # Validate extension
    fname = file.filename or ""
    ext = os.path.splitext(fname)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail=f"Unsupported file type '{ext}'. Allowed: {', '.join(ALLOWED_EXTENSIONS)}")
    
    file_bytes = await file.read()
    
    # Validate size
    if len(file_bytes) > MAX_FILE_SIZE_MB * 1024 * 1024:
        raise HTTPException(status_code=413, detail=f"File exceeds maximum size of {MAX_FILE_SIZE_MB}MB.")
    
    # Parse resume
    try:
        structured_data = parse_resume(file_bytes, fname)
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"Failed to parse resume: {str(e)}")
    
    extracted_text = "\n".join(structured_data.raw_sections.values())
    
    resume_id = str(uuid.uuid4())
    created_at = datetime.utcnow().isoformat()
    
    conn = get_connection()
    conn.execute(
        """INSERT INTO resumes (id, owner_id, file_name, file_type, extracted_text, structured_data, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?)""",
        (resume_id, current_user["sub"], fname, ext.lstrip("."), extracted_text,
         json.dumps(structured_data.model_dump()), created_at)
    )
    conn.commit()
    conn.close()
    
    return ResumeResponse(
        id=resume_id,
        owner_id=current_user["sub"],
        file_name=fname,
        file_type=ext.lstrip("."),
        extracted_text=extracted_text,
        structured_data=structured_data,
        created_at=created_at
    )

@router.get("/", response_model=list[ResumeResponse])
def list_resumes(current_user: dict = Depends(get_current_user)):
    conn = get_connection()
    rows = conn.execute(
        "SELECT * FROM resumes WHERE owner_id = ? ORDER BY created_at DESC",
        (current_user["sub"],)
    ).fetchall()
    conn.close()
    return [_row_to_response(r) for r in rows]

@router.get("/{resume_id}", response_model=ResumeResponse)
def get_resume(resume_id: str, current_user: dict = Depends(get_current_user)):
    conn = get_connection()
    row = conn.execute("SELECT * FROM resumes WHERE id = ?", (resume_id,)).fetchone()
    conn.close()
    if not row:
        raise HTTPException(status_code=404, detail="Resume not found.")
    if row["owner_id"] != current_user["sub"] and current_user.get("role") != "recruiter":
        raise HTTPException(status_code=403, detail="Access denied.")
    return _row_to_response(row)

@router.delete("/{resume_id}")
def delete_resume(resume_id: str, current_user: dict = Depends(get_current_user)):
    conn = get_connection()
    row = conn.execute("SELECT owner_id FROM resumes WHERE id = ?", (resume_id,)).fetchone()
    if not row:
        conn.close()
        raise HTTPException(status_code=404, detail="Resume not found.")
    if row["owner_id"] != current_user["sub"]:
        conn.close()
        raise HTTPException(status_code=403, detail="Cannot delete another user's resume.")
    # Cascade delete analyses
    conn.execute("DELETE FROM resume_analyses WHERE resume_id = ?", (resume_id,))
    conn.execute("DELETE FROM resumes WHERE id = ?", (resume_id,))
    conn.commit()
    conn.close()
    return {"message": "Resume and all associated analyses deleted successfully."}
