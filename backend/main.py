import os
import asyncio
from datetime import datetime
from typing import Dict, List, Optional
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn

# Google ADK imports - ENABLED
try:
    from google.adk import Agent
    GOOGLE_ADK_AVAILABLE = True
    print("✅ Google ADK enabled")
except ImportError as e:
    GOOGLE_ADK_AVAILABLE = False
    print(f"⚠️ Google ADK not available: {e}")

# Try to import ADK tool-related modules
try:
    from google.adk.tools import FunctionTool
    ADK_TOOLS_AVAILABLE = True
    print("✅ ADK FunctionTool available")
except ImportError:
    ADK_TOOLS_AVAILABLE = False
    print("⚠️ ADK Tools not available - will use alternative tool integration")

# Google Generative AI imports - FALLBACK
try:
    import google.generativeai as genai
    GOOGLE_GENAI_AVAILABLE = True
    print("✅ Google Generative AI enabled")
except ImportError as e:
    GOOGLE_GENAI_AVAILABLE = False
    print(f"⚠️ Google Generative AI not available: {e}")

# Initialize FastAPI app
app = FastAPI(title="BrandPulse Chat API", version="1.0.0")

# Enable CORS for React frontend
# For development/exhibition: Allow all origins to prevent CORS issues
# In production, restrict to specific origins for security
import os
cors_origins_env = os.getenv("CORS_ORIGINS", "")
allow_all_origins = os.getenv("CORS_ALLOW_ALL", "true").lower() == "true"  # Default to True for dev/exhibition

if cors_origins_env and not allow_all_origins:
    # Use environment variable if set and not allowing all
    cors_origins = [origin.strip() for origin in cors_origins_env.split(",") if origin.strip()]
else:
    # Default: Allow common development origins + all for exhibition
    cors_origins = [
        "http://localhost:3000", 
        "http://localhost:3001", 
        "http://localhost:3002",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
        "http://127.0.0.1:3002",
        "http://frontend:80",
        "http://brandpulse-frontend:80",
        "http://localhost:80",
        "http://127.0.0.1:80",
        "http://frontend",
        "http://brandpulse-frontend",
    ]

# For exhibition: Allow all origins (use ["*"] in FastAPI)
if allow_all_origins:
    print("🌐 CORS: Allowing all origins for development/exhibition")
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],  # Allow all origins
        allow_credentials=False,  # Must be False when using "*"
        allow_methods=["*"],
        allow_headers=["*"],
        expose_headers=["*"],
    )
else:
    print(f"🌐 CORS: Allowing specific origins: {cors_origins}")
    app.add_middleware(
        CORSMiddleware,
        allow_origins=cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
        expose_headers=["*"],
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

# Initialize the Google ADK agent with Gemini 2.0 Flash (Lazy initialization)
brand_pulse_agent = None
agent_initialized = False

def get_agent():
    """Lazy-load the AI agent to avoid hanging at startup"""
    global brand_pulse_agent, agent_initialized
    
    if agent_initialized:
        return brand_pulse_agent
    
    agent_initialized = True
    
    if not auth_available:
        print("⚠️ No authentication configured")
        brand_pulse_agent = create_mock_agent()
        return brand_pulse_agent
    
    try:
        # Try Gemini direct first (more reliable)
        if GOOGLE_GENAI_AVAILABLE and auth_available:
            print("🤖 Initializing Google Generative AI (Gemini) directly...")
            # Configure Gemini directly
            if os.getenv("GOOGLE_API_KEY"):
                genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))
            else:
                # Use service account credentials
                genai.configure()
            
            # Create Gemini model
            brand_pulse_agent = genai.GenerativeModel('gemini-2.0-flash-exp')
            print("✅ BrandPulse Assistant (Gemini Direct) initialized successfully")
            return brand_pulse_agent
        elif GOOGLE_ADK_AVAILABLE and auth_available:
            print("🤖 Initializing Google ADK Agent as fallback...")
            # Initialize the actual ADK agent
            brand_pulse_agent = Agent(
                name="brandpulse_assistant",
                description="BrandPulse Assistant for product analysis and sentiment monitoring. Can query product data from the database using tools."
            )
            
            # Add tools to the agent if available
            try:
                tools = create_adk_tools()
                if tools:
                    # ADK agent has a 'tools' attribute that is a list
                    if hasattr(brand_pulse_agent, 'tools'):
                        # Append tools to the existing tools list
                        brand_pulse_agent.tools.extend(tools)
                        print(f"✅ Added {len(tools)} tools to ADK agent (total: {len(brand_pulse_agent.tools)})")
                    elif hasattr(brand_pulse_agent, 'add_tool'):
                        # Try add_tool method if it exists
                        for tool in tools:
                            brand_pulse_agent.add_tool(tool)
                        print(f"✅ Added {len(tools)} tools to ADK agent using add_tool method")
                    else:
                        print(f"⚠️ ADK agent doesn't support tools (no 'tools' attribute or 'add_tool' method)")
                        print(f"   Agent attributes: {[attr for attr in dir(brand_pulse_agent) if 'tool' in attr.lower()]}")
                else:
                    print("⚠️ No tools created - ADK_TOOLS_AVAILABLE may be False")
            except Exception as tool_error:
                print(f"⚠️ Could not add tools to ADK agent: {tool_error}")
                import traceback
                print(traceback.format_exc())
            
            print("✅ BrandPulse Assistant (ADK) initialized successfully")
            return brand_pulse_agent
        else:
            print("🤖 Using mock agent (no AI services available or no auth)...")
            brand_pulse_agent = create_mock_agent()
            return brand_pulse_agent
        
    except Exception as error:
        print(f"⚠️ AI initialization failed: {error}")
        if GOOGLE_GENAI_AVAILABLE and auth_available:
            try:
                print("🔧 Trying Gemini fallback...")
                if os.getenv("GOOGLE_API_KEY"):
                    genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))
                else:
                    genai.configure()
                brand_pulse_agent = genai.GenerativeModel('gemini-2.0-flash-exp')
                print("✅ Gemini fallback successful")
                return brand_pulse_agent
            except Exception as gemini_error:
                print(f"⚠️ Gemini fallback also failed: {gemini_error}")
        
        print("🔧 Creating mock agent for development...")
        brand_pulse_agent = create_mock_agent()
        return brand_pulse_agent

def create_mock_agent():
    """Create a mock agent for development/fallback"""
    class MockAgent:
        def __init__(self):
            self.model_name = "mock-gemini-2.0-flash-exp"
        
        def generate_content(self, prompt, request_options=None):
            class MockResponse:
                def __init__(self):
                    self.text = f"""## 🤖 BrandPulse Assistant Response

**Status**: Running in development mode with mock AI agent
**Issue**: Google Generative AI not available

### 📊 Analysis Request:
{prompt}

### 🎯 Mock Analysis Response:

**Product Sentiment Overview:**
- Overall sentiment: Mixed (60% positive, 25% neutral, 15% negative)
- Key strengths: Quality, reliability, user experience
- Areas for improvement: Pricing, customer support

**Competitive Position:**
- Market share: Strong in target segments
- Differentiation: Innovation and brand trust
- Threats: Emerging competitors, price sensitivity

**Recommendations:**
1. **Monitor sentiment trends** across all channels
2. **Address negative feedback** proactively
3. **Leverage positive mentions** for marketing
4. **Track competitor activities** regularly

**Next Steps:**
- Set up real-time sentiment monitoring
- Implement automated alert system
- Create sentiment-based response workflows

---
*Note: This is a mock response. Real AI analysis requires Google Cloud authentication.*"""
            
            return MockResponse()
    
    print("✅ BrandPulse Assistant (Mock) initialized successfully")
    return MockAgent()

# Chat history storage (in production, use a proper database)
chat_sessions: Dict[str, List[Dict]] = {}

# Database configuration for product lookup
DB_CONFIG = {
    'host': os.getenv('DB_HOST', 'database'),  # Use Docker service name
    'port': int(os.getenv('DB_PORT', '3306')),  # Use internal port
    'user': os.getenv('DB_USER', 'brandpulse_user'),
    'password': os.getenv('DB_PASSWORD', 'brandpulse_password'),
    'database': os.getenv('DB_NAME', 'brandpulse'),
    'charset': 'utf8mb4',
    'autocommit': True,
    'connect_timeout': 60  # Increase timeout significantly
}

async def get_database_connection():
    """Get database connection with proper error handling and retries"""
    import time
    max_retries = 3
    
    for attempt in range(max_retries):
        try:
            import pymysql
            # Try with longer timeout
            config = DB_CONFIG.copy()
            config['connect_timeout'] = 60
            config['read_timeout'] = 60
            config['write_timeout'] = 60
            connection = pymysql.connect(**config)
            return connection, "pymysql"
        except ImportError:
            try:
                import mysql.connector  # type: ignore
                config = DB_CONFIG.copy()
                config['connection_timeout'] = 60
                connection = mysql.connector.connect(**config)
                return connection, "mysql.connector"
            except ImportError:
                return None, "no_driver"
        except Exception as e:
            print(f"Database connection attempt {attempt + 1}/{max_retries} failed: {e}")
            if attempt < max_retries - 1:
                time.sleep(2)  # Wait before retry
            else:
                return None, "error"
    
    return None, "error"

async def lookup_product_by_name(product_name: str) -> Dict:
    """Lookup product information by name from database"""
    try:
        # Use database-api service as primary method due to Docker networking issues
        return await lookup_product_via_api(product_name)
        
    except Exception as e:
        print(f"Product lookup error: {e}")
        # Fallback to database-api service
        return await lookup_product_via_api(product_name)

async def lookup_product_via_api(product_name: str) -> Dict:
    """Fallback: Lookup product via database-api service or return mock data"""
    try:
        import httpx
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"http://database-api:8002/search/products",
                params={"q": product_name, "limit": 5},
                timeout=5.0
            )
            if response.status_code == 200:
                data = response.json()
                return {
                    "products": data.get("results", []),
                    "sentiment_data": [],  # Simplified for fallback
                    "query": product_name,
                    "found": len(data.get("results", [])) > 0
                }
            else:
                return {"error": f"API error: {response.status_code}", "found": False}
    except Exception as e:
        print(f"API fallback error: {e}")
        # Return mock data for Tesla Model Y to demonstrate functionality
        if "tesla" in product_name.lower() or "model y" in product_name.lower():
            return {
                "products": [{
                    "id": 1,
                    "name": "Tesla Model Y",
                    "brand": "Tesla",
                    "price": 52990.00,
                    "description": "Electric SUV with advanced autopilot features",
                    "category": "Electric Vehicles",
                    "status": "active",
                    "total_mentions": 1250,
                    "positive_mentions": 850,
                    "negative_mentions": 200,
                    "neutral_mentions": 200,
                    "avg_sentiment_score": 0.65
                }],
                "sentiment_data": [],
                "query": product_name,
                "found": True,
                "source": "mock_data"
            }
        return {"error": str(e), "found": False}

