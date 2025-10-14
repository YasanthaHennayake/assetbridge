# BUG-001: Heroku Deployment Failure in GitHub Actions

**Status:** Resolved
**Severity:** High
**Created:** 2025-10-14
**Resolved:** 2025-10-14
**Component:** CI/CD

---

## Description

GitHub Actions CI/CD pipeline fails during the Heroku deployment step when pushing to the `release` branch. The deployment job completes the test phase successfully but fails during the Heroku deployment phase.

## Steps to Reproduce

1. Push changes to `release` branch
2. GitHub Actions workflow triggers automatically
3. Test job completes successfully
4. Deploy job starts
5. Heroku deployment step fails with authentication/CLI errors

## Expected Behavior

- GitHub Actions should install Heroku CLI successfully
- Authenticate with Heroku using API key
- Deploy the application to Heroku without errors
- Application should be accessible on Heroku

## Actual Behavior

Deployment fails with various errors related to Heroku CLI and authentication.

## Environment

- **OS:** GitHub Actions Ubuntu Runner (ubuntu-latest)
- **Node Version:** 18.x
- **Branch:** release
- **Workflow File:** `.github/workflows/ci-cd.yml`
- **Heroku CLI:** Installed via official install script

## Error Messages / Logs

### Error 1: Heroku CLI Not Found (First Attempt)
```
Run akhileshns/heroku-deploy@v3.12.14
From https://github.com/YasanthaHennayake/***
 * [new branch]      main       -> origin/main
Created and wrote to ~/.netrc
Successfully logged into heroku
/bin/sh: 1: heroku: not found
/bin/sh: 1: heroku: not found
Error: Error: Command failed: heroku create ***
/bin/sh: 1: heroku: not found
```

### Error 2: Git Authentication Failure (Second Attempt)
```
Run heroku git:remote -a ***
set git remote heroku to https://git.heroku.com/***.git
fatal: could not read Username for 'https://git.heroku.com': No such device or address
Error: Process completed with exit code 128.
```

## Initial Investigation

- **Issue 1:** Third-party action `akhileshns/heroku-deploy@v3.12.14` failed to install Heroku CLI properly
- **Issue 2:** After switching to manual Heroku CLI installation, git authentication failed
- Root cause appears to be related to non-interactive git authentication with Heroku

---

## Debugging Process

### 2025-10-14 - Investigation Step 1: Third-Party Action Failure

**Hypothesis:** The `akhileshns/heroku-deploy@v3.12.14` action has compatibility issues or is not properly installing Heroku CLI.

**Actions Taken:**
1. Analyzed workflow file `.github/workflows/ci-cd.yml:106-111`
2. Reviewed action documentation and GitHub issues
3. Decided to replace with manual Heroku CLI installation

**Results:**
- Third-party action is unreliable
- Need to use official Heroku CLI installation method

**Code Changes (First Attempt):**
```yaml
# Before: Using third-party action
- name: Deploy to Heroku
  uses: akhileshns/heroku-deploy@v3.12.14
  with:
    heroku_api_key: ${{ secrets.HEROKU_API_KEY }}
    heroku_app_name: ${{ secrets.HEROKU_APP_NAME }}
    heroku_email: ${{ secrets.HEROKU_EMAIL }}

# After: Manual Heroku CLI installation
- name: Install Heroku CLI
  run: curl https://cli-assets.heroku.com/install.sh | sh

- name: Deploy to Heroku
  env:
    HEROKU_API_KEY: ${{ secrets.HEROKU_API_KEY }}
  run: |
    heroku git:remote -a ${{ secrets.HEROKU_APP_NAME }}
    git push heroku release:main
```

**Commit:** b8ab6ff - "Fix Heroku deployment failure in GitHub Actions"

### 2025-10-14 - Investigation Step 2: Git Authentication Failure

**New Findings:**
- Heroku CLI installed successfully
- Git remote setup succeeded
- Git push to Heroku failed with authentication error: "could not read Username"
- HTTPS git authentication requires interactive input, which is not available in CI environment

**Hypothesis:** Git needs to authenticate with Heroku using the API key, but the credentials are not properly configured for non-interactive use.

**Actions Taken:**
1. Researched Heroku authentication methods for CI/CD
2. Found that `.netrc` file is the standard approach for non-interactive git authentication
3. Implemented `.netrc` configuration step

**Code Changes (Second Attempt):**
```yaml
# Added credential configuration step
- name: Configure Heroku credentials
  env:
    HEROKU_API_KEY: ${{ secrets.HEROKU_API_KEY }}
  run: |
    cat > ~/.netrc <<EOF
    machine api.heroku.com
      login ${{ secrets.HEROKU_EMAIL }}
      password $HEROKU_API_KEY
    machine git.heroku.com
      login ${{ secrets.HEROKU_EMAIL }}
      password $HEROKU_API_KEY
    EOF
    chmod 600 ~/.netrc
```

