import { automationDB } from "./db";
import { content, ai, automation } from "~encore/clients";

// Processes a single item from the content pipeline.
export async function processScheduledContent() {
  // Get the next item from the queue
  const job = await automationDB.queryRow<{
    id: number;
    topic: string;
    targetKeywords: string[];
    attempts: number;
  }>`
    SELECT id, topic, target_keywords as "targetKeywords", attempts
    FROM content_pipeline
    WHERE status = 'scheduled' AND scheduled_publish_at <= NOW()
    ORDER BY scheduled_publish_at ASC
    LIMIT 1
  `;

  if (!job) {
    return;
  }

  // Mark as processing
  await automationDB.exec`
    UPDATE content_pipeline 
    SET status = 'generating', attempts = attempts + 1, updated_at = NOW()
    WHERE id = ${job.id}
  `;

  try {
    // 1. Generate content draft using AI
    const generated = await automation.generateContent({
      topic: job.topic,
      targetKeywords: job.targetKeywords,
      includeAffiliateProducts: true,
    });

    // 2. Create draft article in content service
    const draft = await content.createArticle({
      title: generated.title,
      content: generated.content,
      excerpt: generated.excerpt,
      authorName: "AI Content Generator",
      authorEmail: "ai@purelivingpro.com",
      published: false, // Start as draft
    });

    // 3. SEO Optimization
    const optimized = await automation.optimizeArticleContent({
      articleId: draft.id,
      optimizationType: 'seo',
      targetKeywords: job.targetKeywords,
    });

    // 4. Affiliate Enrichment (placeholder for now)
    // This step would involve adding more affiliate links or blocks.
    // For now, we'll use the content from the SEO optimization step.

    // 5. Update article with optimized content and publish
    const publishedArticle = await content.updateArticle({
      id: draft.id,
      title: optimized.optimizedTitle,
      content: optimized.optimizedContent,
      published: true,
      seoMeta: optimized.estimatedImprovements,
      affiliateBlocks: optimized.suggestedProducts,
    });

    // 6. Publish to WordPress
    const wpPost = await content.publishToWordPress({
      articleId: publishedArticle.id,
      status: 'publish',
    });

    // 7. Cross-post to Medium
    const mediumPost = await content.publishArticleToMedium({
      articleId: publishedArticle.id,
      publishStatus: 'public',
      canonicalUrl: `${process.env.SITE_BASE_URL}/article/${publishedArticle.slug}`,
    });

    // 8. Update article with external post IDs
    await content.updateArticle({
      id: publishedArticle.id,
      wpPostId: wpPost.wordpressPostId,
      mediumPostId: mediumPost.mediumPostId,
    });

    // 9. Mark pipeline job as complete
    await automationDB.exec`
      UPDATE content_pipeline
      SET status = 'published', published_article_id = ${publishedArticle.id}, updated_at = NOW()
      WHERE id = ${job.id}
    `;

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`Pipeline failed for job ${job.id}:`, errorMessage);
    
    // Mark job as failed
    await automationDB.exec`
      UPDATE content_pipeline
      SET status = 'failed', last_error = ${errorMessage}
      WHERE id = ${job.id}
    `;
  }
}