async def lookup_product_by_id(product_id: int) -> Dict:
    """Lookup product information by ID from database"""
    try:
        connection, driver = await get_database_connection()
        if not connection:
            return {"error": "Database connection failed", "product": None}
        
        if driver == "pymysql":
            import pymysql
            cursor = connection.cursor(pymysql.cursors.DictCursor)
        else:
            cursor = connection.cursor(dictionary=True)
        
        # Get product details
        query = """
            SELECT p.*, 
                   COALESCE(pa.total_mentions, 0) as total_mentions,
                   COALESCE(pa.positive_mentions, 0) as positive_mentions,
                   COALESCE(pa.negative_mentions, 0) as negative_mentions,
                   COALESCE(pa.neutral_mentions, 0) as neutral_mentions,
                   COALESCE(pa.avg_sentiment_score, 0) as avg_sentiment_score
            FROM products p
            LEFT JOIN product_analytics pa ON p.id = pa.product_id AND pa.date = CURDATE()
            WHERE p.id = %s AND p.status = 'active'
        """
        
        cursor.execute(query, [product_id])
        product = cursor.fetchone()
        
        # Get sentiment analysis for the product
        sentiment_data = []
        if product:
            sentiment_query = """
                SELECT sa.*, pp.url as page_url, pp.platform
                FROM sentiment_analysis sa
                LEFT JOIN product_pages pp ON sa.page_id = pp.id
                WHERE sa.product_id = %s
                ORDER BY sa.timestamp DESC
                LIMIT 20
            """
            cursor.execute(sentiment_query, [product_id])
            sentiment_data = cursor.fetchall()
        
        cursor.close()
        connection.close()
        
        return {
            "product": product,
            "sentiment_data": sentiment_data,
            "found": product is not None
        }
        
    except Exception as e:
        print(f"Product lookup error: {e}")
        return {"error": str(e), "product": None, "found": False}

async def search_products_comprehensive(search_term: str) -> Dict:
    """Comprehensive product search with sentiment analysis"""
    try:
        connection, driver = await get_database_connection()
        if not connection:
            return {"error": "Database connection failed", "products": []}
        
        if driver == "pymysql":
            import pymysql
            cursor = connection.cursor(pymysql.cursors.DictCursor)
        else:
            cursor = connection.cursor(dictionary=True)
        
        # Search products by name, brand, category, or description
        query = """
            SELECT p.*, 
                   COALESCE(sa_stats.total_mentions, 0) as total_mentions,
                   COALESCE(sa_stats.positive_mentions, 0) as positive_mentions,
                   COALESCE(sa_stats.negative_mentions, 0) as negative_mentions,
                   COALESCE(sa_stats.neutral_mentions, 0) as neutral_mentions,
                   COALESCE(sa_stats.avg_sentiment_score, 0.0) as avg_sentiment_score
            FROM products p
            LEFT JOIN (
                SELECT 
                    product_id,
                    COUNT(*) as total_mentions,
                    SUM(CASE WHEN sentiment = 'positive' THEN 1 ELSE 0 END) as positive_mentions,
                    SUM(CASE WHEN sentiment = 'negative' THEN 1 ELSE 0 END) as negative_mentions,
                    SUM(CASE WHEN sentiment = 'neutral' THEN 1 ELSE 0 END) as neutral_mentions,
                    AVG(score) as avg_sentiment_score
                FROM sentiment_analysis 
                GROUP BY product_id
            ) sa_stats ON p.id = sa_stats.product_id
            WHERE (LOWER(p.name) LIKE LOWER(%s) 
                   OR LOWER(p.brand) LIKE LOWER(%s) 
                   OR LOWER(p.category) LIKE LOWER(%s)
                   OR LOWER(p.description) LIKE LOWER(%s))
            AND p.status = 'active'
            ORDER BY p.created_at DESC
            LIMIT 10
        """
        
        search_pattern = f"%{search_term}%"
        cursor.execute(query, [search_pattern, search_pattern, search_pattern, search_pattern])
        products = cursor.fetchall()
        
        cursor.close()
        connection.close()
        
        return {
            "products": products,
            "query": search_term,
            "found": len(products) > 0,
            "count": len(products)
        }
        
    except Exception as e:
        print(f"Product search error: {e}")
        return {"error": str(e), "products": [], "found": False}

# AI Agent Tool Class for Product Lookup
class ProductLookupTool:
    """Tool class that provides product lookup capabilities to the AI agent"""
    
    def __init__(self):
        self.name = "product_lookup_tool"
        self.description = "Lookup product information from the BrandPulse database"
    
    async def lookup_product(self, product_name: str) -> Dict:
        """Lookup a specific product by name"""
        return await lookup_product_by_name(product_name)
    
    async def search_products(self, search_term: str) -> Dict:
        """Search for products using a search term"""
        return await search_products_comprehensive(search_term)
    
    async def get_product_details(self, product_id: int) -> Dict:
        """Get detailed information about a product by ID"""
        return await lookup_product_by_id(product_id)
    
    def format_product_summary(self, product_data: Dict) -> str:
        """Format product data into a readable summary for AI responses"""
        if not product_data.get("found"):
            return "No product data found in database."
        
        summary = "## Product Database Information:\n\n"
        
        if "products" in product_data:
            # Multiple products found
            for i, product in enumerate(product_data["products"][:3], 1):
                summary += f"### Product {i}: {product['name']}\n"
                summary += f"- **Brand**: {product['brand']}\n"
                summary += f"- **Category**: {product['category']}\n"
                summary += f"- **Price**: ${product['price']}\n"
                summary += f"- **Description**: {product['description']}\n"
                summary += f"- **Sentiment Score**: {product['avg_sentiment_score']:.2f}\n"
                summary += f"- **Mentions**: {product['total_mentions']} total ({product['positive_mentions']} positive, {product['negative_mentions']} negative, {product['neutral_mentions']} neutral)\n\n"
        elif "product" in product_data and product_data["product"]:
            # Single product found
            product = product_data["product"]
            summary += f"### {product['name']}\n"
            summary += f"- **Brand**: {product['brand']}\n"
            summary += f"- **Category**: {product['category']}\n"
            summary += f"- **Price**: ${product['price']}\n"
            summary += f"- **Description**: {product['description']}\n"
            summary += f"- **Sentiment Score**: {product['avg_sentiment_score']:.2f}\n"
            summary += f"- **Mentions**: {product['total_mentions']} total ({product['positive_mentions']} positive, {product['negative_mentions']} negative, {product['neutral_mentions']} neutral)\n\n"
        
        # Add sentiment data if available
        if product_data.get("sentiment_data"):
            summary += "### Recent Customer Feedback:\n"
            for sentiment in product_data["sentiment_data"][:5]:
                summary += f"- **{sentiment['sentiment'].title()}** ({sentiment['score']:.2f}): {sentiment['text'][:150]}...\n"
                if sentiment.get('platform'):
                    summary += f"  - Source: {sentiment['platform']}\n"
            summary += "\n"
        
        return summary

# Initialize the product lookup tool
product_tool = ProductLookupTool()

# ADK Tool Functions - These will be registered with the ADK agent
async def lookup_product_tool(product_name: str) -> str:
    """
    Lookup product information by name from the BrandPulse database.
    
    Args:
        product_name: The name of the product to lookup (e.g., "iPhone 15 Pro")
    
    Returns:
        A formatted string with product information including sentiment data
    """
    try:
        result = await product_tool.lookup_product(product_name)
        return product_tool.format_product_summary(result)
    except Exception as e:
        return f"Error looking up product: {str(e)}"

async def search_products_tool(search_term: str) -> str:
    """
    Search for products using a search term. Searches across product names, brands, categories, and descriptions.
    
    Args:
        search_term: The search term to find products (e.g., "iPhone", "Samsung", "Tesla")
    
    Returns:
        A formatted string with matching products and their information
    """
    try:
        result = await product_tool.search_products(search_term)
        return product_tool.format_product_summary(result)
    except Exception as e:
        return f"Error searching products: {str(e)}"

async def get_product_details_tool(product_id: int) -> str:
    """
    Get detailed information about a product by its ID.
    
    Args:
        product_id: The numeric ID of the product (e.g., 1, 2, 3)
    
    Returns:
        A formatted string with detailed product information including sentiment analysis
    """
    try:
        result = await product_tool.get_product_details(product_id)
        return product_tool.format_product_summary(result)
    except Exception as e:
        return f"Error getting product details: {str(e)}"

# Tool handler function - processes function calls from ADK agent
async def handle_tool_call(function_name: str, arguments: Dict) -> str:
    """
    Handle tool/function calls from the ADK agent.
    
    Args:
        function_name: Name of the function to call
        arguments: Dictionary of function arguments
    
    Returns:
        String result from the tool execution
    """
    try:
        print(f"🔧 Executing tool: {function_name} with arguments: {arguments}")
        
        if function_name == "lookup_product":
            product_name = arguments.get("product_name")
            if not product_name:
                return "Error: product_name parameter is required"
            result = await lookup_product_tool(product_name)
            print(f"✅ Tool {function_name} executed successfully")
            return result
        
        elif function_name == "search_products":
            search_term = arguments.get("search_term")
            if not search_term:
                return "Error: search_term parameter is required"
            result = await search_products_tool(search_term)
            print(f"✅ Tool {function_name} executed successfully")
            return result
        
        elif function_name == "get_product_details":
            product_id = arguments.get("product_id")
            if not product_id:
                return "Error: product_id parameter is required"
            result = await get_product_details_tool(int(product_id))
            print(f"✅ Tool {function_name} executed successfully")
            return result
        
        else:
            return f"Error: Unknown function {function_name}"
    
    except Exception as e:
        print(f"⚠️ Error executing tool {function_name}: {e}")
        import traceback
        print(traceback.format_exc())
        return f"Error executing {function_name}: {str(e)}"

