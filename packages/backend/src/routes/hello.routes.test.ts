/**
 * Hello World Routes Tests
 *
 * This file contains integration tests for the hello world API endpoints.
 * It uses:
 * - Jest: Testing framework
 * - Supertest: HTTP assertions library for testing Express apps
 *
 * These tests verify:
 * - API endpoint functionality
 * - Response structure and data types
 * - HTTP status codes
 * - Error handling
 *
 * Note: These are integration tests that test the full request/response cycle
 * without actually starting the server on a network port.
 */

import request from 'supertest';
import app from '../app';

/**
 * Test Suite: GET /api/hello
 *
 * Tests the hello world endpoint to ensure it returns the correct response
 * format and data as expected by the frontend.
 */
describe('GET /api/hello', () => {
  /**
   * Test: Should return complete hello world message
   *
   * Verifies that:
   * - HTTP status code is 200 (OK)
   * - Response has 'success' field set to true
   * - Response has 'data' object
   * - Data contains the expected message string
   * - Data contains a timestamp field
   */
  it('should return hello world message', async () => {
    // Make HTTP GET request to /api/hello endpoint
    const response = await request(app).get('/api/hello');

    // Assert HTTP status code
    expect(response.status).toBe(200);

    // Assert response structure matches ApiResponse type
    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('data');

    // Assert data structure matches HelloWorldResponse type
    expect(response.body.data).toHaveProperty('message', 'Hello World from AssetBridge!');
    expect(response.body.data).toHaveProperty('timestamp');
  });

  /**
   * Test: Should return valid ISO timestamp
   *
   * Verifies that the timestamp field contains a valid ISO 8601 date string
   * that can be parsed by JavaScript Date constructor.
   */
  it('should return a valid timestamp', async () => {
    const response = await request(app).get('/api/hello');

    // Parse the timestamp string into a Date object
    const timestamp = new Date(response.body.data.timestamp);

    // Verify that the Date object is valid (not "Invalid Date")
    expect(timestamp.toString()).not.toBe('Invalid Date');
  });
});

/**
 * Test Suite: GET /health
 *
 * Tests the health check endpoint used for monitoring server status.
 * This endpoint is typically called by load balancers and monitoring tools.
 */
describe('GET /health', () => {
  /**
   * Test: Should return healthy status
   *
   * Verifies that the health check endpoint returns:
   * - HTTP 200 status code
   * - Status field with 'ok' value
   * - Current timestamp
   */
  it('should return health check status', async () => {
    const response = await request(app).get('/health');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('status', 'ok');
    expect(response.body).toHaveProperty('timestamp');
  });
});

/**
 * Test Suite: 404 Handler
 *
 * Tests the catch-all 404 handler that responds to unknown routes.
 * This ensures proper error responses for invalid API endpoints.
 */
describe('404 handler', () => {
  /**
   * Test: Should return 404 for unknown routes
   *
   * Verifies that requests to non-existent endpoints return:
   * - HTTP 404 status code
   * - Error response format
   * - Appropriate error message
   */
  it('should return 404 for unknown routes', async () => {
    const response = await request(app).get('/api/unknown');

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('success', false);
    expect(response.body).toHaveProperty('error', 'Route not found');
  });
});
