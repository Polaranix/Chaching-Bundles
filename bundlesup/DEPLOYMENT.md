# BundlesUp Deployment Guide

This guide will walk you through deploying the BundlesUp Shopify app to production.

## Prerequisites

- Shopify Partner account
- Base44 account
- Deno Deploy account
- Domain name (optional but recommended)
- Git repository

## Step 1: Base44 Setup

### 1.1 Create Base44 Account

1. Go to https://base44.com
2. Sign up for an account
3. Create a new app with ID: `68d87fcee669d830cce9b999`

### 1.2 Create Entities

Create the following entities in your Base44 app:

#### Shop Entity
```json
{
  "name": "Shop",
  "fields": {
    "shop_name": { "type": "string", "unique": true },
    "access_token": { "type": "string" },
    "scopes": { "type": "string" },
    "installed_at": { "type": "datetime" }
  }
}
```

#### User Entity
```json
{
  "name": "User",
  "fields": {
    "email": { "type": "string" },
    "full_name": { "type": "string" },
    "role": { "type": "string" },
    "has_completed_onboarding": { "type": "boolean" },
    "shop_domain": { "type": "string" }
  }
}
```

#### Bundle Entity
```json
{
  "name": "Bundle",
  "fields": {
    "name": { "type": "string" },
    "description": { "type": "string" },
    "bundle_type": { "type": "string" },
    "status": { "type": "string" },
    "pricing_strategy": { "type": "string" },
    "discount_value": { "type": "number" },
    "fixed_price": { "type": "number" },
    "products": { "type": "json" },
    "min_items": { "type": "number" },
    "max_items": { "type": "number" },
    "total_sales": { "type": "number" },
    "total_revenue": { "type": "number" },
    "conversion_rate": { "type": "number" },
    "display_template": { "type": "string" },
    "display_settings": { "type": "json" }
  }
}
```

#### Product Entity
```json
{
  "name": "Product",
  "fields": {
    "name": { "type": "string" },
    "price": { "type": "number" },
    "image_url": { "type": "string" },
    "shopify_product_id": { "type": "string" },
    "inventory": { "type": "number" }
  }
}
```

#### BundleOrder Entity
```json
{
  "name": "BundleOrder",
  "fields": {
    "bundle_id": { "type": "string" },
    "shop_id": { "type": "string" },
    "order_id": { "type": "string" },
    "discount_amount": { "type": "number" },
    "total_amount": { "type": "number" },
    "items_count": { "type": "integer" }
  }
}
```

#### BundleAnalytic Entity
```json
{
  "name": "BundleAnalytic",
  "fields": {
    "bundle_id": { "type": "string" },
    "shop_id": { "type": "string" },
    "views": { "type": "integer" },
    "clicks": { "type": "integer" },
    "conversions": { "type": "integer" },
    "revenue": { "type": "number" },
    "date": { "type": "date" }
  }
}
```

### 1.3 Get Service Key

1. Go to your Base44 app settings
2. Generate a service key (for backend operations)
3. Save this key securely

## Step 2: Deno Deploy Setup

### 2.1 Install Deno Deploy CLI

```bash
npm install -g deployctl
```

### 2.2 Login to Deno Deploy

```bash
deployctl login
```

### 2.3 Deploy Functions

Deploy each function to Deno Deploy:

```bash
# Deploy shopifyAuth
cd functions
deployctl deploy --project=bundlesup-auth shopifyAuth.ts

# Deploy shopifyApiProxy
deployctl deploy --project=bundlesup-proxy shopifyApiProxy.ts

# Deploy trackOrder
deployctl deploy --project=bundlesup-webhook trackOrder.ts
```

### 2.4 Set Environment Variables

For each deployed function, set the following environment variables in Deno Deploy dashboard:

- `SHOPIFY_API_KEY`: Your Shopify app API key
- `SHOPIFY_API_SECRET`: Your Shopify app API secret
- `BASE44_API_URL`: https://api.base44.com
- `BASE44_APP_ID`: 68d87fcee669d830cce9b999
- `BASE44_SERVICE_KEY`: Your Base44 service key
- `APP_URL`: Your production app URL

### 2.5 Note Function URLs

Save the URLs of your deployed functions:
- Auth: `https://bundlesup-auth.deno.dev`
- Proxy: `https://bundlesup-proxy.deno.dev`
- Webhook: `https://bundlesup-webhook.deno.dev`

## Step 3: Shopify App Setup

### 3.1 Create Shopify App

1. Go to Shopify Partner Dashboard
2. Click "Apps" → "Create app"
3. Choose "Create app manually"
4. Enter app name: "BundlesUp"

### 3.2 Configure App URLs

1. **App URL**: Your production URL (e.g., `https://bundlesup.com`)
2. **Allowed redirection URL(s)**:
   - `https://bundlesup-auth.deno.dev/shopifyAuth?callback=1`
   - `https://bundlesup.com`

### 3.3 Configure API Scopes

