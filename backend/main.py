import os
import asyncio
from datetime import datetime
from typing import Dict, List, Optional
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn

# Google ADK imports - DISABLED FOR DEBUGGING
GOOGLE_ADK_AVAILABLE = False
print("⚠️ Google ADK disabled for debugging")

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

# Setup authentication for Google services
def setup_google_auth():
    """Setup Google Cloud authentication using service account"""
    service_account_path = Path(__file__).parent / "service_account.json"
    
    if service_account_path.exists():
        os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = str(service_account_path)
        print("✅ Using service account authentication")
        print(f"✅ Project ID: {os.getenv('GOOGLE_PROJECT_ID', 'truxtsaas')}")
        print(f"✅ Client Email: {os.getenv('GOOGLE_CLIENT_EMAIL', 'adk-api-server@truxtsaas.iam.gserviceaccount.com')}")
        return True
    elif os.getenv("GOOGLE_API_KEY"):
        print("✅ Using API key authentication")
        return True
    else:
        print("⚠️ No authentication found. Please set GOOGLE_API_KEY or provide service_account.json")
        return False

# Initialize Google authentication
auth_available = setup_google_auth()

# Initialize the Google ADK agent with Gemini 2.0 Flash (Lazy initialization)
brand_pulse_agent = None
agent_initialized = False

def get_agent():
    """Lazy-load the AI agent to avoid hanging at startup"""
    global brand_pulse_agent, agent_initialized
    
    if agent_initialized:
        return brand_pulse_agent
    
    agent_initialized = True
    
    if not auth_available:
        print("⚠️ No authentication configured")
        brand_pulse_agent = create_mock_agent()
        return brand_pulse_agent
    
    try:
        # DISABLED FOR DEBUGGING - Use mock agent instead
        print("🤖 Using mock agent for debugging...")
        brand_pulse_agent = create_mock_agent()
        print("✅ BrandPulse Assistant (Mock) initialized successfully")
        print("ℹ️ Model ready for requests (test skipped to avoid connection issues)")
        return brand_pulse_agent
        
    except Exception as error:
        print(f"⚠️ Gemini initialization failed: {error}")
        print("🔧 Creating mock agent for development...")
        brand_pulse_agent = create_mock_agent()
        return brand_pulse_agent

def create_mock_agent():
    """Create a mock agent for development/fallback"""
    class MockAgent:
        def __init__(self):
            self.model_name = "mock-gemini-2.0-flash-exp"
        
        def generate_content(self, prompt):
            class MockResponse:
                def __init__(self):
                    self.text = f"""## 🤖 BrandPulse Assistant Response

**Status**: Running in development mode with mock AI agent
**Issue**: Google Generative AI not available

### 📊 Analysis Request:
{prompt}

### 🎯 Mock Analysis Response:

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

**Next Steps:**
- Set up real-time sentiment monitoring
- Implement automated alert system
- Create sentiment-based response workflows

---
*Note: This is a mock response. Real AI analysis requires Google Cloud authentication.*"""
            
            return MockResponse()
    
    print("✅ BrandPulse Assistant (Mock) initialized successfully")
    return MockAgent()

# Chat history storage (in production, use a proper database)
chat_sessions: Dict[str, List[Dict]] = {}

@app.get("/")
async def root():
    return {"message": "BrandPulse Chat API with Google ADK", "status": "running"}

@app.get("/health")
async def health_check():
    return {
        "status": "healthy", 
        "agent": os.getenv("AGENT_NAME", "BrandPulse_Assistant"), 
        "model": os.getenv("AGENT_MODEL", "gemini-2.0-flash-exp"),
        "agent_available": brand_pulse_agent is not None,
        "auth_method": "service_account" if Path(__file__).parent.joinpath("service_account.json").exists() else "api_key",
        "project_id": os.getenv("GOOGLE_PROJECT_ID"),
        "client_email": os.getenv("GOOGLE_CLIENT_EMAIL"),
        "agent_type": "ADK" if hasattr(brand_pulse_agent, 'agent_id') else "Gemini_Direct"
    }

@app.get("/test")
async def test_endpoint():
    """Simple test endpoint"""
    return {"message": "Backend is working!", "timestamp": datetime.now().isoformat()}

@app.get("/simple")
async def simple_endpoint():
    """Ultra-simple endpoint for testing connectivity"""
    return {"status": "ok", "message": "Connection successful"}

