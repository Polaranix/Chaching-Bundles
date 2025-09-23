import { LATEST_API_VERSION } from '@shopify/shopify-app-remix/server'
import { restResources } from '@shopify/shopify-api/rest/admin/2023-10'
import { shopifyApp } from '@shopify/shopify-app-remix/server'
import { PrismaSessionStorage } from '@shopify/shopify-app-session-storage-prisma'
import { prisma } from './prisma.server'
import { logInfo, logError } from './logger.server'

const prismaSessionStorage = new PrismaSessionStorage(prisma)

export const shopify = shopifyApp({
  apiKey: process.env.SHOPIFY_API_KEY!,
  apiSecretKey: process.env.SHOPIFY_API_SECRET!,
  appUrl: process.env.APP_URL!,
  scopes: process.env.SCOPES?.split(',') || [],
  sessionStorage: prismaSessionStorage,
  restResources,
  hooks: {
    afterAuth: async ({ session }) => {
      logInfo('Shop authenticated', { shop: session.shop })
      
      // Upsert shop record
      await prisma.shop.upsert({
        where: { id: session.shop },
        create: {
          id: session.shop,
          domain: session.shop,
          plan: 'FREE',
        },
        update: {
          domain: session.shop,
        },
      })
    },
  },
})

export const authenticate = {
  admin: shopify.authenticate.admin,
  webhook: shopify.authenticate.webhook,
  public: shopify.authenticate.public,
}

// Helper function to get shop from request
export async function getShopFromRequest(request: Request) {
  try {
    const { session } = await authenticate.admin(request)
    
    const shop = await prisma.shop.findUnique({
      where: { id: session.shop },
      include: {
        bundles: {
          include: {
            items: true,
          },
        },
      },
    })
    
    if (!shop) {
      throw new Error(`Shop ${session.shop} not found`)
    }
    
    return { shop, session }
  } catch (error) {
    logError('Failed to get shop from request', error as Error)
    throw error
  }
}

// Helper function to verify webhook
export function verifyWebhook(rawBody: string, signature: string): boolean {
  const crypto = require('crypto')
  const hmac = crypto.createHmac('sha256', process.env.SHOPIFY_API_SECRET!)
  const body = hmac.update(rawBody, 'utf8').digest('base64')
  
  return body === signature
}

// GraphQL mutation templates
export const CREATE_HIDDEN_PRODUCT_MUTATION = `
  mutation CreateBundleProduct($input: ProductInput!) {
    productCreate(input: $input) {
      product {
        id
        title
        status
        tags
      }
      userErrors {
        field
        message
      }
    }
  }
`

export const UPDATE_PRODUCT_STATUS_MUTATION = `
  mutation UpdateProductStatus($input: ProductInput!) {
    productUpdate(input: $input) {
      product {
        id
        status
      }
      userErrors {
        field
        message
      }
    }
  }
`

export const GET_PRODUCT_QUERY = `
  query GetProduct($id: ID!) {
    product(id: $id) {
      id
      title
      status
      variants(first: 10) {
        edges {
          node {
            id
            title
            inventoryQuantity
            availableForSale
          }
        }
      }
    }
  }
`

// Helper to create hidden bundle product
export async function createHiddenBundleProduct(
  session: any,
  bundleTitle: string,
  bundleId: string
): Promise<string | null> {
  try {
    const client = new shopify.clients.Graphql({ session })
    
    const response = await client.query({
      data: {
        query: CREATE_HIDDEN_PRODUCT_MUTATION,
        variables: {
          input: {
            title: `Bundle: ${bundleTitle}`,
            status: 'DRAFT',
            published: false,
            tags: ['bundle-hidden', `bundle-id:${bundleId}`],
            variants: [{
              price: '0.00',
              inventoryPolicy: 'DENY',
              inventoryManagement: 'SHOPIFY',
              inventoryQuantity: 999,
            }],
          },
        },
      },
    })
    
    const { productCreate } = response.body.data
    
    if (productCreate.userErrors.length > 0) {
      logError('Failed to create hidden product', undefined, {
        errors: productCreate.userErrors,
      })
      return null
    }
    
    return productCreate.product.id
  } catch (error) {
    logError('Error creating hidden bundle product', error as Error)
    return null
  }
}
