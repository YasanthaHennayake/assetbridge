# AssetBridge - System Overview (SRS)

## Document Information

**Version**: 1.0
**Date**: October 15, 2025
**Status**: Draft
**Last Updated**: Sprint 1 Completion

---

## 1. Introduction

### 1.1 Purpose

This Software Requirements Specification (SRS) document provides a comprehensive overview of the AssetBridge system, a corporate-grade Procurement and Asset Management platform. This document defines the system architecture, technology stack, and foundational requirements established during Sprint 1.

### 1.2 Scope

AssetBridge is a web-based application designed to manage the complete procurement and asset lifecycle within corporate environments. The system covers:

- **Settings Management**: Roles, permissions, departments, and users
- **Vendor Management**: Vendor registration, profiles, and evaluation
- **Purchase Requests**: Request initiation and quotation management
- **Purchase Orders**: Order creation, approval, and documentation
- **Goods Received Notes (GRN)**: Receipt tracking and inventory updates
- **Stock Management**: Inventory visibility and movement tracking

### 1.3 Intended Audience

This document is intended for:

- Software developers implementing the system
- Project managers planning sprints and releases
- Quality assurance teams writing test cases
- System administrators deploying and maintaining the platform
- Stakeholders reviewing system capabilities

### 1.4 Definitions and Acronyms

| Term | Definition |
|------|------------|
| **API** | Application Programming Interface |
| **ACM** | Automatic Certificate Management (Heroku) |
| **CI/CD** | Continuous Integration / Continuous Deployment |
| **CORS** | Cross-Origin Resource Sharing |
| **DoD** | Definition of Done |
| **E2E** | End-to-End (testing) |
| **GRN** | Goods Received Note |
| **JWT** | JSON Web Token (for authentication) |
| **MERN** | MongoDB, Express, React, Node.js |
| **RBAC** | Role-Based Access Control |
| **SRS** | Software Requirements Specification |
| **SSL/TLS** | Secure Sockets Layer / Transport Layer Security |

---

## 2. Overall Description

### 2.1 Product Perspective

AssetBridge is a standalone web application with the following system context:

```
┌─────────────────────────────────────────────────────────┐
│                    End Users (Browser)                  │
│        Corporate Employees, Procurement Staff           │
└───────────────────┬─────────────────────────────────────┘
                    │ HTTPS
                    ↓
┌─────────────────────────────────────────────────────────┐
│              Frontend (React Application)               │
│         https://assetbridge.hikvision.lk                │
│    - User Interface                                     │
│    - Client-side Validation                             │
│    - State Management                                   │
└───────────────────┬─────────────────────────────────────┘
                    │ REST API (HTTPS)
                    ↓
┌─────────────────────────────────────────────────────────┐
│            Backend (Express API Server)                 │
│       https://api.assetbridge.hikvision.lk              │
│    - Business Logic                                     │
│    - Authentication & Authorization                     │
│    - Data Validation                                    │
│    - API Endpoints                                      │
└───────────────────┬─────────────────────────────────────┘
                    │ MongoDB Driver
                    ↓
┌─────────────────────────────────────────────────────────┐
│               Database (MongoDB Atlas)                  │
│    - Data Persistence                                   │
│    - User Data                                          │
│    - Transactional Records                              │
│    - Asset Information                                  │
└─────────────────────────────────────────────────────────┘
```

### 2.2 Product Functions

High-level functional categories:

1. **User Management**: Authentication, authorization, role management
2. **Vendor Management**: Vendor registration, profiles, performance tracking
3. **Procurement Workflow**: Purchase requests → Purchase orders → GRN
4. **Inventory Management**: Stock tracking, movements, reporting
5. **Settings & Configuration**: Departments, permissions, system settings

### 2.3 User Classes and Characteristics

| User Class | Description | Technical Expertise | Frequency of Use |
|------------|-------------|---------------------|------------------|
| **System Administrator** | Manages users, roles, departments, and system settings | High | Daily |
| **Procurement Manager** | Oversees purchase requests, approves orders, manages vendors | Medium | Daily |
| **Department Staff** | Creates purchase requests, tracks orders | Low-Medium | Weekly |
| **Warehouse Staff** | Processes GRNs, manages stock | Low-Medium | Daily |
| **Finance Staff** | Reviews invoices, payment documentation | Medium | Daily |
| **Read-Only Users** | Views reports and dashboards | Low | As needed |

