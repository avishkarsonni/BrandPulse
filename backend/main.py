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
# Try a different approach - use google.genai directly for now
        import google.generativeai as genai
        
        # Configure the model with the service account
        genai.configure()  # Uses GOOGLE_APPLICATION_CREDENTIALS
        
        # Create a simple model instance  
        model = genai.GenerativeModel('gemini-2.0-flash-exp')
        
        # Store the model instead of the agent
        brand_pulse_agent = model
        print("✅ BrandPulse Assistant initialized successfully")
    except Exception as e:
        print(f"❌ Failed to initialize agent: {e}")
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
        "agent": "BrandPulse_Assistant", 
        "model": "gemini-2.0-flash-exp",
        "agent_available": brand_pulse_agent is not None,
        "auth_method": "service_account" if Path(__file__).parent.joinpath("service_account.json").exists() else "api_key"
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

if __name__ == "__main__":
    print("🚀 Starting BrandPulse Chat API")
    print("🤖 Agent: BrandPulse Assistant")
    print("🧠 Model: Gemini 2.0 Flash")
    print("🔐 Using Service Account Authentication")
    print("-" * 50)
    
    if not auth_available:
        print("⚠️  Warning: No authentication configured. Please set up service account or API key.")
    
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
