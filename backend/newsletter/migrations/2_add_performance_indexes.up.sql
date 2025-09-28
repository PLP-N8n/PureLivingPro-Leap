-- Performance indexes for newsletter subscriptions
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_subscriptions_email ON subscriptions(email);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_subscriptions_is_active ON subscriptions(is_active);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_subscriptions_created_at ON subscriptions(created_at DESC);

-- Composite index for active subscribers
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_subscriptions_active_created ON subscriptions(is_active, created_at DESC) WHERE is_active = true;