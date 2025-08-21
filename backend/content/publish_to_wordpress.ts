import { api, APIError } from "encore.dev/api";
import { contentDB } from "./db";
import { createWordPressPost, updateWordPressPost } from "../integrations/wordpress";
import { wordpressUrl, wordpressUsername, wordpressPassword } from "./secrets";

interface PublishToWordPressRequest {
  articleId: number;
  wordpressPostId?: number;
  status?: 'draft' | 'publish';
}

interface PublishToWordPressResponse {
  wordpressPostId: number;
  wordpressUrl: string;
  status: string;
}

// Publishes an article to WordPress.
export const publishToWordPress = api<PublishToWordPressRequest, PublishToWordPressResponse>(
  { expose: true, method: "POST", path: "/content/publish-to-wordpress" },
  async (req) => {
    // Get article from database
    const article = await contentDB.queryRow<{
      title: string;
      content: string;
      excerpt?: string;
      categoryName?: string;
    }>`
      SELECT 
        a.title, a.content, a.excerpt,
        c.name as "categoryName"
      FROM articles a
      LEFT JOIN categories c ON a.category_id = c.id
      WHERE a.id = ${req.articleId}
    `;

    if (!article) {
      throw APIError.notFound("Article not found");
    }

    // Add affiliate disclosure to content
    const contentWithDisclosure = `
      ${article.content}
      
      <div class="affiliate-disclosure" style="background: #f9f9f9; padding: 15px; border-left: 4px solid #ff9800; margin: 20px 0;">
        <p><strong>Affiliate Disclosure:</strong> This post contains affiliate links. If you purchase through these links, we may earn a commission at no additional cost to you. We only recommend products we believe will benefit your health journey.</p>
      </div>
    `;

    try {
      let wordpressResponse;
      const creds = {
        baseUrl: wordpressUrl(),
        username: wordpressUsername(),
        password: wordpressPassword(),
      };

      if (req.wordpressPostId) {
        // Update existing WordPress post
        wordpressResponse = await updateWordPressPost(creds, req.wordpressPostId, {
          title: article.title,
          content: contentWithDisclosure,
          excerpt: article.excerpt,
          status: req.status || 'draft'
        });
      } else {
        // Create new WordPress post
        wordpressResponse = await createWordPressPost(creds, {
          title: article.title,
          content: contentWithDisclosure,
          excerpt: article.excerpt,
          status: req.status || 'draft'
        });
      }

      // Update article with WordPress info
      await contentDB.exec`
        UPDATE articles 
        SET 
          updated_at = NOW()
        WHERE id = ${req.articleId}
      `;

      return {
        wordpressPostId: wordpressResponse.id,
        wordpressUrl: wordpressResponse.link,
        status: wordpressResponse.status
      };
    } catch (error) {
      console.error('WordPress publishing error:', error);
      throw APIError.internal("Failed to publish to WordPress");
    }
  }
);
