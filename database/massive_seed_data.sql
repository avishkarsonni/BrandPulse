-- Massive seed data for BrandPulse database
-- 50 products with 30-40 reviews each = ~1,750 sentiment records
-- This ensures ample data for testing and demonstration

-- First, add 15 more products to reach 50 total
INSERT INTO products (name, sku, description, category, brand, price, url, image_url, status) VALUES
-- More Smartphones
('iPhone 14', 'APPLE-IP14-128', 'Previous generation iPhone with A16 chip', 'Smartphones', 'Apple', 699.00, 'https://apple.com/iphone-14', 'https://via.placeholder.com/300x300/007AFF/FFFFFF?text=iPhone+14', 'active'),
('Samsung Galaxy A54', 'SAMSUNG-GA54-128', 'Mid-range Android phone with great value', 'Smartphones', 'Samsung', 449.00, 'https://samsung.com/galaxy-a54', 'https://via.placeholder.com/300x300/1428A0/FFFFFF?text=Galaxy+A54', 'active'),
('Motorola Edge 40', 'MOTO-EDGE40-256', 'Affordable flagship with clean Android', 'Smartphones', 'Motorola', 599.00, 'https://motorola.com/edge-40', 'https://via.placeholder.com/300x300/000000/FFFFFF?text=Edge+40', 'active'),
('Realme GT 5', 'REALME-GT5-256', 'Performance-focused phone with fast charging', 'Smartphones', 'Realme', 499.00, 'https://realme.com/gt-5', 'https://via.placeholder.com/300x300/FF6900/FFFFFF?text=GT+5', 'active'),

-- More Laptops
('MacBook Air M2', 'APPLE-MBA-M2-256', '13-inch MacBook Air with M2 chip', 'Laptops', 'Apple', 1199.00, 'https://apple.com/macbook-air', 'https://via.placeholder.com/300x300/007AFF/FFFFFF?text=MacBook+Air', 'active'),
('Dell Inspiron 15', 'DELL-INS15-512', 'Affordable 15-inch laptop for everyday use', 'Laptops', 'Dell', 599.00, 'https://dell.com/inspiron-15', 'https://via.placeholder.com/300x300/007DB8/FFFFFF?text=Inspiron+15', 'active'),
('Acer Predator Helios', 'ACER-PH16-1TB', 'Gaming laptop with RTX 4060', 'Laptops', 'Acer', 1299.00, 'https://acer.com/predator-helios', 'https://via.placeholder.com/300x300/83B81A/FFFFFF?text=Predator', 'active'),
('MSI Stealth 16', 'MSI-ST16-1TB', 'Slim gaming laptop with RTX 4070', 'Laptops', 'MSI', 1999.00, 'https://msi.com/stealth-16', 'https://via.placeholder.com/300x300/FF0000/FFFFFF?text=Stealth+16', 'active'),

-- More Audio
('Sony WF-1000XM5', 'SONY-WF1000XM5', 'Premium wireless earbuds with noise cancellation', 'Audio', 'Sony', 299.00, 'https://sony.com/wf-1000xm5', 'https://via.placeholder.com/300x300/000000/FFFFFF?text=WF-1000XM5', 'active'),
('Apple AirPods 3', 'APPLE-AP3', 'Third generation AirPods with spatial audio', 'Audio', 'Apple', 179.00, 'https://apple.com/airpods-3', 'https://via.placeholder.com/300x300/000000/FFFFFF?text=AirPods+3', 'active'),
('Beats Studio Pro', 'BEATS-SP', 'Premium over-ear headphones with ANC', 'Audio', 'Beats', 349.00, 'https://beats.com/studio-pro', 'https://via.placeholder.com/300x300/000000/FFFFFF?text=Studio+Pro', 'active'),

-- More Footwear
('Nike Dunk Low', 'NIKE-DUNK-LOW', 'Classic basketball-inspired sneakers', 'Footwear', 'Nike', 100.00, 'https://nike.com/dunk-low', 'https://via.placeholder.com/300x300/000000/FFFFFF?text=Dunk+Low', 'active'),
('Adidas Yeezy 350', 'ADIDAS-YZ350', 'Iconic lifestyle sneakers', 'Footwear', 'Adidas', 220.00, 'https://adidas.com/yeezy-350', 'https://via.placeholder.com/300x300/000000/FFFFFF?text=Yeezy+350', 'active'),
('Puma RS-X', 'PUMA-RSX', 'Retro-inspired running shoes', 'Footwear', 'Puma', 110.00, 'https://puma.com/rs-x', 'https://via.placeholder.com/300x300/000000/FFFFFF?text=RS-X', 'active'),

