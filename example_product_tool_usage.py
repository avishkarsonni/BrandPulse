#!/usr/bin/env python3
"""
BrandPulse Product Lookup Tool - Usage Examples
This script demonstrates how to use the product lookup tool with the AI agent
"""

import asyncio
import httpx
import json

BASE_URL = "http://localhost:8000"

async def example_product_lookup():
    """Example: Lookup a specific product"""
    print("🔍 Example 1: Product Lookup")
    print("-" * 40)
    
    async with httpx.AsyncClient() as client:
        response = await client.get(f"{BASE_URL}/api/products/lookup/iPhone%2015%20Pro")
        data = response.json()
        
        if data.get('found'):
            product = data['products'][0]
            print(f"Product: {product['name']}")
            print(f"Brand: {product['brand']}")
            print(f"Price: ${product['price']}")
            print(f"Sentiment Score: {product['avg_sentiment_score']:.2f}")
            print(f"Total Mentions: {product['total_mentions']}")
        else:
            print("Product not found")

async def example_product_search():
    """Example: Search for products"""
    print("\n🔍 Example 2: Product Search")
    print("-" * 40)
    
    async with httpx.AsyncClient() as client:
        response = await client.get(f"{BASE_URL}/api/products/search?q=iPhone&limit=3")
        data = response.json()
        
        if data.get('found'):
            print(f"Found {len(data['products'])} products:")
            for product in data['products']:
                print(f"- {product['name']} ({product['brand']}) - ${product['price']}")
        else:
            print("No products found")

async def example_ai_tool_usage():
    """Example: Using the AI tool endpoint"""
    print("\n🤖 Example 3: AI Tool Usage")
    print("-" * 40)
    
    async with httpx.AsyncClient() as client:
        # Lookup product using AI tool
        tool_request = {
            "tool_name": "lookup_product",
            "parameters": {
                "product_name": "Samsung Galaxy S24"
            }
        }
        
        response = await client.post(f"{BASE_URL}/api/tools/product-lookup", json=tool_request)
        data = response.json()
        
        if data.get('result', {}).get('found'):
            print("✅ Product found using AI tool")
            print(f"Tool: {data['tool_name']}")
            print(f"Formatted Summary Preview:")
            summary = data.get('formatted_summary', '')
            print(summary[:300] + "..." if len(summary) > 300 else summary)
        else:
            print("❌ Product not found")

async def example_chat_with_product():
    """Example: Chat with AI about a product"""
    print("\n💬 Example 4: Chat with Product Context")
    print("-" * 40)
    
    async with httpx.AsyncClient() as client:
        chat_request = {
            "text": "What are customers saying about the iPhone 15 Pro?",
            "product_name": "iPhone 15 Pro"
        }
        
        response = await client.post(f"{BASE_URL}/api/chat", json=chat_request)
        data = response.json()
        
        print("🤖 AI Response:")
        print(data.get('response', 'No response')[:500] + "...")

async def example_available_tools():
    """Example: Check available tools"""
    print("\n🔧 Example 5: Available Tools")
    print("-" * 40)
    
    async with httpx.AsyncClient() as client:
        response = await client.get(f"{BASE_URL}/api/tools/available")
        data = response.json()
        
        print("Available Tools:")
        for tool in data.get('tools', []):
            print(f"- {tool['name']}: {tool['description']}")
            print(f"  Parameters: {list(tool['parameters'].keys())}")

async def run_examples():
    """Run all examples"""
    print("🚀 BrandPulse Product Lookup Tool - Usage Examples")
    print("=" * 60)
    
    try:
        await example_product_lookup()
        await example_product_search()
        await example_ai_tool_usage()
        await example_chat_with_product()
        await example_available_tools()
        
        print("\n" + "=" * 60)
        print("✅ All examples completed successfully!")
        print("\nThe Product Lookup Tool is now integrated with the AI agent.")
        print("Users can ask about specific products and get real data from the database.")
        
    except Exception as e:
        print(f"❌ Error running examples: {e}")

if __name__ == "__main__":
    asyncio.run(run_examples())



















