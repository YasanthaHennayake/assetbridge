/**
 * JWT (JSON Web Token) Utility Functions
 *
 * This module provides JWT token generation, verification, and decoding utilities
 * for the AssetBridge authentication system.
 *
 * Key Features:
 * - Generate JWT tokens with user payload
 * - Verify and decode JWT tokens
 * - Configurable token expiration (default: 24 hours)
 * - Type-safe token payload using shared types
 *
 * Security Considerations:
 * - Tokens are signed using a secret key (JWT_SECRET environment variable)
 * - Tokens expire after a set duration to limit exposure
 * - Invalid or expired tokens are rejected
 */

import jwt from 'jsonwebtoken';
import type { JwtPayload } from '@assetbridge/shared';

/**
 * JWT Secret Key
 *
 * IMPORTANT: This must be set in environment variables.
 * Use a strong, random secret in production (at least 32 characters).
 *
 * Generate a secret: openssl rand -base64 32
 */
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

/**
 * JWT Token Expiration
 *
 * Default: 24 hours ('24h')
 * Other examples: '7d' (7 days), '1h' (1 hour), '30m' (30 minutes)
 */
const JWT_EXPIRATION = process.env.JWT_EXPIRATION || '24h';

/**
 * Warn if using default JWT secret in production
 */
if (process.env.NODE_ENV === 'production' && JWT_SECRET === 'your-secret-key-change-in-production') {
  console.warn(
    '⚠️  WARNING: Using default JWT_SECRET in production! Set JWT_SECRET environment variable.'
  );
}

/**
 * Generate a JWT token for a user
 *
 * Creates a signed JWT token containing user identification information.
 * The token is used for authenticating API requests.
 *
 * @param {string} userId - User's MongoDB ObjectId
 * @param {string} email - User's email address
 * @returns {string} Signed JWT token
 *
 * @example
 * const token = generateToken(user._id.toString(), user.email);
 * // Returns: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
 */
export const generateToken = (userId: string, email: string): string => {
  try {
    const payload = {
      userId,
      email,
    };

    const token = jwt.sign(payload, JWT_SECRET, {
      expiresIn: JWT_EXPIRATION,
    } as jwt.SignOptions);

    return token;
  } catch (error) {
    console.error('Error generating JWT token:', error);
    throw new Error('Failed to generate authentication token');
  }
};

/**
 * Verify and decode a JWT token
 *
 * Validates the token signature and expiration, then returns the decoded payload.
 * Throws an error if the token is invalid or expired.
 *
 * @param {string} token - JWT token to verify
 * @returns {JwtPayload} Decoded token payload
 * @throws {Error} If token is invalid, expired, or malformed
 *
 * @example
 * try {
 *   const payload = verifyToken(req.headers.authorization);
 *   console.log(payload.userId); // User's ID from token
 * } catch (error) {
 *   // Token is invalid
 * }
 */
export const verifyToken = (token: string): JwtPayload => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    return decoded;
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid token');
    } else if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Token expired');
    } else {
      console.error('Error verifying JWT token:', error);
      throw new Error('Token verification failed');
    }
  }
};

/**
 * Decode a JWT token without verification
 *
 * Returns the decoded payload WITHOUT verifying the signature.
 * Use this only when you need to inspect a token without validating it.
 * For authentication, always use verifyToken() instead.
 *
 * @param {string} token - JWT token to decode
 * @returns {JwtPayload | null} Decoded payload or null if malformed
 *
 * @example
 * const payload = decodeToken(token);
 * if (payload) {
 *   console.log(payload.email); // Email from token (unverified!)
 * }
 */
export const decodeToken = (token: string): JwtPayload | null => {
  try {
    const decoded = jwt.decode(token) as JwtPayload | null;
    return decoded;
  } catch (error) {
    console.error('Error decoding JWT token:', error);
    return null;
  }
};

/**
 * Extract token from Authorization header
 *
 * Parses the Authorization header and extracts the Bearer token.
 * Expected format: "Bearer <token>"
 *
 * @param {string | undefined} authHeader - Authorization header value
 * @returns {string | null} Extracted token or null if not found
 *
 * @example
 * const token = extractTokenFromHeader(req.headers.authorization);
 * if (token) {
 *   const payload = verifyToken(token);
 * }
 */
export const extractTokenFromHeader = (authHeader: string | undefined): string | null => {
  if (!authHeader) {
    return null;
  }

  // Check if header starts with 'Bearer '
  if (!authHeader.startsWith('Bearer ')) {
    return null;
  }

  // Extract token (remove 'Bearer ' prefix)
  const token = authHeader.substring(7);
  return token;
};
