-- Database Schema for BrandPulse Product Search and Analytics
-- This schema supports product search with related pages and sentiment analysis

-- Products table - Main product catalog
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    sku VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    category VARCHAR(100),
    brand VARCHAR(100),
    price DECIMAL(10,2),
    url VARCHAR(500),
    image_url VARCHAR(500),
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Product pages - All pages/URLs related to a product (product pages, review pages, social media posts, etc.)
CREATE TABLE product_pages (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    url VARCHAR(1000) NOT NULL,
    page_type VARCHAR(50) NOT NULL, -- 'product_page', 'review_page', 'social_media', 'blog_post', 'news_article'
    platform VARCHAR(50), -- 'amazon', 'website', 'twitter', 'facebook', 'instagram', 'youtube', 'blog'
    title VARCHAR(500),
    meta_description TEXT,
    content_summary TEXT,
    last_crawled TIMESTAMP,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Enhanced sentiment analysis table with product relations
CREATE TABLE sentiment_analysis (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id) ON DELETE SET NULL,
    page_id INTEGER REFERENCES product_pages(id) ON DELETE SET NULL,
    text TEXT NOT NULL,
    sentiment VARCHAR(20) NOT NULL CHECK (sentiment IN ('positive', 'negative', 'neutral')),
    score FLOAT NOT NULL CHECK (score >= -1 AND score <= 1),
    confidence FLOAT CHECK (confidence >= 0 AND confidence <= 1),
    channel VARCHAR(50), -- 'twitter', 'facebook', 'instagram', 'reviews', 'blog', 'news'
    platform_specific_id VARCHAR(255), -- External ID from the platform
    user_id VARCHAR(100),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    topics JSONB, -- Array of topics detected
    keywords JSONB, -- Array of keywords extracted
    engagement_metrics JSONB, -- likes, shares, comments, views
    metadata JSONB, -- Additional platform-specific data
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Product search index table for fast text search
CREATE TABLE product_search_index (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    search_text TEXT NOT NULL, -- Concatenated searchable text
    search_vector TSVECTOR, -- PostgreSQL full-text search vector
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Product analytics aggregations for performance
CREATE TABLE product_analytics (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    total_mentions INTEGER DEFAULT 0,
    positive_mentions INTEGER DEFAULT 0,
    negative_mentions INTEGER DEFAULT 0,
    neutral_mentions INTEGER DEFAULT 0,
    avg_sentiment_score FLOAT DEFAULT 0,
    total_engagement INTEGER DEFAULT 0,
    channel_breakdown JSONB, -- Breakdown by platform/channel
    topic_breakdown JSONB, -- Breakdown by topics
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(product_id, date)
);

-- Search queries log for analytics
CREATE TABLE search_queries (
    id SERIAL PRIMARY KEY,
    query_text VARCHAR(500) NOT NULL,
    results_count INTEGER DEFAULT 0,
    user_session VARCHAR(100),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    execution_time_ms INTEGER,
    filters_applied JSONB
);

-- Indexes for performance optimization
CREATE INDEX idx_products_name ON products USING GIN (to_tsvector('english', name));
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_brand ON products(brand);
CREATE INDEX idx_products_status ON products(status);

CREATE INDEX idx_product_pages_product_id ON product_pages(product_id);
CREATE INDEX idx_product_pages_type ON product_pages(page_type);
CREATE INDEX idx_product_pages_platform ON product_pages(platform);
CREATE INDEX idx_product_pages_url ON product_pages(url);

CREATE INDEX idx_sentiment_product_id ON sentiment_analysis(product_id);
CREATE INDEX idx_sentiment_page_id ON sentiment_analysis(page_id);
CREATE INDEX idx_sentiment_timestamp ON sentiment_analysis(timestamp);
CREATE INDEX idx_sentiment_channel ON sentiment_analysis(channel);
CREATE INDEX idx_sentiment_score ON sentiment_analysis(sentiment, score);
CREATE INDEX idx_sentiment_topics ON sentiment_analysis USING GIN (topics);
CREATE INDEX idx_sentiment_keywords ON sentiment_analysis USING GIN (keywords);

CREATE INDEX idx_search_index_product_id ON product_search_index(product_id);
CREATE INDEX idx_search_index_vector ON product_search_index USING GIN (search_vector);
CREATE INDEX idx_search_index_text ON product_search_index USING GIN (to_tsvector('english', search_text));

CREATE INDEX idx_analytics_product_date ON product_analytics(product_id, date);
CREATE INDEX idx_analytics_date ON product_analytics(date);

CREATE INDEX idx_search_queries_text ON search_queries(query_text);
CREATE INDEX idx_search_queries_timestamp ON search_queries(timestamp);

-- Triggers to update search index when products are modified
CREATE OR REPLACE FUNCTION update_product_search_index()
RETURNS TRIGGER AS $$
BEGIN
    -- Update or insert search index
    INSERT INTO product_search_index (product_id, search_text, search_vector)
    VALUES (
        NEW.id,
        NEW.name || ' ' || COALESCE(NEW.description, '') || ' ' || COALESCE(NEW.category, '') || ' ' || COALESCE(NEW.brand, ''),
        to_tsvector('english', NEW.name || ' ' || COALESCE(NEW.description, '') || ' ' || COALESCE(NEW.category, '') || ' ' || COALESCE(NEW.brand, ''))
    )
    ON CONFLICT (product_id) 
    DO UPDATE SET
        search_text = EXCLUDED.search_text,
        search_vector = EXCLUDED.search_vector,
        updated_at = CURRENT_TIMESTAMP;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_product_search_index
    AFTER INSERT OR UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_product_search_index();

-- Function to update product analytics
CREATE OR REPLACE FUNCTION update_product_analytics()
RETURNS TRIGGER AS $$
BEGIN
    -- Update daily analytics for the product
    INSERT INTO product_analytics (
        product_id, 
        date, 
        total_mentions, 
        positive_mentions, 
        negative_mentions, 
        neutral_mentions,
        avg_sentiment_score
    )
    SELECT 
        NEW.product_id,
        DATE(NEW.timestamp),
        COUNT(*),
        COUNT(*) FILTER (WHERE sentiment = 'positive'),
        COUNT(*) FILTER (WHERE sentiment = 'negative'),
        COUNT(*) FILTER (WHERE sentiment = 'neutral'),
        AVG(score)
    FROM sentiment_analysis 
    WHERE product_id = NEW.product_id 
    AND DATE(timestamp) = DATE(NEW.timestamp)
    ON CONFLICT (product_id, date)
    DO UPDATE SET
        total_mentions = EXCLUDED.total_mentions,
        positive_mentions = EXCLUDED.positive_mentions,
        negative_mentions = EXCLUDED.negative_mentions,
        neutral_mentions = EXCLUDED.neutral_mentions,
        avg_sentiment_score = EXCLUDED.avg_sentiment_score,
        updated_at = CURRENT_TIMESTAMP;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_product_analytics
    AFTER INSERT OR UPDATE ON sentiment_analysis
    FOR EACH ROW
    WHEN (NEW.product_id IS NOT NULL)
    EXECUTE FUNCTION update_product_analytics();

-- Sample data for testing
INSERT INTO products (name, sku, description, category, brand, price, url) VALUES
('iPhone 15 Pro', 'APPLE-IP15P-128', 'Latest iPhone with titanium design and advanced camera system', 'Smartphones', 'Apple', 999.00, 'https://apple.com/iphone-15-pro'),
('Samsung Galaxy S24', 'SAMSUNG-GS24-256', 'Premium Android phone with AI-powered features', 'Smartphones', 'Samsung', 899.00, 'https://samsung.com/galaxy-s24'),
('Nike Air Max 270', 'NIKE-AM270-BLK', 'Comfortable running shoes with visible Air cushioning', 'Footwear', 'Nike', 150.00, 'https://nike.com/air-max-270'),
('MacBook Pro M3', 'APPLE-MBP-M3-512', '16-inch MacBook Pro with M3 chip and 512GB storage', 'Laptops', 'Apple', 2499.00, 'https://apple.com/macbook-pro'),
('Tesla Model Y', 'TESLA-MY-LR', 'Electric SUV with autopilot and long range battery', 'Vehicles', 'Tesla', 52990.00, 'https://tesla.com/model-y');

-- Sample product pages
INSERT INTO product_pages (product_id, url, page_type, platform, title) VALUES
(1, 'https://apple.com/iphone-15-pro', 'product_page', 'website', 'iPhone 15 Pro - Apple'),
(1, 'https://amazon.com/dp/B0CHX1W1XY', 'product_page', 'amazon', 'Apple iPhone 15 Pro Amazon'),
(1, 'https://twitter.com/hashtag/iPhone15Pro', 'social_media', 'twitter', '#iPhone15Pro discussions'),
(2, 'https://samsung.com/galaxy-s24', 'product_page', 'website', 'Galaxy S24 - Samsung'),
(2, 'https://youtube.com/watch?v=xyz123', 'review_page', 'youtube', 'Galaxy S24 Review'),
(3, 'https://nike.com/air-max-270', 'product_page', 'website', 'Nike Air Max 270'),
(3, 'https://footlocker.com/product/nike-air-max-270', 'product_page', 'footlocker', 'Nike Air Max 270 - Foot Locker');

-- Sample sentiment data
INSERT INTO sentiment_analysis (product_id, page_id, text, sentiment, score, confidence, channel, topics, keywords) VALUES
(1, 1, 'The iPhone 15 Pro camera quality is absolutely amazing! Best phone I have ever used.', 'positive', 0.89, 0.95, 'reviews', '["camera", "quality"]', '["amazing", "best", "camera"]'),
(1, 3, 'iPhone 15 Pro is overpriced for what it offers. Not worth the upgrade from 14 Pro.', 'negative', -0.65, 0.87, 'twitter', '["pricing", "value"]', '["overpriced", "not worth"]'),
(2, 4, 'Samsung Galaxy S24 has incredible AI features. The camera AI is revolutionary.', 'positive', 0.82, 0.91, 'reviews', '["AI", "camera"]', '["incredible", "revolutionary"]'),
(3, 6, 'Nike Air Max 270 are comfortable but not great for serious running.', 'neutral', 0.15, 0.78, 'reviews', '["comfort", "running"]', '["comfortable", "not great"]');
