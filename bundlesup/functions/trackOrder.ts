// Deno Deploy function for tracking orders (webhook handler)
// Deploy this to Deno Deploy and configure as Shopify webhook

const SHOPIFY_API_SECRET = Deno.env.get('SHOPIFY_API_SECRET') || ''
const BASE44_API_URL = Deno.env.get('BASE44_API_URL') || 'https://api.base44.com'
const BASE44_APP_ID = Deno.env.get('BASE44_APP_ID') || '68d87fcee669d830cce9b999'

async function verifyWebhook(req: Request, body: string): Promise<boolean> {
  const hmac = req.headers.get('X-Shopify-Hmac-Sha256')
  if (!hmac) return false

  const encoder = new TextEncoder()
  const keyData = encoder.encode(SHOPIFY_API_SECRET)
  const messageData = encoder.encode(body)
  
  const key = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  
  const signature = await crypto.subtle.sign('HMAC', key, messageData)
  const hashArray = Array.from(new Uint8Array(signature))
  const hashBase64 = btoa(String.fromCharCode(...hashArray))
  
  return hashBase64 === hmac
}

async function createBundleOrder(bundleId: string, shopId: string, orderData: any): Promise<void> {
  await fetch(`${BASE44_API_URL}/apps/${BASE44_APP_ID}/entities/BundleOrder`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${Deno.env.get('BASE44_SERVICE_KEY')}`,
    },
    body: JSON.stringify({
      bundle_id: bundleId,
      shop_id: shopId,
      order_id: orderData.id,
      discount_amount: orderData.total_discounts || 0,
      total_amount: orderData.total_price || 0,
      items_count: orderData.line_items?.length || 0,
    }),
  })
}

async function updateBundleAnalytics(bundleId: string, shopId: string, date: string): Promise<void> {
  // Get existing analytics
  const response = await fetch(
    `${BASE44_API_URL}/apps/${BASE44_APP_ID}/entities/BundleAnalytic?bundle_id=${bundleId}&date=${date}`,
    {
      headers: {
        'Authorization': `Bearer ${Deno.env.get('BASE44_SERVICE_KEY')}`,
      },
    }
  )

  let analytic
  if (response.ok) {
    const analytics = await response.json()
    analytic = analytics[0]
  }

  if (analytic) {
    // Update existing
    await fetch(`${BASE44_API_URL}/apps/${BASE44_APP_ID}/entities/BundleAnalytic/${analytic.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('BASE44_SERVICE_KEY')}`,
      },
      body: JSON.stringify({
        conversions: (analytic.conversions || 0) + 1,
      }),
    })
  } else {
    // Create new
    await fetch(`${BASE44_API_URL}/apps/${BASE44_APP_ID}/entities/BundleAnalytic`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('BASE44_SERVICE_KEY')}`,
      },
      body: JSON.stringify({
        bundle_id: bundleId,
        shop_id: shopId,
        views: 0,
        clicks: 0,
        conversions: 1,
        revenue: 0,
        date,
      }),
    })
  }
}

async function updateBundleStats(bundleId: string, orderTotal: number): Promise<void> {
  // Get bundle
  const response = await fetch(
    `${BASE44_API_URL}/apps/${BASE44_APP_ID}/entities/Bundle/${bundleId}`,
    {
      headers: {
        'Authorization': `Bearer ${Deno.env.get('BASE44_SERVICE_KEY')}`,
      },
    }
  )

  if (response.ok) {
    const bundle = await response.json()
    
    // Update bundle stats
    await fetch(`${BASE44_API_URL}/apps/${BASE44_APP_ID}/entities/Bundle/${bundleId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('BASE44_SERVICE_KEY')}`,
      },
      body: JSON.stringify({
        total_sales: (bundle.total_sales || 0) + 1,
        total_revenue: (bundle.total_revenue || 0) + orderTotal,
      }),
    })
  }
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  try {
    const body = await req.text()
    
    // Verify webhook
    const isValid = await verifyWebhook(req, body)
    if (!isValid) {
      return new Response('Invalid webhook signature', { status: 403 })
    }

    const orderData = JSON.parse(body)
    const shop = req.headers.get('X-Shopify-Shop-Domain')
    
    if (!shop) {
      return new Response('Missing shop domain', { status: 400 })
    }

    // Check if order contains bundle items (you'd need to add custom metadata to identify bundles)
    // For now, we'll check line item properties or tags
    const bundleItems = orderData.line_items?.filter((item: any) => 
      item.properties?.some((prop: any) => prop.name === '_bundle_id')
    ) || []

    if (bundleItems.length > 0) {
      const today = new Date().toISOString().split('T')[0]
      
      for (const item of bundleItems) {
        const bundleIdProp = item.properties.find((p: any) => p.name === '_bundle_id')
        if (bundleIdProp) {
          const bundleId = bundleIdProp.value
          
          // Create bundle order record
          await createBundleOrder(bundleId, shop, orderData)
          
          // Update analytics
          await updateBundleAnalytics(bundleId, shop, today)
          
          // Update bundle stats
          await updateBundleStats(bundleId, parseFloat(orderData.total_price || '0'))
        }
      }
    }

    return new Response('OK', { status: 200 })
  } catch (error) {
    console.error('Webhook processing error:', error)
    return new Response('Internal server error', { status: 500 })
  }
}
