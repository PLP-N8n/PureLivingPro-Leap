CREATE TABLE affiliate_programs (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  commission_rate DOUBLE PRECISION NOT NULL DEFAULT 0.0,
  cookie_duration INTEGER DEFAULT 30, -- days
  tracking_domain TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE affiliate_products (
  id BIGSERIAL PRIMARY KEY,
  program_id BIGINT REFERENCES affiliate_programs(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price DOUBLE PRECISION,
  original_url TEXT NOT NULL,
  image_url TEXT,
  category TEXT,
  tags TEXT[],
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE affiliate_links (
  id BIGSERIAL PRIMARY KEY,
  product_id BIGINT REFERENCES affiliate_products(id) ON DELETE CASCADE,
  short_code TEXT NOT NULL UNIQUE,
  original_url TEXT NOT NULL,
  tracking_params JSONB,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE affiliate_clicks (
  id BIGSERIAL PRIMARY KEY,
  link_id BIGINT REFERENCES affiliate_links(id) ON DELETE CASCADE,
  ip_address INET,
  user_agent TEXT,
  referrer TEXT,
  session_id TEXT,
  country TEXT,
  device_type TEXT,
  clicked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE affiliate_conversions (
  id BIGSERIAL PRIMARY KEY,
  click_id BIGINT REFERENCES affiliate_clicks(id),
  product_id BIGINT REFERENCES affiliate_products(id),
  conversion_value DOUBLE PRECISION,
  commission_earned DOUBLE PRECISION,
  conversion_type TEXT DEFAULT 'sale', -- sale, lead, signup
  external_order_id TEXT,
  converted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_affiliate_links_short_code ON affiliate_links(short_code);
CREATE INDEX idx_affiliate_clicks_link_id ON affiliate_clicks(link_id);
CREATE INDEX idx_affiliate_clicks_clicked_at ON affiliate_clicks(clicked_at DESC);
CREATE INDEX idx_affiliate_conversions_click_id ON affiliate_conversions(click_id);
CREATE INDEX idx_affiliate_conversions_converted_at ON affiliate_conversions(converted_at DESC);
