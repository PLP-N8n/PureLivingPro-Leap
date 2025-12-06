import { affiliateDB } from "../affiliate/db";

// Rotates low-performing affiliate links with better alternatives.
export async function rotateAffiliateLinks() {
  console.log("Running weekly affiliate link rotation...");

  // 1. Identify bottom quartile of links by CTR over the last 14 days
  // This is a placeholder for more complex logic.
  const lowPerformingLinks = await affiliateDB.queryAll<{
    id: number;
    productId: number;
    category?: string;
  }>`
    SELECT l.id, p.id as "productId", p.category
    FROM affiliate_links l
    JOIN affiliate_products p ON l.product_id = p.id
    WHERE l.is_active = true
    ORDER BY l.ctr_14d ASC, l.last_checked ASC
    LIMIT 10 -- Rotate up to 10 links per week
  `;

  for (const link of lowPerformingLinks) {
    // 2. Find a higher-performing alternative in the same category
    const replacement = await affiliateDB.queryRow<{
      id: number;
      originalUrl: string;
    }>`
      SELECT l.id, l.original_url as "originalUrl"
      FROM affiliate_links l
      JOIN affiliate_products p ON l.product_id = p.id
      WHERE p.category = ${link.category}
      AND l.is_active = true
      AND l.id != ${link.id}
      ORDER BY l.ctr_14d DESC
      LIMIT 1
    `;

    if (replacement) {
      // 3. In a real system, you would update content that uses the old link.
      // For now, we'll just deactivate the old link and log the suggested replacement.
      await affiliateDB.exec`
        UPDATE affiliate_links SET is_active = false WHERE id = ${link.id}
      `;
      
      console.log(`Deactivated link ${link.id}. Suggested replacement: ${replacement.id} (${replacement.originalUrl})`);
    }
  }

  console.log("Affiliate link rotation complete.");
}
