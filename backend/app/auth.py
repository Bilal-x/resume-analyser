import uuid
import json
import hashlib
import hmac
import base64
import os
from datetime import datetime, timedelta
from typing import Optional
from fastapi import HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

SECRET_KEY = os.getenv("SECRET_KEY", "resume-analyzer-secret-key-super-secure-production-ready-2026")
TOKEN_EXPIRE_HOURS = 24

security = HTTPBearer()

def hash_password(password: str) -> str:
    return hashlib.sha256((password + SECRET_KEY).encode()).hexdigest()

def verify_password(plain: str, hashed: str) -> bool:
    return hmac.compare_digest(hash_password(plain), hashed)

def create_token(user_id: str, email: str, role: str) -> str:
    """Create a simple signed token (header.payload.signature)."""
    payload = {
        "sub": user_id,
        "email": email,
        "role": role,
        "exp": (datetime.utcnow() + timedelta(hours=TOKEN_EXPIRE_HOURS)).isoformat()
    }
    payload_encoded = base64.urlsafe_b64encode(json.dumps(payload).encode()).decode()
    signature = hmac.new(SECRET_KEY.encode(), payload_encoded.encode(), hashlib.sha256).hexdigest()
    return f"{payload_encoded}.{signature}"

def decode_token(token: str) -> dict:
    """Decode and verify a token. Raises HTTPException on invalid/expired."""
    try:
        parts = token.split(".")
        if len(parts) != 2:
            raise ValueError("Invalid token format")
        payload_encoded, signature = parts
        expected_sig = hmac.new(SECRET_KEY.encode(), payload_encoded.encode(), hashlib.sha256).hexdigest()
        if not hmac.compare_digest(signature, expected_sig):
            raise ValueError("Invalid signature")
        payload = json.loads(base64.urlsafe_b64decode(payload_encoded + "==").decode())
        if datetime.fromisoformat(payload["exp"]) < datetime.utcnow():
            raise ValueError("Token expired")
        return payload
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication token."
        )

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    return decode_token(credentials.credentials)

def require_role(allowed_roles: list):
    """Dependency factory for role-based access control."""
    def check_role(user: dict = Depends(get_current_user)):
        if user.get("role") not in allowed_roles:
            raise HTTPException(status_code=403, detail="Insufficient permissions for this resource.")
        return user
    return check_role
