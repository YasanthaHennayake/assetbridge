/**
 * Express Application Configuration
 *
 * This file configures and exports the Express application instance.
 * It sets up middleware, routes, and error handlers but does NOT start the server.
 * The server is started in index.ts after database connection is established.
 *
 * This separation allows for:
 * - Easy testing without starting the server
 * - Proper initialization order (database before server)
 * - Clean code organization
 */

import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helloRoutes from './routes/hello.routes';

// Create Express application instance
const app: Application = express();

/**
 * Middleware Configuration
 *
 * Middleware functions are executed in the order they are registered.
 * Each middleware has access to the request and response objects.
 */

// Enable Cross-Origin Resource Sharing (CORS)
// This allows the frontend (running on different port/domain) to make requests to this API
// Configure allowed origins for development and production
const corsOptions = {
  origin: [
    'http://localhost:3000', // Local development frontend
    'https://assetbridge.hikvision.lk' // Production frontend custom domain
  ],
  credentials: true
};
app.use(cors(corsOptions));

// Parse incoming JSON request bodies
// Makes JSON data available in req.body for POST/PUT requests
app.use(express.json());

// Parse URL-encoded request bodies (form submissions)
// extended: true allows for rich objects and arrays to be encoded
app.use(express.urlencoded({ extended: true }));

/**
 * API Routes
 *
 * All routes are prefixed with /api to distinguish them from static files
 * or other endpoints. This is a common REST API convention.
 */
app.use('/api', helloRoutes);

/**
 * Health Check Endpoint
 *
 * Used for monitoring and ensuring the server is running correctly.
 * - Load balancers use this to check if the server is healthy
 * - Monitoring tools ping this endpoint regularly
 * - Returns a simple JSON response with status and timestamp
 *
 * @route GET /health
 * @returns {Object} JSON object with status and timestamp
 */
app.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

/**
 * 404 Not Found Handler
 *
 * This middleware catches all requests that don't match any defined routes.
 * It must be defined AFTER all other routes to act as a catch-all.
 *
 * Returns a standardized error response for unknown endpoints.
 *
 * @middleware
 */
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
  });
});

// Export the configured Express application
// This will be imported and used in index.ts to start the server
export default app;
