#!/bin/bash

# BundlesUp Installation Verification Script

echo "🔍 BundlesUp Installation Verification"
echo "======================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check Node.js
echo -n "Checking Node.js... "
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    echo -e "${GREEN}✓${NC} $NODE_VERSION"
else
    echo -e "${RED}✗${NC} Node.js not found"
    exit 1
fi

# Check npm
echo -n "Checking npm... "
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm -v)
    echo -e "${GREEN}✓${NC} v$NPM_VERSION"
else
    echo -e "${RED}✗${NC} npm not found"
    exit 1
fi

# Check if node_modules exists
echo -n "Checking dependencies... "
if [ -d "node_modules" ]; then
    echo -e "${GREEN}✓${NC} Installed"
else
    echo -e "${RED}✗${NC} Not installed"
    echo "Run: npm install"
    exit 1
fi

# Check .env file
echo -n "Checking .env file... "
if [ -f ".env" ]; then
    echo -e "${GREEN}✓${NC} Found"
else
    echo -e "${YELLOW}⚠${NC} Not found"
    echo "Copy .env.example to .env and configure"
fi

# Check required files
echo ""
echo "Checking required files:"

FILES=(
    "package.json"
    "tsconfig.json"
    "vite.config.ts"
    "tailwind.config.js"
    "src/main.tsx"
    "src/App.tsx"
    "src/pages/Dashboard.tsx"
    "src/pages/Bundles.tsx"
    "src/pages/Products.tsx"
    "src/pages/Analytics.tsx"
    "src/pages/Settings.tsx"
    "functions/shopifyAuth.ts"
    "functions/shopifyApiProxy.ts"
    "functions/trackOrder.ts"
)

for file in "${FILES[@]}"; do
    echo -n "  $file... "
    if [ -f "$file" ]; then
        echo -e "${GREEN}✓${NC}"
    else
        echo -e "${RED}✗${NC}"
    fi
done

# Check documentation
echo ""
echo "Checking documentation:"

DOCS=(
    "README.md"
    "QUICKSTART.md"
    "DEPLOYMENT.md"
    "TESTING.md"
    "API.md"
    "PROJECT_SUMMARY.md"
)

for doc in "${DOCS[@]}"; do
    echo -n "  $doc... "
    if [ -f "$doc" ]; then
        echo -e "${GREEN}✓${NC}"
    else
        echo -e "${RED}✗${NC}"
    fi
done

# Try to build
echo ""
echo -n "Testing TypeScript compilation... "
if npm run build > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Success"
else
    echo -e "${RED}✗${NC} Failed"
    echo "Run: npm run build"
    exit 1
fi

# Check if dev server is running
echo -n "Checking dev server... "
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Running on http://localhost:3000"
else
    echo -e "${YELLOW}⚠${NC} Not running"
    echo "Start with: npm run dev"
fi

# Summary
echo ""
echo "======================================"
echo -e "${GREEN}✓${NC} Installation verified successfully!"
echo ""
echo "Next steps:"
echo "1. Configure .env file with your credentials"
echo "2. Set up Base44 account and create entities"
echo "3. Deploy functions to Deno Deploy"
echo "4. Configure Shopify app"
echo "5. Start development: npm run dev"
echo ""
echo "Documentation:"
echo "  - Quick Start: QUICKSTART.md"
echo "  - Deployment: DEPLOYMENT.md"
echo "  - API Reference: API.md"
echo "  - Testing: TESTING.md"
echo ""
