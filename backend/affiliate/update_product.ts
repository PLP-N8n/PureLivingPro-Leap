import { api, APIError } from "encore.dev/api";
import { affiliateDB } from "./db";
import type { UpdateAffiliateProductRequest, AffiliateProduct } from "./types";

interface UpdateProductParams {
  id: number;
}

// Updates an existing affiliate product.
export const updateProduct = api<UpdateProductParams & UpdateAffiliateProductRequest, AffiliateProduct>(
  { expose: true, method: "PUT", path: "/affiliate/products/:id" },
  async ({ id, ...req }) => {
    const existingProduct = await affiliateDB.queryRow`
      SELECT id FROM affiliate_products WHERE id = ${id}
    `;

    if (!existingProduct) {
      throw APIError.notFound("Affiliate product not found");
    }

    const updates: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    Object.entries(req).forEach(([key, value]) => {
      if (value !== undefined) {
        const dbKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
        updates.push(`${dbKey} = $${paramIndex++}`);
        params.push(value);
      }
    });

    if (updates.length === 0) {
      throw APIError.invalidArgument("No fields to update");
    }

    updates.push(`updated_at = NOW()`);
    
    const updateQuery = `
      UPDATE affiliate_products 
      SET ${updates.join(", ")}
      WHERE id = $${paramIndex++}
    `;
    params.push(id);

    await affiliateDB.rawExec(updateQuery, ...params);

    const product = await affiliateDB.queryRow<AffiliateProduct>`
      SELECT id, program_id as "programId", name, slug, description, price,
             original_url as "originalUrl", image_url as "imageUrl", category, tags,
             is_active as "isActive", created_at as "createdAt", updated_at as "updatedAt"
      FROM affiliate_products WHERE id = ${id}
    `;

    if (!product) {
      throw APIError.internal("Failed to retrieve updated affiliate product");
    }

    return product;
  }
);