-- More Tablets
('iPad Mini', 'APPLE-IPADMINI-256', '8.3-inch compact iPad', 'Tablets', 'Apple', 499.00, 'https://apple.com/ipad-mini', 'https://via.placeholder.com/300x300/007AFF/FFFFFF?text=iPad+Mini', 'active'),
('Microsoft Surface Pro 9', 'MS-SP9-256', '2-in-1 tablet with detachable keyboard', 'Tablets', 'Microsoft', 999.00, 'https://microsoft.com/surface-pro-9', 'https://via.placeholder.com/300x300/0078D4/FFFFFF?text=Surface+Pro', 'active');

-- Create product pages for all new products
INSERT INTO product_pages (product_id, url, page_type, platform, title)
SELECT id, CONCAT('https://', LOWER(REPLACE(brand, ' ', '')), '.com/', LOWER(REPLACE(name, ' ', '-')), ''), 'product_page', 'website', CONCAT(name, ' - ', brand)
FROM products 
WHERE id > 35 AND id NOT IN (SELECT product_id FROM product_pages WHERE product_id > 35);

-- Add Amazon pages for new products
INSERT INTO product_pages (product_id, url, page_type, platform, title)
SELECT id, CONCAT('https://amazon.com/dp/', sku), 'product_page', 'amazon', CONCAT(name, ' - Amazon')
FROM products 
WHERE id > 35;

-- Add review pages for new products
INSERT INTO product_pages (product_id, url, page_type, platform, title)
SELECT id, CONCAT('https://youtube.com/watch?v=', LOWER(REPLACE(name, ' ', '-')), '-review'), 'review_page', 'youtube', CONCAT(name, ' Review')
FROM products 
WHERE id > 35;

-- Add social media pages for some products
INSERT INTO product_pages (product_id, url, page_type, platform, title)
SELECT id, CONCAT('https://reddit.com/r/', LOWER(REPLACE(brand, ' ', '')), ''), 'social_media', 'reddit', CONCAT(brand, ' Community')
FROM products 
WHERE id > 35 AND brand IN ('Apple', 'Samsung', 'Nike', 'Adidas', 'Tesla')
LIMIT 10;

-- Now generate 30-40 reviews per product
-- We'll create a stored procedure to generate reviews efficiently
DELIMITER //

CREATE PROCEDURE IF NOT EXISTS generate_reviews_for_product(
    IN p_product_id INT,
    IN p_num_reviews INT
)
BEGIN
    DECLARE i INT DEFAULT 1;
    DECLARE v_page_id INT;
    DECLARE v_sentiment VARCHAR(20);
    DECLARE v_score DECIMAL(3,2);
    DECLARE v_channel VARCHAR(50);
    DECLARE v_text TEXT;
    
    -- Get a random page for this product
    SELECT id INTO v_page_id FROM product_pages WHERE product_id = p_product_id ORDER BY RAND() LIMIT 1;
    
    -- If no page exists, use NULL
    IF v_page_id IS NULL THEN
        SET v_page_id = NULL;
    END IF;
    
    WHILE i <= p_num_reviews DO
        -- Randomly assign sentiment (60% positive, 25% neutral, 15% negative)
        SET v_sentiment = CASE 
            WHEN RAND() < 0.60 THEN 'positive'
            WHEN RAND() < 0.85 THEN 'neutral'
            ELSE 'negative'
        END;
        
        -- Set score based on sentiment
        SET v_score = CASE 
            WHEN v_sentiment = 'positive' THEN 0.5 + (RAND() * 0.5)  -- 0.5 to 1.0
            WHEN v_sentiment = 'neutral' THEN -0.2 + (RAND() * 0.4)   -- -0.2 to 0.2
            ELSE -1.0 + (RAND() * 0.5)                                -- -1.0 to -0.5
        END;
        
        -- Random channel
        SET v_channel = CASE FLOOR(RAND() * 5)
            WHEN 0 THEN 'reviews'
            WHEN 1 THEN 'amazon'
            WHEN 2 THEN 'youtube'
            WHEN 3 THEN 'twitter'
            WHEN 4 THEN 'reddit'
            ELSE 'reviews'
        END;
        
        -- Generate review text based on product and sentiment
        SET v_text = CONCAT(
            CASE v_sentiment
                WHEN 'positive' THEN 
                    CASE FLOOR(RAND() * 5)
                        WHEN 0 THEN 'Absolutely love this product! '
                        WHEN 1 THEN 'Excellent quality and performance. '
                        WHEN 2 THEN 'Highly recommend this to everyone! '
                        WHEN 3 THEN 'Best purchase I have made in a while. '
                        ELSE 'Outstanding product, exceeded my expectations. '
                    END
                WHEN 'negative' THEN
                    CASE FLOOR(RAND() * 5)
                        WHEN 0 THEN 'Disappointed with this purchase. '
                        WHEN 1 THEN 'Not worth the money in my opinion. '
                        WHEN 2 THEN 'Had some issues with quality. '
                        WHEN 3 THEN 'Expected better for the price. '
                        ELSE 'Not satisfied with this product. '
                    END
                ELSE
                    CASE FLOOR(RAND() * 5)
                        WHEN 0 THEN 'It is okay, nothing special. '
                        WHEN 1 THEN 'Decent product but could be better. '
                        WHEN 2 THEN 'Average quality, meets expectations. '
                        WHEN 3 THEN 'Good but not great. '
                        ELSE 'It works but has room for improvement. '
                    END
            END,
            'The features are ',
            CASE WHEN v_sentiment = 'positive' THEN 'impressive' WHEN v_sentiment = 'negative' THEN 'lacking' ELSE 'adequate' END,
            ' and the build quality is ',
            CASE WHEN v_sentiment = 'positive' THEN 'solid' WHEN v_sentiment = 'negative' THEN 'questionable' ELSE 'average' END,
            '.'
        );
        
        INSERT INTO sentiment_analysis (
            product_id, 
            page_id, 
            text, 
            sentiment, 
            score, 
            confidence, 
            channel, 
            topics, 
            keywords
        ) VALUES (
            p_product_id,
            v_page_id,
            v_text,
            v_sentiment,
            v_score,
            0.75 + (RAND() * 0.20),  -- Confidence between 0.75 and 0.95
            v_channel,
            JSON_ARRAY('quality', 'features', 'value'),
            JSON_ARRAY('product', 'review', v_sentiment)
        );
        
        SET i = i + 1;
    END WHILE;
