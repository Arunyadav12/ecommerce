from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
import uuid

class Product(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str = Field(..., min_length=2, max_length=100)
    price: float = Field(..., gt=0)
    category: str = Field(..., min_length=2, max_length=50)
    image: str = Field(..., min_length=5)
    unit: str = Field(..., min_length=1, max_length=20)
    min_order: int = Field(..., gt=0)
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

class ProductResponse(BaseModel):
    id: str
    name: str
    price: float
    category: str
    image: str
    unit: str
    min_order: int

class Category(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str = Field(..., min_length=2, max_length=50)
    icon: str = Field(..., min_length=2, max_length=50)
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

class CategoryResponse(BaseModel):
    id: str
    name: str
    icon: str