#!/bin/bash

# Start BrandPulse Backend Server with Poetry
echo "🚀 Starting BrandPulse Backend Server with Poetry..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Kill any existing uvicorn processes
pkill -f uvicorn 2>/dev/null || true

# Change to project root directory
cd /home/azureuser/BrandPulse

# Check if Poetry is available
if ! command -v poetry > /dev/null 2>&1; then
    echo -e "${RED}❌ Poetry not found. Please install Poetry first.${NC}"
    exit 1
fi

# Activate Poetry environment and start the server
echo -e "${YELLOW}📦 Activating Poetry environment...${NC}"
export PATH="$HOME/.local/bin:$PATH"

# Start the server using Poetry in background
echo -e "${YELLOW}🔧 Starting server with Poetry...${NC}"
nohup poetry run python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --workers 1 > /tmp/brandpulse-backend.log 2>&1 &

# Get the process ID
BACKEND_PID=$!

# Wait a moment for startup
sleep 5

# Check if the server is running
if ps -p $BACKEND_PID > /dev/null; then
    echo "✅ Backend server started successfully (PID: $BACKEND_PID)"
    echo "🌐 Server running on http://localhost:8000"
    echo "📊 API docs available at http://localhost:8000/docs"
    echo "🔍 Health check: http://localhost:8000/health"
    echo "📝 Logs: tail -f /tmp/brandpulse-backend.log"
    
    # Test the connection
    echo "🧪 Testing connection..."
    if curl -s http://localhost:8000/health > /dev/null; then
        echo -e "${GREEN}✅ Connection test successful!${NC}"
    else
        echo -e "${YELLOW}⚠️ Connection test failed, but server is running${NC}"
    fi
    
    echo -e "${GREEN}🌐 Server running on http://localhost:8000${NC}"
    echo -e "${GREEN}📊 API docs available at http://localhost:8000/docs${NC}"
    echo -e "${GREEN}🔍 Health check: http://localhost:8000/health${NC}"
    echo -e "${GREEN}📝 Logs: tail -f /tmp/brandpulse-backend.log${NC}"
    echo -e "${RED}🛑 To stop the server: kill $BACKEND_PID${NC}"
else
    echo -e "${RED}❌ Failed to start backend server${NC}"
    echo -e "${YELLOW}📝 Check logs: cat /tmp/brandpulse-backend.log${NC}"
    exit 1
fi