Add the following scopes:
- `read_products`
- `write_products`
- `read_product_listings`
- `read_discounts`
- `write_discounts`

### 3.4 Get API Credentials

1. Copy your API key
2. Copy your API secret key
3. Save these securely

## Step 4: Frontend Deployment

### 4.1 Choose Hosting Provider

We recommend:
- **Vercel** (easiest)
- **Netlify**
- **Cloudflare Pages**

### 4.2 Deploy to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

### 4.3 Set Environment Variables

In your hosting provider dashboard, set:

```env
VITE_SHOPIFY_API_KEY=your_shopify_api_key
VITE_APP_URL=https://your-domain.com
VITE_BASE44_APP_ID=68d87fcee669d830cce9b999
VITE_BASE44_API_URL=https://api.base44.com
VITE_FUNCTIONS_URL=https://bundlesup-proxy.deno.dev
```

### 4.4 Build and Deploy

```bash
npm run build
vercel --prod
```

## Step 5: Configure Webhooks

### 5.1 Add Webhook in Shopify

1. Go to your app in Shopify Partner Dashboard
2. Navigate to "Configuration" → "Webhooks"
3. Add webhook:
   - **Event**: Order creation
   - **URL**: `https://bundlesup-webhook.deno.dev/trackOrder`
   - **Format**: JSON
   - **API version**: 2023-10

## Step 6: Testing

### 6.1 Test Installation

1. Go to your app in Partner Dashboard
2. Click "Test on development store"
3. Select a development store
4. Install the app

### 6.2 Test OAuth Flow

1. Verify redirect to Shopify OAuth
2. Approve permissions
3. Verify redirect back to app
4. Check onboarding page loads

### 6.3 Test Bundle Creation

1. Sync products from Shopify
2. Create a test bundle
3. Verify bundle appears in list
4. Test editing and deleting

### 6.4 Test Analytics

1. Create test orders with bundle items
2. Verify webhook receives order data
3. Check analytics update correctly

## Step 7: Production Checklist

- [ ] All environment variables set correctly
- [ ] Deno functions deployed and working
- [ ] Frontend deployed and accessible
- [ ] Shopify app configured with correct URLs
- [ ] Webhooks configured and tested
- [ ] SSL certificate active (HTTPS)
- [ ] Base44 entities created
- [ ] Test installation on development store
- [ ] Test complete user flow
- [ ] Monitor error logs

## Step 8: App Submission

### 8.1 Prepare for Review

1. Add app listing information
2. Upload screenshots
3. Write app description
4. Set pricing ($12.99/month)
5. Add support email

### 8.2 Submit for Review

1. Go to Partner Dashboard
2. Navigate to your app
3. Click "Submit for review"
4. Fill in all required information
5. Submit

## Troubleshooting

### OAuth Loop

**Problem**: App keeps redirecting to OAuth

**Solution**:
1. Clear browser cookies
2. Verify `VITE_APP_URL` matches actual URL
3. Check redirect URLs in Shopify settings

### 401 Errors

**Problem**: Getting 401 unauthorized errors

**Solution**:
1. Verify Base44 service key is correct
2. Check shop access token is saved
3. Verify API scopes are correct

### Webhooks Not Working

**Problem**: Orders not tracked

**Solution**:
1. Verify webhook URL is correct
2. Check HMAC verification
3. Review Deno Deploy logs
4. Test webhook with Shopify webhook tester

### Products Not Syncing

**Problem**: Products not importing from Shopify

**Solution**:
1. Verify `read_products` scope
2. Check shop access token
3. Review API proxy logs
4. Test GraphQL query manually

## Monitoring

### Recommended Tools

- **Sentry**: Error tracking
- **LogRocket**: Session replay
- **Datadog**: Performance monitoring

### Key Metrics to Monitor

- Installation rate
- Active users
- Bundle creation rate
- Order conversion rate
- API error rate
- Page load time

## Support

For deployment issues:
- Email: support@bundlesup.com
- Documentation: https://docs.bundlesup.com
- GitHub Issues: [repository-url]/issues

## Security Notes

1. Never commit `.env` files
2. Rotate API keys regularly
3. Use HTTPS everywhere
4. Validate all webhook signatures
5. Implement rate limiting
6. Monitor for suspicious activity

## Scaling Considerations

### Database

- Base44 handles scaling automatically
- Monitor entity query performance
- Add indexes for frequently queried fields

### Functions

- Deno Deploy auto-scales
- Monitor function execution time
- Optimize cold start performance

### Frontend

- Use CDN for static assets
- Implement code splitting
- Optimize bundle size
- Enable gzip compression

## Maintenance

### Regular Tasks

- Monitor error logs daily
- Review analytics weekly
- Update dependencies monthly
- Test on latest Shopify API version
- Backup Base44 data regularly

### Updates

When updating the app:
1. Test in development environment
2. Deploy functions first
3. Deploy frontend
4. Monitor for errors
5. Rollback if issues occur

---

**Last Updated**: November 2024
**Version**: 1.0.0
