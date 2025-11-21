-- Comprehensive seed data for BrandPulse database
-- This file contains extensive sample data for testing and demonstration

-- Update all existing products to active status
UPDATE products SET status = 'active' WHERE status IS NULL OR status = '';

-- Insert many more products across different categories
INSERT INTO products (name, sku, description, category, brand, price, url, image_url, status) VALUES
-- Smartphones
('iPhone 15', 'APPLE-IP15-128', 'Latest iPhone with A17 Pro chip and advanced camera', 'Smartphones', 'Apple', 799.00, 'https://apple.com/iphone-15', 'https://via.placeholder.com/300x300/007AFF/FFFFFF?text=iPhone+15', 'active'),
('Samsung Galaxy S23 Ultra', 'SAMSUNG-GS23U-512', 'Premium Android phone with S Pen and 200MP camera', 'Smartphones', 'Samsung', 1199.00, 'https://samsung.com/galaxy-s23-ultra', 'https://via.placeholder.com/300x300/1428A0/FFFFFF?text=Galaxy+S23', 'active'),
('OnePlus 12', 'ONEPLUS-OP12-256', 'Flagship Android phone with Snapdragon 8 Gen 3', 'Smartphones', 'OnePlus', 799.00, 'https://oneplus.com/oneplus-12', 'https://via.placeholder.com/300x300/EB0029/FFFFFF?text=OnePlus+12', 'active'),
('Xiaomi 14 Pro', 'XIAOMI-MI14P-512', 'High-end Android phone with Leica camera partnership', 'Smartphones', 'Xiaomi', 899.00, 'https://xiaomi.com/mi-14-pro', 'https://via.placeholder.com/300x300/FF6900/FFFFFF?text=Xiaomi+14', 'active'),
('Nothing Phone 2', 'NOTHING-NP2-256', 'Unique transparent design with Glyph interface', 'Smartphones', 'Nothing', 599.00, 'https://nothing.tech/phone-2', 'https://via.placeholder.com/300x300/000000/FFFFFF?text=Nothing+2', 'active'),

-- Laptops
('Dell XPS 15', 'DELL-XPS15-1TB', '15-inch premium laptop with OLED display', 'Laptops', 'Dell', 1999.00, 'https://dell.com/xps-15', 'https://via.placeholder.com/300x300/007DB8/FFFFFF?text=XPS+15', 'active'),
('HP Spectre x360', 'HP-SPX360-512', 'Convertible 2-in-1 laptop with 13.5-inch OLED', 'Laptops', 'HP', 1299.00, 'https://hp.com/spectre-x360', 'https://via.placeholder.com/300x300/0096D6/FFFFFF?text=Spectre', 'active'),
('Lenovo ThinkPad X1 Carbon', 'LENOVO-TPX1C-1TB', 'Business ultrabook with legendary keyboard', 'Laptops', 'Lenovo', 1599.00, 'https://lenovo.com/thinkpad-x1-carbon', 'https://via.placeholder.com/300x300/E2231A/FFFFFF?text=ThinkPad', 'active'),
('ASUS ROG Zephyrus G14', 'ASUS-ROGZ14-1TB', 'Gaming laptop with AMD Ryzen 9 and RTX 4060', 'Laptops', 'ASUS', 1799.00, 'https://asus.com/rog-zephyrus-g14', 'https://via.placeholder.com/300x300/000000/FFFFFF?text=ROG+G14', 'active'),
('Razer Blade 15', 'RAZER-RB15-1TB', 'Premium gaming laptop with RTX 4070', 'Laptops', 'Razer', 2499.00, 'https://razer.com/blade-15', 'https://via.placeholder.com/300x300/00FF00/000000?text=Blade+15', 'active'),

-- Audio
('AirPods Pro 2', 'APPLE-APP2', 'Active noise cancellation with spatial audio', 'Audio', 'Apple', 249.00, 'https://apple.com/airpods-pro', 'https://via.placeholder.com/300x300/000000/FFFFFF?text=AirPods+Pro', 'active'),
('Bose QuietComfort 45', 'BOSE-QC45', 'Premium noise-canceling headphones', 'Audio', 'Bose', 329.00, 'https://bose.com/quietcomfort-45', 'https://via.placeholder.com/300x300/000000/FFFFFF?text=QC+45', 'active'),
('Sennheiser Momentum 4', 'SENN-MOM4', 'Wireless headphones with 60-hour battery', 'Audio', 'Sennheiser', 349.00, 'https://sennheiser.com/momentum-4', 'https://via.placeholder.com/300x300/000000/FFFFFF?text=Momentum+4', 'active'),
('JBL Flip 6', 'JBL-FLIP6', 'Portable Bluetooth speaker with waterproof design', 'Audio', 'JBL', 129.00, 'https://jbl.com/flip-6', 'https://via.placeholder.com/300x300/FF6900/FFFFFF?text=Flip+6', 'active'),

