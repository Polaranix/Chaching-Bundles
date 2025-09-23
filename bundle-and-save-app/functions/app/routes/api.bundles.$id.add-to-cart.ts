import type { ActionFunctionArgs } from '@remix-run/node'
import { json } from '@remix-run/node'
import { prisma } from '~/lib/prisma.server'
import { logError, logInfo } from '~/lib/logger.server'
import { trackEvent } from '~/lib/analytics.server'
import { checkBundleInventory } from '~/lib/products.server'

export const action = async ({ request, params }: ActionFunctionArgs) => {
  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, { status: 405 })
  }
  
  try {
    const bundleId = params.id!
    const { shopDomain, customerAccessToken, cartId } = await request.json()
    
    if (!shopDomain) {
      return json({ error: 'Shop domain is required' }, { status: 400 })
    }
    
    // Get bundle with items
    const bundle = await prisma.bundle.findFirst({
      where: {
        id: bundleId,
        status: 'ACTIVE',
        shop: {
          domain: shopDomain,
        },
      },
      include: {
        items: true,
        shop: true,
      },
    })
    
    if (!bundle) {
      return json({ error: 'Bundle not found or inactive' }, { status: 404 })
    }
    
    // Track click event
    await trackEvent({
      shop: bundle.shopId,
      bundleId: bundle.id,
      event: 'click',
      metadata: {
        cartId,
        customerAccessToken: customerAccessToken ? 'present' : 'absent',
      },
    })
    
    // TODO: Check inventory using session (requires storefront API access)
    // For now, we'll assume inventory is available
    
    // Prepare cart line items for Storefront API
    const cartLines = bundle.items.map(item => ({
      merchandiseId: item.variantGid,
      quantity: item.quantity,
    }))
    
    logInfo('Bundle add-to-cart request processed', {
      bundleId: bundle.id,
      bundleTitle: bundle.title,
      shopDomain,
      itemCount: cartLines.length,
    })
    
    // Return cart lines for the frontend to add via Storefront API
    return json({
      success: true,
      bundle: {
        id: bundle.id,
        title: bundle.title,
        discountType: bundle.discountType,
        discountValue: bundle.discountValue,
      },
      cartLines,
      message: 'Bundle items prepared for cart',
    })
  } catch (error) {
    logError('Failed to process add-to-cart request', error as Error, {
      bundleId: params.id,
    })
    
    return json(
      { error: 'Failed to add bundle to cart' },
      { status: 500 }
    )
  }
}

// Handle preflight requests for CORS
export const loader = async ({ request }: ActionFunctionArgs) => {
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    })
  }
  
  return json({ error: 'Method not allowed' }, { status: 405 })
}
