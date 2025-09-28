-- Performance indexes for content queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_articles_slug ON articles(slug);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_articles_view_count ON articles(view_count DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_articles_author_email ON articles(author_email);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_articles_updated_at ON articles(updated_at DESC);

-- Composite indexes for common query patterns
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_articles_published_featured ON articles(published, featured) WHERE published = true;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_articles_published_created ON articles(published, created_at DESC) WHERE published = true;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_articles_category_published ON articles(category_id, published, created_at DESC) WHERE published = true;

-- Full-text search indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_articles_title_gin ON articles USING GIN(to_tsvector('english', title));
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_articles_content_gin ON articles USING GIN(to_tsvector('english', content));
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_articles_excerpt_gin ON articles USING GIN(to_tsvector('english', excerpt));

-- Category and tag performance indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tags_slug ON tags(slug);

-- Article tags junction table indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_article_tags_tag_id ON article_tags(tag_id);