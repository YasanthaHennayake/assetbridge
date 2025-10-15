/**
 * Authentication E2E Tests
 *
 * Tests the complete authentication flow including:
 * - Login with valid credentials
 * - Login with invalid credentials
 * - Logout
 * - Protected route access
 * - Session persistence
 */

import { test, expect } from '@playwright/test';
import {
  TEST_USERS,
  login,
  logout,
  assertLoggedIn,
  assertLoggedOut,
  setupConsoleErrorListener,
} from './helpers/test-helpers';

test.describe('Authentication Flow', () => {
  test('should redirect to login when not authenticated', async ({ page }) => {
    await page.goto('/dashboard');
    await assertLoggedOut(page);
  });

  test('should login with valid credentials', async ({ page }) => {
    const errorListener = setupConsoleErrorListener(page);

    await page.goto('/login');

    // Fill in login form
    await page.fill('input#email', TEST_USERS.admin.email);
    await page.fill('input#password', TEST_USERS.admin.password);

    // Submit form
    await page.click('button[type="submit"]');

    // Should redirect to dashboard
    await assertLoggedIn(page);

    // Verify user name is displayed in the header
    await expect(page.locator('.user-name')).toContainText(TEST_USERS.admin.name);

    // Check for console errors
    errorListener.assertNoErrors();
  });

  test('should show error with invalid credentials', async ({ page }) => {
    await page.goto('/login');

    // Fill in login form with wrong password
    await page.fill('input#email', TEST_USERS.admin.email);
    await page.fill('input#password', 'WrongPassword123!');

    // Submit form
    await page.click('button[type="submit"]');

    // Should show error message
    await expect(page.locator('text=/invalid email or password/i')).toBeVisible();

    // Should still be on login page
    await assertLoggedOut(page);
  });

  test('should show validation error for empty fields', async ({ page }) => {
    await page.goto('/login');

    // Try to submit empty form
    await page.click('button[type="submit"]');

    // Should show validation error
    await expect(page.locator('text=/email and password are required/i')).toBeVisible();
  });

  test('should toggle password visibility', async ({ page }) => {
    await page.goto('/login');

    const passwordInput = page.locator('input[type="password"]');
    const toggleButton = page.locator('button[aria-label*="password"]');

    // Initially password should be hidden
    await expect(passwordInput).toHaveAttribute('type', 'password');

    // Click toggle to show password
    await toggleButton.click();
    await expect(page.locator('input[type="text"]')).toHaveCount(2); // email + password shown

    // Click toggle to hide password again
    await toggleButton.click();
    await expect(passwordInput).toHaveAttribute('type', 'password');
  });

  test('should logout successfully', async ({ page }) => {
    // Login first
    await login(page, TEST_USERS.admin.email, TEST_USERS.admin.password);
    await assertLoggedIn(page);

    // Logout
    await logout(page);

    // Should be redirected to login
    await assertLoggedOut(page);

    // Try to access protected route
    await page.goto('/dashboard');

    // Should redirect to login
    await assertLoggedOut(page);
  });

  test('should persist session on page refresh', async ({ page }) => {
    // Login
    await login(page, TEST_USERS.admin.email, TEST_USERS.admin.password);
    await assertLoggedIn(page);

    // Refresh page
    await page.reload();

    // Should still be logged in
    await assertLoggedIn(page);
    await expect(page.locator('.user-name')).toContainText(TEST_USERS.admin.name);
  });

  test('should protect routes from unauthenticated access', async ({ page }) => {
    // Try to access protected routes without logging in
    const protectedRoutes = ['/dashboard', '/settings/users'];

    for (const route of protectedRoutes) {
      await page.goto(route);
      await assertLoggedOut(page);
    }
  });

  test('should clear session storage on logout', async ({ page }) => {
    // Login
    await login(page, TEST_USERS.admin.email, TEST_USERS.admin.password);
    await assertLoggedIn(page);

    // Check token exists in localStorage
    const tokenBefore = await page.evaluate(() => localStorage.getItem('assetbridge_token'));
    expect(tokenBefore).toBeTruthy();

    // Logout
    await logout(page);

    // Check token is cleared
    const tokenAfter = await page.evaluate(() => localStorage.getItem('assetbridge_token'));
    expect(tokenAfter).toBeNull();
  });

  test('should handle network errors gracefully', async ({ page }) => {
    await page.goto('/login');

    // Offline the browser
    await page.context().setOffline(true);

    // Try to login
    await page.fill('input#email', TEST_USERS.admin.email);
    await page.fill('input#password', TEST_USERS.admin.password);
    await page.click('button[type="submit"]');

    // Should show error (error message may vary)
    await expect(page.locator('.error-message')).toBeVisible({ timeout: 10000 });

    // Go back online
    await page.context().setOffline(false);
  });
});
