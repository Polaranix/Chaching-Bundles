import { authenticate } from './shopify.server'
import { prisma } from './prisma.server'
import { logError, logInfo } from './logger.server'

export interface BillingConfig {
  price: number
  trialDays: number
  planName: string
}

export const BILLING_CONFIG: BillingConfig = {
  price: parseFloat(process.env.BILLING_PRICE || '9.99'),
  trialDays: parseInt(process.env.BILLING_TRIAL_DAYS || '7'),
  planName: 'Bundle & Save Pro',
}

// Check if shop has active subscription
export async function hasActiveSubscription(shopId: string): Promise<boolean> {
  try {
    const shop = await prisma.shop.findUnique({
      where: { id: shopId },
    })
    
    return shop?.plan === 'PRO'
  } catch (error) {
    logError('Failed to check subscription status', error as Error, { shopId })
    return false
  }
}

// Check if shop can create more bundles (Free plan limit)
export async function canCreateBundle(shopId: string): Promise<boolean> {
  try {
    const shop = await prisma.shop.findUnique({
      where: { id: shopId },
      include: {
        bundles: {
          where: { status: 'ACTIVE' },
        },
      },
    })
    
    if (!shop) {
      return false
    }
    
    // Pro plan has unlimited bundles
    if (shop.plan === 'PRO') {
      return true
    }
    
    // Free plan limited to 1 active bundle
    return shop.bundles.length < 1
  } catch (error) {
    logError('Failed to check bundle creation limit', error as Error, { shopId })
    return false
  }
}

// Create billing subscription
export async function createSubscription(
  session: any
): Promise<{ success: boolean; subscriptionUrl?: string; error?: string }> {
  try {
    const client = new (await import('@shopify/shopify-app-remix/server')).shopify.clients.Graphql({ session })
    
    const mutation = `
      mutation AppSubscriptionCreate($name: String!, $lineItems: [AppSubscriptionLineItemInput!]!, $trialDays: Int, $test: Boolean) {
        appSubscriptionCreate(name: $name, lineItems: $lineItems, trialDays: $trialDays, test: $test) {
          appSubscription {
            id
            status
          }
          confirmationUrl
          userErrors {
            field
            message
          }
        }
      }
    `
    
    const response = await client.query({
      data: {
        query: mutation,
        variables: {
          name: BILLING_CONFIG.planName,
          lineItems: [
            {
              plan: {
                appRecurringPricingDetails: {
                  price: { amount: BILLING_CONFIG.price, currencyCode: 'USD' },
                  interval: 'EVERY_30_DAYS',
                },
              },
            },
          ],
          trialDays: BILLING_CONFIG.trialDays,
          test: process.env.NODE_ENV !== 'production',
        },
      },
    })
    
    const { appSubscriptionCreate } = response.body.data
    
    if (appSubscriptionCreate.userErrors.length > 0) {
      const error = appSubscriptionCreate.userErrors[0].message
      logError('Failed to create subscription', undefined, {
        errors: appSubscriptionCreate.userErrors,
      })
      return { success: false, error }
    }
    
    return {
      success: true,
      subscriptionUrl: appSubscriptionCreate.confirmationUrl,
    }
  } catch (error) {
    logError('Error creating subscription', error as Error)
    return {
      success: false,
      error: 'Failed to create subscription',
    }
  }
}

// Handle subscription webhook
export async function handleSubscriptionUpdate(
  shopDomain: string,
  subscriptionData: any
): Promise<void> {
  try {
    const isActive = subscriptionData.status === 'ACTIVE'
    const plan = isActive ? 'PRO' : 'FREE'
    
    await prisma.shop.update({
      where: { domain: shopDomain },
      data: { plan },
    })
    
    logInfo('Subscription status updated', {
      shop: shopDomain,
      plan,
      status: subscriptionData.status,
    })
    
    // If downgraded to free, disable extra bundles
    if (!isActive) {
      const bundles = await prisma.bundle.findMany({
        where: {
          shop: { domain: shopDomain },
          status: 'ACTIVE',
        },
        orderBy: { createdAt: 'asc' },
      })
      
      // Keep only the first bundle active
      if (bundles.length > 1) {
        const bundlesToDisable = bundles.slice(1)
        
        await prisma.bundle.updateMany({
          where: {
            id: { in: bundlesToDisable.map(b => b.id) },
          },
          data: { status: 'DRAFT' },
        })
        
        logInfo('Disabled extra bundles due to downgrade', {
          shop: shopDomain,
          disabledCount: bundlesToDisable.length,
        })
      }
    }
  } catch (error) {
    logError('Failed to handle subscription update', error as Error, {
      shopDomain,
      subscriptionData,
    })
  }
}

// Get current subscription status
export async function getSubscriptionStatus(
  session: any
): Promise<{
  hasActiveSubscription: boolean
  plan: 'FREE' | 'PRO'
  activeBundles: number
  maxBundles: number | null
}> {
  try {
    const shop = await prisma.shop.findUnique({
      where: { id: session.shop },
      include: {
        bundles: {
          where: { status: 'ACTIVE' },
        },
      },
    })
    
    if (!shop) {
      throw new Error('Shop not found')
    }
    
    return {
      hasActiveSubscription: shop.plan === 'PRO',
      plan: shop.plan,
      activeBundles: shop.bundles.length,
      maxBundles: shop.plan === 'PRO' ? null : 1,
    }
  } catch (error) {
    logError('Failed to get subscription status', error as Error, { shop: session.shop })
    return {
      hasActiveSubscription: false,
      plan: 'FREE',
      activeBundles: 0,
      maxBundles: 1,
    }
  }
}
