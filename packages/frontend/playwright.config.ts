/**
 * Playwright Configuration
 *
 * This file configures Playwright for end-to-end (E2E) browser testing.
 * Playwright allows you to:
 * - Test in real browsers (Chromium, Firefox, WebKit)
 * - Capture console logs and errors
 * - Take screenshots and videos
 * - Debug with browser DevTools
 * - Test responsive designs
 *
 * Configuration Overview:
 * - Tests are located in e2e/ directory
 * - Tests run against local dev server (http://localhost:3000)
 * - Automatically starts/stops the dev server
 * - Captures screenshots on failure
 * - Records video on first retry
 *
 * Running Tests:
 * - npm run test:e2e          # Run all E2E tests headless
 * - npm run test:e2e:ui       # Run with Playwright UI
 * - npm run test:e2e:headed   # Run with browser visible
 * - npm run test:e2e:debug    # Run in debug mode
 */

import { defineConfig, devices } from '@playwright/test';

/**
 * See https://playwright.dev/docs/test-configuration for all options
 */
export default defineConfig({
  // Directory where test files are located
  testDir: './e2e',

  // Maximum time one test can run (30 seconds)
  timeout: 30 * 1000,

  // Run tests in files in parallel
  fullyParallel: true,

  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,

  // Retry on CI only (0 retries locally, 2 on CI)
  retries: process.env.CI ? 2 : 0,

  // Number of parallel workers
  // CI: 1 worker (more stable)
  // Local: Use half of available CPU cores
  workers: process.env.CI ? 1 : undefined,

  // Reporter configuration
  // - 'html' generates an HTML report (playwright-report/)
  // - 'list' shows test progress in terminal
  reporter: [['html'], ['list']],

  /**
   * Shared settings for all tests
   * These options are passed to each test
   */
  use: {
    // Base URL for navigation
    // Instead of page.goto('http://localhost:3000'), use page.goto('/')
    baseURL: 'http://localhost:3000',

    // Collect trace on first retry
    // Traces include screenshots, network logs, and more for debugging
    trace: 'on-first-retry',

    // Take screenshot on test failure
    // Options: 'off' | 'on' | 'only-on-failure'
    screenshot: 'only-on-failure',

    // Record video on first retry
    // Options: 'off' | 'on' | 'retain-on-failure' | 'on-first-retry'
    video: 'on-first-retry',
  },

  /**
   * Test Projects - Different browser configurations
   *
   * Each project runs all tests in a specific browser/device configuration.
   * You can run specific projects with: npx playwright test --project=chromium
   */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    // Uncomment to test in Firefox
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },

    // Uncomment to test in WebKit (Safari)
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },

    // Uncomment to test on mobile viewports
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },
  ],

  /**
   * Web Server Configuration
   *
   * Playwright will automatically start the dev server before running tests
   * and shut it down after tests complete.
   *
   * This ensures:
   * - Tests always run against a fresh server
   * - No need to manually start the dev server
   * - Server is automatically cleaned up
   */
  webServer: {
    // Command to start the dev server
    command: 'npm run dev',

    // URL to check if server is ready
    url: 'http://localhost:3000',

    // Reuse existing server if already running
    // Set to false to always start a fresh server
    reuseExistingServer: !process.env.CI,

    // Maximum time to wait for server to start (120 seconds)
    timeout: 120 * 1000,

    // Output server logs to console
    // Options: 'pipe' | 'ignore'
    stdout: 'pipe',
    stderr: 'pipe',
  },
});
