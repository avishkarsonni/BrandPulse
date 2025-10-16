import os
import asyncio
from datetime import datetime
from typing import Dict, List, Optional
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn

from google.adk.agents import Agent
from google.adk.tools import google_search

# Initialize FastAPI app
app = FastAPI(title="BrandPulse Chat API", version="1.0.0")

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001", "http://localhost:3002"],  # React dev server
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

# Initialize the Google ADK agent with Gemini 2.0 Flash
brand_pulse_agent = None
if auth_available:
    try:
        # Initialize Google ADK Agent
        from google.adk.agents import Agent
        
        # Configure the agent with environment variables
        agent_config = {
            "project_id": os.getenv("GOOGLE_ADK_PROJECT_ID", "truxtsaas"),
            "location": os.getenv("GOOGLE_ADK_LOCATION", "us-central1"),
            "agent_id": os.getenv("GOOGLE_ADK_AGENT_ID", "brandpulse-agent"),
            "model": os.getenv("GOOGLE_ADK_MODEL", "gemini-2.0-flash-exp")
        }
        
        print(f"🤖 Initializing ADK Agent with config: {agent_config}")
        
        # Try to create ADK agent
        try:
            brand_pulse_agent = Agent(
                project_id=agent_config["project_id"],
                location=agent_config["location"],
                agent_id=agent_config["agent_id"]
            )
            print("✅ BrandPulse ADK Agent initialized successfully")
        except Exception as adk_error:
            print(f"⚠️ ADK Agent failed, falling back to direct Gemini: {adk_error}")
            
            # Fallback to direct Gemini API
            import google.generativeai as genai
            
            # Configure the model with the service account
            genai.configure()  # Uses GOOGLE_APPLICATION_CREDENTIALS
            
            # Create a simple model instance  
            model = genai.GenerativeModel(agent_config["model"])
            
            # Store the model instead of the agent
            brand_pulse_agent = model
            print("✅ BrandPulse Assistant (Gemini direct) initialized successfully")
            
    except Exception as e:
        print(f"❌ Failed to initialize any agent: {e}")
        brand_pulse_agent = None

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
    if brand_pulse_agent is None:
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
        response_obj = await asyncio.to_thread(brand_pulse_agent.generate_content, full_prompt)
        response = response_obj.text
        
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
    if brand_pulse_agent is None:
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

        response_obj = await asyncio.to_thread(brand_pulse_agent.generate_content, full_analysis_prompt)
        response = response_obj.text
        
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
    
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
