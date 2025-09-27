from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
import uuid

class OrderItem(BaseModel):
    product_id: str
    name: str
    quantity: int = Field(..., gt=0)
    price: float = Field(..., gt=0)
    unit: str

class OrderItemResponse(BaseModel):
    product_id: str
    name: str
    quantity: int
    price: float
    unit: str

class DeliveryPartner(BaseModel):
    name: str
    phone: str

class Order(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    order_id: str = Field(default_factory=lambda: f"ORD-{int(datetime.utcnow().timestamp())}")
    user_id: str
    items: List[OrderItem]
    subtotal: float = Field(..., gt=0)
    delivery_fee: float = Field(default=50.0)
    total: float = Field(..., gt=0)
    delivery_address: str = Field(..., min_length=5, max_length=200)
    status: str = Field(default="confirmed", pattern=r'^(confirmed|preparing|out_for_delivery|delivered)$')
    estimated_delivery: str = Field(default="30-45 minutes")
    delivery_partner: Optional[DeliveryPartner] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

class OrderCreate(BaseModel):
    items: List[OrderItem]
    total: float = Field(..., gt=0)
    delivery_address: str = Field(..., min_length=5, max_length=200)

class OrderResponse(BaseModel):
    id: str
    order_id: str
    user_id: str
    items: List[OrderItemResponse]
    subtotal: float
    delivery_fee: float
    total: float
    delivery_address: str
    status: str
    estimated_delivery: str
    delivery_partner: Optional[DeliveryPartner]
    created_at: datetime

class OrderStatusUpdate(BaseModel):
    status: str = Field(..., pattern=r'^(confirmed|preparing|out_for_delivery|delivered)$')