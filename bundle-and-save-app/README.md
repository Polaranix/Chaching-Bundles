# Bundle & Save - Shopify App

A production-ready Shopify app that enables merchants to create product bundles with automatic discounts. Built with Remix, TypeScript, Prisma, and Shopify Functions.

## Features

- **Bundle Types**: Fixed bundles and Mix & Match bundles
- **Discount Options**: Percentage or fixed amount discounts
- **Storefront Integration**: Lightweight PDP and Cart widgets
- **Smart Inventory**: Auto-disable bundles when items go out of stock
- **Analytics**: Track impressions, clicks, and conversions
- **Billing**: Free plan (1 bundle) and Pro plan (unlimited)
- **Shopify Functions**: Cart-level discount application

## Tech Stack

- **Framework**: Remix with TypeScript (strict mode)
- **Database**: Prisma ORM with PostgreSQL (Neon) for production, SQLite for development
- **UI**: Shopify Polaris components
- **Authentication**: Shopify App authentication (embedded)
- **Validation**: Zod schemas
- **Logging**: Winston
- **Testing**: Vitest
- **Deployment**: Ready for Fly.io, Render, or Railway

## Quick Start

### Prerequisites

- Node.js 20+ and pnpm
- Shopify CLI latest version
- Shopify Partner account

### Installation

1. **Clone and setup**:
   ```bash
   git clone <repository-url>
   cd bundle-and-save-app
   pnpm install
   ```

2. **Environment configuration**:
   ```bash
   cp env.example .env
   ```

   Update `.env` with your values:
   ```env
   SHOPIFY_API_KEY=your_api_key_here
   SHOPIFY_API_SECRET=your_api_secret_here
   SCOPES=write_products,read_products,read_orders,write_discounts
   APP_URL=http://localhost:3000
   
   # For development (leave empty to use SQLite)
   DATABASE_URL=
   
   # For production (Neon Postgres)
   # DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DB?sslmode=require
   
   SESSION_SECRET=your_strong_random_string_here
   BILLING_PRICE=9.99
   BILLING_TRIAL_DAYS=7
   ```

3. **Database setup**:
   ```bash
   # Development (SQLite)
   pnpm db:push
   
   # Production (after setting DATABASE_URL)
   pnpm db:migrate
   ```

4. **Seed demo data** (optional):
   ```bash
   pnpm seed
   ```

5. **Start development**:
   ```bash
   pnpm dev
   ```

### Shopify CLI Integration

The app is built to work seamlessly with Shopify CLI:

```bash
# Install app on development store
shopify app install

# Deploy functions
shopify app deploy

# Generate extensions
shopify app generate extension
```

## Project Structure

```
bundle-and-save-app/
├── app/
│   ├── routes/                 # Remix routes
│   │   ├── app._index.tsx     # Dashboard
│   │   ├── app.bundles.new.tsx # Create bundle
│   │   ├── app.bundles.$id.tsx # Edit bundle
│   │   ├── app.billing.tsx    # Billing management
│   │   └── api/               # API endpoints
│   ├── components/            # React components
│   │   └── BundleForm.tsx     # Bundle creation form
│   └── lib/                   # Server utilities
│       ├── prisma.server.ts   # Database client
│       ├── shopify.server.ts  # Shopify integration
│       ├── validate.ts        # Zod schemas
│       ├── analytics.server.ts # Analytics tracking
│       └── billing.server.ts  # Subscription management
├── functions/
│   └── bundle-discount/       # Shopify Function (Rust)
├── extensions/
│   └── bundle-widget/         # Theme app extension
├── prisma/
│   └── schema.prisma         # Database schema
├── scripts/
│   └── seed.ts              # Database seeding
└── tests/                   # Test files
```

## Database Schema

### Core Models

- **Shop**: Store information and plan details
- **Bundle**: Bundle configuration and settings
- **BundleItem**: Products/variants within bundles
- **BundleMetric**: Analytics data (impressions, clicks, orders)

### Bundle Types

1. **Fixed Bundle**: Specific products with set quantities
2. **Mix & Match**: Choose X items from a selection

### Discount Types

- **Percentage**: e.g., 20% off
- **Amount**: e.g., $5.00 off

## API Endpoints

### Bundle Management
- `GET /app` - Dashboard with bundle list
- `GET /app/bundles/new` - Create bundle form
- `GET /app/bundles/:id` - Edit bundle
- `POST /app/bundles` - Create/update bundle

