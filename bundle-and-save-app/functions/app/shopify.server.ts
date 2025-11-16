import { shopify } from './lib/shopify.server'

export default shopify
export { authenticate } from './lib/shopify.server'

// Add document response headers for Shopify embedded app
export function addDocumentResponseHeaders(request: Request, headers: Headers) {
  // Add CSP headers for Shopify embedded apps
  headers.set(
    'Content-Security-Policy',
    "frame-ancestors https://*.myshopify.com https://admin.shopify.com;"
  )
}
