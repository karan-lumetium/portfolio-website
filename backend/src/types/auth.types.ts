import { Request } from 'express';

// JWT token payload
export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

// Extended request with user info
export interface AuthRequest extends Request {
  user?: TokenPayload;
}

// Login data
export interface LoginDto {
  email: string;
  password: string;
}

// Registration data
export interface RegisterDto {
  email: string;
  username: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

// API Response types
export interface AuthResponse {
  success: boolean;
  message: string;
  data?: any;
  token?: string;
}
