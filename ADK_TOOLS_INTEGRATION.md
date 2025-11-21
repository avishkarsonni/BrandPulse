# ADK Tools Integration - Product Data Querying

## Overview
This document describes the integration of data querying tools with the Google ADK agent, allowing the chatbot to query product data from the BrandPulse database.

## Tools Added

### 1. **lookup_product**
- **Purpose**: Lookup detailed information about a specific product by name
- **Parameters**: 
  - `product_name` (string): The name of the product (e.g., "iPhone 15 Pro")
- **Returns**: Formatted product information including sentiment data, mentions, and customer feedback

### 2. **search_products**
- **Purpose**: Search for products using keywords
- **Parameters**:
  - `search_term` (string): Search term for products (e.g., "iPhone", "Samsung", "electric vehicles")
- **Returns**: List of matching products with their information

### 3. **get_product_details**
- **Purpose**: Get detailed information about a product by ID
- **Parameters**:
  - `product_id` (integer): The numeric ID of the product
- **Returns**: Detailed product information including sentiment analysis

## Implementation Details

### Tool Functions
Located in `backend/main.py`:
- `lookup_product_tool()` - Async function that queries product by name
- `search_products_tool()` - Async function that searches products
- `get_product_details_tool()` - Async function that gets product by ID

### ADK Tool Definitions
- `create_adk_tools()` - Creates ADK-compatible `Tool` and `FunctionDeclaration` objects
- Tools are registered with the ADK agent during initialization
- Uses `google.adk.Tool` and `google.adk.FunctionDeclaration` classes

### Tool Handler
- `handle_tool_call()` - Processes function calls from the ADK agent
- Executes the appropriate tool function based on function name
- Returns formatted results as strings

### Agent Integration
The ADK agent is initialized with tools in `get_agent()`:
```python
tools = create_adk_tools()
if tools and hasattr(brand_pulse_agent, 'add_tool'):
    for tool in tools:
        brand_pulse_agent.add_tool(tool)
```

## How It Works

1. **User asks about a product**: "What's the sentiment for iPhone 15 Pro?"

2. **ADK Agent receives the query**: The agent sees the user's question

3. **Agent decides to use a tool**: Based on the query, the agent calls `lookup_product("iPhone 15 Pro")`

4. **Tool executes**: The `lookup_product_tool()` function queries the database

5. **Results returned**: Product data is formatted and returned to the agent

6. **Agent generates response**: The agent uses the real data to provide an accurate answer

## Tool Calling Flow

```
User Query
    ↓
ADK Agent (with tools registered)
    ↓
Agent detects need for product data
    ↓
Agent calls tool: lookup_product("iPhone 15 Pro")
    ↓
handle_tool_call() processes the call
    ↓
lookup_product_tool() queries database
    ↓
Formatted product data returned
    ↓
Agent uses data to generate response
    ↓
Final response to user
```

## Code Structure

### Tool Definitions
```python
# In create_adk_tools()
lookup_product_func = FunctionDeclaration(
    name="lookup_product",
    description="Lookup detailed information about a specific product by name",
    parameters={
        "type": "object",
        "properties": {
            "product_name": {
                "type": "string",
                "description": "The name of the product to lookup"
            }
        },
        "required": ["product_name"]
    }
)
tools.append(Tool(function_declarations=[lookup_product_func]))
```

### Tool Execution
```python
# In handle_tool_call()
if function_name == "lookup_product":
    product_name = arguments.get("product_name")
    result = await lookup_product_tool(product_name)
    return result
```

## Prompt Instructions

The chat prompt now includes instructions about available tools:
```
## Available Tools:
You have access to the following tools to query product data:
1. lookup_product(product_name): Lookup detailed information about a specific product
2. search_products(search_term): Search for products using keywords
3. get_product_details(product_id): Get detailed information about a product by ID

**IMPORTANT**: When users ask about products, USE THESE TOOLS to get real data.
Don't make up product information - always query the database first.
```

## Testing

### Test Tool Availability
```bash
curl http://localhost:8000/api/tools/available
```

### Test Tool Execution
```bash
curl -X POST http://localhost:8000/api/tools/product-lookup \
  -H "Content-Type: application/json" \
  -d '{
    "tool_name": "lookup_product",
    "parameters": {"product_name": "iPhone 15 Pro"}
  }'
```

### Test Chat with Tool Usage
```bash
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "text": "What is the sentiment for iPhone 15 Pro?",
    "product_name": "iPhone 15 Pro"
  }'
```

## Benefits

1. **Real Data**: Agent uses actual database data instead of making up information
2. **Accurate Responses**: Product information is always current and accurate
3. **Sentiment Analysis**: Agent can provide real sentiment metrics
4. **Customer Feedback**: Agent can reference actual customer reviews
5. **Automatic Tool Selection**: Agent automatically chooses the right tool

## Future Enhancements

1. **More Tools**: Add tools for sentiment trends, competitor analysis, etc.
2. **Tool Chaining**: Allow tools to call other tools for complex queries
3. **Caching**: Cache tool results for frequently asked products
4. **Analytics**: Track which tools are used most often
5. **Error Handling**: Better error messages when tools fail

## Notes

- Tools are registered during agent initialization
- Tool calls are processed asynchronously
- Results are formatted for easy consumption by the agent
- The agent is instructed to use tools when users ask about products
- Tool execution is logged for debugging

## Troubleshooting

### Tools Not Working
1. Check if ADK Tools are available: `ADK_TOOLS_AVAILABLE` should be `True`
2. Check agent initialization logs for tool registration
3. Verify tool definitions are correct
4. Check database connectivity

### Agent Not Using Tools
1. Ensure tools are registered with the agent
2. Check prompt instructions mention tools
3. Verify user queries mention products
4. Check agent logs for tool call attempts

## Summary

The ADK agent now has access to three tools for querying product data:
- ✅ `lookup_product` - Find products by name
- ✅ `search_products` - Search products by keywords  
- ✅ `get_product_details` - Get product by ID

The agent will automatically use these tools when users ask about products, ensuring responses are based on real database data rather than generated information.

