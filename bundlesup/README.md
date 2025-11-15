# BundlesUp - Shopify Bundle & Upsell App

A complete Shopify app for creating product bundles and upsells to increase average order value (AOV).

## Features

- **Multiple Bundle Types**: Fixed bundles, Mix & Match, Upsells, Frequently Bought Together
- **Flexible Pricing**: Percentage discount, amount discount, or fixed price
- **Real-time Analytics**: Track views, clicks, conversions, and revenue
- **Product Sync**: Automatic synchronization with Shopify products
- **Customizable Display**: Grid or list layouts with customizable settings
- **Mobile Responsive**: Works seamlessly on all devices

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **Lucide React** for icons
- **Recharts** for analytics charts
- **React Router** for navigation

### Backend
- **Base44** Backend-as-a-Service for data storage
- **Deno Deploy** for serverless functions
- **Shopify Admin API** (GraphQL + REST)

## Project Structure

```
bundlesup/
├── src/
│   ├── components/          # React components
│   │   ├── Layout.tsx
│   │   ├── BundleCard.tsx
│   │   ├── CreateBundleModal.tsx
│   │   └── EditBundleModal.tsx
│   ├── contexts/            # React contexts
│   │   └── AuthContext.tsx
│   ├── lib/                 # Utilities
│   │   ├── api.ts          # API client
│   │   └── utils.ts        # Helper functions
│   ├── pages/              # Page components
│   │   ├── ShopifyLoader.tsx
│   │   ├── Onboarding.tsx
│   │   ├── Dashboard.tsx
│   │   ├── Bundles.tsx
│   │   ├── Products.tsx
│   │   ├── Analytics.tsx
│   │   └── Settings.tsx
│   ├── types/              # TypeScript types
│   │   └── index.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── functions/              # Deno Deploy functions
│   ├── shopifyAuth.ts     # OAuth handler
│   ├── shopifyApiProxy.ts # API proxy
│   └── trackOrder.ts      # Webhook handler
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
└── README.md
```

## Setup Instructions

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- Shopify Partner account
- Base44 account
- Deno Deploy account (for functions)

### 1. Clone and Install

```bash
git clone <repository-url>
cd bundlesup
npm install
```

### 2. Environment Configuration

Create a `.env` file based on `.env.example`:

```env
VITE_SHOPIFY_API_KEY=f46bfa51cac1655c64182e297c27edaa
VITE_APP_URL=http://localhost:3000
VITE_BASE44_APP_ID=68d87fcee669d830cce9b999
VITE_BASE44_API_URL=https://api.base44.com
VITE_FUNCTIONS_URL=https://your-deno-deploy-url.deno.dev
```

### 3. Base44 Setup

1. Create a Base44 account at https://base44.com
2. Create a new app with ID: `68d87fcee669d830cce9b999`
3. Create the following entities:

#### Shop Entity
```json
{
  "name": "Shop",
  "fields": {
    "shop_name": "string (unique)",
    "access_token": "string",
    "scopes": "string",
    "installed_at": "datetime"
  }
}
```

#### User Entity
```json
{
  "name": "User",
  "fields": {
    "email": "string",
    "full_name": "string",
    "role": "string",
    "has_completed_onboarding": "boolean",
    "shop_domain": "string"
  }
}
```

#### Bundle Entity
```json
{
  "name": "Bundle",
  "fields": {
    "name": "string",
    "description": "string",
    "bundle_type": "string",
    "status": "string",
    "pricing_strategy": "string",
    "discount_value": "number",
    "fixed_price": "number",
    "products": "json",
    "min_items": "number",
    "max_items": "number",
    "total_sales": "number",
    "total_revenue": "number",
    "conversion_rate": "number",
    "display_template": "string",
    "display_settings": "json"
  }
}
```

#### Product Entity
```json
{
  "name": "Product",
  "fields": {
    "name": "string",
    "price": "number",
    "image_url": "string",
    "shopify_product_id": "string",
    "inventory": "number"
  }
}
```

#### BundleOrder Entity
```json
{
  "name": "BundleOrder",
  "fields": {
    "bundle_id": "string",
    "shop_id": "string",
    "order_id": "string",
    "discount_amount": "number",
    "total_amount": "number",
    "items_count": "integer"
  }
}
```

#### BundleAnalytic Entity
```json
{
  "name": "BundleAnalytic",
  "fields": {
    "bundle_id": "string",
    "shop_id": "string",
    "views": "integer",
    "clicks": "integer",
    "conversions": "integer",
    "revenue": "number",
    "date": "date"
  }
}
```

