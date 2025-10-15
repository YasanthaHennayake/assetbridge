# Changelog

All notable changes to the AssetBridge project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0] - 2025-01-15

### Added - Sprint 2: User Authentication & Password Management

#### Authentication System
- JWT-based authentication with secure token management
- Bcrypt password hashing with salt rounds configuration
- Protected routes requiring authentication on both frontend and backend
- Automatic token refresh and session management
- Login/logout functionality with proper state management

#### Password Management
- Strong password validation (minimum 8 characters, uppercase, lowercase, numbers, special characters)
- Real-time password strength indicator (weak/medium/strong)
- Change password functionality for authenticated users
- Forced password change flow for first-time users
- Auto-generated secure passwords for new users

#### User Management
- Create new users with email and name
- User listing with pagination (10 users per page)
- Search users by name or email
- View user details including login status and password change requirements
- Admin user seeding script for initial setup

#### Testing & Quality Assurance
- 86 comprehensive tests (46 backend + 40 frontend)
- Backend API tests using Jest and Supertest
- Frontend component tests using Vitest and React Testing Library
- 3 E2E test suites using Playwright:
  - Authentication flows (login, logout, forced password change)
  - User lifecycle (create, view, search)
  - Console error detection in all tests
- Zero linting errors/warnings
- 100% TypeScript type safety with shared types

#### Technical Implementation
- **Frontend**: React 18 with TypeScript, Context API for state management
- **Backend**: Express.js with TypeScript, MongoDB with Mongoose
- **Shared**: Monorepo shared types package for type safety
- **Security**: JWT tokens, bcrypt hashing, request validation, error handling
- **Testing**: Jest, Vitest, Playwright, React Testing Library
- **Code Quality**: ESLint, TypeScript strict mode, comprehensive error handling

#### Documentation
- Complete Sprint 2 documentation (docs/sprints/SPRINT2.md)
- Updated local development guide
- Bug tracking system established with templates
- API documentation for auth and user endpoints

### Changed
- Removed hello world demo routes and replaced with auth/user routes
- Updated frontend App.tsx with proper routing and authentication flow
- Reorganized frontend into pages/components/contexts structure
- Enhanced error handling with detailed error messages and logging

### Security
- Implemented JWT token expiration (24 hours)
- Password hashing with bcrypt (10 salt rounds)
- Protected API endpoints with authentication middleware
- Secure token storage in localStorage with automatic cleanup
- Input validation and sanitization for all user inputs

---

## [0.1.0] - 2024-12-XX

### Added - Sprint 1: Project Infrastructure

#### Project Setup
- Monorepo architecture with workspaces (backend, frontend, shared)
- TypeScript configuration for all packages
- ESLint configuration with TypeScript support
- MongoDB Atlas integration
- Environment variable configuration

#### Deployment Infrastructure
- Heroku deployment for backend and frontend
- GitHub Actions CI/CD pipeline
- Separate Heroku apps for backend and frontend
- Custom domain support
- Automated deployment on push to main branch

#### Development Tools
- Local development setup guide
- npm scripts for development, building, and testing
- Hot reload for both frontend and backend
- Testing infrastructure setup

#### Documentation
- Complete Sprint 1 documentation
- Deployment guide for GitHub Actions and Heroku
- Local development setup instructions
- Project structure documentation in CLAUDE.md

### Technical Stack
- **Frontend**: React + Vite + TypeScript
- **Backend**: Express + TypeScript + MongoDB
- **Database**: MongoDB Atlas
- **Deployment**: Heroku
- **CI/CD**: GitHub Actions

---

## Version History

- **v0.2.0** - Sprint 2: User Authentication & Password Management (2025-01-15)
- **v0.1.0** - Sprint 1: Project Infrastructure & Deployment (2024-12-XX)

---

## Links

- [GitHub Repository](https://github.com/YasanthaHennayake/assetbridge)
- [Project Documentation](./CLAUDE.md)
- [Sprint Documentation](./docs/sprints/)
- [Bug Tracking](./docs/bugs/)