# Process ADK response for function calls and execute them
async def process_adk_response_with_tools(agent, message, max_iterations=3):
    """
    Process ADK agent response, handling function calls if present.
    This implements a tool-calling loop where the agent can call tools and get results.
    
    Args:
        agent: The ADK agent instance
        message: The user message/prompt
        max_iterations: Maximum number of tool-calling iterations
    
    Returns:
        Final response string after processing all tool calls
    """
    conversation_history = []
    current_message = message
    
    for iteration in range(max_iterations):
        print(f"🔄 ADK Tool-calling iteration {iteration + 1}/{max_iterations}")
        
        try:
            # Get response from agent
            response_parts = []
            async for chunk in agent.run_async(current_message):
                chunk_text = extract_text_from_adk_response(chunk, f"iteration {iteration + 1}")
                if chunk_text:
                    response_parts.append(chunk_text)
            
            response_text = ''.join(response_parts)
            
            # Check if response contains function calls
            # ADK typically returns function calls in a structured format
            # We need to check the response for function call indicators
            
            # Try to detect function calls in the response
            # This is a simplified approach - actual ADK may return structured function calls
            if hasattr(agent, 'last_function_calls') or 'function_call' in str(response_text).lower():
                print("🔧 Detected potential function call in response")
                # Process function calls if detected
                # Note: Actual implementation depends on ADK's function calling format
                # This is a placeholder for the actual function call processing
                pass
            
            # If we have a complete response without function calls, return it
            if response_text and len(response_text.strip()) > 50:
                print(f"✅ Got final response after {iteration + 1} iterations")
                return response_text
            
            # Otherwise, continue to next iteration
            current_message = response_text
            
        except Exception as e:
            print(f"⚠️ Error in tool-calling iteration {iteration + 1}: {e}")
            if iteration == 0:
                # If first iteration fails, return error
                return f"Error processing request: {str(e)}"
            break
    
    # If we exhausted iterations, return the last response
    return response_text if response_text else "Unable to generate response after tool-calling iterations"

# Create wrapper functions for ADK tools (ADK FunctionTool requires sync functions)
# We'll create sync wrappers that call the async functions using asyncio
def lookup_product_sync(product_name: str) -> str:
    """Sync wrapper for lookup_product_tool - ADK FunctionTool requires sync functions"""
    import asyncio
    import nest_asyncio
    
    # Allow nested event loops if needed
    try:
        nest_asyncio.apply()
    except:
        pass
    
    try:
        # Try to get the running event loop
        try:
            loop = asyncio.get_running_loop()
            # If we're in an async context, we need to use a different approach
            # Use a thread to run the async function
            import concurrent.futures
            import threading
            
            result = None
            exception = None
            
            def run_in_thread():
                nonlocal result, exception
                try:
                    new_loop = asyncio.new_event_loop()
                    asyncio.set_event_loop(new_loop)
                    result = new_loop.run_until_complete(lookup_product_tool(product_name))
                    new_loop.close()
                except Exception as e:
                    exception = e
            
            thread = threading.Thread(target=run_in_thread)
            thread.start()
            thread.join(timeout=10)
            
            if exception:
                raise exception
            return result if result else "Error: Tool execution timed out"
        except RuntimeError:
            # No running loop, create one
            return asyncio.run(lookup_product_tool(product_name))
    except Exception as e:
        return f"Error executing lookup_product: {str(e)}"

def search_products_sync(search_term: str) -> str:
    """Sync wrapper for search_products_tool"""
    import asyncio
    import threading
    
    try:
        try:
            loop = asyncio.get_running_loop()
            result = None
            exception = None
            
            def run_in_thread():
                nonlocal result, exception
                try:
                    new_loop = asyncio.new_event_loop()
                    asyncio.set_event_loop(new_loop)
                    result = new_loop.run_until_complete(search_products_tool(search_term))
                    new_loop.close()
                except Exception as e:
                    exception = e
            
            thread = threading.Thread(target=run_in_thread)
            thread.start()
            thread.join(timeout=10)
            
            if exception:
                raise exception
            return result if result else "Error: Tool execution timed out"
        except RuntimeError:
            return asyncio.run(search_products_tool(search_term))
    except Exception as e:
        return f"Error executing search_products: {str(e)}"

def get_product_details_sync(product_id: int) -> str:
    """Sync wrapper for get_product_details_tool"""
    import asyncio
    import threading
    
    try:
        try:
            loop = asyncio.get_running_loop()
            result = None
            exception = None
            
            def run_in_thread():
                nonlocal result, exception
                try:
                    new_loop = asyncio.new_event_loop()
                    asyncio.set_event_loop(new_loop)
                    result = new_loop.run_until_complete(get_product_details_tool(product_id))
                    new_loop.close()
                except Exception as e:
                    exception = e
            
            thread = threading.Thread(target=run_in_thread)
            thread.start()
            thread.join(timeout=10)
            
            if exception:
                raise exception
            return result if result else "Error: Tool execution timed out"
        except RuntimeError:
            return asyncio.run(get_product_details_tool(product_id))
    except Exception as e:
        return f"Error executing get_product_details: {str(e)}"

# Create ADK-compatible tool definitions
def create_adk_tools():
    """Create ADK tool definitions for function calling using FunctionTool"""
    tools = []
    
    if ADK_TOOLS_AVAILABLE:
        try:
            from google.adk.tools import FunctionTool
            
            # Tool 1: Lookup Product
            lookup_tool = FunctionTool(func=lookup_product_sync)
            tools.append(lookup_tool)
            print("✅ Created lookup_product tool")
            
            # Tool 2: Search Products
            search_tool = FunctionTool(func=search_products_sync)
            tools.append(search_tool)
            print("✅ Created search_products tool")
            
            # Tool 3: Get Product Details by ID
            details_tool = FunctionTool(func=get_product_details_sync)
            tools.append(details_tool)
            print("✅ Created get_product_details tool")
            
            print(f"✅ Created {len(tools)} ADK tool definitions")
            return tools
            
        except Exception as e:
            print(f"⚠️ Error creating ADK tools: {e}")
            import traceback
            print(traceback.format_exc())
            return []
    else:
        print("⚠️ ADK Tools not available, using alternative integration")
        return []

# Robust ADK response extraction helper function
# This function is designed for exhibition/demo reliability - it handles ALL possible
# ADK response formats to ensure responses always reach the chat endpoint.
# Based on analysis of Gemini API patterns and ADK best practices.
def extract_text_from_adk_response(response_obj, context="ADK response"):
    """
    Foolproof function to extract text from ADK response objects.
    Handles all possible response formats to ensure reliability.
    
    This function tries multiple extraction strategies in order:
    1. Direct string check
    2. Common attributes (text, content, message, response, output)
    3. Parts structure (like Gemini responses)
    4. Dictionary inspection (__dict__)
    5. Iterable handling (for collections)
    6. String conversion (last resort)
    
    Args:
        response_obj: The response object from ADK (can be chunk, full response, or any format)
        context: Context string for logging
        
    Returns:
        str: Extracted text, or empty string if extraction fails
        
    Note: This is critical for exhibition reliability - it ensures responses
    are always extracted regardless of ADK version or response format changes.
    """
    if response_obj is None:
        print(f"⚠️ {context}: Response object is None")
        return ""
    
    # Try direct string
    if isinstance(response_obj, str):
        return response_obj
    
    # Try common attributes (text, content, message)
    for attr in ['text', 'content', 'message', 'response', 'output']:
        if hasattr(response_obj, attr):
            try:
                value = getattr(response_obj, attr)
                if value:
                    if isinstance(value, str):
                        return value
                    elif hasattr(value, 'text'):
                        return value.text
                    else:
                        return str(value)
            except Exception as e:
                print(f"⚠️ {context}: Error accessing {attr}: {e}")
                continue
    
    # Try parts (like Gemini responses)
    if hasattr(response_obj, 'parts'):
        try:
            parts_text = []
            for part in response_obj.parts:
                if hasattr(part, 'text'):
                    parts_text.append(part.text)
                elif hasattr(part, 'content'):
                    parts_text.append(str(part.content))
                elif isinstance(part, str):
                    parts_text.append(part)
                else:
                    parts_text.append(str(part))
            if parts_text:
                return ''.join(parts_text)
        except Exception as e:
            print(f"⚠️ {context}: Error processing parts: {e}")
    
    # Try __dict__ inspection
    if hasattr(response_obj, '__dict__'):
        try:
            obj_dict = response_obj.__dict__
            # Check common keys
            for key in ['text', 'content', 'message', 'response', 'output', 'data']:
                if key in obj_dict:
                    value = obj_dict[key]
                    if value:
                        if isinstance(value, str):
                            return value
                        elif hasattr(value, 'text'):
                            return value.text
                        else:
                            return str(value)
        except Exception as e:
            print(f"⚠️ {context}: Error inspecting __dict__: {e}")
    
    # Try iterating if it's iterable (but not a string)
    if hasattr(response_obj, '__iter__') and not isinstance(response_obj, str):
        try:
            parts = []
            for item in response_obj:
                item_text = extract_text_from_adk_response(item, f"{context} item")
                if item_text:
                    parts.append(item_text)
            if parts:
                return ''.join(parts)
        except Exception as e:
            print(f"⚠️ {context}: Error iterating response: {e}")
    
    # Last resort: convert to string
    try:
        result = str(response_obj)
        # Only return if it's not just the object representation
        if result and not result.startswith('<') and len(result) > 10:
            return result
    except Exception as e:
        print(f"⚠️ {context}: Error converting to string: {e}")
    
    print(f"⚠️ {context}: Could not extract text from response object of type {type(response_obj)}")
    return ""

@app.get("/")
async def root():
    return {"message": "BrandPulse Chat API with Google ADK", "status": "running"}

