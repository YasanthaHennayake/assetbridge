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

### Step 1: Create Heroku App

```bash
# Login to Heroku
heroku login

# Create new app (choose a unique name)
heroku create your-app-name

# Or connect to existing app
heroku git:remote -a your-app-name

# Add Node.js buildpack
heroku buildpacks:set heroku/nodejs
```

### Step 2: Configure MongoDB Atlas

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a cluster (free tier is fine for development)
3. Create a database user
4. Get connection string (replace `<password>` with your password)
5. Whitelist Heroku IPs or allow access from anywhere (0.0.0.0/0)

### Step 3: Set Heroku Environment Variables

```bash
# Set MongoDB connection string
heroku config:set MONGODB_URI="mongodb+srv://username:password@cluster.mongodb.net/assetbridge?retryWrites=true&w=majority"

# Set Node environment
heroku config:set NODE_ENV=production

# Verify configuration
heroku config
```

### Step 4: Configure GitHub Secrets

1. Go to GitHub repository
2. Settings → Secrets and variables → Actions
3. Click "New repository secret"
4. Add the following secrets:

| Secret Name | Value | How to Get |
|------------|-------|------------|
| `HEROKU_API_KEY` | Your Heroku API key | Run `heroku auth:token` |
| `HEROKU_APP_NAME` | Your Heroku app name | The name you used in `heroku create` |
| `HEROKU_EMAIL` | Your Heroku email | Email address of your Heroku account |

#### Getting Heroku API Key

```bash
heroku auth:token
```

Copy the output and paste it as the `HEROKU_API_KEY` secret.

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
1. Verify `MONGODB_URI` is set: `heroku config:get MONGODB_URI`
2. Check MongoDB Atlas IP whitelist includes Heroku or 0.0.0.0/0
3. Verify database user has correct permissions

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

## Environment Summary

### Local Development

- Backend: `http://localhost:5001`
- Frontend: `http://localhost:3000`
- Database: MongoDB Atlas (development cluster)

### Production (Heroku)

- Application: `https://your-app-name.herokuapp.com`
- Database: MongoDB Atlas (production cluster recommended)
- Logs: `heroku logs --tail`

## Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Heroku Node.js Deployment Guide](https://devcenter.heroku.com/articles/deploying-nodejs)
- [MongoDB Atlas Documentation](https://www.mongodb.com/docs/atlas/)
- [Heroku Configuration Variables](https://devcenter.heroku.com/articles/config-vars)
