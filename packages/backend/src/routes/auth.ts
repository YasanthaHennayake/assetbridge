/**
 * Authentication Routes
 *
 * Defines all authentication-related API endpoints:
 * - POST /api/auth/login - User login
 * - POST /api/auth/logout - User logout
 * - GET /api/auth/me - Get current user
 * - POST /api/auth/change-password - Change password
 */

import express from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { authenticate } from '../middleware/auth';
import {
  login,
  logout,
  getCurrentUser,
  changePassword,
} from '../controllers/authController';

const router = express.Router();

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user and return JWT token
 * @access  Public
 */
router.post('/login', asyncHandler(login));

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user (client-side token removal)
 * @access  Protected
 */
router.post('/logout', authenticate, asyncHandler(logout));

/**
 * @route   GET /api/auth/me
 * @desc    Get current authenticated user
 * @access  Protected
 */
router.get('/me', authenticate, asyncHandler(getCurrentUser));

/**
 * @route   POST /api/auth/change-password
 * @desc    Change user password
 * @access  Protected
 */
router.post('/change-password', authenticate, asyncHandler(changePassword));

export default router;
