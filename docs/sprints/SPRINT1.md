# SPRINT 1 - Foundation Setup with Hello World

## Sprint Goal
Establish the foundational monorepo architecture, development environment, and CI/CD pipeline with a simple Hello World API and frontend to validate the entire stack.

## Sprint Duration
[To be determined]

## User Stories & Tasks

### 1. Monorepo Infrastructure Setup
**Priority**: Critical
**Story**: As a developer, I need a properly configured monorepo structure so that I can develop frontend and backend independently.

**Tasks**:
- [ ] Initialize monorepo structure (choose: Turborepo, Nx, or npm workspaces)
- [ ] Create `/packages/backend` workspace with Node.js + Express
- [ ] Create `/packages/frontend` workspace with React + Vite
- [ ] Create `/packages/shared` workspace for common types/utilities
- [ ] Configure TypeScript for all workspaces
- [ ] Set up ESLint and Prettier
- [ ] Create root package.json with workspace scripts (dev, build, test)
- [ ] Add .gitignore for node_modules, .env, build outputs

### 2. Backend - Hello World API
**Priority**: Critical
**Story**: As a developer, I need a working API endpoint so that I can validate the backend setup.

**Tasks**:
- [ ] Set up Express server with TypeScript
- [ ] Create `/api/hello` GET endpoint that returns `{ message: "Hello World from AssetBridge!" }`
- [ ] Configure CORS for frontend communication
- [ ] Set up environment variables (PORT, NODE_ENV)
- [ ] Add error handling middleware
- [ ] Configure nodemon for development hot reload

### 3. Frontend - Hello World Display
**Priority**: Critical
**Story**: As a user, I need to see the Hello World message so that I can validate the frontend-backend integration.

**Tasks**:
- [ ] Set up React with Vite and TypeScript
- [ ] Configure API base URL in environment variables
- [ ] Create API client utility (Axios or Fetch)
- [ ] Create simple Home page component
- [ ] Fetch data from `/api/hello` and display on screen
- [ ] Add basic styling (can use plain CSS or Tailwind CSS)
- [ ] Configure Vite proxy for local API calls

### 4. Database Setup
**Priority**: High
**Story**: As a developer, I need database connectivity so that future features can persist data.

**Tasks**:
- [ ] Set up MongoDB Atlas cluster
- [ ] Create database user and connection string
- [ ] Install Mongoose in backend
- [ ] Create database connection utility
- [ ] Add connection test on server startup
- [ ] Configure environment variables for MongoDB URI
- [ ] (Optional) Create a simple Health Check endpoint that verifies DB connection

### 5. Testing Infrastructure
**Priority**: High
**Story**: As a developer, I need basic testing setup so that I can ensure code quality.

**Tasks**:
- [ ] Set up Jest for backend testing
- [ ] Write simple test for `/api/hello` endpoint
- [ ] Set up Vitest for frontend testing
- [ ] Write simple test for Home component
- [ ] Configure test scripts in package.json
- [ ] Add test coverage reporting

### 6. CI/CD Pipeline
**Priority**: High
**Story**: As a developer, I need automated deployment so that changes can be deployed quickly.

**Tasks**:
- [ ] Create GitHub Actions workflow file (`.github/workflows/deploy.yml`)
- [ ] Add workflow steps: checkout, install dependencies, run tests, lint
- [ ] Set up Heroku app for backend deployment
- [ ] Set up Heroku app for frontend deployment (or use same app with static serving)
- [ ] Configure Heroku environment variables (MongoDB URI, etc.)
- [ ] Add deployment step to GitHub Actions
- [ ] Test complete CI/CD flow with a commit

### 7. Documentation
**Priority**: Medium
**Story**: As a developer, I need setup instructions so that I can start development quickly.

**Tasks**:
- [ ] Update CLAUDE.md with development setup commands
- [ ] Create root README.md with:
  - Project structure
  - Prerequisites (Node.js version, MongoDB Atlas account)
  - Installation steps
  - Development commands (npm run dev, npm test, npm run build)
- [ ] Document environment variables needed
- [ ] Add backend README with API endpoints
- [ ] Add frontend README with available scripts

## Definition of Done
- [ ] Monorepo structure is set up with backend, frontend, and shared packages
- [ ] Backend API returns "Hello World" message at `/api/hello`
- [ ] Frontend displays the message fetched from backend
- [ ] MongoDB Atlas is connected and verified
- [ ] Basic tests are written and passing for both frontend and backend
- [ ] CI/CD pipeline runs tests on every push
- [ ] Application is deployed to Heroku (both frontend and backend)
- [ ] Documentation is complete with setup instructions
- [ ] Demo: Visit deployed URL and see "Hello World from AssetBridge!" on screen

## Technical Decisions
- **Monorepo Tool**: [Choose: Turborepo / Nx / npm workspaces]
- **Frontend Framework**: React + Vite + TypeScript
- **Backend Framework**: Express + TypeScript
- **Database**: MongoDB Atlas
- **Testing**: Jest (backend) + Vitest (frontend)
- **Deployment**: Heroku
- **CI/CD**: GitHub Actions

## Out of Scope for Sprint 1
- Authentication and authorization
- User management
- Any business modules (Vendor, Purchase Request, etc.)
- Complex UI components or styling
- Advanced testing (E2E tests with Playwright/Cypress)

## Notes
- Keep everything simple and focused on infrastructure
- The Hello World example validates the entire stack
- This sprint creates the foundation for all future development
- Focus on getting the CI/CD pipeline working end-to-end

## Sprint Retrospective
[To be filled after sprint completion]
