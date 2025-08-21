import { api } from "encore.dev/api";
import { automationDB } from "./db";
import { contentDB } from "../content/db";

interface SEOMetrics {
  keyword: string;
  currentRank: number;
  previousRank?: number;
  searchVolume: number;
  difficulty: number;
  url: string;
  lastUpdated: Date;
}

interface SEOReport {
  totalKeywords: number;
  averageRank: number;
  rankImprovements: number;
  rankDeclines: number;
  topKeywords: SEOMetrics[];
  opportunityKeywords: SEOMetrics[];
  competitorAnalysis: Array<{
    competitor: string;
    averageRank: number;
    sharedKeywords: number;
  }>;
}

interface TrackKeywordRequest {
  keyword: string;
  targetUrl: string;
  targetRank?: number;
  searchVolume?: number;
  difficulty?: number;
}

interface BulkKeywordTrackingRequest {
  keywords: Array<{
    keyword: string;
    targetUrl: string;
    targetRank?: number;
  }>;
}

// Tracks SEO performance for specific keywords.
export const trackKeyword = api<TrackKeywordRequest, { success: boolean; keywordId: number }>(
  { expose: true, method: "POST", path: "/automation/track-keyword" },
  async (req) => {
    // Check if keyword already exists
    const existingKeyword = await automationDB.queryRow<{ id: number }>`
      SELECT id FROM keyword_performance WHERE keyword = ${req.keyword}
    `;

    if (existingKeyword) {
      // Update existing keyword
      await automationDB.exec`
        UPDATE keyword_performance 
        SET 
          target_rank = ${req.targetRank || 1},
          search_volume = ${req.searchVolume || 0},
          difficulty_score = ${req.difficulty || 50},
          last_updated = NOW()
        WHERE id = ${existingKeyword.id}
      `;
      
      return { success: true, keywordId: existingKeyword.id };
    } else {
      // Create new keyword tracking
      const newKeyword = await automationDB.queryRow<{ id: number }>`
        INSERT INTO keyword_performance (
          keyword, search_volume, difficulty_score, target_rank, estimated_traffic, estimated_revenue
        ) VALUES (
          ${req.keyword}, ${req.searchVolume || 0}, ${req.difficulty || 50}, 
          ${req.targetRank || 1}, ${(req.searchVolume || 0) * 0.05}, ${(req.searchVolume || 0) * 0.01}
        )
        RETURNING id
      `;

      return { success: true, keywordId: newKeyword!.id };
    }
  }
);

// Generates comprehensive SEO performance report.
export const generateSEOReport = api<void, SEOReport>(
  { expose: true, method: "GET", path: "/automation/seo-report" },
  async () => {
    // Get all tracked keywords with current performance
    const allKeywords = await automationDB.queryAll<SEOMetrics>`
      SELECT 
        keyword,
        COALESCE(current_rank, 100) as "currentRank",
        search_volume as "searchVolume",
        difficulty_score as difficulty,
        '' as url,
        last_updated as "lastUpdated"
      FROM keyword_performance
      ORDER BY estimated_revenue DESC
    `;

    // Calculate metrics
    const totalKeywords = allKeywords.length;
    const averageRank = totalKeywords > 0 ? 
      allKeywords.reduce((sum, kw) => sum + kw.currentRank, 0) / totalKeywords : 0;

    // Simulate rank changes (in production, this would come from actual SEO tools)
    const rankImprovements = Math.floor(totalKeywords * 0.3);
    const rankDeclines = Math.floor(totalKeywords * 0.15);

    // Get top performing keywords (rank 1-10)
    const topKeywords = allKeywords.filter(kw => kw.currentRank <= 10).slice(0, 10);

    // Get opportunity keywords (rank 11-30, high search volume)
    const opportunityKeywords = allKeywords
      .filter(kw => kw.currentRank > 10 && kw.currentRank <= 30 && kw.searchVolume > 1000)
      .slice(0, 10);

    // Simulate competitor analysis
    const competitorAnalysis = [
      { competitor: 'healthline.com', averageRank: 8.5, sharedKeywords: 45 },
      { competitor: 'webmd.com', averageRank: 12.3, sharedKeywords: 38 },
      { competitor: 'medicalnewstoday.com', averageRank: 15.7, sharedKeywords: 32 },
      { competitor: 'mayoclinic.org', averageRank: 6.2, sharedKeywords: 28 },
      { competitor: 'verywellhealth.com', averageRank: 18.4, sharedKeywords: 25 }
    ];

    return {
      totalKeywords,
      averageRank,
      rankImprovements,
      rankDeclines,
      topKeywords,
      opportunityKeywords,
      competitorAnalysis
    };
  }
);

