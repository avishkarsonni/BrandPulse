-- Add comprehensive sentiment data for all products
-- This script adds realistic sentiment analysis data for all products in the database

-- iPhone 15 Pro (Product ID: 1) - Add more data
INSERT INTO sentiment_analysis (product_id, page_id, text, sentiment, score, confidence, channel, topics, keywords, timestamp) VALUES
(1, 1, 'The iPhone 15 Pro camera is absolutely incredible! The 48MP sensor captures stunning photos.', 'positive', 0.85, 0.92, 'reviews', '["camera", "quality"]', '["incredible", "stunning", "photos"]', '2025-10-12 10:30:00'),
(1, 1, 'Battery life on iPhone 15 Pro is disappointing. Dies too quickly with heavy usage.', 'negative', -0.70, 0.88, 'reviews', '["battery", "performance"]', '["disappointing", "dies", "quickly"]', '2025-10-12 11:15:00'),
(1, 1, 'The titanium build feels premium and durable. Worth the upgrade from iPhone 14.', 'positive', 0.75, 0.90, 'reviews', '["build", "quality"]', '["premium", "durable", "upgrade"]', '2025-10-12 12:00:00'),
(1, 3, 'iPhone 15 Pro is way too expensive for what you get. Not worth the price tag.', 'negative', -0.80, 0.85, 'twitter', '["pricing", "value"]', '["expensive", "not worth", "price"]', '2025-10-12 13:45:00'),
(1, 3, 'The A17 Pro chip is blazing fast! Apps load instantly and multitasking is smooth.', 'positive', 0.90, 0.95, 'twitter', '["performance", "chip"]', '["blazing", "fast", "instant", "smooth"]', '2025-10-12 14:20:00');

-- Samsung Galaxy S24 (Product ID: 2) - Add more data
INSERT INTO sentiment_analysis (product_id, page_id, text, sentiment, score, confidence, channel, topics, keywords, timestamp) VALUES
(2, 4, 'Samsung Galaxy S24 AI features are game-changing! The photo editing is incredible.', 'positive', 0.88, 0.93, 'reviews', '["AI", "features"]', '["game-changing", "incredible", "editing"]', '2025-10-12 09:30:00'),
(2, 4, 'Galaxy S24 display is gorgeous but the battery could be better.', 'neutral', 0.20, 0.75, 'reviews', '["display", "battery"]', '["gorgeous", "better"]', '2025-10-12 10:45:00'),
(2, 4, 'Samsung S24 camera quality is amazing, especially in low light conditions.', 'positive', 0.82, 0.89, 'reviews', '["camera", "quality"]', '["amazing", "low light"]', '2025-10-12 11:30:00'),
(2, 4, 'The Galaxy S24 is overpriced compared to competitors. Not great value.', 'negative', -0.65, 0.82, 'twitter', '["pricing", "value"]', '["overpriced", "not great"]', '2025-10-12 12:15:00'),
(2, 4, 'One UI 6.1 on S24 is smooth and intuitive. Great user experience.', 'positive', 0.70, 0.85, 'twitter', '["software", "experience"]', '["smooth", "intuitive", "great"]', '2025-10-12 13:00:00');

-- Nike Air Max 270 (Product ID: 3) - Add more data
INSERT INTO sentiment_analysis (product_id, page_id, text, sentiment, score, confidence, channel, topics, keywords, timestamp) VALUES
(3, 5, 'Nike Air Max 270 is super comfortable for all-day wear. Great cushioning!', 'positive', 0.80, 0.88, 'reviews', '["comfort", "cushioning"]', '["comfortable", "great", "cushioning"]', '2025-10-12 08:30:00'),
(3, 5, 'The Air Max 270 looks stylish but the sole wears out quickly.', 'neutral', -0.10, 0.70, 'reviews', '["style", "durability"]', '["stylish", "wears out"]', '2025-10-12 09:15:00'),
(3, 5, 'Perfect running shoes! Air Max 270 provides excellent support and comfort.', 'positive', 0.85, 0.90, 'reviews', '["running", "support"]', '["perfect", "excellent", "support"]', '2025-10-12 10:00:00'),
(3, 5, 'Nike Air Max 270 sizing runs small. Had to return for a larger size.', 'negative', -0.60, 0.80, 'twitter', '["sizing", "fit"]', '["runs small", "return"]', '2025-10-12 11:45:00'),
(3, 5, 'Love the color options on Air Max 270. Great for casual wear.', 'positive', 0.75, 0.85, 'twitter', '["colors", "style"]', '["love", "great", "casual"]', '2025-10-12 12:30:00');

