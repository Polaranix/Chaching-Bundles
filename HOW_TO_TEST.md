# How to Test Your BundlesUp Shopify Apps

## Quick Overview

You have **TWO** Shopify app implementations in this repository:

1. **bundlesup** - React + Vite + Base44 (original specification)
2. **bundle-and-save-app** - Remix + Prisma (more complete, production-ready)

Both apps provide bundle and upsell functionality for Shopify stores.

---

## Option 1: Test the Base44 App (bundlesup) - Simplest to Start

This is the app from your original specification. It's ready to test locally.

### Step 1: Navigate to the app

```bash
cd /vercel/sandbox/bundlesup
```

### Step 2: Install dependencies

```bash
npm install
```

### Step 3: Set up environment

```bash
# Copy example env file
cp .env.example .env

# Edit with your values
nano .env
```

Required environment variables:
```env
VITE_SHOPIFY_API_KEY=f46bfa51cac1655c64182e297c27edaa
VITE_APP_URL=http://localhost:3000
VITE_BASE44_APP_ID=68d87fcee669d830cce9b999
VITE_BASE44_API_URL=https://api.base44.com
VITE_FUNCTIONS_URL=https://your-deno-functions.deno.dev
```

### Step 4: Build and test

```bash
# Build the app (compiles TypeScript)
npm run build

# Start development server
npm run dev
```

### Step 5: Open in browser

Open http://localhost:3000

### What You Can Test:

✅ **Frontend UI (without backend):**
- Dashboard layout
- Bundle list page
- Create bundle modal (UI only)
- Products page
- Analytics charts
- Settings page
- Responsive design
- Navigation

❌ **Cannot test without Base44 setup:**
- Authentication (needs Base44 account)
- Actual data operations (needs Base44 database)
- Shopify OAuth (needs deployed functions)

---

## Option 2: Test the Remix App (bundle-and-save-app) - Full Testing

This is a more complete implementation with a proper database and testing suite.

### Prerequisites

You'll need:
- Node.js 20+
- PostgreSQL database (or SQLite for local testing)
- Shopify Partner account (for full testing)

### Step 1: Navigate to the app

```bash
cd /vercel/sandbox/bundle-and-save-app
```

### Step 2: Check the project structure

```bash
ls -la
```

You should see:
- `functions/` - Remix app code
- `prisma/` - Database schema
- `tests/` - Test files
- `scripts/` - Utility scripts

### Step 3: Install dependencies

First, fix the package.json versions:

```bash
# Edit package.json and update these versions:
nano package.json
```

Change these dependencies to compatible versions:
```json
{
  "dependencies": {
    "@shopify/app-bridge": "^3.7.0",
    "@shopify/app-bridge-react": "^3.7.0",
    "@shopify/polaris": "^11.0.0"
  }
}
```

Then install:
```bash
npm install
```

### Step 4: Set up database

For local testing with SQLite:

```bash
# Create .env file
cat > .env << EOF
DATABASE_URL="file:./dev.db"
SHOPIFY_API_KEY="your_api_key"
SHOPIFY_API_SECRET="your_api_secret"
SCOPES="read_products,write_products,read_discounts,write_discounts"
APP_URL="http://localhost:3000"
EOF

# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push
```

### Step 5: Run automated tests

```bash
# Run all tests
npm test

# Run tests in watch mode (re-runs on changes)
npm run test:watch

# Run tests with UI (opens browser interface)
npm test -- --ui

# Run specific test file
npm test tests/bundle.test.ts

# Run with coverage
npm test -- --coverage
```

### Step 6: Run the development server

```bash
npm run dev
```

This requires the Shopify CLI and will start the app in Shopify's development environment.

---

## What Tests Are Available?

### Automated Tests (Remix App)

1. **Bundle Tests** (`tests/bundle.test.ts`)
   - Create, read, update, delete bundles
   - Bundle validation
   - Status changes
   - Metrics calculation

2. **Discount Function Tests** (`tests/discount-function.test.ts`)
   - Fixed price calculations
   - Percentage discounts
   - Amount discounts
   - Mix & Match bundles

3. **API Tests** (`tests/api.test.ts` - newly created)
   - Fetch bundles
   - Create bundles
   - Update bundle status
   - Delete with cascade

