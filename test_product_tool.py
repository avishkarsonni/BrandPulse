#!/usr/bin/env python3
"""
Test script for BrandPulse Product Lookup Tool
This script tests the product lookup functionality and AI integration
"""

import asyncio
import httpx
import json
from datetime import datetime

# Configuration
BASE_URL = "http://localhost:8000"
TEST_PRODUCTS = [
    "iPhone 15 Pro",
    "Samsung Galaxy S24", 
    "MacBook Pro M3",
    "Tesla Model Y",
    "Nike Air Max 270"
]

async def test_health_check():
    """Test the health check endpoint"""
    print("🔍 Testing Health Check...")
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{BASE_URL}/health")
            if response.status_code == 200:
                data = response.json()
                print(f"✅ Health Check Passed")
                print(f"   - Status: {data.get('status')}")
                print(f"   - Database Available: {data.get('database', {}).get('available')}")
                print(f"   - Product Tool Available: {data.get('tools', {}).get('product_lookup', {}).get('available')}")
                return True
            else:
                print(f"❌ Health Check Failed: {response.status_code}")
                return False
    except Exception as e:
        print(f"❌ Health Check Error: {e}")
        return False

async def test_available_tools():
    """Test the available tools endpoint"""
    print("\n🔧 Testing Available Tools...")
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{BASE_URL}/api/tools/available")
            if response.status_code == 200:
                data = response.json()
                print(f"✅ Available Tools Retrieved")
                print(f"   - Tool Count: {len(data.get('tools', []))}")
                for tool in data.get('tools', []):
                    print(f"   - {tool.get('name')}: {tool.get('description')}")
                return True
            else:
                print(f"❌ Available Tools Failed: {response.status_code}")
                return False
    except Exception as e:
        print(f"❌ Available Tools Error: {e}")
        return False

async def test_product_lookup(product_name: str):
    """Test product lookup by name"""
    print(f"\n🔍 Testing Product Lookup: {product_name}")
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{BASE_URL}/api/products/lookup/{product_name}")
            if response.status_code == 200:
                data = response.json()
                if data.get('found'):
                    products = data.get('products', [])
                    print(f"✅ Product Found: {len(products)} results")
                    for product in products[:1]:  # Show first result
                        print(f"   - Name: {product.get('name')}")
                        print(f"   - Brand: {product.get('brand')}")
                        print(f"   - Price: ${product.get('price')}")
                        print(f"   - Sentiment Score: {product.get('avg_sentiment_score', 0):.2f}")
                        print(f"   - Total Mentions: {product.get('total_mentions', 0)}")
                else:
                    print(f"⚠️  Product Not Found: {product_name}")
                return data.get('found', False)
            else:
                print(f"❌ Product Lookup Failed: {response.status_code}")
                return False
    except Exception as e:
        print(f"❌ Product Lookup Error: {e}")
        return False

async def test_product_search(search_term: str):
    """Test product search functionality"""
    print(f"\n🔍 Testing Product Search: {search_term}")
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{BASE_URL}/api/products/search?q={search_term}&limit=3")
            if response.status_code == 200:
                data = response.json()
                if data.get('found'):
                    products = data.get('products', [])
                    print(f"✅ Search Results: {len(products)} products found")
                    for product in products:
                        print(f"   - {product.get('name')} ({product.get('brand')}) - ${product.get('price')}")
                else:
                    print(f"⚠️  No Search Results: {search_term}")
                return data.get('found', False)
            else:
                print(f"❌ Product Search Failed: {response.status_code}")
                return False
    except Exception as e:
        print(f"❌ Product Search Error: {e}")
        return False

async def test_ai_tool_endpoint():
    """Test the AI tool endpoint"""
    print(f"\n🤖 Testing AI Tool Endpoint...")
    try:
        async with httpx.AsyncClient() as client:
            # Test lookup_product tool
            tool_request = {
                "tool_name": "lookup_product",
                "parameters": {
                    "product_name": "iPhone 15 Pro"
                }
            }
            
            response = await client.post(f"{BASE_URL}/api/tools/product-lookup", json=tool_request)
            if response.status_code == 200:
                data = response.json()
                print(f"✅ AI Tool Endpoint Working")
                print(f"   - Tool Name: {data.get('tool_name')}")
                print(f"   - Result Found: {data.get('result', {}).get('found', False)}")
                if data.get('formatted_summary'):
                    print(f"   - Summary Length: {len(data.get('formatted_summary', ''))} characters")
                return True
            else:
                print(f"❌ AI Tool Endpoint Failed: {response.status_code}")
                return False
    except Exception as e:
        print(f"❌ AI Tool Endpoint Error: {e}")
        return False

