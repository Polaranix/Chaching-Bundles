import { authenticate, GET_PRODUCT_QUERY } from './shopify.server'
import { logError, logInfo } from './logger.server'

export interface ProductVariant {
  id: string
  title: string
  inventoryQuantity: number
  availableForSale: boolean
}

export interface Product {
  id: string
  title: string
  status: string
  variants: ProductVariant[]
}

// Get product details from Shopify
export async function getProduct(
  session: any,
  productId: string
): Promise<Product | null> {
  try {
    const client = new (await import('@shopify/shopify-app-remix/server')).shopify.clients.Graphql({ session })
    
    const response = await client.query({
      data: {
        query: GET_PRODUCT_QUERY,
        variables: { id: productId },
      },
    })
    
    const product = response.body.data?.product
    
    if (!product) {
      return null
    }
    
    return {
      id: product.id,
      title: product.title,
      status: product.status,
      variants: product.variants.edges.map((edge: any) => ({
        id: edge.node.id,
        title: edge.node.title,
        inventoryQuantity: edge.node.inventoryQuantity || 0,
        availableForSale: edge.node.availableForSale || false,
      })),
    }
  } catch (error) {
    logError('Failed to get product', error as Error, { productId })
    return null
  }
}

// Check if all bundle items are available
export async function checkBundleInventory(
  session: any,
  bundleItems: Array<{ productGid: string; variantGid: string; quantity: number }>
): Promise<{
  isAvailable: boolean
  unavailableItems: Array<{ productGid: string; variantGid: string; reason: string }>
}> {
  const unavailableItems: Array<{ productGid: string; variantGid: string; reason: string }> = []
  
  try {
    for (const item of bundleItems) {
      const product = await getProduct(session, item.productGid)
      
      if (!product) {
        unavailableItems.push({
          productGid: item.productGid,
          variantGid: item.variantGid,
          reason: 'Product not found',
        })
        continue
      }
      
      if (product.status !== 'ACTIVE') {
        unavailableItems.push({
          productGid: item.productGid,
          variantGid: item.variantGid,
          reason: 'Product not active',
        })
        continue
      }
      
      const variant = product.variants.find(v => v.id === item.variantGid)
      
      if (!variant) {
        unavailableItems.push({
          productGid: item.productGid,
          variantGid: item.variantGid,
          reason: 'Variant not found',
        })
        continue
      }
      
      if (!variant.availableForSale) {
        unavailableItems.push({
          productGid: item.productGid,
          variantGid: item.variantGid,
          reason: 'Variant not available for sale',
        })
        continue
      }
      
      if (variant.inventoryQuantity < item.quantity) {
        unavailableItems.push({
          productGid: item.productGid,
          variantGid: item.variantGid,
          reason: `Insufficient inventory: ${variant.inventoryQuantity} available, ${item.quantity} needed`,
        })
        continue
      }
    }
    
    return {
      isAvailable: unavailableItems.length === 0,
      unavailableItems,
    }
  } catch (error) {
    logError('Failed to check bundle inventory', error as Error, { bundleItems })
    return {
      isAvailable: false,
      unavailableItems: bundleItems.map(item => ({
        productGid: item.productGid,
        variantGid: item.variantGid,
        reason: 'Error checking inventory',
      })),
    }
  }
}

// Get products for product picker (simplified)
export async function searchProducts(
  session: any,
  query: string = '',
  first: number = 10
): Promise<Array<{
  id: string
  title: string
  handle: string
  featuredImage?: string
  variants: Array<{
    id: string
    title: string
    price: string
    availableForSale: boolean
  }>
}>> {
  try {
    const client = new (await import('@shopify/shopify-app-remix/server')).shopify.clients.Graphql({ session })
    
    const searchQuery = `
      query SearchProducts($query: String!, $first: Int!) {
        products(query: $query, first: $first) {
          edges {
            node {
              id
              title
              handle
              featuredImage {
                url
              }
              variants(first: 10) {
                edges {
                  node {
                    id
                    title
                    price
                    availableForSale
                  }
                }
              }
            }
          }
        }
      }
    `
    
    const response = await client.query({
      data: {
        query: searchQuery,
        variables: { 
          query: query || 'status:active', 
          first 
        },
      },
    })
    
    const products = response.body.data?.products?.edges || []
    
    return products.map((edge: any) => ({
      id: edge.node.id,
      title: edge.node.title,
      handle: edge.node.handle,
      featuredImage: edge.node.featuredImage?.url,
      variants: edge.node.variants.edges.map((variantEdge: any) => ({
        id: variantEdge.node.id,
        title: variantEdge.node.title,
        price: variantEdge.node.price,
        availableForSale: variantEdge.node.availableForSale,
      })),
    }))
  } catch (error) {
    logError('Failed to search products', error as Error, { query, first })
    return []
  }
}
