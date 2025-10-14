/**
 * Shared Type Definitions
 *
 * This module contains TypeScript interfaces and types shared between
 * frontend and backend packages. Using shared types ensures:
 * - Type safety across the entire application
 * - Consistent data structures
 * - Reduced code duplication
 * - Better IDE autocompletion and error detection
 *
 * Benefits of monorepo shared types:
 * - Frontend knows exactly what to expect from backend APIs
 * - Backend knows the contract it must fulfill
 * - Refactoring is safer (TypeScript will catch breaking changes)
 */

/**
 * Standard API Response Wrapper
 *
 * Generic interface for all API responses. This provides a consistent
 * structure for success and error responses across the application.
 *
 * @template T - The type of data returned in successful responses
 *
 * @property {boolean} success - Indicates if the request was successful
 * @property {T} [data] - The response data (present on success)
 * @property {string} [message] - Optional message for additional context
 * @property {string} [error] - Error message (present on failure)
 *
 * Example successful response:
 * {
 *   success: true,
 *   data: { id: 123, name: "John" }
 * }
 *
 * Example error response:
 * {
 *   success: false,
 *   error: "User not found"
 * }
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

/**
 * Hello World Response Data
 *
 * Specific response structure for the hello world endpoint.
 * This demonstrates how to define typed API responses.
 *
 * @property {string} message - The hello world message
 * @property {string} timestamp - ISO 8601 formatted timestamp of when the response was generated
 *
 * This interface is used with ApiResponse like:
 * ApiResponse<HelloWorldResponse>
 */
export interface HelloWorldResponse {
  message: string;
  timestamp: string;
}
