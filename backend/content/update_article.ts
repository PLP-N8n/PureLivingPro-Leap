import { api, APIError } from "encore.dev/api";
import { contentDB } from "./db";
import type { UpdateArticleRequest, Article } from "./types";

interface UpdateArticleParams {
  id: number;
}

// Updates an existing article.
export const updateArticle = api<UpdateArticleParams & UpdateArticleRequest, Article>(
  { expose: true, method: "PUT", path: "/articles/by-id/:id" },
  async ({ id, ...req }) => {
    // Check if article exists
    const existingArticle = await contentDB.queryRow`
      SELECT id FROM articles WHERE id = ${id}
    `;

    if (!existingArticle) {
      throw APIError.notFound("Article not found");
    }

    // Build update query dynamically
    const updates: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (req.title !== undefined) {
      updates.push(`title = $${paramIndex++}`);
      params.push(req.title);
    }

    if (req.content !== undefined) {
      updates.push(`content = $${paramIndex++}`);
      params.push(req.content);
    }

    if (req.excerpt !== undefined) {
      updates.push(`excerpt = $${paramIndex++}`);
      params.push(req.excerpt);
    }

    if (req.featuredImageUrl !== undefined) {
      updates.push(`featured_image_url = $${paramIndex++}`);
      params.push(req.featuredImageUrl);
    }

    if (req.categoryId !== undefined) {
      updates.push(`category_id = $${paramIndex++}`);
      params.push(req.categoryId);
    }

    if (req.published !== undefined) {
      updates.push(`published = $${paramIndex++}`);
      params.push(req.published);
    }

    if (req.featured !== undefined) {
      updates.push(`featured = $${paramIndex++}`);
      params.push(req.featured);
    }

    if (req.seoMeta !== undefined) {
      updates.push(`seo_meta = $${paramIndex++}`);
      params.push(JSON.stringify(req.seoMeta));
    }

    if (req.affiliateBlocks !== undefined) {
      updates.push(`affiliate_blocks = $${paramIndex++}`);
      params.push(JSON.stringify(req.affiliateBlocks));
    }

    if (req.wpPostId !== undefined) {
      updates.push(`wp_post_id = $${paramIndex++}`);
      params.push(req.wpPostId);
    }

    if (req.mediumPostId !== undefined) {
      updates.push(`medium_post_id = $${paramIndex++}`);
      params.push(req.mediumPostId);
    }

    if (updates.length > 0) {
      updates.push(`updated_at = NOW()`);
      
      const updateQuery = `
        UPDATE articles 
        SET ${updates.join(", ")}
        WHERE id = $${paramIndex++}
      `;
      params.push(id);

      await contentDB.rawExec(updateQuery, ...params);
    }

    // Update tags if provided
    if (req.tagIds !== undefined) {
      // Remove existing tags
      await contentDB.exec`DELETE FROM article_tags WHERE article_id = ${id}`;
      
      // Add new tags
      for (const tagId of req.tagIds) {
        await contentDB.exec`
          INSERT INTO article_tags (article_id, tag_id) VALUES (${id}, ${tagId})
        `;
      }
    }

    // Return updated article
    const article = await contentDB.queryRow<Article>`
      SELECT 
        id, title, slug, content, excerpt, featured_image_url as "featuredImageUrl",
        category_id as "categoryId", author_name as "authorName", author_email as "authorEmail",
        published, featured, view_count as "viewCount", wp_post_id as "wpPostId", 
        medium_post_id as "mediumPostId", seo_meta as "seoMeta", affiliate_blocks as "affiliateBlocks",
        created_at as "createdAt", updated_at as "updatedAt"
      FROM articles WHERE id = ${id}
    `;

    if (!article) {
      throw APIError.internal("Failed to retrieve updated article");
    }

    return article;
  }
);
