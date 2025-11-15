#!/bin/bash

# Quick Test Script for Remix App
# Run this to quickly test your app

set -e

echo "🚀 Quick Test Runner for BundlesUp Remix App"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_info() {
    echo -e "${BLUE}→ $1${NC}"
}

# 1. Check Node version
print_info "Checking Node.js version..."
node --version
print_success "Node.js installed"

# 2. Install dependencies if needed
if [ ! -d "node_modules" ]; then
    print_info "Installing dependencies..."
    npm install
fi
print_success "Dependencies ready"

# 3. Generate Prisma client
print_info "Generating Prisma client..."
npx prisma generate
print_success "Prisma client generated"

# 4. Run type checking
print_info "Running type checking..."
npm run typecheck
print_success "Type checking passed"

# 5. Run tests
print_info "Running tests..."
npm test
print_success "All tests passed"

echo ""
echo "✅ Quick tests completed successfully!"
echo ""
echo "Next steps:"
echo "  • Run 'npm run dev' to start development server"
echo "  • Run 'npm test -- --watch' for continuous testing"
echo "  • Run 'npm test -- --ui' for test UI"
echo ""
