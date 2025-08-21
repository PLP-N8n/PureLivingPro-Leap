import { api } from "encore.dev/api";
import { aiDB } from "./db";
import { affiliateDB } from "../affiliate/db";

interface RecommendationRequest {
  userInput: string;
  preferences?: {
    budget?: string;
    category?: string;
    goals?: string[];
  };
}

interface RecommendationResponse {
  recommendations: Array<{
    product: {
      id: number;
      name: string;
      description?: string;
      price?: number;
      imageUrl?: string;
      affiliateUrl: string;
    };
    reason: string;
    confidenceScore: number;
  }>;
  explanation: string;
}

// AI-powered product recommendations based on user input and preferences.
export const getProductRecommendations = api<RecommendationRequest, RecommendationResponse>(
  { expose: true, method: "POST", path: "/ai/recommendations" },
  async (req) => {
    try {
      // Get available affiliate products
      const products = await affiliateDB.queryAll<{
        id: number;
        name: string;
        description?: string;
        price?: number;
        imageUrl?: string;
        category?: string;
        tags?: string[];
      }>`
        SELECT 
          p.id, p.name, p.description, p.price, p.image_url as "imageUrl",
          p.category, p.tags
        FROM affiliate_products p
        WHERE p.is_active = true
        ORDER BY p.created_at DESC
        LIMIT 50
      `;

      // Simple keyword-based matching (can be enhanced with AI)
      const recommendations = await generateRecommendations(req.userInput, products, req.preferences);

      // Store recommendation for analytics
      await aiDB.exec`
        INSERT INTO ai_recommendations (user_input, recommended_products, recommendation_reason)
        VALUES (${req.userInput}, ${JSON.stringify(recommendations)}, 'keyword-based matching')
      `;

      // Get affiliate links for recommended products
      const recommendationsWithLinks = await Promise.all(
        recommendations.map(async (rec) => {
          const link = await affiliateDB.queryRow<{ shortCode: string }>`
            SELECT short_code as "shortCode"
            FROM affiliate_links
            WHERE product_id = ${rec.product.id} AND is_active = true
            LIMIT 1
          `;

          return {
            ...rec,
            product: {
              ...rec.product,
              affiliateUrl: link ? `/r/${link.shortCode}` : rec.product.affiliateUrl
            }
          };
        })
      );

      return {
        recommendations: recommendationsWithLinks,
        explanation: generateExplanation(req.userInput, recommendationsWithLinks.length)
      };

    } catch (error) {
      console.error('Product recommendation error:', error);
      
      return {
        recommendations: [],
        explanation: "I'm sorry, I couldn't generate recommendations at this time. Please try again later or browse our product categories."
      };
    }
  }
);

async function generateRecommendations(
  userInput: string, 
  products: any[], 
  preferences?: any
): Promise<any[]> {
  const lowerInput = userInput.toLowerCase();
  const recommendations: any[] = [];

  // Keywords for different categories
  const categoryKeywords = {
    supplements: ['vitamin', 'supplement', 'protein', 'omega', 'mineral', 'probiotic'],
    fitness: ['exercise', 'workout', 'gym', 'fitness', 'muscle', 'strength'],
    nutrition: ['diet', 'nutrition', 'healthy eating', 'meal', 'food'],
    wellness: ['wellness', 'stress', 'sleep', 'meditation', 'relaxation'],
    skincare: ['skin', 'skincare', 'beauty', 'anti-aging', 'moisturizer']
  };

  // Score products based on relevance
  for (const product of products) {
    let score = 0;
    let reason = '';

    // Check product name and description
    if (product.name.toLowerCase().includes(lowerInput)) {
      score += 10;
      reason = `Directly matches your search for "${userInput}"`;
    } else if (product.description?.toLowerCase().includes(lowerInput)) {
      score += 5;
      reason = `Related to your interest in ${userInput}`;
    }

    // Check category matching
    for (const [category, keywords] of Object.entries(categoryKeywords)) {
      if (keywords.some(keyword => lowerInput.includes(keyword))) {
        if (product.category?.toLowerCase() === category) {
          score += 8;
          reason = `Perfect match for ${category} products`;
        } else if (product.tags?.some((tag: string) => keywords.includes(tag.toLowerCase()))) {
          score += 4;
          reason = `Related to ${category}`;
        }
      }
    }

    // Budget filtering
    if (preferences?.budget && product.price) {
      const budgetRanges = {
        'low': [0, 50],
        'medium': [50, 150],
        'high': [150, Infinity]
      };
      
      const range = budgetRanges[preferences.budget as keyof typeof budgetRanges];
      if (range && product.price >= range[0] && product.price <= range[1]) {
        score += 2;
      }
    }

    if (score > 0) {
      recommendations.push({
        product: {
          id: product.id,
          name: product.name,
          description: product.description,
          price: product.price,
          imageUrl: product.imageUrl,
          affiliateUrl: '#' // Will be replaced with actual affiliate link
        },
        reason: reason || 'Recommended for your health goals',
        confidenceScore: Math.min(score / 10, 1) // Normalize to 0-1
      });
    }
  }

  // Sort by score and return top 5
  return recommendations
    .sort((a, b) => b.confidenceScore - a.confidenceScore)
    .slice(0, 5);
}

function generateExplanation(userInput: string, recommendationCount: number): string {
  if (recommendationCount === 0) {
    return "I couldn't find specific products matching your request, but I'd be happy to help you explore our categories or refine your search.";
  }
  
  return `Based on your interest in "${userInput}", I've found ${recommendationCount} products that might help you achieve your health and wellness goals. These recommendations are tailored to your needs and preferences.`;
}