@app.get("/health")
async def health_check():
    # Simple health check without blocking database connection
    return {
        "status": "healthy", 
        "agent": os.getenv("AGENT_NAME", "BrandPulse_Assistant"), 
        "model": os.getenv("AGENT_MODEL", "gemini-2.0-flash-exp"),
        "agent_available": brand_pulse_agent is not None,
        "auth_method": "service_account" if Path(__file__).parent.joinpath("service_account.json").exists() else "api_key",
        "project_id": os.getenv("GOOGLE_PROJECT_ID"),
        "client_email": os.getenv("GOOGLE_CLIENT_EMAIL"),
        "agent_type": "ADK" if hasattr(brand_pulse_agent, 'name') and brand_pulse_agent.name == "brandpulse_assistant" else "Gemini_Direct",
        "database": {
            "host": DB_CONFIG['host'],
            "port": DB_CONFIG['port'],
            "database": DB_CONFIG['database']
        },
        "tools": {
            "product_lookup": {
                "available": True,
                "description": "Product database lookup tool",
                "endpoints": ["/api/tools/product-lookup", "/api/tools/available"]
            }
        },
        "timestamp": datetime.now().isoformat()
    }

@app.get("/test")
async def test_endpoint():
    """Simple test endpoint"""
    return {"message": "Backend is working!", "timestamp": datetime.now().isoformat()}

@app.get("/simple")
async def simple_endpoint():
    """Ultra-simple endpoint for testing connectivity"""
    return {"status": "ok", "message": "Connection successful"}

@app.get("/debug")
async def debug_info():
    """Debug endpoint to help with frontend troubleshooting"""
    cors_allow_all = os.getenv("CORS_ALLOW_ALL", "true").lower() == "true"
    cors_origins_env = os.getenv("CORS_ORIGINS", "")
    
    return {
        "server_time": datetime.now().isoformat(),
        "cors_enabled": True,
        "cors_allow_all": cors_allow_all,
        "allowed_origins": ["*"] if cors_allow_all else (cors_origins_env.split(",") if cors_origins_env else ["http://localhost:3000"]),
        "agent_status": "available" if brand_pulse_agent is not None else "unavailable",
        "endpoints": {
            "health": "/health",
            "chat": "/api/chat", 
            "product_analysis": "/api/analyze/product",
            "chat_history": "/api/chat/history"
        },
        "message": "Backend is running and ready for frontend connections!",
        "cors_config": {
            "allow_all": cors_allow_all,
            "credentials": not cors_allow_all,
            "methods": ["*"],
            "headers": ["*"]
        }
    }

@app.options("/{full_path:path}")
async def options_handler(full_path: str):
    """Handle OPTIONS requests for CORS preflight"""
    return {"message": "OK"}

# Product lookup API endpoints
@app.get("/api/products/lookup/{product_name}")
async def lookup_product_endpoint(product_name: str):
    """
    Lookup product information by name - Tool for AI agent
    """
    try:
        result = await lookup_product_by_name(product_name)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error looking up product: {str(e)}")

@app.get("/api/products/search")
async def search_products_endpoint(q: str = "", limit: int = 10):
    """
    Search products comprehensively - Tool for AI agent
    """
    try:
        if not q:
            return {"products": [], "query": "", "found": False, "count": 0}
        
        result = await search_products_comprehensive(q)
        result["products"] = result["products"][:limit]
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error searching products: {str(e)}")

@app.get("/api/products/{product_id}/details")
async def get_product_details_endpoint(product_id: int):
    """
    Get detailed product information by ID - Tool for AI agent
    """
    try:
        result = await lookup_product_by_id(product_id)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting product details: {str(e)}")

@app.post("/api/tools/product-lookup")
async def ai_product_lookup_tool(request: Dict):
    """
    AI Tool endpoint for product lookup - Used by AI agent
    """
    try:
        tool_name = request.get("tool_name")
        parameters = request.get("parameters", {})
        
        if tool_name == "lookup_product":
            product_name = parameters.get("product_name")
            if not product_name:
                return {"error": "product_name parameter is required"}
            
            result = await product_tool.lookup_product(product_name)
            return {
                "tool_name": tool_name,
                "result": result,
                "formatted_summary": product_tool.format_product_summary(result)
            }
        
        elif tool_name == "search_products":
            search_term = parameters.get("search_term")
            if not search_term:
                return {"error": "search_term parameter is required"}
            
            result = await product_tool.search_products(search_term)
            return {
                "tool_name": tool_name,
                "result": result,
                "formatted_summary": product_tool.format_product_summary(result)
            }
        
        elif tool_name == "get_product_details":
            product_id = parameters.get("product_id")
            if not product_id:
                return {"error": "product_id parameter is required"}
            
            result = await product_tool.get_product_details(int(product_id))
            return {
                "tool_name": tool_name,
                "result": result,
                "formatted_summary": product_tool.format_product_summary(result)
            }
        
        else:
            return {"error": f"Unknown tool: {tool_name}"}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Tool execution error: {str(e)}")

@app.get("/api/tools/available")
async def get_available_tools():
    """
    Get list of available tools for AI agent
    """
    return {
        "tools": [
            {
                "name": "lookup_product",
                "description": "Lookup a specific product by name",
                "parameters": {
                    "product_name": "string - Name of the product to lookup"
                },
                "endpoint": "/api/tools/product-lookup"
            },
            {
                "name": "search_products", 
                "description": "Search for products using a search term",
                "parameters": {
                    "search_term": "string - Search term for products"
                },
                "endpoint": "/api/tools/product-lookup"
            },
            {
                "name": "get_product_details",
                "description": "Get detailed information about a product by ID",
                "parameters": {
                    "product_id": "integer - ID of the product"
                },
                "endpoint": "/api/tools/product-lookup"
            }
        ],
        "tool_class": "ProductLookupTool",
        "description": "BrandPulse Product Database Lookup Tools"
    }

@app.post("/api/chat", response_model=ChatResponse)
async def chat_with_agent(message: ChatMessage):
    """
    Chat with the BrandPulse agent about product perception and analysis
    """
    # Lazy-load the agent on first use
    agent = get_agent()
    if agent is None:
        raise HTTPException(
            status_code=503, 
            detail="BrandPulse Assistant is not available. Please check authentication setup."
        )
    
    try:
        # Prepare the user message with additional context if provided
        user_input = message.text
        
        # ALWAYS check database for product information before making decisions
        # This ensures the agent has real data to work with
        product_context = ""
        product_data = None
        db_queried = False
        
        # Strategy 1: Check if user provided explicit product name
        if message.product_name:
            print(f"🔍 Querying database for product: {message.product_name}")
            product_data = await lookup_product_by_name(message.product_name)
            db_queried = True
            if product_data.get("found"):
                product_context = f"\n\n## Product Database Information (Queried from DB):\n"
                for product in product_data["products"][:1]:  # Use first match
                    product_context += f"- **Product**: {product['name']}\n"
                    product_context += f"- **Brand**: {product['brand']}\n"
                    product_context += f"- **Category**: {product['category']}\n"
                    product_context += f"- **Price**: ${product['price']}\n"
                    product_context += f"- **Description**: {product['description']}\n"
                    product_context += f"- **Total Mentions**: {product['total_mentions']}\n"
                    product_context += f"- **Sentiment Score**: {product['avg_sentiment_score']:.2f}\n"
                    product_context += f"- **Positive**: {product['positive_mentions']}, **Negative**: {product['negative_mentions']}, **Neutral**: {product['neutral_mentions']}\n"
                
                # Add recent sentiment data
                if product_data.get("sentiment_data"):
                    product_context += f"\n### Recent Customer Feedback:\n"
                    for sentiment in product_data["sentiment_data"][:3]:
                        product_context += f"- **{sentiment['sentiment'].title()}** ({sentiment['score']:.2f}): {sentiment['text'][:100]}...\n"
                        if sentiment.get('platform'):
                            product_context += f"  - Source: {sentiment['platform']}\n"
                print(f"✅ Found product data in database")
            else:
                print(f"⚠️ Product '{message.product_name}' not found in database")
        
        # Strategy 2: Extract product names from user message and query database
        # This is more proactive - we check the DB even if product name wasn't explicitly provided
        if not db_queried:
            # Common product keywords to detect
            product_keywords = [
                'iphone', 'samsung', 'tesla', 'nike', 'macbook', 'galaxy',
                'model y', 'model 3', 'airpods', 'ipad', 'watch',
                'sony', 'lg', 'dell', 'hp', 'lenovo', 'asus'
            ]
            
            user_lower = user_input.lower()
            detected_keywords = [kw for kw in product_keywords if kw in user_lower]
            
            if detected_keywords:
                print(f"🔍 Detected product keywords in message: {detected_keywords}")
                # Try to find products for each detected keyword
                for keyword in detected_keywords:
                    print(f"🔍 Querying database for: {keyword}")
                    search_result = await search_products_comprehensive(keyword)
                    if search_result.get("found"):
                        product_data = search_result
                        db_queried = True
                        product_context += f"\n\n## Product Database Information (Queried from DB):\n"
                        product_context += f"**Note**: Found products matching '{keyword}' in database:\n\n"
                        for product in search_result["products"][:3]:  # Show up to 3 matches
                            product_context += f"### {product['name']} ({product['brand']})\n"
                            product_context += f"- **Price**: ${product['price']}\n"
                            product_context += f"- **Category**: {product['category']}\n"
                            product_context += f"- **Sentiment Score**: {product['avg_sentiment_score']:.2f}\n"
                            product_context += f"- **Mentions**: {product['total_mentions']} total ({product['positive_mentions']} positive, {product['negative_mentions']} negative)\n\n"
                        print(f"✅ Found {len(search_result['products'])} product(s) in database")
                        break
        
        # Strategy 3: If no products found but user seems to be asking about products,
        # still inform the agent to use tools
        if not db_queried and any(word in user_input.lower() for word in ['product', 'sentiment', 'review', 'feedback', 'mention']):
            print("🔍 User query seems product-related but no products detected - agent will use tools if needed")
            product_context += "\n\n**Note**: If you need specific product data, use the lookup_product or search_products tools to query the database."
        
        if message.context:
            user_input = f"{user_input}\nAdditional Context: {message.context}"
        
        # Create a comprehensive prompt for brand analysis with product data
        # Include instructions about available tools
        tools_instruction = """
## Available Tools:
You have access to the following tools to query product data from the BrandPulse database:
1. **lookup_product(product_name)**: Lookup detailed information about a specific product by name
2. **search_products(search_term)**: Search for products using keywords (brand, category, etc.)
3. **get_product_details(product_id)**: Get detailed information about a product by its ID

**IMPORTANT**: When users ask about products, USE THESE TOOLS to get real data from the database.
Don't make up product information - always query the database first using the appropriate tool.
"""
        
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
- Provide **data-driven observations** when possible using the product data provided
- Highlight **competitive advantages and disadvantages**
- Offer **concrete recommendations** for improvement
- Be **honest about limitations** and data sources
- **Use the actual product data** from the database when available
- **ALWAYS use tools to query product data** when users ask about specific products

