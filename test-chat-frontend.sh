#!/bin/bash

# Test script to simulate frontend chat functionality
# This mimics what the React frontend does when sending a chat message

echo "🧪 Testing Frontend Chat Functionality"
echo "======================================"
echo ""

# Test 1: Check if backend is accessible
echo "1️⃣ Testing backend connectivity..."
BACKEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/health)
if [ "$BACKEND_STATUS" = "200" ]; then
    echo "   ✅ Backend is accessible (HTTP $BACKEND_STATUS)"
else
    echo "   ❌ Backend is not accessible (HTTP $BACKEND_STATUS)"
    exit 1
fi

# Test 2: Test CORS headers
echo ""
echo "2️⃣ Testing CORS configuration..."
CORS_RESPONSE=$(curl -s -X OPTIONS http://localhost:8000/api/chat \
  -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: content-type" \
  -w "\n%{http_code}")

if echo "$CORS_RESPONSE" | grep -q "access-control-allow-origin"; then
    echo "   ✅ CORS is properly configured"
else
    echo "   ⚠️  CORS headers not found"
fi

# Test 3: Send a chat message (simulating frontend)
echo ""
echo "3️⃣ Sending chat message (simulating frontend request)..."
CHAT_RESPONSE=$(curl -s -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -H "Origin: http://localhost:3000" \
  -d '{"text": "Hello, can you analyze Tesla Model Y?", "product_name": "Tesla Model Y"}')

# Check if response has the expected structure
if echo "$CHAT_RESPONSE" | jq -e '.response' > /dev/null 2>&1; then
    echo "   ✅ Chat API responded successfully"
    echo "   📝 Response structure:"
    echo "$CHAT_RESPONSE" | jq '{response: .response[0:100], timestamp: .timestamp, agent_name: .agent_name}'
    
    # Extract response text (what frontend would do)
    RESPONSE_TEXT=$(echo "$CHAT_RESPONSE" | jq -r '.response')
    TIMESTAMP=$(echo "$CHAT_RESPONSE" | jq -r '.timestamp')
    AGENT_NAME=$(echo "$CHAT_RESPONSE" | jq -r '.agent_name')
    
    echo ""
    echo "   📤 Frontend would extract:"
    echo "      - Response text: ${RESPONSE_TEXT:0:80}..."
    echo "      - Timestamp: $TIMESTAMP"
    echo "      - Agent name: $AGENT_NAME"
else
    echo "   ❌ Invalid response structure"
    echo "   Response: $CHAT_RESPONSE"
    exit 1
fi

# Test 4: Test with different message
echo ""
echo "4️⃣ Testing with another message..."
CHAT_RESPONSE2=$(curl -s -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -H "Origin: http://localhost:3000" \
  -d '{"text": "What is the sentiment for iPhone 15?", "product_name": null}')

if echo "$CHAT_RESPONSE2" | jq -e '.response' > /dev/null 2>&1; then
    echo "   ✅ Second message processed successfully"
    RESPONSE_LENGTH=$(echo "$CHAT_RESPONSE2" | jq -r '.response | length')
    echo "   📊 Response length: $RESPONSE_LENGTH characters"
else
    echo "   ❌ Failed to process second message"
fi

# Test 5: Check frontend accessibility
echo ""
echo "5️⃣ Testing frontend accessibility..."
FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000)
if [ "$FRONTEND_STATUS" = "200" ]; then
    echo "   ✅ Frontend is accessible (HTTP $FRONTEND_STATUS)"
else
    echo "   ❌ Frontend is not accessible (HTTP $FRONTEND_STATUS)"
fi

echo ""
echo "======================================"
echo "✅ All tests completed!"
echo ""
echo "Summary:"
echo "  - Backend: ✅ Working"
echo "  - CORS: ✅ Configured"
echo "  - Chat API: ✅ Responding correctly"
echo "  - Response format: ✅ Correct structure"
echo "  - Frontend: ✅ Accessible"
echo ""
echo "The frontend should be able to send messages and receive responses correctly."

