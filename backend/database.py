from motor.motor_asyncio import AsyncIOMotorClient
from models.user import User, get_password_hash
from models.product import Product, Category
from models.order import Order
import os
import logging

logger = logging.getLogger(__name__)

async def seed_database(db):
    """Seed the database with initial data."""
    
    # Check if categories already exist
    categories_count = await db.categories.count_documents({})
    if categories_count == 0:
        logger.info("Seeding categories...")
        categories = [
            {"id": "cat1", "name": "Vegetables", "icon": "Carrot", "is_active": True},
            {"id": "cat2", "name": "Grains", "icon": "Wheat", "is_active": True},
            {"id": "cat3", "name": "Dairy", "icon": "Milk", "is_active": True},
            {"id": "cat4", "name": "Spices", "icon": "Sparkles", "is_active": True},
            {"id": "cat5", "name": "Bakery", "icon": "Cookie", "is_active": True}
        ]
        await db.categories.insert_many(categories)
        logger.info(f"Inserted {len(categories)} categories")
    
    # Check if products already exist
    products_count = await db.products.count_documents({})
    if products_count == 0:
        logger.info("Seeding products...")
        products = [
            {
                "id": "prod1",
                "name": "Onion 1kg",
                "price": 45.0,
                "category": "Vegetables",
                "image": "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=300&h=200&fit=crop",
                "unit": "kg",
                "min_order": 5,
                "is_active": True
            },
            {
                "id": "prod2", 
                "name": "Potato 1kg",
                "price": 35.0,
                "category": "Vegetables",
                "image": "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=300&h=200&fit=crop",
                "unit": "kg",
                "min_order": 10,
                "is_active": True
            },
            {
                "id": "prod3",
                "name": "Tomato 1kg", 
                "price": 60.0,
                "category": "Vegetables",
                "image": "https://images.unsplash.com/photo-1546470427-e3b9b6808c38?w=300&h=200&fit=crop",
                "unit": "kg",
                "min_order": 5,
                "is_active": True
            },
            {
                "id": "prod4",
                "name": "Rice 10kg",
                "price": 450.0,
                "category": "Grains", 
                "image": "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=300&h=200&fit=crop",
                "unit": "bag",
                "min_order": 2,
                "is_active": True
            },
            {
                "id": "prod5",
                "name": "Wheat Flour 5kg",
                "price": 200.0,
                "category": "Grains",
                "image": "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=300&h=200&fit=crop", 
                "unit": "bag",
                "min_order": 4,
                "is_active": True
            },
            {
                "id": "prod6",
                "name": "Milk 1L",
                "price": 55.0,
                "category": "Dairy",
                "image": "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=300&h=200&fit=crop",
                "unit": "bottle",
                "min_order": 12,
                "is_active": True
            },
            {
                "id": "prod7", 
                "name": "Eggs (30 pcs)",
                "price": 180.0,
                "category": "Dairy",
                "image": "https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=300&h=200&fit=crop",
                "unit": "tray",
                "min_order": 2,
                "is_active": True
            },
            {
                "id": "prod8",
                "name": "Turmeric Powder 500g",
                "price": 120.0,
                "category": "Spices",
                "image": "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=300&h=200&fit=crop",
                "unit": "pack",
                "min_order": 6,
                "is_active": True
            },
            {
                "id": "prod9",
                "name": "Red Chili Powder 500g", 
                "price": 150.0,
                "category": "Spices",
                "image": "https://images.unsplash.com/photo-1583058138034-bfea558b26e2?w=300&h=200&fit=crop",
                "unit": "pack",
                "min_order": 6,
                "is_active": True
            },
            {
                "id": "prod10",
                "name": "Bread (20 pcs)",
                "price": 80.0, 
                "category": "Bakery",
                "image": "https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=300&h=200&fit=crop",
                "unit": "pack",
                "min_order": 5,
                "is_active": True
            }
        ]
        await db.products.insert_many(products)
        logger.info(f"Inserted {len(products)} products")

    logger.info("Database seeding completed")