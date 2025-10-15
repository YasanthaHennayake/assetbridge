/**
 * Complete User Lifecycle E2E Test
 *
 * This test covers the complete user lifecycle as specified in Sprint 2 (TS-2.3):
 * 1. Admin logs in
 * 2. Admin navigates to Settings > Users
 * 3. Admin creates new user and captures generated password
 * 4. Admin logs out
 * 5. New user logs in with generated password
 * 6. System prompts for password change (NOT IMPLEMENTED YET - will be added in future)
 * 7. New user changes password successfully (NOT IMPLEMENTED YET)
 * 8. New user logs out
 * 9. New user logs in with new password
 * 10. New user accesses Settings > Users successfully
 * 11. New user logs out
 * 12. New user logs in again (verify no password change prompt)
 *
 * NOTE: Password change flow will be implemented in a future update
 */

import { test, expect } from '@playwright/test';
import {
  TEST_USERS,
  login,
  logout,
  createUser,
  assertLoggedIn,
  assertLoggedOut,
  setupConsoleErrorListener,
  waitForApiResponse,
} from './helpers/test-helpers';

test.describe('Complete User Lifecycle', () => {
  // Generate unique email for test user to avoid conflicts
  const testUserEmail = `testuser_${Date.now()}@assetbridge.com`;
  const testUserName = 'Test User';
  let generatedPassword: string;

  test('should complete full user lifecycle flow', async ({ page }) => {
    const errorListener = setupConsoleErrorListener(page);

    // ============================================================
    // STEP 1: Admin logs in
    // ============================================================
    console.log('STEP 1: Admin logs in');
    await login(page, TEST_USERS.admin.email, TEST_USERS.admin.password);
    await assertLoggedIn(page);
    await expect(page.locator('.user-name')).toContainText(TEST_USERS.admin.name);

    // ============================================================
    // STEP 2: Admin navigates to Settings > Users
    // ============================================================
    console.log('STEP 2: Admin navigates to Settings > Users');
    await page.click('text=User Management');
    await page.waitForURL('**/settings/users');
    await expect(page.locator('h1:has-text("User Management")')).toBeVisible();

    // ============================================================
    // STEP 3: Admin creates new user and captures generated password
    // ============================================================
    console.log('STEP 3: Admin creates new user');
    generatedPassword = await createUser(page, testUserName, testUserEmail);
    expect(generatedPassword).toBeTruthy();
    expect(generatedPassword.length).toBeGreaterThanOrEqual(12);
    console.log(`Generated password: ${generatedPassword}`);

    // Verify user appears in the list
    await expect(page.locator(`text=${testUserEmail}`)).toBeVisible();

    // ============================================================
    // STEP 4: Admin logs out
    // ============================================================
    console.log('STEP 4: Admin logs out');
    await logout(page);
    await assertLoggedOut(page);

    // ============================================================
    // STEP 5: New user logs in with generated password
    // ============================================================
    console.log('STEP 5: New user logs in with generated password');
    await login(page, testUserEmail, generatedPassword);
    await assertLoggedIn(page);
    await expect(page.locator('.user-name')).toContainText(testUserName);

    // NOTE: Steps 6-7 (password change flow) will be implemented in future
    // For now, we'll test with the generated password throughout

    // ============================================================
    // STEP 8: New user logs out
    // ============================================================
    console.log('STEP 8: New user logs out');
    await logout(page);
    await assertLoggedOut(page);

    // ============================================================
    // STEP 9: New user logs in again (with generated password for now)
    // ============================================================
    console.log('STEP 9: New user logs in again');
    await login(page, testUserEmail, generatedPassword);
    await assertLoggedIn(page);

    // ============================================================
    // STEP 10: New user accesses Settings > Users successfully
    // ============================================================
    console.log('STEP 10: New user accesses Settings > Users');
    await page.click('text=User Management');
    await page.waitForURL('**/settings/users');
    await expect(page.locator('h1:has-text("User Management")')).toBeVisible();

    // Verify the user can see the users list
    await expect(page.locator(`text=${testUserEmail}`)).toBeVisible();

    // ============================================================
    // STEP 11: New user logs out
    // ============================================================
    console.log('STEP 11: New user logs out');
    await logout(page);
    await assertLoggedOut(page);

    // ============================================================
    // STEP 12: New user logs in again (verify persistent behavior)
    // ============================================================
    console.log('STEP 12: New user logs in one more time');
    await login(page, testUserEmail, generatedPassword);
    await assertLoggedIn(page);
    await expect(page.locator('.user-name')).toContainText(testUserName);

    // Verify can still access user management
    await page.goto('/settings/users');
    await expect(page.locator('h1:has-text("User Management")')).toBeVisible();

    // Final logout
    await logout(page);

    // ============================================================
    // Verify no console errors throughout the entire flow
    // ============================================================
    console.log('Checking for console errors...');
    errorListener.assertNoErrors();

    console.log('✅ Complete user lifecycle test passed!');
  });

  test('should verify admin can see newly created users', async ({ page }) => {
    const newUserEmail = `another_user_${Date.now()}@assetbridge.com`;

    // Login as admin
    await login(page, TEST_USERS.admin.email, TEST_USERS.admin.password);

    // Navigate to users page
    await page.goto('/settings/users');

    // Wait for table to load
    await page.waitForSelector('table tbody tr', { timeout: 10000 });

    // Get initial user count
    const userRowsBefore = await page.locator('table tbody tr').count();

    // Create a new user
    await createUser(page, 'Another Test User', newUserEmail);

    // Wait for the new user to appear in the list
    await expect(page.locator(`text=${newUserEmail}`)).toBeVisible();

    // Verify user count increased
    const userRowsAfter = await page.locator('table tbody tr').count();
    expect(userRowsAfter).toBe(userRowsBefore + 1);
  });

  test('should support search functionality', async ({ page }) => {
    // Login as admin
    await login(page, TEST_USERS.admin.email, TEST_USERS.admin.password);

    // Navigate to users page
    await page.goto('/settings/users');

    // Search for admin
    await page.fill('input[placeholder*="Search"]', 'admin');

    // Wait for search results
    await page.waitForTimeout(500);

    // Should show admin user
    await expect(page.locator(`text=${TEST_USERS.admin.email}`)).toBeVisible();
  });

  test('should display user status correctly', async ({ page }) => {
    const userEmail = `status_test_${Date.now()}@assetbridge.com`;

    // Login as admin
    await login(page, TEST_USERS.admin.email, TEST_USERS.admin.password);

    // Navigate to users page and create user
    await page.goto('/settings/users');
    await createUser(page, 'Status Test User', userEmail);

    // Find the user row
    const userRow = page.locator(`tr:has-text("${userEmail}")`);

    // Should show "Password Change Required" status
    await expect(userRow.locator('text=Password Change Required')).toBeVisible();
  });

  test('should validate duplicate email prevention', async ({ page }) => {
    const duplicateEmail = `duplicate_${Date.now()}@assetbridge.com`;

    // Login as admin
    await login(page, TEST_USERS.admin.email, TEST_USERS.admin.password);

    // Create first user
    await page.goto('/settings/users');
    await createUser(page, 'First User', duplicateEmail);

    // Try to create second user with same email
    await page.click('button:has-text("Create User")');
    await page.fill('input[id="name"]', 'Second User');
    await page.fill('input[id="email"]', duplicateEmail);
    await page.click('button[type="submit"]:has-text("Create User")');

    // Should show error (use .first() to avoid strict mode violation)
    await expect(page.locator('text=/already exists/i').first()).toBeVisible({ timeout: 5000 });
  });
});
