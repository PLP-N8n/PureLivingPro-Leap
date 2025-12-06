-- Add pipeline runs tracking
CREATE TABLE IF NOT EXISTS pipeline_runs (
  id BIGSERIAL PRIMARY KEY,
  topics TEXT[] NOT NULL,
  successful INT NOT NULL DEFAULT 0,
  failed INT NOT NULL DEFAULT 0,
  auto_publish BOOLEAN NOT NULL DEFAULT false,
  platforms JSONB,
  results JSONB,
  ran_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add Amazon sync runs tracking
CREATE TABLE IF NOT EXISTS amazon_sync_runs (
  id BIGSERIAL PRIMARY KEY,
  categories_searched INT NOT NULL DEFAULT 0,
  products_found INT NOT NULL DEFAULT 0,
  products_imported INT NOT NULL DEFAULT 0,
  products_updated INT NOT NULL DEFAULT 0,
  errors JSONB,
  ran_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add automation schedules table
CREATE TABLE IF NOT EXISTS automation_schedules (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL, -- 'content_generation', 'amazon_sync', etc.
  cron_expression TEXT NOT NULL,
  config JSONB,
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_run_at TIMESTAMPTZ,
  next_run_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);