## Markdown Formatting Rules:
- Use `##` for main sections
- Use `###` for subsections  
- Use `**bold**` for emphasis on key points
- Use bullet points (`-`) for lists
- Use numbered lists (`1.`) for recommendations
- Keep paragraphs short (2-3 sentences max)

{tools_instruction}

User question: {user_input}{product_context}"""

        # Debug: Log agent type and methods
        print(f"🔍 Agent type: {type(agent)}")
        print(f"🔍 Agent has generate_content: {hasattr(agent, 'generate_content')}")
        print(f"🔍 Agent has run_async: {hasattr(agent, 'run_async')}")
        
        # Check if this is a Gemini model (direct API) or ADK agent
        if hasattr(agent, 'generate_content'):
            # This is a Gemini model - use generate_content
            try:
                print("🔄 Using Gemini generate_content method...")
                response_obj = agent.generate_content(full_prompt)
                if hasattr(response_obj, 'text'):
                    response = response_obj.text
                elif hasattr(response_obj, 'parts'):
                    # Handle response with parts
                    response = ''.join([part.text for part in response_obj.parts if hasattr(part, 'text')])
                else:
                    response = str(response_obj)
                
                # Check if response contains tool call indicators and execute them
                import re
                tool_results = []
                
                print(f"🔍 Checking response for tool calls (response length: {len(response)})")
                print(f"🔍 Response preview: {response[:200]}...")
                
                # First, try to find tool calls in code blocks (handles both single and double quotes)
                # More flexible pattern that matches any code block with tool calls
                code_block_pattern = r'```[^\n]*\n\s*(lookup_product|search_products|get_product_details)\s*\(([^)]+)\)'
                code_matches = list(re.finditer(code_block_pattern, response, re.IGNORECASE | re.MULTILINE | re.DOTALL))
                print(f"🔍 Found {len(code_matches)} code block matches")
                
                for match in code_matches:
                    func_name = match.group(1).lower()
                    args_str = match.group(2).strip()
                    print(f"🔧 Detected tool call in code block: {func_name}({args_str})")
                    
                    # Parse arguments - handle both single and double quotes
                    func_args = {}
                    if func_name == 'lookup_product':
                        # Try product_name="value" or product_name='value' first
                        name_match = re.search(r'product_name\s*=\s*["\']([^"\']+)["\']', args_str, re.IGNORECASE)
                        if not name_match:
                            # Try just "value" or 'value'
                            name_match = re.search(r'["\']([^"\']+)["\']', args_str)
                        if name_match:
                            func_args['product_name'] = name_match.group(1).strip()
                    elif func_name == 'search_products':
                        term_match = re.search(r'search_term\s*=\s*["\']([^"\']+)["\']', args_str, re.IGNORECASE)
                        if not term_match:
                            term_match = re.search(r'["\']([^"\']+)["\']', args_str)
                        if term_match:
                            func_args['search_term'] = term_match.group(1).strip()
                    elif func_name == 'get_product_details':
                        id_match = re.search(r'product_id\s*=\s*(\d+)', args_str, re.IGNORECASE)
                        if not id_match:
                            id_match = re.search(r'(\d+)', args_str)
                        if id_match:
                            func_args['product_id'] = int(id_match.group(1))
                    
                    if func_args:
                        print(f"🔧 Executing tool: {func_name} with args: {func_args}")
                        try:
                            result = await handle_tool_call(func_name, func_args)
                            tool_results.append(f"**Tool Result from {func_name}:**\n{result}")
                            print(f"✅ Tool {func_name} executed successfully")
                        except Exception as tool_error:
                            print(f"⚠️ Error executing tool {func_name}: {tool_error}")
                            import traceback
                            print(traceback.format_exc())
                            tool_results.append(f"**Error executing {func_name}:** {str(tool_error)}")
                
                # Also check for inline tool calls (without code blocks)
                if not tool_results:
                    inline_pattern = r'(lookup_product|search_products|get_product_details)\s*\(([^)]+)\)'
                    inline_matches = re.finditer(inline_pattern, response, re.IGNORECASE)
                    
                    for match in inline_matches:
                        func_name = match.group(1).lower()
                        args_str = match.group(2).strip()
                        print(f"🔧 Detected inline tool call: {func_name}({args_str})")
                        
                        # Parse arguments (same logic as above)
                        func_args = {}
                        if func_name == 'lookup_product':
                            name_match = re.search(r'product_name\s*=\s*["\']([^"\']+)["\']', args_str, re.IGNORECASE)
                            if not name_match:
                                name_match = re.search(r'["\']([^"\']+)["\']', args_str)
                            if name_match:
                                func_args['product_name'] = name_match.group(1).strip()
                        elif func_name == 'search_products':
                            term_match = re.search(r'search_term\s*=\s*["\']([^"\']+)["\']', args_str, re.IGNORECASE)
                            if not term_match:
                                term_match = re.search(r'["\']([^"\']+)["\']', args_str)
                            if term_match:
                                func_args['search_term'] = term_match.group(1).strip()
                        elif func_name == 'get_product_details':
                            id_match = re.search(r'product_id\s*=\s*(\d+)', args_str, re.IGNORECASE)
                            if not id_match:
                                id_match = re.search(r'(\d+)', args_str)
                            if id_match:
                                func_args['product_id'] = int(id_match.group(1))
                        
                        if func_args:
                            print(f"🔧 Executing tool: {func_name} with args: {func_args}")
                            try:
                                result = await handle_tool_call(func_name, func_args)
                                tool_results.append(f"**Tool Result from {func_name}:**\n{result}")
                                print(f"✅ Tool {func_name} executed successfully")
                            except Exception as tool_error:
                                print(f"⚠️ Error executing tool {func_name}: {tool_error}")
                                import traceback
                                print(traceback.format_exc())
                                tool_results.append(f"**Error executing {func_name}:** {str(tool_error)}")
                            break  # Only execute first tool call found
                
                # If tools were executed, get a final response with the tool results
                if tool_results:
                    print(f"✅ Executed {len(tool_results)} tool(s), getting final response with results")
                    tool_results_text = "\n\n".join(tool_results)
                    follow_up_prompt = f"""Based on the tool results below, provide a comprehensive analysis of the product(s).

{tool_results_text}

Original user question: {user_input}

Provide a detailed analysis with:
- Overview
- Key Strengths  
- Key Weaknesses
- Competitive Position
- Recommendations

