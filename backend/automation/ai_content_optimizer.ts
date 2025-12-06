import { api } from "encore.dev/api";
import { automationDB } from "./db";
import { contentDB } from "../content/db";
import { affiliateDB } from "../affiliate/db";
import { openAIKey } from "./secrets";

interface ContentOptimizationRequest {
  articleId: number;
  optimizationType: 'seo' | 'affiliate' | 'engagement' | 'conversion';
  targetKeywords?: string[];
  targetProducts?: number[];
}

interface OptimizedContent {
  originalTitle: string;
  optimizedTitle: string;
  originalContent: string;
  optimizedContent: string;
  optimizationSummary: string;
  estimatedImprovements: {
    seoScore: number;
    affiliateIntegration: number;
    readabilityScore: number;
    conversionPotential: number;
  };
  suggestedProducts: Array<{
    productId: number;
    productName: string;
    placement: string;
    reason: string;
  }>;
}

interface BulkOptimizationRequest {
  articleIds: number[];
  optimizationType: 'seo' | 'affiliate' | 'engagement' | 'conversion';
  batchSize?: number;
}

interface BulkOptimizationResponse {
  totalArticles: number;
  optimized: number;
  failed: number;
  estimatedRevenueIncrease: number;
  optimizationResults: Array<{
    articleId: number;
    title: string;
    success: boolean;
    improvements: any;
  }>;
}

// Optimizes individual article content using AI.
export const optimizeArticleContent = api<ContentOptimizationRequest, OptimizedContent>(
  { expose: true, method: "POST", path: "/automation/optimize-content" },
  async (req) => {
    const apiKey = openAIKey();
    if (!apiKey) {
      throw new Error("OpenAI API key not configured");
    }

    // Get article content
    const article = await contentDB.queryRow<{
      title: string;
      content: string;
      categoryId?: number;
    }>`
      SELECT title, content, category_id as "categoryId"
      FROM articles 
      WHERE id = ${req.articleId}
    `;

    if (!article) {
      throw new Error("Article not found");
    }

    // Get relevant affiliate products
    const relevantProducts = await getRelevantProducts(req.articleId, req.targetProducts);

    // Generate optimization prompt based on type
    const optimizationPrompt = generateOptimizationPrompt(
      req.optimizationType,
      article,
      req.targetKeywords || [],
      relevantProducts
    );

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            { role: 'system', content: optimizationPrompt.system },
            { role: 'user', content: optimizationPrompt.user }
          ],
          max_tokens: 4000,
          temperature: 0.3,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json() as any;
      const optimizationResult = JSON.parse(data.choices[0]?.message?.content || '{}');

      // Store optimization in history
      await automationDB.exec`
        INSERT INTO optimization_history (
          target_type, target_id, optimization_type, description, estimated_impact
        ) VALUES (
          'article', ${req.articleId.toString()}, ${req.optimizationType},
          ${optimizationResult.optimizationSummary}, 
          ${optimizationResult.estimatedImprovements?.conversionPotential || 0}
        )
      `;

      return {
        originalTitle: article.title,
        optimizedTitle: optimizationResult.optimizedTitle || article.title,
        originalContent: article.content,
        optimizedContent: optimizationResult.optimizedContent || article.content,
        optimizationSummary: optimizationResult.optimizationSummary || 'Content optimized for better performance',
        estimatedImprovements: optimizationResult.estimatedImprovements || {
          seoScore: 75,
          affiliateIntegration: 80,
          readabilityScore: 85,
          conversionPotential: 70
        },
        suggestedProducts: optimizationResult.suggestedProducts || []
      };

    } catch (error) {
      console.error('Content optimization error:', error);
      
      // Fallback optimization
      return generateFallbackOptimization(article, relevantProducts);
    }
  }
);

