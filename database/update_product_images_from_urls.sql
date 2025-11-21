-- Update Product Images with URLs provided by user
-- Note: These are product page URLs, not direct image URLs
-- For proper image rendering, we need direct image file URLs (ending in .jpg, .png, etc.)

-- SMARTPHONES
UPDATE products SET image_url = 'https://www.apple.com/in/iphone-15-pro/' WHERE id = 1;  -- iPhone 15 Pro - Apple
UPDATE products SET image_url = 'https://www.samsung.com/in/smartphones/galaxy-s24-ultra/' WHERE id = 2;  -- Samsung Galaxy S24 Ultra
UPDATE products SET image_url = 'https://store.google.com/product/pixel_8_pro' WHERE id = 6;  -- Google Pixel 8 Pro
UPDATE products SET image_url = 'https://www.apple.com/in/iphone-15/' WHERE id = 11; -- iPhone 15 - Apple
UPDATE products SET image_url = 'https://www.samsung.com/in/smartphones/galaxy-s23-ultra/' WHERE id = 12; -- Samsung Galaxy S23 Ultra
UPDATE products SET image_url = 'https://www.oneplus.com/global/oneplus-12' WHERE id = 13; -- OnePlus 12
UPDATE products SET image_url = 'https://www.mi.com/global/product/xiaomi-14-pro' WHERE id = 14; -- Xiaomi 14 Pro
UPDATE products SET image_url = 'https://nothing.tech/phone-2' WHERE id = 15; -- Nothing Phone 2
UPDATE products SET image_url = 'https://www.apple.com/in/iphone-14/' WHERE id = 36; -- iPhone 14 - Apple
UPDATE products SET image_url = 'https://www.samsung.com/in/smartphones/galaxy-a54-5g/' WHERE id = 37; -- Samsung Galaxy A54
UPDATE products SET image_url = 'https://www.motorola.in/smartphones-motorola-edge-40/p' WHERE id = 38; -- Motorola Edge 40
UPDATE products SET image_url = 'https://www.realme.com/global/realme-gt-5' WHERE id = 39; -- Realme GT 5

-- LAPTOPS
UPDATE products SET image_url = 'https://www.apple.com/in/shop/buy-mac/macbook-pro' WHERE id = 4;  -- MacBook Pro M3 - Apple
UPDATE products SET image_url = 'https://www.microsoft.com/en-us/surface' WHERE id = 7;  -- Microsoft Surface Laptop 5
UPDATE products SET image_url = 'https://www.dell.com/en-in/shop/laptops/xps-15-9530-laptop/spd/xps-15-9530-laptop' WHERE id = 16; -- Dell XPS 15
UPDATE products SET image_url = 'https://www.hp.com/in-en/shop/collections/spectre' WHERE id = 17; -- HP Spectre x360
UPDATE products SET image_url = 'https://www.lenovo.com/in/en/laptops/thinkpad/thinkpad-x1/' WHERE id = 18; -- Lenovo ThinkPad X1 Carbon
UPDATE products SET image_url = 'https://rog.asus.com/laptops/rog-zephyrus/rog-zephyrus-g14-series/' WHERE id = 19; -- ASUS ROG Zephyrus G14
UPDATE products SET image_url = 'https://www.razer.com/gaming-laptops/razer-blade' WHERE id = 20; -- Razer Blade 15
UPDATE products SET image_url = 'https://www.apple.com/in/macbook-air-m2/' WHERE id = 40; -- MacBook Air M2 - Apple
UPDATE products SET image_url = 'https://www.dell.com/en-in/shop/laptops/inspiron-15-laptops/sr/laptops/inspiron-15' WHERE id = 41; -- Dell Inspiron 15
UPDATE products SET image_url = 'https://www.acer.com/ac/en/US/content/predator-model/' WHERE id = 42; -- Acer Predator Helios
UPDATE products SET image_url = 'https://www.msi.com/Laptop/Stealth-16-Series' WHERE id = 43; -- MSI Stealth 16

