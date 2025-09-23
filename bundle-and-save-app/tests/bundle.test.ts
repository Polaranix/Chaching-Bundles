import { describe, it, expect, beforeEach } from 'vitest'
import { prisma } from '../app/lib/prisma.server'
import { validateBundle } from '../app/lib/validate'
import { trackEvent, getBundleAnalytics } from '../app/lib/analytics.server'

describe('Bundle Validation', () => {
  it('should validate a valid fixed bundle', () => {
    const bundleData = {
      title: 'Test Bundle',
      type: 'FIXED' as const,
      discountType: 'PERCENT' as const,
      discountValue: 20,
      items: [
        {
          productGid: 'gid://shopify/Product/1',
          variantGid: 'gid://shopify/ProductVariant/1',
          quantity: 1,
        },
        {
          productGid: 'gid://shopify/Product/2',
          variantGid: 'gid://shopify/ProductVariant/2',
          quantity: 1,
        },
      ],
    }

    const result = validateBundle(bundleData)
    expect(result.success).toBe(true)
  })

  it('should validate a valid mix & match bundle', () => {
    const bundleData = {
      title: 'Mix & Match Bundle',
      type: 'MIX_MATCH' as const,
      discountType: 'AMOUNT' as const,
      discountValue: 5.00,
      minQty: 2,
      items: [
        {
          productGid: 'gid://shopify/Product/1',
          variantGid: 'gid://shopify/ProductVariant/1',
          quantity: 1,
        },
        {
          productGid: 'gid://shopify/Product/2',
          variantGid: 'gid://shopify/ProductVariant/2',
          quantity: 1,
        },
        {
          productGid: 'gid://shopify/Product/3',
          variantGid: 'gid://shopify/ProductVariant/3',
          quantity: 1,
        },
      ],
    }

    const result = validateBundle(bundleData)
    expect(result.success).toBe(true)
  })

  it('should reject bundle with insufficient items', () => {
    const bundleData = {
      title: 'Invalid Bundle',
      type: 'FIXED' as const,
      discountType: 'PERCENT' as const,
      discountValue: 20,
      items: [
        {
          productGid: 'gid://shopify/Product/1',
          variantGid: 'gid://shopify/ProductVariant/1',
          quantity: 1,
        },
      ],
    }

    const result = validateBundle(bundleData)
    expect(result.success).toBe(false)
    expect(result.errors).toContain('Bundle must have at least 2 items')
  })

  it('should reject invalid discount percentage', () => {
    const bundleData = {
      title: 'Invalid Discount Bundle',
      type: 'FIXED' as const,
      discountType: 'PERCENT' as const,
      discountValue: 95, // Invalid: over 90%
      items: [
        {
          productGid: 'gid://shopify/Product/1',
          variantGid: 'gid://shopify/ProductVariant/1',
          quantity: 1,
        },
        {
          productGid: 'gid://shopify/Product/2',
          variantGid: 'gid://shopify/ProductVariant/2',
          quantity: 1,
        },
      ],
    }

    const result = validateBundle(bundleData)
    expect(result.success).toBe(false)
    expect(result.errors).toContain('Percent discount must be between 1% and 90%')
  })

  it('should reject mix & match bundle without minQty', () => {
    const bundleData = {
      title: 'Invalid Mix & Match',
      type: 'MIX_MATCH' as const,
      discountType: 'PERCENT' as const,
      discountValue: 20,
      // minQty is missing
      items: [
        {
          productGid: 'gid://shopify/Product/1',
          variantGid: 'gid://shopify/ProductVariant/1',
          quantity: 1,
        },
        {
          productGid: 'gid://shopify/Product/2',
          variantGid: 'gid://shopify/ProductVariant/2',
          quantity: 1,
        },
      ],
    }

    const result = validateBundle(bundleData)
    expect(result.success).toBe(false)
    expect(result.errors).toContain('Mix & Match bundles require a minimum quantity')
  })
})

describe('Bundle Database Operations', () => {
  beforeEach(async () => {
    // Create a test shop
    await prisma.shop.create({
      data: {
        id: 'test-shop.myshopify.com',
        domain: 'test-shop.myshopify.com',
        plan: 'FREE',
      },
    })
  })

  it('should create a bundle with items', async () => {
    const bundle = await prisma.bundle.create({
      data: {
        shopId: 'test-shop.myshopify.com',
        title: 'Test Bundle',
        type: 'FIXED',
        discountType: 'PERCENT',
        discountValue: 20,
        status: 'ACTIVE',
        items: {
          create: [
            {
              productGid: 'gid://shopify/Product/1',
              variantGid: 'gid://shopify/ProductVariant/1',
              quantity: 1,
            },
            {
              productGid: 'gid://shopify/Product/2',
              variantGid: 'gid://shopify/ProductVariant/2',
              quantity: 1,
            },
          ],
        },
      },
      include: {
        items: true,
      },
    })

    expect(bundle.title).toBe('Test Bundle')
    expect(bundle.items).toHaveLength(2)
    expect(bundle.items[0].productGid).toBe('gid://shopify/Product/1')
  })

  it('should enforce shop relationship', async () => {
    await expect(
      prisma.bundle.create({
        data: {
          shopId: 'nonexistent-shop.myshopify.com',
          title: 'Test Bundle',
          type: 'FIXED',
          discountType: 'PERCENT',
          discountValue: 20,
        },
      })
    ).rejects.toThrow()
  })
})

describe('Bundle Analytics', () => {
  beforeEach(async () => {
    await prisma.shop.create({
      data: {
        id: 'test-shop.myshopify.com',
        domain: 'test-shop.myshopify.com',
        plan: 'FREE',
      },
    })

    await prisma.bundle.create({
      data: {
        id: 'test-bundle-1',
        shopId: 'test-shop.myshopify.com',
        title: 'Test Bundle',
        type: 'FIXED',
        discountType: 'PERCENT',
        discountValue: 20,
        status: 'ACTIVE',
      },
    })
  })

  it('should track analytics events', async () => {
    await trackEvent({
      shop: 'test-shop.myshopify.com',
      bundleId: 'test-bundle-1',
      event: 'impression',
    })

    await trackEvent({
      shop: 'test-shop.myshopify.com',
      bundleId: 'test-bundle-1',
      event: 'impression',
    })

    await trackEvent({
      shop: 'test-shop.myshopify.com',
      bundleId: 'test-bundle-1',
      event: 'click',
    })

    const analytics = await getBundleAnalytics('test-shop.myshopify.com', 'test-bundle-1')
    
    expect(analytics.impressions).toBe(2)
    expect(analytics.clicks).toBe(1)
    expect(analytics.orders).toBe(0)
  })

  it('should calculate conversion rate correctly', async () => {
    // Track 10 impressions
    for (let i = 0; i < 10; i++) {
      await trackEvent({
        shop: 'test-shop.myshopify.com',
        bundleId: 'test-bundle-1',
        event: 'impression',
      })
    }

    // Track 2 orders
    for (let i = 0; i < 2; i++) {
      await trackEvent({
        shop: 'test-shop.myshopify.com',
        bundleId: 'test-bundle-1',
        event: 'order',
      })
    }

    const analytics = await getBundleAnalytics('test-shop.myshopify.com', 'test-bundle-1')
    
    expect(analytics.impressions).toBe(10)
    expect(analytics.orders).toBe(2)
    expect(analytics.conversionRate).toBe(20) // 2/10 * 100 = 20%
  })
})
