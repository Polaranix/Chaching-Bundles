# BundlesUp - Shopify Product Bundling App

Complete Shopify app for creating and managing product bundles with automatic discounts. Built with React 18, TypeScript, Tailwind CSS, and Base44 Backend-as-a-Service.

## Features

- **Complete Authentication Flow**: Shopify OAuth integration with Base44
- **Bundle Management**: Create fixed, mix & match, upsell, and frequently bought together bundles
- **Flexible Discounts**: Percentage discounts, fixed amount off, or custom bundle prices
- **Product Sync**: Import products from Shopify store
- **Real-time Analytics**: Track bundle performance, revenue, and conversion rates
- **Subscription Billing**: $2.99/month with 14-day free trial
- **Responsive UI**: Beautiful interface with Tailwind CSS and shadcn/ui components

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, Framer Motion
- **UI Components**: shadcn/ui, Lucide Icons
- **Charts**: Recharts
- **Backend**: Base44 BaaS, Deno Deploy (serverless functions)
- **Database**: Base44 entities with PostgreSQL and RLS
- **Authentication**: Base44 Auth + Shopify OAuth
- **API Integration**: Shopify Admin API (GraphQL + REST)

## Project Structure

```
bundlesup-app/
├── src/
│   ├── components/         # React components
│   │   └── Layout.tsx      # Main layout with navigation
│   ├── pages/              # Page components
│   │   ├── ShopifyLoader.tsx   # Auth entry point
│   │   ├── Onboarding.tsx      # Subscription onboarding
│   │   ├── Dashboard.tsx       # Main dashboard
│   │   ├── Bundles.tsx         # Bundle management
│   │   ├── Products.tsx        # Product sync
│   │   ├── Analytics.tsx       # Analytics & reports
│   │   └── Settings.tsx        # App settings
│   ├── lib/                # Utilities
│   │   └── utils.ts        # Helper functions
│   ├── types/              # TypeScript types
│   │   └── index.ts        # Type definitions
│   ├── App.tsx             # Main app component
│   ├── main.tsx            # Entry point
│   └── index.css           # Global styles
├── functions/              # Deno serverless functions
│   ├── shopifyAuth.js      # OAuth handler
│   ├── shopifyApiProxy.js  # Shopify API proxy
│   └── trackOrder.js       # Webhook handler
├── entities/               # Base44 entity schemas
│   ├── bundle.json
│   ├── shop.json
│   ├── user.json
│   ├── product.json
│   ├── bundle-order.json
│   └── bundle-analytic.json
└── public/                 # Static assets
```

## Setup Instructions

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- Shopify Partner account
- Base44 account (for Backend-as-a-Service)

### Installation

1. **Clone the repository**:
   ```bash
   cd bundlesup-app
   ```

2. **Install dependencies**:
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Configure environment variables**:

   Copy `.env.example` to `.env` and update:
   ```env
   VITE_SHOPIFY_API_KEY=f46bfa51cac1655c64182e297c27edaa
   VITE_BASE44_APP_ID=68d87fcee669d830cce9b999
   VITE_APP_URL=http://localhost:5173
   SHOPIFY_API_SECRET=your_shopify_api_secret_here
   ```

4. **Set up Base44**:
   - Create a Base44 account at https://base44.com
   - Create a new app with ID: `68d87fcee669d830cce9b999`
   - Upload entity schemas from the `entities/` directory
   - Get your service key and add it to function environment variables

5. **Deploy serverless functions**:
   - Deploy functions to Deno Deploy or your preferred serverless platform
   - Update function URLs in the app if needed

