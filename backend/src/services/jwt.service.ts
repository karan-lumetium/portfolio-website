import jwt from 'jsonwebtoken';
import { TokenPayload } from '../types/auth.types';

export class JwtService {
  // Secret keys from environment variables
  private static accessSecret = process.env.JWT_ACCESS_SECRET || 'default_secret_change_this';
  private static refreshSecret = process.env.JWT_REFRESH_SECRET || 'default_refresh_change_this';
  
  // Token expiration times
  private static accessExpiry = '15m';  // 15 minutes
  private static refreshExpiry = '7d';   // 7 days

  /**
   * Generate access token for authentication
   */
  static generateAccessToken(payload: TokenPayload): string {
    return jwt.sign(payload, this.accessSecret, {
      expiresIn: this.accessExpiry,
    });
  }

  /**
   * Generate refresh token for getting new access tokens
   */
  static generateRefreshToken(payload: TokenPayload): string {
    return jwt.sign(payload, this.refreshSecret, {
      expiresIn: this.refreshExpiry,
    });
  }

  /**
   * Verify and decode access token
   */
  static verifyAccessToken(token: string): TokenPayload {
    try {
      return jwt.verify(token, this.accessSecret) as TokenPayload;
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }

  /**
   * Verify and decode refresh token
   */
  static verifyRefreshToken(token: string): TokenPayload {
    try {
      return jwt.verify(token, this.refreshSecret) as TokenPayload;
    } catch (error) {
      throw new Error('Invalid or expired refresh token');
    }
  }
}
