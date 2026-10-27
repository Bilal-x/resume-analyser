import uuid
import json
from datetime import datetime
from fastapi import APIRouter, HTTPException, status
from ..models.schemas import UserCreate, UserLogin, UserResponse, TokenResponse
from ..database import get_connection
from ..auth import hash_password, verify_password, create_token

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=TokenResponse)
def register(user_data: UserCreate):
    conn = get_connection()
    cursor = conn.cursor()
    
    # Check email uniqueness
    existing = cursor.execute("SELECT id FROM users WHERE email = ?", (user_data.email,)).fetchone()
    if existing:
        conn.close()
        raise HTTPException(status_code=409, detail="An account with this email already exists.")
    
    user_id = str(uuid.uuid4())
    created_at = datetime.utcnow().isoformat()
    pw_hash = hash_password(user_data.password)
    role = user_data.role if user_data.role in ["candidate", "recruiter"] else "candidate"
    
    cursor.execute(
        "INSERT INTO users (id, email, name, password_hash, role, created_at) VALUES (?, ?, ?, ?, ?, ?)",
        (user_id, user_data.email, user_data.name, pw_hash, role, created_at)
    )
    conn.commit()
    conn.close()
    
    token = create_token(user_id, user_data.email, role)
    return TokenResponse(
        access_token=token,
        user=UserResponse(
            id=user_id,
            email=user_data.email,
            name=user_data.name,
            role=role,
            created_at=created_at
        )
    )

@router.post("/login", response_model=TokenResponse)
def login(credentials: UserLogin):
    conn = get_connection()
    cursor = conn.cursor()
    row = cursor.execute(
        "SELECT id, name, email, role, password_hash, created_at FROM users WHERE email = ?",
        (credentials.email,)
    ).fetchone()
    conn.close()
    
    if not row or not verify_password(credentials.password, row["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password.")
    
    token = create_token(row["id"], row["email"], row["role"])
    return TokenResponse(
        access_token=token,
        user=UserResponse(
            id=row["id"],
            email=row["email"],
            name=row["name"],
            role=row["role"],
            created_at=row["created_at"]
        )
    )

@router.get("/me", response_model=UserResponse)
def get_me(user: dict = None):
    from ..auth import get_current_user
    from fastapi import Depends
    # This endpoint is handled by injected dependency below
    pass

# Re-export a proper /me endpoint with dependency injection
from fastapi import Depends
from ..auth import get_current_user

@router.get("/profile", response_model=UserResponse)
def get_profile(current_user: dict = Depends(get_current_user)):
    conn = get_connection()
    row = conn.execute(
        "SELECT id, name, email, role, created_at FROM users WHERE id = ?",
        (current_user["sub"],)
    ).fetchone()
    conn.close()
    if not row:
        raise HTTPException(status_code=404, detail="User not found.")
    return UserResponse(id=row["id"], name=row["name"], email=row["email"], role=row["role"], created_at=row["created_at"])