6. **Start development server**:
   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:5173`

### Shopify Configuration

1. **Create a Shopify App**:
   - Go to Shopify Partners dashboard
   - Create a new app
   - Set App URL to your deployed URL or ngrok tunnel for development
   - Set Redirect URLs to include: `{APP_URL}/functions/shopifyAuth?callback=1`

2. **Configure Scopes**:
   Required scopes:
   - `read_products`
   - `write_products`
   - `read_product_listings`
   - `read_discounts`
   - `write_discounts`

3. **Set up Webhooks**:
   - Order creation: `{FUNCTION_URL}/trackOrder`
   - Product updates (optional)

4. **Get API Credentials**:
   - Copy API Key and API Secret
   - Add them to your `.env` file

## Core Entities

### Bundle
Stores bundle configuration with products, pricing, and performance metrics.

### Shop
Stores Shopify shop information and access tokens.

### User
Stores user accounts with onboarding status and shop association.

### Product
Synced products from Shopify with inventory tracking.

### BundleOrder
Tracks individual bundle purchases from orders.

### BundleAnalytic
Daily analytics data for bundle performance tracking.

## API Functions

### shopifyAuth.js
Handles Shopify OAuth flow:
- Validates HMAC signatures
- Exchanges code for access token
- Creates shop and user records
- Generates Base44 auth token
- Redirects to app with iframe breakout

### shopifyApiProxy.js
Proxies API calls to Shopify:
- Supports GraphQL and REST endpoints
- Handles authentication with shop access tokens
- Includes retry logic for replication lag
- CORS support

### trackOrder.js
Processes order webhooks:
- Verifies webhook signatures
- Extracts bundle information from orders
- Creates bundle order records
- Updates analytics and bundle stats

## Key Features Implementation

### Authentication Flow
1. User installs app from Shopify
2. Redirects to Shopify OAuth
3. OAuth callback to `shopifyAuth` function
4. Creates/updates shop and user in database
5. Generates auth token and redirects to app
6. `ShopifyLoader` handles token and redirects appropriately

### Subscription Billing
1. User completes onboarding
2. App creates subscription via GraphQL
3. Redirects to Shopify billing confirmation
4. User approves subscription
5. Shopify redirects back with approval
6. User record updated and redirected to dashboard

### Bundle Creation
1. User creates bundle with products
2. Sets discount strategy (percentage/amount/fixed price)
3. Configures display settings
4. Activates bundle
5. Bundle appears in storefront (via theme extension)

### Analytics Tracking
1. Bundle views tracked via storefront widget
2. Add-to-cart clicks tracked
3. Order webhooks create bundle order records
4. Daily analytics aggregated
5. Dashboard and analytics page display metrics

## Development

### Run in Development
```bash
npm run dev
```

### Build for Production
```bash
npm run build
```

### Type Checking
```bash
npm run lint
```

### Testing
```bash
npm test
```

## Deployment

### Frontend (Vite App)
Deploy to any static hosting:
- Vercel
- Netlify
- Cloudflare Pages

### Backend Functions
Deploy to:
- Deno Deploy
- AWS Lambda
- Vercel Functions

### Environment Variables
Set all required environment variables in your deployment platform.

## Configuration

### Base44 Setup
1. Create entities using the JSON schemas in `entities/`
2. Configure row-level security (RLS) policies
3. Set up service role for admin operations
4. Generate API keys for frontend and backend

### Shopify Setup
1. Configure app in Partners dashboard
2. Set up OAuth redirect URLs
3. Install app on development store for testing
4. Configure billing plan (test mode for development)

## Troubleshooting

### OAuth Loop
- Check HMAC validation in `shopifyAuth`
- Verify redirect URLs in Shopify settings
- Clear localStorage and cookies

### 401 Errors
- Verify auth token is saved correctly
- Check Base44 service key in functions
- Ensure RLS policies allow operations

### Webhook Failures
- Verify webhook signature validation
- Check SHOPIFY_API_SECRET is correct
- Ensure webhook URL is publicly accessible

## Security

- HMAC validation on all Shopify webhooks
- Row-level security (RLS) on database entities
- Service role for admin operations in functions
- Secrets stored in environment variables
- CORS headers configured appropriately

## License

MIT License - see LICENSE file for details.

## Support

For issues and questions:
- GitHub Issues: [Repository Issues]
- Shopify Developer Docs: https://shopify.dev/docs/apps
- Base44 Docs: https://base44.com/docs

---

Built with love for Shopify merchants who want to increase AOV through smart bundling.
