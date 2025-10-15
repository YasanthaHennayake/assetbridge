# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AssetBridge is a corporate-grade Procurement and Asset Management system with the following core modules:

### Settings
- **Permissions and Roles**: Define user roles and permission levels
- **Departments**: Manage organizational departments
- **Users**: User management and access control
- **Other Settings**: System-wide configuration options

### Vendor Management
- Vendor registration and profile management
- Vendor evaluation and performance tracking

### Purchase Request
- Initiate purchase requests
- Complete workflow from initiation to vendor recommendation
- Obtain and manage quotations from vendors

### Purchase Order
- Create Purchase Orders from completed Purchase Requests
- Handle purchase approval workflow
- Upload and manage invoice files
- Upload and manage payment advice files

### GRN (Goods Received Note)
- Process GRN from completed Purchase Orders
- Track received items against orders
- Update inventory upon receipt

### Stock
- View and manage items in stock
- Track inventory levels
- Monitor stock movements

## Architecture Notes

### Tech Stack (MERN)
- **Frontend**: React
- **Backend**: Node.js with Express
- **Database**: MongoDB (MongoDB Atlas preferred)
- **Repository Structure**: Monorepo architecture

### Deployment & CI/CD
- **Hosting**: Deploy to Heroku
- **CI/CD**: Use GitHub Actions/Pipelines for automated deployment
- **Testing**: Complete end-to-end testing required for:
  - Frontend: UI simulation to verify behaviors and workflows
  - API: Comprehensive API endpoint testing

### Key Architectural Principles

#### Monorepo Structure
- Organize code into distinct packages/modules within a single repository
- Frontend and backend should be separate workspaces
- Shared utilities and types can be in a common package

#### Role-Based Access Control
- Implement RBAC as a core cross-cutting concern from the start
- Roles are managed through Settings > Permissions and Roles
- Ensure all API endpoints and UI components respect role permissions

#### Workflow Management
- Purchase Request → Purchase Order → GRN flow must be enforced
- Each stage requires proper status tracking and state transitions
- Audit trails for all procurement and asset-related transactions

#### Data Model Considerations
- Vendor information and procurement records require audit trails
- Asset lifecycle tracking needs to maintain historical state changes
- Document uploads (invoices, payment advice) must be securely stored
- Consider compliance and regulatory requirements for data retention

## Development Setup

### Prerequisites
- Node.js 18+ (check with `node --version`)
- npm (comes with Node.js)
- MongoDB Atlas account
- Git

### Initial Setup

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd assetbridge
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables**:

   Backend (`packages/backend/.env`):
   ```
   PORT=5001
   NODE_ENV=development
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/assetbridge
   ```

   Frontend (`packages/frontend/.env`):
   ```
   VITE_API_URL=http://localhost:5001
   ```

4. **Build shared package** (required before running backend/frontend):
   ```bash
   cd packages/shared && npm run build && cd ../..
   ```

### Running the Application

Start both backend and frontend in development mode:

```bash
# Terminal 1: Run backend
npm run dev:backend

# Terminal 2: Run frontend
npm run dev:frontend
```

- Backend API: http://localhost:5001
- Frontend: http://localhost:3000

## Key Commands

### Development
```bash
npm run dev              # Run all packages in dev mode
npm run dev:backend      # Run backend only
npm run dev:frontend     # Run frontend only
```

### Building
```bash
npm run build            # Build all packages
npm run build:backend    # Build backend only
npm run build:frontend   # Build frontend only
```

### Testing
```bash
npm test                 # Run all tests
npm run test:backend     # Run backend tests (Jest)
npm run test:frontend    # Run frontend tests (Vitest)

# E2E Testing (Frontend - Playwright)
cd packages/frontend
npm run test:e2e         # Run E2E tests (headless)
npm run test:e2e:ui      # Run with Playwright UI (recommended)
npm run test:e2e:headed  # Run with visible browser
npm run test:e2e:debug   # Run in debug mode
```

**E2E Testing Features:**
- Tests run in real browsers (Chromium, Firefox, WebKit)
- Automatic console error detection and reporting
- Screenshots captured on test failure
- Video recording on first retry
- Automatically starts/stops dev server
- Network request monitoring

### Code Quality
```bash
npm run lint             # Lint all packages
```

### Production
```bash
# Backend (after building)
cd packages/backend && npm start
```

## Documentation Structure

All project documentation is organized under the `docs/` directory:

### Guides (`docs/guides/`)
Development and setup guides:
- **`local-development.md`**: Complete guide for setting up and running AssetBridge locally, including prerequisites, MongoDB Atlas setup, environment configuration, troubleshooting, and common development tasks
- **`github-actions-deployment.md`**: Complete guide for CI/CD setup, branch strategy, GitHub Actions configuration, Heroku deployment, and troubleshooting
- **`e2e-testing.md`**: Comprehensive guide for writing E2E tests with Playwright, including console error detection, browser automation, and debugging techniques

### Bug Tracking (`docs/bugs/`)
Bug tracking and debugging documentation:
- `active/` - Bugs currently being investigated
- `resolved/` - Fixed bugs with complete documentation
- `TEMPLATE.md` - Template for new bug reports
- `README.md` - Bug tracking workflow and guidelines

