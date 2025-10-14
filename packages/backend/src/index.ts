/**
 * Application Entry Point
 *
 * This file is the main entry point for the AssetBridge backend server.
 * It initializes the Express application, connects to MongoDB, and starts
 * listening for incoming HTTP requests.
 *
 * The startup sequence:
 * 1. Load environment variables from .env file
 * 2. Connect to MongoDB Atlas database
 * 3. Start Express server on specified port
 *
 * Environment Variables Required:
 * - PORT: Server port (default: 5001)
 * - NODE_ENV: Environment name (development/production)
 * - MONGODB_URI: MongoDB connection string
 */

import dotenv from 'dotenv';
import app from './app';
import { connectDatabase } from './config/database';

// Load environment variables from .env file into process.env
// This must be done before any other code that uses environment variables
dotenv.config();

// Get the port from environment variable or use default 5001
// Heroku automatically sets PORT environment variable
const PORT = process.env.PORT || 5001;

/**
 * Start the server
 *
 * This async function handles the complete server startup process:
 * 1. Establishes connection to MongoDB database
 * 2. Starts the Express server to listen for HTTP requests
 * 3. Logs success messages with server information
 * 4. Handles any startup errors by logging and exiting the process
 *
 * @throws Will exit process with code 1 if startup fails
 */
const startServer = async () => {
  try {
    // Connect to MongoDB Atlas database
    // This will throw an error if connection fails
    await connectDatabase();

    // Start Express server and listen on the specified port
    // The callback function runs once the server is successfully listening
    app.listen(PORT, () => {
      console.log(`✓ Server running on port ${PORT}`);
      console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`✓ API available at http://localhost:${PORT}/api`);
    });
  } catch (error) {
    // Log the error and exit the process with failure code
    // This ensures the application doesn't run in a broken state
    console.error('✗ Failed to start server:', error);
    process.exit(1);
  }
};

// Execute the server startup function
startServer();
