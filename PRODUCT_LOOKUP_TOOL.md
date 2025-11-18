# BrandPulse Product Lookup Tool

## Overview

The Product Lookup Tool is a comprehensive system that allows the AI agent to access product records from the BrandPulse database and provide accurate, data-driven responses about specific products.

## Features

### 🔍 **Product Lookup Capabilities**
- **Search by Name**: Find products using partial or exact name matches
- **Search by Keywords**: Search across product names, brands, categories, and descriptions
- **Get by ID**: Retrieve specific product details using product ID
- **Sentiment Analysis**: Access real-time sentiment data for products
- **Customer Feedback**: View recent customer reviews and feedback

### 📊 **Data Available**
- Product basic information (name, brand, category, price, description)
- Sentiment analysis metrics (positive, negative, neutral mentions)
- Average sentiment scores
- Recent customer feedback with platform information
- Product analytics and trends

## API Endpoints

### 1. Product Lookup by Name
```http
GET /api/products/lookup/{product_name}
```

**Example:**
```bash
curl "http://localhost:8000/api/products/lookup/iPhone%2015%20Pro"
```

### 2. Comprehensive Product Search
```http
GET /api/products/search?q={search_term}&limit={limit}
```

**Example:**
```bash
curl "http://localhost:8000/api/products/search?q=iPhone&limit=5"
```

### 3. Product Details by ID
```http
GET /api/products/{product_id}/details
```

**Example:**
```bash
curl "http://localhost:8000/api/products/1/details"
```

### 4. AI Tool Endpoint
```http
POST /api/tools/product-lookup
```

**Request Body:**
```json
{
  "tool_name": "lookup_product",
  "parameters": {
    "product_name": "iPhone 15 Pro"
  }
}
```

### 5. Available Tools List
```http
GET /api/tools/available
```

## AI Integration

### How the AI Agent Uses the Tool

The AI agent automatically detects when users ask about specific products and:

1. **Extracts Product Names**: Identifies product mentions in user queries
2. **Looks Up Data**: Queries the database for relevant product information
3. **Enriches Responses**: Includes real product data in AI responses
4. **Provides Context**: Adds sentiment analysis and customer feedback

### Example AI Interaction

**User Query:** "Tell me about the iPhone 15 Pro"

**AI Process:**
1. Detects "iPhone 15 Pro" as a product name
2. Calls `lookup_product("iPhone 15 Pro")`
3. Receives product data including:
   - Product details (price, description, specifications)
   - Sentiment metrics (72% positive, 18% negative, 10% neutral)
   - Recent customer feedback
4. Generates response with actual data from database

**AI Response:**
```markdown
## iPhone 15 Pro Analysis

**Product Information:**
- **Brand**: Apple
- **Category**: Smartphones  
- **Price**: $999.00
- **Sentiment Score**: 0.68 (Positive)

**Customer Sentiment:**
- **Total Mentions**: 1,247
- **Positive**: 897 (72%)
- **Negative**: 224 (18%)
- **Neutral**: 126 (10%)

**Recent Feedback:**
- **Positive** (0.89): "The iPhone 15 Pro camera quality is absolutely amazing! Best phone I have ever used."
- **Negative** (-0.65): "iPhone 15 Pro is overpriced for what it offers. Not worth the upgrade from 14 Pro."

**Key Strengths:**
- Excellent camera quality
- Premium build and design
- Strong brand loyalty

**Areas for Improvement:**
- Pricing concerns
- Value proposition vs previous models
```

## Tool Class Structure

### ProductLookupTool Class

```python
class ProductLookupTool:
    def __init__(self):
        self.name = "product_lookup_tool"
        self.description = "Lookup product information from the BrandPulse database"
    
    async def lookup_product(self, product_name: str) -> Dict:
        """Lookup a specific product by name"""
    
    async def search_products(self, search_term: str) -> Dict:
        """Search for products using a search term"""
    
    async def get_product_details(self, product_id: int) -> Dict:
        """Get detailed information about a product by ID"""
    
    def format_product_summary(self, product_data: Dict) -> str:
        """Format product data into a readable summary for AI responses"""
```

## Database Schema Integration

The tool connects to the following database tables:

### Products Table
- `id`, `name`, `sku`, `description`
- `category`, `brand`, `price`
- `url`, `image_url`, `status`

### Sentiment Analysis Table
- `product_id`, `text`, `sentiment`, `score`
- `confidence`, `channel`, `platform_specific_id`
- `topics`, `keywords`, `engagement_metrics`

### Product Analytics Table
- `product_id`, `date`, `total_mentions`
- `positive_mentions`, `negative_mentions`, `neutral_mentions`
- `avg_sentiment_score`, `channel_breakdown`

## Usage Examples

### 1. Direct API Usage

```python
import httpx

# Lookup a product
async with httpx.AsyncClient() as client:
    response = await client.get("http://localhost:8000/api/products/lookup/iPhone%2015%20Pro")
    product_data = response.json()
```

### 2. AI Tool Usage

```python
# Use the tool in AI agent
tool_request = {
    "tool_name": "lookup_product",
    "parameters": {
        "product_name": "iPhone 15 Pro"
    }
}

response = await client.post("http://localhost:8000/api/tools/product-lookup", json=tool_request)
result = response.json()
```

### 3. Chat Integration

The tool is automatically integrated into the chat endpoint. When users ask about products, the AI will:

1. Detect product mentions
2. Look up product data
3. Include real data in responses
4. Provide accurate sentiment analysis

## Error Handling

The tool includes comprehensive error handling:

- **Database Connection Errors**: Graceful fallback when database is unavailable
- **Product Not Found**: Clear messaging when products don't exist
- **Invalid Parameters**: Validation of input parameters
- **Timeout Handling**: Proper timeout management for database queries

## Performance Considerations

- **Connection Pooling**: Efficient database connection management
- **Query Optimization**: Optimized SQL queries with proper indexing
- **Caching**: Results can be cached for frequently accessed products
- **Rate Limiting**: Built-in rate limiting for API endpoints

## Security

- **Input Validation**: All inputs are validated and sanitized
- **SQL Injection Prevention**: Parameterized queries prevent SQL injection
- **Access Control**: Proper authentication and authorization
- **Data Privacy**: Sensitive data is properly protected

## Monitoring and Logging

- **Request Logging**: All tool usage is logged
- **Performance Metrics**: Response times and success rates tracked
- **Error Tracking**: Comprehensive error logging and monitoring
- **Usage Analytics**: Track which products are most frequently queried

## Future Enhancements

- **Real-time Updates**: Live sentiment data updates
- **Advanced Analytics**: More sophisticated sentiment analysis
- **Product Recommendations**: AI-powered product suggestions
- **Competitive Analysis**: Compare products side-by-side
- **Trend Analysis**: Historical sentiment trend analysis

## Getting Started

1. **Start the Backend**: Ensure the BrandPulse backend is running
2. **Check Health**: Verify the tool is available at `/health`
3. **Test Endpoints**: Use the API endpoints to test functionality
4. **Integrate with AI**: The tool is automatically available to the AI agent
5. **Monitor Usage**: Check logs and metrics for tool usage

## Support

For issues or questions about the Product Lookup Tool:

1. Check the health endpoint: `GET /health`
2. Review the logs for error messages
3. Test database connectivity
4. Verify product data exists in the database
5. Check API endpoint responses

The Product Lookup Tool provides a powerful way for the AI agent to access real product data and provide accurate, data-driven responses to user queries about specific products.



















