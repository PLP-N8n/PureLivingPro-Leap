import { api, APIError, APICallMeta } from "encore.dev/api";
import { authDB } from "./db";
import type { User, AuthData } from "./types";

interface MeRequest {
  meta: APICallMeta<AuthData>;
}

// Get current user endpoint - requires authentication
export const me = api<MeRequest, User>(
  { expose: true, method: "GET", path: "/auth/me", auth: true },
  async ({ meta }) => {
    // Get authenticated user data from request context
    const auth = meta.auth;
    if (!auth) {
      throw APIError.unauthenticated("Not authenticated");
    }

    // Fetch full user details from database
    const query = `
      SELECT
        id, email, role, name, is_active,
        created_at, updated_at, last_login_at
      FROM users
      WHERE id = $1
    `;

    const result = await authDB.exec(query, auth.userID);

    if (!result.rows || result.rows.length === 0) {
      throw APIError.notFound("User not found");
    }

    const row = result.rows[0];
    return {
      id: Number(row[0]),
      email: String(row[1]),
      role: String(row[2]) as any,
      name: row[3] ? String(row[3]) : undefined,
      isActive: Boolean(row[4]),
      createdAt: row[5] as Date,
      updatedAt: row[6] as Date,
      lastLoginAt: row[7] ? (row[7] as Date) : undefined
    };
  }
);