### Sprint Planning (`docs/sprints/`)
Sprint planning and progress documentation:
- `SPRINT1.md` - Initial sprint (infrastructure setup)
- `SPRINT2.md` - User authentication and password management

### Requirements (`docs/srs/`)
Software Requirements Specification documents and system requirements.

### Features (`docs/features/`)
Feature specifications and detailed feature documentation.

### Releases (`docs/releases/`)
Release notes and version documentation:
- `RELEASE_v0.2.0.md` - Sprint 2 release (User Authentication)
- Future release notes will be added here

**Rule for Future Development**: When creating new documentation, place it in the appropriate subfolder under `docs/` and reference it here in CLAUDE.md.

## Project Structure

```
assetbridge/
├── packages/
│   ├── backend/          # Express API server
│   │   ├── src/
│   │   │   ├── config/   # Configuration (database, etc.)
│   │   │   ├── routes/   # API routes
│   │   │   ├── app.ts    # Express app setup
│   │   │   └── index.ts  # Server entry point
│   │   └── package.json
│   ├── frontend/         # React application
│   │   ├── src/
│   │   │   ├── services/ # API client
│   │   │   ├── App.tsx   # Main component
│   │   │   └── main.tsx  # Entry point
│   │   └── package.json
│   └── shared/           # Shared types and utilities
│       ├── src/
│       │   └── types.ts  # TypeScript interfaces
│       └── package.json
├── docs/                 # All documentation
│   ├── guides/           # Development and setup guides
│   ├── bugs/             # Bug tracking journal
│   │   ├── active/       # Bugs being investigated
│   │   ├── resolved/     # Fixed bugs
│   │   ├── TEMPLATE.md   # Bug report template
│   │   └── README.md     # Bug tracking process
│   ├── sprints/          # Sprint planning documents
│   ├── srs/              # Software Requirements Specification
│   ├── features/         # Feature specifications
│   └── releases/         # Release notes and version documentation
├── .github/
│   └── workflows/        # GitHub Actions CI/CD
├── package.json          # Root package (workspace config)
└── CLAUDE.md             # This file
```

## Bug Tracking Process

AssetBridge uses a markdown-based bug tracking system for documenting issues and debugging processes.

### Why Markdown Bug Tracking?

For solo development, this approach offers:
- ✅ Everything in your IDE (no context switching)
- ✅ Version controlled with code
- ✅ Detailed documentation space
- ✅ Searchable debugging journal
- ✅ Personal knowledge base

### Directory Structure

```
docs/bugs/
├── active/           # Bugs currently being investigated or fixed
├── resolved/         # Fixed bugs with complete documentation
├── TEMPLATE.md       # Template for new bug reports
└── README.md         # Detailed process documentation
```

### Quick Workflow

**1. Bug Discovered:**
```bash
# Copy template
cp docs/bugs/TEMPLATE.md docs/bugs/active/BUG-001-brief-description.md
# Fill in initial details: description, steps to reproduce, error messages
```

**2. During Investigation:**
- Update the bug file as you debug
- Document each step with date and findings
- Record hypotheses, code examined, test results
- Include code snippets and error logs

**3. Bug Fixed:**
```bash
# Move to resolved with resolution date
mv docs/bugs/active/BUG-001-description.md \
   docs/bugs/resolved/BUG-001-description-RESOLVED-2024-10-14.md
```
- Complete root cause analysis
- Document solution and code changes
- Add prevention strategies
- Include lessons learned

### Bug Naming Convention

- Format: `BUG-XXX-brief-description.md`
- Sequential numbering: 001, 002, 003...
- Examples:
  - `BUG-001-api-timeout-on-large-datasets.md`
  - `BUG-002-login-button-not-responding.md`
  - `BUG-003-mongodb-connection-drops.md`

### Severity Levels

- **Critical**: System crash, data loss, security vulnerability
- **High**: Major feature broken, blocks development
- **Medium**: Feature partially works, workaround available
- **Low**: Minor issue, cosmetic problem

### When to Document

**Always document:**
- Bugs taking >30 minutes to fix
- Issues requiring significant investigation
- Problems that might recur
- Interesting or tricky bugs (learning opportunity)

**Optional:**
- Simple typos or obvious mistakes
- Quick fixes (<5 minutes)

### Integration with Git

Reference bugs in commit messages:
```bash
git commit -m "Fix API timeout issue (BUG-001)

- Increased query timeout to 30s
- Added connection pooling
- See docs/bugs/resolved/BUG-001-api-timeout.md for details"
```

Branch naming:
```bash
git checkout -b fix/BUG-001-api-timeout
```

### Benefits

- **Debugging Journal**: Keeps thoughts organized during investigation
- **Knowledge Base**: Reference for similar issues later
- **Context Preservation**: Easy to resume after breaks
- **Learning Tool**: Build problem-solving expertise
- **Portfolio Material**: Demonstrates debugging skills

### See Also

For complete details, templates, and best practices, see:
- `docs/bugs/README.md` - Complete bug tracking guide
- `docs/bugs/TEMPLATE.md` - Bug report template with all sections

## Code Comments

All source code files include comprehensive inline comments explaining:
- File purpose and responsibilities
- Function/method behavior
- Complex logic
- Configuration options
- Usage examples where applicable

This makes the codebase easier to understand and maintain.
