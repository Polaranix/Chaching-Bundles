// Deno Deploy function for Shopify OAuth
// Deploy this to Deno Deploy and update VITE_FUNCTIONS_URL

const SHOPIFY_API_KEY = Deno.env.get('SHOPIFY_API_KEY') || 'f46bfa51cac1655c64182e297c27edaa'
const SHOPIFY_API_SECRET = Deno.env.get('SHOPIFY_API_SECRET') || ''
const BASE44_API_URL = Deno.env.get('BASE44_API_URL') || 'https://api.base44.com'
const BASE44_APP_ID = Deno.env.get('BASE44_APP_ID') || '68d87fcee669d830cce9b999'
const APP_URL = Deno.env.get('APP_URL') || 'http://localhost:3000'

interface ShopifyAccessTokenResponse {
  access_token: string
  scope: string
}

async function verifyHmac(query: URLSearchParams): Promise<boolean> {
  const hmac = query.get('hmac')
  if (!hmac) return false

  const params = new URLSearchParams(query)
  params.delete('hmac')
  params.delete('signature')
  
  const message = Array.from(params.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join('&')

  const encoder = new TextEncoder()
  const keyData = encoder.encode(SHOPIFY_API_SECRET)
  const messageData = encoder.encode(message)
  
  const key = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  
  const signature = await crypto.subtle.sign('HMAC', key, messageData)
  const hashArray = Array.from(new Uint8Array(signature))
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  
  return hashHex === hmac
}

async function exchangeCodeForToken(shop: string, code: string): Promise<string | null> {
  const response = await fetch(`https://${shop}/admin/oauth/access_token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      client_id: SHOPIFY_API_KEY,
      client_secret: SHOPIFY_API_SECRET,
      code,
    }),
  })

  if (!response.ok) {
    console.error('Failed to exchange code for token:', await response.text())
    return null
  }

  const data: ShopifyAccessTokenResponse = await response.json()
  return data.access_token
}

async function createOrUpdateShop(shop: string, accessToken: string, scopes: string, retries = 5): Promise<any> {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(`${BASE44_API_URL}/apps/${BASE44_APP_ID}/entities/Shop`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Deno.env.get('BASE44_SERVICE_KEY')}`,
        },
        body: JSON.stringify({
          shop_name: shop,
          access_token: accessToken,
          scopes,
          installed_at: new Date().toISOString(),
        }),
      })

      if (response.ok) {
        return await response.json()
      }

      if (i < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, 500))
      }
    } catch (error) {
      console.error(`Attempt ${i + 1} failed:`, error)
      if (i < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, 500))
      }
    }
  }
  throw new Error('Failed to create shop after retries')
}

async function createOrUpdateUser(shop: string, email: string, retries = 5): Promise<any> {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(`${BASE44_API_URL}/apps/${BASE44_APP_ID}/entities/User`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Deno.env.get('BASE44_SERVICE_KEY')}`,
        },
        body: JSON.stringify({
          email,
          full_name: shop.split('.')[0],
          role: 'admin',
          has_completed_onboarding: false,
          shop_domain: shop,
        }),
      })

      if (response.ok) {
        return await response.json()
      }

      if (i < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, 500))
      }
    } catch (error) {
      console.error(`Attempt ${i + 1} failed:`, error)
      if (i < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, 500))
      }
    }
  }
  throw new Error('Failed to create user after retries')
}

async function generateAuthToken(userId: string): Promise<string> {
  // In a real implementation, this would generate a JWT or session token
  // For now, we'll use a simple token
  return `base44_${userId}_${Date.now()}`
}

export default async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url)
  const params = url.searchParams

  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  }

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers })
  }

  try {
    const shop = params.get('shop')
    const code = params.get('code')
    const isCallback = params.get('callback') === '1'

    if (!shop) {
      return new Response(JSON.stringify({ error: 'Missing shop parameter' }), {
        status: 400,
        headers: { ...headers, 'Content-Type': 'application/json' },
      })
    }

    // If this is the OAuth callback
    if (isCallback && code) {
      // Verify HMAC
      const isValid = await verifyHmac(params)
      if (!isValid) {
        return new Response(JSON.stringify({ error: 'Invalid HMAC signature' }), {
          status: 403,
          headers: { ...headers, 'Content-Type': 'application/json' },
        })
      }

      // Exchange code for access token
      const accessToken = await exchangeCodeForToken(shop, code)
      if (!accessToken) {
        return new Response(JSON.stringify({ error: 'Failed to get access token' }), {
          status: 500,
          headers: { ...headers, 'Content-Type': 'application/json' },
        })
      }

      // Save shop to database
      await createOrUpdateShop(shop, accessToken, params.get('scope') || '')

      // Create/update user
      const user = await createOrUpdateUser(shop, `admin@${shop}`)

      // Generate auth token
      const authToken = await generateAuthToken(user.id)

      // Redirect back to app with token
      const redirectUrl = `${APP_URL}/?token=${authToken}`
      
      return new Response(null, {
        status: 302,
        headers: {
          ...headers,
          'Location': redirectUrl,
        },
      })
    }

    // If not a callback, return error
    return new Response(JSON.stringify({ error: 'Invalid request' }), {
      status: 400,
      headers: { ...headers, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('OAuth error:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...headers, 'Content-Type': 'application/json' },
    })
  }
}