### 4. Deploy Functions to Deno Deploy

1. Create a Deno Deploy account at https://deno.com/deploy
2. Deploy each function:

```bash
# Deploy shopifyAuth
deployctl deploy --project=bundlesup-auth functions/shopifyAuth.ts

# Deploy shopifyApiProxy
deployctl deploy --project=bundlesup-proxy functions/shopifyApiProxy.ts

# Deploy trackOrder
deployctl deploy --project=bundlesup-webhook functions/trackOrder.ts
```

3. Set environment variables in Deno Deploy:
   - `SHOPIFY_API_KEY`
   - `SHOPIFY_API_SECRET`
   - `BASE44_API_URL`
   - `BASE44_APP_ID`
   - `BASE44_SERVICE_KEY`
   - `APP_URL`

4. Update `VITE_FUNCTIONS_URL` in your `.env` file with the Deno Deploy URL

### 5. Shopify App Configuration

1. Go to Shopify Partner Dashboard
2. Create a new app
3. Configure the following:
   - **App URL**: `http://localhost:3000` (development) or your production URL
   - **Allowed redirection URL(s)**:
     - `https://your-deno-deploy-url.deno.dev/shopifyAuth?callback=1`
     - `http://localhost:3000`
   - **API Scopes**:
     - `read_products`
     - `write_products`
     - `read_product_listings`
     - `read_discounts`
     - `write_discounts`

4. Copy the API key and secret to your `.env` file

### 6. Run Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## Usage

### Installing the App

1. Go to your Shopify Partner Dashboard
2. Select your app
3. Click "Test on development store"
4. Select a store and install

### Creating Bundles

1. Navigate to the Bundles page
2. Click "Create Bundle"
3. Fill in bundle details:
   - Name and description
   - Bundle type (Fixed, Mix & Match, etc.)
   - Pricing strategy
   - Discount value
4. Add products to the bundle
5. Set quantities for each product
6. Save the bundle

### Syncing Products

1. Navigate to the Products page
2. Click "Sync from Shopify"
3. Products will be imported from your Shopify store

### Viewing Analytics

1. Navigate to the Analytics page
2. View stats cards for overview
3. Check charts for revenue breakdown
4. Review top performing bundles

## API Reference

### Authentication Flow

1. User installs app from Shopify
2. App redirects to Shopify OAuth
3. Shopify redirects to `shopifyAuth` function
4. Function exchanges code for access token
5. Creates Shop and User entities
6. Generates auth token
7. Redirects back to app with token

### API Endpoints

#### Entities API (Base44)

```typescript
// Query entities
entities.query<T>(entityName: string, filters?: any): Promise<ApiResponse<T[]>>

// Get single entity
entities.get<T>(entityName: string, id: string): Promise<ApiResponse<T>>

// Create entity
entities.create<T>(entityName: string, data: any): Promise<ApiResponse<T>>

// Update entity
entities.update<T>(entityName: string, id: string, data: any): Promise<ApiResponse<T>>

// Delete entity
entities.delete(entityName: string, id: string): Promise<ApiResponse<void>>
```

#### Shopify API Proxy

```typescript
// GraphQL query
shopify.graphql<T>(query: string, variables?: any): Promise<ApiResponse<T>>

// REST API call
shopify.rest<T>(endpoint: string, method: string, data?: any): Promise<ApiResponse<T>>
```

## Deployment

### Production Deployment

1. Build the app:
```bash
npm run build
```

2. Deploy to your hosting provider (Vercel, Netlify, etc.)

3. Update environment variables with production values

4. Update Shopify app URLs in Partner Dashboard

5. Configure webhooks:
   - Order creation: `https://your-deno-url.deno.dev/trackOrder`

## Troubleshooting

### OAuth Loop

If you're stuck in an OAuth loop:
1. Clear browser cookies
2. Check that `VITE_APP_URL` matches your actual URL
3. Verify redirect URLs in Shopify Partner Dashboard

### 401 Errors

If you're getting 401 errors:
1. Check that Base44 service key is set correctly
2. Verify shop access token is saved in database
3. Check API scopes in Shopify

### Products Not Syncing

If products aren't syncing:
1. Verify API scopes include `read_products`
2. Check Deno Deploy function logs
3. Ensure shop access token is valid

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
- GitHub Issues: [repository-url]/issues
- Email: support@bundlesup.com

---

Built with ❤️ for Shopify merchants
