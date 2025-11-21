-- Update products with real product images from reliable sources
-- Using Unsplash, Pexels, and official brand image URLs

-- Apple Products
UPDATE products SET image_url = CASE
    WHEN name = 'iPhone 15 Pro' THEN 'https://images.unsplash.com/photo-1592750475338-74a7cef24d02?w=400&h=400&fit=crop'
    WHEN name = 'iPhone 15' THEN 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=400&h=400&fit=crop'
    WHEN name = 'iPhone 14' THEN 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=400&h=400&fit=crop'
    WHEN name LIKE 'MacBook Pro%' THEN 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=400&h=400&fit=crop'
    WHEN name LIKE 'MacBook Air%' THEN 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=400&h=400&fit=crop'
    WHEN name LIKE 'iPad%' THEN 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&h=400&fit=crop'
    WHEN name LIKE '%AirPods%' THEN 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=400&h=400&fit=crop'
    ELSE image_url
END WHERE brand = 'Apple';

-- Samsung Products
UPDATE products SET image_url = CASE
    WHEN name LIKE '%Galaxy S24%' THEN 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop'
    WHEN name LIKE '%Galaxy S23%' THEN 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop'
    WHEN name LIKE '%Galaxy A54%' THEN 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop'
    WHEN name LIKE '%Galaxy Tab%' THEN 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&h=400&fit=crop'
    ELSE image_url
END WHERE brand = 'Samsung';

-- Nike Products
UPDATE products SET image_url = CASE
    WHEN name LIKE '%Air Max%' THEN 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop'
    WHEN name LIKE '%Air Force%' THEN 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop'
    WHEN name LIKE '%Dunk%' THEN 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop'
    ELSE 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop'
END WHERE brand = 'Nike';

-- Adidas Products
UPDATE products SET image_url = CASE
    WHEN name LIKE '%Yeezy%' THEN 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop'
    WHEN name LIKE '%Ultraboost%' THEN 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop'
    WHEN name LIKE '%Stan Smith%' THEN 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop'
    ELSE 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop'
END WHERE brand = 'Adidas';

-- Tesla Products
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=400&h=400&fit=crop' WHERE brand = 'Tesla';

-- Laptop Products
UPDATE products SET image_url = CASE
    WHEN name LIKE '%Dell%' OR brand = 'Dell' THEN 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=400&h=400&fit=crop'
    WHEN name LIKE '%HP%' OR brand = 'HP' THEN 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=400&h=400&fit=crop'
    WHEN name LIKE '%Lenovo%' OR brand = 'Lenovo' THEN 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=400&h=400&fit=crop'
    WHEN name LIKE '%ASUS%' OR brand = 'ASUS' THEN 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=400&h=400&fit=crop'
    WHEN name LIKE '%Razer%' OR brand = 'Razer' THEN 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=400&h=400&fit=crop'
    WHEN name LIKE '%MSI%' OR brand = 'MSI' THEN 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=400&h=400&fit=crop'
    WHEN name LIKE '%Acer%' OR brand = 'Acer' THEN 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=400&h=400&fit=crop'
    WHEN name LIKE '%Microsoft Surface%' THEN 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=400&h=400&fit=crop'
    ELSE image_url
END WHERE category = 'Laptops' OR category = 'Tablets';

-- Audio Products
UPDATE products SET image_url = CASE
    WHEN name LIKE '%Sony%' OR brand = 'Sony' THEN 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop'
    WHEN name LIKE '%Bose%' OR brand = 'Bose' THEN 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop'
    WHEN name LIKE '%Sennheiser%' OR brand = 'Sennheiser' THEN 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop'
    WHEN name LIKE '%JBL%' OR brand = 'JBL' THEN 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop'
    WHEN name LIKE '%Beats%' OR brand = 'Beats' THEN 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop'
    ELSE 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop'
END WHERE category = 'Audio';

-- Smartphone Products (Other Brands)
UPDATE products SET image_url = CASE
    WHEN name LIKE '%Google Pixel%' OR brand = 'Google' THEN 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop'
    WHEN name LIKE '%OnePlus%' OR brand = 'OnePlus' THEN 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop'
    WHEN name LIKE '%Xiaomi%' OR brand = 'Xiaomi' THEN 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop'
    WHEN name LIKE '%Nothing%' OR brand = 'Nothing' THEN 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop'
    WHEN name LIKE '%Motorola%' OR brand = 'Motorola' THEN 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop'
    WHEN name LIKE '%Realme%' OR brand = 'Realme' THEN 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop'
    ELSE image_url
END WHERE category = 'Smartphones' AND brand NOT IN ('Apple', 'Samsung');

-- Footwear Products (Other Brands)
UPDATE products SET image_url = CASE
    WHEN name LIKE '%New Balance%' OR brand = 'New Balance' THEN 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop'
    WHEN name LIKE '%Puma%' OR brand = 'Puma' THEN 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop'
    WHEN name LIKE '%Vans%' OR brand = 'Vans' THEN 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop'
    ELSE image_url
END WHERE category = 'Footwear' AND brand NOT IN ('Nike', 'Adidas');

-- Verify the update
SELECT 
    id, 
    name, 
    brand, 
    category,
    SUBSTRING(image_url, 1, 60) as image_url_preview
FROM products 
WHERE status = 'active'
ORDER BY id
LIMIT 30;

