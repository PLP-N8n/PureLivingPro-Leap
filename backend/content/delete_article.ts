import { api, APIError } from "encore.dev/api";
import { contentDB } from "./db";

interface DeleteArticleParams {
  id: number;
}

// Deletes an article.
export const deleteArticle = api<DeleteArticleParams, void>(
  { expose: true, method: "DELETE", path: "/articles/by-id/:id" },
  async ({ id }) => {
    const result = await contentDB.queryRow`
      DELETE FROM articles WHERE id = ${id} RETURNING id
    `;

    if (!result) {
      throw APIError.notFound("Article not found");
    }
  }
);
