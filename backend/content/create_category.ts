import { api, APIError } from "encore.dev/api";
import { contentDB } from "./db";
import type { CreateCategoryRequest, Category } from "./types";

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

// Creates a new category.
export const createCategory = api<CreateCategoryRequest, Category>(
  { expose: true, method: "POST", path: "/categories" },
  async (req) => {
    const slug = generateSlug(req.name);
    
    // Check if category already exists
    const existingCategory = await contentDB.queryRow`
      SELECT id FROM categories WHERE name = ${req.name} OR slug = ${slug}
    `;
    
    if (existingCategory) {
      throw APIError.alreadyExists("A category with this name already exists");
    }

    const category = await contentDB.queryRow<Category>`
      INSERT INTO categories (name, description, slug)
      VALUES (${req.name}, ${req.description || null}, ${slug})
      RETURNING id, name, description, slug, created_at as "createdAt"
    `;

    if (!category) {
      throw APIError.internal("Failed to create category");
    }

    return category;
  }
);
