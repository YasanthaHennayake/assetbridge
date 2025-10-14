/**
 * Database Connection Configuration
 *
 * This module handles MongoDB database connection and disconnection using Mongoose ODM.
 * It provides utility functions for establishing and closing database connections.
 *
 * Mongoose is an Object Data Modeling (ODM) library that provides:
 * - Schema validation
 * - Type casting
 * - Query building
 * - Business logic hooks
 *
 * Environment Variables Used:
 * - MONGODB_URI: MongoDB connection string (format: mongodb+srv://user:pass@cluster.mongodb.net/dbname)
 */

import mongoose from 'mongoose';

/**
 * Connect to MongoDB Database
 *
 * Establishes a connection to MongoDB Atlas using the connection string from environment variables.
 * This function should be called before starting the Express server to ensure database availability.
 *
 * Connection Process:
 * 1. Retrieves MongoDB URI from environment variables
 * 2. Validates that the URI is provided
 * 3. Attempts to connect using Mongoose
 * 4. Logs success or failure
 *
 * Error Handling:
 * - If MONGODB_URI is not set: Logs warning and returns (allows server to run without DB)
 * - If connection fails: Logs error and exits process (prevents server from running in broken state)
 *
 * @returns {Promise<void>} Resolves when connection is established
 * @throws Will exit process with code 1 if connection fails
 */
export const connectDatabase = async (): Promise<void> => {
  try {
    // Retrieve MongoDB connection string from environment variables
    const mongoUri = process.env.MONGODB_URI;

    // Check if MongoDB URI is configured
    // In development, you might want to run without a database initially
    if (!mongoUri) {
      console.warn('MONGODB_URI not set. Database connection skipped.');
      return;
    }

    // Attempt to connect to MongoDB using Mongoose
    // Mongoose automatically handles connection pooling and reconnection logic
    await mongoose.connect(mongoUri);
    console.log('✓ MongoDB connected successfully');
  } catch (error) {
    // If connection fails, log the error and exit the process
    // This prevents the server from running in an inconsistent state
    console.error('✗ MongoDB connection error:', error);
    process.exit(1);
  }
};

/**
 * Disconnect from MongoDB Database
 *
 * Gracefully closes the MongoDB connection.
 * This function should be called during application shutdown to clean up resources.
 *
 * Use cases:
 * - Application shutdown
 * - Testing cleanup (close connection after tests complete)
 * - Graceful restart scenarios
 *
 * @returns {Promise<void>} Resolves when disconnection is complete
 */
export const disconnectDatabase = async (): Promise<void> => {
  try {
    // Close all Mongoose connections
    await mongoose.disconnect();
    console.log('✓ MongoDB disconnected');
  } catch (error) {
    // Log error but don't exit - we're shutting down anyway
    console.error('✗ Error disconnecting from MongoDB:', error);
  }
};
