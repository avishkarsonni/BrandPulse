#!/bin/bash

echo "🚀 Starting BrandPulse Application in Docker"
echo "=============================================="
echo ""

# Stop and remove any existing containers
echo "🧹 Cleaning up existing containers..."
docker stop brandpulse-backend brandpulse-frontend 2>/dev/null || true
docker rm brandpulse-backend brandpulse-frontend 2>/dev/null || true

# Create network if it doesn't exist
echo "🌐 Setting up Docker network..."
docker network create brandpulse-network 2>/dev/null || echo "Network already exists"

# Build and start backend
echo "🔨 Building backend container..."
docker build -t brandpulse-backend ./backend

echo "🚀 Starting backend container..."
docker run -d \
  --name brandpulse-backend \
  --network brandpulse-network \
  -p 8000:8000 \
  -e GOOGLE_APPLICATION_CREDENTIALS=/app/service_account.json \
  -v $(pwd)/backend/service_account.json:/app/service_account.json:ro \
  brandpulse-backend

# Wait for backend to be healthy
echo "⏳ Waiting for backend to start..."
sleep 15

# Build and start frontend
echo "🔨 Building frontend container..."
docker build -t brandpulse-frontend -f Dockerfile.frontend .

echo "🚀 Starting frontend container..."
docker run -d \
  --name brandpulse-frontend \
  --network brandpulse-network \
  -p 3000:80 \
  brandpulse-frontend

# Wait for frontend to start
echo "⏳ Waiting for frontend to start..."
sleep 5

# Check status
echo ""
echo "✅ Checking container status..."
docker ps | grep brandpulse

echo ""
echo "=============================================="
echo "🎉 BrandPulse Application Started!"
echo "=============================================="
echo ""
echo "📊 Frontend: http://localhost:3000"
echo "🔌 Backend API: http://localhost:8000"
echo "📖 API Docs: http://localhost:8000/docs"
echo "💚 Health Check: http://localhost:8000/health"
echo ""
echo "🛑 To stop: docker stop brandpulse-backend brandpulse-frontend"
echo "📋 View logs: docker logs brandpulse-backend -f"
echo ""

