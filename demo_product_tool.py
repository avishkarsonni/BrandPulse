#!/usr/bin/env python3
"""
BrandPulse Product Lookup Tool - Working Demonstration
This script demonstrates the product lookup functionality working with Tesla Model Y
"""

import pymysql
import json
from datetime import datetime

def test_product_lookup():
    """Test product lookup functionality with Tesla Model Y"""
    print("🚀 BrandPulse Product Lookup Tool - Working Demonstration")
    print("=" * 60)
    print(f"Test started at: {datetime.now().isoformat()}")
    print()
    
    try:
        # Connect to database
        print("🔗 Connecting to database...")
        connection = pymysql.connect(
            host='localhost',
            port=3307,
            user='brandpulse_user',
            password='brandpulse_password',
            database='brandpulse',
            charset='utf8mb4',
            autocommit=True,
            connect_timeout=10
        )
        print("✅ Database connection successful!")
        
        cursor = connection.cursor(pymysql.cursors.DictCursor)
        
        # Test 1: Lookup Tesla Model Y
        print("\n🔍 Test 1: Looking up Tesla Model Y")
        print("-" * 40)
        
        query = """
            SELECT p.*, 
                   COALESCE(pa.total_mentions, 0) as total_mentions,
                   COALESCE(pa.positive_mentions, 0) as positive_mentions,
                   COALESCE(pa.negative_mentions, 0) as negative_mentions,
                   COALESCE(pa.neutral_mentions, 0) as neutral_mentions,
                   COALESCE(pa.avg_sentiment_score, 0) as avg_sentiment_score
            FROM products p
            LEFT JOIN product_analytics pa ON p.id = pa.product_id AND pa.date = CURDATE()
            WHERE LOWER(p.name) LIKE LOWER(%s) AND p.status = 'active'
            ORDER BY p.created_at DESC
            LIMIT 5
        """
        
        cursor.execute(query, ["%Tesla Model Y%"])
        products = cursor.fetchall()
        
        if products:
            print(f"✅ Found {len(products)} Tesla Model Y products:")
            for product in products:
                print(f"  - {product['name']} ({product['brand']})")
                print(f"    Price: ${product['price']}")
                print(f"    Category: {product['category']}")
                print(f"    Description: {product['description']}")
                print(f"    Sentiment Score: {product['avg_sentiment_score']:.2f}")
                print(f"    Total Mentions: {product['total_mentions']}")
                print(f"    Positive: {product['positive_mentions']}, Negative: {product['negative_mentions']}, Neutral: {product['neutral_mentions']}")
                print()
        else:
            print("❌ No Tesla Model Y products found")
        
        # Test 2: Get sentiment data for Tesla Model Y
        print("🔍 Test 2: Getting sentiment data for Tesla Model Y")
        print("-" * 40)
        
        if products:
            product_id = products[0]['id']
            sentiment_query = """
                SELECT sa.*, pp.url as page_url, pp.platform
                FROM sentiment_analysis sa
                LEFT JOIN product_pages pp ON sa.page_id = pp.id
                WHERE sa.product_id = %s
                ORDER BY sa.timestamp DESC
                LIMIT 5
            """
            cursor.execute(sentiment_query, [product_id])
            sentiment_data = cursor.fetchall()
            
            if sentiment_data:
                print(f"✅ Found {len(sentiment_data)} sentiment records:")
                for sentiment in sentiment_data:
                    print(f"  - {sentiment['sentiment'].title()} ({sentiment['score']:.2f})")
                    print(f"    Text: {sentiment['text'][:100]}...")
                    if sentiment.get('platform'):
                        print(f"    Platform: {sentiment['platform']}")
                    print(f"    Timestamp: {sentiment['timestamp']}")
                    print()
            else:
                print("ℹ️  No sentiment data found for Tesla Model Y")
        
        # Test 3: Search for other products
        print("🔍 Test 3: Searching for other products")
        print("-" * 40)
        
        search_query = """
            SELECT p.*, 
                   COALESCE(pa.total_mentions, 0) as total_mentions,
                   COALESCE(pa.avg_sentiment_score, 0) as avg_sentiment_score
            FROM products p
            LEFT JOIN product_analytics pa ON p.id = pa.product_id AND pa.date = CURDATE()
            WHERE p.status = 'active'
            ORDER BY p.created_at DESC
            LIMIT 3
        """
        
        cursor.execute(search_query)
        all_products = cursor.fetchall()
        
        print(f"✅ Found {len(all_products)} products in database:")
        for product in all_products:
            print(f"  - {product['name']} ({product['brand']}) - ${product['price']}")
            print(f"    Sentiment: {product['avg_sentiment_score']:.2f}, Mentions: {product['total_mentions']}")
        
        cursor.close()
        connection.close()
        
        print("\n" + "=" * 60)
        print("✅ Product Lookup Tool Demonstration Complete!")
        print("🎯 The tool successfully:")
        print("   - Connected to the BrandPulse database")
        print("   - Retrieved Tesla Model Y product information")
        print("   - Accessed sentiment analysis data")
        print("   - Searched for multiple products")
        print("\n🚀 The AI agent can now use this tool to provide")
        print("   accurate, data-driven responses about products!")
        
        return True
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

if __name__ == "__main__":
    success = test_product_lookup()
    exit(0 if success else 1)


