async def test_chat_integration():
    """Test chat integration with product lookup"""
    print(f"\n💬 Testing Chat Integration...")
    try:
        async with httpx.AsyncClient() as client:
            chat_request = {
                "text": "Tell me about the iPhone 15 Pro",
                "product_name": "iPhone 15 Pro"
            }
            
            response = await client.post(f"{BASE_URL}/api/chat", json=chat_request)
            if response.status_code == 200:
                data = response.json()
                print(f"✅ Chat Integration Working")
                print(f"   - Agent Name: {data.get('agent_name')}")
                print(f"   - Response Length: {len(data.get('response', ''))} characters")
                print(f"   - Response Preview: {data.get('response', '')[:200]}...")
                return True
            else:
                print(f"❌ Chat Integration Failed: {response.status_code}")
                return False
    except Exception as e:
        print(f"❌ Chat Integration Error: {e}")
        return False

async def run_comprehensive_test():
    """Run comprehensive test suite"""
    print("🚀 Starting BrandPulse Product Lookup Tool Tests")
    print("=" * 60)
    
    # Test results tracking
    results = {
        "health_check": False,
        "available_tools": False,
        "product_lookups": 0,
        "product_searches": 0,
        "ai_tool_endpoint": False,
        "chat_integration": False
    }
    
    # Run tests
    results["health_check"] = await test_health_check()
    results["available_tools"] = await test_available_tools()
    
    # Test product lookups
    for product in TEST_PRODUCTS:
        if await test_product_lookup(product):
            results["product_lookups"] += 1
    
    # Test product searches
    search_terms = ["iPhone", "Samsung", "Apple", "Tesla", "Nike"]
    for term in search_terms:
        if await test_product_search(term):
            results["product_searches"] += 1
    
    results["ai_tool_endpoint"] = await test_ai_tool_endpoint()
    results["chat_integration"] = await test_chat_integration()
    
    # Print summary
    print("\n" + "=" * 60)
    print("📊 Test Results Summary")
    print("=" * 60)
    print(f"✅ Health Check: {'PASS' if results['health_check'] else 'FAIL'}")
    print(f"✅ Available Tools: {'PASS' if results['available_tools'] else 'FAIL'}")
    print(f"✅ Product Lookups: {results['product_lookups']}/{len(TEST_PRODUCTS)} successful")
    print(f"✅ Product Searches: {results['product_searches']}/{len(search_terms)} successful")
    print(f"✅ AI Tool Endpoint: {'PASS' if results['ai_tool_endpoint'] else 'FAIL'}")
    print(f"✅ Chat Integration: {'PASS' if results['chat_integration'] else 'FAIL'}")
    
    # Overall success rate
    total_tests = 6
    passed_tests = sum([
        results["health_check"],
        results["available_tools"],
        results["product_lookups"] > 0,
        results["product_searches"] > 0,
        results["ai_tool_endpoint"],
        results["chat_integration"]
    ])
    
    success_rate = (passed_tests / total_tests) * 100
    print(f"\n🎯 Overall Success Rate: {success_rate:.1f}% ({passed_tests}/{total_tests})")
    
    if success_rate >= 80:
        print("🎉 Product Lookup Tool is working well!")
    elif success_rate >= 60:
        print("⚠️  Product Lookup Tool has some issues but is functional")
    else:
        print("❌ Product Lookup Tool needs attention")
    
    return success_rate >= 80

if __name__ == "__main__":
    print("BrandPulse Product Lookup Tool Test Suite")
    print(f"Testing against: {BASE_URL}")
    print(f"Test started at: {datetime.now().isoformat()}")
    
    try:
        success = asyncio.run(run_comprehensive_test())
        exit_code = 0 if success else 1
        print(f"\nTest completed with exit code: {exit_code}")
    except KeyboardInterrupt:
        print("\n⚠️  Test interrupted by user")
        exit_code = 130
    except Exception as e:
        print(f"\n❌ Test suite error: {e}")
        exit_code = 1
    
    exit(exit_code)



















