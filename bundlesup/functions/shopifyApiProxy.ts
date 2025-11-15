// Deno Deploy function for Shopify API proxy
// Deploy this to Deno Deploy and update VITE_FUNCTIONS_URL

const BASE44_API_URL = Deno.env.get('BASE44_API_URL') || 'https://api.base44.com'
const BASE44_APP_ID = Deno.env.get('BASE44_APP_ID') || '68d87fcee669d830cce9b999'

async function getShopAccessToken(shopDomain: string, retries = 5): Promise<string | null> {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(
        `${BASE44_API_URL}/apps/${BASE44_APP_ID}/entities/Shop?shop_name=${shopDomain}`,
        {
          headers: {
            'Authorization': `Bearer ${Deno.env.get('BASE44_SERVICE_KEY')}`,
          },
        }
      )

      if (response.ok) {
        const shops = await response.json()
        if (shops && shops.length > 0) {
          return shops[0].access_token
        }
      }

      if (i < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    } catch (error) {
      console.error(`Attempt ${i + 1} to get access token failed:`, error)
      if (i < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }
  }
  return null
}

async function makeGraphQLRequest(shop: string, accessToken: string, query: string, variables?: any): Promise<any> {
  const response = await fetch(`https://${shop}/admin/api/2023-10/graphql.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': accessToken,
    },
    body: JSON.stringify({ query, variables }),
  })

  if (!response.ok) {
    throw new Error(`GraphQL request failed: ${response.statusText}`)
  }

  const result = await response.json()
  
  if (result.errors) {
    throw new Error(`GraphQL errors: ${JSON.stringify(result.errors)}`)
  }

  return result.data
}

async function makeRestRequest(shop: string, accessToken: string, endpoint: string, method: string, data?: any): Promise<any> {
  const url = `https://${shop}/admin/api/2023-10/${endpoint}`
  
  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': accessToken,
    },
  }

  if (data && (method === 'POST' || method === 'PUT')) {
    options.body = JSON.stringify(data)
  }

  const response = await fetch(url, options)

  if (!response.ok) {
    throw new Error(`REST request failed: ${response.statusText}`)
  }

  return await response.json()
}

export default async function handler(req: Request): Promise<Response> {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  }

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers })
  }

  try {
    const body = await req.json()
    const { type, shop, query, variables, endpoint, method, data } = body

    if (!shop) {
      return new Response(JSON.stringify({ error: 'Missing shop parameter' }), {
        status: 400,
        headers: { ...headers, 'Content-Type': 'application/json' },
      })
    }

    // Get shop access token from database
    const accessToken = await getShopAccessToken(shop)
    if (!accessToken) {
      return new Response(JSON.stringify({ error: 'Shop not found or not authenticated' }), {
        status: 401,
        headers: { ...headers, 'Content-Type': 'application/json' },
      })
    }

    let result

    if (type === 'graphql') {
      if (!query) {
        return new Response(JSON.stringify({ error: 'Missing query parameter' }), {
          status: 400,
          headers: { ...headers, 'Content-Type': 'application/json' },
        })
      }
      result = await makeGraphQLRequest(shop, accessToken, query, variables)
    } else if (type === 'rest') {
      if (!endpoint) {
        return new Response(JSON.stringify({ error: 'Missing endpoint parameter' }), {
          status: 400,
          headers: { ...headers, 'Content-Type': 'application/json' },
        })
      }
      result = await makeRestRequest(shop, accessToken, endpoint, method || 'GET', data)
    } else {
      return new Response(JSON.stringify({ error: 'Invalid request type' }), {
        status: 400,
        headers: { ...headers, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...headers, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('API proxy error:', error)
    return new Response(JSON.stringify({ error: error.message || 'Internal server error' }), {
      status: 500,
      headers: { ...headers, 'Content-Type': 'application/json' },
    })
  }
}
