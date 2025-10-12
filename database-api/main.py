import os
import asyncio
from datetime import datetime, date
from typing import Dict, List, Optional, Any
from pathlib import Path

from fastapi import FastAPI, HTTPException, Query, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
from sqlalchemy import create_engine, text, MetaData, Table, Column, Integer, String, Text, Float, DateTime, Date, Boolean, JSON
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, declarative_base
from databases import Database
import asyncpg

# Initialize FastAPI app
app = FastAPI(title="BrandPulse Database API", version="1.0.0")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database configuration
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://brandpulse_user:brandpulse_password@localhost:5432/brandpulse")
database = Database(DATABASE_URL)

# Pydantic models for API
class Product(BaseModel):
    id: Optional[int] = None
    name: str
    sku: str
    description: Optional[str] = None
    category: Optional[str] = None
    brand: Optional[str] = None
    price: Optional[float] = None
    url: Optional[str] = None
    image_url: Optional[str] = None
    status: str = "active"

class ProductPage(BaseModel):
    id: Optional[int] = None
    product_id: int
    url: str
    page_type: str
    platform: Optional[str] = None
    title: Optional[str] = None
    meta_description: Optional[str] = None
    content_summary: Optional[str] = None

class SentimentAnalysis(BaseModel):
    id: Optional[int] = None
    product_id: Optional[int] = None
    page_id: Optional[int] = None
    text: str
    sentiment: str
    score: float
    confidence: Optional[float] = None
    channel: Optional[str] = None
    topics: Optional[Dict] = None
    keywords: Optional[Dict] = None
    engagement_metrics: Optional[Dict] = None
    metadata: Optional[Dict] = None

class ProductAnalytics(BaseModel):
    id: Optional[int] = None
    product_id: int
    date: date
    total_mentions: int = 0
    positive_mentions: int = 0
    negative_mentions: int = 0
    neutral_mentions: int = 0
    avg_sentiment_score: float = 0.0
    total_engagement: int = 0
    channel_breakdown: Optional[Dict] = None
    topic_breakdown: Optional[Dict] = None

# Database connection events
@app.on_event("startup")
async def startup():
    await database.connect()
    print("✅ Connected to database")

@app.on_event("shutdown")
async def shutdown():
    await database.disconnect()
    print("❌ Disconnected from database")

# Health check
@app.get("/health")
async def health_check():
    try:
        await database.execute("SELECT 1")
        return {
            "status": "healthy",
            "service": "database-api",
            "database": "connected",
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Database connection failed: {str(e)}")

# Product endpoints
@app.get("/products", response_model=List[Product])
async def get_products(
    limit: int = Query(50, le=100),
    offset: int = Query(0, ge=0),
    category: Optional[str] = None,
    brand: Optional[str] = None,
    search: Optional[str] = None
):
    """Get products with optional filtering"""
    query = """
        SELECT p.*, 
               COALESCE(pa.total_mentions, 0) as total_mentions,
               COALESCE(pa.positive_mentions, 0) as positive_mentions,
               COALESCE(pa.negative_mentions, 0) as negative_mentions,
               COALESCE(pa.neutral_mentions, 0) as neutral_mentions,
               COALESCE(pa.avg_sentiment_score, 0) as avg_sentiment_score
        FROM products p
        LEFT JOIN product_analytics pa ON p.id = pa.product_id AND pa.date = CURRENT_DATE
        WHERE p.status = 'active'
    """
    params = {}
    
    if category:
        query += " AND p.category ILIKE :category"
        params["category"] = f"%{category}%"
    
    if brand:
        query += " AND p.brand ILIKE :brand"
        params["brand"] = f"%{brand}%"
    
    if search:
        query += " AND (p.name ILIKE :search OR p.description ILIKE :search)"
        params["search"] = f"%{search}%"
    
    query += " ORDER BY p.created_at DESC LIMIT :limit OFFSET :offset"
    params["limit"] = limit
    params["offset"] = offset
    
    results = await database.fetch_all(query, params)
    return results

@app.get("/products/{product_id}", response_model=Product)
async def get_product(product_id: int):
    """Get a specific product by ID"""
    query = """
        SELECT p.*, 
               COALESCE(pa.total_mentions, 0) as total_mentions,
               COALESCE(pa.positive_mentions, 0) as positive_mentions,
               COALESCE(pa.negative_mentions, 0) as negative_mentions,
               COALESCE(pa.neutral_mentions, 0) as neutral_mentions,
               COALESCE(pa.avg_sentiment_score, 0) as avg_sentiment_score
        FROM products p
        LEFT JOIN product_analytics pa ON p.id = pa.product_id AND pa.date = CURRENT_DATE
        WHERE p.id = :product_id
    """
    result = await database.fetch_one(query, {"product_id": product_id})
    if not result:
        raise HTTPException(status_code=404, detail="Product not found")
    return result

@app.post("/products", response_model=Product)
async def create_product(product: Product):
    """Create a new product"""
    query = """
        INSERT INTO products (name, sku, description, category, brand, price, url, image_url, status)
        VALUES (:name, :sku, :description, :category, :brand, :price, :url, :image_url, :status)
        RETURNING *
    """
    result = await database.fetch_one(query, product.dict(exclude={"id"}))
    return result

@app.put("/products/{product_id}", response_model=Product)
async def update_product(product_id: int, product: Product):
    """Update an existing product"""
    query = """
        UPDATE products 
        SET name = :name, sku = :sku, description = :description, category = :category, 
            brand = :brand, price = :price, url = :url, image_url = :image_url, 
            status = :status, updated_at = CURRENT_TIMESTAMP
        WHERE id = :product_id
        RETURNING *
    """
    params = product.dict(exclude={"id"})
    params["product_id"] = product_id
    result = await database.fetch_one(query, params)
    if not result:
        raise HTTPException(status_code=404, detail="Product not found")
    return result

@app.delete("/products/{product_id}")
async def delete_product(product_id: int):
    """Delete a product (soft delete by setting status to inactive)"""
    query = """
        UPDATE products 
        SET status = 'inactive', updated_at = CURRENT_TIMESTAMP
        WHERE id = :product_id
        RETURNING id
    """
    result = await database.fetch_one(query, {"product_id": product_id})
    if not result:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"message": "Product deleted successfully"}

