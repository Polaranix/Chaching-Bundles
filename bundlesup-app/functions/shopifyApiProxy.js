// Shopify API Proxy
// Proxies GraphQL and REST API calls to Shopify with shop access token

const BASE44_APP_ID = Deno.env.get('BASE44_APP_ID') || '68d87fcee669d830cce9b999';

// Fetch shop access token from database with retry logic
async function getShopAccessToken(shopDomain, retries = 5) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(
        `https://api.base44.com/v1/apps/${BASE44_APP_ID}/entities/Shop?filter[shop_name]=${shopDomain}`,
        {
          headers: {
            'Authorization': `Bearer ${Deno.env.get('BASE44_SERVICE_KEY')}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.data && data.data.length > 0) {
          return data.data[0].access_token;
        }
      }

      if (i < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  throw new Error('Shop not found or access token unavailable');
}

// Handle GraphQL requests
async function handleGraphQL(shop, accessToken, query, variables) {
  const response = await fetch(`https://${shop}/admin/api/2024-01/graphql.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': accessToken,
    },
    body: JSON.stringify({
      query,
      variables,
    }),
  });

  if (!response.ok) {
    throw new Error(`GraphQL request failed: ${response.statusText}`);
  }

  return await response.json();
}

// Handle REST API requests
async function handleREST(shop, accessToken, endpoint, method = 'GET', body = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': accessToken,
    },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`https://${shop}/admin/api/2024-01/${endpoint}`, options);

  if (!response.ok) {
    throw new Error(`REST request failed: ${response.statusText}`);
  }

  return await response.json();
}

// Main handler
export default async function handler(req) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }

  try {
    const body = await req.json();
    const { shop, type, query, variables, endpoint, method, data } = body;

    if (!shop) {
      return new Response(JSON.stringify({ error: 'Shop parameter is required' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    // Get shop access token
    const accessToken = await getShopAccessToken(shop);

    let result;

    if (type === 'graphql') {
      // Handle GraphQL request
      result = await handleGraphQL(shop, accessToken, query, variables);
    } else if (type === 'rest') {
      // Handle REST API request
      result = await handleREST(shop, accessToken, endpoint, method, data);
    } else {
      throw new Error('Invalid request type. Must be "graphql" or "rest"');
    }

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });

  } catch (error) {
    console.error('API Proxy error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
}
