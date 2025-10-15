# GitHub Actions CI/CD & Heroku Deployment Guide

## Overview

This guide explains the CI/CD workflow using GitHub Actions and Heroku deployment with a release branch strategy for AssetBridge.

## Branch Strategy

```
feature branches → main (testing) → release (production deployment)
```

- **Feature branches**: Development work happens here (e.g., `feature/init`, `feature/vendor-management`)
- **main**: Integration and testing branch where features are merged and tested
- **release**: Production-ready code. Pushing to this branch triggers automatic deployment to Heroku

## Development Workflow

### 1. Create Feature Branch

Start all new work from the `main` branch:

```bash
# Ensure you're on main and have latest changes
git checkout main
git pull origin main

# Create new feature branch
git checkout -b feature/your-feature-name
```

###  2. Develop and Test Locally

Make your changes and test locally:

```bash
# Install dependencies (first time only)
npm install

# Run backend in development mode
npm run dev:backend

# In another terminal, run frontend
npm run dev:frontend

# Run tests
npm run test

# Run linting
npm run lint
```

### 3. Commit and Push

```bash
git add .
git commit -m "Add your feature description"
git push origin feature/your-feature-name
```

### 4. Create Pull Request to `main`

1. Go to GitHub repository
2. Click "New Pull Request"
3. Base: `main` ← Compare: `feature/your-feature-name`
4. GitHub Actions will automatically:
   - Run linting checks
   - Run all tests (backend + frontend)
   - Build both packages

5. Review the test results in the PR
6. Request code review from team members
7. Once approved and tests pass, merge to `main`

## Release Process

When the `main` branch is stable and ready for production:

### 1. Create Release PR

```bash
# On GitHub, create Pull Request: main → release
```

### 2. Automatic Deployment

When you merge or push directly to `release` branch:

1. GitHub Actions workflow triggers automatically
2. Runs all tests (same as PR checks)
3. **If all tests pass**: Automatically deploys to Heroku
4. **If any test fails**: Deployment is blocked

### 3. Monitor Deployment

- Watch GitHub Actions tab for deployment progress
- Check Heroku logs for any runtime issues
- Test the live application

## Setting Up GitHub Actions & Heroku

### Prerequisites

