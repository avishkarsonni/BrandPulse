-- Additional seed data for BrandPulse database
-- MySQL version - This file contains sample data to populate the database for testing

-- Insert additional sample products
INSERT INTO products (name, sku, description, category, brand, price, url, image_url) VALUES
('Google Pixel 8 Pro', 'GOOGLE-P8P-256', 'AI-powered Android phone with advanced camera features', 'Smartphones', 'Google', 899.00, 'https://store.google.com/product/pixel_8_pro', 'https://via.placeholder.com/300x300/4285F4/FFFFFF?text=Pixel+8+Pro'),
('Microsoft Surface Laptop 5', 'MS-SL5-512', '13.5-inch touchscreen laptop with Windows 11', 'Laptops', 'Microsoft', 1299.00, 'https://microsoft.com/surface/laptop-5', 'https://via.placeholder.com/300x300/0078D4/FFFFFF?text=Surface+Laptop'),
('Sony WH-1000XM5', 'SONY-WH1000XM5', 'Industry-leading noise canceling wireless headphones', 'Audio', 'Sony', 399.00, 'https://sony.com/headphones/wh-1000xm5', 'https://via.placeholder.com/300x300/000000/FFFFFF?text=WH-1000XM5'),
('Adidas Ultraboost 22', 'ADIDAS-UB22-BLK', 'High-performance running shoes with Boost technology', 'Footwear', 'Adidas', 180.00, 'https://adidas.com/ultraboost-22', 'https://via.placeholder.com/300x300/000000/FFFFFF?text=Ultraboost+22'),
('iPad Pro 12.9"', 'APPLE-IPADPRO-1TB', '12.9-inch iPad Pro with M2 chip and 1TB storage', 'Tablets', 'Apple', 1899.00, 'https://apple.com/ipad-pro', 'https://via.placeholder.com/300x300/007AFF/FFFFFF?text=iPad+Pro');

-- Insert additional product pages
INSERT INTO product_pages (product_id, url, page_type, platform, title) VALUES
(6, 'https://store.google.com/product/pixel_8_pro', 'product_page', 'website', 'Google Pixel 8 Pro'),
(6, 'https://reddit.com/r/GooglePixel', 'social_media', 'reddit', 'Google Pixel Community'),
(7, 'https://microsoft.com/surface/laptop-5', 'product_page', 'website', 'Surface Laptop 5'),
(7, 'https://youtube.com/watch?v=surface-review', 'review_page', 'youtube', 'Surface Laptop 5 Review'),
(8, 'https://sony.com/headphones/wh-1000xm5', 'product_page', 'website', 'Sony WH-1000XM5'),
(8, 'https://amazon.com/dp/SONY-WH1000XM5', 'product_page', 'amazon', 'Sony WH-1000XM5 Amazon'),
(9, 'https://adidas.com/ultraboost-22', 'product_page', 'website', 'Adidas Ultraboost 22'),
(10, 'https://apple.com/ipad-pro', 'product_page', 'website', 'iPad Pro 12.9"');

-- Insert additional sentiment analysis data
INSERT INTO sentiment_analysis (product_id, page_id, text, sentiment, score, confidence, channel, topics, keywords) VALUES
(6, 8, 'Google Pixel 8 Pro camera is incredible! Best computational photography I have seen.', 'positive', 0.92, 0.96, 'reviews', '["camera", "photography"]', '["incredible", "best", "computational"]'),
(6, 9, 'Pixel 8 Pro is good but battery life could be better for the price.', 'neutral', 0.25, 0.82, 'reddit', '["battery", "price"]', '["good", "could be better"]'),
(7, 10, 'Surface Laptop 5 build quality is excellent. Premium feel and great keyboard.', 'positive', 0.85, 0.91, 'reviews', '["build quality", "keyboard"]', '["excellent", "premium", "great"]'),
(7, 11, 'Microsoft Surface is overpriced compared to other Windows laptops.', 'negative', -0.55, 0.88, 'youtube', '["pricing", "value"]', '["overpriced", "compared"]'),
(8, 12, 'Sony WH-1000XM5 noise cancellation is absolutely perfect for travel.', 'positive', 0.94, 0.97, 'reviews', '["noise cancellation", "travel"]', '["absolutely perfect", "travel"]'),
(8, 13, 'WH-1000XM5 sound quality is amazing but touch controls are finicky.', 'neutral', 0.35, 0.79, 'amazon', '["sound quality", "controls"]', '["amazing", "finicky"]'),
(9, 14, 'Adidas Ultraboost 22 comfort is unmatched for long runs.', 'positive', 0.88, 0.93, 'reviews', '["comfort", "running"]', '["unmatched", "long runs"]'),
(10, 15, 'iPad Pro M2 performance is blazing fast for creative work.', 'positive', 0.91, 0.95, 'reviews', '["performance", "creative"]', '["blazing fast", "creative work"]');

-- Create additional indexes for better performance
CREATE INDEX idx_sentiment_created_at ON sentiment_analysis(created_at);
CREATE INDEX idx_products_created_at ON products(created_at);
CREATE INDEX idx_product_pages_created_at ON product_pages(created_at);

-- Update search index for new products
INSERT INTO product_search_index (product_id, search_text)
SELECT 
    id,
    CONCAT_WS(' ', name, COALESCE(description, ''), COALESCE(category, ''), COALESCE(brand, ''))
FROM products 
WHERE id > 5;

-- Insert analytics data for new products
INSERT INTO product_analytics (product_id, date, total_mentions, positive_mentions, negative_mentions, neutral_mentions, avg_sentiment_score)
SELECT 
    product_id,
    CURDATE(),
    COUNT(*),
    SUM(CASE WHEN sentiment = 'positive' THEN 1 ELSE 0 END),
    SUM(CASE WHEN sentiment = 'negative' THEN 1 ELSE 0 END),
    SUM(CASE WHEN sentiment = 'neutral' THEN 1 ELSE 0 END),
    AVG(score)
FROM sentiment_analysis 
WHERE product_id > 5
GROUP BY product_id;