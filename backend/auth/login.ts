import { api, APIError } from "encore.dev/api";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { authDB } from "./db";
import { jwtSecret } from "./secrets";
import type { LoginRequest, LoginResponse, User, UserWithPassword, JWTPayload } from "./types";

// Login endpoint - authenticates user and returns JWT token
export const login = api<LoginRequest, LoginResponse>(
  { expose: true, method: "POST", path: "/auth/login" },
  async ({ email, password }) => {
    try {
      // Validate input
      if (!email || !password) {
        throw APIError.invalidArgument("Email and password are required");
      }

      // Find user by email
      const query = `
        SELECT
          id, email, password_hash, role, name, is_active,
          created_at, updated_at, last_login_at
        FROM users
        WHERE email = $1
      `;

      const result = await authDB.exec(query, email.toLowerCase().trim());

    if (!result.rows || result.rows.length === 0) {
      // Don't reveal whether email exists
      throw APIError.unauthenticated("Invalid email or password");
    }

    const row = result.rows[0];
    const user: UserWithPassword = {
      id: Number(row[0]),
      email: String(row[1]),
      passwordHash: String(row[2]),
      role: String(row[3]) as any,
      name: row[4] ? String(row[4]) : undefined,
      isActive: Boolean(row[5]),
      createdAt: row[6] as Date,
      updatedAt: row[7] as Date,
      lastLoginAt: row[8] ? (row[8] as Date) : undefined
    };

    // Check if user is active
    if (!user.isActive) {
      throw APIError.permissionDenied("Account is disabled");
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw APIError.unauthenticated("Invalid email or password");
    }

    // Update last login time
    await authDB.exec(`
      UPDATE users
      SET last_login_at = NOW()
      WHERE id = $1
    `, user.id);

    // Generate JWT token (expires in 7 days)
    const secret = await jwtSecret();
    const expiresIn = 7 * 24 * 60 * 60; // 7 days in seconds
    const expiresAt = new Date(Date.now() + expiresIn * 1000);

    const payload: JWTPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(expiresAt.getTime() / 1000)
    };

    const token = jwt.sign(payload, secret);

    // Return user without password hash
    const safeUser: User = {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      lastLoginAt: new Date()
    };

      return {
        token,
        user: safeUser,
        expiresAt: expiresAt.toISOString()
      };
    } catch (error) {
      console.error("Login error:", error);
      // If it's already an APIError, rethrow it
      if (error instanceof APIError) {
        throw error;
      }
      // Otherwise, wrap it as an internal error with details for debugging
      throw APIError.internal("Login failed: " + (error instanceof Error ? error.message : "Unknown error"));
    }
  }
);
