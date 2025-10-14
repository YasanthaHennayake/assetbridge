/**
 * API Service Layer
 *
 * This module provides a centralized API client for making HTTP requests to the backend.
 * It handles:
 * - Request construction with proper URLs
 * - Response parsing and validation
 * - Error handling
 * - Type safety using shared types
 *
 * Benefits of this approach:
 * - Single source of truth for API calls
 * - Consistent error handling across the application
 * - Easy to add authentication headers later
 * - Easy to mock for testing
 * - Type-safe API responses
 *
 * Environment Variables:
 * - VITE_API_URL: Base URL for the backend API (e.g., http://localhost:5001)
 */

import type { ApiResponse, HelloWorldResponse } from '@assetbridge/shared';

// Get the API base URL from environment variables
// In development: Use proxy configured in vite.config.ts (empty string uses relative URLs)
// In production: Use the full backend URL from environment variable
const API_URL = import.meta.env.VITE_API_URL || '';

/**
 * API Client Object
 *
 * Contains all API methods organized by functionality.
 * Each method returns the actual data (not the wrapper) and throws errors on failure.
 */
export const api = {
  /**
   * Get Hello World Message
   *
   * Fetches the hello world message from the backend API.
   * This method demonstrates:
   * - Making GET requests with fetch API
   * - Handling HTTP errors
   * - Parsing and validating JSON responses
   * - Type-safe return values
   *
   * @returns {Promise<HelloWorldResponse>} The hello world data
   * @throws {Error} If the request fails or returns an error response
   *
   * Usage example:
   * ```typescript
   * try {
   *   const data = await api.getHelloWorld();
   *   console.log(data.message); // "Hello World from AssetBridge!"
   * } catch (error) {
   *   console.error('Failed to fetch:', error.message);
   * }
   * ```
   */
  async getHelloWorld(): Promise<HelloWorldResponse> {
    // Make HTTP GET request to the hello endpoint
    // fetch() returns a Promise that resolves to the Response object
    const response = await fetch(`${API_URL}/api/hello`);

    // Check if the HTTP response indicates success (status 200-299)
    // If not, throw an error before trying to parse JSON
    if (!response.ok) {
      throw new Error('Failed to fetch hello world message');
    }

    // Parse the JSON response body
    // We use the ApiResponse wrapper type to ensure type safety
    const data: ApiResponse<HelloWorldResponse> = await response.json();

    // Validate that the response contains successful data
    // The backend might return HTTP 200 but with success: false
    if (!data.success || !data.data) {
      throw new Error(data.error || 'Unknown error occurred');
    }

    // Return only the data portion (unwrap from ApiResponse)
    // This makes it easier for components to work with the data
    return data.data;
  },
};