**Commit:** db82868 - "Fix Heroku git authentication by configuring .netrc"

### 2025-10-14 - Investigation Step 3: Authentication Success, Build Failure

**Status:** Authentication and git push succeeded! But now Heroku build is failing.

**New Findings:**
- ✅ Heroku CLI installed successfully
- ✅ .netrc credentials configured properly
- ✅ Git push to Heroku succeeded
- ❌ Heroku build fails during TypeScript compilation

**Error 3: Monorepo Build Order Issue**
```
remote: -----> Build
remote:        Running build
remote:
remote:        > ***@1.0.0 build
remote:        > npm run build --workspaces --if-present
remote:
remote:        > @***/backend@1.0.0 build
remote:        > tsc
remote:
remote:        src/routes/hello.routes.ts(16,54): error TS2307: Cannot find module '@***/shared' or its corresponding type declarations.
remote:
remote:        > @***/frontend@1.0.0 build
remote:        > tsc && vite build
remote:
remote:        src/App.tsx(20,41): error TS2307: Cannot find module '@***/shared' or its corresponding type declarations.
remote:        src/services/api.ts(22,54): error TS2307: Cannot find module '@***/shared' or its corresponding type declarations.
remote:
remote:        > @***/shared@1.0.0 build
remote:        > tsc
remote:
remote: -----> Build failed
remote:  !     Push rejected, failed to compile Node.js app.
```

**Root Cause Identified:**
The build command `npm run build --workspaces --if-present` runs builds in parallel. Backend and frontend try to build before the shared package is built, causing TypeScript to fail finding `@assetbridge/shared` module.

**Solution:**
Need to ensure `@assetbridge/shared` is built BEFORE backend and frontend. This requires adding a Heroku-specific build configuration or modifying package.json scripts.

---

## Root Cause Analysis

### What Caused the Bug?

**Root Cause:**
Monorepo build order issue - the root `package.json` build script ran workspace builds in parallel using `npm run build --workspaces --if-present`, causing backend and frontend to compile before the shared package was built.

**Secondary Issues:**
1. Third-party GitHub Action (`akhileshns/heroku-deploy`) was unreliable for Heroku CLI installation
2. Git HTTPS authentication to Heroku requires non-interactive credential configuration via `.netrc`
3. Missing or improperly configured authentication credentials for git operations

### Why Did It Happen?

1. **Parallel workspace builds:** NPM's `--workspaces` flag runs builds concurrently without respecting dependencies
2. **Monorepo complexity:** Backend and frontend depend on shared package types at compile time
3. **Third-party dependency risk:** Relying on third-party actions without proper vetting
4. **CI/CD environment constraints:** Non-interactive environment requires explicit credential configuration

### Code Location

**Primary Fix:**
- **File:** `package.json` (root)
- **Line:** 11
- **Script:** `build`

**Secondary Fixes:**
- **File:** `.github/workflows/ci-cd.yml`
- **Lines:** 97-134 (deploy job)

---

## Solution

### Fix Attempts

**Attempt 1:** Replace third-party action with manual Heroku CLI installation
- **Status:** ✅ Partial success - CLI installed but git auth failed
- **Commit:** b8ab6ff

**Attempt 2:** Add .netrc configuration for git authentication
- **Status:** ✅ Partial success - Auth succeeded but build failed
- **Commit:** db82868

**Attempt 3 (FINAL):** Fix monorepo build order
- **Status:** ✅ **SUCCESS** - Full deployment successful
- **Commit:** 33e7bcc

### Final Solution

Changed the root `package.json` build script to build packages **sequentially** in dependency order:

**Before:**
```json
"build": "npm run build --workspaces --if-present"
```

**After:**
```json
"build": "npm run build -w @assetbridge/shared && npm run build -w @assetbridge/backend && npm run build -w @assetbridge/frontend"
```

This ensures:
1. Shared package builds first
2. Backend builds second (after shared types are available)
3. Frontend builds third (after shared types are available)

### Files Modified

- `package.json` (root) - Fixed build order (line 11)
- `.github/workflows/ci-cd.yml` - Replaced third-party action, added .netrc configuration
- `docs/bugs/active/BUG-001-heroku-deployment-failure-github-actions.md` - This documentation

### Code Changes

```json
// package.json
{
  "scripts": {
    "build": "npm run build -w @assetbridge/shared && npm run build -w @assetbridge/backend && npm run build -w @assetbridge/frontend"
  }
}
```

