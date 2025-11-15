// Shopify Webhook Handler for Order Tracking
// Processes order events and updates bundle analytics

const SHOPIFY_API_SECRET = Deno.env.get('SHOPIFY_API_SECRET');
const BASE44_APP_ID = Deno.env.get('BASE44_APP_ID') || '68d87fcee669d830cce9b999';

// Verify Shopify webhook HMAC
async function verifyWebhook(body, hmac) {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(SHOPIFY_API_SECRET);
  const messageData = encoder.encode(body);

  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign('HMAC', cryptoKey, messageData);
  const base64Signature = btoa(String.fromCharCode(...new Uint8Array(signature)));

  return base64Signature === hmac;
}

// Get shop by domain
async function getShop(shopDomain) {
  const response = await fetch(
    `https://api.base44.com/v1/apps/${BASE44_APP_ID}/entities/Shop?filter[shop_name]=${shopDomain}`,
    {
      headers: {
        'Authorization': `Bearer ${Deno.env.get('BASE44_SERVICE_KEY')}`,
      },
    }
  );

  const data = await response.json();
  return data.data && data.data.length > 0 ? data.data[0] : null;
}

// Check if order contains bundle products (identified by line item properties or tags)
function extractBundleInfo(order) {
  const bundles = [];

  for (const lineItem of order.line_items) {
    // Check for bundle properties
    const bundleProperty = lineItem.properties?.find(p => p.name === '_bundle_id');

    if (bundleProperty) {
      const bundleId = bundleProperty.value;
      const existing = bundles.find(b => b.bundle_id === bundleId);

      if (existing) {
        existing.total_amount += parseFloat(lineItem.price) * lineItem.quantity;
        existing.items_count += lineItem.quantity;
      } else {
        bundles.push({
          bundle_id: bundleId,
          total_amount: parseFloat(lineItem.price) * lineItem.quantity,
          items_count: lineItem.quantity,
          discount_amount: lineItem.total_discount ? parseFloat(lineItem.total_discount) : 0,
        });
      }
    }
  }

  return bundles;
}

// Create bundle order record
async function createBundleOrder(orderData) {
  const response = await fetch(`https://api.base44.com/v1/apps/${BASE44_APP_ID}/entities/BundleOrder`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${Deno.env.get('BASE44_SERVICE_KEY')}`,
    },
    body: JSON.stringify(orderData),
  });

  return await response.json();
}

// Update bundle analytics
async function updateBundleAnalytics(bundleId, shopId, revenue) {
  const today = new Date().toISOString().split('T')[0];

  // Get or create today's analytics record
  const response = await fetch(
    `https://api.base44.com/v1/apps/${BASE44_APP_ID}/entities/BundleAnalytic?filter[bundle_id]=${bundleId}&filter[date]=${today}`,
    {
      headers: {
        'Authorization': `Bearer ${Deno.env.get('BASE44_SERVICE_KEY')}`,
      },
    }
  );

  const data = await response.json();

  if (data.data && data.data.length > 0) {
    // Update existing record
    const record = data.data[0];
    await fetch(`https://api.base44.com/v1/apps/${BASE44_APP_ID}/entities/BundleAnalytic/${record.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('BASE44_SERVICE_KEY')}`,
      },
      body: JSON.stringify({
        conversions: record.conversions + 1,
        revenue: record.revenue + revenue,
      }),
    });
  } else {
    // Create new record
    await fetch(`https://api.base44.com/v1/apps/${BASE44_APP_ID}/entities/BundleAnalytic`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('BASE44_SERVICE_KEY')}`,
      },
      body: JSON.stringify({
        bundle_id: bundleId,
        shop_id: shopId,
        conversions: 1,
        revenue: revenue,
        views: 0,
        clicks: 0,
        date: today,
      }),
    });
  }
}

// Update bundle aggregate stats
async function updateBundleStats(bundleId, revenue) {
  // Get current bundle
  const response = await fetch(`https://api.base44.com/v1/apps/${BASE44_APP_ID}/entities/Bundle/${bundleId}`, {
    headers: {
      'Authorization': `Bearer ${Deno.env.get('BASE44_SERVICE_KEY')}`,
    },
  });

  const bundle = await response.json();

  // Update stats
  await fetch(`https://api.base44.com/v1/apps/${BASE44_APP_ID}/entities/Bundle/${bundleId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${Deno.env.get('BASE44_SERVICE_KEY')}`,
    },
    body: JSON.stringify({
      total_sales: (bundle.total_sales || 0) + 1,
      total_revenue: (bundle.total_revenue || 0) + revenue,
    }),
  });
}

// Main handler
export default async function handler(req) {
  // Verify webhook signature
  const hmac = req.headers.get('X-Shopify-Hmac-Sha256');
  const shopDomain = req.headers.get('X-Shopify-Shop-Domain');

  if (!hmac || !shopDomain) {
    return new Response('Missing required headers', { status: 400 });
  }

  const body = await req.text();
  const isValid = await verifyWebhook(body, hmac);

  if (!isValid) {
    return new Response('Invalid webhook signature', { status: 403 });
  }

  try {
    const order = JSON.parse(body);

    // Get shop
    const shop = await getShop(shopDomain);
    if (!shop) {
      console.error('Shop not found:', shopDomain);
      return new Response('Shop not found', { status: 404 });
    }

    // Extract bundle information from order
    const bundles = extractBundleInfo(order);

    // Process each bundle in the order
    for (const bundle of bundles) {
      // Create bundle order record
      await createBundleOrder({
        bundle_id: bundle.bundle_id,
        shop_id: shop.id,
        order_id: order.id.toString(),
        discount_amount: bundle.discount_amount,
        total_amount: bundle.total_amount,
        items_count: bundle.items_count,
      });

      // Update analytics
      await updateBundleAnalytics(bundle.bundle_id, shop.id, bundle.total_amount);

      // Update bundle stats
      await updateBundleStats(bundle.bundle_id, bundle.total_amount);
    }

    return new Response(JSON.stringify({ success: true, processed: bundles.length }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });

  } catch (error) {
    console.error('Webhook processing error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}
