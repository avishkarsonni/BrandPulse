# Backend API Requirements for Sentiment Analysis Dashboard

This document outlines the required API endpoints that your FastAPI/Flask backend should implement to work with the sentiment analysis dashboard.

## Base Configuration

### FastAPI Example
`python
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import datetime

app = FastAPI(title="Sentiment Analysis API", version="1.0.0")

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
`

### Flask Example
`python
from flask import Flask, jsonify, request
from flask_cors import CORS
import datetime

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend
`

## Required API Endpoints

### 1. Dashboard Overview
**Endpoint**: GET /api/dashboard/overview

**Response Format**:
`json
{
  "overview": {
    "totalReviews": 15847,
    "positivePercent": 68.2,
    "negativePercent": 18.5,
    "neutralPercent": 13.3,
    "avgSentimentScore": 0.65,
    "trendsPositive": 5.2,
    "trendsNegative": -2.1
  },
  "recentActivity": {
    "labels": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    "positive": [120, 135, 142, 156, 168, 145, 132],
    "negative": [45, 38, 42, 51, 48, 44, 39],
    "neutral": [23, 27, 25, 32, 28, 26, 24]
  },
  "channelDistribution": {
    "labels": ["Twitter", "Facebook", "Instagram", "Reviews", "Comments"],
    "data": [35, 25, 20, 15, 5]
  },
  "topicAnalysis": {
    "labels": ["Product Quality", "Customer Service", "Pricing", "Delivery", "Features"],
    "positive": [85, 72, 45, 68, 78],
    "negative": [15, 28, 55, 32, 22]
  }
}
`

### 2. Sentiment Analytics
**Endpoint**: GET /api/analytics/sentiment

**Query Parameters**:
- dateRange: string (last7days, last30days, last90days, custom)
- channel: string (all, twitter, facebook, instagram, reviews)
- sentiment: string (all, positive, negative, neutral)
- 	opic: string (all, or specific topic)
- startDate: string (ISO format, if dateRange=custom)
- endDate: string (ISO format, if dateRange=custom)

**Response Format**:
`json
{
  "summary": {
    "totalItems": 2547,
    "avgSentiment": 0.65,
    "sentimentDistribution": {
      "positive": 1738,
      "negative": 471,
      "neutral": 338
    },
    "engagementMetrics": {
      "avgLikes": 24.5,
      "avgShares": 8.2,
      "avgComments": 12.7
    }
  },
  "detailedData": [
    {
      "id": 1,
      "text": "Sample review text",
      "sentiment": "positive",
      "score": 0.856,
      "channel": "Twitter",
      "date": "2025-09-01",
      "engagement": {
        "likes": 45,
        "shares": 12,
        "comments": 8
      },
      "topics": ["Product Quality", "Customer Service"]
    }
  ]
}
`

### 3. Timeline Data
**Endpoint**: GET /api/analytics/timeline

**Query Parameters**:
- 	imeRange: string (hourly, daily, weekly)
- channel: string (all, twitter, facebook, etc.)
- metric: string (volume, sentiment, engagement)

**Response Format**:
`json
{
  "hourly": {
    "labels": ["00:00", "01:00", "02:00", ...],
    "volume": [45, 32, 28, ...],
    "positive": [30, 20, 18, ...],
    "negative": [10, 8, 6, ...],
    "neutral": [5, 4, 4, ...],
    "avgSentiment": [0.65, 0.72, 0.68, ...]
  },
  "events": [
    {
      "time": "14:30",
      "event": "Product Launch Announcement",
      "impact": "positive",
      "magnitude": "high"
    }
  ]
}
`

### 4. Topic Analysis
**Endpoint**: GET /api/analytics/topics

**Query Parameters**:
- sortBy: string (volume, sentiment, trend)
- sentiment: string (all, positive, negative, neutral)
- 	imeRange: string (last7days, last30days, etc.)
- searchTerm: string (optional)

**Response Format**:
`json
{
  "topicOverview": [
    {
      "id": 1,
      "name": "Product Quality",
      "volume": 2847,
      "sentiment": {
        "positive": 68.5,
        "negative": 18.2,
        "neutral": 13.3
      },
      "trend": 5.2,
      "keywords": ["quality", "durability", "material", "build"],
      "avgScore": 0.72
    }
  ],
  "wordCloud": [
    {"text": "quality", "value": 150},
    {"text": "service", "value": 120}
  ]
}
`

### 5. Channel Analytics
**Endpoint**: GET /api/analytics/channels

**Response Format**:
`json
{
  "channels": [
    {
      "name": "Twitter",
      "volume": 5420,
      "sentiment": {
        "positive": 65.2,
        "negative": 22.1,
        "neutral": 12.7
      },
      "engagement": {
        "avgLikes": 45.2,
        "avgShares": 12.8,
        "avgComments": 8.5
      },
      "trend": 3.2
    }
  ]
}
`

### 6. Process Text
**Endpoint**: POST /api/sentiment/process

