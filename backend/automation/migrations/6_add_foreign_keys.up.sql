-- Add foreign key constraints for automation tables
ALTER TABLE content_pipeline 
  ADD CONSTRAINT fk_content_pipeline_published_article_id 
  FOREIGN KEY (published_article_id) REFERENCES articles(id) ON DELETE SET NULL;

ALTER TABLE affiliate_link_health 
  ADD CONSTRAINT fk_affiliate_link_health_affiliate_link_id 
  FOREIGN KEY (affiliate_link_id) REFERENCES affiliate_links(id) ON DELETE CASCADE;

ALTER TABLE social_media_posts 
  ADD CONSTRAINT fk_social_media_posts_article_id 
  FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE SET NULL;