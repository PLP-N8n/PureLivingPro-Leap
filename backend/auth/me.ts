import { api, APIError, Header } from "encore.dev/api";
import jwt from "jsonwebtoken";
import { authDB } from "./db";
import { jwtSecret } from "./secrets";
import type { User, JWTPayload } from "./types";

interface MeRequest {
  authorization: Header<"Authorization">;
}

// Get current user endpoint - validates JWT and returns user info
// Force deployment: 2025-12-07 17:33
export const me = api<MeRequest, User>(
  { expose: true, method: "GET", path: "/auth/me" },
  async ({ authorization }) => {
    // Validate authorization header
    if (!authorization) {
      throw APIError.unauthenticated("No authorization header provided");
    }

    const parts = authorization.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer") {
      throw APIError.unauthenticated("Invalid authorization header format");
    }

    // Verify JWT token
    const token = parts[1];
    let payload: JWTPayload;
    try {
      const secret = await jwtSecret();
      payload = jwt.verify(token, secret) as JWTPayload;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw APIError.unauthenticated("Token has expired");
      }
      throw APIError.unauthenticated("Invalid token");
    }

    // Fetch full user details from database
    const query = `
      SELECT
        id, email, role, name, is_active,
        created_at, updated_at, last_login_at
      FROM users
      WHERE id = $1
    `;

    const result = await authDB.exec(query, payload.sub);

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
