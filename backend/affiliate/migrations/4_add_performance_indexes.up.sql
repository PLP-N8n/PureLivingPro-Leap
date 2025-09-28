-- Performance indexes for affiliate product queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_affiliate_products_category ON affiliate_products(category);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_affiliate_products_is_active ON affiliate_products(is_active);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_affiliate_products_program_id ON affiliate_products(program_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_affiliate_products_price ON affiliate_products(price DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_affiliate_products_created_at ON affiliate_products(created_at DESC);

-- Composite indexes for common product filtering
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_affiliate_products_active_category ON affiliate_products(is_active, category) WHERE is_active = true;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_affiliate_products_active_program ON affiliate_products(is_active, program_id) WHERE is_active = true;

-- Full-text search for products
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_affiliate_products_name_gin ON affiliate_products USING GIN(to_tsvector('english', name));
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_affiliate_products_description_gin ON affiliate_products USING GIN(to_tsvector('english', description));

-- Tags array index for products
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_affiliate_products_tags_gin ON affiliate_products USING GIN(tags);

-- Click tracking performance indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_affiliate_clicks_session_id ON affiliate_clicks(session_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_affiliate_clicks_ip_address ON affiliate_clicks(ip_address);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_affiliate_clicks_country ON affiliate_clicks(country);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_affiliate_clicks_device_type ON affiliate_clicks(device_type);

-- Composite indexes for click analytics
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_affiliate_clicks_link_date ON affiliate_clicks(link_id, clicked_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_affiliate_clicks_date_country ON affiliate_clicks(clicked_at DESC, country);

-- Conversion tracking indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_affiliate_conversions_product_id ON affiliate_conversions(product_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_affiliate_conversions_conversion_type ON affiliate_conversions(conversion_type);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_affiliate_conversions_value ON affiliate_conversions(conversion_value DESC);

-- Composite conversion analytics indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_affiliate_conversions_product_date ON affiliate_conversions(product_id, converted_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_affiliate_conversions_type_date ON affiliate_conversions(conversion_type, converted_at DESC);

-- Affiliate program performance indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_affiliate_programs_is_active ON affiliate_programs(is_active);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_affiliate_programs_commission_rate ON affiliate_programs(commission_rate DESC);

-- Link performance indexes  
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_affiliate_links_is_active ON affiliate_links(is_active);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_affiliate_links_product_active ON affiliate_links(product_id, is_active) WHERE is_active = true;