### 2.4 Operating Environment

**Client-Side Requirements:**
- Modern web browser (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
- JavaScript enabled
- Minimum screen resolution: 1280x720
- Internet connectivity required

**Server-Side Environment:**
- **Frontend Hosting**: Heroku (Node.js environment with `serve` package)
- **Backend Hosting**: Heroku (Node.js 18+ runtime)
- **Database**: MongoDB Atlas (cloud-hosted)
- **SSL/TLS**: Automatic via Heroku ACM with Let's Encrypt certificates

### 2.5 Design and Implementation Constraints

| Constraint Type | Description |
|----------------|-------------|
| **Technology Stack** | MERN stack (MongoDB, Express, React, Node.js) required |
| **Development Methodology** | Agile sprints with continuous deployment |
| **Browser Compatibility** | Must support modern browsers (no IE support) |
| **Security** | HTTPS required for all communications |
| **Deployment** | Must be deployable via GitHub Actions to Heroku |
| **Testing** | All features require unit and E2E tests |
| **Documentation** | All code must be documented with inline comments |

### 2.6 Assumptions and Dependencies

**Assumptions:**
- Users have stable internet connectivity
- Users have basic computer literacy
- Corporate environment provides necessary access controls
- MongoDB Atlas cluster is always available

**Dependencies:**
- **Third-Party Services**:
  - Heroku (hosting platform)
  - MongoDB Atlas (database service)
  - GitHub (version control and CI/CD)
  - Let's Encrypt (SSL certificates via Heroku ACM)
- **External Libraries**: See `package.json` files in each workspace

---

## 3. System Architecture (Sprint 1 Implementation)

### 3.1 Architectural Pattern

AssetBridge follows a **3-Tier Architecture**:

```
┌────────────────────────────────────────────────────┐
│           Presentation Tier (Frontend)             │
│                                                    │
│  - React 18 Components                            │
│  - Vite Build Tool                                │
│  - TypeScript                                     │
│  - Client-side Routing                            │
│  - API Client Service Layer                       │
└────────────────┬───────────────────────────────────┘
                 │ REST API over HTTPS
┌────────────────┴───────────────────────────────────┐
│            Application Tier (Backend)              │
│                                                    │
│  - Express.js Framework                           │
│  - RESTful API Endpoints                          │
│  - Business Logic Layer                           │
│  - Authentication & Authorization Middleware       │
│  - Request Validation                             │
└────────────────┬───────────────────────────────────┘
                 │ Mongoose ODM
┌────────────────┴───────────────────────────────────┐
│              Data Tier (Database)                  │
│                                                    │
│  - MongoDB Atlas                                  │
│  - Document-based Storage                         │
│  - Indexes for Performance                        │
│  - Replication & Backup                           │
└────────────────────────────────────────────────────┘
```

### 3.2 Technology Stack

#### Frontend Technologies
| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| **Framework** | React | 18.2.0 | UI component library |
| **Build Tool** | Vite | 4.4.5 | Fast build and HMR |
| **Language** | TypeScript | Latest | Type safety |
| **Testing** | Vitest | 0.34.1 | Unit testing |
| **E2E Testing** | Playwright | 1.40.0 | End-to-end testing |
| **HTTP Client** | Fetch API | Native | API communication |
| **Deployment** | serve | 14.2.1 | Static file serving |

#### Backend Technologies
| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| **Runtime** | Node.js | 18.x | JavaScript runtime |
| **Framework** | Express | 4.18.2 | Web server framework |
| **Language** | TypeScript | Latest | Type safety |
| **Database Driver** | Mongoose | 7.5.0 | MongoDB ODM |
| **Testing** | Jest | 29.6.4 | Unit testing |
| **Development** | Nodemon | 3.0.1 | Hot reload |

#### Database
| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Database** | MongoDB Atlas | Cloud-hosted NoSQL database |
| **ODM** | Mongoose | Schema validation and modeling |

#### DevOps & Deployment
| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Version Control** | Git + GitHub | Source code management |
| **CI/CD** | GitHub Actions | Automated testing and deployment |
| **Hosting** | Heroku (dual-dyno) | Production hosting |
| **SSL/TLS** | Heroku ACM | Automatic certificate management |
| **DNS** | Custom domains | Production URLs |

### 3.3 Monorepo Structure

AssetBridge uses **npm workspaces** for monorepo management:

```
assetbridge/
├── packages/
│   ├── backend/          # Express API server
│   │   ├── src/
│   │   │   ├── config/   # Database, environment config
│   │   │   ├── routes/   # API route handlers
│   │   │   ├── app.ts    # Express app configuration
│   │   │   └── index.ts  # Server entry point
│   │   ├── tests/        # Jest unit tests
│   │   └── package.json
│   │
│   ├── frontend/         # React application
│   │   ├── src/
│   │   │   ├── services/ # API client layer
│   │   │   ├── App.tsx   # Root component
│   │   │   └── main.tsx  # Application entry
│   │   ├── tests/        # Vitest unit tests
│   │   ├── e2e/          # Playwright E2E tests
│   │   └── package.json
│   │
│   └── shared/           # Shared TypeScript types
│       ├── src/
│       │   └── types.ts  # Common interfaces
│       └── package.json
│
├── .github/
│   └── workflows/
│       └── ci-cd.yml     # GitHub Actions pipeline
│
├── docs/                 # All documentation
│   ├── guides/           # Setup and deployment guides
│   ├── bugs/             # Bug tracking journal
│   ├── sprints/          # Sprint documentation
│   └── srs/              # Requirements (this document)
│
├── package.json          # Root package with workspaces
├── Procfile.backend      # Backend Heroku config
├── Procfile.frontend     # Frontend Heroku config
└── CLAUDE.md             # Development instructions
```

### 3.4 Deployment Architecture

AssetBridge uses a **dual-dyno deployment** on Heroku:

```
                    ┌──────────────────────┐
                    │   DNS (hikvision.lk) │
                    └──────────┬───────────┘
                               │
                ┌──────────────┴─────────────┐
                │                            │
                ↓                            ↓
┌───────────────────────────┐   ┌────────────────────────┐
│  Frontend Heroku Dyno     │   │  Backend Heroku Dyno   │
│  assetbridge-frontend     │   │  assetbridge-backend   │
│                           │   │                        │
│  Domain:                  │   │  Domain:               │
│  assetbridge.hikvision.lk │   │  api.assetbridge       │
│                           │   │    .hikvision.lk       │
│                           │   │                        │
│  Process:                 │   │  Process:              │
│  serve -s dist -l $PORT   │   │  node dist/index.js    │
│                           │   │                        │
│  SSL: Heroku ACM          │   │  SSL: Heroku ACM       │
│  (Let's Encrypt)          │   │  (Let's Encrypt)       │
└───────────────────────────┘   └────────────┬───────────┘
                                             │
                                             │ MongoDB Driver
                                             ↓
                                ┌────────────────────────┐
                                │   MongoDB Atlas        │
                                │   (Cloud Database)     │
                                └────────────────────────┘
```

**Key Deployment Features:**
- Separate dynos for frontend and backend
- Custom domains with SSL/TLS certificates
- Automatic certificate renewal via ACM
- Environment-based configuration
- Zero-downtime deployments

---

## 4. Sprint 1 Requirements (Implemented)

### 4.1 Foundational Infrastructure Requirements

#### NFR-001: Monorepo Architecture
**Priority**: P0 - Critical
**Status**: Implemented ✅
**Description**: The system must use a monorepo structure to manage frontend, backend, and shared code.

**Acceptance Criteria:**
- [x] npm workspaces configured
- [x] Three packages: backend, frontend, shared
- [x] Root package.json with workspace scripts
- [x] TypeScript configured for all workspaces
- [x] Cross-package imports working (e.g., `@assetbridge/shared`)

**Implementation**: See `/package.json` and workspace structure

---

#### NFR-002: Development Environment
**Priority**: P0 - Critical
**Status**: Implemented ✅
**Description**: Developers must be able to run the full stack locally with hot reload.

**Acceptance Criteria:**
- [x] Backend runs on `http://localhost:5001` with nodemon
- [x] Frontend runs on `http://localhost:3000` with Vite HMR
- [x] Environment variables loaded from `.env` files
- [x] MongoDB Atlas connection from local environment
- [x] CORS configured for local development

**Commands:**
```bash
npm run dev:backend   # Start backend with hot reload
npm run dev:frontend  # Start frontend with HMR
```

**Documentation**: `docs/guides/local-development.md`

---

#### NFR-003: Code Quality Standards
**Priority**: P0 - Critical
**Status**: Implemented ✅
**Description**: All code must follow consistent style and quality standards.

**Acceptance Criteria:**
- [x] ESLint configured for TypeScript
- [x] Prettier configured for formatting
- [x] All source files have inline documentation
- [x] No TypeScript errors in strict mode
- [x] Linting passes in CI pipeline

**Commands:**
```bash
npm run lint   # Run ESLint on all workspaces
```

---

### 4.2 Backend Requirements

#### FR-001: Hello World API Endpoint
**Priority**: P0 - Critical
**Status**: Implemented ✅
**Description**: The backend must provide a REST API endpoint for testing connectivity.

**Endpoint**: `GET /api/hello`

**Response Format**:
```json
{
  "success": true,
  "data": {
    "message": "Hello World from AssetBridge!",
    "timestamp": "2025-10-15T00:00:00.000Z"
  }
}
```

**Acceptance Criteria:**
- [x] Endpoint returns HTTP 200 status
- [x] Response follows standardized format (ApiResponse wrapper)
- [x] Includes timestamp in ISO 8601 format
- [x] CORS headers allow frontend origin
- [x] Works in both development and production

**Implementation**: `packages/backend/src/routes/hello.routes.ts:15`

**Tests**: `packages/backend/tests/routes/hello.routes.test.ts`

---

#### FR-002: Health Check Endpoint
**Priority**: P0 - Critical
**Status**: Implemented ✅
**Description**: The backend must provide a health check endpoint for monitoring.

**Endpoint**: `GET /health`

**Response Format**:
```json
{
  "status": "ok",
  "timestamp": "2025-10-15T00:00:00.000Z"
}
```

**Acceptance Criteria:**
- [x] Endpoint returns HTTP 200 when server is healthy
- [x] Includes current timestamp
- [x] Accessible without authentication
- [x] Used by Heroku for dyno health checks

**Implementation**: `packages/backend/src/app.ts:67`

---

#### NFR-004: Database Connectivity
**Priority**: P0 - Critical
**Status**: Implemented ✅
**Description**: The backend must establish and maintain connection to MongoDB Atlas.

**Acceptance Criteria:**
- [x] Mongoose connection configured
- [x] Connection established on server startup
- [x] Connection errors logged and handled
- [x] Environment variable for MongoDB URI
- [x] Connection status logged to console

**Implementation**: `packages/backend/src/config/database.ts`

**Environment Variable**: `MONGODB_URI`

---

#### NFR-005: CORS Configuration
**Priority**: P0 - Critical
**Status**: Implemented ✅
**Description**: Backend API must allow cross-origin requests from authorized origins.

**Acceptance Criteria:**
- [x] CORS middleware configured
- [x] Allowed origins: localhost:3000 (dev), assetbridge.hikvision.lk (prod)
- [x] Credentials enabled for authenticated requests
- [x] Proper CORS headers in responses

**Implementation**: `packages/backend/src/app.ts:31`

**Allowed Origins**:
- `http://localhost:3000` (development)
- `https://assetbridge.hikvision.lk` (production)

---

### 4.3 Frontend Requirements

#### FR-003: Display Hello World Message
**Priority**: P0 - Critical
**Status**: Implemented ✅
**Description**: The frontend must fetch and display the hello world message from the API.

**Acceptance Criteria:**
- [x] API call to `/api/hello` on component mount
- [x] Display message from API response
- [x] Show loading state during API call
- [x] Display error message if API call fails
- [x] Timestamp displayed in readable format

**Implementation**: `packages/frontend/src/App.tsx`

**User Interface**: Simple centered layout with message and timestamp

---

#### NFR-006: API Client Service
**Priority**: P0 - Critical
**Status**: Implemented ✅
**Description**: Frontend must have a centralized API client for all backend communications.

**Acceptance Criteria:**
- [x] API service layer created
- [x] Base URL from environment variable (VITE_API_URL)
- [x] Type-safe responses using shared types
- [x] Error handling built-in
- [x] Easy to extend for new endpoints

**Implementation**: `packages/frontend/src/services/api.ts`

**Environment Variable**: `VITE_API_URL`
- Development: Empty string (uses Vite proxy)
- Production: `https://api.assetbridge.hikvision.lk`

---

#### NFR-007: Environment-Based Configuration
**Priority**: P0 - Critical
**Status**: Implemented ✅
**Description**: Frontend must support different configurations for development and production.

**Acceptance Criteria:**
- [x] Environment variables prefixed with `VITE_`
- [x] Variables baked into build at compile-time
- [x] Different API URLs for dev vs production
- [x] Environment variables validated

**Configuration**:
```bash
# Development (.env.local)
VITE_API_URL=     # Empty uses Vite proxy

# Production (Heroku config)
VITE_API_URL=https://api.assetbridge.hikvision.lk
```

---

### 4.4 Testing Requirements

#### NFR-008: Backend Unit Testing
**Priority**: P1 - High
**Status**: Implemented ✅
**Description**: All backend routes and utilities must have unit tests.

**Acceptance Criteria:**
- [x] Jest configured for backend
- [x] Tests for `/api/hello` endpoint
- [x] Test coverage reporting enabled
- [x] Tests run in CI pipeline
- [x] All tests passing

**Commands**:
```bash
npm run test:backend     # Run backend tests
```

**Test Files**: `packages/backend/tests/`

---

#### NFR-009: Frontend Unit Testing
**Priority**: P1 - High
**Status**: Implemented ✅
**Description**: Frontend components must have unit tests.

**Acceptance Criteria:**
- [x] Vitest configured for frontend
- [x] Tests for App component
- [x] Test coverage reporting enabled
- [x] Tests run in CI pipeline
- [x] All tests passing

**Commands**:
```bash
npm run test:frontend    # Run frontend tests
```

**Test Files**: `packages/frontend/tests/`

---

#### NFR-010: End-to-End Testing
**Priority**: P1 - High
**Status**: Implemented ✅
**Description**: Critical user workflows must have E2E tests.

**Acceptance Criteria:**
- [x] Playwright configured
- [x] E2E test for hello world page
- [x] Console error detection enabled
- [x] Screenshots on failure
- [x] Multiple browser testing (Chromium, Firefox, WebKit)

**Commands**:
```bash
cd packages/frontend
npm run test:e2e         # Run E2E tests
npm run test:e2e:ui      # Run with Playwright UI
npm run test:e2e:debug   # Debug mode
```

**Documentation**: `docs/guides/e2e-testing.md`

---

### 4.5 CI/CD Requirements

#### NFR-011: Automated Testing Pipeline
**Priority**: P0 - Critical
**Status**: Implemented ✅
**Description**: All code pushed to main or release branches must be automatically tested.

**Acceptance Criteria:**
- [x] GitHub Actions workflow configured
- [x] Triggers on push and pull requests
- [x] Runs linting checks
- [x] Runs backend unit tests
- [x] Runs frontend unit tests
- [x] Builds both packages
- [x] Fails if any check fails

**Pipeline Steps**:
1. Checkout code
2. Setup Node.js 18
3. Install dependencies (`npm ci`)
4. Build shared package
5. Run linting
6. Run backend tests
7. Run frontend tests
8. Build backend
9. Build frontend

**Workflow File**: `.github/workflows/ci-cd.yml`

---

#### NFR-012: Automated Deployment
**Priority**: P0 - Critical
**Status**: Implemented ✅
**Description**: Code merged to release branch must be automatically deployed to production.

**Acceptance Criteria:**
- [x] Deployment only on release branch
- [x] Deployment only after tests pass
- [x] Backend and frontend deployed in parallel
- [x] Environment variables configured in Heroku
- [x] Deployment status visible in GitHub

**Deployment Process**:
1. Tests pass on release branch
2. Backend deployment job starts
   - Install Heroku CLI
   - Configure credentials (.netrc)
   - Push to backend Heroku app
3. Frontend deployment job starts
   - Install Heroku CLI
   - Configure credentials (.netrc)
   - Set environment variables
   - Push to frontend Heroku app

**Branch Strategy**: `feature → main → release`

**Documentation**: `docs/guides/github-actions-deployment.md`

---

#### NFR-013: Production Hosting
**Priority**: P0 - Critical
**Status**: Implemented ✅
**Description**: Application must be hosted on Heroku with custom domains and SSL.

**Acceptance Criteria:**
- [x] Backend deployed to Heroku
- [x] Frontend deployed to separate Heroku dyno
- [x] Custom domains configured
- [x] SSL certificates issued via ACM
- [x] HTTPS enforced on both domains
- [x] MongoDB connection working in production

**Production URLs**:
- Frontend: https://assetbridge.hikvision.lk
- Backend: https://api.assetbridge.hikvision.lk

**Heroku Apps**:
- `assetbridge-backend` (backend dyno)
- `assetbridge-frontend` (frontend dyno)

---

### 4.6 Documentation Requirements

#### NFR-014: Comprehensive Documentation
**Priority**: P1 - High
**Status**: Implemented ✅
**Description**: All setup, deployment, and development processes must be documented.

**Acceptance Criteria:**
- [x] CLAUDE.md updated with project overview
- [x] Local development guide created
- [x] Deployment guide created
- [x] E2E testing guide created
- [x] Bug tracking system established
- [x] Sprint 1 retrospective completed

**Documentation Files**:
- `CLAUDE.md` - Project overview and development guide
- `docs/guides/local-development.md` - Local setup instructions
- `docs/guides/github-actions-deployment.md` - Deployment guide
- `docs/guides/e2e-testing.md` - E2E testing guide
- `docs/bugs/README.md` - Bug tracking process
- `docs/sprints/SPRINT1.md` - Sprint 1 documentation

---

## 5. Non-Functional Requirements (General)

### 5.1 Performance

| Requirement | Target | Status |
|-------------|--------|--------|
| **Page Load Time** | < 3 seconds (first load) | To be measured |
| **API Response Time** | < 500ms (p95) | To be measured |
| **Database Query Time** | < 200ms (p95) | To be measured |
| **Build Time** | < 2 minutes (CI/CD) | ✅ Achieved (~1.5 min) |

### 5.2 Security

| Requirement | Implementation | Status |
|-------------|----------------|--------|
| **HTTPS Only** | Enforced via Heroku | ✅ Implemented |
| **CORS Protection** | Allowed origins configured | ✅ Implemented |
| **Environment Variables** | Secrets in Heroku config | ✅ Implemented |
| **Input Validation** | To be implemented | 🔜 Sprint 2+ |
| **Authentication** | To be implemented | 🔜 Sprint 2+ |
| **Authorization (RBAC)** | To be implemented | 🔜 Sprint 2+ |

### 5.3 Reliability

| Requirement | Target | Status |
|-------------|--------|--------|
| **Uptime** | 99.5% | Heroku SLA |
| **Error Handling** | All errors logged | Partial |
| **Database Backups** | Daily automated | MongoDB Atlas default |
| **Disaster Recovery** | RPO < 24h, RTO < 4h | MongoDB Atlas |

### 5.4 Scalability

| Aspect | Current Capacity | Scaling Strategy |
|--------|------------------|------------------|
| **Concurrent Users** | 100 (Heroku Eco) | Upgrade dyno tier |
| **Database** | MongoDB Atlas M0 (512MB) | Upgrade cluster tier |
| **File Storage** | Not implemented | To be determined |
| **API Rate Limiting** | Not implemented | To be implemented |

### 5.5 Maintainability

| Requirement | Implementation | Status |
|-------------|----------------|--------|
| **Code Documentation** | Inline comments | ✅ All files documented |
| **Type Safety** | TypeScript strict mode | ✅ Enabled |
| **Code Linting** | ESLint + Prettier | ✅ Configured |
| **Test Coverage** | Unit + E2E tests | ✅ Basic coverage |
| **Version Control** | Git with feature branches | ✅ Implemented |

---

## 6. Future Requirements (Out of Scope for Sprint 1)

### 6.1 Authentication & Authorization (Sprint 2)

**To be implemented**:
- User registration and login
- JWT-based authentication
- Role-based access control (RBAC)
- Password reset functionality
- Session management

### 6.2 Business Modules (Sprint 3+)

**Settings Module**:
- FR-100: User management (CRUD)
- FR-101: Role management (CRUD)
- FR-102: Department management (CRUD)
- FR-103: Permission assignment

**Vendor Management**:
- FR-200: Vendor registration
- FR-201: Vendor profile management
- FR-202: Vendor evaluation
- FR-203: Vendor search and filtering

**Purchase Requests**:
- FR-300: Create purchase request
- FR-301: Request approval workflow
- FR-302: Quotation management
- FR-303: Vendor selection

**Purchase Orders**:
- FR-400: Create purchase order from request
- FR-401: PO approval workflow
- FR-402: Invoice upload and management
- FR-403: Payment tracking

**GRN**:
- FR-500: Create GRN from PO
- FR-501: Item verification
- FR-502: Inventory update
- FR-503: Discrepancy reporting

**Stock Management**:
- FR-600: View stock levels
- FR-601: Stock movements tracking
- FR-602: Stock reports
- FR-603: Low stock alerts

### 6.3 Advanced Features

**To be evaluated**:
- Real-time notifications
- Advanced reporting and analytics
- File upload and management
- Export functionality (PDF, Excel)
- Email notifications
- Mobile responsiveness improvements
- Offline capability
- Integration with external systems

---

## 7. Appendices

### Appendix A: API Endpoints (Sprint 1)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/hello` | Test endpoint returning hello message | No |
| GET | `/health` | Health check endpoint | No |

### Appendix B: Technology Versions

| Technology | Version | Release Date | EOL Date |
|------------|---------|--------------|----------|
| Node.js | 18.x LTS | 2022-10-25 | 2025-04-30 |
| React | 18.2.0 | 2022-06-14 | Active |
| TypeScript | 5.x | 2023-03-16 | Active |
| MongoDB | 6.x | 2022-07-19 | Active |
| Express | 4.18.x | 2022-04-25 | Active |

### Appendix C: Environment Variables

**Backend** (`assetbridge-backend`):
```bash
NODE_ENV=production
MONGODB_URI=mongodb+srv://...
PORT=(assigned by Heroku)
```

**Frontend** (`assetbridge-frontend`):
```bash
VITE_API_URL=https://api.assetbridge.hikvision.lk
PORT=(assigned by Heroku)
```

### Appendix D: Resolved Issues

- **BUG-001**: Heroku deployment failure (monorepo build order)
  - **Resolution**: Sequential builds in package.json
  - **Documentation**: `docs/bugs/resolved/BUG-001-...md`

### Appendix E: References

- [CLAUDE.md](../../CLAUDE.md) - Project development guide
- [Sprint 1 Documentation](../sprints/SPRINT1.md) - Sprint 1 details
- [Local Development Guide](../guides/local-development.md) - Setup instructions
- [Deployment Guide](../guides/github-actions-deployment.md) - CI/CD and Heroku
- [E2E Testing Guide](../guides/e2e-testing.md) - Playwright testing

---

## Document Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-10-15 | System | Initial SRS created after Sprint 1 completion |

---

**Status**: This document reflects the current state after Sprint 1. It will be updated as new requirements are defined and implemented in future sprints.