**Request Body**:
`json
{
  "text": "This product is amazing! Great quality and fast delivery.",
  "metadata": {
    "channel": "twitter",
    "user_id": "user123",
    "timestamp": "2025-09-05T10:30:00Z"
  }
}
`

**Response Format**:
`json
{
  "sentiment": "positive",
  "score": 0.856,
  "confidence": 0.92,
  "topics": ["Product Quality", "Delivery"],
  "keywords": ["amazing", "quality", "fast"],
  "processing_time": 0.145
}
`

### 7. Batch Processing
**Endpoint**: POST /api/sentiment/batch

**Request Body**:
`json
{
  "items": [
    {
      "text": "Great product!",
      "metadata": {"channel": "twitter", "id": "1"}
    },
    {
      "text": "Poor customer service",
      "metadata": {"channel": "facebook", "id": "2"}
    }
  ]
}
`

**Response Format**:
`json
{
  "results": [
    {
      "id": "1",
      "sentiment": "positive",
      "score": 0.82,
      "topics": ["Product Quality"]
    },
    {
      "id": "2",
      "sentiment": "negative",
      "score": -0.65,
      "topics": ["Customer Service"]
    }
  ],
  "summary": {
    "total_processed": 2,
    "processing_time": 0.234,
    "success_rate": 100
  }
}
`

### 8. Export Data
**Endpoint**: GET /api/export

**Query Parameters**:
- ormat: string (csv, json, xlsx)
- dateRange: string
- channel: string
- sentiment: string

**Response**: Binary file data with appropriate content-type header

### 9. Settings Management
**Endpoint**: GET /api/settings

**Response Format**:
`json
{
  "api": {
    "baseUrl": "http://localhost:8000",
    "timeout": 10000,
    "retryAttempts": 3
  },
  "dashboard": {
    "autoRefresh": true,
    "refreshInterval": 30,
    "theme": "light"
  },
  "processing": {
    "batchSize": 100,
    "confidenceThreshold": 0.8,
    "modelVersion": "v2.1"
  }
}
`

**Endpoint**: PUT /api/settings

**Request Body**: Same format as GET response

## Authentication

### JWT Token Authentication
`python
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer
import jwt

security = HTTPBearer()

def verify_token(token: str = Depends(security)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        return payload
    except jwt.PyJWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials"
        )
`

### API Key Authentication
`python
from fastapi import Header, HTTPException

def verify_api_key(x_api_key: str = Header()):
    if x_api_key != VALID_API_KEY:
        raise HTTPException(status_code=401, detail="Invalid API Key")
    return x_api_key
`

## Error Handling

### Standard Error Response Format
`json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid date range provided",
    "details": {
      "field": "startDate",
      "value": "invalid-date"
    }
  }
}
`

### Common Error Codes
- VALIDATION_ERROR: Invalid input parameters
- NOT_FOUND: Resource not found
- UNAUTHORIZED: Authentication required
- RATE_LIMIT_EXCEEDED: Too many requests
- INTERNAL_ERROR: Server error

## Rate Limiting

Implement rate limiting to prevent abuse:

`python
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

@app.get("/api/sentiment/process")
@limiter.limit("100/minute")
async def process_sentiment(request: Request):
    # ... implementation
`

## WebSocket Support (Optional)

For real-time updates:

`python
from fastapi import WebSocket

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    while True:
        # Send real-time updates
        await websocket.send_json({
            "type": "sentiment_update",
            "data": get_latest_sentiment_data()
        })
        await asyncio.sleep(30)  # Update every 30 seconds
`

## Database Schema Recommendations

### Sentiment Analysis Table
`sql
CREATE TABLE sentiment_analysis (
    id SERIAL PRIMARY KEY,
    text TEXT NOT NULL,
    sentiment VARCHAR(20) NOT NULL,
    score FLOAT NOT NULL,
    confidence FLOAT,
    channel VARCHAR(50),
    user_id VARCHAR(100),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    topics JSONB,
    keywords JSONB,
    metadata JSONB
);
`

### Indexes for Performance
`sql
CREATE INDEX idx_sentiment_timestamp ON sentiment_analysis(timestamp);
CREATE INDEX idx_sentiment_channel ON sentiment_analysis(channel);
CREATE INDEX idx_sentiment_score ON sentiment_analysis(sentiment, score);
`

## Testing

### Sample Test Cases
`python
def test_dashboard_overview():
    response = client.get("/api/dashboard/overview")
    assert response.status_code == 200
    data = response.json()
    assert "overview" in data
    assert "totalReviews" in data["overview"]

def test_process_sentiment():
    payload = {
        "text": "This is a great product!",
        "metadata": {"channel": "test"}
    }
    response = client.post("/api/sentiment/process", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["sentiment"] in ["positive", "negative", "neutral"]
`

This API specification provides a complete backend interface for the sentiment analysis dashboard. Implement these endpoints in your chosen framework (FastAPI, Flask, etc.) to enable full functionality of the frontend dashboard.