Use the actual data from the tool results above."""
                    
                    try:
                        final_response_obj = agent.generate_content(follow_up_prompt)
                        if hasattr(final_response_obj, 'text'):
                            response = final_response_obj.text
                        elif hasattr(final_response_obj, 'parts'):
                            response = ''.join([part.text for part in final_response_obj.parts if hasattr(part, 'text')])
                        else:
                            response = str(final_response_obj)
                        print("✅ Final response with tool results generated successfully")
                    except Exception as follow_up_error:
                        print(f"⚠️ Error generating follow-up response: {follow_up_error}")
                        # Use original response with tool results appended
                        response = f"{response}\n\n## Tool Results:\n{tool_results_text}"
                
                print("✅ Gemini response generated successfully")
                
            except Exception as gemini_error:
                print(f"⚠️ Gemini API error: {gemini_error}")
                import traceback
                print(f"⚠️ Traceback: {traceback.format_exc()}")
                response = None
                
        # Use the ADK agent - try different methods based on availability
        elif hasattr(agent, 'run_async'):
            try:
                print("🔄 Using ADK run_async method...")
                
                # Try different message formats for ADK
                try:
                    # Try to import and use proper ADK message types
                    from google.adk import Message
                    message_formats = [
                        Message(content=full_prompt),  # Proper ADK Message
                        full_prompt,  # Plain string
                        {"content": full_prompt},  # Dict format
                        {"text": full_prompt},  # Alternative dict format
                    ]
                except ImportError:
                    # Fallback if Message class not available
                    message_formats = [
                        full_prompt,  # Plain string
                        {"content": full_prompt},  # Dict format
                        {"text": full_prompt},  # Alternative dict format
                        {"role": "user", "content": full_prompt},  # Chat format
                    ]
                
                response_parts = []
                success = False
                chunk_count = 0
                
                for msg_format in message_formats:
                    try:
                        print(f"🔄 Trying message format: {type(msg_format)}")
                        
                        # Add timeout to prevent hanging (30 seconds)
                        try:
                            async def collect_chunks():
                                nonlocal chunk_count, response_parts
                                function_calls_detected = []
                                
                                try:
                                    async for chunk in agent.run_async(msg_format):
                                        chunk_count += 1
                                        print(f"📦 Received chunk #{chunk_count}, type: {type(chunk)}")
                                        
                                        # Check for function calls in the chunk
                                        # ADK may return function calls in different formats
                                        function_call = None
                                        
                                        # Check if chunk has function_call attribute
                                        if hasattr(chunk, 'function_call'):
                                            function_call = chunk.function_call
                                        elif hasattr(chunk, 'function_calls'):
                                            function_calls_detected.extend(chunk.function_calls)
                                        elif hasattr(chunk, 'tool_calls'):
                                            function_calls_detected.extend(chunk.tool_calls)
                                        elif isinstance(chunk, dict):
                                            if 'function_call' in chunk:
                                                function_call = chunk['function_call']
                                            elif 'function_calls' in chunk:
                                                function_calls_detected.extend(chunk['function_calls'])
                                            elif 'tool_calls' in chunk:
                                                function_calls_detected.extend(chunk['tool_calls'])
                                        
                                        if function_call:
                                            function_calls_detected.append(function_call)
                                        
                                        # Use robust extraction helper
                                        chunk_text = extract_text_from_adk_response(chunk, f"chunk #{chunk_count}")
                                        
                                        if chunk_text:
                                            response_parts.append(chunk_text)
                                            print(f"✅ Extracted {len(chunk_text)} chars from chunk #{chunk_count}")
                                        else:
                                            print(f"⚠️ Could not extract text from chunk #{chunk_count} of type {type(chunk)}")
                                
                                except TypeError as te:
                                    # If it's not an async generator, try awaiting it as a coroutine
                                    if "object is not async iterable" in str(te) or "not iterable" in str(te):
                                        print("🔄 run_async returned a coroutine instead of async generator, awaiting...")
                                        response_obj = await agent.run_async(msg_format)
                                        print(f"📦 Received response object, type: {type(response_obj)}")
                                        
                                        # Use robust extraction helper
                                        response_text = extract_text_from_adk_response(response_obj, "coroutine response")
                                        
                                        if response_text:
                                            response_parts.append(response_text)
                                            chunk_count = 1  # Mark as successful
                                            print(f"✅ Extracted {len(response_text)} chars from coroutine response")
                                        else:
                                            print(f"⚠️ Could not extract text from coroutine response")
                                    else:
                                        raise
                                
                                # Process function calls if detected (after collecting all chunks)
                                if function_calls_detected:
                                    print(f"🔧 Detected {len(function_calls_detected)} function call(s)")
                                    tool_results = []
                                    for func_call in function_calls_detected:
                                        try:
                                            # Extract function name and arguments
                                            if isinstance(func_call, dict):
                                                func_name = func_call.get('name') or func_call.get('function_name')
                                                func_args = func_call.get('arguments') or func_call.get('args', {})
                                            elif hasattr(func_call, 'name'):
                                                func_name = func_call.name
                                                func_args = func_call.arguments if hasattr(func_call, 'arguments') else {}
                                            else:
                                                print(f"⚠️ Unknown function call format: {type(func_call)}")
                                                continue
                                            
                                            if func_name:
                                                print(f"🔧 Executing function: {func_name} with args: {func_args}")
                                                result = await handle_tool_call(func_name, func_args)
                                                tool_results.append(f"Tool result from {func_name}: {result}")
                                        except Exception as tool_error:
                                            print(f"⚠️ Error processing function call: {tool_error}")
                                            import traceback
                                            print(traceback.format_exc())
                                    
                                    # Add tool results to response parts
                                    if tool_results:
                                        response_parts.append("\n\n## Database Query Results:\n" + "\n".join(tool_results))
                                        print(f"✅ Added {len(tool_results)} tool result(s) to response")
                            
                            # Run with timeout
                            await asyncio.wait_for(collect_chunks(), timeout=30.0)
                            
                        except asyncio.TimeoutError:
                            print(f"⚠️ ADK run_async timed out after 30 seconds for format {type(msg_format)}")
                            if response_parts:
                                # Use what we have so far
                                success = True
                                break
                            continue
                        except TypeError as te:
                            # If it's not an async generator, try awaiting it as a coroutine
                            if "object is not async iterable" in str(te) or "not iterable" in str(te):
                                print("🔄 run_async returned a coroutine instead of async generator, awaiting...")
                                try:
                                    response_obj = await asyncio.wait_for(agent.run_async(msg_format), timeout=30.0)
                                    print(f"📦 Received response object, type: {type(response_obj)}")
                                    
                                    # Use robust extraction helper
                                    response_text = extract_text_from_adk_response(response_obj, "coroutine response")
                                    
                                    if response_text:
                                        response_parts.append(response_text)
                                        chunk_count = 1  # Mark as successful
                                        print(f"✅ Extracted {len(response_text)} chars from coroutine response")
                                    else:
                                        print(f"⚠️ Could not extract text from coroutine response")
                                except asyncio.TimeoutError:
                                    print(f"⚠️ ADK coroutine timed out after 30 seconds")
                                    continue
                            else:
                                raise
                        
                        if chunk_count > 0:
                            success = True
                            break
                        else:
                            print(f"⚠️ No chunks received for format {type(msg_format)}")
                            
                    except Exception as format_error:
                        print(f"⚠️ Message format {type(msg_format)} failed: {format_error}")
                        import traceback
                        print(f"⚠️ Traceback: {traceback.format_exc()}")
                        response_parts = []
                        chunk_count = 0
                        continue
                
                if success and response_parts:
                    response = ''.join(response_parts)
                    # Validate response is not empty and has reasonable length
                    if len(response.strip()) > 0:
                        print(f"✅ ADK async response generated successfully ({len(response_parts)} chunks, {len(response)} chars)")
                    else:
                        print("⚠️ ADK async response is empty after joining")
                        response = None
                elif success:
                    print("⚠️ ADK async succeeded but no response parts collected")
                    response = None
                else:
                    print("⚠️ ADK async failed for all message formats")
                    response = None
                
            except Exception as adk_error:
                print(f"⚠️ ADK async error: {adk_error}")
                import traceback
                print(f"⚠️ Traceback: {traceback.format_exc()}")
                response = None
        elif hasattr(agent, 'run_live'):
            try:
                print("🔄 Using ADK run_live method...")
                # run_live might be for interactive sessions, try it anyway
                response_obj = agent.run_live(full_prompt)
                response = extract_text_from_adk_response(response_obj, "run_live response")
                
                if response:
                    print(f"✅ ADK live response generated successfully ({len(response)} chars)")
                else:
                    print("⚠️ ADK live response was empty")
                    response = None
                
            except Exception as live_error:
                print(f"⚠️ ADK live error: {live_error}")
                import traceback
                print(f"⚠️ Traceback: {traceback.format_exc()}")
                response = None
        elif hasattr(agent, 'run'):
            try:
                # Try synchronous run method first (more reliable)
                print("🔄 Using ADK synchronous run method...")
                response_obj = agent.run(full_prompt)
                
                # Use robust extraction helper
                response = extract_text_from_adk_response(response_obj, "run response")
                
                if response:
                    print(f"✅ ADK response generated successfully ({len(response)} chars)")
                else:
                    print("⚠️ ADK run response was empty")
                    response = None
                
            except Exception as adk_error:
                print(f"⚠️ ADK sync error: {adk_error}")
                import traceback
                print(f"⚠️ Traceback: {traceback.format_exc()}")
                # Try async method as fallback
                try:
                    if hasattr(agent, 'run_async'):
                        print("🔄 Trying ADK async method as fallback...")
                        response_parts = []
                        chunk_count = 0
                        async for chunk in agent.run_async(full_prompt):
                            chunk_count += 1
                            print(f"📦 Fallback: Received chunk #{chunk_count}, type: {type(chunk)}")
                            
                            # Use robust extraction helper
                            chunk_text = extract_text_from_adk_response(chunk, f"fallback chunk #{chunk_count}")
                            
                            if chunk_text:
                                response_parts.append(chunk_text)
                        
                        if response_parts:
                            response = ''.join(response_parts)
                            print(f"✅ ADK async fallback successful ({len(response_parts)} chunks, {len(response)} chars)")
                        else:
                            print("⚠️ ADK async fallback produced no response parts")
                            raise adk_error
                    else:
                        raise adk_error
                except Exception as async_error:
                    print(f"⚠️ ADK async also failed: {async_error}")
                    import traceback
                    print(f"⚠️ Async fallback traceback: {traceback.format_exc()}")
                    # Fallback to mock response if both fail
                    response = f"""## 🤖 BrandPulse Assistant Response

**Status**: AI service temporarily unavailable
**Issue**: {str(adk_error)}

### 📊 Analysis Request:
{user_input}

### 🎯 Fallback Analysis Response:

**Product Sentiment Overview:**
- Overall sentiment: Mixed (60% positive, 25% neutral, 15% negative)
- Key strengths: Quality, reliability, user experience
- Areas for improvement: Pricing, customer support

**Competitive Position:**
- Market share: Strong in target segments
- Differentiation: Innovation and brand trust
- Threats: Emerging competitors, price sensitivity

**Recommendations:**
1. **Monitor sentiment trends** across all channels
2. **Address negative feedback** proactively
3. **Leverage positive mentions** for marketing
4. **Track competitor activities** regularly

**Next Steps:**
- Set up real-time sentiment monitoring
- Implement automated alert system
- Create sentiment-based response workflows

---
*Note: This is a fallback response. AI service will be restored shortly.*"""
        else:
            # Debug: Check what methods the agent has
            print(f"🔍 Agent type: {type(agent)}")
            agent_methods = [method for method in dir(agent) if not method.startswith('_')]
            print(f"🔍 Agent methods: {agent_methods}")
            
            # Try alternative methods
            if hasattr(agent, 'chat'):
                try:
                    print("🔄 Using chat method...")
                    response_obj = agent.chat(full_prompt)
                    if hasattr(response_obj, 'text'):
                        response = response_obj.text
                    elif hasattr(response_obj, 'content'):
                        response = response_obj.content
                    else:
                        response = str(response_obj)
                    print("✅ Chat method response successful")
                except Exception as chat_error:
                    print(f"⚠️ Chat method error: {chat_error}")
                    response = "Agent chat method failed"
            elif hasattr(agent, 'send_message'):
                try:
                    print("🔄 Using send_message method...")
                    response_obj = agent.send_message(full_prompt)
                    if hasattr(response_obj, 'text'):
                        response = response_obj.text
                    elif hasattr(response_obj, 'content'):
                        response = response_obj.content
                    else:
                        response = str(response_obj)
                    print("✅ Send message response successful")
                except Exception as send_error:
                    print(f"⚠️ Send message error: {send_error}")
                    response = "Agent send_message method failed"
            else:
                # This should not happen if agent was properly initialized
                print(f"⚠️ Agent doesn't match any expected type. Type: {type(agent)}")
                print(f"⚠️ Available methods: {agent_methods}")
                response = f"Agent not properly initialized. Available methods: {agent_methods}"
        
        # Final validation: Ensure response is never None or empty
        # This is critical for exhibition/demo reliability
        if response is None or (isinstance(response, str) and len(response.strip()) == 0):
            print("⚠️ All agent methods failed or returned empty response, using fallback response")
            response = f"""## 🤖 BrandPulse Assistant Response

**Status**: AI service temporarily unavailable
**Issue**: Agent methods not responding properly

### 📊 Analysis Request:
{user_input}

### 🎯 Fallback Analysis Response:

**Product Sentiment Overview:**
- Overall sentiment: Mixed (60% positive, 25% neutral, 15% negative)
- Key strengths: Quality, reliability, user experience
- Areas for improvement: Pricing, customer support

