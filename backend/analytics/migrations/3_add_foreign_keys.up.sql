-- Add foreign key constraints for analytics tables
ALTER TABLE page_views 
  ADD CONSTRAINT fk_page_views_article_id 
  FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE SET NULL;