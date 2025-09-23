import { prisma } from './prisma.server'
import { logError, logInfo } from './logger.server'
import { checkBundleInventory } from './products.server'
import { trackEvent } from './analytics.server'

// Handle product update webhook
export async function handleProductUpdate(
  shopDomain: string,
  productData: any
): Promise<void> {
  try {
    const productGid = `gid://shopify/Product/${productData.id}`
    
    logInfo('Processing product update', {
      shop: shopDomain,
      productId: productData.id,
      status: productData.status,
    })
    
    // Find bundles that contain this product
    const affectedBundles = await prisma.bundle.findMany({
      where: {
        shop: { domain: shopDomain },
        status: 'ACTIVE',
        items: {
          some: {
            productGid,
          },
        },
      },
      include: {
        items: true,
        shop: true,
      },
    })
    
    if (affectedBundles.length === 0) {
      return
    }
    
    logInfo('Found affected bundles', {
      shop: shopDomain,
      productGid,
      bundleCount: affectedBundles.length,
    })
    
    // Check if product is now inactive or unavailable
    const isProductUnavailable = productData.status !== 'active'
    
    for (const bundle of affectedBundles) {
      if (isProductUnavailable) {
        // Disable bundle if product is unavailable
        await prisma.bundle.update({
          where: { id: bundle.id },
          data: { status: 'DRAFT' },
        })
        
        logInfo('Bundle disabled due to product unavailability', {
          bundleId: bundle.id,
          bundleTitle: bundle.title,
          productGid,
        })
      }
    }
  } catch (error) {
    logError('Failed to handle product update', error as Error, {
      shopDomain,
      productId: productData.id,
    })
  }
}

// Handle inventory level update webhook
export async function handleInventoryUpdate(
  shopDomain: string,
  inventoryData: any
): Promise<void> {
  try {
    const variantGid = `gid://shopify/ProductVariant/${inventoryData.inventory_item_id}`
    
    logInfo('Processing inventory update', {
      shop: shopDomain,
      variantId: inventoryData.inventory_item_id,
      available: inventoryData.available,
    })
    
    // Find bundles that contain this variant
    const affectedBundles = await prisma.bundle.findMany({
      where: {
        shop: { domain: shopDomain },
        status: 'ACTIVE',
        items: {
          some: {
            variantGid,
          },
        },
      },
      include: {
        items: true,
        shop: true,
      },
    })
    
    if (affectedBundles.length === 0) {
      return
    }
    
    logInfo('Found affected bundles for inventory update', {
      shop: shopDomain,
      variantGid,
      bundleCount: affectedBundles.length,
    })
    
    // Check inventory for each affected bundle
    // Note: We need a session to check inventory, which we don't have in webhooks
    // For now, we'll check if inventory is 0 or negative
    const isOutOfStock = inventoryData.available <= 0
    
    if (isOutOfStock) {
      for (const bundle of affectedBundles) {
        const affectedItem = bundle.items.find(item => item.variantGid === variantGid)
        
        if (affectedItem && inventoryData.available < affectedItem.quantity) {
          // Disable bundle if insufficient inventory
          await prisma.bundle.update({
            where: { id: bundle.id },
            data: { status: 'DRAFT' },
          })
          
          logInfo('Bundle disabled due to insufficient inventory', {
            bundleId: bundle.id,
            bundleTitle: bundle.title,
            variantGid,
            available: inventoryData.available,
            required: affectedItem.quantity,
          })
        }
      }
    }
  } catch (error) {
    logError('Failed to handle inventory update', error as Error, {
      shopDomain,
      inventoryData,
    })
  }
}

// Handle order creation webhook (for analytics)
export async function handleOrderCreate(
  shopDomain: string,
  orderData: any
): Promise<void> {
  try {
    logInfo('Processing order creation', {
      shop: shopDomain,
      orderId: orderData.id,
      lineItemsCount: orderData.line_items?.length || 0,
    })
    
    const shop = await prisma.shop.findUnique({
      where: { domain: shopDomain },
    })
    
    if (!shop) {
      logError('Shop not found for order webhook', undefined, { shopDomain })
      return
    }
    
    // Get all active bundles for the shop
    const bundles = await prisma.bundle.findMany({
      where: {
        shopId: shop.id,
        status: 'ACTIVE',
      },
      include: {
        items: true,
      },
    })
    
    // Check if any bundles match the order line items
    for (const bundle of bundles) {
      const isMatchingOrder = checkIfOrderMatchesBundle(bundle, orderData.line_items || [])
      
      if (isMatchingOrder) {
        // Track bundle order
        await trackEvent({
          shop: shop.id,
          bundleId: bundle.id,
          event: 'order',
          metadata: {
            orderId: orderData.id,
            orderNumber: orderData.order_number,
            totalPrice: orderData.total_price,
          },
        })
        
        logInfo('Bundle order tracked', {
          bundleId: bundle.id,
          bundleTitle: bundle.title,
          orderId: orderData.id,
        })
      }
    }
  } catch (error) {
    logError('Failed to handle order creation', error as Error, {
      shopDomain,
      orderId: orderData.id,
    })
  }
}

// Helper function to check if order matches bundle
function checkIfOrderMatchesBundle(
  bundle: any,
  lineItems: any[]
): boolean {
  try {
    if (bundle.type === 'FIXED') {
      // For fixed bundles, check if all required items are present with exact quantities
      for (const bundleItem of bundle.items) {
        const matchingLineItem = lineItems.find(
          lineItem => 
            `gid://shopify/ProductVariant/${lineItem.variant_id}` === bundleItem.variantGid &&
            lineItem.quantity >= bundleItem.quantity
        )
        
        if (!matchingLineItem) {
          return false
        }
      }
      return true
    } else if (bundle.type === 'MIX_MATCH') {
      // For mix & match bundles, check if minimum quantity is met from allowed items
      const allowedVariantGids = bundle.items.map((item: any) => item.variantGid)
      
      let totalQuantity = 0
      for (const lineItem of lineItems) {
        const variantGid = `gid://shopify/ProductVariant/${lineItem.variant_id}`
        if (allowedVariantGids.includes(variantGid)) {
          totalQuantity += lineItem.quantity
        }
      }
      
      return totalQuantity >= (bundle.minQty || 0)
    }
    
    return false
  } catch (error) {
    logError('Error checking order bundle match', error as Error, {
      bundleId: bundle.id,
      lineItemsCount: lineItems.length,
    })
    return false
  }
}

// Webhook verification middleware
export function createWebhookVerifier(secret: string) {
  return (rawBody: string, signature: string): boolean => {
    try {
      const crypto = require('crypto')
      const hmac = crypto.createHmac('sha256', secret)
      const body = hmac.update(rawBody, 'utf8').digest('base64')
      
      return body === signature
    } catch (error) {
      logError('Webhook verification failed', error as Error)
      return false
    }
  }
}

export const verifyWebhook = createWebhookVerifier(process.env.SHOPIFY_API_SECRET!)
