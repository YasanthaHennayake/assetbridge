# AssetBridge

A corporate-grade Procurement and Asset Management system designed to streamline vendor management, purchasing, and asset lifecycle tracking with role-based access and modular architecture.

## Tech Stack

- **Frontend**: React + Vite + TypeScript
- **Backend**: Node.js + Express + TypeScript
- **Database**: MongoDB Atlas
- **Architecture**: Monorepo (npm workspaces)
- **Testing**: Jest (backend) + Vitest (frontend) + Playwright (E2E)
- **CI/CD**: GitHub Actions
- **Deployment**: Heroku

## Features

- Settings Management (Roles, Permissions, Departments, Users)
- Vendor Management
- Purchase Request Workflow
- Purchase Order Processing
- Goods Received Note (GRN)
- Stock Management

## Prerequisites

- Node.js 18+ ([Download](https://nodejs.org/))
- npm (comes with Node.js)
- MongoDB Atlas account ([Sign up](https://www.mongodb.com/cloud/atlas))
- Git

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/YasanthaHennayake/assetbridge.git
cd assetbridge
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create `.env` files for backend and frontend:

**Backend** (`packages/backend/.env`):
```env
PORT=5001
NODE_ENV=development
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/assetbridge?retryWrites=true&w=majority
```

**Frontend** (`packages/frontend/.env`):
```env
VITE_API_URL=http://localhost:5001
```

### 4. Build Shared Package

```bash
cd packages/shared
npm run build
cd ../..
```

### 5. Run Development Servers

Open two terminal windows:

**Terminal 1 - Backend:**
```bash
npm run dev:backend
```

**Terminal 2 - Frontend:**
```bash
npm run dev:frontend
```

### 6. Access the Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:5001/api
- Health Check: http://localhost:5001/health

## Available Commands

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

# E2E Browser Testing (Playwright)
cd packages/frontend
npm run test:e2e         # Run E2E tests (headless)
npm run test:e2e:ui      # Run with Playwright UI
npm run test:e2e:headed  # Run with visible browser
```

**E2E Testing includes:**
- Real browser automation (Chromium)
- Console error detection
- Screenshots on failure
- Network monitoring

### Code Quality
```bash
npm run lint             # Lint all packages
```

## Project Structure

```
assetbridge/
├── packages/
│   ├── backend/          # Express API server
│   ├── frontend/         # React application
│   └── shared/           # Shared TypeScript types
├── guides/               # Documentation and guides
├── sprints/              # Sprint planning documents
├── .github/workflows/    # CI/CD configuration
└── package.json          # Workspace configuration
```

## Documentation

All documentation is organized under the `docs/` directory:

- **[CLAUDE.md](./CLAUDE.md)** - Complete development guide and architecture overview
- **[docs/guides/local-development.md](./docs/guides/local-development.md)** - Local development setup guide
- **[docs/guides/github-actions-deployment.md](./docs/guides/github-actions-deployment.md)** - CI/CD setup and deployment instructions
- **[docs/guides/e2e-testing.md](./docs/guides/e2e-testing.md)** - End-to-end testing with Playwright
- **[docs/sprints/SPRINT1.md](./docs/sprints/SPRINT1.md)** - Initial sprint planning
- **[docs/bugs/README.md](./docs/bugs/README.md)** - Bug tracking process

## Development Workflow

1. Create feature branch from `main`: `git checkout -b feature/your-feature`
2. Develop and test locally
3. Create Pull Request to `main`
4. After review and tests pass, merge to `main`
5. When ready for production, merge `main` to `release`
6. Automatic deployment to Heroku happens on `release` branch

See the [deployment guide](./docs/guides/github-actions-deployment.md) for detailed workflow instructions.

## Contributing

1. Follow the branch naming convention: `feature/feature-name`
2. Write comprehensive tests for new features
3. Ensure all tests pass before creating PR
4. Add inline code comments explaining complex logic
5. Update documentation when adding new features

## License

ISC

## Support

For issues and questions, please create an issue in the GitHub repository.
