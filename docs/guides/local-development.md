# Local Development Guide

This guide walks you through setting up and running AssetBridge on your local machine for development.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Initial Setup](#initial-setup)
- [Running the Application](#running-the-application)
- [Development Workflow](#development-workflow)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)
- [Common Tasks](#common-tasks)

## Prerequisites

### Required Software

1. **Node.js 18+**
   ```bash
   # Check if installed
   node --version

   # Should output: v18.x.x or higher
   ```

   Download from: https://nodejs.org/

2. **npm** (comes with Node.js)
   ```bash
   # Check if installed
   npm --version

   # Should output: 9.x.x or higher
   ```

3. **Git**
   ```bash
   # Check if installed
   git --version
   ```

   Download from: https://git-scm.com/

4. **MongoDB Atlas Account** (Free tier is fine)
   - Sign up at: https://www.mongodb.com/cloud/atlas
   - We'll set this up in the next section

### Recommended Tools

- **VS Code** - Best IDE for this project
- **Postman** or **Thunder Client** - For API testing
- **MongoDB Compass** - GUI for MongoDB (optional)

## Initial Setup

### Step 1: Clone the Repository

```bash
# Clone the repo
git clone https://github.com/YasanthaHennayake/assetbridge.git

# Navigate to project directory
cd assetbridge
```

### Step 2: Install Dependencies

This installs all packages for backend, frontend, and shared:

```bash
npm install
```

**Expected output:**
```
added 726 packages, and audited 730 packages in 60s
```

### Step 3: Set Up MongoDB Atlas

1. **Create a Cluster**
   - Go to https://www.mongodb.com/cloud/atlas
   - Sign up / Log in
   - Create a new cluster (M0 Free tier)
   - Wait for cluster to be created (~5 minutes)

2. **Create Database User**
   - Click "Database Access" in left sidebar
   - Click "Add New Database User"
   - Choose "Password" authentication
   - Username: `assetbridge_dev`
   - Password: Generate a secure password (save it!)
   - Database User Privileges: Read and write to any database
   - Click "Add User"

3. **Configure Network Access**
   - Click "Network Access" in left sidebar
   - Click "Add IP Address"
   - For development: Click "Allow Access from Anywhere" (0.0.0.0/0)
   - Or add your current IP address
   - Click "Confirm"

4. **Get Connection String**
   - Click "Database" in left sidebar
   - Click "Connect" on your cluster
   - Click "Connect your application"
   - Copy the connection string
   - It looks like: `mongodb+srv://assetbridge_dev:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`
   - Replace `<password>` with your actual password

### Step 4: Configure Environment Variables

#### Backend Configuration

```bash
# Create backend .env file
cp packages/backend/.env.example packages/backend/.env
```

Edit `packages/backend/.env`:

```env
PORT=5001
NODE_ENV=development
MONGODB_URI=mongodb+srv://assetbridge_dev:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/assetbridge?retryWrites=true&w=majority
```

**Important:** Replace `YOUR_PASSWORD` and cluster URL with your actual MongoDB credentials.

#### Frontend Configuration

```bash
# Create frontend .env file
cp packages/frontend/.env.example packages/frontend/.env
```

Edit `packages/frontend/.env`:

```env
VITE_API_URL=http://localhost:5001
```

### Step 5: Build Shared Package

The shared package contains TypeScript types used by both backend and frontend:

```bash
cd packages/shared
npm run build
cd ../..
```

**Expected output:**
```
> @assetbridge/shared@1.0.0 build
> tsc
```

### Step 6: Build Backend (Optional)

```bash
npm run build:backend
```

### Step 7: Install Playwright Browsers (For E2E Tests)

```bash
cd packages/frontend
npx playwright install chromium
cd ../..
```

## Running the Application

### Option 1: Run Backend and Frontend Separately (Recommended for Development)

**Terminal 1 - Backend:**
```bash
npm run dev:backend
```

**Expected output:**
```
> @assetbridge/backend@1.0.0 dev
> nodemon src/index.ts

✓ MongoDB connected successfully
✓ Server running on port 5001
✓ Environment: development
✓ API available at http://localhost:5001/api
```

**Terminal 2 - Frontend:**
```bash
npm run dev:frontend
```

**Expected output:**
```
> @assetbridge/frontend@1.0.0 dev
> vite

  VITE v4.4.5  ready in 523 ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
```

### Option 2: Run Both Simultaneously

```bash
npm run dev
```

This runs both backend and frontend in watch mode.

### Accessing the Application

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5001/api
- **Health Check:** http://localhost:5001/health

## Development Workflow

### Making Changes

1. **Create a Feature Branch**
   ```bash
   git checkout -b feature/my-feature
   ```

2. **Make Your Changes**
   - Edit files in your IDE
   - Save files
   - Changes auto-reload (hot module replacement)

3. **Test Your Changes**
   - Check browser (frontend changes auto-refresh)
   - Check terminal for errors
   - Run tests: `npm run test:backend` or `npm run test:frontend`

4. **Commit Your Changes**
   ```bash
   git add .
   git commit -m "Add feature description"
   ```

### File Watching

Both backend and frontend run in watch mode:
- **Backend:** Uses `nodemon` - restarts on file changes
- **Frontend:** Uses Vite HMR - updates instantly without full reload

### Common Development Tasks

#### Add a New API Endpoint

1. Create route file in `packages/backend/src/routes/`
2. Register route in `packages/backend/src/app.ts`
3. Test with Postman or browser
4. Write unit test in `.test.ts` file

#### Add a New React Component

1. Create component in `packages/frontend/src/components/`
2. Import and use in `App.tsx` or other components
3. Write test in `.test.tsx` file

#### Add Shared Types

1. Edit `packages/shared/src/types.ts`
2. Rebuild shared package: `cd packages/shared && npm run build`
3. Types are now available in backend and frontend

## Testing

### Unit Tests

**Backend Tests (Jest):**
```bash
npm run test:backend

# With coverage
npm run test:backend -- --coverage

# Watch mode
npm run test:backend -- --watch

# Specific test file
npm run test:backend -- hello.routes.test.ts
```

**Frontend Tests (Vitest):**
```bash
npm run test:frontend

# With coverage
npm run test:frontend -- --coverage

# Watch mode (default)
npm run test:frontend

# Run once
npm run test:frontend -- --run
```

### E2E Tests (Playwright)

**Prerequisites:** Backend must be running

**Terminal 1 - Start Backend:**
```bash
npm run dev:backend
```

**Terminal 2 - Run E2E Tests:**
```bash
cd packages/frontend

# Headless mode
npm run test:e2e

# UI mode (recommended - visual interface)
npm run test:e2e:ui

# Headed mode (see browser)
npm run test:e2e:headed

# Debug mode
npm run test:e2e:debug
```

### Run All Tests

```bash
# Backend + Frontend unit tests
npm test

# Note: E2E tests must be run separately (see above)
```

## Troubleshooting

### Issue: Port Already in Use

**Error:**
```
Error: listen EADDRINUSE: address already in use :::5001
```

**Solution:**
```bash
# Find process using port 5001
lsof -i :5001

# Kill the process
kill -9 <PID>

# Or use different port in packages/backend/.env
PORT=5001
```

### Issue: MongoDB Connection Failed

**Error:**
```
✗ MongoDB connection error: MongooseServerSelectionError
```

**Solutions:**

1. **Check connection string:**
   - Verify `MONGODB_URI` in `packages/backend/.env`
   - Ensure password doesn't have special characters (or URL-encode them)
   - Check cluster URL is correct

2. **Check network access:**
   - MongoDB Atlas → Network Access
   - Ensure your IP is whitelisted or use 0.0.0.0/0

3. **Test connection:**
   ```bash
   # Try connecting with mongosh
   mongosh "mongodb+srv://..."
   ```

### Issue: Module Not Found

**Error:**
```
Error: Cannot find module '@assetbridge/shared'
```

**Solution:**
```bash
# Rebuild shared package
cd packages/shared
npm run build
cd ../..

# If still not working, reinstall
npm install
```

### Issue: TypeScript Errors

**Error:**
```
error TS2307: Cannot find module 'react'
```

**Solution:**
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Or just reinstall specific package
cd packages/frontend
npm install
```

### Issue: Frontend Not Loading

**Symptoms:** Blank page or error in browser console

**Solutions:**

1. **Check backend is running:**
   - Visit http://localhost:5001/health
   - Should return: `{"status":"ok","timestamp":"..."}`

2. **Check browser console:**
   - Press F12 → Console tab
   - Look for errors

3. **Check API URL:**
   - `packages/frontend/.env` should have correct `VITE_API_URL`

4. **Clear cache:**
   ```bash
   # Stop frontend (Ctrl+C)
   rm -rf packages/frontend/node_modules/.vite
   npm run dev:frontend
   ```

### Issue: Changes Not Reflecting

**Solution:**

1. **Hard refresh browser:** Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac)

2. **Restart dev server:**
   ```bash
   # Stop with Ctrl+C
   # Start again
   npm run dev:backend  # or dev:frontend
   ```

3. **Check file saved:** Ensure you saved the file in your editor

### Issue: Tests Failing

**Playwright E2E tests timeout:**
```bash
# Ensure backend is running first
npm run dev:backend

# In another terminal
cd packages/frontend
npm run test:e2e
```

**Unit tests fail:**
```bash
# Clear cache
npm run test:backend -- --clearCache

# Or
npm run test:frontend -- --clearCache
```

## Common Tasks

### Reset Database

```bash
# In MongoDB Atlas web interface:
# 1. Go to Collections
# 2. Select database
# 3. Drop database or specific collections

# Or using mongosh:
mongosh "your-connection-string"
> use assetbridge
> db.dropDatabase()
```

### View Logs

**Backend logs:** Output in Terminal 1 (where backend is running)

**Frontend logs:**
- Browser console (F12)
- Terminal 2 (where frontend is running) for build errors

### Check Code Quality

```bash
# Run linting
npm run lint

# Auto-fix linting issues
npm run lint -- --fix
```

### Build for Production

```bash
# Build all packages
npm run build

# Or individually
npm run build:backend
npm run build:frontend
```

### Clean Install

If things are really broken:

```bash
# Remove all node_modules and lock files
rm -rf node_modules package-lock.json
rm -rf packages/*/node_modules
rm -rf packages/*/package-lock.json

# Reinstall everything
npm install

# Rebuild shared package
cd packages/shared && npm run build && cd ../..
```

## Environment Variables Reference

### Backend (.env)

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port | `5001` |
| `NODE_ENV` | Environment | `development` |
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://...` |

### Frontend (.env)

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `http://localhost:5001` |

## Development Tips

1. **Keep terminals visible:** Use split panes to see both backend and frontend logs

2. **Use browser DevTools:**
   - Console for JavaScript errors
   - Network tab for API calls
   - React DevTools extension for component inspection

3. **Check both terminals:** Errors may show in backend OR frontend terminal

4. **MongoDB Compass:** Install for visual database browsing

5. **Hot reload:** Save files to see changes instantly (no need to restart)

6. **Git often:** Commit frequently with clear messages

7. **Test early:** Write tests as you add features

## Next Steps

Once you have the app running:

1. Test the Hello World endpoint works
2. Explore the code structure
3. Make a small change to see hot reload
4. Run the tests to understand testing setup
5. Start building features!

## Getting Help

- Check `CLAUDE.md` for architecture overview
- See `docs/bugs/README.md` for bug tracking process
- See `docs/guides/e2e-testing.md` for testing details
- See `docs/guides/github-actions-deployment.md` for deployment

## Quick Reference

```bash
# Install dependencies
npm install

# Build shared package
cd packages/shared && npm run build && cd ../..

# Run development servers
npm run dev:backend    # Terminal 1
npm run dev:frontend   # Terminal 2

# Run tests
npm run test:backend
npm run test:frontend
cd packages/frontend && npm run test:e2e

# Lint code
npm run lint

# Build for production
npm run build
```

Happy coding! 🚀
