#!/bin/bash

# Start BrandPulse Backend Server
echo "🚀 Starting BrandPulse Backend Server..."

# Kill any existing uvicorn processes
pkill -f uvicorn 2>/dev/null || true

# Change to backend directory
cd /home/avishkar/BrandPulse/backend

# Start the server in background
nohup python3 -m uvicorn main:app --host 0.0.0.0 --port 8000 --workers 1 > /tmp/brandpulse-backend.log 2>&1 &

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
    if curl -s http://localhost:8000/simple > /dev/null; then
        echo "✅ Connection test successful!"
    else
        echo "⚠️ Connection test failed, but server is running"
    fi
    
    echo "🛑 To stop the server: kill $BACKEND_PID"
else
    echo "❌ Failed to start backend server"
    echo "📝 Check logs: cat /tmp/brandpulse-backend.log"
    exit 1
fi
