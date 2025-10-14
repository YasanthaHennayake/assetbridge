/**
 * Application Entry Point
 *
 * This file is the entry point for the React application.
 * It initializes the React root and renders the App component.
 *
 * Key Concepts:
 * - ReactDOM.createRoot: React 18+ API for creating a root
 * - StrictMode: Development mode wrapper that helps identify potential problems
 * - document.getElementById('root'): Mounts the app to the #root div in index.html
 *
 * The HTML structure starts in index.html with:
 * <div id="root"></div>
 * <script type="module" src="/src/main.tsx"></script>
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';

// Create a React root for the entire application
// The '!' is a non-null assertion operator telling TypeScript that
// we're certain the element exists (it's defined in index.html)
ReactDOM.createRoot(document.getElementById('root')!).render(
  // StrictMode is a development-only tool that:
  // - Identifies components with unsafe lifecycles
  // - Warns about legacy string ref API usage
  // - Warns about deprecated findDOMNode usage
  // - Detects unexpected side effects
  // - Detects legacy context API
  // Note: StrictMode renders components twice in development to detect problems
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
