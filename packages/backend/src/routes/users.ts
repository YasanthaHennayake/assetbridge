/**
 * User Routes
 *
 * Defines all user management API endpoints:
 * - GET /api/users - List all users (paginated)
 * - POST /api/users - Create new user
 * - GET /api/users/:id - Get user by ID
 * - PUT /api/users/:id - Update user
 * - DELETE /api/users/:id - Delete user
 *
 * All routes require authentication.
 */

import express from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { authenticate } from '../middleware/auth';
import {
  getUsers,
  createUser,
  getUserById,
  updateUser,
  deleteUser,
} from '../controllers/userController';

const router = express.Router();

// Apply authentication middleware to all user routes
router.use(authenticate);

/**
 * @route   GET /api/users
 * @desc    Get all users (paginated)
 * @access  Protected
 * @query   page - Page number (default: 1)
 * @query   limit - Items per page (default: 10, max: 100)
 * @query   search - Search term for name or email
 */
router.get('/', asyncHandler(getUsers));

/**
 * @route   POST /api/users
 * @desc    Create new user with auto-generated password
 * @access  Protected
 */
router.post('/', asyncHandler(createUser));

/**
 * @route   GET /api/users/:id
 * @desc    Get user by ID
 * @access  Protected
 */
router.get('/:id', asyncHandler(getUserById));

/**
 * @route   PUT /api/users/:id
 * @desc    Update user information
 * @access  Protected
 */
router.put('/:id', asyncHandler(updateUser));

/**
 * @route   DELETE /api/users/:id
 * @desc    Delete user
 * @access  Protected
 */
router.delete('/:id', asyncHandler(deleteUser));

export default router;
