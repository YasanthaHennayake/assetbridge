# BUG-001: Heroku Deployment Failure in GitHub Actions

**Status:** Active
**Severity:** High
**Created:** 2025-10-14
**Resolved:** [Not yet resolved]
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

**Primary Issues:**
1. Third-party GitHub Action (`akhileshns/heroku-deploy`) was unreliable for Heroku CLI installation
2. Git HTTPS authentication to Heroku requires non-interactive credential configuration
3. Missing or improperly configured authentication credentials for git operations

### Why Did It Happen?

1. **Third-party dependency risk:** Relying on third-party actions without proper vetting
2. **CI/CD environment constraints:** Non-interactive environment requires explicit credential configuration
3. **Heroku authentication complexity:** Multiple authentication points (API, git) require proper setup

### Code Location

- **File:** `.github/workflows/ci-cd.yml`
- **Lines:** 97-134 (deploy job)
- **Job:** `deploy`

---

## Solution

### Fix Attempts

**Attempt 1:** Replace third-party action with manual Heroku CLI installation
- **Status:** Partial success - CLI installed but git auth failed

**Attempt 2:** Add .netrc configuration for git authentication
- **Status:** Still investigating - deployment still failing

### Current Approach

Working on refining the .netrc configuration and verifying all authentication requirements.

### Files Modified

- `.github/workflows/ci-cd.yml` - Modified deployment steps (lines 97-134)

---

## Verification

### How to Verify the Fix

Steps to confirm the bug is resolved:
1. Push to `release` branch
2. Monitor GitHub Actions workflow
3. Verify all steps complete successfully:
   - [ ] Heroku CLI installation
   - [ ] Credential configuration
   - [ ] Git remote setup
   - [ ] Git push to Heroku
   - [ ] Successful deployment
4. Access deployed application on Heroku
5. Verify application functionality

### Regression Testing

- [ ] Test job passes (linting, unit tests, build)
- [ ] Deploy job passes (CLI install, auth, push)
- [ ] Application accessible on Heroku
- [ ] No breaking changes to existing functionality

---

## Prevention

### How to Avoid This in the Future

- [ ] Use official deployment methods (Heroku CLI or Heroku API)
- [ ] Test CI/CD pipelines in isolated environments before production use
- [ ] Document all required secrets and environment variables
- [ ] Add verification steps to confirm successful deployment
- [ ] Consider using Heroku's official GitHub integration as an alternative
- [ ] Implement deployment health checks

### Related Issues

- Branch: `bugfix/heroku-deploy-issue`
- Related PRs: (To be added when created)

---

## Lessons Learned

Key takeaways from debugging this issue:
- Third-party GitHub Actions should be carefully evaluated before use
- CI/CD environments require explicit non-interactive authentication setup
- Heroku has multiple authentication endpoints (API, git) that need proper configuration
- Testing deployment pipelines requires iterative debugging
- Documentation of secrets and environment variables is critical

## References

- [Heroku CLI Installation](https://devcenter.heroku.com/articles/heroku-cli)
- [Heroku Authentication](https://devcenter.heroku.com/articles/authentication)
- [Git .netrc Authentication](https://everything.curl.dev/usingcurl/netrc)
- [GitHub Actions Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)

---

## Timeline

- **Discovered:** 2025-10-14 (initial push to release branch)
- **Investigation Started:** 2025-10-14
- **First Fix Attempt:** 2025-10-14 (Commit: b8ab6ff)
- **Second Fix Attempt:** 2025-10-14 (Commit: db82868)
- **Fix Committed:** [In progress]
- **Verified:** [Pending]
- **Moved to Resolved:** [Pending]

---

## Required GitHub Secrets

Ensure these secrets are configured in GitHub repository settings:

- `HEROKU_API_KEY` - Your Heroku API key (found in Account Settings)
- `HEROKU_APP_NAME` - The name of your Heroku application
- `HEROKU_EMAIL` - Your Heroku account email address

Verify at: https://github.com/YasanthaHennayake/assetbridge/settings/secrets/actions
