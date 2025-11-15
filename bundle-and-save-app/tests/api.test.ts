import { describe, it, expect, beforeEach } from 'vitest'
import { prisma } from '../functions/app/lib/prisma.server'

describe('API Endpoints', () => {
  let testShop: any

  beforeEach(async () => {
    // Create test shop
    testShop = await prisma.shop.create({
      data: {
        shop: 'test-shop.myshopify.com',
        accessToken: 'test-token',
        scope: 'read_products,write_products'
      }
    })
  })

  describe('Bundles API', () => {
    it('should create a bundle', async () => {
      const bundle = await prisma.bundle.create({
        data: {
          title: 'Summer Bundle',
          description: 'Perfect summer products',
          bundleType: 'FIXED',
          discountType: 'PERCENTAGE',
          discountValue: 20,
          status: 'ACTIVE',
          shopId: testShop.id
        }
      })

      expect(bundle.id).toBeDefined()
      expect(bundle.title).toBe('Summer Bundle')
      expect(bundle.bundleType).toBe('FIXED')
    })

    it('should fetch active bundles', async () => {
      // Create multiple bundles
      await prisma.bundle.createMany({
        data: [
          {
            title: 'Bundle 1',
            bundleType: 'FIXED',
            discountType: 'PERCENTAGE',
            discountValue: 10,
            status: 'ACTIVE',
            shopId: testShop.id
          },
          {
            title: 'Bundle 2',
            bundleType: 'MIX_MATCH',
            discountType: 'AMOUNT',
            discountValue: 5,
            status: 'ACTIVE',
            shopId: testShop.id
          },
          {
            title: 'Bundle 3',
            bundleType: 'FIXED',
            discountType: 'PERCENTAGE',
            discountValue: 15,
            status: 'DRAFT',
            shopId: testShop.id
          }
        ]
      })

      const activeBundles = await prisma.bundle.findMany({
        where: {
          shopId: testShop.id,
          status: 'ACTIVE'
        }
      })

      expect(activeBundles).toHaveLength(2)
      expect(activeBundles.every(b => b.status === 'ACTIVE')).toBe(true)
    })

    it('should update bundle status', async () => {
      const bundle = await prisma.bundle.create({
        data: {
          title: 'Test Bundle',
          bundleType: 'FIXED',
          discountType: 'PERCENTAGE',
          discountValue: 10,
          status: 'ACTIVE',
          shopId: testShop.id
        }
      })

      const updated = await prisma.bundle.update({
        where: { id: bundle.id },
        data: { status: 'PAUSED' }
      })

      expect(updated.status).toBe('PAUSED')
    })

    it('should delete bundle with cascade', async () => {
      const bundle = await prisma.bundle.create({
        data: {
          title: 'Test Bundle',
          bundleType: 'FIXED',
          discountType: 'PERCENTAGE',
          discountValue: 10,
          status: 'ACTIVE',
          shopId: testShop.id,
          items: {
            create: [
              {
                productId: 'gid://shopify/Product/123',
                variantId: 'gid://shopify/ProductVariant/456',
                quantity: 1,
                price: 29.99
              }
            ]
          }
        },
        include: { items: true }
      })

      expect(bundle.items).toHaveLength(1)

      await prisma.bundle.delete({
        where: { id: bundle.id }
      })

      const deleted = await prisma.bundle.findUnique({
        where: { id: bundle.id }
      })

      expect(deleted).toBeNull()

      // Check items are also deleted
      const items = await prisma.bundleItem.findMany({
        where: { bundleId: bundle.id }
      })

      expect(items).toHaveLength(0)
    })
  })

  describe('Bundle Items', () => {
    it('should add items to bundle', async () => {
      const bundle = await prisma.bundle.create({
        data: {
          title: 'Test Bundle',
          bundleType: 'FIXED',
          discountType: 'PERCENTAGE',
          discountValue: 10,
          status: 'ACTIVE',
          shopId: testShop.id
        }
      })

      await prisma.bundleItem.createMany({
        data: [
          {
            bundleId: bundle.id,
            productId: 'gid://shopify/Product/1',
            variantId: 'gid://shopify/ProductVariant/1',
            quantity: 1,
            price: 19.99
          },
          {
            bundleId: bundle.id,
            productId: 'gid://shopify/Product/2',
            variantId: 'gid://shopify/ProductVariant/2',
            quantity: 2,
            price: 29.99
          }
        ]
      })

      const items = await prisma.bundleItem.findMany({
        where: { bundleId: bundle.id }
      })

      expect(items).toHaveLength(2)
    })

    it('should calculate bundle total price', async () => {
      const bundle = await prisma.bundle.create({
        data: {
          title: 'Test Bundle',
          bundleType: 'FIXED',
          discountType: 'PERCENTAGE',
          discountValue: 20,
          status: 'ACTIVE',
          shopId: testShop.id,
          items: {
            create: [
              {
                productId: 'gid://shopify/Product/1',
                variantId: 'gid://shopify/ProductVariant/1',
                quantity: 1,
                price: 100
              },
              {
                productId: 'gid://shopify/Product/2',
                variantId: 'gid://shopify/ProductVariant/2',
                quantity: 1,
                price: 50
              }
            ]
          }
        },
        include: { items: true }
      })

      const totalOriginalPrice = bundle.items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      )

      expect(totalOriginalPrice).toBe(150)

      // With 20% discount
      const discountedPrice = totalOriginalPrice * 0.8
      expect(discountedPrice).toBe(120)
    })
  })

  describe('Bundle Metrics', () => {
    it('should track bundle views and conversions', async () => {
      const bundle = await prisma.bundle.create({
        data: {
          title: 'Test Bundle',
          bundleType: 'FIXED',
          discountType: 'PERCENTAGE',
          discountValue: 10,
          status: 'ACTIVE',
          shopId: testShop.id
        }
      })

      await prisma.bundleMetric.create({
        data: {
          bundleId: bundle.id,
          date: new Date(),
          views: 100,
          clicks: 50,
          conversions: 10,
          revenue: 500.00
        }
      })

      const metrics = await prisma.bundleMetric.findMany({
        where: { bundleId: bundle.id }
      })

      expect(metrics).toHaveLength(1)
      expect(metrics[0].views).toBe(100)
      expect(metrics[0].conversions).toBe(10)

      // Calculate conversion rate
      const conversionRate = (metrics[0].conversions / metrics[0].views) * 100
      expect(conversionRate).toBe(10)
    })

    it('should aggregate metrics across dates', async () => {
      const bundle = await prisma.bundle.create({
        data: {
          title: 'Test Bundle',
          bundleType: 'FIXED',
          discountType: 'PERCENTAGE',
          discountValue: 10,
          status: 'ACTIVE',
          shopId: testShop.id
        }
      })

      const today = new Date()
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)

      await prisma.bundleMetric.createMany({
        data: [
          {
            bundleId: bundle.id,
            date: yesterday,
            views: 50,
            clicks: 25,
            conversions: 5,
            revenue: 250.00
          },
          {
            bundleId: bundle.id,
            date: today,
            views: 75,
            clicks: 30,
            conversions: 8,
            revenue: 400.00
          }
        ]
      })

      const metrics = await prisma.bundleMetric.findMany({
        where: { bundleId: bundle.id }
      })

      const totalViews = metrics.reduce((sum, m) => sum + m.views, 0)
      const totalRevenue = metrics.reduce((sum, m) => sum + Number(m.revenue), 0)

      expect(totalViews).toBe(125)
      expect(totalRevenue).toBe(650)
    })
  })
})
