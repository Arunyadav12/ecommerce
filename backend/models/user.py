from pydantic import BaseModel, Field, EmailStr
from typing import Optional
from datetime import datetime
from passlib.context import CryptContext
import uuid
import hashlib
import base64

pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")

class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    shop_name: str = Field(..., min_length=2, max_length=100)
    mobile: str = Field(..., pattern=r'^\+?\d{1,4}\s?\d{10}$')
    location: str = Field(..., min_length=5, max_length=200)
    password_hash: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

class UserCreate(BaseModel):
    shop_name: str = Field(..., min_length=2, max_length=100)
    mobile: str = Field(..., pattern=r'^\+?\d{1,4}\s?\d{10}$')
    location: str = Field(..., min_length=5, max_length=200)
    password: str = Field(..., min_length=6)

class UserLogin(BaseModel):
    mobile: str = Field(..., pattern=r'^\+?\d{1,4}\s?\d{10}$')
    password: str = Field(..., min_length=6)

class UserResponse(BaseModel):
    id: str
    shop_name: str
    mobile: str
    location: str
    created_at: datetime

class AuthResponse(BaseModel):
    user: UserResponse
    token: str
    token_type: str = "bearer"

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain password against its hash."""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """Generate password hash."""
    return pwd_context.hash(password)