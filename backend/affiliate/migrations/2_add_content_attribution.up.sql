-- Add content attribution to track which content led to clicks
-- Use IF NOT EXISTS to avoid errors if columns already exist
ALTER TABLE affiliate_clicks ADD COLUMN IF NOT EXISTS content_id TEXT;

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
SELECT * FROM (VALUES
  (1, 'Organic Multivitamin Complex', 'Complete daily multivitamin with organic ingredients', 29.99, 'https://amazon.com/dp/example1', 'https://example.com/multivitamin.jpg', 'supplements', ARRAY['vitamins', 'organic', 'daily'], true),
  (2, 'Plant-Based Protein Powder', 'High-quality plant protein for fitness enthusiasts', 39.99, 'https://iherb.com/example2', 'https://example.com/protein.jpg', 'fitness', ARRAY['protein', 'plant-based', 'fitness'], true),
  (3, 'Omega-3 Fish Oil', 'Premium omega-3 supplement for heart health', 24.99, 'https://vitacost.com/example3', 'https://example.com/omega3.jpg', 'supplements', ARRAY['omega-3', 'heart-health', 'fish-oil'], true),
  (4, 'Organic Green Tea', 'Premium organic green tea for wellness', 19.99, 'https://thrivemarket.com/example4', 'https://example.com/greentea.jpg', 'wellness', ARRAY['tea', 'organic', 'antioxidants'], true)
) AS v(program_id, name, description, price, original_url, image_url, category, tags, is_active)
WHERE NOT EXISTS (SELECT 1 FROM affiliate_products WHERE affiliate_products.name = v.name);
