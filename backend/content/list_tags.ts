import { api } from "encore.dev/api";
import { contentDB } from "./db";
import type { ListTagsResponse, Tag } from "./types";

// Retrieves all tags.
export const listTags = api<void, ListTagsResponse>(
  { expose: true, method: "GET", path: "/tags" },
  async () => {
    const tags = await contentDB.queryAll<Tag>`
      SELECT id, name, slug, created_at as "createdAt"
      FROM tags
      ORDER BY name ASC
    `;

    return { tags };
  }
);