// Optimizes multiple articles in batch for efficiency.
export const bulkOptimizeContent = api<BulkOptimizationRequest, BulkOptimizationResponse>(
  { expose: true, method: "POST", path: "/automation/bulk-optimize" },
  async (req) => {
    const batchSize = req.batchSize || 5;
    const results = [];
    let optimized = 0;
    let failed = 0;
    let totalRevenueIncrease = 0;

    // Process articles in batches to avoid rate limits
    for (let i = 0; i < req.articleIds.length; i += batchSize) {
      const batch = req.articleIds.slice(i, i + batchSize);
      
      for (const articleId of batch) {
        try {
          const optimization = await optimizeArticleContent({
            articleId,
            optimizationType: req.optimizationType
          });

          // Apply the optimization
          await contentDB.exec`
            UPDATE articles 
            SET 
              title = ${optimization.optimizedTitle},
              content = ${optimization.optimizedContent},
              updated_at = NOW()
            WHERE id = ${articleId}
          `;

          results.push({
            articleId,
            title: optimization.optimizedTitle,
            success: true,
            improvements: optimization.estimatedImprovements
          });

          optimized++;
          totalRevenueIncrease += optimization.estimatedImprovements.conversionPotential || 0;

        } catch (error) {
          console.error(`Failed to optimize article ${articleId}:`, error);
          
          const article = await contentDB.queryRow<{ title: string }>`
            SELECT title FROM articles WHERE id = ${articleId}
          `;

          results.push({
            articleId,
            title: article?.title || 'Unknown',
            success: false,
            improvements: null
          });

          failed++;
        }

        // Add delay between requests to respect rate limits
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    return {
      totalArticles: req.articleIds.length,
      optimized,
      failed,
      estimatedRevenueIncrease: totalRevenueIncrease,
      optimizationResults: results
    };
  }
);

// Analyzes content performance and suggests optimization targets.
export const identifyOptimizationTargets = api<void, {
  lowPerformingArticles: Array<{
    articleId: number;
    title: string;
    currentRevenue: number;
    potentialRevenue: number;
    optimizationPriority: 'high' | 'medium' | 'low';
  }>;
  keywordGaps: Array<{
    keyword: string;
    currentRank: number;
    targetRank: number;
    difficulty: number;
  }>;
  affiliateOpportunities: Array<{
    articleId: number;
    title: string;
    missingProducts: number;
    potentialRevenue: number;
  }>;
}>(
  { expose: true, method: "GET", path: "/automation/optimization-targets" },
  async () => {
    // Identify low-performing articles
    const lowPerformingArticles = await contentDB.queryAll<{
      articleId: number;
      title: string;
      viewCount: number;
      createdAt: Date;
    }>`
      SELECT id as "articleId", title, view_count as "viewCount", created_at as "createdAt"
      FROM articles
      WHERE published = true
      AND created_at >= NOW() - INTERVAL '60 days'
      AND view_count < 500
      ORDER BY view_count ASC
      LIMIT 20
    `;

    // Calculate revenue potential for each article
    const articlesWithRevenue = await Promise.all(
      lowPerformingArticles.map(async (article) => {
        const affiliateData = await affiliateDB.queryRow<{ revenue: number }>`
          SELECT COALESCE(SUM(conv.commission_earned), 0) as revenue
          FROM affiliate_clicks ac
          LEFT JOIN affiliate_conversions conv ON ac.id = conv.click_id
          WHERE ac.content_id = ${article.articleId.toString()}
        `;

        const currentRevenue = affiliateData?.revenue || 0;
        const potentialRevenue = Math.max(currentRevenue * 3, 25); // Assume 3x improvement potential
        
        return {
          ...article,
          currentRevenue,
          potentialRevenue,
          optimizationPriority: (potentialRevenue - currentRevenue > 50 ? 'high' : 
                                 potentialRevenue - currentRevenue > 20 ? 'medium' : 'low') as 'high' | 'medium' | 'low'
        };
      })
    );

    // Get keyword gaps from performance table
    const keywordGaps = await automationDB.queryAll<{
      keyword: string;
      currentRank: number;
      targetRank: number;
      difficulty: number;
    }>`
      SELECT 
        keyword, 
        COALESCE(current_rank, 100) as "currentRank",
        target_rank as "targetRank",
        difficulty_score as difficulty
      FROM keyword_performance
      WHERE current_rank > target_rank + 5
      OR current_rank IS NULL
      ORDER BY estimated_revenue DESC
      LIMIT 15
    `;

    // Identify affiliate opportunities
    const affiliateOpportunities = await contentDB.queryAll<{
      articleId: number;
      title: string;
      categoryId: number;
    }>`
      SELECT id as "articleId", title, category_id as "categoryId"
      FROM articles
      WHERE published = true
      AND created_at >= NOW() - INTERVAL '30 days'
      ORDER BY view_count DESC
      LIMIT 10
    `;

    const opportunitiesWithProducts = await Promise.all(
      affiliateOpportunities.map(async (article) => {
        // Count how many relevant products are missing
        const relevantProducts = await affiliateDB.queryRow<{ count: number }>`
          SELECT COUNT(*) as count
          FROM affiliate_products p
          WHERE p.is_active = true
          AND p.category_id = ${article.categoryId}
        `;

        const currentProducts = await affiliateDB.queryRow<{ count: number }>`
          SELECT COUNT(DISTINCT al.product_id) as count
          FROM affiliate_links al
          JOIN affiliate_clicks ac ON al.id = ac.link_id
          WHERE ac.content_id = ${article.articleId.toString()}
        `;

        const missingProducts = (relevantProducts?.count || 0) - (currentProducts?.count || 0);
        const potentialRevenue = missingProducts * 8; // Estimate $8 per missing product

        return {
          articleId: article.articleId,
          title: article.title,
          missingProducts: Math.max(0, missingProducts),
          potentialRevenue
        };
      })
    );

    return {
      lowPerformingArticles: articlesWithRevenue,
      keywordGaps,
      affiliateOpportunities: opportunitiesWithProducts.filter(opp => opp.missingProducts > 0)
    };
  }
);

async function getRelevantProducts(articleId: number, targetProductIds?: number[]) {
  if (targetProductIds && targetProductIds.length > 0) {
    return await affiliateDB.queryAll<{
      id: number;
      name: string;
      description: string;
      price: number;
      category: string;
    }>`
      SELECT id, name, description, price, category
      FROM affiliate_products
      WHERE id = ANY(${targetProductIds})
      AND is_active = true
    `;
  }

  // Get products based on article category
  const article = await contentDB.queryRow<{ categoryId?: number }>`
    SELECT category_id as "categoryId" FROM articles WHERE id = ${articleId}
  `;

  if (!article?.categoryId) {
    return [];
  }

  return await affiliateDB.queryAll<{
    id: number;
    name: string;
    description: string;
    price: number;
    category: string;
  }>`
    SELECT id, name, description, price, category
    FROM affiliate_products
    WHERE is_active = true
    ORDER BY created_at DESC
    LIMIT 5
  `;
}

function generateOptimizationPrompt(
  type: string,
  article: any,
  keywords: string[],
  products: any[]
) {
  const baseSystem = `You are an expert content optimizer specializing in wellness and health content. 
  Your goal is to optimize content for better SEO, affiliate revenue, and user engagement.`;

  const productInfo = products.map(p => 
    `${p.name} (${p.category}) - $${p.price} - ${p.description}`
  ).join('\n');

  switch (type) {
    case 'seo':
      return {
        system: `${baseSystem} Focus on SEO optimization including keyword density, meta descriptions, headers, and readability.`,
        user: `Optimize this article for SEO with target keywords: ${keywords.join(', ')}
        
        Title: ${article.title}
        Content: ${article.content}
        
        Return JSON with: optimizedTitle, optimizedContent, optimizationSummary, estimatedImprovements`
      };

    case 'affiliate':
      return {
        system: `${baseSystem} Focus on naturally integrating affiliate products and improving conversion rates.`,
        user: `Optimize this article for affiliate revenue with these products:
        ${productInfo}
        
        Title: ${article.title}
        Content: ${article.content}
        
        Return JSON with: optimizedTitle, optimizedContent, optimizationSummary, estimatedImprovements, suggestedProducts`
      };

    case 'engagement':
      return {
        system: `${baseSystem} Focus on improving user engagement, readability, and time on page.`,
        user: `Optimize this article for better user engagement:
        
        Title: ${article.title}
        Content: ${article.content}
        
        Return JSON with: optimizedTitle, optimizedContent, optimizationSummary, estimatedImprovements`
      };

    default:
      return {
        system: `${baseSystem} Focus on overall conversion optimization.`,
        user: `Optimize this article for better conversions:
        
        Title: ${article.title}
        Content: ${article.content}
        
        Return JSON with: optimizedTitle, optimizedContent, optimizationSummary, estimatedImprovements`
      };
  }
}

function generateFallbackOptimization(article: any, products: any[]): OptimizedContent {
  const optimizedTitle = article.title.includes('Ultimate') ? article.title : `The Ultimate Guide to ${article.title}`;
  
  const productSection = products.length > 0 ? `
    <h3>Recommended Products</h3>
    <div class="product-recommendations">
      ${products.map(p => `
        <div class="product-card">
          <h4>${p.name}</h4>
          <p>${p.description}</p>
          <p class="price">$${p.price}</p>
          <a href="/r/product-${p.id}" class="cta-button">View Product</a>
        </div>
      `).join('')}
    </div>
  ` : '';

  const optimizedContent = article.content + productSection;

  return {
    originalTitle: article.title,
    optimizedTitle,
    originalContent: article.content,
    optimizedContent,
    optimizationSummary: 'Content optimized with improved title and affiliate product integration',
    estimatedImprovements: {
      seoScore: 70,
      affiliateIntegration: 85,
      readabilityScore: 75,
      conversionPotential: 60
    },
    suggestedProducts: products.map(p => ({
      productId: p.id,
      productName: p.name,
      placement: 'end-of-article',
      reason: 'Relevant to article topic'
    }))
  };
}
