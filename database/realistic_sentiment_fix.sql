-- Add realistic mixed reviews to products
-- Even bad products should have some positive reviews, and great products should have some negative reviews

-- Add a few positive reviews to exceptionally bad products (realistic - some people might still like them)
UPDATE sentiment_analysis 
SET sentiment = 'positive',
    score = 0.3 + (RAND() * 0.3),  -- Scores between 0.3 and 0.6
    confidence = 0.80 + (RAND() * 0.1),
    text = CONCAT('Actually works well for my needs. ', text)
WHERE product_id IN (15, 39, 49)  -- Exceptionally bad products
  AND id % 10 = 0  -- 10% of reviews become positive
  AND sentiment = 'negative'
LIMIT 10;

-- Add a few negative reviews to overwhelmingly positive products (realistic - even great products have critics)
UPDATE sentiment_analysis 
SET sentiment = 'negative',
    score = -0.3 + (RAND() * 0.2),  -- Scores between -0.3 and -0.1 (mildly negative)
    confidence = 0.75 + (RAND() * 0.1),
    text = CONCAT('Not perfect, has some issues. ', text)
WHERE product_id IN (1, 4, 5, 21, 48)  -- Overwhelmingly positive products
  AND id % 15 = 0  -- ~7% of reviews become negative
  AND sentiment = 'positive'
LIMIT 15;

-- Add some neutral reviews to bad products (people who are on the fence)
UPDATE sentiment_analysis 
SET sentiment = 'neutral',
    score = -0.1 + (RAND() * 0.2),  -- Scores between -0.1 and 0.1
    confidence = 0.75 + (RAND() * 0.1),
    text = CONCAT('Mixed feelings about this. ', text)
WHERE product_id IN (15, 39, 49, 38, 33, 41)  -- Bad and neutral products
  AND id % 8 = 0  -- ~12% become neutral
  AND sentiment = 'negative'
LIMIT 20;

-- Update product analytics again
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