-- Footwear
('Nike Air Force 1', 'NIKE-AF1-WHT', 'Classic basketball sneakers in white', 'Footwear', 'Nike', 90.00, 'https://nike.com/air-force-1', 'https://via.placeholder.com/300x300/000000/FFFFFF?text=Air+Force+1', 'active'),
('Adidas Stan Smith', 'ADIDAS-SS-WHT', 'Iconic tennis shoes with green heel tab', 'Footwear', 'Adidas', 80.00, 'https://adidas.com/stan-smith', 'https://via.placeholder.com/300x300/000000/FFFFFF?text=Stan+Smith', 'active'),
('New Balance 990v5', 'NB-990V5-GRY', 'Made in USA premium running shoes', 'Footwear', 'New Balance', 185.00, 'https://newbalance.com/990v5', 'https://via.placeholder.com/300x300/000000/FFFFFF?text=990v5', 'active'),
('Vans Old Skool', 'VANS-OS-BLK', 'Classic skateboarding shoes', 'Footwear', 'Vans', 65.00, 'https://vans.com/old-skool', 'https://via.placeholder.com/300x300/000000/FFFFFF?text=Old+Skool', 'active'),

-- Tablets
('Samsung Galaxy Tab S9', 'SAMSUNG-GTS9-256', 'Premium Android tablet with S Pen', 'Tablets', 'Samsung', 799.00, 'https://samsung.com/galaxy-tab-s9', 'https://via.placeholder.com/300x300/1428A0/FFFFFF?text=Tab+S9', 'active'),
('iPad Air', 'APPLE-IPADAIR-256', '10.9-inch iPad with M2 chip', 'Tablets', 'Apple', 599.00, 'https://apple.com/ipad-air', 'https://via.placeholder.com/300x300/007AFF/FFFFFF?text=iPad+Air', 'active'),

-- Vehicles
('Tesla Model 3', 'TESLA-M3-LR', 'Electric sedan with autopilot', 'Vehicles', 'Tesla', 38990.00, 'https://tesla.com/model-3', 'https://via.placeholder.com/300x300/CC0000/FFFFFF?text=Model+3', 'active'),
('Ford F-150 Lightning', 'FORD-F150L-ER', 'Electric pickup truck', 'Vehicles', 'Ford', 59974.00, 'https://ford.com/f150-lightning', 'https://via.placeholder.com/300x300/003478/FFFFFF?text=F-150', 'active'),

-- Smartwatches
('Apple Watch Series 9', 'APPLE-AW9-45', 'Latest Apple Watch with S9 chip', 'Wearables', 'Apple', 399.00, 'https://apple.com/watch-series-9', 'https://via.placeholder.com/300x300/000000/FFFFFF?text=Watch+9', 'active'),
('Samsung Galaxy Watch 6', 'SAMSUNG-GW6-44', 'Premium smartwatch with Wear OS', 'Wearables', 'Samsung', 299.00, 'https://samsung.com/galaxy-watch-6', 'https://via.placeholder.com/300x300/1428A0/FFFFFF?text=Watch+6', 'active'),
('Garmin Fenix 7', 'GARMIN-F7-SAP', 'Premium multisport GPS watch', 'Wearables', 'Garmin', 699.00, 'https://garmin.com/fenix-7', 'https://via.placeholder.com/300x300/007CC3/FFFFFF?text=Fenix+7', 'active');

-- Insert product pages for new products (using LAST_INSERT_ID() approach)
-- Get the first new product ID (should be 11 if we have 10 existing)
SET @first_new_id = (SELECT MAX(id) FROM products) - 22; -- 22 new products were just inserted

-- Insert product pages for new products (iPhone 15 = @first_new_id + 1)
INSERT INTO product_pages (product_id, url, page_type, platform, title) 
SELECT id, 'https://apple.com/iphone-15', 'product_page', 'website', 'iPhone 15 - Apple' FROM products WHERE name = 'iPhone 15' LIMIT 1;

INSERT INTO product_pages (product_id, url, page_type, platform, title) 
SELECT id, 'https://amazon.com/dp/iPhone15', 'product_page', 'amazon', 'Apple iPhone 15 Amazon' FROM products WHERE name = 'iPhone 15' LIMIT 1;

INSERT INTO product_pages (product_id, url, page_type, platform, title) 
SELECT id, 'https://reddit.com/r/iPhone', 'social_media', 'reddit', 'iPhone Community' FROM products WHERE name = 'iPhone 15' LIMIT 1;

