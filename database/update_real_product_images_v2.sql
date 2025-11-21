-- Update products with real product images from Unsplash
-- Using direct product name matching for accuracy

-- Apple iPhone Products
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1592750475338-74a7cef24d02?w=400&h=400&fit=crop' WHERE name = 'iPhone 15 Pro';
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=400&h=400&fit=crop' WHERE name = 'iPhone 15';
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=400&h=400&fit=crop' WHERE name = 'iPhone 14';

-- Apple Laptop Products
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=400&h=400&fit=crop' WHERE name LIKE 'MacBook Pro%';
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=400&h=400&fit=crop' WHERE name LIKE 'MacBook Air%';

-- Apple Tablet Products
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&h=400&fit=crop' WHERE name LIKE 'iPad%';

-- Apple Audio Products
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=400&h=400&fit=crop' WHERE name LIKE '%AirPods%';

-- Samsung Products
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop' WHERE brand = 'Samsung' AND category = 'Smartphones';
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&h=400&fit=crop' WHERE brand = 'Samsung' AND category = 'Tablets';

-- Nike Products
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop' WHERE brand = 'Nike';

-- Adidas Products
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop' WHERE brand = 'Adidas';

-- Tesla Products
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=400&h=400&fit=crop' WHERE brand = 'Tesla';

-- Laptop Products (All Brands)
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=400&h=400&fit=crop' WHERE category = 'Laptops';

-- Tablet Products (All Brands)
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&h=400&fit=crop' WHERE category = 'Tablets';

-- Audio Products (All Brands)
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop' WHERE category = 'Audio';

-- Smartphone Products (Other Brands)
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop' 
WHERE category = 'Smartphones' AND brand NOT IN ('Apple', 'Samsung');

-- Footwear Products (Other Brands)
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop' 
WHERE category = 'Footwear' AND brand NOT IN ('Nike', 'Adidas');

-- Verify the update
SELECT 
    id, 
    name, 
    brand, 
    category,
    CASE 
        WHEN image_url LIKE '%unsplash%' THEN 'Real Image'
        WHEN image_url LIKE '%placeholder%' THEN 'Placeholder'
        ELSE 'Other'
    END as image_type,
    SUBSTRING(image_url, 1, 60) as image_url_preview
FROM products 
WHERE status = 'active'
ORDER BY id
LIMIT 30;

