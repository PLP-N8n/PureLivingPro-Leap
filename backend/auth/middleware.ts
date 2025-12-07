import { Gateway, APIError } from "encore.dev/api";
import { authHandler } from "encore.dev/auth";
import jwt from "jsonwebtoken";
import { jwtSecret } from "./secrets";
import type { AuthData, JWTPayload } from "./types";

// Auth handler that validates JWT tokens from Authorization header
export const auth = authHandler<AuthData>(async (req) => {
  // Get Authorization header
  const authHeader = req.headers.get("authorization");
  if (!authHeader) {
    throw APIError.unauthenticated("No authorization header provided");
  }

  // Extract Bearer token
  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    throw APIError.unauthenticated("Invalid authorization header format");
  }

  const token = parts[1];

  try {
    // Verify and decode JWT
    const secret = await jwtSecret();
    const payload = jwt.verify(token, secret) as JWTPayload;

    // Return auth data to be attached to request context
    return {
      userID: payload.sub,
      email: payload.email,
      role: payload.role
    };
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw APIError.unauthenticated("Token has expired");
    } else if (error instanceof jwt.JsonWebTokenError) {
      throw APIError.unauthenticated("Invalid token");
    }
    throw APIError.unauthenticated("Authentication failed");
  }
});

// Gateway that applies auth to all requests
// Endpoints can opt-in to authentication by setting auth: true
export const gateway = new Gateway({
  authHandler: auth
});