-- Galaxy S23 Ultra pages
INSERT INTO product_pages (product_id, url, page_type, platform, title) 
SELECT id, 'https://samsung.com/galaxy-s23-ultra', 'product_page', 'website', 'Galaxy S23 Ultra' FROM products WHERE name = 'Samsung Galaxy S23 Ultra' LIMIT 1;

INSERT INTO product_pages (product_id, url, page_type, platform, title) 
SELECT id, 'https://youtube.com/watch?v=galaxy-s23-review', 'review_page', 'youtube', 'Galaxy S23 Ultra Review' FROM products WHERE name = 'Samsung Galaxy S23 Ultra' LIMIT 1;

-- MacBook Pro pages (existing product, add more)
INSERT INTO product_pages (product_id, url, page_type, platform, title) 
SELECT id, 'https://apple.com/macbook-pro', 'product_page', 'website', 'MacBook Pro M3' FROM products WHERE name = 'MacBook Pro M3' AND id NOT IN (SELECT product_id FROM product_pages WHERE url = 'https://apple.com/macbook-pro') LIMIT 1;

INSERT INTO product_pages (product_id, url, page_type, platform, title) 
SELECT id, 'https://amazon.com/dp/MacBookPro', 'product_page', 'amazon', 'MacBook Pro M3 Amazon' FROM products WHERE name = 'MacBook Pro M3' AND id NOT IN (SELECT product_id FROM product_pages WHERE url = 'https://amazon.com/dp/MacBookPro') LIMIT 1;

-- Dell XPS pages
INSERT INTO product_pages (product_id, url, page_type, platform, title) 
SELECT id, 'https://dell.com/xps-15', 'product_page', 'website', 'Dell XPS 15' FROM products WHERE name = 'Dell XPS 15' LIMIT 1;

INSERT INTO product_pages (product_id, url, page_type, platform, title) 
SELECT id, 'https://youtube.com/watch?v=xps-15-review', 'review_page', 'youtube', 'Dell XPS 15 Review' FROM products WHERE name = 'Dell XPS 15' LIMIT 1;

-- AirPods Pro 2 pages
INSERT INTO product_pages (product_id, url, page_type, platform, title) 
SELECT id, 'https://apple.com/airpods-pro', 'product_page', 'website', 'AirPods Pro 2' FROM products WHERE name = 'AirPods Pro 2' LIMIT 1;

INSERT INTO product_pages (product_id, url, page_type, platform, title) 
SELECT id, 'https://amazon.com/dp/AirPodsPro', 'product_page', 'amazon', 'AirPods Pro 2 Amazon' FROM products WHERE name = 'AirPods Pro 2' LIMIT 1;

-- Insert extensive sentiment analysis data for existing and new products
-- iPhone 15 Pro sentiments (existing product, add more)
INSERT INTO sentiment_analysis (product_id, page_id, text, sentiment, score, confidence, channel, topics, keywords) 
SELECT 1, id, 'iPhone 15 Pro titanium build feels premium and durable. Love the new design!', 'positive', 0.87, 0.92, 'reviews', '["design", "build quality"]', '["premium", "durable", "love"]' 
FROM product_pages WHERE product_id = 1 LIMIT 1;

INSERT INTO sentiment_analysis (product_id, page_id, text, sentiment, score, confidence, channel, topics, keywords) 
SELECT 1, id, 'Battery life on iPhone 15 Pro is disappointing. Expected better for the price.', 'negative', -0.45, 0.83, 'reviews', '["battery", "price"]', '["disappointing", "expected better"]' 
FROM product_pages WHERE product_id = 1 LIMIT 1;

INSERT INTO sentiment_analysis (product_id, page_id, text, sentiment, score, confidence, channel, topics, keywords) 
SELECT 1, id, 'The camera system on iPhone 15 Pro is absolutely incredible. Best smartphone camera ever!', 'positive', 0.95, 0.98, 'twitter', '["camera"]', '["incredible", "best", "ever"]' 
FROM product_pages WHERE product_id = 1 AND platform = 'twitter' LIMIT 1;

-- iPhone 15 sentiments (new product)
INSERT INTO sentiment_analysis (product_id, page_id, text, sentiment, score, confidence, channel, topics, keywords) 
SELECT p.id, pp.id, 'iPhone 15 is a great value for money. Excellent camera and performance.', 'positive', 0.82, 0.89, 'reviews', '["value", "camera", "performance"]', '["great", "excellent"]' 
FROM products p 
JOIN product_pages pp ON pp.product_id = p.id 
WHERE p.name = 'iPhone 15' LIMIT 1;

