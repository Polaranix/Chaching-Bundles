// Shopify OAuth Authentication Handler
// Handles OAuth callback from Shopify and exchanges code for access_token

const SHOPIFY_API_KEY = Deno.env.get('SHOPIFY_API_KEY') || 'f46bfa51cac1655c64182e297c27edaa';
const SHOPIFY_API_SECRET = Deno.env.get('SHOPIFY_API_SECRET');
const APP_URL = Deno.env.get('APP_URL') || 'http://localhost:5173';
const BASE44_APP_ID = Deno.env.get('BASE44_APP_ID') || '68d87fcee669d830cce9b999';

// HMAC validation
async function validateHmac(query, hmac) {
  const message = Object.keys(query)
    .filter(key => key !== 'hmac')
    .sort()
    .map(key => `${key}=${query[key]}`)
    .join('&');

  const encoder = new TextEncoder();
  const keyData = encoder.encode(SHOPIFY_API_SECRET);
  const messageData = encoder.encode(message);

  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign('HMAC', cryptoKey, messageData);
  const hashArray = Array.from(new Uint8Array(signature));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

  return hashHex === hmac;
}

// Exchange OAuth code for access token
async function exchangeToken(shop, code) {
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
  });

  if (!response.ok) {
    throw new Error('Token exchange failed');
  }

  return await response.json();
}

// Save shop to database with retry logic
async function saveShop(shopData, retries = 5) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(`https://api.base44.com/v1/apps/${BASE44_APP_ID}/entities/Shop`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Deno.env.get('BASE44_SERVICE_KEY')}`,
        },
        body: JSON.stringify(shopData),
      });

      if (response.ok) {
        return await response.json();
      }

      if (i < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  throw new Error('Failed to save shop after retries');
}

// Create or get user
async function createOrGetUser(email, shopId, shopDomain) {
  const response = await fetch(`https://api.base44.com/v1/apps/${BASE44_APP_ID}/entities/User`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${Deno.env.get('BASE44_SERVICE_KEY')}`,
    },
    body: JSON.stringify({
      email,
      shop_id: shopId,
      shop_domain: shopDomain,
      role: 'admin',
      has_completed_onboarding: false,
    }),
  });

  return await response.json();
}

// Generate Base44 auth token
async function generateAuthToken(userId) {
  const response = await fetch(`https://api.base44.com/v1/apps/${BASE44_APP_ID}/auth/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${Deno.env.get('BASE44_SERVICE_KEY')}`,
    },
    body: JSON.stringify({
      user_id: userId,
    }),
  });

  const data = await response.json();
  return data.token;
}

// Main handler
export default async function handler(req) {
  const url = new URL(req.url);
  const params = Object.fromEntries(url.searchParams);

  // Check if this is OAuth callback
  if (!params.callback) {
    // Initiate OAuth flow
    const shop = params.shop;
    if (!shop) {
      return new Response('Missing shop parameter', { status: 400 });
    }

    const scopes = 'read_products,write_products,read_product_listings,read_discounts,write_discounts';
    const redirectUri = `${APP_URL}/functions/shopifyAuth?callback=1`;
    const authUrl = `https://${shop}/admin/oauth/authorize?client_id=${SHOPIFY_API_KEY}&scope=${scopes}&redirect_uri=${redirectUri}`;

    return new Response(null, {
      status: 302,
      headers: {
        'Location': authUrl,
      },
    });
  }

  // Handle OAuth callback
  const { shop, code, hmac } = params;

  if (!shop || !code || !hmac) {
    return new Response('Missing required parameters', { status: 400 });
  }

  // Validate HMAC
  const isValid = await validateHmac(params, hmac);
  if (!isValid) {
    return new Response('Invalid HMAC signature', { status: 403 });
  }

  try {
    // Exchange code for access token
    const tokenData = await exchangeToken(shop, code);

    // Save shop to database
    const shopData = {
      shop_name: shop,
      access_token: tokenData.access_token,
      scopes: tokenData.scope,
      installed_at: new Date().toISOString(),
    };

    const savedShop = await saveShop(shopData);

    // Create user
    const email = `admin@${shop}`;
    const user = await createOrGetUser(email, savedShop.id, shop);

    // Generate auth token
    const authToken = await generateAuthToken(user.id);

    // Redirect to app with token
    const redirectUrl = `${APP_URL}?token=${authToken}&shop=${shop}`;

    // Use iframe breakout to prevent embedding issues
    return new Response(`
      <!DOCTYPE html>
      <html>
        <head>
          <script>
            if (window.top !== window.self) {
              window.top.location.href = "${redirectUrl}";
            } else {
              window.location.href = "${redirectUrl}";
            }
          </script>
        </head>
        <body>
          <p>Redirecting...</p>
        </body>
      </html>
    `, {
      status: 200,
      headers: {
        'Content-Type': 'text/html',
      },
    });

  } catch (error) {
    console.error('OAuth error:', error);
    return new Response(`Authentication failed: ${error.message}`, { status: 500 });
  }
}