-- MacBook Pro M3 (Product ID: 4) - Add data (currently has none)
INSERT INTO sentiment_analysis (product_id, page_id, text, sentiment, score, confidence, channel, topics, keywords, timestamp) VALUES
(4, 6, 'MacBook Pro M3 is incredibly fast! Handles video editing like a dream.', 'positive', 0.92, 0.95, 'reviews', '["performance", "video editing"]', '["incredibly fast", "dream"]', '2025-10-12 09:00:00'),
(4, 6, 'The M3 chip performance is outstanding. Best laptop I have ever used.', 'positive', 0.88, 0.93, 'reviews', '["performance", "chip"]', '["outstanding", "best"]', '2025-10-12 10:30:00'),
(4, 6, 'MacBook Pro M3 battery life is amazing. Lasts all day with heavy usage.', 'positive', 0.85, 0.90, 'reviews', '["battery", "life"]', '["amazing", "lasts all day"]', '2025-10-12 11:15:00'),
(4, 6, 'Too expensive for most users. MacBook Pro M3 is overpriced.', 'negative', -0.75, 0.85, 'twitter', '["pricing", "value"]', '["expensive", "overpriced"]', '2025-10-12 12:00:00'),
(4, 6, 'The MacBook Pro M3 display is gorgeous. Perfect for creative work.', 'positive', 0.80, 0.88, 'twitter', '["display", "creative"]', '["gorgeous", "perfect"]', '2025-10-12 13:30:00'),
(4, 6, 'MacBook Pro M3 gets hot during intensive tasks. Thermal management could be better.', 'negative', -0.50, 0.75, 'reviews', '["thermal", "performance"]', '["hot", "thermal management"]', '2025-10-12 14:15:00');

-- Tesla Model Y (Product ID: 5) - Add data (currently has none)
INSERT INTO sentiment_analysis (product_id, page_id, text, sentiment, score, confidence, channel, topics, keywords, timestamp) VALUES
(5, 7, 'Tesla Model Y is the future of driving! Autopilot is incredible.', 'positive', 0.90, 0.94, 'reviews', '["autopilot", "future"]', '["future", "incredible"]', '2025-10-12 08:00:00'),
(5, 7, 'Model Y acceleration is mind-blowing. Instant torque is amazing.', 'positive', 0.85, 0.90, 'reviews', '["acceleration", "performance"]', '["mind-blowing", "instant", "amazing"]', '2025-10-12 09:30:00'),
(5, 7, 'Tesla Model Y build quality is inconsistent. Some panels don\'t align properly.', 'negative', -0.70, 0.85, 'reviews', '["build quality", "panels"]', '["inconsistent", "don\'t align"]', '2025-10-12 10:45:00'),
(5, 7, 'The Model Y interior is minimalist but feels cheap for the price.', 'negative', -0.60, 0.80, 'twitter', '["interior", "quality"]', '["minimalist", "cheap"]', '2025-10-12 11:30:00'),
(5, 7, 'Tesla Model Y charging network is unmatched. Road trips are effortless.', 'positive', 0.88, 0.92, 'twitter', '["charging", "road trips"]', '["unmatched", "effortless"]', '2025-10-12 12:15:00'),
(5, 7, 'Model Y software updates are frequent and always add new features.', 'positive', 0.75, 0.85, 'reviews', '["software", "updates"]', '["frequent", "new features"]', '2025-10-12 13:00:00'),
(5, 7, 'Tesla Model Y service experience is terrible. Long wait times and poor communication.', 'negative', -0.80, 0.88, 'reviews', '["service", "experience"]', '["terrible", "long wait", "poor"]', '2025-10-12 14:30:00');

