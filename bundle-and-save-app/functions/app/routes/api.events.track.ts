import type { ActionFunctionArgs } from '@remix-run/node'
import { json } from '@remix-run/node'
import { trackEvent } from '~/lib/analytics.server'
import { validateAnalyticsEvent } from '~/lib/validate'
import { logError } from '~/lib/logger.server'

export const action = async ({ request }: ActionFunctionArgs) => {
  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, { status: 405 })
  }
  
  try {
    const eventData = await request.json()
    
    // Validate event data
    const validation = validateAnalyticsEvent(eventData)
    if (!validation.success) {
      return json(
        { error: 'Invalid event data', details: validation.error.errors },
        { status: 400 }
      )
    }
    
    // Track the event
    await trackEvent(validation.data)
    
    return json({ success: true })
  } catch (error) {
    logError('Failed to track analytics event', error as Error, { eventData: await request.json() })
    return json(
      { error: 'Failed to track event' },
      { status: 500 }
    )
  }
}

// Handle preflight requests for CORS
export const loader = async ({ request }: ActionFunctionArgs) => {
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    })
  }
  
  return json({ error: 'Method not allowed' }, { status: 405 })
}
