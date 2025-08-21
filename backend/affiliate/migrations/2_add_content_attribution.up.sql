-- Add content attribution to track which content led to clicks
-- Use IF NOT EXISTS to avoid errors if columns already exist
ALTER TABLE affiliate_clicks ADD COLUMN IF NOT EXISTS content_id TEXT;
ALTER TABLE affiliate_clicks ADD COLUMN IF NOT EXISTS country TEXT;

-- Add indexes for better performance (only if they don't exist)
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_content_id ON affiliate_clicks(content_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_country ON affiliate_clicks(country);

-- Add affiliate programs sample data (only if they don't exist)
INSERT INTO affiliate_programs (name, description, commission_rate, cookie_duration, is_active) 
SELECT * FROM (VALUES
  ('Amazon Associates', 'Amazon affiliate program for health and wellness products', 4.0, 24, true),
  ('iHerb', 'Natural health products and supplements', 10.0, 30, true),
  ('Vitacost', 'Vitamins, supplements and health products', 8.0, 30, true),
  ('Thrive Market', 'Organic and natural products marketplace', 12.0, 30, true)
) AS v(name, description, commission_rate, cookie_duration, is_active)
WHERE NOT EXISTS (SELECT 1 FROM affiliate_programs WHERE affiliate_programs.name = v.name);

-- Add sample products (only if they don't exist)
INSERT INTO affiliate_products (program_id, name, description, price, original_url, image_url, category, tags, is_active)
SELECT p.id, v.name, v.description, v.price, v.original_url, v.image_url, v.category, v.tags, v.is_active
FROM (VALUES
  ('Amazon Associates', 'Organic Multivitamin Complex', 'Complete daily multivitamin with organic ingredients', 29.99, 'https://amazon.com/dp/example1', 'https://images.unsplash.com/photo-1607619056574-7d8d3ee536b2?w=400', 'supplements', ARRAY['vitamins', 'organic', 'daily'], true),
  ('iHerb', 'Plant-Based Protein Powder', 'High-quality plant protein for fitness enthusiasts', 39.99, 'https://iherb.com/example2', 'https://images.unsplash.com/photo-1543353071-873f6b6a6a89?w=400', 'fitness', ARRAY['protein', 'plant-based', 'fitness'], true),
  ('Vitacost', 'Omega-3 Fish Oil', 'Premium omega-3 supplement for heart health', 24.99, 'https://vitacost.com/example3', 'https://images.unsplash.com/photo-1627485695003-3380847a461a?w=400', 'supplements', ARRAY['omega-3', 'heart-health', 'fish-oil'], true),
  ('Thrive Market', 'Organic Green Tea', 'Premium organic green tea for wellness', 19.99, 'https://thrivemarket.com/example4', 'https://images.unsplash.com/photo-1576092762791-d67b99ea27b2?w=400', 'wellness', ARRAY['tea', 'organic', 'antioxidants'], true)
) AS v(program_name, name, description, price, original_url, image_url, category, tags, is_active)
JOIN affiliate_programs p ON p.name = v.program_name
WHERE NOT EXISTS (SELECT 1 FROM affiliate_products WHERE affiliate_products.name = v.name);
