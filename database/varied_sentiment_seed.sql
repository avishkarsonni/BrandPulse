-- Update seed data with varied sentiment profiles
-- This script modifies existing sentiment data to create products with different sentiment profiles:
-- - Exceptionally bad products (mostly negative reviews)
-- - Bad products (more negative than positive)
-- - Neutral products (balanced)
-- - Positive products (more positive than negative)
-- - Overwhelmingly positive products (mostly positive reviews)

-- First, let's identify products to update and their target sentiment profiles
-- We'll update products to have different sentiment distributions

-- Exceptionally Bad Products (avg_score < -0.5, 70%+ negative)
-- Product IDs: 15 (Nothing Phone 2), 39 (Realme GT 5), 49 (Puma RS-X)
UPDATE sentiment_analysis 
SET sentiment = 'negative', 
    score = -0.8 + (RAND() * 0.3),  -- Scores between -0.8 and -0.5
    confidence = 0.85 + (RAND() * 0.1)
WHERE product_id = 15 
  AND id % 10 < 7;  -- 70% negative

UPDATE sentiment_analysis 
SET sentiment = 'negative',
    score = -0.9 + (RAND() * 0.2),  -- Scores between -0.9 and -0.7
    confidence = 0.88 + (RAND() * 0.1)
WHERE product_id = 39
  AND id % 10 < 7;

UPDATE sentiment_analysis 
SET sentiment = 'negative',
    score = -0.85 + (RAND() * 0.25),  -- Scores between -0.85 and -0.6
    confidence = 0.86 + (RAND() * 0.1)
WHERE product_id = 49
  AND id % 10 < 7;

-- Set remaining to neutral for exceptionally bad products
UPDATE sentiment_analysis 
SET sentiment = 'neutral',
    score = -0.1 + (RAND() * 0.2),  -- Scores between -0.1 and 0.1
    confidence = 0.75 + (RAND() * 0.1)
WHERE product_id IN (15, 39, 49)
  AND sentiment != 'negative';

-- Bad Products (avg_score -0.3 to -0.1, 50-60% negative)
-- Product IDs: 38 (Motorola Edge 40), 41 (Dell Inspiron 15), 33 (Apple Watch Series 9)
UPDATE sentiment_analysis 
SET sentiment = 'negative',
    score = -0.5 + (RAND() * 0.3),  -- Scores between -0.5 and -0.2
    confidence = 0.82 + (RAND() * 0.1)
WHERE product_id = 38
  AND id % 10 < 6;  -- 60% negative

UPDATE sentiment_analysis 
SET sentiment = 'negative',
    score = -0.4 + (RAND() * 0.25),  -- Scores between -0.4 and -0.15
    confidence = 0.83 + (RAND() * 0.1)
WHERE product_id = 41
  AND id % 10 < 5;  -- 50% negative

UPDATE sentiment_analysis 
SET sentiment = 'negative',
    score = -0.45 + (RAND() * 0.3),  -- Scores between -0.45 and -0.15
    confidence = 0.84 + (RAND() * 0.1)
WHERE product_id = 33
  AND id % 10 < 5;  -- 50% negative

-- Set some to neutral for bad products
UPDATE sentiment_analysis 
SET sentiment = 'neutral',
    score = -0.15 + (RAND() * 0.3),  -- Scores between -0.15 and 0.15
    confidence = 0.76 + (RAND() * 0.1)
WHERE product_id IN (38, 41, 33)
  AND sentiment != 'negative'
  AND id % 2 = 0;  -- Half of remaining to neutral

-- Neutral Products (avg_score -0.1 to 0.1, balanced distribution)
-- Product IDs: 3 (Nike Air Max 270), 9 (Adidas Ultraboost 22), 24 (JBL Flip 6), 28 (Vans Old Skool)
UPDATE sentiment_analysis 
SET sentiment = CASE 
    WHEN id % 3 = 0 THEN 'positive'
    WHEN id % 3 = 1 THEN 'negative'
    ELSE 'neutral'
END,
score = CASE 
    WHEN id % 3 = 0 THEN 0.2 + (RAND() * 0.3)  -- 0.2 to 0.5
    WHEN id % 3 = 1 THEN -0.3 + (RAND() * 0.3)  -- -0.3 to 0
    ELSE -0.1 + (RAND() * 0.2)  -- -0.1 to 0.1
END,
confidence = 0.78 + (RAND() * 0.15)
WHERE product_id IN (3, 9, 24, 28);

