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

// ============================================================================
// User Authentication & Authorization Types
// ============================================================================

/**
 * User Interface
 *
 * Represents a user in the AssetBridge system. This interface defines
 * the core user data structure shared between frontend and backend.
 *
 * @property {string} _id - MongoDB ObjectId as string
 * @property {string} name - Full name of the user
 * @property {string} email - Email address (unique identifier for login)
 * @property {string} password - Hashed password (should never be sent to frontend)
 * @property {boolean} mustChangePassword - Flag indicating if user must change password on next login
 * @property {Date | string} createdAt - When the user account was created
 * @property {Date | string} updatedAt - When the user account was last updated
 * @property {Date | string} [lastLogin] - When the user last logged in (optional)
 */
export interface User {
  _id: string;
  name: string;
  email: string;
  password: string; // Hashed password
  mustChangePassword: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
  lastLogin?: Date | string;
}

/**
 * User Safe Interface
 *
 * User data safe for sending to the frontend (password field removed).
 * Use this type when returning user data to the client.
 */
export type UserSafe = Omit<User, 'password'>;

/**
 * Login Request Body
 *
 * Expected payload for user login requests
 *
 * @property {string} email - User's email address
 * @property {string} password - User's password (plain text, will be hashed on server)
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * Login Response Data
 *
 * Response data returned after successful login
 *
 * @property {string} token - JWT authentication token
 * @property {UserSafe} user - User information (without password)
 */
export interface LoginResponse {
  token: string;
  user: UserSafe;
}

/**
 * Change Password Request Body
 *
 * Expected payload for password change requests
 *
 * @property {string} currentPassword - User's current password
 * @property {string} newPassword - User's new password
 */
export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

/**
 * Create User Request Body
 *
 * Expected payload for creating a new user
 *
 * @property {string} name - Full name of the user
 * @property {string} email - Email address (will be used for login)
 */
export interface CreateUserRequest {
  name: string;
  email: string;
}

/**
 * Create User Response Data
 *
 * Response data returned after creating a new user
 *
 * @property {UserSafe} user - The created user information
 * @property {string} generatedPassword - The auto-generated password (shown only once)
 */
export interface CreateUserResponse {
  user: UserSafe;
  generatedPassword: string;
}

/**
 * Update User Request Body
 *
 * Expected payload for updating user information
 *
 * @property {string} [name] - Updated name (optional)
 * @property {string} [email] - Updated email (optional)
 */
export interface UpdateUserRequest {
  name?: string;
  email?: string;
}

/**
 * Paginated Users Response
 *
 * Response structure for paginated user lists
 *
 * @property {UserSafe[]} users - Array of users for current page
 * @property {number} total - Total number of users
 * @property {number} page - Current page number
 * @property {number} limit - Number of items per page
 * @property {number} totalPages - Total number of pages
 */
export interface PaginatedUsersResponse {
  users: UserSafe[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * JWT Token Payload
 *
 * Structure of data encoded in JWT tokens
 *
 * @property {string} userId - User's MongoDB ObjectId
 * @property {string} email - User's email address
 * @property {number} iat - Issued at timestamp
 * @property {number} exp - Expiration timestamp
 */
export interface JwtPayload {
  userId: string;
  email: string;
  iat: number;
  exp: number;
}
