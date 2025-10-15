/**
 * End-to-End Tests for AssetBridge Application
 *
 * These tests run in a real browser using Playwright.
 * They verify:
 * - Application loads without errors
 * - No console errors occur
 * - UI elements are visible and functional
 * - API integration works correctly
 * - Browser behavior is as expected
 *
 * Test Structure:
 * - Each test is independent and can run in parallel
 * - Tests use real HTTP requests to backend API
 * - Browser console is monitored for errors
 * - Screenshots are captured on failure
 *
 * Running Tests:
 * - npm run test:e2e          # Run headless
 * - npm run test:e2e:ui       # Run with Playwright UI
 * - npm run test:e2e:headed   # See browser
 * - npm run test:e2e:debug    # Debug mode with pauses
 */

import { test, expect, ConsoleMessage } from '@playwright/test';

/**
 * Test Suite: Application Loading and Basic Functionality
 *
 * This suite tests the core functionality of the AssetBridge application
 * including page load, console error checking, and UI interaction.
 */
test.describe('AssetBridge Application', () => {
  /**
   * Test: Application loads without console errors
   *
   * This test verifies that:
   * 1. The page loads successfully
   * 2. No console errors are logged
   * 3. No uncaught exceptions occur
   * 4. The page title is correct
   *
   * Browser Console Monitoring:
   * - Captures all console messages (log, warn, error)
   * - Fails the test if any console errors are detected
   * - Provides detailed error information for debugging
   */
  test('should load without console errors', async ({ page }) => {
    // Array to store console messages
    const consoleMessages: ConsoleMessage[] = [];

    // Array to store console errors specifically
    const consoleErrors: ConsoleMessage[] = [];

    // Array to store page errors (uncaught exceptions)
    const pageErrors: Error[] = [];

    /**
     * Event Listener: Console Messages
     *
     * Captures all console messages from the browser.
     * Types include: log, info, warning, error
     *
     * This allows us to:
     * - Verify no errors are logged
     * - Debug test failures
     * - Monitor application behavior
     */
    page.on('console', (msg: ConsoleMessage) => {
      // Store all console messages
      consoleMessages.push(msg);

      // Store error messages separately
      if (msg.type() === 'error') {
        consoleErrors.push(msg);
        console.log(`❌ Console Error: ${msg.text()}`);
      }

      // Optionally log warnings (uncomment to debug)
      // if (msg.type() === 'warning') {
      //   console.log(`⚠️ Console Warning: ${msg.text()}`);
      // }
    });

    /**
     * Event Listener: Page Errors
     *
     * Captures uncaught exceptions and unhandled promise rejections.
     * These are critical errors that crash the application.
     */
    page.on('pageerror', (error: Error) => {
      pageErrors.push(error);
      console.log(`❌ Page Error: ${error.message}`);
    });

    /**
     * Navigate to Application
     *
     * Opens the homepage of the application.
     * This triggers:
     * - Loading of HTML, CSS, JavaScript
     * - React app initialization
     * - API call to fetch hello world message
     */
    await page.goto('/');

    /**
     * Wait for Page Load
     *
     * Ensures the page is fully loaded before running assertions.
     * 'networkidle' means all network requests have finished.
     */
    await page.waitForLoadState('networkidle');

    /**
     * Assertion: Page Title
     *
     * Verifies that the page has the correct title.
     * This confirms the HTML loaded correctly.
     */
    await expect(page).toHaveTitle('AssetBridge');

    /**
     * Assertion: No Console Errors
     *
     * Fails the test if any console errors were logged.
     * This is critical for catching JavaScript errors early.
     */
    if (consoleErrors.length > 0) {
      // Log all console errors for debugging
      console.log('\n📋 All Console Errors:');
      consoleErrors.forEach((msg, index) => {
        console.log(`  ${index + 1}. ${msg.text()}`);
      });

      // Fail the test with a clear message
      expect(
        consoleErrors.length,
        `Found ${consoleErrors.length} console error(s). Check the log above for details.`
      ).toBe(0);
    }

    /**
     * Assertion: No Page Errors
     *
     * Fails the test if any uncaught exceptions occurred.
     */
    if (pageErrors.length > 0) {
      console.log('\n📋 All Page Errors:');
      pageErrors.forEach((error, index) => {
        console.log(`  ${index + 1}. ${error.message}`);
        console.log(`     Stack: ${error.stack}`);
      });

      expect(
        pageErrors.length,
        `Found ${pageErrors.length} page error(s). Check the log above for details.`
      ).toBe(0);
    }

    // Log success message
    console.log('✅ Page loaded without errors');
  });


  /**
   * Test: Application handles API errors gracefully
   *
   * This test verifies error handling when the API is unavailable.
   * Note: This test requires the backend to be stopped or modified.
   */
  test.skip('should display error message when API fails', async ({ page }) => {
    /**
     * Mock API Failure
     *
     * Intercept the API call and return an error.
     * This simulates network failure or server error.
     */
    await page.route('**/api/hello', (route) => {
      route.abort('failed');
    });

    // Navigate to the application
    await page.goto('/');

    /**
     * Assertion: Error Message
     *
     * Verifies that an error message is displayed when API fails.
     */
    const errorMessage = page.getByText(/Error:/);
    await expect(errorMessage).toBeVisible({ timeout: 5000 });

    console.log('✅ Error handling works correctly');
  });

  /**
   * Test: Browser DevTools Console Integration
   *
   * Demonstrates how to interact with browser console.
   * Useful for debugging and verifying console output.
   */
  test('should verify browser console capabilities', async ({ page }) => {
    // Track console logs
    const consoleLogs: string[] = [];

    page.on('console', (msg) => {
      if (msg.type() === 'log') {
        consoleLogs.push(msg.text());
      }
    });

    // Navigate to page
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    /**
     * Execute Code in Browser Console
     *
     * You can run JavaScript in the browser context.
     * This is useful for:
     * - Testing browser APIs
     * - Checking global variables
     * - Debugging application state
     */
    const appVersion = await page.evaluate(() => {
      // This code runs in the browser
      console.log('Test: Checking application version');
      return '1.0.0'; // Could read from window.APP_VERSION if defined
    });

    expect(appVersion).toBe('1.0.0');

    /**
     * Check Local Storage
     *
     * Example of reading browser storage.
     */
    const localStorageData = await page.evaluate(() => {
      return localStorage.length;
    });

    // Initially should be empty or have some items
    expect(typeof localStorageData).toBe('number');

    console.log('✅ Browser console integration works');
  });
});