-- Google Pixel 8 Pro (Product ID: 6) - Add more data
INSERT INTO sentiment_analysis (product_id, page_id, text, sentiment, score, confidence, channel, topics, keywords, timestamp) VALUES
(6, 8, 'Pixel 8 Pro camera is phenomenal! The AI photo editing is revolutionary.', 'positive', 0.90, 0.94, 'reviews', '["camera", "AI"]', '["phenomenal", "revolutionary"]', '2025-10-12 09:15:00'),
(6, 8, 'Google Pixel 8 Pro battery life is decent but could be better.', 'neutral', 0.15, 0.70, 'reviews', '["battery", "life"]', '["decent", "could be better"]', '2025-10-12 10:00:00'),
(6, 8, 'The Pixel 8 Pro display is gorgeous. Colors are vibrant and accurate.', 'positive', 0.82, 0.88, 'reviews', '["display", "colors"]', '["gorgeous", "vibrant", "accurate"]', '2025-10-12 11:30:00'),
(6, 8, 'Pixel 8 Pro gets warm during intensive tasks. Thermal management needs work.', 'negative', -0.55, 0.78, 'twitter', '["thermal", "performance"]', '["warm", "thermal management"]', '2025-10-12 12:45:00'),
(6, 8, 'Google Pixel 8 Pro software is clean and bloat-free. Pure Android experience.', 'positive', 0.85, 0.90, 'twitter', '["software", "Android"]', '["clean", "bloat-free", "pure"]', '2025-10-12 13:30:00');

-- Microsoft Surface Laptop 5 (Product ID: 7) - Add more data
INSERT INTO sentiment_analysis (product_id, page_id, text, sentiment, score, confidence, channel, topics, keywords, timestamp) VALUES
(7, 9, 'Surface Laptop 5 build quality is excellent. Premium materials throughout.', 'positive', 0.85, 0.90, 'reviews', '["build quality", "materials"]', '["excellent", "premium"]', '2025-10-12 08:45:00'),
(7, 9, 'The Surface Laptop 5 keyboard is comfortable for long typing sessions.', 'positive', 0.80, 0.88, 'reviews', '["keyboard", "comfort"]', '["comfortable", "long sessions"]', '2025-10-12 09:30:00'),
(7, 9, 'Surface Laptop 5 performance is good but not exceptional for the price.', 'neutral', 0.25, 0.75, 'reviews', '["performance", "value"]', '["good", "not exceptional"]', '2025-10-12 10:15:00'),
(7, 9, 'The Surface Laptop 5 trackpad is responsive and accurate.', 'positive', 0.75, 0.85, 'twitter', '["trackpad", "responsiveness"]', '["responsive", "accurate"]', '2025-10-12 11:00:00'),
(7, 9, 'Surface Laptop 5 battery life is disappointing. Dies too quickly.', 'negative', -0.70, 0.85, 'twitter', '["battery", "life"]', '["disappointing", "dies quickly"]', '2025-10-12 12:30:00'),
(7, 9, 'The Surface Laptop 5 design is sleek and professional looking.', 'positive', 0.78, 0.87, 'reviews', '["design", "appearance"]', '["sleek", "professional"]', '2025-10-12 13:15:00');

-- Sony WH-1000XM5 (Product ID: 8) - Add more data
INSERT INTO sentiment_analysis (product_id, page_id, text, sentiment, score, confidence, channel, topics, keywords, timestamp) VALUES
(8, 10, 'Sony WH-1000XM5 noise cancellation is incredible! Blocks out everything.', 'positive', 0.92, 0.95, 'reviews', '["noise cancellation", "quality"]', '["incredible", "blocks out everything"]', '2025-10-12 08:30:00'),
(8, 10, 'The WH-1000XM5 sound quality is amazing. Rich bass and clear highs.', 'positive', 0.88, 0.92, 'reviews', '["sound quality", "audio"]', '["amazing", "rich bass", "clear highs"]', '2025-10-12 09:15:00'),
(8, 10, 'Sony WH-1000XM5 comfort is good but gets uncomfortable after long use.', 'neutral', 0.20, 0.70, 'reviews', '["comfort", "fit"]', '["good", "uncomfortable", "long use"]', '2025-10-12 10:00:00'),
(8, 10, 'The WH-1000XM5 battery life is excellent. Lasts 30+ hours easily.', 'positive', 0.85, 0.90, 'twitter', '["battery", "life"]', '["excellent", "30+ hours"]', '2025-10-12 11:30:00'),
(8, 10, 'Sony WH-1000XM5 is overpriced compared to competitors. Not great value.', 'negative', -0.65, 0.82, 'twitter', '["pricing", "value"]', '["overpriced", "not great value"]', '2025-10-12 12:15:00'),
(8, 10, 'The WH-1000XM5 touch controls are intuitive and responsive.', 'positive', 0.75, 0.85, 'reviews', '["controls", "usability"]', '["intuitive", "responsive"]', '2025-10-12 13:00:00');