1. GitHub repository
2. Heroku account
3. Heroku CLI installed ([installation guide](https://devcenter.heroku.com/articles/heroku-cli))

### Step 1: Create Heroku Apps

AssetBridge uses **two separate Heroku apps**:
1. **Backend App**: Serves the Express API
2. **Frontend App**: Serves the React application as static files

```bash
# Login to Heroku
heroku login

# Create backend app
heroku create assetbridge-backend

# Create frontend app
heroku create assetbridge-frontend

# Or connect to existing apps
heroku git:remote -a assetbridge-backend
heroku git:remote -a assetbridge-frontend -r heroku-frontend

# Verify remotes
git remote -v
```

### Step 1b: Configure Custom Domains (Recommended)

Heroku assigns random domain names (`*.herokuapp.com`), which are difficult to predict. It's recommended to configure custom domains for production.

**AssetBridge Production Domains:**
- Frontend: `assetbridge.hikvision.lk`
- Backend API: `api.assetbridge.hikvision.lk`

```bash
# Add custom domain to frontend app
heroku domains:add assetbridge.hikvision.lk -a assetbridge-frontend

# Add custom domain to backend app
heroku domains:add api.assetbridge.hikvision.lk -a assetbridge-backend

# View DNS targets
heroku domains -a assetbridge-frontend
heroku domains -a assetbridge-backend
```

**DNS Configuration:**
After adding domains in Heroku, update your DNS records:

| Type | Name | Value | App |
|------|------|-------|-----|
| CNAME | `assetbridge` | DNS target from Heroku | Frontend |
| CNAME | `api.assetbridge` | DNS target from Heroku | Backend |

**SSL/TLS:**
Heroku automatically provides free SSL certificates for custom domains via Automated Certificate Management (ACM).

### Step 2: Configure MongoDB Atlas

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a cluster (free tier is fine for development)
3. Create a database user
4. Get connection string (replace `<password>` with your password)
5. Whitelist Heroku IPs or allow access from anywhere (0.0.0.0/0)

### Step 3: Set Heroku Environment Variables

#### Backend Environment Variables

```bash
# Set MongoDB connection string for backend
heroku config:set MONGODB_URI="mongodb+srv://username:password@cluster.mongodb.net/assetbridge?retryWrites=true&w=majority" -a assetbridge-backend

# Set Node environment
heroku config:set NODE_ENV=production -a assetbridge-backend

# Verify backend configuration
heroku config -a assetbridge-backend
```

#### Frontend Environment Variables

```bash
# Set backend API URL for frontend (using custom domain)
heroku config:set VITE_API_URL=https://api.assetbridge.hikvision.lk -a assetbridge-frontend

# Verify frontend configuration
heroku config -a assetbridge-frontend
```

**Important**:
- Vite requires environment variables to be prefixed with `VITE_` to be included in the build.
- Use your custom domain URLs instead of default Heroku URLs for production.

### Step 4: Configure GitHub Secrets

1. Go to GitHub repository
2. Settings → Secrets and variables → Actions
3. Click "New repository secret"
4. Add the following secrets:

| Secret Name | Value | How to Get |
|------------|-------|------------|
| `HEROKU_API_KEY` | Your Heroku API key | Run `heroku auth:token` |
| `HEROKU_BACKEND_APP_NAME` | Backend Heroku app name | The name you used (e.g., `assetbridge-backend`) |
| `HEROKU_FRONTEND_APP_NAME` | Frontend Heroku app name | The name you used (e.g., `assetbridge-frontend`) |
| `HEROKU_EMAIL` | Your Heroku email | Email address of your Heroku account |
| `BACKEND_API_URL` | Backend API URL | Custom domain URL (e.g., `https://api.assetbridge.hikvision.lk`) |

#### Getting Heroku API Key

```bash
heroku auth:token
```

Copy the output and paste it as the `HEROKU_API_KEY` secret.

**Note**: The GitHub Actions workflow will automatically deploy both backend and frontend when you push to the `release` branch.

## Testing the Workflow

### Test 1: CI Tests on Feature Branch

```bash
# Create test branch
git checkout -b feature/test-ci
echo "# Test" >> test.txt
git add test.txt
git commit -m "Test CI"
git push origin feature/test-ci
```

Create PR to `main` and watch GitHub Actions run tests.

### Test 2: Integration on Main Branch

After merging the PR, GitHub Actions will run tests on `main` branch automatically.

### Test 3: Production Deployment

```bash
# Create release branch if it doesn't exist
git checkout -b release
git push origin release

# Or merge main into existing release
git checkout release
git merge main
git push origin release
```

Watch GitHub Actions deploy to Heroku!

## Monitoring & Debugging

### View Heroku Logs

```bash
# Real-time logs
heroku logs --tail

# Last 100 lines
heroku logs -n 100

# Only application logs (no system logs)
heroku logs --source app
```

### View GitHub Actions Logs

1. Go to repository → Actions tab
2. Click on the workflow run
3. Click on specific job (test/deploy)
4. Expand steps to see detailed logs

### Common Issues & Solutions

#### Issue: Tests pass locally but fail in CI

**Cause**: Different Node.js versions or missing dependencies

**Solution**:
```bash
# Ensure package.json has all dependencies (not just devDependencies)
# Match Node.js version with CI (currently 18)
```

#### Issue: Deployment fails with "Application error"

**Solution**:
```bash
# Check Heroku logs
heroku logs --tail

# Common causes:
# 1. Missing environment variables
heroku config

# 2. Build failed
heroku releases

# 3. Port binding issue (ensure backend uses process.env.PORT)
```

#### Issue: MongoDB connection fails in production

**Solution**:
1. Verify `MONGODB_URI` is set: `heroku config:get MONGODB_URI -a assetbridge-backend`
2. Check MongoDB Atlas IP whitelist includes Heroku or 0.0.0.0/0
3. Verify database user has correct permissions

#### Issue: Frontend can't connect to backend (CORS errors)

**Solution**:
1. Verify backend CORS is configured to allow frontend domain:
```javascript
// packages/backend/src/app.ts
app.use(cors({
  origin: ['https://assetbridge.hikvision.lk']
}));
```

2. Check `VITE_API_URL` is set correctly:
```bash
heroku config:get VITE_API_URL -a assetbridge-frontend
# Should return: https://api.assetbridge.hikvision.lk
```

3. Ensure backend API is accessible:
```bash
curl https://api.assetbridge.hikvision.lk/api/hello
```

#### Issue: Frontend shows blank page or 404 errors

**Solution**:
1. Check frontend build output exists:
```bash
# Locally
cd packages/frontend && npm run build
ls dist/  # Should show index.html and assets
```

2. Verify frontend Procfile is correct:
```bash
# Should be: cd packages/frontend && npm start
cat Procfile.frontend
```

3. Check frontend logs:
```bash
heroku logs --tail -a assetbridge-frontend
```

#### Issue: Build fails with "Cannot find module @assetbridge/shared"

**Solution**:
This was fixed in BUG-001. Ensure `package.json` has sequential build order:
```json
"build": "npm run build -w @assetbridge/shared && npm run build -w @assetbridge/backend && npm run build -w @assetbridge/frontend"
```

See `docs/bugs/resolved/BUG-001-heroku-deployment-failure-github-actions-RESOLVED-2025-10-14.md` for full details.

## Rollback Strategies

### Option 1: Heroku Rollback

```bash
# View release history
heroku releases

# Rollback to previous version
heroku rollback v42  # Replace with desired version number
```

### Option 2: Git Revert

```bash
git checkout release
git revert <commit-hash>  # Creates new commit that undoes changes
git push origin release   # Triggers new deployment
```

### Option 3: Fast-Forward to Previous Commit

```bash
# Only use if release branch hasn't been pulled by others
git checkout release
git reset --hard <previous-good-commit>
git push origin release --force
```

## Best Practices

1. **Never commit secrets** - Always use environment variables
2. **Test locally first** - Run `npm test` and `npm run build` before pushing
3. **Small, focused PRs** - Easier to review and debug
4. **Write descriptive commit messages** - Helps with debugging later
5. **Monitor after deployment** - Check logs and test functionality
6. **Use feature flags** - For gradual rollouts of new features
7. **Keep `main` stable** - Only merge tested, reviewed code

## Branch Protection Rules (Recommended)

Configure these in GitHub Settings → Branches:

**For `main` branch:**
- Require pull request reviews (at least 1)
- Require status checks to pass (GitHub Actions tests)
- Require branches to be up to date
- Include administrators

**For `release` branch:**
- Require pull request reviews (at least 2)
- Require status checks to pass
- Require branches to be up to date
- Include administrators

## Deployment Architecture

AssetBridge uses a **dual-dyno deployment** strategy:

```
┌─────────────────────┐         ┌─────────────────────┐
│  Frontend Heroku    │────────>│  Backend Heroku     │
│  (React + serve)    │  HTTPS  │  (Express API)      │
│  Port: $PORT        │         │  Port: $PORT        │
└─────────────────────┘         └─────────────────────┘
                                          │
                                          │
                                          v
                                ┌─────────────────────┐
                                │   MongoDB Atlas     │
                                │   (Database)        │
                                └─────────────────────┘
```

### How It Works

1. **Frontend App**: Serves the built React application as static files using the `serve` package
2. **Backend App**: Runs the Express API server
3. **Communication**: Frontend makes API calls to backend via `VITE_API_URL` environment variable
4. **Database**: Both apps can connect to the same MongoDB Atlas cluster (backend only needs connection)

### GitHub Actions Workflow

When you push to `release` branch:

1. **Test Job** runs first (linting, unit tests, builds)
2. **Deploy Backend Job** runs in parallel after tests pass:
   - Installs Heroku CLI
   - Configures authentication
   - Copies `Procfile.backend` to `Procfile` for backend deployment
   - Pushes to backend Heroku app
3. **Deploy Frontend Job** runs in parallel after tests pass:
   - Installs Heroku CLI
   - Configures authentication
   - Sets frontend environment variables
   - Copies `Procfile.frontend` to `Procfile` for frontend deployment
   - Pushes to frontend Heroku app

Both deployments happen **simultaneously** for faster deployment.

## Environment Summary

### Local Development

- Backend: `http://localhost:5001`
- Frontend: `http://localhost:3000`
- Database: MongoDB Atlas (development cluster)

### Production (Heroku)

- **Frontend**: `https://assetbridge.hikvision.lk` (custom domain)
- **Backend API**: `https://api.assetbridge.hikvision.lk` (custom domain)
- **Database**: MongoDB Atlas (production cluster recommended)
- **Backend Logs**: `heroku logs --tail -a assetbridge-backend`
- **Frontend Logs**: `heroku logs --tail -a assetbridge-frontend`

**Note**: Custom domains are configured in Heroku. Default Heroku URLs (`*.herokuapp.com`) redirect to custom domains.

## Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Heroku Node.js Deployment Guide](https://devcenter.heroku.com/articles/deploying-nodejs)
- [MongoDB Atlas Documentation](https://www.mongodb.com/docs/atlas/)
- [Heroku Configuration Variables](https://devcenter.heroku.com/articles/config-vars)
