// User roles in the system
export type UserRole = 'admin' | 'editor' | 'viewer';

// User entity from database
export interface User {
  id: number;
  email: string;
  role: UserRole;
  name?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
}

// Internal user with password hash (never exposed via API)
export interface UserWithPassword extends User {
  passwordHash: string;
}

// Login request
export interface LoginRequest {
  email: string;
  password: string;
}

// Login response with JWT token
export interface LoginResponse {
  token: string;
  user: User;
  expiresAt: string;
}

// Auth data stored in request context
export interface AuthData {
  userID: number;
  email: string;
  role: UserRole;
}

// JWT payload structure
export interface JWTPayload {
  sub: number; // user ID
  email: string;
  role: UserRole;
  iat: number; // issued at
  exp: number; // expires at
}