```yaml
# .github/workflows/ci-cd.yml
- name: Install Heroku CLI
  run: curl https://cli-assets.heroku.com/install.sh | sh

- name: Configure Heroku credentials
  env:
    HEROKU_API_KEY: ${{ secrets.HEROKU_API_KEY }}
  run: |
    cat > ~/.netrc <<EOF
    machine api.heroku.com
      login ${{ secrets.HEROKU_EMAIL }}
      password $HEROKU_API_KEY
    machine git.heroku.com
      login ${{ secrets.HEROKU_EMAIL }}
      password $HEROKU_API_KEY
    EOF
    chmod 600 ~/.netrc

- name: Deploy to Heroku
  env:
    HEROKU_API_KEY: ${{ secrets.HEROKU_API_KEY }}
  run: |
    heroku git:remote -a ${{ secrets.HEROKU_APP_NAME }}
    git push heroku release:main
```

---

## Verification

### How to Verify the Fix

Steps to confirm the bug is resolved:
1. Push to `release` branch
2. Monitor GitHub Actions workflow
3. Verify all steps complete successfully:
   - [x] Heroku CLI installation
   - [x] Credential configuration
   - [x] Git remote setup
   - [x] Git push to Heroku
   - [x] Successful deployment
4. Access deployed application on Heroku
5. Verify application functionality

### Regression Testing

- [x] Test job passes (linting, unit tests, build)
- [x] Deploy job passes (CLI install, auth, push, Heroku build)
- [x] Application accessible on Heroku
- [x] No breaking changes to existing functionality

### Verification Results

**Date:** 2025-10-14

✅ **All verification steps passed successfully**

- GitHub Actions workflow completed without errors
- Heroku CLI installed properly
- Git authentication successful via .netrc
- Code pushed to Heroku successfully
- Heroku build completed (shared → backend → frontend)
- Backend deployed and accessible at Heroku URL
- Application running successfully

---

## Prevention

### How to Avoid This in the Future

- [x] Use official deployment methods (Heroku CLI - now implemented)
- [x] Test CI/CD pipelines in isolated environments before production use
- [x] Document all required secrets and environment variables (documented in workflow)
- [x] Ensure monorepo build scripts respect dependency order
- [ ] Add verification steps to confirm successful deployment (future improvement)
- [ ] Consider using Heroku's official GitHub integration as an alternative
- [ ] Implement deployment health checks

### Specific Preventive Measures Implemented

1. **Sequential Build Order**: Always build shared packages before dependent packages
2. **Manual Heroku CLI Installation**: Use official installation script instead of third-party actions
3. **Explicit .netrc Configuration**: Configure git credentials for non-interactive environments
4. **Comprehensive Documentation**: Document all deployment steps and requirements

### Related Issues

- Branch: `bugfix/heroku-deploy-issue`
- Commits: b8ab6ff, db82868, 33e7bcc
- Merged to: `main` (2025-10-14), then `release` (2025-10-14)

---

## Lessons Learned

Key takeaways from debugging this issue:

1. **Monorepo Build Dependencies**: NPM workspaces don't automatically respect build dependencies. Always explicitly order builds when packages depend on each other at compile time.

2. **Third-Party Action Risks**: Third-party GitHub Actions should be carefully evaluated. Official tools and methods are often more reliable and maintainable.

3. **CI/CD Authentication**: Non-interactive environments like GitHub Actions require explicit authentication configuration (e.g., .netrc files for git operations).

4. **Iterative Debugging**: Complex deployment issues often have multiple layers. Each fix reveals the next issue - persistence and systematic documentation are key.

5. **Error Message Analysis**: Read error messages carefully. The final error ("Cannot find module @assetbridge/shared") clearly indicated a build order issue once authentication was working.

6. **Documentation Value**: Maintaining detailed bug reports during investigation helps track progress and serves as valuable reference for future similar issues.

## References

- [Heroku CLI Installation](https://devcenter.heroku.com/articles/heroku-cli)
- [Heroku Authentication](https://devcenter.heroku.com/articles/authentication)
- [Git .netrc Authentication](https://everything.curl.dev/usingcurl/netrc)
- [GitHub Actions Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)

---

## Timeline

- **Discovered:** 2025-10-14 (initial push to release branch)
- **Investigation Started:** 2025-10-14
- **First Fix Attempt:** 2025-10-14 (Commit: b8ab6ff) - Replace third-party action
- **Second Fix Attempt:** 2025-10-14 (Commit: db82868) - Add .netrc authentication
- **Third Fix Attempt (SUCCESS):** 2025-10-14 (Commit: 33e7bcc) - Fix build order
- **Fix Merged to Main:** 2025-10-14
- **Fix Deployed to Release:** 2025-10-14
- **Verified:** 2025-10-14 ✅ Successful deployment
- **Moved to Resolved:** 2025-10-14

---

## Required GitHub Secrets

Ensure these secrets are configured in GitHub repository settings:

- `HEROKU_API_KEY` - Your Heroku API key (found in Account Settings)
- `HEROKU_APP_NAME` - The name of your Heroku application
- `HEROKU_EMAIL` - Your Heroku account email address

Verify at: https://github.com/YasanthaHennayake/assetbridge/settings/secrets/actions
