import { api, APIError } from "encore.dev/api";
import { affiliateDB } from "./db";
import type { CreateAffiliateProductRequest, AffiliateProduct } from "./types";

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

// Creates a new affiliate product.
export const createProduct = api<CreateAffiliateProductRequest, AffiliateProduct>(
  { expose: true, method: "POST", path: "/affiliate/products" },
  async (req) => {
    // Generate slug if not provided
    const slug = req.slug || generateSlug(req.name);
    
    // Check if slug already exists
    const existingProduct = await affiliateDB.queryRow`
      SELECT id FROM affiliate_products WHERE slug = ${slug}
    `;
    
    if (existingProduct) {
      throw APIError.alreadyExists("A product with this slug already exists");
    }
    const product = await affiliateDB.queryRow<AffiliateProduct>`
      INSERT INTO affiliate_products (
        program_id, name, slug, description, price, original_url, image_url, category, tags, is_active
      ) VALUES (
        ${req.programId}, ${req.name}, ${slug}, ${req.description || null}, ${req.price || null},
        ${req.originalUrl}, ${req.imageUrl || null}, ${req.category || null},
        ${req.tags || null}, ${req.isActive === undefined ? true : req.isActive}
      )
      RETURNING id, program_id as "programId", name, slug, description, price,
                original_url as "originalUrl", image_url as "imageUrl", category, tags,
                is_active as "isActive", created_at as "createdAt", updated_at as "updatedAt"
    `;

    if (!product) {
      throw APIError.internal("Failed to create affiliate product");
    }

    return product;
  }
);
