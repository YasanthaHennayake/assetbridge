/**
 * Error Handling Middleware
 *
 * Centralized error handling for the AssetBridge API.
 * This middleware catches and formats errors from route handlers,
 * ensuring consistent error responses across the application.
 *
 * Features:
 * - Consistent error response format
 * - Mongoose validation error handling
 * - MongoDB duplicate key error handling
 * - Generic error handling with stack traces (dev only)
 * - Security: Don't leak error details in production
 */

import { Request, Response, NextFunction } from 'express';
import { Error as MongooseError } from 'mongoose';

/**
 * Custom Application Error Class
 *
 * Use this class to throw errors with specific HTTP status codes
 * from controllers and services.
 *
 * @example
 * throw new AppError('User not found', 404);
 */
export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    // Maintains proper stack trace for where error was thrown
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Validation Error Interface
 */
interface ValidationError {
  field: string;
  message: string;
}

/**
 * Handle Mongoose Validation Errors
 *
 * Converts Mongoose validation errors to a user-friendly format
 *
 * @param {MongooseError.ValidationError} err - Mongoose validation error
 * @returns {ValidationError[]} Array of validation errors
 */
const handleValidationError = (
  err: MongooseError.ValidationError
): ValidationError[] => {
  const errors: ValidationError[] = [];

  Object.keys(err.errors).forEach((key) => {
    const error = err.errors[key];
    errors.push({
      field: key,
      message: error.message,
    });
  });

  return errors;
};

/**
 * Handle MongoDB Duplicate Key Errors
 *
 * Converts MongoDB duplicate key errors (code 11000) to user-friendly messages
 *
 * @param {any} err - MongoDB error object
 * @returns {string} User-friendly error message
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const handleDuplicateKeyError = (err: any): string => {
  // Extract field name from error
  const field = Object.keys(err.keyValue)[0];
  const value = err.keyValue[field];

  return `${field.charAt(0).toUpperCase() + field.slice(1)} '${value}' already exists`;
};

/**
 * Global Error Handler Middleware
 *
 * This middleware should be registered LAST in the middleware chain
 * to catch all errors from previous middleware and route handlers.
 *
 * @param {any} err - Error object
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} _next - Express next function (unused in error handler)
 *
 * @example
 * // In app.ts, register after all routes:
 * app.use(errorHandler);
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal server error';
  let errors: ValidationError[] | undefined = undefined;

  // Log error for debugging (in all environments)
  console.error('Error caught by error handler:', {
    message: err.message,
    statusCode,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  // Handle Mongoose Validation Errors
  if (err instanceof MongooseError.ValidationError) {
    statusCode = 400;
    message = 'Validation error';
    errors = handleValidationError(err);
  }

  // Handle Mongoose CastError (invalid ObjectId, etc.)
  if (err instanceof MongooseError.CastError) {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  }

  // Handle MongoDB Duplicate Key Error
  if (err.code === 11000) {
    statusCode = 409; // Conflict
    message = handleDuplicateKeyError(err);
  }

  // Prepare error response
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const errorResponse: any = {
    success: false,
    error: message,
  };

  // Include validation errors if present
  if (errors && errors.length > 0) {
    errorResponse.errors = errors;
  }

  // Include stack trace in development mode
  if (process.env.NODE_ENV === 'development') {
    errorResponse.stack = err.stack;
  }

  // Send error response
  res.status(statusCode).json(errorResponse);
};

/**
 * Not Found Handler Middleware
 *
 * Catches requests to undefined routes and returns a 404 error.
 * Register this middleware AFTER all defined routes but BEFORE the error handler.
 *
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function
 *
 * @example
 * // In app.ts:
 * // ... all routes ...
 * app.use(notFoundHandler);
 * app.use(errorHandler);
 */
export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const error = new AppError(
    `Route not found: ${req.method} ${req.originalUrl}`,
    404
  );
  next(error);
};

/**
 * Async Handler Wrapper
 *
 * Wraps async route handlers to automatically catch errors and pass them
 * to the error handling middleware. This eliminates the need for try-catch
 * blocks in every async route handler.
 *
 * @param {Function} fn - Async route handler function
 * @returns {Function} Wrapped function with error handling
 *
 * @example
 * // Instead of:
 * router.get('/users', async (req, res, next) => {
 *   try {
 *     const users = await User.find();
 *     res.json(users);
 *   } catch (error) {
 *     next(error);
 *   }
 * });
 *
 * // Use:
 * router.get('/users', asyncHandler(async (req, res) => {
 *   const users = await User.find();
 *   res.json(users);
 * }));
 */
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
