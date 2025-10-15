/**
 * Authentication Middleware
 *
 * This middleware handles JWT-based authentication for protected routes.
 * It extracts and verifies JWT tokens from the Authorization header and
 * attaches the authenticated user information to the request object.
 *
 * Usage:
 * Apply this middleware to any route that requires authentication:
 *
 * router.get('/protected-route', authenticate, (req, res) => {
 *   const userId = req.user.userId;
 *   // Access authenticated user information
 * });
 */

import { Request, Response, NextFunction } from 'express';
import { verifyToken, extractTokenFromHeader } from '../utils/jwt';
import type { JwtPayload } from '@assetbridge/shared';

/**
 * Extend Express Request interface to include user property
 *
 * This allows TypeScript to recognize req.user in route handlers
 */
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

/**
 * Authentication Middleware
 *
 * Verifies the JWT token from the Authorization header and attaches
 * the decoded user payload to req.user.
 *
 * Expects Authorization header format: "Bearer <token>"
 *
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function
 *
 * Returns 401 if:
 * - No Authorization header is present
 * - Token is missing or malformed
 * - Token is invalid or expired
 *
 * @example
 * // Protect a route
 * router.get('/api/users', authenticate, getUsersController);
 *
 * // Access user info in controller
 * const getUsersController = (req: Request, res: Response) => {
 *   console.log(req.user.userId); // User's ID from token
 *   console.log(req.user.email);  // User's email from token
 * };
 */
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Extract token from Authorization header
    const token = extractTokenFromHeader(req.headers.authorization);

    if (!token) {
      res.status(401).json({
        success: false,
        error: 'Authentication required. Please provide a valid token.',
      });
      return;
    }

    // Verify and decode the token
    const decoded = verifyToken(token);

    // Attach user payload to request object
    req.user = decoded;

    // Continue to next middleware/route handler
    next();
  } catch (error) {
    // Token verification failed
    const errorMessage = error instanceof Error ? error.message : 'Authentication failed';

    res.status(401).json({
      success: false,
      error: errorMessage,
    });
  }
};

/**
 * Optional Authentication Middleware
 *
 * Similar to authenticate middleware, but doesn't require authentication.
 * If a valid token is present, it attaches the user to req.user.
 * If no token or invalid token, it continues without setting req.user.
 *
 * Useful for routes that have different behavior for authenticated vs
 * unauthenticated users, but don't strictly require authentication.
 *
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function
 *
 * @example
 * // Route accessible to everyone, but with enhanced features for logged-in users
 * router.get('/api/products', optionalAuthenticate, getProductsController);
 */
export const optionalAuthenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = extractTokenFromHeader(req.headers.authorization);

    if (token) {
      // Token present, try to verify it
      const decoded = verifyToken(token);
      req.user = decoded;
    }

    // Continue regardless of whether token was present or valid
    next();
  } catch (error) {
    // Invalid token, but that's okay for optional auth
    // Just continue without setting req.user
    next();
  }
};
