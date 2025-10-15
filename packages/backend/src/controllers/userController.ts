/**
 * User Controller
 *
 * Handles user management operations:
 * - List users (with pagination)
 * - Create user
 * - Get user by ID
 * - Update user
 * - Delete user (optional)
 *
 * All operations require authentication.
 */

import { Request, Response } from 'express';
import User from '../models/User';
import { hashPassword, generatePassword } from '../utils/password';
import { AppError } from '../middleware/errorHandler';
import type {
  CreateUserRequest,
  CreateUserResponse,
  UpdateUserRequest,
  PaginatedUsersResponse,
  UserSafe,
} from '@assetbridge/shared';

/**
 * Get All Users Controller
 *
 * GET /api/users
 *
 * Returns a paginated list of users.
 *
 * Query Parameters:
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 10, max: 100)
 * - search: Search term for name or email
 *
 * @requires Authentication
 */
export const getUsers = async (req: Request, res: Response): Promise<void> => {
  // Parse pagination parameters
  const page = parseInt(req.query.page as string) || 1;
  const limit = Math.min(parseInt(req.query.limit as string) || 10, 100); // Max 100 items per page
  const search = (req.query.search as string) || '';

  // Calculate skip value for pagination
  const skip = (page - 1) * limit;

  // Build search query
  interface SearchQuery {
    $or?: Array<{ name: { $regex: string; $options: string } } | { email: { $regex: string; $options: string } }>;
  }
  const searchQuery: SearchQuery = {};
  if (search) {
    searchQuery.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }

  // Count total matching documents
  const total = await User.countDocuments(searchQuery);

  // Fetch paginated users (exclude password field)
  const users = await User.find(searchQuery)
    .select('-password')
    .sort({ createdAt: -1 }) // Newest first
    .skip(skip)
    .limit(limit);

  // Convert to UserSafe type
  const usersSafe: UserSafe[] = users.map((user) => ({
    _id: user._id.toString(),
    name: user.name,
    email: user.email,
    mustChangePassword: user.mustChangePassword,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    lastLogin: user.lastLogin,
  }));

  // Calculate total pages
  const totalPages = Math.ceil(total / limit);

  // Prepare response
  const response: PaginatedUsersResponse = {
    users: usersSafe,
    total,
    page,
    limit,
    totalPages,
  };

  res.status(200).json({
    success: true,
    data: response,
  });
};

/**
 * Create User Controller
 *
 * POST /api/users
 *
 * Creates a new user with an auto-generated password.
 *
 * Request Body:
 * - name: User's full name
 * - email: User's email address
 *
 * Response:
 * - user: Created user information
 * - generatedPassword: Auto-generated password (shown only once)
 *
 * @requires Authentication
 * @throws {AppError} 400 - Missing required fields
 * @throws {AppError} 409 - Email already exists
 */
export const createUser = async (req: Request, res: Response): Promise<void> => {
  const { name, email }: CreateUserRequest = req.body;

  // Validate request body
  if (!name || !email) {
    throw new AppError('Name and email are required', 400);
  }

  // Check if email already exists
  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    throw new AppError(`Email '${email}' already exists`, 409);
  }

  // Generate secure random password
  const generatedPassword = generatePassword();

  // Hash the password
  const hashedPassword = await hashPassword(generatedPassword);

  // Create new user
  const user = await User.create({
    name,
    email: email.toLowerCase(),
    password: hashedPassword,
    mustChangePassword: true, // User must change password on first login
  });

  // Convert to UserSafe type
  const userSafe: UserSafe = {
    _id: user._id.toString(),
    name: user.name,
    email: user.email,
    mustChangePassword: user.mustChangePassword,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    lastLogin: user.lastLogin,
  };

  // Prepare response
  const response: CreateUserResponse = {
    user: userSafe,
    generatedPassword, // Only shown once!
  };

  res.status(201).json({
    success: true,
    data: response,
    message: 'User created successfully',
  });
};

/**
 * Get User By ID Controller
 *
 * GET /api/users/:id
 *
 * Returns a specific user by their ID.
 *
 * @requires Authentication
 * @throws {AppError} 404 - User not found
 */
export const getUserById = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  // Find user by ID (exclude password)
  const user = await User.findById(id).select('-password');

  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Convert to UserSafe type
  const userSafe: UserSafe = {
    _id: user._id.toString(),
    name: user.name,
    email: user.email,
    mustChangePassword: user.mustChangePassword,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    lastLogin: user.lastLogin,
  };

  res.status(200).json({
    success: true,
    data: userSafe,
  });
};

/**
 * Update User Controller
 *
 * PUT /api/users/:id
 *
 * Updates a user's information (name and/or email).
 *
 * Request Body:
 * - name: Updated name (optional)
 * - email: Updated email (optional)
 *
 * @requires Authentication
 * @throws {AppError} 400 - No fields to update
 * @throws {AppError} 404 - User not found
 * @throws {AppError} 409 - Email already exists
 */
export const updateUser = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { name, email }: UpdateUserRequest = req.body;

  // Validate that at least one field is provided
  if (!name && !email) {
    throw new AppError('At least one field (name or email) must be provided', 400);
  }

  // Find user
  const user = await User.findById(id);

  if (!user) {
    throw new AppError('User not found', 404);
  }

  // If email is being updated, check for duplicates
  if (email && email.toLowerCase() !== user.email) {
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      throw new AppError(`Email '${email}' already exists`, 409);
    }
  }

  // Update fields
  if (name) user.name = name;
  if (email) user.email = email.toLowerCase();

  await user.save();

  // Convert to UserSafe type
  const userSafe: UserSafe = {
    _id: user._id.toString(),
    name: user.name,
    email: user.email,
    mustChangePassword: user.mustChangePassword,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    lastLogin: user.lastLogin,
  };

  res.status(200).json({
    success: true,
    data: userSafe,
    message: 'User updated successfully',
  });
};

/**
 * Delete User Controller
 *
 * DELETE /api/users/:id
 *
 * Deletes a user from the system.
 * This is an optional operation - consider soft deletes in production.
 *
 * @requires Authentication
 * @throws {AppError} 404 - User not found
 */
export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const currentUserId = req.user?.userId;

  // Prevent user from deleting themselves
  if (id === currentUserId) {
    throw new AppError('You cannot delete your own account', 400);
  }

  // Find and delete user
  const user = await User.findByIdAndDelete(id);

  if (!user) {
    throw new AppError('User not found', 404);
  }

  res.status(200).json({
    success: true,
    message: 'User deleted successfully',
  });
};
