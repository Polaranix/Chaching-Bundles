import { prisma } from './prisma.server'
import { logInfo, logError } from './logger.server'

export interface AnalyticsEvent {
  shop: string
  bundleId: string
  event: 'impression' | 'click' | 'order'
  metadata?: Record<string, unknown>
}

// Track analytics event
export async function trackEvent(eventData: AnalyticsEvent): Promise<void> {
  try {
    const { shop, bundleId, event } = eventData
    
    // Upsert metric record
    await prisma.bundleMetric.upsert({
      where: {
        shopId_bundleId_eventType: {
          shopId: shop,
          bundleId,
          eventType: event,
        },
      },
      create: {
        shopId: shop,
        bundleId,
        eventType: event,
        count: 1,
      },
      update: {
        count: {
          increment: 1,
        },
      },
    })
    
    logInfo('Analytics event tracked', {
      shop,
      bundleId,
      event,
      metadata: eventData.metadata,
    })
  } catch (error) {
    logError('Failed to track analytics event', error as Error, eventData)
  }
}

// Get analytics for a bundle
export async function getBundleAnalytics(
  shopId: string,
  bundleId: string
): Promise<{
  impressions: number
  clicks: number
  orders: number
  conversionRate: number
}> {
  try {
    const metrics = await prisma.bundleMetric.findMany({
      where: {
        shopId,
        bundleId,
      },
    })
    
    const impressions = metrics.find(m => m.eventType === 'impression')?.count || 0
    const clicks = metrics.find(m => m.eventType === 'click')?.count || 0
    const orders = metrics.find(m => m.eventType === 'order')?.count || 0
    
    const conversionRate = impressions > 0 ? (orders / impressions) * 100 : 0
    
    return {
      impressions,
      clicks,
      orders,
      conversionRate: Math.round(conversionRate * 100) / 100, // Round to 2 decimal places
    }
  } catch (error) {
    logError('Failed to get bundle analytics', error as Error, { shopId, bundleId })
    return {
      impressions: 0,
      clicks: 0,
      orders: 0,
      conversionRate: 0,
    }
  }
}

// Get analytics for all bundles in a shop
export async function getShopAnalytics(
  shopId: string
): Promise<{
  totalImpressions: number
  totalClicks: number
  totalOrders: number
  averageConversionRate: number
  bundleBreakdown: Array<{
    bundleId: string
    bundleTitle: string
    impressions: number
    clicks: number
    orders: number
    conversionRate: number
  }>
}> {
  try {
    const [metrics, bundles] = await Promise.all([
      prisma.bundleMetric.findMany({
        where: { shopId },
      }),
      prisma.bundle.findMany({
        where: { shopId },
        select: { id: true, title: true },
      }),
    ])
    
    const totalImpressions = metrics
      .filter(m => m.eventType === 'impression')
      .reduce((sum, m) => sum + m.count, 0)
    
    const totalClicks = metrics
      .filter(m => m.eventType === 'click')
      .reduce((sum, m) => sum + m.count, 0)
    
    const totalOrders = metrics
      .filter(m => m.eventType === 'order')
      .reduce((sum, m) => sum + m.count, 0)
    
    const averageConversionRate = totalImpressions > 0 
      ? (totalOrders / totalImpressions) * 100 
      : 0
    
    const bundleBreakdown = bundles.map(bundle => {
      const bundleMetrics = metrics.filter(m => m.bundleId === bundle.id)
      const impressions = bundleMetrics.find(m => m.eventType === 'impression')?.count || 0
      const clicks = bundleMetrics.find(m => m.eventType === 'click')?.count || 0
      const orders = bundleMetrics.find(m => m.eventType === 'order')?.count || 0
      const conversionRate = impressions > 0 ? (orders / impressions) * 100 : 0
      
      return {
        bundleId: bundle.id,
        bundleTitle: bundle.title,
        impressions,
        clicks,
        orders,
        conversionRate: Math.round(conversionRate * 100) / 100,
      }
    })
    
    return {
      totalImpressions,
      totalClicks,
      totalOrders,
      averageConversionRate: Math.round(averageConversionRate * 100) / 100,
      bundleBreakdown,
    }
  } catch (error) {
    logError('Failed to get shop analytics', error as Error, { shopId })
    return {
      totalImpressions: 0,
      totalClicks: 0,
      totalOrders: 0,
      averageConversionRate: 0,
      bundleBreakdown: [],
    }
  }
}
