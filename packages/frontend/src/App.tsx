/**
 * App Component
 *
 * The root component of the AssetBridge frontend application.
 * This component demonstrates:
 * - React hooks (useState, useEffect)
 * - Async data fetching
 * - Error handling and loading states
 * - Type-safe state management
 * - Conditional rendering
 *
 * Component Responsibilities:
 * - Fetch hello world data from the backend API
 * - Display loading, error, or success states
 * - Show tech stack information
 */

import { useEffect, useState } from 'react';
import { api } from './services/api';
import type { HelloWorldResponse } from '@assetbridge/shared';
import './App.css';

/**
 * Main App Component
 *
 * Manages three states:
 * 1. Loading: While fetching data from API
 * 2. Error: If the API call fails
 * 3. Success: When data is successfully fetched
 */
function App() {
  // State: Stores the API response data
  // Initially null until data is fetched
  const [data, setData] = useState<HelloWorldResponse | null>(null);

  // State: Tracks loading status
  // Starts as true because we fetch on mount
  const [loading, setLoading] = useState(true);

  // State: Stores error message if fetch fails
  // null means no error
  const [error, setError] = useState<string | null>(null);

  /**
   * Effect Hook: Fetch Data on Component Mount
   *
   * This effect runs once when the component mounts (empty dependency array).
   * It fetches the hello world message from the backend API.
   *
   * Flow:
   * 1. Set loading to true
   * 2. Call API to fetch data
   * 3. On success: Update data state and clear error
   * 4. On failure: Update error state
   * 5. Finally: Set loading to false
   */
  useEffect(() => {
    /**
     * Async function to fetch data from API
     * Separated into its own function because useEffect callback cannot be async
     */
    const fetchData = async () => {
      try {
        // Show loading state
        setLoading(true);

        // Call the API service
        const response = await api.getHelloWorld();

        // Update state with successful response
        setData(response);
        setError(null); // Clear any previous errors
      } catch (err) {
        // Handle errors by extracting the error message
        // Check if err is an Error instance to safely access .message
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        // Always hide loading state, regardless of success or failure
        setLoading(false);
      }
    };

    // Execute the fetch function
    fetchData();
  }, []); // Empty dependency array = run once on mount

  /**
   * Render Method
   *
   * Conditionally renders different UI based on current state:
   * - If loading: Show "Loading..." message
   * - If error: Show error message in red
   * - If data: Show the hello world message and timestamp
   * - Always: Show tech stack information at the bottom
   */
  return (
    <div className="app">
      <div className="container">
        {/* Application Header */}
        <h1>AssetBridge</h1>
        <p className="subtitle">Procurement and Asset Management System</p>

        {/* Main Content Box - Shows loading, error, or data */}
        <div className="message-box">
          {/* Conditional Rendering: Show loading state */}
          {loading && <p>Loading...</p>}

          {/* Conditional Rendering: Show error state */}
          {error && (
            <div className="error">
              <p>Error: {error}</p>
            </div>
          )}

          {/* Conditional Rendering: Show success state with data */}
          {data && !error && (
            <div className="success">
              <h2>{data.message}</h2>
              <p className="timestamp">
                {/* Format timestamp to local date/time string */}
                Timestamp: {new Date(data.timestamp).toLocaleString()}
              </p>
            </div>
          )}
        </div>

        {/* Tech Stack Information - Always Visible */}
        <div className="info">
          <p>✓ Frontend: React + Vite + TypeScript</p>
          <p>✓ Backend: Node.js + Express + TypeScript</p>
          <p>✓ Database: MongoDB Atlas</p>
          <p>✓ Monorepo: npm workspaces</p>
        </div>
      </div>
    </div>
  );
}

// Export the component as the default export
export default App;