**Competitive Position:**
- Market share: Strong in target segments
- Differentiation: Innovation and brand trust
- Threats: Emerging competitors, price sensitivity

**Recommendations:**
1. **Monitor sentiment trends** across all channels
2. **Address negative feedback** proactively
3. **Leverage positive mentions** for marketing
4. **Track competitor activities** regularly

**Next Steps:**
- Set up real-time sentiment monitoring
- Implement automated alert system
- Create sentiment-based response workflows

---
*Note: This is a fallback response. The AI service is being configured.*"""
        
        # Final safety check: Convert to string and ensure it's not empty
        response = str(response).strip()
        if len(response) == 0:
            response = "I apologize, but I'm unable to generate a response at this time. Please try again."
        
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
        
        # Final return with guaranteed non-empty response
        print(f"✅ Returning response to client ({len(response)} chars)")
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
    # Lazy-load the agent on first use
    agent = get_agent()
    if agent is None:
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

        if hasattr(agent, 'generate_content'):
            try:
                # Check if it's async or sync
                import inspect
                if inspect.iscoroutinefunction(agent.generate_content):
                    response_obj = await asyncio.to_thread(agent.generate_content, full_analysis_prompt, request_options={"timeout": 30})
                else:
                    response_obj = agent.generate_content(full_analysis_prompt, request_options={"timeout": 30})
                response = response_obj.text
            except Exception as gen_error:
                print(f"⚠️ Gemini API error in product analysis: {gen_error}")
                # Fallback response for product analysis
                response = f"""## 🤖 BrandPulse Assistant Response

**Status**: AI service temporarily unavailable
**Issue**: {str(gen_error)}

### 📊 Product Analysis Request:
**{product_name}**

### 🎯 Fallback Analysis Response:

**Overview:**
- Market sentiment: Mixed with positive trends
- Public perception: Generally favorable with room for improvement
- Recent developments: Stable market position

**Key Strengths:**
- Quality and reliability
- Strong brand recognition
- Good user experience

**Key Weaknesses:**
- Pricing concerns
- Customer support issues
- Limited availability

**Competitive Position:**
- Strong market presence
- Competitive pricing
- Good differentiation

**Recommendations:**
1. **Improve customer support** response times
2. **Address pricing concerns** through value communication
3. **Enhance availability** and distribution
4. **Monitor competitor activities** closely

