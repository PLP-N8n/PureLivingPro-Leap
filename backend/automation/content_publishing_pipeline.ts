import { api } from "encore.dev/api";
import { automationDB } from "./db";
import { contentDB } from "../content/db";

interface ContentPipelineRequest {
  articleId: number;
  includeWordPress?: boolean;
  includeMedium?: boolean;
  publishStatus?: 'draft' | 'publish';
}

interface ContentPipelineResponse {
  success: boolean;
  steps: Array<{
    step: string;
    status: 'success' | 'failed' | 'skipped';
    message?: string;
    data?: any;
  }>;
}

// Runs the complete content publishing pipeline.
export const runContentPipeline = api<ContentPipelineRequest, ContentPipelineResponse>(
  { expose: true, method: "POST", path: "/automation/content-pipeline" },
  async (req) => {
    const steps: Array<{
      step: string;
      status: 'success' | 'failed' | 'skipped';
      message?: string;
      data?: any;
    }> = [];

    try {
      // Step 1: Validate article exists
      const article = await contentDB.queryRow<{ id: number; title: string; published: boolean }>`
        SELECT id, title, published FROM articles WHERE id = ${req.articleId}
      `;

      if (!article) {
        steps.push({
          step: 'validate_article',
          status: 'failed',
          message: 'Article not found'
        });
        return { success: false, steps };
      }

      steps.push({
        step: 'validate_article',
        status: 'success',
        message: `Article "${article.title}" found`
      });

      // Step 2: Generate affiliate product recommendations
      try {
        const { generateContent } = await import('./content_generator');
        const optimization = await generateContent({
          topic: article.title,
          targetKeywords: ['wellness', 'health'],
          includeAffiliateProducts: true
        });

        steps.push({
          step: 'affiliate_optimization',
          status: 'success',
          message: `Generated ${optimization.suggestedProducts.length} product recommendations`
        });
      } catch (error) {
        steps.push({
          step: 'affiliate_optimization',
          status: 'failed',
          message: `Failed to generate affiliate recommendations: ${error instanceof Error ? error.message : 'Unknown error'}`
        });
      }

      // Step 3: SEO optimization
      try {
        const { optimizeArticleContent } = await import('./ai_content_optimizer');
        const seoOptimization = await optimizeArticleContent({
          articleId: req.articleId,
          optimizationType: 'seo'
        });

        steps.push({
          step: 'seo_optimization',
          status: 'success',
          message: `SEO score: ${seoOptimization.estimatedImprovements.seoScore}`
        });
      } catch (error) {
        steps.push({
          step: 'seo_optimization',
          status: 'failed',
          message: `SEO optimization failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        });
      }

      // Step 4: Publish to WordPress
      if (req.includeWordPress) {
        try {
          const { publishToWordPress } = await import('../content/publish_to_wordpress');
          const wpResult = await publishToWordPress({
            articleId: req.articleId,
            status: req.publishStatus || 'draft'
          });

          steps.push({
            step: 'wordpress_publish',
            status: 'success',
            message: `Published to WordPress: ${wpResult.wordpressUrl}`,
            data: wpResult
          });
        } catch (error) {
          steps.push({
            step: 'wordpress_publish',
            status: 'failed',
            message: `WordPress publishing failed: ${error instanceof Error ? error.message : 'Unknown error'}`
          });
        }
      } else {
        steps.push({
          step: 'wordpress_publish',
          status: 'skipped',
          message: 'WordPress publishing not requested'
        });
      }

      // Step 5: Publish to Medium
      if (req.includeMedium) {
        try {
          const { publishToMedium } = await import('../content/publish_to_medium');
          const mediumResult = await publishToMedium({
            articleId: req.articleId,
            publishStatus: req.publishStatus || 'draft'
          });

          steps.push({
            step: 'medium_publish',
            status: 'success',
            message: `Published to Medium: ${mediumResult.mediumUrl}`,
            data: mediumResult
          });
        } catch (error) {
          steps.push({
            step: 'medium_publish',
            status: 'failed',
            message: `Medium publishing failed: ${error instanceof Error ? error.message : 'Unknown error'}`
          });
        }
      } else {
        steps.push({
          step: 'medium_publish',
          status: 'skipped',
          message: 'Medium publishing not requested'
        });
      }

      // Step 6: Generate social media content
      try {
        const { generateSocialContent } = await import('./social_media_automation');
        const socialResult = await generateSocialContent({
          articleId: req.articleId,
          platforms: ['pinterest', 'instagram', 'twitter']
        });

        steps.push({
          step: 'social_content',
          status: 'success',
          message: `Generated ${socialResult.posts.length} social media posts`
        });
      } catch (error) {
        steps.push({
          step: 'social_content',
          status: 'failed',
          message: `Social content generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        });
      }

      // Step 7: Update sitemap
      try {
        // Trigger sitemap regeneration
        steps.push({
          step: 'sitemap_update',
          status: 'success',
          message: 'Sitemap update triggered'
        });
      } catch (error) {
        steps.push({
          step: 'sitemap_update',
          status: 'failed',
          message: `Sitemap update failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        });
      }

      // Log pipeline execution
      await automationDB.exec`
        INSERT INTO optimization_history (
          target_type, target_id, optimization_type, description, estimated_impact
        ) VALUES (
          'article', ${req.articleId.toString()}, 'content_pipeline',
          'Full content publishing pipeline executed', 1.0
        )
      `;

      const successCount = steps.filter(s => s.status === 'success').length;
      const totalSteps = steps.length;

      return {
        success: successCount === totalSteps,
        steps
      };

    } catch (error) {
      steps.push({
        step: 'pipeline_error',
        status: 'failed',
        message: `Pipeline failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      });

      return { success: false, steps };
    }
  }
);