@app.get("/debug")
async def debug_info():
    """Debug endpoint to help with frontend troubleshooting"""
    return {
        "server_time": datetime.now().isoformat(),
        "cors_enabled": True,
        "allowed_origins": ["http://localhost:3000"],
        "agent_status": "available" if brand_pulse_agent is not None else "unavailable",
        "endpoints": {
            "health": "/health",
            "chat": "/api/chat", 
            "product_analysis": "/api/analyze/product",
            "chat_history": "/api/chat/history"
        },
        "message": "Backend is running and ready for frontend connections!"
    }

@app.post("/api/chat", response_model=ChatResponse)
async def chat_with_agent(message: ChatMessage):
    """
    Chat with the BrandPulse agent about product perception and analysis
    """
    # Lazy-load the agent on first use
    agent = get_agent()
    if agent is None:
        raise HTTPException(
            status_code=503, 
            detail="BrandPulse Assistant is not available. Please check authentication setup."
        )
    
    try:
        # Prepare the user message with additional context if provided
        user_input = message.text
        
        if message.product_name:
            user_input = f"Product: {message.product_name}\nQuestion: {message.text}"
        
        if message.context:
            user_input = f"{user_input}\nAdditional Context: {message.context}"
        
        # Create a comprehensive prompt for brand analysis
        full_prompt = f"""You are BrandPulse Assistant, an expert AI agent specialized in analyzing products and their public perception.

## Response Format Requirements:
- **Keep responses concise** (maximum 500 words)
- **Use clear markdown formatting** with proper headers, bullet points, and emphasis
- **Structure responses** with specific sections: Overview, Key Strengths, Key Weaknesses, Competitive Position, Recommendations
- **Use bullet points** for easy scanning
- **Bold important metrics** and key findings
- **Avoid lengthy paragraphs** - use short, punchy statements

## Analysis Guidelines:
- Focus on **specific, actionable insights** rather than generic statements
- Provide **data-driven observations** when possible
- Highlight **competitive advantages and disadvantages**
- Offer **concrete recommendations** for improvement
- Be **honest about limitations** and data sources

## Markdown Formatting Rules:
- Use `##` for main sections
- Use `###` for subsections  
- Use `**bold**` for emphasis on key points
- Use bullet points (`-`) for lists
- Use numbered lists (`1.`) for recommendations
- Keep paragraphs short (2-3 sentences max)

User question: {user_input}"""

        # Use the model directly
        if hasattr(agent, 'generate_content'):
            try:
                # Check if it's async or sync
                import inspect
                if inspect.iscoroutinefunction(agent.generate_content):
                    response_obj = await asyncio.to_thread(agent.generate_content, full_prompt, request_options={"timeout": 30})
                else:
                    response_obj = agent.generate_content(full_prompt, request_options={"timeout": 30})
                response = response_obj.text
            except Exception as gen_error:
                print(f"⚠️ Gemini API error: {gen_error}")
                # Fallback to mock response if Gemini fails
                response = f"""## 🤖 BrandPulse Assistant Response

**Status**: AI service temporarily unavailable
**Issue**: {str(gen_error)}

### 📊 Analysis Request:
{user_input}

### 🎯 Fallback Analysis Response:

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

**Next Steps:**
- Set up real-time sentiment monitoring
- Implement automated alert system
- Create sentiment-based response workflows

---
*Note: This is a fallback response. AI service will be restored shortly.*"""
        else:
            response = "Agent not properly initialized"
        
        # Store in chat history (session_id could be added for multiple users)
        session_id = "default"  # In production, generate proper session IDs
        if session_id not in chat_sessions:
            chat_sessions[session_id] = []
        
        chat_sessions[session_id].append({
            "user_message": message.text,
            "agent_response": response,
            "timestamp": datetime.now().isoformat(),
            "product_name": message.product_name
        })
        
        return ChatResponse(
            response=response,
            timestamp=datetime.now().isoformat(),
            agent_name="BrandPulse Assistant"
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing message: {str(e)}")

@app.get("/api/chat/history")
async def get_chat_history(session_id: str = "default"):
    """
    Get chat history for a session
    """
    if session_id not in chat_sessions:
        return {"messages": []}
    
    return {"messages": chat_sessions[session_id]}

@app.delete("/api/chat/history")
async def clear_chat_history(session_id: str = "default"):
    """
    Clear chat history for a session
    """
    if session_id in chat_sessions:
        del chat_sessions[session_id]
    
    return {"message": "Chat history cleared"}

@app.post("/api/analyze/product")
async def analyze_product_perception(product_name: str):
    """
    Get a comprehensive analysis of a product's public perception
    """
    # Lazy-load the agent on first use
    agent = get_agent()
    if agent is None:
        raise HTTPException(
            status_code=503, 
            detail="BrandPulse Assistant is not available. Please check authentication setup."
        )
    
    try:
        analysis_prompt = f"""Please provide a comprehensive analysis of the public perception for the product: {product_name}

Include the following in your analysis:
1. Current market sentiment and public opinion
2. Key strengths and weaknesses based on customer feedback
3. Competitive positioning
4. Recent trends and developments
5. Recommendations for improvement

Please search for recent information to ensure accuracy."""

        full_analysis_prompt = f"""You are BrandPulse Assistant, an expert AI agent specialized in analyzing products and their public perception.

## Response Format Requirements:
- **Keep responses concise** (maximum 500 words)
- **Use clear markdown formatting** with proper headers, bullet points, and emphasis
- **Structure responses** with specific sections: Overview, Key Strengths, Key Weaknesses, Competitive Position, Recommendations
- **Use bullet points** for easy scanning
- **Bold important metrics** and key findings
- **Avoid lengthy paragraphs** - use short, punchy statements

## Analysis Guidelines:
- Focus on **specific, actionable insights** rather than generic statements
- Provide **data-driven observations** when possible
- Highlight **competitive advantages and disadvantages**
- Offer **concrete recommendations** for improvement
- Be **honest about limitations** and data sources

## Markdown Formatting Rules:
- Use `##` for main sections
- Use `###` for subsections  
- Use `**bold**` for emphasis on key points
- Use bullet points (`-`) for lists
- Use numbered lists (`1.`) for recommendations
- Keep paragraphs short (2-3 sentences max)

## Product Analysis Request:
Please provide a comprehensive analysis of the public perception for: **{product_name}**

Include the following sections:
1. **Overview** - Brief market sentiment summary
2. **Key Strengths** - What customers love most
3. **Key Weaknesses** - Main pain points and complaints
4. **Competitive Position** - How it compares to competitors
5. **Recommendations** - Actionable improvement suggestions

{analysis_prompt}"""

        if hasattr(agent, 'generate_content'):
            try:
                # Check if it's async or sync
                import inspect
                if inspect.iscoroutinefunction(agent.generate_content):
                    response_obj = await asyncio.to_thread(agent.generate_content, full_analysis_prompt, request_options={"timeout": 30})
                else:
                    response_obj = agent.generate_content(full_analysis_prompt, request_options={"timeout": 30})
                response = response_obj.text
            except Exception as gen_error:
                print(f"⚠️ Gemini API error in product analysis: {gen_error}")
                # Fallback response for product analysis
                response = f"""## 🤖 BrandPulse Assistant Response

**Status**: AI service temporarily unavailable
**Issue**: {str(gen_error)}

### 📊 Product Analysis Request:
**{product_name}**

### 🎯 Fallback Analysis Response:

**Overview:**
- Market sentiment: Mixed with positive trends
- Public perception: Generally favorable with room for improvement
- Recent developments: Stable market position

**Key Strengths:**
- Quality and reliability
- Strong brand recognition
- Good user experience

**Key Weaknesses:**
- Pricing concerns
- Customer support issues
- Limited availability

**Competitive Position:**
- Strong market presence
- Competitive pricing
- Good differentiation

**Recommendations:**
1. **Improve customer support** response times
2. **Address pricing concerns** through value communication
3. **Enhance availability** and distribution
4. **Monitor competitor activities** closely

---
*Note: This is a fallback response. AI service will be restored shortly.*"""
        else:
            response = "Agent not properly initialized"
        
        return {
            "product_name": product_name,
            "analysis": response,
            "timestamp": datetime.now().isoformat(),
            "analysis_type": "comprehensive_perception_analysis"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error analyzing product: {str(e)}")

# Analytics endpoints
@app.get("/api/analytics/topics")
async def get_topics_analysis(timeRange: str = "7d"):
    """
    Get topic analysis data for the specified time range
    """
    try:
        # This endpoint will fetch topics from the database API
        import httpx
        
        # Call the database API to get topics data
        async with httpx.AsyncClient() as client:
            db_response = await client.get(
                f"http://localhost:8001/analytics/topics",
                params={"timeRange": timeRange},
                timeout=10.0
            )
            
            if db_response.status_code == 200:
                return db_response.json()
            else:
                # Fallback to mock data if database API fails
                return get_mock_topics_data()
                
    except Exception as e:
        print(f"Topics API error: {e}")
        # Return mock data as fallback
        return get_mock_topics_data()

@app.get("/api/dashboard/overview")
async def get_dashboard_overview():
    """
    Get dashboard overview data
    """
    try:
        print("📊 Dashboard overview endpoint called")
        return {
            "totalReviews": 15847,
            "positivePercent": 68.2,
            "negativePercent": 18.5,
            "neutralPercent": 13.3,
            "todayReviews": 1247,
            "weeklyGrowth": 12.5,
            "monthlyGrowth": 8.7,
            "avgResponseTime": "1.8 hours",
            "customerSatisfaction": 4.2,
            "topPositiveTopics": ["Quality", "Performance", "Design"],
            "topNegativeTopics": ["Price", "Support", "Delivery"],
            "recentAlerts": [
                {"type": "info", "message": "Analysis completed", "time": "Just now"},
                {"type": "success", "message": "Positive sentiment trend detected", "time": "1 hour ago"},
            ],
            "weeklyData": [
                {"day": "Mon", "positive": 120, "negative": 30, "neutral": 20},
                {"day": "Tue", "positive": 150, "negative": 25, "neutral": 15},
                {"day": "Wed", "positive": 180, "negative": 40, "neutral": 25},
                {"day": "Thu", "positive": 200, "negative": 35, "neutral": 30},
                {"day": "Fri", "positive": 220, "negative": 45, "neutral": 35},
                {"day": "Sat", "positive": 190, "negative": 30, "neutral": 25},
                {"day": "Sun", "positive": 160, "negative": 20, "neutral": 20},
            ]
        }
    except Exception as e:
        print(f"❌ Dashboard overview error: {e}")
        raise HTTPException(status_code=500, detail=f"Dashboard error: {str(e)}")

@app.get("/api/analytics/sentiment")
async def get_sentiment_analysis(timeRange: str = "7d", channel: str = "all"):
    """
    Get sentiment analysis data
    """
    return {
        "channelBreakdown": [
            {"channel": "Twitter", "positive": 45, "negative": 30, "neutral": 25, "total": 1000, "engagement": 85},
            {"channel": "Facebook", "positive": 60, "negative": 20, "neutral": 20, "total": 800, "engagement": 78},
            {"channel": "Instagram", "positive": 70, "negative": 15, "neutral": 15, "total": 600, "engagement": 92},
            {"channel": "Reviews", "positive": 55, "negative": 25, "neutral": 20, "total": 1200, "engagement": 88},
        ],
        "recentReviews": [
            {"id": 1, "text": "Great product, highly recommend!", "sentiment": "positive", "channel": "Twitter", "timestamp": "2024-01-15T10:30:00Z", "score": 0.8},
            {"id": 2, "text": "Not satisfied with the quality", "sentiment": "negative", "channel": "Facebook", "timestamp": "2024-01-15T09:15:00Z", "score": -0.6},
            {"id": 3, "text": "Average experience, nothing special", "sentiment": "neutral", "channel": "Reviews", "timestamp": "2024-01-15T08:45:00Z", "score": 0.1},
            {"id": 4, "text": "Amazing service and fast delivery!", "sentiment": "positive", "channel": "Instagram", "timestamp": "2024-01-15T07:20:00Z", "score": 0.9},
            {"id": 5, "text": "Could be better, had some issues", "sentiment": "negative", "channel": "Twitter", "timestamp": "2024-01-15T06:10:00Z", "score": -0.4},
        ],
        "topKeywords": [
            {"word": "quality", "count": 342, "sentiment": "positive"},
            {"word": "price", "count": 289, "sentiment": "negative"},
            {"word": "delivery", "count": 234, "sentiment": "positive"},
            {"word": "support", "count": 198, "sentiment": "negative"},
            {"word": "design", "count": 167, "sentiment": "positive"},
        ],
        "hourlyTrend": [
            {"hour": "00:00", "positive": 12, "negative": 3, "neutral": 2},
            {"hour": "01:00", "positive": 8, "negative": 2, "neutral": 1},
            {"hour": "02:00", "positive": 6, "negative": 1, "neutral": 1},
            {"hour": "03:00", "positive": 5, "negative": 1, "neutral": 0},
            {"hour": "04:00", "positive": 7, "negative": 2, "neutral": 1},
            {"hour": "05:00", "positive": 15, "negative": 4, "neutral": 2},
            {"hour": "06:00", "positive": 25, "negative": 6, "neutral": 3},
            {"hour": "07:00", "positive": 35, "negative": 8, "neutral": 4},
            {"hour": "08:00", "positive": 45, "negative": 12, "neutral": 6},
            {"hour": "09:00", "positive": 55, "negative": 15, "neutral": 8},
            {"hour": "10:00", "positive": 65, "negative": 18, "neutral": 10},
            {"hour": "11:00", "positive": 70, "negative": 20, "neutral": 12},
            {"hour": "12:00", "positive": 75, "negative": 22, "neutral": 14},
            {"hour": "13:00", "positive": 80, "negative": 25, "neutral": 16},
            {"hour": "14:00", "positive": 85, "negative": 28, "neutral": 18},
            {"hour": "15:00", "positive": 90, "negative": 30, "neutral": 20},
            {"hour": "16:00", "positive": 85, "negative": 28, "neutral": 18},
            {"hour": "17:00", "positive": 80, "negative": 25, "neutral": 16},
            {"hour": "18:00", "positive": 70, "negative": 20, "neutral": 12},
            {"hour": "19:00", "positive": 60, "negative": 18, "neutral": 10},
            {"hour": "20:00", "positive": 50, "negative": 15, "neutral": 8},
            {"hour": "21:00", "positive": 40, "negative": 12, "neutral": 6},
            {"hour": "22:00", "positive": 30, "negative": 8, "neutral": 4},
            {"hour": "23:00", "positive": 20, "negative": 5, "neutral": 2},
        ],
        "summary": {
            "totalMentions": 3600,
            "positiveMentions": 2160,
            "negativeMentions": 720,
            "neutralMentions": 720
        }
    }

@app.get("/api/products/search")
async def search_products(q: str = "", limit: int = 20):
    """
    Search products
    """
    mock_products = [
        {
            "id": 1,
            "name": "iPhone 15 Pro",
            "brand": "Apple",
            "category": "Smartphones",
            "price": 999.00,
            "image_url": "https://via.placeholder.com/300x300/007AFF/FFFFFF?text=iPhone+15+Pro",
            "sentiment_summary": {
                "positive": 72,
                "negative": 18,
                "neutral": 10,
                "avg_score": 0.68,
                "total_mentions": 1247
            }
        },
        {
            "id": 2,
            "name": "Samsung Galaxy S24",
            "brand": "Samsung",
            "category": "Smartphones",
            "price": 799.00,
            "image_url": "https://via.placeholder.com/300x300/1F2937/FFFFFF?text=Galaxy+S24",
            "sentiment_summary": {
                "positive": 65,
                "negative": 25,
                "neutral": 10,
                "avg_score": 0.55,
                "total_mentions": 892
            }
        },
        {
            "id": 3,
            "name": "MacBook Pro M3",
            "brand": "Apple",
            "category": "Laptops",
            "price": 1999.00,
            "image_url": "https://via.placeholder.com/300x300/007AFF/FFFFFF?text=MacBook+Pro",
            "sentiment_summary": {
                "positive": 78,
                "negative": 15,
                "neutral": 7,
                "avg_score": 0.72,
                "total_mentions": 634
            }
        },
        {
            "id": 4,
            "name": "Tesla Model Y",
            "brand": "Tesla",
            "category": "Electric Vehicles",
            "price": 47990.00,
            "image_url": "https://via.placeholder.com/300x300/CC0000/FFFFFF?text=Tesla+Model+Y",
            "sentiment_summary": {
                "positive": 68,
                "negative": 22,
                "neutral": 10,
                "avg_score": 0.58,
                "total_mentions": 1456
            }
        },
        {
            "id": 5,
            "name": "Nike Air Max 270",
            "brand": "Nike",
            "category": "Footwear",
            "price": 150.00,
            "image_url": "https://via.placeholder.com/300x300/FF6900/FFFFFF?text=Nike+Air+Max",
            "sentiment_summary": {
                "positive": 82,
                "negative": 12,
                "neutral": 6,
                "avg_score": 0.76,
                "total_mentions": 723
            }
        }
    ]
    
    # Filter products based on search query
    if q:
        filtered_products = [p for p in mock_products if q.lower() in p["name"].lower() or q.lower() in p["brand"].lower()]
    else:
        filtered_products = mock_products
    
    return {
        "results": filtered_products[:limit],
        "total": len(filtered_products),
        "query": q,
        "facets": {
            "brands": list(set([p["brand"] for p in filtered_products])),
            "categories": list(set([p["category"] for p in filtered_products])),
            "price_ranges": ["$0-$200", "$200-$1000", "$1000+"]
        }
    }
    
@app.get("/api/products/{product_id}/sentiment")
async def get_product_sentiment(product_id: int, timeRange: str = "7d"):
    """
    Get sentiment analysis for a specific product
    """
    # Mock product sentiment data
    mock_product_data = {
        1: {  # iPhone 15 Pro
            "summary": {
                "total_mentions": 1247,
                "positive_mentions": 897,
                "negative_mentions": 224,
                "neutral_mentions": 126,
                "avg_sentiment_score": 0.68,
                "trend": "increasing"
            },
            "timeline": [
                {"date": "2024-01-10", "positive": 45, "negative": 12, "neutral": 8, "total": 65},
                {"date": "2024-01-11", "positive": 52, "negative": 15, "neutral": 9, "total": 76},
                {"date": "2024-01-12", "positive": 48, "negative": 18, "neutral": 11, "total": 77},
                {"date": "2024-01-13", "positive": 61, "negative": 14, "neutral": 7, "total": 82},
                {"date": "2024-01-14", "positive": 55, "negative": 16, "neutral": 10, "total": 81},
                {"date": "2024-01-15", "positive": 58, "negative": 13, "neutral": 9, "total": 80},
                {"date": "2024-01-16", "positive": 62, "negative": 11, "neutral": 8, "total": 81}
            ],
            "channels": [
                {"channel": "Twitter", "positive": 58, "negative": 32, "neutral": 10, "total": 456},
                {"channel": "Amazon Reviews", "positive": 75, "negative": 18, "neutral": 7, "total": 289},
                {"channel": "YouTube", "positive": 82, "negative": 12, "neutral": 6, "total": 167},
                {"channel": "Reddit", "positive": 45, "negative": 40, "neutral": 15, "total": 234}
            ],
            "topics": [
                {"topic": "Camera Quality", "sentiment": "positive", "mentions": 342, "score": 0.78},
                {"topic": "Price", "sentiment": "negative", "mentions": 189, "score": -0.45},
                {"topic": "Battery Life", "sentiment": "neutral", "mentions": 156, "score": 0.12},
                {"topic": "Design", "sentiment": "positive", "mentions": 234, "score": 0.65},
                {"topic": "Performance", "sentiment": "positive", "mentions": 198, "score": 0.72}
            ]
        },
        2: {  # Samsung Galaxy S24
            "summary": {
                "total_mentions": 892,
                "positive_mentions": 580,
                "negative_mentions": 223,
                "neutral_mentions": 89,
                "avg_sentiment_score": 0.55,
                "trend": "stable"
            },
            "timeline": [
                {"date": "2024-01-10", "positive": 32, "negative": 18, "neutral": 6, "total": 56},
                {"date": "2024-01-11", "positive": 38, "negative": 22, "neutral": 8, "total": 68},
                {"date": "2024-01-12", "positive": 35, "negative": 25, "neutral": 9, "total": 69},
                {"date": "2024-01-13", "positive": 42, "negative": 20, "neutral": 7, "total": 69},
                {"date": "2024-01-14", "positive": 40, "negative": 24, "neutral": 8, "total": 72},
                {"date": "2024-01-15", "positive": 45, "negative": 19, "neutral": 6, "total": 70},
                {"date": "2024-01-16", "positive": 48, "negative": 17, "neutral": 7, "total": 72}
            ],
            "channels": [
                {"channel": "Twitter", "positive": 52, "negative": 35, "neutral": 13, "total": 312},
                {"channel": "Amazon Reviews", "positive": 68, "negative": 25, "neutral": 7, "total": 201},
                {"channel": "YouTube", "positive": 75, "negative": 18, "neutral": 7, "total": 134},
                {"channel": "Reddit", "positive": 38, "negative": 45, "neutral": 17, "total": 167}
            ],
            "topics": [
                {"topic": "Display Quality", "sentiment": "positive", "mentions": 234, "score": 0.68},
                {"topic": "Price", "sentiment": "negative", "mentions": 198, "score": -0.52},
                {"topic": "Camera", "sentiment": "positive", "mentions": 167, "score": 0.58},
                {"topic": "Software", "sentiment": "negative", "mentions": 145, "score": -0.38},
                {"topic": "Battery", "sentiment": "neutral", "mentions": 123, "score": 0.15}
            ]
        },
        3: {  # MacBook Pro M3
            "summary": {
                "total_mentions": 634,
                "positive_mentions": 494,
                "negative_mentions": 95,
                "neutral_mentions": 45,
                "avg_sentiment_score": 0.72,
                "trend": "increasing"
            },
            "timeline": [
                {"date": "2024-01-10", "positive": 28, "negative": 6, "neutral": 3, "total": 37},
                {"date": "2024-01-11", "positive": 32, "negative": 8, "neutral": 4, "total": 44},
                {"date": "2024-01-12", "positive": 30, "negative": 9, "neutral": 5, "total": 44},
                {"date": "2024-01-13", "positive": 35, "negative": 7, "neutral": 3, "total": 45},
                {"date": "2024-01-14", "positive": 38, "negative": 6, "neutral": 4, "total": 48},
                {"date": "2024-01-15", "positive": 42, "negative": 5, "neutral": 3, "total": 50},
                {"date": "2024-01-16", "positive": 45, "negative": 4, "neutral": 2, "total": 51}
            ],
            "channels": [
                {"channel": "Twitter", "positive": 68, "negative": 22, "neutral": 10, "total": 201},
                {"channel": "Amazon Reviews", "positive": 82, "negative": 12, "neutral": 6, "total": 156},
                {"channel": "YouTube", "positive": 88, "negative": 8, "neutral": 4, "total": 123},
                {"channel": "Reddit", "positive": 72, "negative": 18, "neutral": 10, "total": 154}
            ],
            "topics": [
                {"topic": "Performance", "sentiment": "positive", "mentions": 198, "score": 0.85},
                {"topic": "Price", "sentiment": "negative", "mentions": 145, "score": -0.62},
                {"topic": "Build Quality", "sentiment": "positive", "mentions": 123, "score": 0.78},
                {"topic": "Battery Life", "sentiment": "positive", "mentions": 98, "score": 0.72},
                {"topic": "Display", "sentiment": "positive", "mentions": 87, "score": 0.68}
            ]
        }
    }
    
    product_data = mock_product_data.get(product_id, {
        "summary": {
            "total_mentions": 0,
            "positive_mentions": 0,
            "negative_mentions": 0,
            "neutral_mentions": 0,
            "avg_sentiment_score": 0,
            "trend": "stable"
        },
        "timeline": [],
        "channels": [],
        "topics": []
    })
    
    return product_data

@app.get("/api/products/{product_id}")
async def get_product_details(product_id: int):
    """
    Get detailed information about a specific product
    """
    mock_products = {
        1: {
            "id": 1,
            "name": "iPhone 15 Pro",
            "brand": "Apple",
            "category": "Smartphones",
            "price": 999.00,
            "description": "Latest iPhone with titanium design and advanced camera system. Features include A17 Pro chip, 48MP camera system, and titanium construction.",
            "image_url": "https://via.placeholder.com/300x300/007AFF/FFFFFF?text=iPhone+15+Pro",
            "specifications": {
                "display": "6.1-inch Super Retina XDR",
                "storage": "128GB",
                "camera": "48MP Main + 12MP Ultra Wide",
                "chip": "A17 Pro",
                "battery": "Up to 23 hours video playback"
            },
            "sentiment_summary": {
                "positive": 72,
                "negative": 18,
                "neutral": 10,
                "avg_score": 0.68,
                "total_mentions": 1247,
                "trend": "increasing"
            }
        },
        2: {
            "id": 2,
            "name": "Samsung Galaxy S24",
            "brand": "Samsung",
            "category": "Smartphones",
            "price": 799.00,
            "description": "Samsung's flagship smartphone with advanced AI features, superior camera system, and premium design.",
            "image_url": "https://via.placeholder.com/300x300/1F2937/FFFFFF?text=Galaxy+S24",
            "specifications": {
                "display": "6.2-inch Dynamic AMOLED 2X",
                "storage": "256GB",
                "camera": "50MP Main + 12MP Ultra Wide",
                "chip": "Snapdragon 8 Gen 3",
                "battery": "4000mAh"
            },
            "sentiment_summary": {
                "positive": 65,
                "negative": 25,
                "neutral": 10,
                "avg_score": 0.55,
                "total_mentions": 892,
                "trend": "stable"
            }
        },
        3: {
            "id": 3,
            "name": "MacBook Pro M3",
            "brand": "Apple",
            "category": "Laptops",
            "price": 1999.00,
            "description": "Professional laptop with M3 chip, stunning Liquid Retina XDR display, and all-day battery life.",
            "image_url": "https://via.placeholder.com/300x300/007AFF/FFFFFF?text=MacBook+Pro",
            "specifications": {
                "display": "14.2-inch Liquid Retina XDR",
                "storage": "512GB SSD",
                "chip": "Apple M3",
                "memory": "8GB Unified Memory",
                "battery": "Up to 18 hours"
            },
            "sentiment_summary": {
                "positive": 78,
                "negative": 15,
                "neutral": 7,
                "avg_score": 0.72,
                "total_mentions": 634,
                "trend": "increasing"
            }
        }
    }
    
    product = mock_products.get(product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    return product

def get_mock_topics_data():
    """Mock topics data for development"""
    return {
        "topics": [
            { "id": 1, "name": "Product Quality", "count": 1250, "sentiment": "positive", "percentage": 35.2, "trend": "+12.5%", "keywords": ["quality", "durable", "reliable", "excellent"] },
            { "id": 2, "name": "Customer Service", "count": 980, "sentiment": "negative", "percentage": 27.6, "trend": "-5.2%", "keywords": ["support", "help", "response", "assistance"] },
            { "id": 3, "name": "Delivery Speed", "count": 750, "sentiment": "positive", "percentage": 21.1, "trend": "+8.7%", "keywords": ["fast", "quick", "shipping", "delivery"] },
            { "id": 4, "name": "Pricing", "count": 620, "sentiment": "neutral", "percentage": 17.5, "trend": "+2.1%", "keywords": ["price", "cost", "expensive", "affordable"] },
            { "id": 5, "name": "User Interface", "count": 480, "sentiment": "positive", "percentage": 13.5, "trend": "+15.3%", "keywords": ["interface", "design", "layout", "navigation"] },
            { "id": 6, "name": "Technical Support", "count": 420, "sentiment": "negative", "percentage": 11.8, "trend": "-8.9%", "keywords": ["technical", "bug", "issue", "problem"] },
            { "id": 7, "name": "Features", "count": 380, "sentiment": "positive", "percentage": 10.7, "trend": "+22.1%", "keywords": ["feature", "functionality", "capability", "option"] },
            { "id": 8, "name": "Documentation", "count": 320, "sentiment": "neutral", "percentage": 9.0, "trend": "+3.4%", "keywords": ["documentation", "guide", "manual", "tutorial"] },
            { "id": 9, "name": "Performance", "count": 280, "sentiment": "positive", "percentage": 7.9, "trend": "+18.6%", "keywords": ["performance", "speed", "efficient", "fast"] },
            { "id": 10, "name": "Security", "count": 240, "sentiment": "positive", "percentage": 6.8, "trend": "+11.2%", "keywords": ["security", "safe", "secure", "privacy"] },
        ],
        "trendingTopics": [
            { "name": "AI Features", "growth": "+45.2%", "sentiment": "positive" },
            { "name": "Mobile App", "growth": "+32.8%", "sentiment": "positive" },
            { "name": "Data Privacy", "growth": "+28.5%", "sentiment": "neutral" },
            { "name": "Integration Issues", "growth": "+15.7%", "sentiment": "negative" },
        ],
        "topicInsights": {
            "mostPositive": "Product Quality",
            "mostNegative": "Customer Service",
            "fastestGrowing": "AI Features",
            "mostDiscussed": "Pricing",
        }
    }

if __name__ == "__main__":
    print("🚀 Starting BrandPulse Chat API")
    print("🤖 Agent: BrandPulse Assistant")
    print("🧠 Model: Gemini 2.0 Flash")
    print("🔐 Using Service Account Authentication")
    print("-" * 50)
    
    if not auth_available:
        print("⚠️  Warning: No authentication configured. Please set up service account or API key.")
    
    # Note: Server startup is handled by Dockerfile CMD
    print("ℹ️ Server startup handled by Dockerfile CMD")
