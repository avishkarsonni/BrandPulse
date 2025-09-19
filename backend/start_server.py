#!/usr/bin/env python3
"""
Startup script for BrandPulse Chat Backend with Google ADK
"""
import os
import sys
from pathlib import Path

def check_environment():
    """Check if environment is properly set up"""
    print("🔍 Checking environment setup...")
    
    # Check if Google API key is set
    if not os.getenv("GOOGLE_API_KEY"):
        print("❌ GOOGLE_API_KEY not found in environment variables")
        print("📝 Please set your Google API key:")
        print("   export GOOGLE_API_KEY='your_api_key_here'")
        print("   Or create a .env file with GOOGLE_API_KEY=your_api_key_here")
        print("🔗 Get your API key from: https://aistudio.google.com/app/apikey")
        return False
    else:
        print("✅ GOOGLE_API_KEY found")
    
    # Check if required packages are installed
    try:
        import google.adk
        import fastapi
        import uvicorn
        print("✅ Required packages are installed")
    except ImportError as e:
        print(f"❌ Missing required package: {e}")
        print("📦 Please install requirements:")
        print("   pip install -r requirements.txt")
        return False
    
    return True

def main():
    print("🚀 Starting BrandPulse Chat Backend with Google ADK")
    print("🤖 Agent: BrandPulse Assistant")
    print("🧠 Model: Gemini 2.0 Flash")
    print("-" * 50)
    
    if not check_environment():
        sys.exit(1)
    
    print("✅ Environment check passed!")
    print("🌐 Starting server on http://localhost:8000")
    print("📊 API documentation available at http://localhost:8000/docs")
    print("-" * 50)
    
    # Start the server
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

if __name__ == "__main__":
    main()
