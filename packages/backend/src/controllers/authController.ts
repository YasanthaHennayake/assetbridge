/**
 * Authentication Controller
 *
 * Handles all authentication-related operations:
 * - User login
 * - User logout
 * - Get current user
 * - Change password
 *
 * These controllers implement the business logic for authentication
 * and interact with the User model and utility functions.
 */

import { Request, Response } from 'express';
import User from '../models/User';
import { comparePassword, hashPassword, validatePassword } from '../utils/password';
import { generateToken } from '../utils/jwt';
import { AppError } from '../middleware/errorHandler';
import type {
  LoginRequest,
  LoginResponse,
  ChangePasswordRequest,
  UserSafe,
} from '@assetbridge/shared';

/**
 * Login Controller
 *
 * POST /api/auth/login
 *
 * Authenticates a user with email and password, returns JWT token.
 *
 * Request Body:
 * - email: User's email address
 * - password: User's password (plain text)
 *
 * Response:
 * - token: JWT authentication token
 * - user: User information (without password)
 *
 * @throws {AppError} 400 - Missing email or password
 * @throws {AppError} 401 - Invalid credentials
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password }: LoginRequest = req.body;

  // Validate request body
  if (!email || !password) {
    throw new AppError('Email and password are required', 400);
  }

  // Find user by email
  const user = await User.findOne({ email: email.toLowerCase() });

  if (!user) {
    throw new AppError('Invalid email or password', 401);
  }

  // Verify password
  const isPasswordValid = await comparePassword(password, user.password);

  if (!isPasswordValid) {
    throw new AppError('Invalid email or password', 401);
  }

  // Generate JWT token
  const token = generateToken(user._id.toString(), user.email);

  // Update last login timestamp
  user.lastLogin = new Date();
  await user.save();

  // Prepare user data (exclude password)
  const userSafe: UserSafe = {
    _id: user._id.toString(),
    name: user.name,
    email: user.email,
    mustChangePassword: user.mustChangePassword,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    lastLogin: user.lastLogin,
  };

  // Send response
  const response: LoginResponse = {
    token,
    user: userSafe,
  };

  res.status(200).json({
    success: true,
    data: response,
    message: 'Login successful',
  });
};

/**
 * Logout Controller
 *
 * POST /api/auth/logout
 *
 * Handles user logout. Since we're using stateless JWT tokens,
 * there's no server-side session to invalidate. The client should
 * remove the token from storage.
 *
 * In a future iteration, we could implement token blacklisting
 * for enhanced security.
 *
 * @requires Authentication
 */
export const logout = async (req: Request, res: Response): Promise<void> => {
  // With JWT, logout is primarily client-side (remove token)
  // Server can optionally log the event or invalidate the token
  // (would require a token blacklist in database)

  res.status(200).json({
    success: true,
    message: 'Logout successful',
  });
};

/**
 * Get Current User Controller
 *
 * GET /api/auth/me
 *
 * Returns the currently authenticated user's information.
 *
 * @requires Authentication
 */
export const getCurrentUser = async (req: Request, res: Response): Promise<void> => {
  // User info is available from authenticate middleware (req.user)
  const userId = req.user?.userId;

  if (!userId) {
    throw new AppError('User not authenticated', 401);
  }

  // Fetch user from database
  const user = await User.findById(userId).select('-password');

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
 * Change Password Controller
 *
 * POST /api/auth/change-password
 *
 * Allows authenticated users to change their password.
 *
 * Request Body:
 * - currentPassword: User's current password
 * - newPassword: User's new password
 *
 * Validates:
 * - Current password is correct
 * - New password meets requirements
 * - New password is different from current
 *
 * @requires Authentication
 * @throws {AppError} 400 - Missing fields or validation errors
 * @throws {AppError} 401 - Incorrect current password
 */
export const changePassword = async (req: Request, res: Response): Promise<void> => {
  const { currentPassword, newPassword }: ChangePasswordRequest = req.body;
  const userId = req.user?.userId;

  if (!userId) {
    throw new AppError('User not authenticated', 401);
  }

  // Validate request body
  if (!currentPassword || !newPassword) {
    throw new AppError('Current password and new password are required', 400);
  }

  // Validate new password strength
  const passwordErrors = validatePassword(newPassword);
  if (passwordErrors.length > 0) {
    res.status(400).json({
      success: false,
      error: 'Password does not meet requirements',
      errors: passwordErrors,
    });
    return;
  }

  // Fetch user
  const user = await User.findById(userId);

  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Verify current password
  const isCurrentPasswordValid = await comparePassword(currentPassword, user.password);

  if (!isCurrentPasswordValid) {
    throw new AppError('Current password is incorrect', 401);
  }

  // Check that new password is different from current
  const isSamePassword = await comparePassword(newPassword, user.password);

  if (isSamePassword) {
    throw new AppError('New password must be different from current password', 400);
  }

  // Hash new password
  const hashedPassword = await hashPassword(newPassword);

  // Update user password and clear mustChangePassword flag
  user.password = hashedPassword;
  user.mustChangePassword = false;
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Password changed successfully',
  });
};
