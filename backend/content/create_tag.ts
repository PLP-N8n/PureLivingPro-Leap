import { api, APIError } from "encore.dev/api";
import { contentDB } from "./db";
import type { CreateTagRequest, Tag } from "./types";

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

// Creates a new tag.
export const createTag = api<CreateTagRequest, Tag>(
  { expose: true, method: "POST", path: "/tags" },
  async (req) => {
    const slug = generateSlug(req.name);
    
    // Check if tag already exists
    const existingTag = await contentDB.queryRow`
      SELECT id FROM tags WHERE name = ${req.name} OR slug = ${slug}
    `;
    
    if (existingTag) {
      throw APIError.alreadyExists("A tag with this name already exists");
    }

    const tag = await contentDB.queryRow<Tag>`
      INSERT INTO tags (name, slug)
      VALUES (${req.name}, ${slug})
      RETURNING id, name, slug, created_at as "createdAt"
    `;

    if (!tag) {
      throw APIError.internal("Failed to create tag");
    }

    return tag;
  }
);
