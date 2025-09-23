import type { LoaderFunctionArgs } from '@remix-run/node'
import { json } from '@remix-run/node'
import { prisma } from '~/lib/prisma.server'
import { logError } from '~/lib/logger.server'

export const loader = async ({ request }: LoaderFunctionArgs) => {
  try {
    const url = new URL(request.url)
    const shopDomain = url.searchParams.get('shop')
    const productId = url.searchParams.get('product')

    if (!shopDomain) {
      return json({ error: 'Shop domain is required' }, { status: 400 })
    }

    // Find shop
    const shop = await prisma.shop.findUnique({
      where: { domain: shopDomain },
    })

    if (!shop) {
      return json({ error: 'Shop not found' }, { status: 404 })
    }

    // Get active bundles
    let whereClause: any = {
      shopId: shop.id,
      status: 'ACTIVE',
    }

    // If productId is provided, filter bundles containing that product
    if (productId) {
      whereClause.items = {
        some: {
          productGid: productId,
        },
      }
    }

    const bundles = await prisma.bundle.findMany({
      where: whereClause,
      include: {
        items: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 5, // Limit to 5 bundles for performance
    })

    // Transform bundles for frontend consumption
    const transformedBundles = bundles.map(bundle => ({
      id: bundle.id,
      title: bundle.title,
      type: bundle.type,
      discountType: bundle.discountType,
      discountValue: bundle.discountValue,
      minQty: bundle.minQty,
      items: bundle.items.map(item => ({
        productGid: item.productGid,
        variantGid: item.variantGid,
        quantity: item.quantity,
        // Note: Product details like title and image would need to be fetched
        // from Shopify API or cached separately for better performance
      })),
    }))

    // Set CORS headers for storefront access
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Cache-Control': 'public, max-age=300', // Cache for 5 minutes
    }

    return json(transformedBundles, { headers })
  } catch (error) {
    logError('Failed to fetch active bundles', error as Error, {
      shopDomain: request.url,
    })

    return json(
      { error: 'Failed to fetch bundles' },
      { 
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
      }
    )
  }
}

// Handle preflight requests for CORS
export const options = async () => {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}