-- Adidas Ultraboost 22 (Product ID: 9) - Add more data
INSERT INTO sentiment_analysis (product_id, page_id, text, sentiment, score, confidence, channel, topics, keywords, timestamp) VALUES
(9, 11, 'Adidas Ultraboost 22 is incredibly comfortable for running. Best running shoes ever!', 'positive', 0.90, 0.94, 'reviews', '["comfort", "running"]', '["incredibly comfortable", "best", "ever"]', '2025-10-12 08:00:00'),
(9, 11, 'The Ultraboost 22 cushioning is amazing. Feels like running on clouds.', 'positive', 0.85, 0.90, 'reviews', '["cushioning", "comfort"]', '["amazing", "running on clouds"]', '2025-10-12 09:30:00'),
(9, 11, 'Adidas Ultraboost 22 sizing runs small. Had to go up half a size.', 'negative', -0.60, 0.80, 'twitter', '["sizing", "fit"]', '["runs small", "half a size"]', '2025-10-12 10:15:00'),
(9, 11, 'The Ultraboost 22 durability is questionable. Sole wears out quickly.', 'negative', -0.70, 0.85, 'twitter', '["durability", "sole"]', '["questionable", "wears out quickly"]', '2025-10-12 11:00:00'),
(9, 11, 'Adidas Ultraboost 22 style is sleek and modern. Great for casual wear too.', 'positive', 0.75, 0.85, 'reviews', '["style", "appearance"]', '["sleek", "modern", "casual"]', '2025-10-12 12:30:00'),
(9, 11, 'The Ultraboost 22 price is too high for what you get. Not great value.', 'negative', -0.65, 0.82, 'reviews', '["pricing", "value"]', '["too high", "not great value"]', '2025-10-12 13:15:00');

-- iPad Pro 12.9" (Product ID: 10) - Add more data
INSERT INTO sentiment_analysis (product_id, page_id, text, sentiment, score, confidence, channel, topics, keywords, timestamp) VALUES
(10, 12, 'iPad Pro 12.9 inch display is absolutely stunning! Perfect for creative work.', 'positive', 0.88, 0.92, 'reviews', '["display", "creative"]', '["stunning", "perfect", "creative"]', '2025-10-12 08:15:00'),
(10, 12, 'The iPad Pro 12.9 performance is incredible. Handles Pro apps effortlessly.', 'positive', 0.90, 0.94, 'reviews', '["performance", "apps"]', '["incredible", "effortlessly"]', '2025-10-12 09:00:00'),
(10, 12, 'iPad Pro 12.9 is too expensive for most users. Overpriced tablet.', 'negative', -0.75, 0.85, 'twitter', '["pricing", "value"]', '["too expensive", "overpriced"]', '2025-10-12 10:30:00'),
(10, 12, 'The iPad Pro 12.9 Apple Pencil integration is seamless and responsive.', 'positive', 0.82, 0.88, 'twitter', '["Apple Pencil", "integration"]', '["seamless", "responsive"]', '2025-10-12 11:15:00'),
(10, 12, 'iPad Pro 12.9 battery life is excellent. Lasts all day with heavy usage.', 'positive', 0.85, 0.90, 'reviews', '["battery", "life"]', '["excellent", "lasts all day"]', '2025-10-12 12:00:00'),
(10, 12, 'The iPad Pro 12.9 is heavy and not very portable. Hard to hold for long periods.', 'negative', -0.60, 0.78, 'reviews', '["weight", "portability"]', '["heavy", "not portable", "hard to hold"]', '2025-10-12 13:45:00'),
(10, 12, 'iPad Pro 12.9 Magic Keyboard is expensive but transforms the experience.', 'neutral', 0.30, 0.75, 'twitter', '["Magic Keyboard", "accessories"]', '["expensive", "transforms"]', '2025-10-12 14:30:00');