# Product pages endpoints
@app.get("/products/{product_id}/pages")
async def get_product_pages(product_id: int):
    """Get all pages related to a product"""
    query = """
        SELECT pp.*, 
               COUNT(sa.id) as sentiment_count,
               AVG(sa.score) as avg_sentiment_score,
               COUNT(sa.id) FILTER (WHERE sa.sentiment = 'positive') as positive_count,
               COUNT(sa.id) FILTER (WHERE sa.sentiment = 'negative') as negative_count,
               COUNT(sa.id) FILTER (WHERE sa.sentiment = 'neutral') as neutral_count
        FROM product_pages pp
        LEFT JOIN sentiment_analysis sa ON pp.id = sa.page_id
        WHERE pp.product_id = :product_id
        GROUP BY pp.id
        ORDER BY pp.created_at DESC
    """
    results = await database.fetch_all(query, {"product_id": product_id})
    return {"pages": results, "total": len(results)}

@app.post("/products/{product_id}/pages")
async def create_product_page(product_id: int, page: ProductPage):
    """Create a new product page"""
    page.product_id = product_id
    query = """
        INSERT INTO product_pages (product_id, url, page_type, platform, title, meta_description, content_summary)
        VALUES (:product_id, :url, :page_type, :platform, :title, :meta_description, :content_summary)
        RETURNING *
    """
    result = await database.fetch_one(query, page.dict(exclude={"id"}))
    return result

# Sentiment analysis endpoints
@app.get("/sentiment")
async def get_sentiment_analysis(
    product_id: Optional[int] = None,
    page_id: Optional[int] = None,
    sentiment: Optional[str] = None,
    channel: Optional[str] = None,
    limit: int = Query(100, le=1000),
    offset: int = Query(0, ge=0)
):
    """Get sentiment analysis data with filtering"""
    query = """
        SELECT sa.*, p.name as product_name, pp.title as page_title
        FROM sentiment_analysis sa
        LEFT JOIN products p ON sa.product_id = p.id
        LEFT JOIN product_pages pp ON sa.page_id = pp.id
        WHERE 1=1
    """
    params = {}
    
    if product_id:
        query += " AND sa.product_id = :product_id"
        params["product_id"] = product_id
    
    if page_id:
        query += " AND sa.page_id = :page_id"
        params["page_id"] = page_id
    
    if sentiment:
        query += " AND sa.sentiment = :sentiment"
        params["sentiment"] = sentiment
    
    if channel:
        query += " AND sa.channel = :channel"
        params["channel"] = channel
    
    query += " ORDER BY sa.timestamp DESC LIMIT :limit OFFSET :offset"
    params["limit"] = limit
    params["offset"] = offset
    
    results = await database.fetch_all(query, params)
    return {"results": results, "total": len(results)}

@app.post("/sentiment")
async def create_sentiment_analysis(sentiment: SentimentAnalysis):
    """Create new sentiment analysis entry"""
    query = """
        INSERT INTO sentiment_analysis (
            product_id, page_id, text, sentiment, score, confidence, 
            channel, topics, keywords, engagement_metrics, metadata
        )
        VALUES (
            :product_id, :page_id, :text, :sentiment, :score, :confidence,
            :channel, :topics, :keywords, :engagement_metrics, :metadata
        )
        RETURNING *
    """
    result = await database.fetch_one(query, sentiment.dict(exclude={"id"}))
    return result

