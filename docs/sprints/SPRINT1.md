# SPRINT 1 - Foundation Setup with Hello World

## Sprint Goal
Establish the foundational monorepo architecture, development environment, and CI/CD pipeline with a simple Hello World API and frontend to validate the entire stack.

## Sprint Duration
**Started**: October 14, 2025
**Completed**: October 15, 2025
**Total Duration**: 2 days

## User Stories & Tasks

### 1. Monorepo Infrastructure Setup
**Priority**: Critical
**Story**: As a developer, I need a properly configured monorepo structure so that I can develop frontend and backend independently.

**Tasks**:
- [x] Initialize monorepo structure (chosen: npm workspaces)
- [x] Create `/packages/backend` workspace with Node.js + Express
- [x] Create `/packages/frontend` workspace with React + Vite
- [x] Create `/packages/shared` workspace for common types/utilities
- [x] Configure TypeScript for all workspaces
- [x] Set up ESLint and Prettier
- [x] Create root package.json with workspace scripts (dev, build, test)
- [x] Add .gitignore for node_modules, .env, build outputs

### 2. Backend - Hello World API
**Priority**: Critical
**Story**: As a developer, I need a working API endpoint so that I can validate the backend setup.

**Tasks**:
- [x] Set up Express server with TypeScript
- [x] Create `/api/hello` GET endpoint that returns `{ message: "Hello World from AssetBridge!" }`
- [x] Configure CORS for frontend communication
- [x] Set up environment variables (PORT, NODE_ENV)
- [x] Add error handling middleware
- [x] Configure nodemon for development hot reload

### 3. Frontend - Hello World Display
**Priority**: Critical
**Story**: As a user, I need to see the Hello World message so that I can validate the frontend-backend integration.

**Tasks**:
- [x] Set up React with Vite and TypeScript
- [x] Configure API base URL in environment variables
- [x] Create API client utility (using Fetch)
- [x] Create simple Home page component
- [x] Fetch data from `/api/hello` and display on screen
- [x] Add basic styling (using plain CSS)
- [x] Configure Vite proxy for local API calls

### 4. Database Setup
**Priority**: High
**Story**: As a developer, I need database connectivity so that future features can persist data.

**Tasks**:
- [x] Set up MongoDB Atlas cluster
- [x] Create database user and connection string
- [x] Install Mongoose in backend
- [x] Create database connection utility
- [x] Add connection test on server startup
- [x] Configure environment variables for MongoDB URI
- [x] Create a simple Health Check endpoint that verifies DB connection

### 5. Testing Infrastructure
**Priority**: High
**Story**: As a developer, I need basic testing setup so that I can ensure code quality.

**Tasks**:
- [x] Set up Jest for backend testing
- [x] Write simple test for `/api/hello` endpoint
- [x] Set up Vitest for frontend testing
- [x] Write simple test for Home component
- [x] Configure test scripts in package.json
- [x] Add test coverage reporting
- [x] Set up Playwright for E2E testing with console error detection

### 6. CI/CD Pipeline
**Priority**: High
**Story**: As a developer, I need automated deployment so that changes can be deployed quickly.

**Tasks**:
- [x] Create GitHub Actions workflow file (`.github/workflows/ci-cd.yml`)
- [x] Add workflow steps: checkout, install dependencies, run tests, lint
- [x] Set up Heroku app for backend deployment
- [x] Set up Heroku app for frontend deployment (dual-dyno architecture)
- [x] Configure Heroku environment variables (MongoDB URI, VITE_API_URL, etc.)
- [x] Add deployment step to GitHub Actions
- [x] Configure custom domains (assetbridge.hikvision.lk, api.assetbridge.hikvision.lk)
- [x] Enable SSL/TLS certificates via Heroku ACM
- [x] Test complete CI/CD flow with multiple commits
- [x] Debug and resolve deployment issues (documented in BUG-001)

### 7. Documentation
**Priority**: Medium
**Story**: As a developer, I need setup instructions so that I can start development quickly.

**Tasks**:
- [x] Update CLAUDE.md with development setup commands
- [x] Create comprehensive documentation structure under `/docs`:
  - Project structure
  - Prerequisites (Node.js version, MongoDB Atlas account)
  - Installation steps
  - Development commands (npm run dev, npm test, npm run build)
- [x] Document environment variables needed
- [x] Create detailed guides:
  - Local development guide (`docs/guides/local-development.md`)
  - GitHub Actions deployment guide (`docs/guides/github-actions-deployment.md`)
  - E2E testing guide (`docs/guides/e2e-testing.md`)
- [x] Establish bug tracking system (`docs/bugs/`)
- [x] Document resolved issues (BUG-001)

