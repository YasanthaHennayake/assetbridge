/**
 * Password Utility Functions
 *
 * This module provides secure password handling utilities for the AssetBridge system.
 * It includes functions for hashing, comparing, generating, and validating passwords.
 *
 * Security Features:
 * - Uses bcrypt for password hashing (industry standard)
 * - 12 salt rounds for strong protection against brute force attacks
 * - Cryptographically secure random password generation
 * - Comprehensive password strength validation
 */

import bcrypt from 'bcrypt';
import crypto from 'crypto';

/**
 * Number of salt rounds for bcrypt hashing.
 * Higher values = more secure but slower.
 * 12 rounds is a good balance between security and performance.
 */
const SALT_ROUNDS = 12;

/**
 * Hash a plain text password using bcrypt
 *
 * @param {string} password - Plain text password to hash
 * @returns {Promise<string>} Hashed password
 *
 * @example
 * const hashedPassword = await hashPassword('MySecurePass123!');
 * // Returns: '$2b$12$...' (60 character bcrypt hash)
 */
export const hashPassword = async (password: string): Promise<string> => {
  try {
    const hash = await bcrypt.hash(password, SALT_ROUNDS);
    return hash;
  } catch (error) {
    console.error('Error hashing password:', error);
    throw new Error('Failed to hash password');
  }
};

/**
 * Compare a plain text password with a hashed password
 *
 * @param {string} password - Plain text password to verify
 * @param {string} hashedPassword - Hashed password to compare against
 * @returns {Promise<boolean>} True if passwords match, false otherwise
 *
 * @example
 * const isValid = await comparePassword('MySecurePass123!', hashedPasswordFromDB);
 * if (isValid) {
 *   // Password is correct
 * }
 */
export const comparePassword = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  try {
    const isMatch = await bcrypt.compare(password, hashedPassword);
    return isMatch;
  } catch (error) {
    console.error('Error comparing passwords:', error);
    throw new Error('Failed to compare passwords');
  }
};

/**
 * Generate a secure random password
 *
 * Generates a password that meets security requirements:
 * - 16 characters long
 * - Contains uppercase letters (A-Z)
 * - Contains lowercase letters (a-z)
 * - Contains numbers (0-9)
 * - Contains special characters (!@#$%^&*)
 *
 * @returns {string} Randomly generated secure password
 *
 * @example
 * const newPassword = generatePassword();
 * // Returns: 'aB3!xY9@mK2#pL5$' (example, actual output is random)
 */
export const generatePassword = (): string => {
  // Character sets for password generation
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const special = '!@#$%^&*';

  // Combine all character sets
  const allChars = uppercase + lowercase + numbers + special;

  // Ensure password contains at least one character from each set
  let password = '';
  password += uppercase[crypto.randomInt(0, uppercase.length)];
  password += lowercase[crypto.randomInt(0, lowercase.length)];
  password += numbers[crypto.randomInt(0, numbers.length)];
  password += special[crypto.randomInt(0, special.length)];

  // Fill the rest of the password with random characters from all sets
  const remainingLength = 12; // Total length 16 (4 guaranteed + 12 random)
  for (let i = 0; i < remainingLength; i++) {
    password += allChars[crypto.randomInt(0, allChars.length)];
  }

  // Shuffle the password to avoid predictable patterns
  password = password
    .split('')
    .sort(() => Math.random() - 0.5)
    .join('');

  return password;
};

/**
 * Password Validation Error Interface
 */
export interface PasswordValidationError {
  field: string;
  message: string;
}

/**
 * Validate password strength and requirements
 *
 * Checks that a password meets the following requirements:
 * - At least 8 characters long
 * - Contains at least one uppercase letter
 * - Contains at least one lowercase letter
 * - Contains at least one number
 * - Contains at least one special character
 *
 * @param {string} password - Password to validate
 * @returns {PasswordValidationError[]} Array of validation errors (empty if valid)
 *
 * @example
 * const errors = validatePassword('weak');
 * if (errors.length > 0) {
 *   // Password doesn't meet requirements
 *   console.log(errors);
 * }
 */
export const validatePassword = (
  password: string
): PasswordValidationError[] => {
  const errors: PasswordValidationError[] = [];

  // Check minimum length
  if (password.length < 8) {
    errors.push({
      field: 'password',
      message: 'Password must be at least 8 characters long',
    });
  }

  // Check for uppercase letter
  if (!/[A-Z]/.test(password)) {
    errors.push({
      field: 'password',
      message: 'Password must contain at least one uppercase letter',
    });
  }

  // Check for lowercase letter
  if (!/[a-z]/.test(password)) {
    errors.push({
      field: 'password',
      message: 'Password must contain at least one lowercase letter',
    });
  }

  // Check for number
  if (!/[0-9]/.test(password)) {
    errors.push({
      field: 'password',
      message: 'Password must contain at least one number',
    });
  }

  // Check for special character
  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
    errors.push({
      field: 'password',
      message: 'Password must contain at least one special character',
    });
  }

  return errors;
};

/**
 * Calculate password strength score (0-4)
 *
 * Returns a score indicating password strength:
 * - 0: Very weak
 * - 1: Weak
 * - 2: Fair
 * - 3: Strong
 * - 4: Very strong
 *
 * @param {string} password - Password to evaluate
 * @returns {number} Strength score (0-4)
 *
 * @example
 * const strength = calculatePasswordStrength('MySecurePass123!');
 * // Returns: 4 (very strong)
 */
export const calculatePasswordStrength = (password: string): number => {
  let score = 0;

  // Length bonus
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;

  // Character variety bonus
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) score++;

  // Cap at 4
  return Math.min(score, 4);
};
