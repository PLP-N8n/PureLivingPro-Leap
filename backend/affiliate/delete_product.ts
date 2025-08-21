import { api, APIError } from "encore.dev/api";
import { affiliateDB } from "./db";

interface DeleteProductParams {
  id: number;
}

// Deletes an affiliate product.
export const deleteProduct = api<DeleteProductParams, void>(
  { expose: true, method: "DELETE", path: "/affiliate/products/:id" },
  async ({ id }) => {
    const result = await affiliateDB.queryRow`
      DELETE FROM affiliate_products WHERE id = ${id} RETURNING id
    `;

    if (!result) {
      throw APIError.notFound("Affiliate product not found");
    }
  }
);
