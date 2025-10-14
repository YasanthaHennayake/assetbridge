# End-to-End Testing Guide with Playwright

## Overview

This guide explains how to write and run E2E (End-to-End) tests for AssetBridge using Playwright. E2E tests simulate real user interactions in actual browsers, providing the highest level of confidence that your application works correctly.

## What is Playwright?

Playwright is a modern browser automation framework that allows you to:
- Test in multiple browsers (Chromium, Firefox, WebKit/Safari)
- Capture screenshots and videos
- Monitor network requests
- **Detect console errors automatically**
- Debug with browser DevTools
- Run tests in parallel for speed

## Setup

Playwright is already configured in the frontend package. The setup includes:

**Files:**
- `packages/frontend/playwright.config.ts` - Configuration
- `packages/frontend/e2e/` - Test files directory
- `packages/frontend/e2e/app.spec.ts` - Example tests

**Configuration Highlights:**
- Auto-starts dev server before tests
- Auto-stops dev server after tests
- Takes screenshots on failure
- Records video on first retry
- Captures traces for debugging

## Running Tests

### Basic Commands

```bash
cd packages/frontend

# Run all E2E tests (headless - no browser window)
npm run test:e2e

# Run with Playwright UI (recommended for development)
npm run test:e2e:ui

# Run with visible browser (see what's happening)
npm run test:e2e:headed

# Run in debug mode (step through tests)
npm run test:e2e:debug

# Run specific test file
npx playwright test e2e/app.spec.ts

# Run tests in specific browser
npx playwright test --project=chromium
```

### Playwright UI Mode (Recommended)

The UI mode is the best way to develop and debug tests:

```bash
npm run test:e2e:ui
```

Features:
- Watch tests run in real-time
- Time travel through test steps
- Inspect DOM at each step
- View console logs
- See network requests
- Retry failed tests

## Console Error Detection

One of the most powerful features is automatic console error detection.

### How It Works

The test setup includes listeners for browser console messages:

```typescript
test('should load without console errors', async ({ page }) => {
  const consoleErrors: ConsoleMessage[] = [];

  // Listen for console errors
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg);
    }
  });

  // Navigate and interact with page
  await page.goto('/');

  // Assert no console errors occurred
  expect(consoleErrors.length).toBe(0);
});
```

### What Gets Detected

- **Console Errors**: `console.error()` calls
- **Uncaught Exceptions**: Unhandled JavaScript errors
- **Unhandled Promise Rejections**: Async errors
- **Network Errors**: Failed HTTP requests (if monitored)
- **React Errors**: Component errors, prop type warnings

### Example Output

When an error is detected:

```
❌ Console Error: TypeError: Cannot read property 'map' of undefined
   at Array.map (<anonymous>)
   at App.tsx:45:23

Found 1 console error(s). Check the log above for details.
```

## Writing Tests

### Basic Test Structure

```typescript
import { test, expect } from '@playwright/test';

test('descriptive test name', async ({ page }) => {
  // Navigate to page
  await page.goto('/');

  // Interact with elements
  await page.click('button');
  await page.fill('input[name="email"]', 'test@example.com');

  // Make assertions
  await expect(page.getByRole('heading')).toBeVisible();
  await expect(page).toHaveTitle('Expected Title');
});
```

### Common Patterns

#### 1. Selecting Elements

```typescript
// By role (accessibility-first, recommended)
await page.getByRole('button', { name: 'Submit' });
await page.getByRole('heading', { name: 'Welcome' });
await page.getByRole('textbox', { name: 'Email' });

// By text
await page.getByText('Hello World');
await page.getByText(/Hello.*World/); // Regex

// By test ID
await page.getByTestId('submit-button');

// By CSS selector (last resort)
await page.locator('.my-class');
await page.locator('#my-id');
```

#### 2. Interactions

```typescript
// Click
await page.click('button');
await page.getByRole('button').click();

// Type
await page.fill('input', 'text');
await page.type('input', 'text', { delay: 100 }); // Slower typing

// Select dropdown
await page.selectOption('select', 'option-value');

// Check/uncheck
await page.check('input[type="checkbox"]');
await page.uncheck('input[type="checkbox"]');

// Hover
await page.hover('.menu-item');

// Upload file
await page.setInputFiles('input[type="file"]', 'path/to/file.pdf');
```

#### 3. Waiting

```typescript
// Wait for element
await page.waitForSelector('.loading', { state: 'hidden' });
await page.waitForSelector('.data', { state: 'visible' });

// Wait for navigation
await page.waitForURL('**/dashboard');

// Wait for network
await page.waitForLoadState('networkidle');

// Wait for function
await page.waitForFunction(() => window.dataLoaded === true);

// Custom timeout
await page.waitForSelector('.slow-element', { timeout: 10000 });
```

#### 4. Assertions

```typescript
// Visibility
await expect(page.getByText('Welcome')).toBeVisible();
await expect(page.getByText('Hidden')).toBeHidden();

// Content
await expect(page).toHaveTitle('AssetBridge');
await expect(page).toHaveURL(/dashboard/);
await expect(page.getByRole('heading')).toHaveText('Dashboard');
await expect(page.locator('.count')).toContainText('5');

// Attributes
await expect(page.locator('button')).toBeEnabled();
await expect(page.locator('button')).toBeDisabled();
await expect(page.locator('input')).toHaveValue('test@example.com');
await expect(page.locator('a')).toHaveAttribute('href', '/about');

// Count
await expect(page.locator('.item')).toHaveCount(5);

// Screenshot comparison
await expect(page).toHaveScreenshot('homepage.png');
```

### Testing Console Errors

