import type { ActionFunctionArgs } from '@remix-run/node'
import { authenticate } from '~/shopify.server'
import {
  handleProductUpdate,
  handleInventoryUpdate,
  handleOrderCreate,
} from '~/lib/webhooks.server'
import { handleSubscriptionUpdate } from '~/lib/billing.server'
import { logError, logInfo } from '~/lib/logger.server'

export const action = async ({ request }: ActionFunctionArgs) => {
  try {
    const { topic, shop, session, payload } = await authenticate.webhook(request)
    
    logInfo('Webhook received', {
      topic,
      shop,
      hasPayload: !!payload,
    })
    
    switch (topic) {
      case 'PRODUCTS_UPDATE':
        await handleProductUpdate(shop, payload)
        break
        
      case 'INVENTORY_LEVELS_UPDATE':
        await handleInventoryUpdate(shop, payload)
        break
        
      case 'ORDERS_CREATE':
        await handleOrderCreate(shop, payload)
        break
        
      case 'APP_SUBSCRIPTIONS_UPDATE':
        await handleSubscriptionUpdate(shop, payload)
        break
        
      default:
        logInfo('Unhandled webhook topic', { topic, shop })
    }
    
    return new Response('OK', { status: 200 })
  } catch (error) {
    logError('Webhook processing failed', error as Error, {
      url: request.url,
      method: request.method,
    })
    
    return new Response('Internal Server Error', { status: 500 })
  }
}