END//

DELIMITER ;

-- Generate reviews for all products (30-40 reviews each, randomly distributed)
-- Product 1 (iPhone 15 Pro) - 35 reviews
CALL generate_reviews_for_product(1, 35);

-- Product 2 (Samsung Galaxy S24) - 38 reviews
CALL generate_reviews_for_product(2, 38);

-- Product 3 (Nike Air Max 270) - 32 reviews
CALL generate_reviews_for_product(3, 32);

-- Product 4 (MacBook Pro M3) - 40 reviews
CALL generate_reviews_for_product(4, 40);

-- Product 5 (Tesla Model Y) - 36 reviews
CALL generate_reviews_for_product(5, 36);

-- Product 6 (Google Pixel 8 Pro) - 33 reviews
CALL generate_reviews_for_product(6, 33);

-- Product 7 (Microsoft Surface Laptop 5) - 37 reviews
CALL generate_reviews_for_product(7, 37);

-- Product 8 (Sony WH-1000XM5) - 35 reviews
CALL generate_reviews_for_product(8, 35);

-- Product 9 (Adidas Ultraboost 22) - 30 reviews
CALL generate_reviews_for_product(9, 30);

-- Product 10 (iPad Pro 12.9") - 34 reviews
CALL generate_reviews_for_product(10, 34);

-- Product 11 (iPhone 15) - 36 reviews
CALL generate_reviews_for_product(11, 36);

-- Product 12 (Samsung Galaxy S23 Ultra) - 39 reviews
CALL generate_reviews_for_product(12, 39);

-- Product 13 (OnePlus 12) - 32 reviews
CALL generate_reviews_for_product(13, 32);

-- Product 14 (Xiaomi 14 Pro) - 31 reviews
CALL generate_reviews_for_product(14, 31);

-- Product 15 (Nothing Phone 2) - 30 reviews
CALL generate_reviews_for_product(15, 30);

-- Product 16 (Dell XPS 15) - 38 reviews
CALL generate_reviews_for_product(16, 38);

-- Product 17 (HP Spectre x360) - 35 reviews
CALL generate_reviews_for_product(17, 35);

-- Product 18 (Lenovo ThinkPad X1 Carbon) - 37 reviews
CALL generate_reviews_for_product(18, 37);

-- Product 19 (ASUS ROG Zephyrus G14) - 34 reviews
CALL generate_reviews_for_product(19, 34);

-- Product 20 (Razer Blade 15) - 36 reviews
CALL generate_reviews_for_product(20, 36);

-- Product 21 (AirPods Pro 2) - 40 reviews
CALL generate_reviews_for_product(21, 40);

-- Product 22 (Bose QuietComfort 45) - 35 reviews
CALL generate_reviews_for_product(22, 35);

-- Product 23 (Sennheiser Momentum 4) - 33 reviews
CALL generate_reviews_for_product(23, 33);

-- Product 24 (JBL Flip 6) - 32 reviews
CALL generate_reviews_for_product(24, 32);

-- Product 25 (Nike Air Force 1) - 38 reviews
CALL generate_reviews_for_product(25, 38);

-- Product 26 (Adidas Stan Smith) - 36 reviews
CALL generate_reviews_for_product(26, 36);

-- Product 27 (New Balance 990v5) - 34 reviews
CALL generate_reviews_for_product(27, 34);

-- Product 28 (Vans Old Skool) - 35 reviews
CALL generate_reviews_for_product(28, 35);

-- Product 29 (Samsung Galaxy Tab S9) - 33 reviews
CALL generate_reviews_for_product(29, 33);

-- Product 30 (iPad Air) - 37 reviews
CALL generate_reviews_for_product(30, 37);

-- Product 31 (Tesla Model 3) - 39 reviews
CALL generate_reviews_for_product(31, 39);

-- Product 32 (Ford F-150 Lightning) - 35 reviews
CALL generate_reviews_for_product(32, 35);

-- Product 33 (Apple Watch Series 9) - 38 reviews
CALL generate_reviews_for_product(33, 38);

-- Product 34 (Samsung Galaxy Watch 6) - 36 reviews
CALL generate_reviews_for_product(34, 36);

-- Product 35 (Garmin Fenix 7) - 34 reviews
CALL generate_reviews_for_product(35, 34);

-- Product 36 (iPhone 14) - 35 reviews
CALL generate_reviews_for_product(36, 35);

-- Product 37 (Samsung Galaxy A54) - 33 reviews
CALL generate_reviews_for_product(37, 33);

-- Product 38 (Motorola Edge 40) - 32 reviews
CALL generate_reviews_for_product(38, 32);

-- Product 39 (Realme GT 5) - 31 reviews
CALL generate_reviews_for_product(39, 31);

-- Product 40 (MacBook Air M2) - 37 reviews
CALL generate_reviews_for_product(40, 37);

-- Product 41 (Dell Inspiron 15) - 35 reviews
CALL generate_reviews_for_product(41, 35);

-- Product 42 (Acer Predator Helios) - 36 reviews
CALL generate_reviews_for_product(42, 36);

-- Product 43 (MSI Stealth 16) - 34 reviews
CALL generate_reviews_for_product(43, 34);

-- Product 44 (Sony WF-1000XM5) - 38 reviews
CALL generate_reviews_for_product(44, 38);

-- Product 45 (Apple AirPods 3) - 36 reviews
CALL generate_reviews_for_product(45, 36);

-- Product 46 (Beats Studio Pro) - 35 reviews
CALL generate_reviews_for_product(46, 35);

-- Product 47 (Nike Dunk Low) - 37 reviews
CALL generate_reviews_for_product(47, 37);

-- Product 48 (Adidas Yeezy 350) - 40 reviews
CALL generate_reviews_for_product(48, 40);

-- Product 49 (Puma RS-X) - 33 reviews
CALL generate_reviews_for_product(49, 33);

-- Product 50 (iPad Mini) - 35 reviews
CALL generate_reviews_for_product(50, 35);

-- Product 51 (Microsoft Surface Pro 9) - 36 reviews
CALL generate_reviews_for_product(51, 36);

-- Drop the procedure after use
DROP PROCEDURE IF EXISTS generate_reviews_for_product;

-- Update product analytics for all products
INSERT INTO product_analytics (product_id, date, total_mentions, positive_mentions, negative_mentions, neutral_mentions, avg_sentiment_score)
SELECT 
    product_id,
    CURDATE(),
    COUNT(*) as total_mentions,
    SUM(CASE WHEN sentiment = 'positive' THEN 1 ELSE 0 END) as positive_mentions,
    SUM(CASE WHEN sentiment = 'negative' THEN 1 ELSE 0 END) as negative_mentions,
    SUM(CASE WHEN sentiment = 'neutral' THEN 1 ELSE 0 END) as neutral_mentions,
    AVG(score) as avg_sentiment_score
FROM sentiment_analysis 
WHERE product_id IS NOT NULL
GROUP BY product_id
ON DUPLICATE KEY UPDATE
    total_mentions = VALUES(total_mentions),
    positive_mentions = VALUES(positive_mentions),
    negative_mentions = VALUES(negative_mentions),
    neutral_mentions = VALUES(neutral_mentions),
    avg_sentiment_score = VALUES(avg_sentiment_score);

-- Update search index for all products
INSERT INTO product_search_index (product_id, search_text)
SELECT 
    id,
    CONCAT_WS(' ', name, COALESCE(description, ''), COALESCE(category, ''), COALESCE(brand, ''))
FROM products 
WHERE id NOT IN (SELECT product_id FROM product_search_index)
ON DUPLICATE KEY UPDATE
    search_text = VALUES(search_text);

