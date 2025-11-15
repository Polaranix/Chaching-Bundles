# Complete Testing Guide for BundlesUp Shopify Apps

## Overview
This guide covers testing for BOTH Shopify app implementations in this repository:
1. **bundle-and-save-app** (Remix-based, production-ready)
2. **bundlesup** (Base44/React-based)

---

## Table of Contents
1. [Quick Start Testing](#quick-start-testing)
2. [Testing the Remix App (bundle-and-save-app)](#testing-remix-app)
3. [Testing the Base44 App (bundlesup)](#testing-base44-app)
4. [Manual Testing Procedures](#manual-testing-procedures)
5. [Automated Testing](#automated-testing)
6. [Integration Testing](#integration-testing)
7. [Load Testing](#load-testing)
8. [Common Issues & Solutions](#common-issues)

---

## Quick Start Testing

### Prerequisites
```bash
# Install Node.js (v20+)
node --version  # Should be v20 or higher

# Install dependencies for both apps
cd /vercel/sandbox/bundle-and-save-app
npm install

cd /vercel/sandbox/bundlesup
npm install
```

### Run All Tests (Remix App)
```bash
cd /vercel/sandbox/bundle-and-save-app

# Run unit tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test -- --ui

# Run specific test file
npm test tests/bundle.test.ts
```

---

## Testing Remix App (bundle-and-save-app)

### 1. Setup Test Environment

```bash
cd /vercel/sandbox/bundle-and-save-app

# Create test database
npm run db:push

# Verify Prisma is working
npm run db:studio
```

### 2. Unit Tests

The app includes the following test files:

#### A. Bundle Tests (`tests/bundle.test.ts`)
Tests bundle CRUD operations, validation, and business logic.

```bash
npm test tests/bundle.test.ts
```

**What it tests:**
- Bundle creation with all required fields
- Bundle validation (name, type, products)
- Bundle status changes (active, draft, paused)
- Bundle metrics calculation
- Bundle deletion and cascading

#### B. Discount Function Tests (`tests/discount-function.test.ts`)
Tests discount calculation logic for different bundle types.

```bash
npm test tests/discount-function.test.ts
```

**What it tests:**
- Fixed price bundles
- Percentage discount bundles
- Amount discount bundles
- Mix & Match bundles
- Frequently Bought Together bundles

### 3. Integration Tests

#### Test Shopify OAuth Flow

```bash
# 1. Start the dev server
npm run dev

# 2. Open in browser (this will trigger OAuth)
# https://your-dev-store.myshopify.com/admin/apps

# 3. Verify:
# - Redirects to Shopify OAuth
# - Returns with access token
# - Creates shop record in database
# - Redirects to app dashboard
```

#### Test API Endpoints

Create a test file `tests/api.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { prisma } from '../app/lib/prisma.server'

describe('API Endpoints', () => {
  it('should fetch active bundles', async () => {
    // Create test bundle
    const bundle = await prisma.bundle.create({
      data: {
        name: 'Test Bundle',
        bundleType: 'FIXED',
        status: 'ACTIVE',
        shopId: 'test-shop'
      }
    })

    // Test API call
    const response = await fetch('http://localhost:3000/api/bundles/active')
    const data = await response.json()

    expect(data).toHaveLength(1)
    expect(data[0].name).toBe('Test Bundle')
  })
})
```

### 4. Component Tests

Test React components with Vitest:

```bash
# Install testing library
npm install -D @testing-library/react @testing-library/jest-dom
```

Create `tests/components/BundleForm.test.tsx`:

```typescript
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { BundleForm } from '../../app/components/BundleForm'

describe('BundleForm', () => {
  it('renders all form fields', () => {
    render(<BundleForm />)

    expect(screen.getByLabelText(/bundle name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/bundle type/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/pricing strategy/i)).toBeInTheDocument()
  })

  it('validates required fields', async () => {
    render(<BundleForm />)

    const submitButton = screen.getByRole('button', { name: /create bundle/i })
    submitButton.click()

    expect(await screen.findByText(/bundle name is required/i)).toBeInTheDocument()
  })
})
```

### 5. Database Tests

Test Prisma models and queries:

```bash
# Generate test database
npx prisma generate

# Run migration for test DB
DATABASE_URL="file:./test.db" npx prisma migrate deploy
```

Create `tests/database.test.ts`:

```typescript
import { describe, it, expect, beforeEach } from 'vitest'
import { prisma } from '../app/lib/prisma.server'

describe('Database Operations', () => {
  beforeEach(async () => {
    await prisma.bundle.deleteMany()
    await prisma.shop.deleteMany()
  })

  it('should create a shop', async () => {
    const shop = await prisma.shop.create({
      data: {
        shop: 'test-shop.myshopify.com',
        accessToken: 'test-token',
        scope: 'read_products,write_products'
      }
    })

    expect(shop.shop).toBe('test-shop.myshopify.com')
  })

  it('should create a bundle with items', async () => {
    const shop = await prisma.shop.create({
      data: {
        shop: 'test-shop.myshopify.com',
        accessToken: 'test-token'
      }
    })

    const bundle = await prisma.bundle.create({
      data: {
        name: 'Summer Bundle',
        bundleType: 'FIXED',
        status: 'ACTIVE',
        shopId: shop.id,
        items: {
          create: [
            {
              productId: 'gid://shopify/Product/123',
              quantity: 1,
              price: 29.99
            }
          ]
        }
      },
      include: { items: true }
    })

    expect(bundle.items).toHaveLength(1)
  })
})
```

---

## Testing Base44 App (bundlesup)

### 1. Setup Local Development

```bash
cd /vercel/sandbox/bundlesup

# Create .env file
cp .env.example .env

# Edit .env with your values
nano .env
```

Required environment variables:
```env
VITE_SHOPIFY_API_KEY=your_api_key
VITE_APP_URL=http://localhost:3000
VITE_BASE44_APP_ID=68d87fcee669d830cce9b999
VITE_BASE44_API_URL=https://api.base44.com
VITE_FUNCTIONS_URL=https://your-deno-deploy.deno.dev
```

### 2. Start Development Server

```bash
npm run dev

# App will be available at http://localhost:3000
```

### 3. Test Deno Functions

#### Deploy Functions to Deno Deploy

```bash
# Install deployctl
npm install -g deployctl

# Deploy shopifyAuth function
cd /vercel/sandbox/bundlesup/functions
deployctl deploy --project=bundlesup-auth shopifyAuth.ts

# Deploy shopifyApiProxy function
deployctl deploy --project=bundlesup-proxy shopifyApiProxy.ts

# Deploy trackOrder function
deployctl deploy --project=bundlesup-webhooks trackOrder.ts
```

#### Test Functions Locally with Deno

```bash
# Install Deno
curl -fsSL https://deno.land/install.sh | sh

# Test shopifyAuth function
cd /vercel/sandbox/bundlesup/functions
deno run --allow-net --allow-env shopifyAuth.ts

# Test shopifyApiProxy function
deno run --allow-net --allow-env shopifyApiProxy.ts
```

### 4. Manual Testing Checklist

#### Authentication Flow
- [ ] Navigate to app URL
- [ ] Redirected to Shopify OAuth
- [ ] Authorize app with required scopes
- [ ] Redirected back to app
- [ ] Token stored in Base44
- [ ] User logged in successfully
- [ ] No OAuth loops

#### Onboarding Flow
- [ ] Welcome screen displays
- [ ] Plan details show correctly ($2.99/month, 14-day trial)
- [ ] "Start Free Trial" button works
- [ ] Redirects to Shopify billing
- [ ] Approve charge
- [ ] Redirected back to dashboard
- [ ] Onboarding marked complete

#### Dashboard
- [ ] Stats load correctly
- [ ] Shows active bundles count
- [ ] Shows total revenue
- [ ] Shows total sales
- [ ] Shows conversion rate
- [ ] Recent bundles list displays
- [ ] Quick actions work

#### Bundle Management
- [ ] Create new bundle modal opens
- [ ] Step 1: Bundle details form works
- [ ] Step 2: Product selection works
- [ ] Bundle types dropdown works (Fixed, Mix & Match, Upsell, Frequently Together)
- [ ] Pricing strategies work (Percentage, Amount, Fixed Price)
- [ ] Bundle saves successfully
- [ ] Bundle appears in list
- [ ] Edit bundle works
- [ ] Duplicate bundle works
- [ ] Pause/activate bundle works
- [ ] Delete bundle works
- [ ] Search bundles works
- [ ] Filter bundles works (All, Active, Draft, Paused)

#### Product Management
- [ ] Products list displays
- [ ] Sync products from Shopify works
- [ ] Products show correct data (name, price, image, inventory)
- [ ] Search products works

#### Analytics
- [ ] Stats cards display correctly
- [ ] Revenue by bundle chart renders
- [ ] Revenue by type pie chart renders
- [ ] Top performing bundles table shows data
- [ ] Date filters work
- [ ] Data updates in real-time

#### Settings
- [ ] Store settings load
- [ ] Display settings save
- [ ] Notification preferences save
- [ ] Theme settings apply

### 5. Browser Testing

Test in multiple browsers:

```bash
# Chrome
google-chrome http://localhost:3000

# Firefox
firefox http://localhost:3000

# Safari
open -a Safari http://localhost:3000

# Edge
microsoft-edge http://localhost:3000
```

#### Responsive Testing
Test in different screen sizes:
- Mobile: 320px, 375px, 414px
- Tablet: 768px, 834px, 1024px
- Desktop: 1280px, 1440px, 1920px

---

## Manual Testing Procedures

### Test Case 1: Create Fixed Bundle

**Steps:**
1. Go to Bundles page
2. Click "Create Bundle"
3. Fill in bundle details:
   - Name: "Summer Essentials"
   - Type: "Fixed Bundle"
   - Pricing: "Fixed Price" at $49.99
4. Click "Next"
5. Select 3 products
6. Click "Create Bundle"

**Expected Result:**
- Bundle created successfully
- Shows in bundles list
- Status is "Active"
- Products are associated correctly

### Test Case 2: Create Mix & Match Bundle

**Steps:**
1. Create new bundle
2. Type: "Mix & Match"
3. Set min items: 2, max items: 4
4. Pricing: "Percentage Discount" at 20%
5. Add 6 products
6. Save

**Expected Result:**
- Bundle allows customer to pick 2-4 items
- Discount applied correctly
- Total price calculated correctly

### Test Case 3: Sync Products from Shopify

**Steps:**
1. Go to Products page
2. Click "Sync Products"
3. Wait for sync to complete

**Expected Result:**
- All products fetched from Shopify
- Product data includes: name, price, image, inventory
- Products available for bundle selection

### Test Case 4: Test Analytics

**Steps:**
1. Create 3 bundles
2. Generate some test orders (use seed script)
3. Go to Analytics page
4. Check all charts and tables

**Expected Result:**
- Stats cards show correct numbers
- Charts render with data
- Top bundles table sorted by revenue

### Test Case 5: Test Order Webhook

**Steps:**
1. Set up webhook in Shopify admin
2. Point to trackOrder function URL
3. Create a test order with a bundle
4. Verify webhook received

**Expected Result:**
- Webhook processes successfully
- BundleOrder record created
- BundleAnalytic updated
- Bundle stats updated (total_sales, total_revenue)

---

## Automated Testing

### Run Complete Test Suite

```bash
cd /vercel/sandbox/bundle-and-save-app

# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific test suite
npm test -- bundle
```

### Add More Tests

Create `tests/complete.test.ts`:

```typescript
import { describe, it, expect, beforeAll } from 'vitest'
import { prisma } from '../app/lib/prisma.server'

describe('Complete Bundle Flow', () => {
  beforeAll(async () => {
    // Setup test data
    await prisma.shop.create({
      data: {
        shop: 'test.myshopify.com',
        accessToken: 'test-token'
      }
    })
  })

  it('should create, edit, and delete a bundle', async () => {
    // Create bundle
    const bundle = await prisma.bundle.create({
      data: {
        name: 'Test Bundle',
        bundleType: 'FIXED',
        status: 'ACTIVE',
        shopId: 'test-shop'
      }
    })
    expect(bundle.id).toBeDefined()

    // Edit bundle
    const updated = await prisma.bundle.update({
      where: { id: bundle.id },
      data: { name: 'Updated Bundle' }
    })
    expect(updated.name).toBe('Updated Bundle')

    // Delete bundle
    await prisma.bundle.delete({
      where: { id: bundle.id }
    })
    const deleted = await prisma.bundle.findUnique({
      where: { id: bundle.id }
    })
    expect(deleted).toBeNull()
  })
})
```

---

## Integration Testing

### Test Shopify API Integration

Create `tests/shopify-integration.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { shopifyApi } from '../app/lib/shopify.server'

describe('Shopify API Integration', () => {
  it('should fetch products', async () => {
    const products = await shopifyApi.fetchProducts('test-shop')
    expect(products).toBeDefined()
    expect(Array.isArray(products)).toBe(true)
  })

  it('should create discount code', async () => {
    const discount = await shopifyApi.createDiscount({
      code: 'BUNDLE20',
      value: 20,
      type: 'percentage'
    })
    expect(discount.code).toBe('BUNDLE20')
  })
})
```

### Test Webhook Processing

Create `tests/webhooks.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { processOrder } from '../app/lib/webhooks.server'

describe('Webhook Processing', () => {
  it('should process order webhook', async () => {
    const orderData = {
      id: 123456,
      line_items: [
        {
          product_id: 789,
          quantity: 1,
          price: 29.99
        }
      ],
      total_price: 29.99
    }

    const result = await processOrder(orderData)
    expect(result.success).toBe(true)
  })
})
```

---

## Load Testing

### Setup Artillery

```bash
npm install -g artillery

# Create load test config
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
      - think: 3
      - get:
          url: "/api/bundles/active"
EOF

# Run load test
artillery run load-test.yml
```

### Performance Benchmarks

Expected performance:
- Initial page load: < 3 seconds
- Bundle list load: < 2 seconds
- Bundle creation: < 1 second
- Product sync: < 5 seconds
- Analytics load: < 2 seconds

---

## Common Issues & Solutions

### Issue 1: OAuth Loop
**Symptom:** App keeps redirecting to Shopify OAuth
**Solution:**
- Check `ShopifyLoader.tsx` has loop prevention
- Verify token is stored correctly
- Check cookie settings
- Clear browser cookies

### Issue 2: 401 Unauthorized
**Symptom:** API calls return 401 error
**Solution:**
- Verify access token in database
- Check scopes match required scopes
- Re-authenticate with Shopify
- Check token expiration

### Issue 3: Database Connection Failed
**Symptom:** Cannot connect to database
**Solution:**
```bash
# Check DATABASE_URL
echo $DATABASE_URL

# Regenerate Prisma client
npm run prisma generate

# Push schema
npm run db:push
```

### Issue 4: Webhook Not Received
**Symptom:** Orders not tracked
**Solution:**
- Verify webhook URL is correct
- Check HMAC validation
- Check webhook topic is correct
- Test webhook with Shopify CLI

```bash
shopify webhook trigger orders/create
```

### Issue 5: Products Not Syncing
**Symptom:** No products in products list
**Solution:**
- Check Shopify API credentials
- Verify read_products scope granted
- Check API rate limits
- Review Shopify API logs

---

## Test Data Setup

### Seed Database

Create or use existing `scripts/seed.ts`:

```bash
# Run seed script
npm run seed
```

The seed script should create:
- 1 test shop
- 5-10 test bundles
- 20-30 test products
- 10-20 test orders
- Analytics data

---

## Continuous Integration

### Setup GitHub Actions

Create `.github/workflows/test.yml`:

```yaml
name: Test Suite

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci
        working-directory: ./bundle-and-save-app

      - name: Run tests
        run: npm test
        working-directory: ./bundle-and-save-app

      - name: Build
        run: npm run build
        working-directory: ./bundle-and-save-app
```

---

## Testing Checklist

### Pre-Deployment Testing

- [ ] All unit tests pass
- [ ] All integration tests pass
- [ ] Manual testing completed
- [ ] OAuth flow works
- [ ] Billing flow works
- [ ] All CRUD operations work
- [ ] Webhooks process correctly
- [ ] Analytics calculate correctly
- [ ] Responsive design tested
- [ ] Browser compatibility tested
- [ ] Performance benchmarks met
- [ ] Security audit passed
- [ ] Error handling verified

### Post-Deployment Testing

- [ ] Production URL accessible
- [ ] Shopify app installation works
- [ ] OAuth redirects correctly
- [ ] Database migrations applied
- [ ] Environment variables set
- [ ] Webhooks configured
- [ ] SSL certificate valid
- [ ] Error logging active
- [ ] Analytics tracking works
- [ ] Billing charges work

---

## Testing Tools Summary

### Installed Tools
- **Vitest** - Unit testing framework
- **Prisma** - Database testing
- **React Testing Library** - Component testing
- **Artillery** - Load testing

### Required Tools
- **Shopify CLI** - For webhook testing
- **Postman/Insomnia** - For API testing
- **Browser DevTools** - For debugging

### Recommended Tools
- **Playwright** - E2E testing
- **Lighthouse** - Performance testing
- **Sentry** - Error tracking
- **LogRocket** - Session replay

---

## Next Steps

1. **Run existing tests:**
   ```bash
   cd /vercel/sandbox/bundle-and-save-app
   npm test
   ```

2. **Add more tests** based on this guide

3. **Set up CI/CD** with GitHub Actions

4. **Create test Shopify store** for integration testing

5. **Deploy to staging** environment

6. **Run full test suite** before production

---

## Support & Documentation

- **Remix Docs**: https://remix.run/docs
- **Shopify App Docs**: https://shopify.dev/docs/apps
- **Vitest Docs**: https://vitest.dev
- **Prisma Docs**: https://www.prisma.io/docs

---

**Last Updated:** November 15, 2024
**Status:** Complete & Ready for Testing
