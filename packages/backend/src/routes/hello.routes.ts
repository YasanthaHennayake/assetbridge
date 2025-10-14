/**
 * Hello World Routes
 *
 * This module defines the hello world API routes for testing the backend setup.
 * It demonstrates:
 * - Basic Express routing
 * - TypeScript type safety with shared types
 * - Standardized API response format
 * - Proper route organization
 *
 * Routes defined:
 * - GET /hello: Returns a hello world message with timestamp
 */

import { Router, Request, Response } from 'express';
import type { ApiResponse, HelloWorldResponse } from '@assetbridge/shared';

// Create a new Express Router instance
// Routers are mini-applications capable of performing middleware and routing functions
const router = Router();

/**
 * GET /hello
 *
 * Simple endpoint that returns a hello world message.
 * This endpoint is used to verify that:
 * - The backend server is running
 * - API routes are properly configured
 * - Frontend can successfully communicate with backend
 * - TypeScript types are working correctly across packages
 *
 * @route GET /api/hello
 * @returns {ApiResponse<HelloWorldResponse>} JSON response with hello message and timestamp
 *
 * Response format:
 * {
 *   "success": true,
 *   "data": {
 *     "message": "Hello World from AssetBridge!",
 *     "timestamp": "2024-01-01T00:00:00.000Z"
 *   }
 * }
 */
router.get('/hello', (_req: Request, res: Response) => {
  // Create response object using shared types for consistency
  // This ensures frontend and backend agree on the response structure
  const response: ApiResponse<HelloWorldResponse> = {
    success: true,
    data: {
      message: 'Hello World from AssetBridge!',
      // ISO 8601 timestamp format for consistent date/time handling
      timestamp: new Date().toISOString(),
    },
  };

  // Send JSON response
  // Express automatically sets Content-Type: application/json header
  res.json(response);
});

// Export the router to be mounted in the main application (app.ts)
export default router;