-- TABLETS
UPDATE products SET image_url = 'https://www.apple.com/in/ipad-pro/' WHERE id = 10; -- iPad Pro 12.9" - Apple
UPDATE products SET image_url = 'https://www.samsung.com/in/tablets/galaxy-tab-s9/' WHERE id = 29; -- Samsung Galaxy Tab S9
UPDATE products SET image_url = 'https://www.apple.com/in/ipad-air/' WHERE id = 30; -- iPad Air - Apple
UPDATE products SET image_url = 'https://www.apple.com/in/ipad-mini/' WHERE id = 50; -- iPad Mini - Apple
UPDATE products SET image_url = 'https://www.microsoft.com/en-us/surface/devices/surface-pro-9' WHERE id = 51; -- Microsoft Surface Pro 9

-- AUDIO
UPDATE products SET image_url = 'https://www.sony.co.in/electronics/headband-headphones/wh-1000xm5' WHERE id = 8;  -- Sony WH-1000XM5
UPDATE products SET image_url = 'https://www.apple.com/in/airpods-pro/' WHERE id = 21; -- AirPods Pro 2 - Apple
UPDATE products SET image_url = 'https://www.bose.co.in/en_in/products/headphones/over_ear_headphones/quietcomfort-45.html' WHERE id = 22; -- Bose QuietComfort 45
UPDATE products SET image_url = 'https://www.sennheiser.com/momentum-4-wireless/' WHERE id = 23; -- Sennheiser Momentum 4
UPDATE products SET image_url = 'https://www.jbl.com/portable-speakers/FLIP+SERIES/' WHERE id = 24; -- JBL Flip 6
UPDATE products SET image_url = 'https://www.sony.co.in/electronics/truly-wireless/wf-1000xm5' WHERE id = 44; -- Sony WF-1000XM5
UPDATE products SET image_url = 'https://www.apple.com/in/airpods/' WHERE id = 45; -- Apple AirPods 3
UPDATE products SET image_url = 'https://www.beatsbydre.com/headphones/studio-pro' WHERE id = 46; -- Beats Studio Pro

-- FOOTWEAR
UPDATE products SET image_url = 'https://www.nike.com/in/w/air-max-270-shoes-5ix6dzy7ok' WHERE id = 3;  -- Nike Air Max 270
UPDATE products SET image_url = 'https://www.adidas.co.in' WHERE id = 9;  -- Adidas Ultraboost 22
UPDATE products SET image_url = 'https://www.nike.com/in/w/air-force-1-shoes-3n82yznik1' WHERE id = 25; -- Nike Air Force 1
UPDATE products SET image_url = 'https://www.adidas.co.in/stan_smith' WHERE id = 26; -- Adidas Stan Smith
UPDATE products SET image_url = 'https://www.newbalance.com' WHERE id = 27; -- New Balance 990v5
UPDATE products SET image_url = 'https://www.vans.in/shop/en/vans-in/men-shoes-old-skool' WHERE id = 28; -- Vans Old Skool
UPDATE products SET image_url = 'https://www.nike.com/in/w/dunk-low-shoes-8g1epznik1' WHERE id = 47; -- Nike Dunk Low
UPDATE products SET image_url = 'https://www.adidas.co.in/yeezy' WHERE id = 48; -- Adidas Yeezy 350
UPDATE products SET image_url = 'https://in.puma.com/in/en/pd/rs-x-series/' WHERE id = 49; -- Puma RS-X

-- VEHICLES
UPDATE products SET image_url = 'https://www.tesla.com/modely' WHERE id = 5;  -- Tesla Model Y
UPDATE products SET image_url = 'https://www.tesla.com/model3' WHERE id = 31; -- Tesla Model 3
UPDATE products SET image_url = 'https://www.ford.com/trucks/f150/f150-lightning/' WHERE id = 32; -- Ford F-150 Lightning

-- WEARABLES
UPDATE products SET image_url = 'https://www.apple.com/in/apple-watch-series-9/' WHERE id = 33; -- Apple Watch Series 9
UPDATE products SET image_url = 'https://www.samsung.com/in/wearables/galaxy-watch6/' WHERE id = 34; -- Samsung Galaxy Watch 6
UPDATE products SET image_url = 'https://www.garmin.com/en-IN/p/102913' WHERE id = 35; -- Garmin Fenix 7

-- Verify the update
SELECT id, name, brand, SUBSTRING(image_url, 1, 70) as image_url FROM products WHERE status = 'active' ORDER BY id LIMIT 20;

