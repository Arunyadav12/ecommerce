from fastapi import FastAPI, APIRouter, HTTPException, status, Depends
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime

# Import models and auth
from models.user import User, UserCreate, UserLogin, UserResponse, AuthResponse, verify_password, get_password_hash
from models.product import Product, ProductResponse, Category, CategoryResponse
from models.order import Order, OrderCreate, OrderResponse, OrderStatusUpdate, DeliveryPartner
from auth import AuthManager, get_current_user
from database import seed_database

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI(title="WholeMart API", version="1.0.0")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Health check endpoint
@api_router.get("/")
async def root():
    return {"message": "WholeMart API is running"}

# Authentication endpoints
@api_router.post("/auth/register", response_model=AuthResponse)
async def register_user(user_data: UserCreate):
    # Check if user already exists
    existing_user = await db.users.find_one({"mobile": user_data.mobile})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Mobile number already registered"
        )
    
    # Create new user
    user = User(
        shop_name=user_data.shop_name,
        mobile=user_data.mobile,
        location=user_data.location,
        password_hash=get_password_hash(user_data.password)
    )
    
    # Save to database
    await db.users.insert_one(user.dict())
    
    # Create response
    user_response = UserResponse(
        id=user.id,
        shop_name=user.shop_name,
        mobile=user.mobile,
        location=user.location,
        created_at=user.created_at
    )
    
    # Generate token
    token = AuthManager.create_token(user.id)
    
    return AuthResponse(user=user_response, token=token)

@api_router.post("/auth/login", response_model=AuthResponse)
async def login_user(user_data: UserLogin):
    # Find user by mobile
    user_doc = await db.users.find_one({"mobile": user_data.mobile})
    if not user_doc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid mobile number or password"
        )
    
    # Verify password
    if not verify_password(user_data.password, user_doc["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid mobile number or password"
        )
    
    # Create response
    user_response = UserResponse(
        id=user_doc["id"],
        shop_name=user_doc["shop_name"],
        mobile=user_doc["mobile"],
        location=user_doc["location"],
        created_at=user_doc["created_at"]
    )
    
    # Generate token
    token = AuthManager.create_token(user_doc["id"])
    
    return AuthResponse(user=user_response, token=token)

@api_router.get("/auth/me", response_model=UserResponse)
async def get_current_user_info(current_user=Depends(get_current_user)):
    return UserResponse(
        id=current_user["id"],
        shop_name=current_user["shop_name"],
        mobile=current_user["mobile"],
        location=current_user["location"],
        created_at=current_user["created_at"]
    )

# Products endpoints
@api_router.get("/products", response_model=List[ProductResponse])
async def get_products(category: Optional[str] = None, search: Optional[str] = None):
    query = {"is_active": True}
    
    if category:
        query["category"] = category
    
    if search:
        query["name"] = {"$regex": search, "$options": "i"}
    
    products = await db.products.find(query).to_list(100)
    return [ProductResponse(**product) for product in products]

@api_router.get("/products/{product_id}", response_model=ProductResponse)
async def get_product(product_id: str):
    product = await db.products.find_one({"id": product_id, "is_active": True})
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    return ProductResponse(**product)

@api_router.get("/categories", response_model=List[CategoryResponse])
async def get_categories():
    categories = await db.categories.find({"is_active": True}).to_list(50)
    return [CategoryResponse(**category) for category in categories]

# Orders endpoints
@api_router.post("/orders", response_model=OrderResponse)
async def create_order(order_data: OrderCreate, current_user=Depends(get_current_user)):
    # Calculate delivery fee and total
    subtotal = sum(item.price * item.quantity for item in order_data.items)
    delivery_fee = 50.0
    calculated_total = subtotal + delivery_fee
    
    # Validate total
    if abs(calculated_total - order_data.total) > 1:  # Allow 1 rupee tolerance
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid total amount"
        )
    
    # Create order
    order = Order(
        user_id=current_user["id"],
        items=order_data.items,
        subtotal=subtotal,
        delivery_fee=delivery_fee,
        total=calculated_total,
        delivery_address=order_data.delivery_address
    )
    
    # Save to database
    await db.orders.insert_one(order.dict())
    
    return OrderResponse(**order.dict())

@api_router.get("/orders/{order_id}", response_model=OrderResponse)
async def get_order(order_id: str, current_user=Depends(get_current_user)):
    order = await db.orders.find_one({"order_id": order_id, "user_id": current_user["id"]})
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    return OrderResponse(**order)

@api_router.get("/orders", response_model=List[OrderResponse])
async def get_user_orders(current_user=Depends(get_current_user)):
    orders = await db.orders.find({"user_id": current_user["id"]}).sort("created_at", -1).to_list(100)
    return [OrderResponse(**order) for order in orders]

@api_router.patch("/orders/{order_id}/status", response_model=OrderResponse)
async def update_order_status(order_id: str, status_data: OrderStatusUpdate, current_user=Depends(get_current_user)):
    # Find order
    order = await db.orders.find_one({"order_id": order_id, "user_id": current_user["id"]})
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    
    # Update status and delivery partner if out for delivery
    update_data = {
        "status": status_data.status,
        "updated_at": datetime.utcnow()
    }
    
    if status_data.status == "out_for_delivery":
        update_data["delivery_partner"] = {
            "name": "Ravi Kumar",
            "phone": "+91 98765 43210"
        }
    
    # Update in database
    await db.orders.update_one(
        {"order_id": order_id, "user_id": current_user["id"]},
        {"$set": update_data}
    )
    
    # Return updated order
    updated_order = await db.orders.find_one({"order_id": order_id, "user_id": current_user["id"]})
    return OrderResponse(**updated_order)

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("startup")
async def startup_db_client():
    # Seed database with initial data
    await seed_database(db)
    logger.info("Database initialized and seeded")

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
