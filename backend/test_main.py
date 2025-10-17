import os
import asyncio
from datetime import datetime
from typing import Dict, List, Optional
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn

# Initialize FastAPI app
app = FastAPI(title="BrandPulse Chat API", version="1.0.0")

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000", 
        "http://localhost:3001", 
        "http://localhost:3002",
        "http://frontend:80",
        "http://brandpulse-frontend:80",
        "http://localhost:80"
    ],  # React dev server and Docker containers
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models for request/response
class ChatMessage(BaseModel):
    text: str
    product_name: Optional[str] = None
    context: Optional[str] = None

class ChatResponse(BaseModel):
    response: str
    timestamp: str
    agent_name: str

@app.get("/")
async def root():
    return {"message": "BrandPulse Chat API Test", "status": "running"}

@app.get("/health")
async def health_check():
    return {
        "status": "healthy", 
        "agent": "BrandPulse_Assistant", 
        "model": "test-mode",
        "agent_available": True,
        "auth_method": "test",
        "project_id": "test",
        "client_email": "test",
        "agent_type": "Test"
    }

@app.get("/test")
async def test_endpoint():
    """Simple test endpoint"""
    return {"message": "Backend is working!", "timestamp": datetime.now().isoformat()}

@app.get("/simple")
async def simple_endpoint():
    """Ultra-simple endpoint for testing connectivity"""
    return {"status": "ok", "message": "Connection successful"}

@app.post("/api/chat", response_model=ChatResponse)
async def chat_with_agent(message: ChatMessage):
    """
    Chat with the BrandPulse agent about product perception and analysis
    """
    try:
        # Simple mock response
        response = f"""## 🤖 BrandPulse Assistant Response (Test Mode)

**Status**: Running in test mode
**Request**: {message.text}

### 📊 Analysis Response:

**Product Sentiment Overview:**
- Overall sentiment: Mixed (60% positive, 25% neutral, 15% negative)
- Key strengths: Quality, reliability, user experience
- Areas for improvement: Pricing, customer support

**Competitive Position:**
- Market share: Strong in target segments
- Differentiation: Innovation and brand trust
- Threats: Emerging competitors, price sensitivity

**Recommendations:**
1. **Monitor sentiment trends** across all channels
2. **Address negative feedback** proactively
3. **Leverage positive mentions** for marketing
4. **Track competitor activities** regularly

---
*Note: This is a test response. Real AI analysis requires proper configuration.*"""
        
        return ChatResponse(
            response=response,
            timestamp=datetime.now().isoformat(),
            agent_name="BrandPulse Assistant (Test)"
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing message: {str(e)}")

if __name__ == "__main__":
    print("🚀 Starting BrandPulse Chat API (Test Mode)")
    print("🤖 Agent: BrandPulse Assistant (Test)")
    print("🧠 Model: Test Mode")
    print("-" * 50)
    
    uvicorn.run(
        "test_main:app", 
        host="0.0.0.0", 
        port=8002, 
        reload=False, 
        log_level="info", 
        access_log=True, 
        workers=1
    )