### Storefront API
- `POST /api/bundles/:id/add-to-cart` - Add bundle to cart
- `POST /api/events/track` - Track analytics events

### Webhooks
- `POST /webhooks` - Handle Shopify webhooks
  - Product updates
  - Inventory changes
  - Order creation
  - Subscription updates

## Shopify Function

The discount function (`functions/bundle-discount`) applies cart-level discounts written in Rust for optimal performance.

### Function Logic

1. **Fixed Bundles**: Checks if all required items are in cart with sufficient quantities
2. **Mix & Match**: Validates minimum quantity from allowed items
3. **Discount Application**: Applies percentage or fixed amount discounts

### Testing Functions

```bash
cd functions/bundle-discount
cargo test
```

## Storefront Integration

### Theme App Extension

The bundle widget automatically appears on:

- **Product Pages**: Shows bundles containing the current product
- **Cart**: Suggests completing bundles based on cart contents

### Widget Features

- Responsive design
- Accessibility compliant
- Tracks impressions and clicks
- Handles add-to-cart with proper error handling

## Analytics

Track bundle performance with:

- **Impressions**: Widget views
- **Clicks**: Add-to-cart attempts
- **Orders**: Successful bundle purchases
- **Conversion Rate**: Orders/Impressions

## Billing System

### Plans

- **Free**: 1 active bundle, basic features
- **Pro**: Unlimited bundles, advanced analytics ($9.99/month, 7-day trial)

### Implementation

- AppSubscription API integration
- Automatic plan enforcement
- Webhook-based subscription updates

## Testing

Run the test suite:

```bash
# Unit tests
pnpm test

# Watch mode
pnpm test:watch

# Type checking
pnpm typecheck
```

### Test Coverage

- Bundle validation logic
- Database operations
- Discount function algorithms
- Analytics tracking

## Deployment

### Production Setup

1. **Database**: Create Neon Postgres database
2. **Environment**: Set production environment variables
3. **Build**: `pnpm build`
4. **Migrate**: `pnpm db:deploy`
5. **Deploy**: Deploy to your platform (Fly.io, Render, Railway)

### Shopify Configuration

1. Update app URL in Partner Dashboard
2. Set redirect URLs
3. Deploy Shopify Functions: `shopify app deploy`

### Platform-Specific Guides

#### Fly.io
```bash
fly launch
fly deploy
```

#### Render
- Connect GitHub repository
- Set build command: `pnpm build`
- Set start command: `pnpm start`

#### Railway
```bash
railway login
railway link
railway up
```

## Development Scripts

```json
{
  "dev": "shopify app dev",
  "build": "shopify app build && prisma generate",
  "db:push": "prisma db push",
  "db:migrate": "prisma migrate dev --name init",
  "db:deploy": "prisma migrate deploy",
  "db:studio": "prisma studio",
  "test": "vitest run",
  "seed": "tsx scripts/seed.ts"
}
```

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `SHOPIFY_API_KEY` | App API key | Required |
| `SHOPIFY_API_SECRET` | App secret | Required |
| `APP_URL` | App URL | `http://localhost:3000` |
| `DATABASE_URL` | Database connection | SQLite (dev) |
| `SESSION_SECRET` | Session encryption | Required |
| `BILLING_PRICE` | Pro plan price | `9.99` |
| `BILLING_TRIAL_DAYS` | Trial period | `7` |

### Shopify Scopes

Required scopes:
- `write_products`: Create hidden bundle products
- `read_products`: Access product data
- `read_orders`: Track bundle orders
- `write_discounts`: Manage discount functions

## Troubleshooting

### Common Issues

1. **Database Connection**: Ensure `DATABASE_URL` is correct for production
2. **Shopify Authentication**: Verify API keys and scopes
3. **Function Deployment**: Run `shopify app deploy` after code changes
4. **Widget Not Appearing**: Check theme compatibility and app block installation

### Debug Mode

Enable detailed logging:
```env
LOG_LEVEL=debug
NODE_ENV=development
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes with tests
4. Run `pnpm test` and `pnpm typecheck`
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

- Documentation: [Shopify App Development](https://shopify.dev/docs/apps)
- Functions: [Shopify Functions Guide](https://shopify.dev/docs/api/functions)
- Community: [Shopify Dev Community](https://community.shopify.com/)

---

Built with ❤️ for Shopify merchants who want to increase AOV through smart bundling.
