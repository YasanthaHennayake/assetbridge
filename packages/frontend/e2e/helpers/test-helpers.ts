/**
 * E2E Test Helpers
 *
 * Utility functions for end-to-end testing with Playwright
 */

import { Page, expect } from '@playwright/test';

/**
 * Test user credentials
 */
export const TEST_USERS = {
  admin: {
    email: 'admin@assetbridge.com',
    password: 'Admin123!',
    name: 'Admin User',
  },
};

/**
 * Login helper
 *
 * Logs in a user and waits for dashboard to load
 */
export async function login(page: Page, email: string, password: string) {
  await page.goto('/login');
  // Use ID selector instead of type selector for more reliability
  await page.fill('input#email', email);
  await page.fill('input#password', password);
  await page.click('button[type="submit"]');

  // Wait for navigation to dashboard
  await page.waitForURL('**/dashboard', { timeout: 10000 });
}

/**
 * Logout helper
 *
 * Logs out the current user
 */
export async function logout(page: Page) {
  await page.click('button:has-text("Logout")');
  await page.waitForURL('**/login', { timeout: 10000 });
}

/**
 * Create user helper
 *
 * Creates a new user and returns the generated password
 */
export async function createUser(page: Page, name: string, email: string): Promise<string> {
  // Navigate to users page
  await page.goto('/settings/users');

  // Click create user button
  await page.click('button:has-text("Create User")');

  // Fill in the form
  await page.fill('input[id="name"]', name);
  await page.fill('input[id="email"]', email);

  // Submit the form
  await page.click('button[type="submit"]:has-text("Create User")');

  // Wait for success message and extract password
  await page.waitForSelector('text=User created successfully', { timeout: 10000 });

  const passwordElement = await page.locator('.password-display strong');
  const generatedPassword = await passwordElement.textContent();

  if (!generatedPassword) {
    throw new Error('Failed to get generated password');
  }

  // Close the modal
  await page.click('button:has-text("Close")');

  return generatedPassword;
}

/**
 * Check for console errors
 *
 * Listens for console errors and fails the test if any critical errors occur
 */
export function setupConsoleErrorListener(page: Page) {
  const errors: string[] = [];

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });

  page.on('pageerror', (error) => {
    errors.push(error.message);
  });

  return {
    getErrors: () => errors,
    assertNoErrors: () => {
      if (errors.length > 0) {
        throw new Error(`Console errors detected:\n${errors.join('\n')}`);
      }
    },
  };
}

/**
 * Wait for API request
 *
 * Waits for a specific API endpoint to be called
 */
export async function waitForApiRequest(page: Page, urlPattern: string | RegExp) {
  return page.waitForRequest(
    (request) => {
      const url = request.url();
      if (typeof urlPattern === 'string') {
        return url.includes(urlPattern);
      }
      return urlPattern.test(url);
    },
    { timeout: 10000 }
  );
}

/**
 * Wait for API response
 *
 * Waits for a specific API endpoint response
 */
export async function waitForApiResponse(page: Page, urlPattern: string | RegExp) {
  return page.waitForResponse(
    (response) => {
      const url = response.url();
      if (typeof urlPattern === 'string') {
        return url.includes(urlPattern);
      }
      return urlPattern.test(url);
    },
    { timeout: 10000 }
  );
}

/**
 * Take screenshot with name
 */
export async function takeScreenshot(page: Page, name: string) {
  await page.screenshot({ path: `e2e/screenshots/${name}.png`, fullPage: true });
}

/**
 * Assert user is logged in
 */
export async function assertLoggedIn(page: Page) {
  await expect(page).toHaveURL(/\/dashboard/);
  await expect(page.locator('button:has-text("Logout")')).toBeVisible();
}

/**
 * Assert user is logged out
 */
export async function assertLoggedOut(page: Page) {
  await expect(page).toHaveURL(/\/login/);
  await expect(page.locator('h2:has-text("Login")')).toBeVisible();
}
