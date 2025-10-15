/**
 * Test Setup and Utilities
 *
 * This file provides test setup, database management, and utilities
 * for backend API testing.
 *
 * Features:
 * - In-memory MongoDB database for testing
 * - Database lifecycle management (setup, teardown, cleanup)
 * - Test user creation helpers
 * - Token generation for authenticated requests
 */

import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import User from '../models/User';
import { hashPassword } from '../utils/password';
import { generateToken } from '../utils/jwt';

let mongoServer: MongoMemoryServer;

/**
 * Connect to in-memory MongoDB database
 *
 * Called before all tests to set up the test database
 */
export const connectDatabase = async (): Promise<void> => {
  // Create in-memory MongoDB instance
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();

  // Connect mongoose to in-memory database
  await mongoose.connect(mongoUri);
};

/**
 * Disconnect from database and stop server
 *
 * Called after all tests to clean up
 */
export const closeDatabase = async (): Promise<void> => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
};

/**
 * Clear all collections in the database
 *
 * Called before/after each test to ensure clean state
 */
export const clearDatabase = async (): Promise<void> => {
  const collections = mongoose.connection.collections;

  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
};

/**
 * Create a test user in the database
 *
 * @param userData - User data to create
 * @returns Created user document
 */
export const createTestUser = async (userData: {
  name: string;
  email: string;
  password: string;
  mustChangePassword?: boolean;
}) => {
  const hashedPassword = await hashPassword(userData.password);

  const user = await User.create({
    name: userData.name,
    email: userData.email,
    password: hashedPassword,
    mustChangePassword: userData.mustChangePassword || false,
  });

  return user;
};

/**
 * Generate auth token for a user
 *
 * @param userId - User's MongoDB ObjectId
 * @param email - User's email
 * @returns JWT token
 */
export const generateAuthToken = (userId: string, email: string): string => {
  return generateToken(userId, email);
};