4. **Webhook Tests** (`tests/webhooks.test.ts` - newly created)
   - Order processing
   - HMAC verification
   - Metrics updates
   - Refund handling

### Manual Tests

Use the comprehensive checklist:
```bash
cat /vercel/sandbox/MANUAL_TESTING_CHECKLIST.md
```

This covers:
- Authentication flow
- All CRUD operations
- UI/UX testing
- Responsive design
- Error handling
- Performance
- Security

---

## Quick Test Scripts

### Test Everything (Both Apps)

```bash
# Run comprehensive test suite
cd /vercel/sandbox
./run-all-tests.sh

# Test only Remix app
./run-all-tests.sh --remix-only

# Test only Base44 app
./run-all-tests.sh --base44-only

# Show manual testing guide
./run-all-tests.sh --manual

# Run with coverage
./run-all-tests.sh --coverage
```

### Quick Test (Remix App Only)

```bash
cd /vercel/sandbox/bundle-and-save-app
./test-quick.sh
```

This runs:
1. Node version check
2. Dependency installation
3. Prisma generation
4. Type checking
5. Unit tests

---

## Testing Without Shopify (Local Development)

You can test most features locally without connecting to Shopify:

### 1. Test the Database Layer

```bash
cd /vercel/sandbox/bundle-and-save-app

# Start Prisma Studio (database GUI)
npx prisma studio
```

This opens http://localhost:5555 where you can:
- View all tables
- Add test data manually
- See relationships
- Test queries

### 2. Test with Mock Data

```bash
# Run seed script to populate test data
npm run seed
```

This creates:
- Sample shops
- Test bundles
- Mock products
- Example orders
- Analytics data

### 3. Test Components in Isolation

Create a test file:

```typescript
// tests/components.test.tsx
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'

// Test your components here
```

---

## Testing with a Real Shopify Store

To test the full integration:

### 1. Create a Development Store

1. Go to https://partners.shopify.com
2. Create a development store
3. Note the store URL (e.g., `your-store.myshopify.com`)

### 2. Create a Shopify App

1. In Partner Dashboard, create a new app
2. Set App URL: `http://localhost:3000`
3. Set Redirect URLs:
   - `http://localhost:3000/auth/callback`
   - `http://localhost:3000/auth/shopify/callback`
4. Set scopes:
   - `read_products`
   - `write_products`
   - `read_discounts`
   - `write_discounts`
5. Get your API key and secret

### 3. Update Environment Variables

```bash
SHOPIFY_API_KEY="your_api_key"
SHOPIFY_API_SECRET="your_api_secret"
SHOPIFY_APP_URL="http://localhost:3000"
```

### 4. Install App in Development Store

```bash
# Start the app with Shopify CLI
cd /vercel/sandbox/bundle-and-save-app
npm run dev
```

This will:
- Start the development server
- Open a tunnel to your local server
- Install the app in your dev store
- Open the app in your browser

### 5. Test Full Flow

Now you can test:
- ✅ OAuth installation
- ✅ Creating real bundles
- ✅ Syncing products from Shopify
- ✅ Creating test orders
- ✅ Webhook processing
- ✅ Analytics with real data

---

## Common Testing Scenarios

### Scenario 1: Test Bundle Creation

```bash
# 1. Start the app
cd /vercel/sandbox/bundle-and-save-app
npm run dev

# 2. Open browser to http://localhost:3000
# 3. Click "Create Bundle"
# 4. Fill in:
#    - Name: "Summer Bundle"
#    - Type: "Fixed Bundle"
#    - Discount: 20%
# 5. Select 3 products
# 6. Click "Create"
# 7. Verify bundle appears in list
```

### Scenario 2: Test Product Sync

```bash
# 1. Have some products in Shopify store
# 2. Open app and go to Products page
# 3. Click "Sync Products"
# 4. Wait for sync to complete
# 5. Verify products appear with correct:
#    - Names
#    - Prices
#    - Images
#    - Inventory counts
```

### Scenario 3: Test Analytics

```bash
# 1. Create some test bundles
# 2. Run seed script to create mock orders:
npm run seed

# 3. Go to Analytics page
# 4. Verify charts display:
#    - Revenue by bundle (bar chart)
#    - Revenue by type (pie chart)
#    - Top bundles table
# 5. Test date filters
```

