# BrandPulse Chat API with Google ADK

## 🚀 Overview
BrandPulse Assistant is an AI-powered product perception analysis tool that provides concise, actionable insights about brand sentiment and public perception.

## 🧠 Features
- **Concise Analysis**: Maximum 500-word responses with clear structure
- **Markdown Formatting**: Proper headers, bullet points, and emphasis
- **Structured Sections**: Overview, Strengths, Weaknesses, Competitive Position, Recommendations
- **Data-Driven Insights**: Focus on specific, actionable observations
- **Google ADK Integration**: Powered by Gemini 2.0 Flash with service account authentication

## 📊 Response Format
All responses follow this structured format:

### ## Overview
Brief market sentiment summary

### ## Key Strengths
- What customers love most
- **Bold metrics** and key findings
- Specific advantages

### ## Key Weaknesses  
- Main pain points and complaints
- Areas needing improvement
- Customer concerns

### ## Competitive Position
- How it compares to competitors
- Market positioning
- Unique differentiators

### ## Recommendations
1. **Actionable improvement suggestions**
2. **Concrete next steps**
3. **Strategic priorities**

## 🔧 API Endpoints

### Health Check
```bash
GET /health
```

### Chat with Agent
```bash
POST /api/chat
Content-Type: application/json

{
  "text": "Analyze the public perception of iPhone 15",
  "product_name": "iPhone 15",
  "context": "Optional additional context"
}
```

### Product Analysis
```bash
POST /api/analyze/product?product_name=iPhone 15
```

### Debug Information
```bash
GET /debug
```

## 🔐 Authentication
- Uses Google Cloud service account authentication
- Service account file: `service_account.json`
- Project: `truxtsaas`

## 🚀 Quick Start

1. **Start Backend**:
   ```bash
   cd backend
   source .venv/bin/activate
   uvicorn main:app --host 0.0.0.0 --port 8000 --reload
   ```

2. **Start Frontend**:
   ```bash
   cd ..
   npm start
   ```

3. **Test Connection**:
   ```bash
   curl http://localhost:8000/health
   ```

## 📝 Example Usage

### Analyze Product Perception
```bash
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "text": "What are the main strengths and weaknesses of Samsung Galaxy S24?",
    "product_name": "Samsung Galaxy S24"
  }'
```

### Competitive Analysis
```bash
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "text": "How does Tesla Model Y compare to its competitors?",
    "product_name": "Tesla Model Y"
  }'
```

## 🎯 Key Benefits
- **Concise**: Maximum 500 words per response
- **Structured**: Consistent markdown formatting with proper rendering
- **Actionable**: Specific recommendations and insights
- **Fast**: Optimized for quick analysis
- **Professional**: Data-driven and objective analysis
- **Rich Formatting**: Bold text, headers, bullet points, and emphasis

## 🎨 Frontend Features
- **Markdown Rendering**: AI responses are rendered with proper formatting
- **Styled Components**: Headers, bullet points, and emphasis are visually distinct
- **Responsive Design**: Works on desktop and mobile devices
- **Real-time Chat**: Instant responses with loading indicators

## 🔄 Response Guidelines
- Uses proper markdown formatting (`##`, `###`, `**bold**`, `-` bullets)
- Keeps paragraphs short (2-3 sentences max)
- Highlights key metrics in **bold**
- Provides numbered recommendations
- Focuses on specific, actionable insights
