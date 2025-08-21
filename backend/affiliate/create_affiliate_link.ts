import { api, APIError } from "encore.dev/api";
import { affiliateDB } from "./db";
import type { CreateAffiliateLinkRequest, AffiliateLink } from "./types";

function generateShortCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Creates a new affiliate tracking link.
export const createAffiliateLink = api<CreateAffiliateLinkRequest, AffiliateLink>(
  { expose: true, method: "POST", path: "/affiliate/links" },
  async (req) => {
    let shortCode = generateShortCode();
    
    // Ensure unique short code
    let attempts = 0;
    while (attempts < 10) {
      const existing = await affiliateDB.queryRow`
        SELECT id FROM affiliate_links WHERE short_code = ${shortCode}
      `;
      
      if (!existing) break;
      
      shortCode = generateShortCode();
      attempts++;
    }
    
    if (attempts >= 10) {
      throw APIError.internal("Failed to generate unique short code");
    }

    const link = await affiliateDB.queryRow<AffiliateLink>`
      INSERT INTO affiliate_links (
        product_id, short_code, original_url, tracking_params
      ) VALUES (
        ${req.productId}, ${shortCode}, ${req.originalUrl}, ${JSON.stringify(req.trackingParams || {})}
      )
      RETURNING id, product_id as "productId", short_code as "shortCode", 
                original_url as "originalUrl", tracking_params as "trackingParams",
                is_active as "isActive", created_at as "createdAt"
    `;

    if (!link) {
      throw APIError.internal("Failed to create affiliate link");
    }

    return link;
  }
);