-- Positive Products (avg_score 0.2 to 0.5, 60-70% positive)
-- Product IDs: 2 (Samsung Galaxy S24), 6 (Google Pixel 8 Pro), 12 (Samsung Galaxy S23 Ultra), 16 (Dell XPS 15)
UPDATE sentiment_analysis 
SET sentiment = 'positive',
    score = 0.4 + (RAND() * 0.4),  -- Scores between 0.4 and 0.8
    confidence = 0.88 + (RAND() * 0.1)
WHERE product_id = 2
  AND id % 10 < 7;  -- 70% positive

UPDATE sentiment_analysis 
SET sentiment = 'positive',
    score = 0.35 + (RAND() * 0.35),  -- Scores between 0.35 and 0.7
    confidence = 0.87 + (RAND() * 0.1)
WHERE product_id = 6
  AND id % 10 < 6;  -- 60% positive

UPDATE sentiment_analysis 
SET sentiment = 'positive',
    score = 0.45 + (RAND() * 0.35),  -- Scores between 0.45 and 0.8
    confidence = 0.89 + (RAND() * 0.1)
WHERE product_id = 12
  AND id % 10 < 7;  -- 70% positive

UPDATE sentiment_analysis 
SET sentiment = 'positive',
    score = 0.3 + (RAND() * 0.4),  -- Scores between 0.3 and 0.7
    confidence = 0.86 + (RAND() * 0.1)
WHERE product_id = 16
  AND id % 10 < 6;  -- 60% positive

-- Set remaining to neutral for positive products
UPDATE sentiment_analysis 
SET sentiment = 'neutral',
    score = 0.0 + (RAND() * 0.2),  -- Scores between 0.0 and 0.2
    confidence = 0.77 + (RAND() * 0.1)
WHERE product_id IN (2, 6, 12, 16)
  AND sentiment != 'positive'
  AND id % 3 = 0;  -- Some to neutral

-- Overwhelmingly Positive Products (avg_score > 0.6, 80%+ positive)
-- Product IDs: 1 (iPhone 15 Pro), 4 (MacBook Pro M3), 5 (Tesla Model Y), 21 (AirPods Pro 2), 48 (Adidas Yeezy 350)
UPDATE sentiment_analysis 
SET sentiment = 'positive',
    score = 0.7 + (RAND() * 0.25),  -- Scores between 0.7 and 0.95
    confidence = 0.92 + (RAND() * 0.06)
WHERE product_id = 1
  AND id % 10 < 8;  -- 80% positive

UPDATE sentiment_analysis 
SET sentiment = 'positive',
    score = 0.75 + (RAND() * 0.2),  -- Scores between 0.75 and 0.95
    confidence = 0.93 + (RAND() * 0.05)
WHERE product_id = 4
  AND id % 10 < 8;  -- 80% positive

UPDATE sentiment_analysis 
SET sentiment = 'positive',
    score = 0.8 + (RAND() * 0.15),  -- Scores between 0.8 and 0.95
    confidence = 0.94 + (RAND() * 0.05)
WHERE product_id = 5
  AND id % 10 < 9;  -- 90% positive (Tesla is very popular)

UPDATE sentiment_analysis 
SET sentiment = 'positive',
    score = 0.85 + (RAND() * 0.1),  -- Scores between 0.85 and 0.95
    confidence = 0.95 + (RAND() * 0.04)
WHERE product_id = 21
  AND id % 10 < 9;  -- 90% positive (AirPods Pro 2 is highly rated)

UPDATE sentiment_analysis 
SET sentiment = 'positive',
    score = 0.65 + (RAND() * 0.25),  -- Scores between 0.65 and 0.9
    confidence = 0.91 + (RAND() * 0.07)
WHERE product_id = 48
  AND id % 10 < 8;  -- 80% positive (Yeezy is iconic)

-- Set remaining to neutral for overwhelmingly positive products (very few negative)
UPDATE sentiment_analysis 
SET sentiment = 'neutral',
    score = 0.1 + (RAND() * 0.2),  -- Scores between 0.1 and 0.3
    confidence = 0.79 + (RAND() * 0.1)
WHERE product_id IN (1, 4, 5, 21, 48)
  AND sentiment != 'positive'
  AND id % 5 != 0;  -- Most remaining to neutral, very few negative

-- Add a few negative reviews to overwhelmingly positive products (realistic - even great products have some critics)
UPDATE sentiment_analysis 
SET sentiment = 'negative',
    score = -0.2 + (RAND() * 0.2),  -- Scores between -0.2 and 0 (mildly negative)
    confidence = 0.80 + (RAND() * 0.1)
WHERE product_id IN (1, 4, 5, 21, 48)
  AND sentiment != 'positive'
  AND id % 10 = 0;  -- Only 10% of non-positive reviews are negative

-- Update product analytics to reflect new sentiment distributions
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

