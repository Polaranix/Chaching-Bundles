import { describe, it, expect, beforeEach } from 'vitest'
import { prisma } from '../functions/app/lib/prisma.server'
import crypto from 'crypto'

// Mock webhook payload
const createOrderWebhook = (orderId: number, lineItems: any[]) => ({
  id: orderId,
  email: 'customer@example.com',
  created_at: new Date().toISOString(),
  total_price: '100.00',
  currency: 'USD',
  line_items: lineItems,
  customer: {
    id: 123,
    email: 'customer@example.com',
    first_name: 'John',
    last_name: 'Doe'
  }
})

// Helper to verify HMAC
const verifyWebhookHmac = (body: string, hmac: string, secret: string): boolean => {
  const hash = crypto
    .createHmac('sha256', secret)
    .update(body)
    .digest('base64')
  return hash === hmac
}

describe('Webhook Processing', () => {
  let testShop: any
  let testBundle: any

  beforeEach(async () => {
    testShop = await prisma.shop.create({
      data: {
        shop: 'test-shop.myshopify.com',
        accessToken: 'test-token',
        scope: 'read_products,write_products'
      }
    })

    testBundle = await prisma.bundle.create({
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
              productId: 'gid://shopify/Product/123',
              variantId: 'gid://shopify/ProductVariant/456',
              quantity: 1,
              price: 50.00
            },
            {
              productId: 'gid://shopify/Product/124',
              variantId: 'gid://shopify/ProductVariant/457',
              quantity: 1,
              price: 50.00
            }
          ]
        }
      }
    })
  })

  describe('Order Webhooks', () => {
    it('should verify webhook HMAC', () => {
      const body = JSON.stringify({ test: 'data' })
      const secret = 'test_secret'
      const hmac = crypto
        .createHmac('sha256', secret)
        .update(body)
        .digest('base64')

      const isValid = verifyWebhookHmac(body, hmac, secret)
      expect(isValid).toBe(true)
    })

    it('should reject invalid HMAC', () => {
      const body = JSON.stringify({ test: 'data' })
      const secret = 'test_secret'
      const invalidHmac = 'invalid_hmac'

      const isValid = verifyWebhookHmac(body, invalidHmac, secret)
      expect(isValid).toBe(false)
    })

    it('should process order with bundle', async () => {
      const lineItems = [
        {
          id: 1,
          product_id: 123,
          variant_id: 456,
          quantity: 1,
          price: '50.00',
          properties: [
            { name: '_bundle_id', value: testBundle.id }
          ]
        },
        {
          id: 2,
          product_id: 124,
          variant_id: 457,
          quantity: 1,
          price: '50.00',
          properties: [
            { name: '_bundle_id', value: testBundle.id }
          ]
        }
      ]

      const webhook = createOrderWebhook(1001, lineItems)

      // Simulate webhook processing
      const bundleId = lineItems[0].properties.find(
        p => p.name === '_bundle_id'
      )?.value

      expect(bundleId).toBe(testBundle.id)

      // Track order
      const bundleOrder = await prisma.bundleOrder.create({
        data: {
          bundleId: testBundle.id,
          shopId: testShop.id,
          orderId: webhook.id.toString(),
          orderNumber: webhook.id,
          totalPrice: parseFloat(webhook.total_price),
          currency: webhook.currency,
          customerEmail: webhook.email
        }
      })

      expect(bundleOrder.bundleId).toBe(testBundle.id)
      expect(bundleOrder.totalPrice).toBe(100)
    })

    it('should update bundle metrics on order', async () => {
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      // Create initial metric
      await prisma.bundleMetric.create({
        data: {
          bundleId: testBundle.id,
          date: today,
          views: 100,
          clicks: 50,
          conversions: 5,
          revenue: 250.00
        }
      })

      // Simulate new order
      await prisma.bundleOrder.create({
        data: {
          bundleId: testBundle.id,
          shopId: testShop.id,
          orderId: '1001',
          orderNumber: 1001,
          totalPrice: 80.00,
          currency: 'USD',
          customerEmail: 'test@example.com'
        }
      })

      // Update metrics
      const metric = await prisma.bundleMetric.findFirst({
        where: {
          bundleId: testBundle.id,
          date: today
        }
      })

      if (metric) {
        await prisma.bundleMetric.update({
          where: { id: metric.id },
          data: {
            conversions: { increment: 1 },
            revenue: { increment: 80.00 }
          }
        })
      }

      const updatedMetric = await prisma.bundleMetric.findFirst({
        where: {
          bundleId: testBundle.id,
          date: today
        }
      })

      expect(updatedMetric?.conversions).toBe(6)
      expect(Number(updatedMetric?.revenue)).toBe(330.00)
    })

    it('should handle multiple orders for same bundle', async () => {
      const orders = [
        { id: '1001', total: 80.00 },
        { id: '1002', total: 85.00 },
        { id: '1003', total: 90.00 }
      ]

      for (const order of orders) {
        await prisma.bundleOrder.create({
          data: {
            bundleId: testBundle.id,
            shopId: testShop.id,
            orderId: order.id,
            orderNumber: parseInt(order.id),
            totalPrice: order.total,
            currency: 'USD',
            customerEmail: 'test@example.com'
          }
        })
      }

      const bundleOrders = await prisma.bundleOrder.findMany({
        where: { bundleId: testBundle.id }
      })

      expect(bundleOrders).toHaveLength(3)

      const totalRevenue = bundleOrders.reduce(
        (sum, order) => sum + Number(order.totalPrice),
        0
      )

      expect(totalRevenue).toBe(255.00)
    })
  })

  describe('Refund Webhooks', () => {
    it('should process refund and update metrics', async () => {
      // Create original order
      const order = await prisma.bundleOrder.create({
        data: {
          bundleId: testBundle.id,
          shopId: testShop.id,
          orderId: '1001',
          orderNumber: 1001,
          totalPrice: 80.00,
          currency: 'USD',
          customerEmail: 'test@example.com'
        }
      })

      const today = new Date()
      today.setHours(0, 0, 0, 0)

      // Create metric
      await prisma.bundleMetric.create({
        data: {
          bundleId: testBundle.id,
          date: today,
          views: 100,
          clicks: 50,
          conversions: 10,
          revenue: 800.00
        }
      })

      // Process refund
      await prisma.bundleOrder.update({
        where: { id: order.id },
        data: { refunded: true }
      })

      // Update metrics
      const metric = await prisma.bundleMetric.findFirst({
        where: {
          bundleId: testBundle.id,
          date: today
        }
      })

      if (metric) {
        await prisma.bundleMetric.update({
          where: { id: metric.id },
          data: {
            conversions: { decrement: 1 },
            revenue: { decrement: 80.00 }
          }
        })
      }

      const updatedMetric = await prisma.bundleMetric.findFirst({
        where: {
          bundleId: testBundle.id,
          date: today
        }
      })

      expect(updatedMetric?.conversions).toBe(9)
      expect(Number(updatedMetric?.revenue)).toBe(720.00)
    })
  })

  describe('Product Update Webhooks', () => {
    it('should handle product deletion', async () => {
      // When a product is deleted, bundle items should be updated or removed
      const bundle = await prisma.bundle.findUnique({
        where: { id: testBundle.id },
        include: { items: true }
      })

      expect(bundle?.items).toHaveLength(2)

      // Simulate product deletion - remove bundle item
      await prisma.bundleItem.deleteMany({
        where: {
          bundleId: testBundle.id,
          productId: 'gid://shopify/Product/123'
        }
      })

      const updatedBundle = await prisma.bundle.findUnique({
        where: { id: testBundle.id },
        include: { items: true }
      })

      expect(updatedBundle?.items).toHaveLength(1)
    })

    it('should update bundle when product price changes', async () => {
      const oldPrice = 50.00
      const newPrice = 60.00

      await prisma.bundleItem.update({
        where: { id: testBundle.items[0].id },
        data: { price: newPrice }
      })

      const updatedItem = await prisma.bundleItem.findUnique({
        where: { id: testBundle.items[0].id }
      })

      expect(Number(updatedItem?.price)).toBe(newPrice)
    })
  })
})