// Tracks multiple keywords in bulk for efficiency.
export const bulkTrackKeywords = api<BulkKeywordTrackingRequest, { 
  added: number; 
  updated: number; 
  failed: number 
}>(
  { expose: true, method: "POST", path: "/automation/bulk-track-keywords" },
  async (req) => {
    let added = 0;
    let updated = 0;
    let failed = 0;

    for (const keywordData of req.keywords) {
      try {
        const result = await trackKeyword({
          keyword: keywordData.keyword,
          targetUrl: keywordData.targetUrl,
          targetRank: keywordData.targetRank,
          searchVolume: await estimateSearchVolume(keywordData.keyword),
          difficulty: await estimateKeywordDifficulty(keywordData.keyword)
        });

        if (result.success) {
          // Check if this was an update or new addition
          const existing = await automationDB.queryRow<{ id: number }>`
            SELECT id FROM keyword_performance 
            WHERE keyword = ${keywordData.keyword}
            AND last_updated < NOW() - INTERVAL '1 minute'
          `;
          
          if (existing) {
            updated++;
          } else {
            added++;
          }
        } else {
          failed++;
        }
      } catch (error) {
        console.error(`Failed to track keyword ${keywordData.keyword}:`, error);
        failed++;
      }
    }

    return { added, updated, failed };
  }
);

// Automatically discovers keyword opportunities from existing content.
export const discoverKeywordOpportunities = api<void, {
  opportunities: Array<{
    keyword: string;
    currentArticles: number;
    estimatedVolume: number;
    difficulty: number;
    potentialRank: number;
    recommendedAction: string;
  }>;
  totalOpportunities: number;
}>(
  { expose: true, method: "GET", path: "/automation/keyword-opportunities" },
  async () => {
    // Analyze existing article titles and content for keyword patterns
    const articleKeywords = await contentDB.queryAll<{
      keyword: string;
      articleCount: number;
      avgViews: number;
    }>`
      SELECT 
        unnest(string_to_array(lower(regexp_replace(title, '[^a-zA-Z0-9 ]', '', 'g')), ' ')) as keyword,
        COUNT(*) as "articleCount",
        AVG(view_count) as "avgViews"
      FROM articles
      WHERE published = true
      AND created_at >= NOW() - INTERVAL '90 days'
      AND length(unnest(string_to_array(lower(regexp_replace(title, '[^a-zA-Z0-9 ]', '', 'g')), ' '))) > 4
      GROUP BY keyword
      HAVING COUNT(*) >= 2 AND AVG(view_count) > 50
      ORDER BY "avgViews" DESC
      LIMIT 20
    `;

    // Generate keyword combinations and analyze opportunities
    const opportunities = [];

    for (const kw of articleKeywords) {
      // Skip common words
      if (['with', 'from', 'that', 'this', 'your', 'best', 'good', 'great'].includes(kw.keyword)) {
        continue;
      }

      const estimatedVolume = Math.floor(kw.avgViews * 15); // Estimate search volume
      const difficulty = await estimateKeywordDifficulty(kw.keyword);
      const potentialRank = Math.max(1, Math.floor(30 - (kw.articleCount * 5))); // More articles = better potential rank

      let recommendedAction = 'Create more content targeting this keyword';
      if (kw.articleCount >= 5) {
        recommendedAction = 'Optimize existing content for better rankings';
      } else if (difficulty > 70) {
        recommendedAction = 'Target long-tail variations of this keyword';
      }

      opportunities.push({
        keyword: kw.keyword,
        currentArticles: kw.articleCount,
        estimatedVolume,
        difficulty,
        potentialRank,
        recommendedAction
      });
    }

    // Sort by potential value (volume / difficulty * article count)
    opportunities.sort((a, b) => {
      const scoreA = (a.estimatedVolume / Math.max(a.difficulty, 1)) * a.currentArticles;
      const scoreB = (b.estimatedVolume / Math.max(b.difficulty, 1)) * b.currentArticles;
      return scoreB - scoreA;
    });

    return {
      opportunities: opportunities.slice(0, 15),
      totalOpportunities: opportunities.length
    };
  }
);