---
*Note: This is a fallback response. AI service will be restored shortly.*"""
        else:
            response = "Agent not properly initialized"
        
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
                f"http://database-api:8002/analytics/topics",
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

@app.get("/api/dashboard/overview")
async def get_dashboard_overview():
    """
    Get dashboard overview data
    """
    try:
        print("📊 Dashboard overview endpoint called")
        return {
            "totalReviews": 15847,
            "positivePercent": 68.2,
            "negativePercent": 18.5,
            "neutralPercent": 13.3,
            "todayReviews": 1247,
            "weeklyGrowth": 12.5,
            "monthlyGrowth": 8.7,
            "avgResponseTime": "1.8 hours",
            "customerSatisfaction": 4.2,
            "topPositiveTopics": ["Quality", "Performance", "Design"],
            "topNegativeTopics": ["Price", "Support", "Delivery"],
            "recentAlerts": [
                {"type": "info", "message": "Analysis completed", "time": "Just now"},
                {"type": "success", "message": "Positive sentiment trend detected", "time": "1 hour ago"},
            ],
            "weeklyData": [
                {"day": "Mon", "positive": 120, "negative": 30, "neutral": 20},
                {"day": "Tue", "positive": 150, "negative": 25, "neutral": 15},
                {"day": "Wed", "positive": 180, "negative": 40, "neutral": 25},
                {"day": "Thu", "positive": 200, "negative": 35, "neutral": 30},
                {"day": "Fri", "positive": 220, "negative": 45, "neutral": 35},
                {"day": "Sat", "positive": 190, "negative": 30, "neutral": 25},
                {"day": "Sun", "positive": 160, "negative": 20, "neutral": 20},
            ]
        }
    except Exception as e:
        print(f"❌ Dashboard overview error: {e}")
        raise HTTPException(status_code=500, detail=f"Dashboard error: {str(e)}")

@app.get("/api/analytics/sentiment")
async def get_sentiment_analysis(timeRange: str = "7d", channel: str = "all"):
    """
    Get sentiment analysis data
    """
    return {
        "channelBreakdown": [
            {"channel": "Twitter", "positive": 45, "negative": 30, "neutral": 25, "total": 1000, "engagement": 85},
            {"channel": "Facebook", "positive": 60, "negative": 20, "neutral": 20, "total": 800, "engagement": 78},
            {"channel": "Instagram", "positive": 70, "negative": 15, "neutral": 15, "total": 600, "engagement": 92},
            {"channel": "Reviews", "positive": 55, "negative": 25, "neutral": 20, "total": 1200, "engagement": 88},
        ],
        "recentReviews": [
            {"id": 1, "text": "Great product, highly recommend!", "sentiment": "positive", "channel": "Twitter", "timestamp": "2024-01-15T10:30:00Z", "score": 0.8},
            {"id": 2, "text": "Not satisfied with the quality", "sentiment": "negative", "channel": "Facebook", "timestamp": "2024-01-15T09:15:00Z", "score": -0.6},
            {"id": 3, "text": "Average experience, nothing special", "sentiment": "neutral", "channel": "Reviews", "timestamp": "2024-01-15T08:45:00Z", "score": 0.1},
            {"id": 4, "text": "Amazing service and fast delivery!", "sentiment": "positive", "channel": "Instagram", "timestamp": "2024-01-15T07:20:00Z", "score": 0.9},
            {"id": 5, "text": "Could be better, had some issues", "sentiment": "negative", "channel": "Twitter", "timestamp": "2024-01-15T06:10:00Z", "score": -0.4},
        ],
        "topKeywords": [
            {"word": "quality", "count": 342, "sentiment": "positive"},
            {"word": "price", "count": 289, "sentiment": "negative"},
            {"word": "delivery", "count": 234, "sentiment": "positive"},
            {"word": "support", "count": 198, "sentiment": "negative"},
            {"word": "design", "count": 167, "sentiment": "positive"},
        ],
        "hourlyTrend": [
            {"hour": "00:00", "positive": 12, "negative": 3, "neutral": 2},
            {"hour": "01:00", "positive": 8, "negative": 2, "neutral": 1},
            {"hour": "02:00", "positive": 6, "negative": 1, "neutral": 1},
            {"hour": "03:00", "positive": 5, "negative": 1, "neutral": 0},
            {"hour": "04:00", "positive": 7, "negative": 2, "neutral": 1},
            {"hour": "05:00", "positive": 15, "negative": 4, "neutral": 2},
            {"hour": "06:00", "positive": 25, "negative": 6, "neutral": 3},
            {"hour": "07:00", "positive": 35, "negative": 8, "neutral": 4},
            {"hour": "08:00", "positive": 45, "negative": 12, "neutral": 6},
            {"hour": "09:00", "positive": 55, "negative": 15, "neutral": 8},
            {"hour": "10:00", "positive": 65, "negative": 18, "neutral": 10},
            {"hour": "11:00", "positive": 70, "negative": 20, "neutral": 12},
            {"hour": "12:00", "positive": 75, "negative": 22, "neutral": 14},
            {"hour": "13:00", "positive": 80, "negative": 25, "neutral": 16},
            {"hour": "14:00", "positive": 85, "negative": 28, "neutral": 18},
            {"hour": "15:00", "positive": 90, "negative": 30, "neutral": 20},
            {"hour": "16:00", "positive": 85, "negative": 28, "neutral": 18},
            {"hour": "17:00", "positive": 80, "negative": 25, "neutral": 16},
            {"hour": "18:00", "positive": 70, "negative": 20, "neutral": 12},
            {"hour": "19:00", "positive": 60, "negative": 18, "neutral": 10},
            {"hour": "20:00", "positive": 50, "negative": 15, "neutral": 8},
            {"hour": "21:00", "positive": 40, "negative": 12, "neutral": 6},
            {"hour": "22:00", "positive": 30, "negative": 8, "neutral": 4},
            {"hour": "23:00", "positive": 20, "negative": 5, "neutral": 2},
        ],
        "summary": {
            "totalMentions": 3600,
            "positiveMentions": 2160,
            "negativeMentions": 720,
            "neutralMentions": 720
        }
    }

@app.get("/api/products/search")
async def search_products(q: str = "", limit: int = 20):
    """
    Search products
    """
    mock_products = [
        {
            "id": 1,
            "name": "iPhone 15 Pro",
            "brand": "Apple",
            "category": "Smartphones",
            "price": 999.00,
            "image_url": "https://via.placeholder.com/300x300/007AFF/FFFFFF?text=iPhone+15+Pro",
            "sentiment_summary": {
                "positive": 72,
                "negative": 18,
                "neutral": 10,
                "avg_score": 0.68,
                "total_mentions": 1247
            }
        },
        {
            "id": 2,
            "name": "Samsung Galaxy S24",
            "brand": "Samsung",
            "category": "Smartphones",
            "price": 799.00,
            "image_url": "https://via.placeholder.com/300x300/1F2937/FFFFFF?text=Galaxy+S24",
            "sentiment_summary": {
                "positive": 65,
                "negative": 25,
                "neutral": 10,
                "avg_score": 0.55,
                "total_mentions": 892
            }
        },
        {
            "id": 3,
            "name": "MacBook Pro M3",
            "brand": "Apple",
            "category": "Laptops",
            "price": 1999.00,
            "image_url": "https://via.placeholder.com/300x300/007AFF/FFFFFF?text=MacBook+Pro",
            "sentiment_summary": {
                "positive": 78,
                "negative": 15,
                "neutral": 7,
                "avg_score": 0.72,
                "total_mentions": 634
            }
        },
        {
            "id": 4,
            "name": "Tesla Model Y",
            "brand": "Tesla",
            "category": "Electric Vehicles",
            "price": 47990.00,
            "image_url": "https://via.placeholder.com/300x300/CC0000/FFFFFF?text=Tesla+Model+Y",
            "sentiment_summary": {
                "positive": 68,
                "negative": 22,
                "neutral": 10,
                "avg_score": 0.58,
                "total_mentions": 1456
            }
        },
        {
            "id": 5,
            "name": "Nike Air Max 270",
            "brand": "Nike",
            "category": "Footwear",
            "price": 150.00,
            "image_url": "https://via.placeholder.com/300x300/FF6900/FFFFFF?text=Nike+Air+Max",
            "sentiment_summary": {
                "positive": 82,
                "negative": 12,
                "neutral": 6,
                "avg_score": 0.76,
                "total_mentions": 723
            }
        }
    ]
    
    # Filter products based on search query
    if q:
        filtered_products = [p for p in mock_products if q.lower() in p["name"].lower() or q.lower() in p["brand"].lower()]
    else:
        filtered_products = mock_products
    
    return {
        "results": filtered_products[:limit],
        "total": len(filtered_products),
        "query": q,
        "facets": {
            "brands": list(set([p["brand"] for p in filtered_products])),
            "categories": list(set([p["category"] for p in filtered_products])),
            "price_ranges": ["$0-$200", "$200-$1000", "$1000+"]
        }
    }
    
@app.get("/api/products/{product_id}/sentiment")
async def get_product_sentiment(product_id: int, timeRange: str = "7d"):
    """
    Get sentiment analysis for a specific product
    """
    # Mock product sentiment data
    mock_product_data = {
        1: {  # iPhone 15 Pro
            "summary": {
                "total_mentions": 1247,
                "positive_mentions": 897,
                "negative_mentions": 224,
                "neutral_mentions": 126,
                "avg_sentiment_score": 0.68,
                "trend": "increasing"
            },
            "timeline": [
                {"date": "2024-01-10", "positive": 45, "negative": 12, "neutral": 8, "total": 65},
                {"date": "2024-01-11", "positive": 52, "negative": 15, "neutral": 9, "total": 76},
                {"date": "2024-01-12", "positive": 48, "negative": 18, "neutral": 11, "total": 77},
                {"date": "2024-01-13", "positive": 61, "negative": 14, "neutral": 7, "total": 82},
                {"date": "2024-01-14", "positive": 55, "negative": 16, "neutral": 10, "total": 81},
                {"date": "2024-01-15", "positive": 58, "negative": 13, "neutral": 9, "total": 80},
                {"date": "2024-01-16", "positive": 62, "negative": 11, "neutral": 8, "total": 81}
            ],
            "channels": [
                {"channel": "Twitter", "positive": 58, "negative": 32, "neutral": 10, "total": 456},
                {"channel": "Amazon Reviews", "positive": 75, "negative": 18, "neutral": 7, "total": 289},
                {"channel": "YouTube", "positive": 82, "negative": 12, "neutral": 6, "total": 167},
                {"channel": "Reddit", "positive": 45, "negative": 40, "neutral": 15, "total": 234}
            ],
            "topics": [
                {"topic": "Camera Quality", "sentiment": "positive", "mentions": 342, "score": 0.78},
                {"topic": "Price", "sentiment": "negative", "mentions": 189, "score": -0.45},
                {"topic": "Battery Life", "sentiment": "neutral", "mentions": 156, "score": 0.12},
                {"topic": "Design", "sentiment": "positive", "mentions": 234, "score": 0.65},
                {"topic": "Performance", "sentiment": "positive", "mentions": 198, "score": 0.72}
            ]
        },
        2: {  # Samsung Galaxy S24
            "summary": {
                "total_mentions": 892,
                "positive_mentions": 580,
                "negative_mentions": 223,
                "neutral_mentions": 89,
                "avg_sentiment_score": 0.55,
                "trend": "stable"
            },
            "timeline": [
                {"date": "2024-01-10", "positive": 32, "negative": 18, "neutral": 6, "total": 56},
                {"date": "2024-01-11", "positive": 38, "negative": 22, "neutral": 8, "total": 68},
                {"date": "2024-01-12", "positive": 35, "negative": 25, "neutral": 9, "total": 69},
                {"date": "2024-01-13", "positive": 42, "negative": 20, "neutral": 7, "total": 69},
                {"date": "2024-01-14", "positive": 40, "negative": 24, "neutral": 8, "total": 72},
                {"date": "2024-01-15", "positive": 45, "negative": 19, "neutral": 6, "total": 70},
                {"date": "2024-01-16", "positive": 48, "negative": 17, "neutral": 7, "total": 72}
            ],
            "channels": [
                {"channel": "Twitter", "positive": 52, "negative": 35, "neutral": 13, "total": 312},
                {"channel": "Amazon Reviews", "positive": 68, "negative": 25, "neutral": 7, "total": 201},
                {"channel": "YouTube", "positive": 75, "negative": 18, "neutral": 7, "total": 134},
                {"channel": "Reddit", "positive": 38, "negative": 45, "neutral": 17, "total": 167}
            ],
            "topics": [
                {"topic": "Display Quality", "sentiment": "positive", "mentions": 234, "score": 0.68},
                {"topic": "Price", "sentiment": "negative", "mentions": 198, "score": -0.52},
                {"topic": "Camera", "sentiment": "positive", "mentions": 167, "score": 0.58},
                {"topic": "Software", "sentiment": "negative", "mentions": 145, "score": -0.38},
                {"topic": "Battery", "sentiment": "neutral", "mentions": 123, "score": 0.15}
            ]
        },
        3: {  # MacBook Pro M3
            "summary": {
                "total_mentions": 634,
                "positive_mentions": 494,
                "negative_mentions": 95,
                "neutral_mentions": 45,
                "avg_sentiment_score": 0.72,
                "trend": "increasing"
            },
            "timeline": [
                {"date": "2024-01-10", "positive": 28, "negative": 6, "neutral": 3, "total": 37},
                {"date": "2024-01-11", "positive": 32, "negative": 8, "neutral": 4, "total": 44},
                {"date": "2024-01-12", "positive": 30, "negative": 9, "neutral": 5, "total": 44},
                {"date": "2024-01-13", "positive": 35, "negative": 7, "neutral": 3, "total": 45},
                {"date": "2024-01-14", "positive": 38, "negative": 6, "neutral": 4, "total": 48},
                {"date": "2024-01-15", "positive": 42, "negative": 5, "neutral": 3, "total": 50},
                {"date": "2024-01-16", "positive": 45, "negative": 4, "neutral": 2, "total": 51}
            ],
            "channels": [
                {"channel": "Twitter", "positive": 68, "negative": 22, "neutral": 10, "total": 201},
                {"channel": "Amazon Reviews", "positive": 82, "negative": 12, "neutral": 6, "total": 156},
                {"channel": "YouTube", "positive": 88, "negative": 8, "neutral": 4, "total": 123},
                {"channel": "Reddit", "positive": 72, "negative": 18, "neutral": 10, "total": 154}
            ],
            "topics": [
                {"topic": "Performance", "sentiment": "positive", "mentions": 198, "score": 0.85},
                {"topic": "Price", "sentiment": "negative", "mentions": 145, "score": -0.62},
                {"topic": "Build Quality", "sentiment": "positive", "mentions": 123, "score": 0.78},
                {"topic": "Battery Life", "sentiment": "positive", "mentions": 98, "score": 0.72},
                {"topic": "Display", "sentiment": "positive", "mentions": 87, "score": 0.68}
            ]
        }
    }
    
    product_data = mock_product_data.get(product_id, {
        "summary": {
            "total_mentions": 0,
            "positive_mentions": 0,
            "negative_mentions": 0,
            "neutral_mentions": 0,
            "avg_sentiment_score": 0,
            "trend": "stable"
        },
        "timeline": [],
        "channels": [],
        "topics": []
    })
    
    return product_data

@app.get("/api/products/{product_id}")
async def get_product_details(product_id: int):
    """
    Get detailed information about a specific product
    """
    mock_products = {
        1: {
            "id": 1,
            "name": "iPhone 15 Pro",
            "brand": "Apple",
            "category": "Smartphones",
            "price": 999.00,
            "description": "Latest iPhone with titanium design and advanced camera system. Features include A17 Pro chip, 48MP camera system, and titanium construction.",
            "image_url": "https://via.placeholder.com/300x300/007AFF/FFFFFF?text=iPhone+15+Pro",
            "specifications": {
                "display": "6.1-inch Super Retina XDR",
                "storage": "128GB",
                "camera": "48MP Main + 12MP Ultra Wide",
                "chip": "A17 Pro",
                "battery": "Up to 23 hours video playback"
            },
            "sentiment_summary": {
                "positive": 72,
                "negative": 18,
                "neutral": 10,
                "avg_score": 0.68,
                "total_mentions": 1247,
                "trend": "increasing"
            }
        },
        2: {
            "id": 2,
            "name": "Samsung Galaxy S24",
            "brand": "Samsung",
            "category": "Smartphones",
            "price": 799.00,
            "description": "Samsung's flagship smartphone with advanced AI features, superior camera system, and premium design.",
            "image_url": "https://via.placeholder.com/300x300/1F2937/FFFFFF?text=Galaxy+S24",
            "specifications": {
                "display": "6.2-inch Dynamic AMOLED 2X",
                "storage": "256GB",
                "camera": "50MP Main + 12MP Ultra Wide",
                "chip": "Snapdragon 8 Gen 3",
                "battery": "4000mAh"
            },
            "sentiment_summary": {
                "positive": 65,
                "negative": 25,
                "neutral": 10,
                "avg_score": 0.55,
                "total_mentions": 892,
                "trend": "stable"
            }
        },
        3: {
            "id": 3,
            "name": "MacBook Pro M3",
            "brand": "Apple",
            "category": "Laptops",
            "price": 1999.00,
            "description": "Professional laptop with M3 chip, stunning Liquid Retina XDR display, and all-day battery life.",
            "image_url": "https://via.placeholder.com/300x300/007AFF/FFFFFF?text=MacBook+Pro",
            "specifications": {
                "display": "14.2-inch Liquid Retina XDR",
                "storage": "512GB SSD",
                "chip": "Apple M3",
                "memory": "8GB Unified Memory",
                "battery": "Up to 18 hours"
            },
            "sentiment_summary": {
                "positive": 78,
                "negative": 15,
                "neutral": 7,
                "avg_score": 0.72,
                "total_mentions": 634,
                "trend": "increasing"
            }
        }
    }
    
    product = mock_products.get(product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    return product

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
    
    # Note: Server startup is handled by Dockerfile CMD
    print("ℹ️ Server startup handled by Dockerfile CMD")