## Definition of Done
- [x] Monorepo structure is set up with backend, frontend, and shared packages
- [x] Backend API returns "Hello World" message at `/api/hello`
- [x] Frontend displays the message fetched from backend
- [x] MongoDB Atlas is connected and verified
- [x] Basic tests are written and passing for both frontend and backend
- [x] CI/CD pipeline runs tests on every push
- [x] Application is deployed to Heroku (both frontend and backend)
- [x] Documentation is complete with setup instructions
- [x] Demo: Visit deployed URL and see "Hello World from AssetBridge!" on screen
  - Frontend: https://assetbridge.hikvision.lk
  - Backend: https://api.assetbridge.hikvision.lk

## Technical Decisions
- **Monorepo Tool**: npm workspaces (simple, built-in, no additional dependencies)
- **Frontend Framework**: React 18 + Vite 4 + TypeScript
- **Backend Framework**: Express + TypeScript + Node.js 18
- **Database**: MongoDB Atlas (cloud-hosted, production-ready)
- **Testing**:
  - Backend: Jest
  - Frontend: Vitest (unit tests) + Playwright (E2E tests with console error detection)
- **Deployment**: Heroku (dual-dyno architecture)
  - Backend dyno: Express API
  - Frontend dyno: Static file serving with `serve` package
- **CI/CD**: GitHub Actions
  - Branch strategy: feature → main → release
  - Automated testing on all branches
  - Automated deployment on release branch only
- **SSL/TLS**: Heroku ACM (Automatic Certificate Management) with Let's Encrypt
- **Custom Domains**:
  - Frontend: assetbridge.hikvision.lk
  - Backend API: api.assetbridge.hikvision.lk

## Out of Scope for Sprint 1
- Authentication and authorization
- User management
- Any business modules (Vendor, Purchase Request, etc.)
- Complex UI components or styling
- Production-level error monitoring and logging

## Notes
- Keep everything simple and focused on infrastructure
- The Hello World example validates the entire stack
- This sprint creates the foundation for all future development
- Focus on getting the CI/CD pipeline working end-to-end

## Sprint Retrospective

### What Went Well ✅

1. **Rapid Setup**: Completed full-stack infrastructure in 2 days
2. **Comprehensive Testing**: Implemented 3-tier testing (Jest, Vitest, Playwright)
3. **Production-Ready Deployment**: Successfully deployed with custom domains and SSL
4. **Excellent Documentation**: Created extensive guides that serve as knowledge base
5. **Problem Solving**: Debugged and resolved complex deployment issues (BUG-001)
6. **Modern Stack**: Selected proven, maintainable technologies

### Challenges Encountered 🔧

1. **Heroku Deployment Issues** (BUG-001):
   - Third-party GitHub Action unreliable
   - Git authentication required .netrc configuration
   - Monorepo build order caused module resolution failures
   - **Resolution**: Manual Heroku CLI installation, .netrc setup, sequential builds

2. **SSL Certificate Configuration**:
   - ACM was disabled by default on both apps
   - **Resolution**: Enabled ACM on both frontend and backend apps

3. **Environment Variables in Vite**:
   - Initial confusion about build-time vs runtime variables
   - **Resolution**: Properly configured VITE_API_URL in Heroku and triggered rebuild

### Key Learnings 📚

1. **Monorepo Build Dependencies**: NPM workspaces don't automatically order builds. Explicit sequencing required when packages have compile-time dependencies.

2. **Heroku Deployment**: Official tools (Heroku CLI) are more reliable than third-party actions. Non-interactive environments need explicit credential configuration.

3. **Vite Environment Variables**: Environment variables are baked into the build at compile-time, not runtime. Changes require redeployment.

4. **Documentation Value**: Detailed bug reports during investigation saved time and created valuable reference material.

### Metrics 📊

- **Total Commits**: ~15 commits across feature branches
- **Bugs Resolved**: 1 major deployment issue (BUG-001)
- **Documentation Created**: 5 comprehensive guides
- **Test Coverage**: Backend and frontend unit tests + E2E tests
- **Deployment Success Rate**: 100% after fixes
- **Sprint Goal Achievement**: 100% - All DoD items completed

### Action Items for Next Sprint 🎯

1. ✅ Consider adding health check monitoring for production
2. ✅ Implement automated database backup strategy
3. ✅ Set up error tracking service (Sentry, etc.)
4. ✅ Add performance monitoring
5. ✅ Begin Sprint 2: User authentication and role-based access control

### Sprint Success Criteria: ACHIEVED ✨

All planned features delivered, documented, tested, and deployed to production with custom domains and SSL certificates. The foundation is solid and ready for feature development.

**Production URLs**:
- Frontend: https://assetbridge.hikvision.lk ✅
- Backend API: https://api.assetbridge.hikvision.lk ✅