// Updates keyword rankings (would integrate with SEO tools in production).
export const updateKeywordRankings = api<void, { updated: number; failed: number }>(
  { expose: true, method: "POST", path: "/automation/update-rankings" },
  async () => {
    const keywords = await automationDB.queryAll<{
      id: number;
      keyword: string;
      currentRank?: number;
    }>`
      SELECT id, keyword, current_rank as "currentRank"
      FROM keyword_performance
      WHERE last_updated < NOW() - INTERVAL '24 hours'
      OR current_rank IS NULL
      ORDER BY last_updated ASC
      LIMIT 50
    `;

    let updated = 0;
    let failed = 0;

    for (const kw of keywords) {
      try {
        // Simulate rank checking (in production, integrate with SEMrush, Ahrefs, etc.)
        const newRank = await simulateRankCheck(kw.keyword, kw.currentRank);
        
        await automationDB.exec`
          UPDATE keyword_performance 
          SET 
            current_rank = ${newRank},
            last_updated = NOW()
          WHERE id = ${kw.id}
        `;

        updated++;
      } catch (error) {
        console.error(`Failed to update ranking for ${kw.keyword}:`, error);
        failed++;
      }
    }

    return { updated, failed };
  }
);

async function estimateSearchVolume(keyword: string): Promise<number> {
  // Simplified estimation based on keyword characteristics
  const baseVolume = 1000;
  const keywordLength = keyword.split(' ').length;
  
  // Longer keywords typically have lower volume
  const lengthMultiplier = Math.max(0.1, 1 - (keywordLength - 1) * 0.3);
  
  // Health/wellness keywords tend to have good volume
  const healthMultiplier = keyword.includes('health') || keyword.includes('wellness') || 
                          keyword.includes('nutrition') || keyword.includes('fitness') ? 1.5 : 1.0;
  
  return Math.floor(baseVolume * lengthMultiplier * healthMultiplier);
}

async function estimateKeywordDifficulty(keyword: string): Promise<number> {
  // Simplified difficulty estimation
  const baseScore = 50;
  const keywordLength = keyword.split(' ').length;
  
  // Longer keywords are typically easier
  const lengthAdjustment = (keywordLength - 1) * -10;
  
  // Competitive health terms are harder
  const competitiveTerms = ['best', 'top', 'review', 'vs', 'comparison'];
  const competitiveAdjustment = competitiveTerms.some(term => keyword.includes(term)) ? 20 : 0;
  
  return Math.max(10, Math.min(90, baseScore + lengthAdjustment + competitiveAdjustment));
}

async function simulateRankCheck(keyword: string, currentRank?: number): Promise<number> {
  // Simulate realistic rank changes
  if (!currentRank) {
    // New keyword, start with a random rank between 20-100
    return Math.floor(Math.random() * 80) + 20;
  }
  
  // Simulate small rank changes (-5 to +5 positions)
  const change = Math.floor(Math.random() * 11) - 5;
  const newRank = currentRank + change;
  
  // Keep rank within realistic bounds
  return Math.max(1, Math.min(100, newRank));
}