```typescript
test('should detect console errors', async ({ page }) => {
  const consoleErrors: string[] = [];

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
      console.log(`Console Error: ${msg.text()}`);
    }
  });

  // Also capture page errors (uncaught exceptions)
  const pageErrors: Error[] = [];
  page.on('pageerror', (error) => {
    pageErrors.push(error);
    console.log(`Page Error: ${error.message}`);
  });

  await page.goto('/');

  // Interact with page...

  // Assert no errors
  expect(consoleErrors, 'Console errors detected').toHaveLength(0);
  expect(pageErrors, 'Page errors detected').toHaveLength(0);
});
```

### Testing Network Requests

```typescript
test('should verify API calls', async ({ page }) => {
  // Wait for specific request
  const responsePromise = page.waitForResponse('**/api/hello');
  await page.goto('/');
  const response = await responsePromise;

  // Assert response
  expect(response.status()).toBe(200);
  const data = await response.json();
  expect(data.success).toBe(true);
});

test('should mock API failure', async ({ page }) => {
  // Intercept and modify request
  await page.route('**/api/hello', (route) => {
    route.fulfill({
      status: 500,
      body: JSON.stringify({ success: false, error: 'Server error' }),
    });
  });

  await page.goto('/');

  // Verify error handling
  await expect(page.getByText(/Error:/)).toBeVisible();
});
```

### Browser Context

```typescript
test('should handle localStorage', async ({ page }) => {
  // Set localStorage before navigation
  await page.goto('/');
  await page.evaluate(() => {
    localStorage.setItem('token', 'abc123');
    localStorage.setItem('theme', 'dark');
  });

  // Read localStorage
  const token = await page.evaluate(() => localStorage.getItem('token'));
  expect(token).toBe('abc123');

  // Check all localStorage items
  const storageSize = await page.evaluate(() => localStorage.length);
  expect(storageSize).toBeGreaterThan(0);
});
```

## Best Practices

### 1. Use Accessibility Selectors

```typescript
// Good - accessible and resilient
await page.getByRole('button', { name: 'Submit' });
await page.getByLabel('Email address');

// Avoid - fragile
await page.locator('body > div > button.btn-primary');
```

### 2. Add Test IDs for Complex Elements

```typescript
// In React component
<div data-testid="user-profile">
  {/* complex structure */}
</div>

// In test
await page.getByTestId('user-profile');
```

### 3. Group Related Tests

```typescript
test.describe('User Login', () => {
  test('should show login form', async ({ page }) => {
    // ...
  });

  test('should validate email', async ({ page }) => {
    // ...
  });

  test('should submit successfully', async ({ page }) => {
    // ...
  });
});
```

### 4. Use Fixtures for Common Setup

```typescript
test.beforeEach(async ({ page }) => {
  // Run before each test
  await page.goto('/');
  await page.getByRole('button', { name: 'Login' }).click();
});

test('should see dashboard', async ({ page }) => {
  // Already logged in from beforeEach
  await expect(page).toHaveURL('/dashboard');
});
```

### 5. Don't Over-Test Implementation Details

```typescript
// Good - tests user-visible behavior
await page.getByRole('button', { name: 'Add Item' }).click();
await expect(page.getByText('Item added')).toBeVisible();

// Bad - tests implementation
await page.locator('.component-state-pending').waitFor();
expect(page.locator('.internal-counter')).toHaveText('1');
```

## Debugging Failed Tests

### 1. Use Playwright UI

```bash
npm run test:e2e:ui
```

- See exactly where test failed
- Inspect DOM at failure point
- View console logs
- See network requests

### 2. Add Debug Statements

```typescript
test('debug example', async ({ page }) => {
  await page.goto('/');

  // Pause execution and open inspector
  await page.pause();

  // Take screenshot for debugging
  await page.screenshot({ path: 'debug.png' });

  // Log page content
  const content = await page.content();
  console.log(content);
});
```

### 3. Check Test Artifacts

After test failure, check:
- `test-results/` - Screenshots and videos
- `playwright-report/` - HTML report with details

```bash
# Open HTML report
npx playwright show-report
```

### 4. Increase Timeouts

```typescript
test('slow test', async ({ page }) => {
  // Increase timeout for this test
  test.setTimeout(60000); // 60 seconds

  // Or for specific action
  await page.waitForSelector('.slow', { timeout: 30000 });
});
```

## CI/CD Integration

The tests are automatically run in GitHub Actions. See `.github/workflows/ci-cd.yml`.

To add E2E tests to CI:

```yaml
- name: Install Playwright browsers
  run: cd packages/frontend && npx playwright install --with-deps

- name: Run E2E tests
  run: cd packages/frontend && npm run test:e2e
```

## Common Issues

### Issue: Tests Fail with "Target Closed"

**Cause**: Browser closed unexpectedly

**Solution**:
- Check for console errors that crash the app
- Increase timeout
- Check if dev server started properly

### Issue: Element Not Found

**Cause**: Element doesn't exist or not visible yet

**Solution**:
```typescript
// Wait for element before interacting
await page.waitForSelector('.my-element');
await page.click('.my-element');

// Or use auto-waiting
await page.getByRole('button').click(); // Auto-waits
```

### Issue: Flaky Tests

**Cause**: Timing issues, network delays

**Solution**:
- Use auto-waiting actions (getByRole, etc.)
- Avoid hardcoded delays (sleep)
- Wait for specific conditions
- Use test.describe.configure({ retries: 2 })

## Additional Resources

- [Playwright Documentation](https://playwright.dev/)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [API Reference](https://playwright.dev/docs/api/class-playwright)
- [Selectors Guide](https://playwright.dev/docs/selectors)
- [Debugging Guide](https://playwright.dev/docs/debug)
