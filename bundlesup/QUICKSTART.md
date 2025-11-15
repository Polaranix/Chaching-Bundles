# BundlesUp Quick Start Guide

Get your BundlesUp Shopify app up and running in 15 minutes!

## Prerequisites

- Node.js 18+ installed
- Shopify Partner account
- A Shopify development store

## Step 1: Clone and Install (2 minutes)

```bash
# Clone the repository
git clone <repository-url>
cd bundlesup

# Install dependencies
npm install
```

## Step 2: Environment Setup (3 minutes)

Create a `.env` file:

```bash
cp .env.example .env
```

Update `.env` with your values:

```env
VITE_SHOPIFY_API_KEY=your_shopify_api_key
VITE_APP_URL=http://localhost:3000
VITE_BASE44_APP_ID=68d87fcee669d830cce9b999
VITE_BASE44_API_URL=https://api.base44.com
VITE_FUNCTIONS_URL=https://your-deno-deploy-url.deno.dev
```

## Step 3: Shopify App Setup (5 minutes)

1. Go to [Shopify Partner Dashboard](https://partners.shopify.com)
2. Click **Apps** → **Create app** → **Create app manually**
3. Enter app name: "BundlesUp Dev"
4. Configure:
   - **App URL**: `http://localhost:3000`
   - **Allowed redirection URLs**: 
     - `http://localhost:3000`
     - `https://your-deno-deploy-url.deno.dev/shopifyAuth?callback=1`
   - **API Scopes**: 
     - `read_products`
     - `write_products`
     - `read_product_listings`
     - `read_discounts`
     - `write_discounts`
5. Copy your **API key** and **API secret**
6. Update `.env` with your API key

## Step 4: Base44 Setup (3 minutes)

1. Go to [Base44](https://base44.com) and create an account
2. Create a new app with ID: `68d87fcee669d830cce9b999`
3. Create these entities (use the schema from README.md):
   - Shop
   - User
   - Bundle
   - Product
   - BundleOrder
   - BundleAnalytic

## Step 5: Deploy Functions (Optional for local dev)

For local development, you can skip this and use mock data. For full functionality:

```bash
# Install Deno Deploy CLI
npm install -g deployctl

# Deploy functions
cd functions
deployctl deploy --project=bundlesup-auth shopifyAuth.ts
deployctl deploy --project=bundlesup-proxy shopifyApiProxy.ts
deployctl deploy --project=bundlesup-webhook trackOrder.ts
```

Update `.env` with your Deno Deploy URL.

## Step 6: Start Development Server (1 minute)

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## Step 7: Install on Development Store (1 minute)

1. Go to Shopify Partner Dashboard
2. Select your app
3. Click **Test on development store**
4. Select your development store
5. Click **Install**

## What's Next?

### Create Your First Bundle

1. **Sync Products**: Go to Products page and click "Sync from Shopify"
2. **Create Bundle**: Go to Bundles page and click "Create Bundle"
3. **Add Products**: Select products and set quantities
4. **Set Discount**: Choose pricing strategy and discount value
5. **Activate**: Set status to "Active" and save

### Test the App

1. **Dashboard**: View your bundle statistics
2. **Analytics**: Track performance metrics
3. **Settings**: Customize display preferences

## Common Issues

### OAuth Loop

**Problem**: App keeps redirecting

**Solution**: 
```bash
# Clear browser cookies and try again
# Verify VITE_APP_URL matches http://localhost:3000
```

### Products Not Syncing

**Problem**: Products don't import

**Solution**:
```bash
# Check API scopes include read_products
# Verify Shopify API key is correct
# Check Deno Deploy function is running
```

### Build Errors

**Problem**: TypeScript errors

**Solution**:
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

## Development Tips

### Hot Reload

The dev server supports hot reload. Changes to React components will update instantly.

### TypeScript

Run type checking:
```bash
npm run typecheck
```

### Linting

Run ESLint:
```bash
npm run lint
```

### Building

Build for production:
```bash
npm run build
```

## Project Structure

```
bundlesup/
├── src/
│   ├── components/     # React components
│   ├── contexts/       # React contexts
│   ├── lib/           # Utilities
│   ├── pages/         # Page components
│   └── types/         # TypeScript types
├── functions/         # Deno Deploy functions
├── public/           # Static assets
└── dist/             # Build output
```

## Key Files

- `src/App.tsx` - Main app component with routing
- `src/pages/Dashboard.tsx` - Dashboard page
- `src/pages/Bundles.tsx` - Bundle management
- `src/lib/api.ts` - API client
- `functions/shopifyAuth.ts` - OAuth handler

## Resources

- [Full Documentation](./README.md)
- [Deployment Guide](./DEPLOYMENT.md)
- [Testing Guide](./TESTING.md)
- [Shopify App Development](https://shopify.dev/docs/apps)
- [Base44 Documentation](https://base44.com/docs)

## Support

Need help? 
- Email: support@bundlesup.com
- GitHub Issues: [repository-url]/issues

## Next Steps

1. Read the [full README](./README.md) for detailed information
2. Review the [deployment guide](./DEPLOYMENT.md) for production setup
3. Check the [testing guide](./TESTING.md) for testing procedures
4. Customize the app for your needs

---

Happy bundling! 🎉
