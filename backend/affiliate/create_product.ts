import { api, APIError } from "encore.dev/api";
import { affiliateDB } from "./db";
import type { CreateAffiliateProductRequest, AffiliateProduct } from "./types";

// Creates a new affiliate product.
export const createProduct = api<CreateAffiliateProductRequest, AffiliateProduct>(
  { expose: true, method: "POST", path: "/affiliate/products" },
  async (req) => {
    const product = await affiliateDB.queryRow<AffiliateProduct>`
      INSERT INTO affiliate_products (
        program_id, name, description, price, original_url, image_url, category, tags, is_active
      ) VALUES (
        ${req.programId}, ${req.name}, ${req.description || null}, ${req.price || null},
        ${req.originalUrl}, ${req.imageUrl || null}, ${req.category || null},
        ${req.tags || null}, ${req.isActive === undefined ? true : req.isActive}
      )
      RETURNING id, program_id as "programId", name, description, price,
                original_url as "originalUrl", image_url as "imageUrl", category, tags,
                is_active as "isActive", created_at as "createdAt", updated_at as "updatedAt"
    `;

    if (!product) {
      throw APIError.internal("Failed to create affiliate product");
    }

    return product;
  }
);
