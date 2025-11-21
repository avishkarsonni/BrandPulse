-- Add image URLs to all products in the database
-- This script updates products that don't have image_url set

-- Update products with placeholder images based on brand and category
UPDATE products 
SET image_url = CASE
    -- Apple products
    WHEN brand = 'Apple' AND category = 'Smartphones' THEN CONCAT('https://via.placeholder.com/300x300/007AFF/FFFFFF?text=', REPLACE(name, ' ', '+'))
    WHEN brand = 'Apple' AND category = 'Laptops' THEN CONCAT('https://via.placeholder.com/300x300/007AFF/FFFFFF?text=', REPLACE(name, ' ', '+'))
    WHEN brand = 'Apple' AND category = 'Tablets' THEN CONCAT('https://via.placeholder.com/300x300/007AFF/FFFFFF?text=', REPLACE(name, ' ', '+'))
    WHEN brand = 'Apple' AND category = 'Audio' THEN CONCAT('https://via.placeholder.com/300x300/000000/FFFFFF?text=', REPLACE(name, ' ', '+'))
    
    -- Samsung products
    WHEN brand = 'Samsung' AND category = 'Smartphones' THEN CONCAT('https://via.placeholder.com/300x300/1428A0/FFFFFF?text=', REPLACE(name, ' ', '+'))
    WHEN brand = 'Samsung' AND category = 'Tablets' THEN CONCAT('https://via.placeholder.com/300x300/1428A0/FFFFFF?text=', REPLACE(name, ' ', '+'))
    
    -- Nike products
    WHEN brand = 'Nike' THEN CONCAT('https://via.placeholder.com/300x300/000000/FFFFFF?text=', REPLACE(name, ' ', '+'))
    
    -- Adidas products
    WHEN brand = 'Adidas' THEN CONCAT('https://via.placeholder.com/300x300/000000/FFFFFF?text=', REPLACE(name, ' ', '+'))
    
    -- Tesla products
    WHEN brand = 'Tesla' THEN CONCAT('https://via.placeholder.com/300x300/E31937/FFFFFF?text=', REPLACE(name, ' ', '+'))
    
    -- Dell products
    WHEN brand = 'Dell' THEN CONCAT('https://via.placeholder.com/300x300/007DB8/FFFFFF?text=', REPLACE(name, ' ', '+'))
    
    -- HP products
    WHEN brand = 'HP' THEN CONCAT('https://via.placeholder.com/300x300/0096D6/FFFFFF?text=', REPLACE(name, ' ', '+'))
    
    -- Sony products
    WHEN brand = 'Sony' THEN CONCAT('https://via.placeholder.com/300x300/000000/FFFFFF?text=', REPLACE(name, ' ', '+'))
    
    -- Microsoft products
    WHEN brand = 'Microsoft' THEN CONCAT('https://via.placeholder.com/300x300/0078D4/FFFFFF?text=', REPLACE(name, ' ', '+'))
    
    -- Acer products
    WHEN brand = 'Acer' THEN CONCAT('https://via.placeholder.com/300x300/83B81A/FFFFFF?text=', REPLACE(name, ' ', '+'))
    
    -- MSI products
    WHEN brand = 'MSI' THEN CONCAT('https://via.placeholder.com/300x300/FF0000/FFFFFF?text=', REPLACE(name, ' ', '+'))
    
    -- Motorola products
    WHEN brand = 'Motorola' THEN CONCAT('https://via.placeholder.com/300x300/000000/FFFFFF?text=', REPLACE(name, ' ', '+'))
    
    -- Realme products
    WHEN brand = 'Realme' THEN CONCAT('https://via.placeholder.com/300x300/FF6900/FFFFFF?text=', REPLACE(name, ' ', '+'))
    
    -- Puma products
    WHEN brand = 'Puma' THEN CONCAT('https://via.placeholder.com/300x300/000000/FFFFFF?text=', REPLACE(name, ' ', '+'))
    
    -- Beats products
    WHEN brand = 'Beats' THEN CONCAT('https://via.placeholder.com/300x300/000000/FFFFFF?text=', REPLACE(name, ' ', '+'))
    
    -- Default for other products
    ELSE CONCAT('https://via.placeholder.com/300x300/666666/FFFFFF?text=', REPLACE(name, ' ', '+'))
END
WHERE image_url IS NULL OR image_url = '' OR image_url = 'NULL';

-- Verify the update
SELECT id, name, brand, category, image_url 
FROM products 
WHERE image_url IS NOT NULL AND image_url != ''
ORDER BY id
LIMIT 20;

