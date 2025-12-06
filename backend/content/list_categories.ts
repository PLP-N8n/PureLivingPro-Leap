import { api } from "encore.dev/api";
import { contentDB } from "./db";
import type { ListCategoriesResponse, Category } from "./types";

// Retrieves all categories.
export const listCategories = api<void, ListCategoriesResponse>(
  { expose: true, method: "GET", path: "/categories" },
  async () => {
    const categories = await contentDB.queryAll<Category>`
      SELECT id, name, description, slug, created_at as "createdAt"
      FROM categories
      ORDER BY name ASC
    `;

    return { categories };
  }
);