# Analytics endpoints
@app.get("/analytics/products/{product_id}")
async def get_product_analytics(
    product_id: int,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None
):
    """Get analytics for a specific product"""
    query = """
        SELECT * FROM product_analytics 
        WHERE product_id = :product_id
    """
    params = {"product_id": product_id}
    
    if start_date:
        query += " AND date >= :start_date"
        params["start_date"] = start_date
    
    if end_date:
        query += " AND date <= :end_date"
        params["end_date"] = end_date
    
    query += " ORDER BY date DESC"
    
    results = await database.fetch_all(query, params)
    return {"analytics": results, "product_id": product_id}

@app.get("/analytics/overview")
async def get_analytics_overview():
    """Get overall analytics overview"""
    queries = {
        "total_products": "SELECT COUNT(*) as count FROM products WHERE status = 'active'",
        "total_sentiment": "SELECT COUNT(*) as count FROM sentiment_analysis",
        "avg_sentiment": "SELECT AVG(score) as avg_score FROM sentiment_analysis",
        "sentiment_breakdown": """
            SELECT sentiment, COUNT(*) as count 
            FROM sentiment_analysis 
            GROUP BY sentiment
        """,
        "channel_breakdown": """
            SELECT channel, COUNT(*) as count 
            FROM sentiment_analysis 
            WHERE channel IS NOT NULL
            GROUP BY channel 
            ORDER BY count DESC
        """,
        "recent_activity": """
            SELECT DATE(timestamp) as date, COUNT(*) as count
            FROM sentiment_analysis 
            WHERE timestamp >= CURRENT_DATE - INTERVAL '30 days'
            GROUP BY DATE(timestamp)
            ORDER BY date DESC
        """
    }
    
    results = {}
    for key, query in queries.items():
        if key in ["sentiment_breakdown", "channel_breakdown", "recent_activity"]:
            results[key] = await database.fetch_all(query)
        else:
            result = await database.fetch_one(query)
            results[key] = result["count"] if key != "avg_sentiment" else result["avg_score"]
    
    return results

# Search endpoints
@app.get("/search/products")
async def search_products(q: str, limit: int = Query(20, le=100)):
    """Full-text search for products"""
    query = """
        SELECT p.*, ts_rank(psi.search_vector, plainto_tsquery('english', :query)) as rank
        FROM products p
        JOIN product_search_index psi ON p.id = psi.product_id
        WHERE psi.search_vector @@ plainto_tsquery('english', :query)
        ORDER BY rank DESC, p.created_at DESC
        LIMIT :limit
    """
    results = await database.fetch_all(query, {"query": q, "limit": limit})
    return {"results": results, "query": q}

@app.get("/search/suggestions")
async def get_search_suggestions(q: str, limit: int = Query(5, le=10)):
    """Get search suggestions for products"""
    query = """
        SELECT DISTINCT name, brand, category
        FROM products 
        WHERE (name ILIKE :query OR brand ILIKE :query OR category ILIKE :query)
        AND status = 'active'
        LIMIT :limit
    """
    results = await database.fetch_all(query, {"query": f"%{q}%", "limit": limit})
    suggestions = []
    for result in results:
        suggestions.extend([result["name"], result["brand"], result["category"]])
    return {"suggestions": list(set(filter(None, suggestions)))[:limit]}

# Utility endpoints
@app.post("/utils/refresh-analytics")
async def refresh_analytics():
    """Manually refresh product analytics"""
    query = """
        INSERT INTO product_analytics (
            product_id, date, total_mentions, positive_mentions, 
            negative_mentions, neutral_mentions, avg_sentiment_score
        )
        SELECT 
            product_id,
            CURRENT_DATE,
            COUNT(*),
            COUNT(*) FILTER (WHERE sentiment = 'positive'),
            COUNT(*) FILTER (WHERE sentiment = 'negative'),
            COUNT(*) FILTER (WHERE sentiment = 'neutral'),
            AVG(score)
        FROM sentiment_analysis 
        WHERE DATE(timestamp) = CURRENT_DATE
        AND product_id IS NOT NULL
        GROUP BY product_id
        ON CONFLICT (product_id, date) DO UPDATE SET
            total_mentions = EXCLUDED.total_mentions,
            positive_mentions = EXCLUDED.positive_mentions,
            negative_mentions = EXCLUDED.negative_mentions,
            neutral_mentions = EXCLUDED.neutral_mentions,
            avg_sentiment_score = EXCLUDED.avg_sentiment_score,
            updated_at = CURRENT_TIMESTAMP
    """
    await database.execute(query)
    return {"message": "Analytics refreshed successfully"}

if __name__ == "__main__":
    print("🚀 Starting BrandPulse Database API")
    print("🗄️  Service: Database API")
    print("🔗 Database: PostgreSQL")
    print("-" * 50)
    
    uvicorn.run("main:app", host="0.0.0.0", port=8001, reload=True)