### Scenario 4: Test Error Handling

```bash
# Test validation errors:
# 1. Try to create bundle without name
# 2. Try to create bundle without products
# 3. Try to use invalid discount value

# Test network errors:
# 1. Disconnect internet
# 2. Try to sync products
# 3. Verify error message shows

# Test auth errors:
# 1. Clear auth token
# 2. Try to access app
# 3. Should redirect to login
```

---

## Performance Testing

### Load Test with Artillery

```bash
# Install Artillery
npm install -g artillery

# Create test config
cat > load-test.yml << EOF
config:
  target: "http://localhost:3000"
  phases:
    - duration: 60
      arrivalRate: 10
scenarios:
  - name: "Browse bundles"
    flow:
      - get:
          url: "/app/bundles"
EOF

# Run load test
artillery run load-test.yml
```

### Expected Performance

- Dashboard load: < 3 seconds
- Bundle list: < 2 seconds
- Bundle creation: < 1 second
- Product sync: < 5 seconds
- Analytics: < 2 seconds

---

## Debugging Tips

### View Logs

```bash
# Check server logs
# Logs will show in terminal where you ran `npm run dev`

# Check database queries
# Set in .env:
DATABASE_URL="file:./dev.db?connection_limit=1&socket_timeout=10"
DEBUG="prisma:query"
```

### Use Browser DevTools

1. Open Chrome DevTools (F12)
2. Check Console for errors
3. Check Network tab for API calls
4. Check Application tab for cookies/storage

### Test Database Directly

```bash
# Open Prisma Studio
npx prisma studio

# Or use SQLite CLI
sqlite3 dev.db
> SELECT * FROM Bundle;
> SELECT * FROM Shop;
```

---

## Documentation References

- **Complete Testing Guide**: `/vercel/sandbox/COMPLETE_TESTING_GUIDE.md`
- **Manual Testing Checklist**: `/vercel/sandbox/MANUAL_TESTING_CHECKLIST.md`
- **Project Summary**: `/vercel/sandbox/BUNDLESUP_COMPLETE.md`
- **API Documentation**: `/vercel/sandbox/bundlesup/API.md`
- **Deployment Guide**: `/vercel/sandbox/bundlesup/DEPLOYMENT.md`

---

## Quick Commands Reference

```bash
# Remix App Tests
cd /vercel/sandbox/bundle-and-save-app
npm install                    # Install dependencies
npx prisma generate           # Generate Prisma client
npx prisma db push            # Create database
npm run seed                  # Add test data
npm test                      # Run tests
npm run dev                   # Start dev server

# Base44 App Tests
cd /vercel/sandbox/bundlesup
npm install                   # Install dependencies
npm run build                 # Build app
npm run dev                   # Start dev server

# Run All Tests
cd /vercel/sandbox
./run-all-tests.sh           # Test everything

# View Test Coverage
cd /vercel/sandbox/bundle-and-save-app
npm test -- --coverage       # Generate coverage report
```

---

## What's Already Been Tested

According to the project documentation:

✅ **TypeScript Compilation**: Passed
✅ **Production Build**: Passed (744 KB, gzipped: 211 KB)
✅ **Development Server**: Runs on http://localhost:3000
✅ **All Files Verified**: 100% complete

---

## Next Steps

1. **Start Simple**: Test the Base44 app UI locally
   ```bash
   cd /vercel/sandbox/bundlesup
   npm install && npm run dev
   ```

2. **Run Automated Tests**: Test the Remix app
   ```bash
   cd /vercel/sandbox/bundle-and-save-app
   npm test
   ```

3. **Manual Testing**: Use the checklist
   ```bash
   cat /vercel/sandbox/MANUAL_TESTING_CHECKLIST.md
   ```

4. **Full Integration**: Set up with real Shopify store

---

## Need Help?

- Review the test files in `/vercel/sandbox/bundle-and-save-app/tests/`
- Check the comprehensive guide: `/vercel/sandbox/COMPLETE_TESTING_GUIDE.md`
- Read the manual checklist: `/vercel/sandbox/MANUAL_TESTING_CHECKLIST.md`

---

**Happy Testing! 🚀**

Last updated: November 15, 2024
