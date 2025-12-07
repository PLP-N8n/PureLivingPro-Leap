import { secret } from "encore.dev/config";

// JWT secret key for signing tokens
// This should be a long, random string in production
export const jwtSecret = secret("JWTSecret");
