# BundlesUp API Documentation

Complete API reference for the BundlesUp Shopify app.

## Table of Contents

1. [Authentication](#authentication)
2. [Base44 Entities API](#base44-entities-api)
3. [Shopify API Proxy](#shopify-api-proxy)
4. [Backend Functions](#backend-functions)
5. [Error Handling](#error-handling)
6. [Rate Limiting](#rate-limiting)

## Authentication

### Overview

BundlesUp uses token-based authentication with Base44 for data storage and Shopify OAuth for shop access.

### OAuth Flow

```typescript
// 1. Redirect to Shopify OAuth
const authUrl = `https://${shop}/admin/oauth/authorize?` +
  `client_id=${SHOPIFY_API_KEY}&` +
  `scope=${scopes}&` +
  `redirect_uri=${redirectUri}&` +
  `state=${nonce}`

// 2. Handle callback
// Shopify redirects to: /functions/shopifyAuth?callback=1&code=xxx&shop=xxx

// 3. Exchange code for token
// Function exchanges code for access_token

// 4. Create user session
// Function creates Shop and User entities, returns auth token

// 5. Store token
localStorage.setItem('auth_token', token)
```

### Using Auth Token

```typescript
import { api } from './lib/api'

// Set token
api.setToken(token)

// Token is automatically included in all requests
const response = await entities.query('Bundle')
```

## Base44 Entities API

### Overview

Base44 provides a RESTful API for entity operations.

### Base URL

```
https://api.base44.com/apps/{APP_ID}/entities
```

### Query Entities

Get a list of entities with optional filtering.

**Endpoint**: `GET /entities/{entityName}`

**Parameters**:
- `limit` (optional): Number of results (default: 100)
- `offset` (optional): Pagination offset
- `filter` (optional): Filter criteria

**Example**:

```typescript
// Get all bundles
const response = await entities.query<Bundle>('Bundle')

// Get active bundles only
const response = await entities.query<Bundle>('Bundle', {
  status: 'active'
})

// Get with pagination
const response = await entities.query<Bundle>('Bundle', {
  limit: 10,
  offset: 20
})
```

**Response**:

```json
{
  "success": true,
  "data": [
    {
      "id": "bundle_123",
      "name": "Summer Bundle",
      "status": "active",
      ...
    }
  ]
}
```

### Get Single Entity

Get a specific entity by ID.

**Endpoint**: `GET /entities/{entityName}/{id}`

**Example**:

```typescript
const response = await entities.get<Bundle>('Bundle', 'bundle_123')
```

**Response**:

```json
{
  "success": true,
  "data": {
    "id": "bundle_123",
    "name": "Summer Bundle",
    ...
  }
}
```

### Create Entity

Create a new entity.

**Endpoint**: `POST /entities/{entityName}`

**Example**:

```typescript
const response = await entities.create<Bundle>('Bundle', {
  name: 'Summer Bundle',
  description: 'Perfect for summer',
  bundle_type: 'fixed',
  status: 'draft',
  pricing_strategy: 'percentage_discount',
  discount_value: 20,
  products: [
    {
      product_id: 'prod_1',
      product_name: 'Product A',
      quantity: 1,
      original_price: 10.00,
      is_required: true
    }
  ],
  total_sales: 0,
  total_revenue: 0,
  conversion_rate: 0,
  display_template: 'grid',
  display_settings: {
    show_savings: true,
    show_individual_prices: true,
    layout: 'grid'
  }
})
```

**Response**:

```json
{
  "success": true,
  "data": {
    "id": "bundle_456",
    "name": "Summer Bundle",
    ...
  }
}
```

### Update Entity

Update an existing entity.

**Endpoint**: `PUT /entities/{entityName}/{id}`

**Example**:

```typescript
const response = await entities.update<Bundle>('Bundle', 'bundle_123', {
  status: 'active',
  discount_value: 25
})
```

**Response**:

```json
{
  "success": true,
  "data": {
    "id": "bundle_123",
    "status": "active",
    "discount_value": 25,
    ...
  }
}
```

### Delete Entity

Delete an entity.

**Endpoint**: `DELETE /entities/{entityName}/{id}`

**Example**:

```typescript
const response = await entities.delete('Bundle', 'bundle_123')
```

**Response**:

```json
{
  "success": true
}
```

## Shopify API Proxy

### Overview

The Shopify API proxy allows you to make GraphQL and REST API calls to Shopify without exposing your access token.

### GraphQL Query

Make a GraphQL query to Shopify Admin API.

**Function**: `shopifyApiProxy`

**Example**:

```typescript
const query = `
  query {
    products(first: 10) {
      edges {
        node {
          id
          title
          variants(first: 1) {
            edges {
              node {
                price
              }
            }
          }
        }
      }
    }
  }
`

const response = await shopify.graphql<any>(query)
```

**With Variables**:

```typescript
const mutation = `
  mutation CreateProduct($input: ProductInput!) {
    productCreate(input: $input) {
      product {
        id
        title
      }
    }
  }
`

const variables = {
  input: {
    title: 'New Product',
    productType: 'Bundle'
  }
}

const response = await shopify.graphql<any>(mutation, variables)
```

### REST API Call

Make a REST API call to Shopify Admin API.

**Example**:

```typescript
// GET request
const response = await shopify.rest<any>(
  'products.json',
  'GET'
)

// POST request
const response = await shopify.rest<any>(
  'products.json',
  'POST',
  {
    product: {
      title: 'New Product',
      product_type: 'Bundle'
    }
  }
)
```

## Backend Functions

### shopifyAuth

Handles Shopify OAuth flow.

**URL**: `https://your-deno-deploy-url.deno.dev/shopifyAuth`

**Parameters**:
- `shop`: Shop domain (e.g., `mystore.myshopify.com`)
- `code`: OAuth authorization code (callback only)
- `callback`: Set to `1` for callback handling

**Flow**:

1. Initial request: `?shop=mystore.myshopify.com`
2. Redirects to Shopify OAuth
3. Callback: `?shop=mystore.myshopify.com&code=xxx&callback=1`
4. Exchanges code for access token
5. Creates Shop and User entities
6. Generates auth token
7. Redirects to app with token

**Response**: Redirect to app with token parameter

### shopifyApiProxy

Proxies requests to Shopify Admin API.

**URL**: `https://your-deno-deploy-url.deno.dev/shopifyApiProxy`

**Request Body**:

```json
{
  "type": "graphql",
  "shop": "mystore.myshopify.com",
  "query": "query { ... }",
  "variables": {}
}
```

Or for REST:

```json
{
  "type": "rest",
  "shop": "mystore.myshopify.com",
  "endpoint": "products.json",
  "method": "GET",
  "data": {}
}
```

**Response**:

```json
{
  "success": true,
  "data": { ... }
}
```

### trackOrder

Webhook handler for order creation.

**URL**: `https://your-deno-deploy-url.deno.dev/trackOrder`

**Method**: POST

**Headers**:
- `X-Shopify-Hmac-Sha256`: HMAC signature
- `X-Shopify-Shop-Domain`: Shop domain

**Body**: Shopify order JSON

**Processing**:
1. Verifies HMAC signature
2. Extracts bundle information from line items
3. Creates BundleOrder record
4. Updates BundleAnalytic stats
5. Updates Bundle aggregate stats

**Response**: `200 OK`

## Error Handling

### Error Response Format

```json
{
  "success": false,
  "error": "Error message"
}
```

### Common Error Codes

- `400`: Bad Request - Invalid parameters
- `401`: Unauthorized - Missing or invalid auth token
- `403`: Forbidden - Invalid HMAC or insufficient permissions
- `404`: Not Found - Entity not found
- `500`: Internal Server Error - Server error

### Error Handling Example

```typescript
const response = await entities.create<Bundle>('Bundle', data)

if (!response.success) {
  console.error('Error:', response.error)
  // Handle error
  return
}

// Success
const bundle = response.data
```

## Rate Limiting

### Base44 API

- **Rate Limit**: 100 requests per minute per app
- **Headers**: 
  - `X-RateLimit-Limit`: Total limit
  - `X-RateLimit-Remaining`: Remaining requests
  - `X-RateLimit-Reset`: Reset timestamp

### Shopify API

- **Rate Limit**: 2 requests per second (REST), 1000 points per second (GraphQL)
- **Headers**:
  - `X-Shopify-Shop-Api-Call-Limit`: Current usage
  - `Retry-After`: Seconds to wait before retry

### Handling Rate Limits

```typescript
async function makeRequestWithRetry<T>(
  fn: () => Promise<ApiResponse<T>>,
  maxRetries = 3
): Promise<ApiResponse<T>> {
  for (let i = 0; i < maxRetries; i++) {
    const response = await fn()
    
    if (response.success) {
      return response
    }
    
    if (response.error?.includes('rate limit')) {
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)))
      continue
    }
    
    return response
  }
  
  return { success: false, error: 'Max retries exceeded' }
}
```

## TypeScript Types

### ApiResponse

```typescript
interface ApiResponse<T = any> {
  data?: T
  error?: string
  success: boolean
}
```

### Bundle

```typescript
interface Bundle {
  id: string
  name: string
  description: string
  bundle_type: 'fixed' | 'mix_match' | 'upsell' | 'frequently_together'
  status: 'active' | 'draft' | 'paused'
  pricing_strategy: 'fixed_price' | 'percentage_discount' | 'amount_discount'
  discount_value: number
  fixed_price?: number
  products: BundleProduct[]
  min_items?: number
  max_items?: number
  total_sales: number
  total_revenue: number
  conversion_rate: number
  display_template: 'list' | 'grid' | 'tiered' | 'radio_list'
  display_settings: {
    show_savings: boolean
    show_individual_prices: boolean
    layout: 'grid' | 'list'
  }
  created_at?: string
  updated_at?: string
}
```

### Product

```typescript
interface Product {
  id: string
  name: string
  price: number
  image_url: string
  shopify_product_id: string
  inventory: number
}
```

## Examples

### Complete Bundle Creation Flow

```typescript
// 1. Sync products from Shopify
const productsQuery = `
  query {
    products(first: 50) {
      edges {
        node {
          id
          title
          featuredImage { url }
          variants(first: 1) {
            edges {
              node {
                price
                inventoryQuantity
              }
            }
          }
        }
      }
    }
  }
`

const productsResponse = await shopify.graphql<any>(productsQuery)
const shopifyProducts = productsResponse.data.products.edges

// 2. Save products to database
for (const edge of shopifyProducts) {
  const product = edge.node
  const variant = product.variants.edges[0]?.node
  
  await entities.create<Product>('Product', {
    name: product.title,
    price: parseFloat(variant?.price || '0'),
    image_url: product.featuredImage?.url || '',
    shopify_product_id: product.id,
    inventory: variant?.inventoryQuantity || 0
  })
}

// 3. Create bundle
const bundleData = {
  name: 'Summer Bundle',
  description: 'Perfect for summer',
  bundle_type: 'fixed',
  status: 'active',
  pricing_strategy: 'percentage_discount',
  discount_value: 20,
  products: [
    {
      product_id: 'prod_1',
      product_name: 'Product A',
      product_image: 'https://...',
      original_price: 10.00,
      quantity: 1,
      is_required: true
    }
  ],
  total_sales: 0,
  total_revenue: 0,
  conversion_rate: 0,
  display_template: 'grid',
  display_settings: {
    show_savings: true,
    show_individual_prices: true,
    layout: 'grid'
  }
}

const bundleResponse = await entities.create<Bundle>('Bundle', bundleData)

if (bundleResponse.success) {
  console.log('Bundle created:', bundleResponse.data)
}
```

---

**Last Updated**: November 2024
**Version**: 1.0.0
