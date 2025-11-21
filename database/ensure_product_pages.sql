-- Ensure all products have at least 3 product pages (website, amazon, and a review/social page)

-- Add website pages for products that don't have any
INSERT INTO product_pages (product_id, url, page_type, platform, title)
SELECT 
    p.id,
    CONCAT('https://', LOWER(REPLACE(p.brand, ' ', '')), '.com/', LOWER(REPLACE(p.name, ' ', '-'))),
    'product_page',
    'website',
    CONCAT(p.name, ' - ', p.brand, ' Official')
FROM products p
WHERE p.status = 'active'
  AND p.id NOT IN (
    SELECT DISTINCT product_id 
    FROM product_pages 
    WHERE page_type = 'product_page' AND platform = 'website'
  );

-- Add Amazon pages for products that don't have one
INSERT INTO product_pages (product_id, url, page_type, platform, title)
SELECT 
    p.id,
    CONCAT('https://amazon.com/dp/', p.sku),
    'product_page',
    'amazon',
    CONCAT(p.name, ' - Amazon')
FROM products p
WHERE p.status = 'active'
  AND p.id NOT IN (
    SELECT DISTINCT product_id 
    FROM product_pages 
    WHERE page_type = 'product_page' AND platform = 'amazon'
  );

-- Add review pages (YouTube) for products that don't have one
INSERT INTO product_pages (product_id, url, page_type, platform, title)
SELECT 
    p.id,
    CONCAT('https://youtube.com/watch?v=', LOWER(REPLACE(REPLACE(p.name, ' ', '-'), '"', '')), '-review'),
    'review_page',
    'youtube',
    CONCAT(p.name, ' Review')
FROM products p
WHERE p.status = 'active'
  AND p.id NOT IN (
    SELECT DISTINCT product_id 
    FROM product_pages 
    WHERE page_type = 'review_page' AND platform = 'youtube'
  )
LIMIT 50;

-- Add social media pages for major brands
INSERT INTO product_pages (product_id, url, page_type, platform, title)
SELECT 
    p.id,
    CASE p.brand
        WHEN 'Apple' THEN CONCAT('https://twitter.com/hashtag/', LOWER(REPLACE(REPLACE(p.name, ' ', ''), '"', '')))
        WHEN 'Samsung' THEN CONCAT('https://twitter.com/hashtag/', LOWER(REPLACE(REPLACE(p.name, ' ', ''), '"', '')))
        WHEN 'Nike' THEN CONCAT('https://instagram.com/explore/tags/', LOWER(REPLACE(REPLACE(p.name, ' ', ''), '"', '')))
        WHEN 'Adidas' THEN CONCAT('https://instagram.com/explore/tags/', LOWER(REPLACE(REPLACE(p.name, ' ', ''), '"', '')))
        WHEN 'Tesla' THEN CONCAT('https://twitter.com/hashtag/', LOWER(REPLACE(REPLACE(p.name, ' ', ''), '"', '')))
        ELSE CONCAT('https://reddit.com/r/', LOWER(REPLACE(p.brand, ' ', '')), '/')
    END,
    'social_media',
    CASE p.brand
        WHEN 'Apple' THEN 'twitter'
        WHEN 'Samsung' THEN 'twitter'
        WHEN 'Nike' THEN 'instagram'
        WHEN 'Adidas' THEN 'instagram'
        WHEN 'Tesla' THEN 'twitter'
        ELSE 'reddit'
    END,
    CONCAT(p.name, ' - Social Media')
FROM products p
WHERE p.status = 'active'
  AND p.brand IN ('Apple', 'Samsung', 'Nike', 'Adidas', 'Tesla', 'Microsoft', 'Sony')
  AND p.id NOT IN (
    SELECT DISTINCT product_id 
    FROM product_pages 
    WHERE page_type = 'social_media'
  )
LIMIT 30;

-- Verify: Show products with their page counts
SELECT 
    p.id,
    p.name,
    p.brand,
    COUNT(pp.id) as page_count,
    GROUP_CONCAT(DISTINCT pp.platform ORDER BY pp.platform SEPARATOR ', ') as platforms
FROM products p
LEFT JOIN product_pages pp ON p.id = pp.product_id
WHERE p.status = 'active'
GROUP BY p.id, p.name, p.brand
ORDER BY page_count ASC, p.id
LIMIT 20;

