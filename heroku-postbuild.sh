#!/bin/bash

# Heroku Post-Build Script
#
# This script runs after Heroku installs dependencies (npm install/npm ci).
# It builds all packages in the monorepo in the correct order.
#
# Build Order:
# 1. shared: Must be built first (backend and frontend depend on it)
# 2. backend: Compiles TypeScript to JavaScript
# 3. frontend: Bundles React app (backend will serve these static files)
#
# Exit on error: If any command fails, the script stops
set -e

echo "=== Heroku Post-Build Script ==="

# Install dependencies (Heroku does this automatically, but we're explicit)
echo "Installing dependencies..."
npm ci

# Build shared package first
echo "Building shared package..."
cd packages/shared
npm run build
cd ../..

# Build backend
echo "Building backend..."
cd packages/backend
npm run build
cd ../..

# Build frontend
echo "Building frontend..."
cd packages/frontend
npm run build
cd ../..

echo "=== Build Complete! ==="