INSERT INTO sentiment_analysis (product_id, page_id, text, sentiment, score, confidence, channel, topics, keywords) 
SELECT p.id, pp.id, 'iPhone 15 display is bright and vibrant. Very satisfied with the purchase.', 'positive', 0.88, 0.91, 'reviews', '["display"]', '["bright", "vibrant", "satisfied"]' 
FROM products p 
JOIN product_pages pp ON pp.product_id = p.id 
WHERE p.name = 'iPhone 15' LIMIT 1;

-- Galaxy S23 Ultra sentiments
INSERT INTO sentiment_analysis (product_id, page_id, text, sentiment, score, confidence, channel, topics, keywords) 
SELECT p.id, pp.id, 'Samsung Galaxy S23 Ultra S Pen is amazing for note-taking. Best Android phone!', 'positive', 0.91, 0.94, 'reviews', '["S Pen", "note-taking"]', '["amazing", "best"]' 
FROM products p 
JOIN product_pages pp ON pp.product_id = p.id 
WHERE p.name = 'Samsung Galaxy S23 Ultra' LIMIT 1;

INSERT INTO sentiment_analysis (product_id, page_id, text, sentiment, score, confidence, channel, topics, keywords) 
SELECT p.id, pp.id, 'Galaxy S23 Ultra camera zoom is mind-blowing. 100x zoom actually works!', 'positive', 0.93, 0.96, 'reviews', '["camera", "zoom"]', '["mind-blowing", "works"]' 
FROM products p 
JOIN product_pages pp ON pp.product_id = p.id 
WHERE p.name = 'Samsung Galaxy S23 Ultra' LIMIT 1;

-- MacBook Pro M3 sentiments
INSERT INTO sentiment_analysis (product_id, page_id, text, sentiment, score, confidence, channel, topics, keywords) 
SELECT 4, pp.id, 'MacBook Pro M3 performance is incredible. Handles everything I throw at it.', 'positive', 0.92, 0.95, 'reviews', '["performance"]', '["incredible", "handles everything"]' 
FROM product_pages pp 
WHERE pp.product_id = 4 LIMIT 1;

INSERT INTO sentiment_analysis (product_id, page_id, text, sentiment, score, confidence, channel, topics, keywords) 
SELECT 4, pp.id, 'M3 MacBook Pro battery life is outstanding. Lasts all day easily.', 'positive', 0.89, 0.93, 'reviews', '["battery"]', '["outstanding", "lasts all day"]' 
FROM product_pages pp 
WHERE pp.product_id = 4 LIMIT 1;

-- Dell XPS 15 sentiments
INSERT INTO sentiment_analysis (product_id, page_id, text, sentiment, score, confidence, channel, topics, keywords) 
SELECT p.id, pp.id, 'Dell XPS 15 OLED display is absolutely stunning. Best laptop screen I have seen.', 'positive', 0.94, 0.97, 'reviews', '["display", "OLED"]', '["stunning", "best"]' 
FROM products p 
JOIN product_pages pp ON pp.product_id = p.id 
WHERE p.name = 'Dell XPS 15' LIMIT 1;

-- AirPods Pro 2 sentiments
INSERT INTO sentiment_analysis (product_id, page_id, text, sentiment, score, confidence, channel, topics, keywords) 
SELECT p.id, pp.id, 'AirPods Pro 2 noise cancellation is perfect. Can barely hear anything outside.', 'positive', 0.96, 0.98, 'reviews', '["noise cancellation"]', '["perfect", "barely hear"]' 
FROM products p 
JOIN product_pages pp ON pp.product_id = p.id 
WHERE p.name = 'AirPods Pro 2' LIMIT 1;

-- More sentiments for existing products
INSERT INTO sentiment_analysis (product_id, page_id, text, sentiment, score, confidence, channel, topics, keywords) 
SELECT 2, pp.id, 'Galaxy S24 AI features are game-changing. Makes everyday tasks so much easier.', 'positive', 0.88, 0.92, 'reviews', '["AI", "features"]', '["game-changing", "easier"]' 
FROM product_pages pp 
WHERE pp.product_id = 2 LIMIT 1;

INSERT INTO sentiment_analysis (product_id, page_id, text, sentiment, score, confidence, channel, topics, keywords) 
SELECT 3, pp.id, 'Nike Air Max 270 are super comfortable for daily wear. Great cushioning.', 'positive', 0.85, 0.90, 'reviews', '["comfort", "cushioning"]', '["super comfortable", "great"]' 
FROM product_pages pp 
WHERE pp.product_id = 3 LIMIT 1;

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
