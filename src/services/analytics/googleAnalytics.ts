import { ConversionEventName } from '@/resources/analytics'

const isDevelopment = process.env.NODE_ENV === 'development'

/**
 * Get the appropriate GA4 Measurement Protocol endpoint
 * Uses EU endpoint if GA4_USE_EU_ENDPOINT is set to 'true'
 * For debugging, you can add &debug=1 to the URL to get validation messages
 */
function getAnalyticsEndpoint(measurementId: string, apiSecret: string): string {
  const useEuEndpoint = process.env.GA4_USE_EU_ENDPOINT === 'true'
  const isDebug = process.env.GA4_DEBUG_MODE === 'true'

  const baseUrl = useEuEndpoint
    ? 'https://region1.google-analytics.com/mp/collect'
    : 'https://www.google-analytics.com/mp/collect'

  const debugParam = isDebug ? '&debug=1' : ''

  return `${baseUrl}?measurement_id=${measurementId}&api_secret=${apiSecret}${debugParam}`
}

/**
 * Send Google Ads conversion event using server-side tracking
 * This is specifically for conversion tracking in Google Ads
 */

type SendConversionEventParams = {
  eventName: ConversionEventName
  email?: string
  clientId?: string // Optional, will be generated if not provided
  sessionId?: string // Optional, will be generated if not provided
  userId?: string // Optional, will be used as user_id if provided
  properties?: {
    value?: number // Optional, default is 0.0
    [key: string]: string | number | undefined // Additional custom properties
  }
}

export async function sendGAConversionEvent(params: SendConversionEventParams): Promise<void> {
  // Skip in development
  if (isDevelopment) {
    console.warn('Skipping GA server-side conversion event in development:', { params })
    return
  }

  const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID
  const apiSecret = process.env.GA4_MEASUREMENT_PROTOCOL_SECRET

  if (!measurementId || !apiSecret) {
    console.error('GA4 Measurement ID or API Secret not configured for server-side conversion tracking')
    return
  }

  const { eventName, email, properties = {} } = params

  try {
    // Generate a client_id if not provided (prioritize the one from client-side)
    const clientId = params.clientId ?? generateClientId(email)
    // Generate session_id if not provided (prioritize the one from client-side)
    const sessionId = params.sessionId ?? generateSessionId()

    // Log GA event details for debugging
    console.warn('GA Conversion Event - Preparing to send:', {
      eventName,
      clientId,
      sessionId,
      wasProvidedClientId: !!params.clientId,
      wasProvidedSessionId: !!params.sessionId,
    })

    const payload = {
      client_id: clientId,
      ...(!!email && { user_id: email }), // Use email directly as user_id
      events: [
        {
          name: eventName,
          params: {
            // Required parameters for proper reporting
            session_id: sessionId,
            // Custom parameters
            value: properties.value ?? 0.0,
            currency: 'GBP',
          },
        },
      ],
    }

    const url = getAnalyticsEndpoint(measurementId, apiSecret)

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error')
      console.error('Failed to send server-side conversion event:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
        payload: JSON.stringify(payload, null, 2),
      })
    } else {
      console.warn('Successfully sent GA server-side conversion event:', eventName)

      // In debug mode, log the response
      if (process.env.GA4_DEBUG_MODE === 'true') {
        const responseText = await response.text().catch(() => '')
        console.warn('GA4 Debug Response:', responseText)
      }
    }
  } catch (error) {
    console.error('Error sending GA server-side conversion event:', error)
    return
  }
}

/**
 * Generate a consistent client ID for a user
 * Format should be XXXXXXXXXX.YYYYYYYYYY as per GA4 documentation
 */
function generateClientId(email?: string): string {
  if (email) {
    // Use a simple hash of the email to create a consistent client ID
    const hash = simpleHash(email)
    // Format as XXXXXXXXXX.YYYYYYYYYY (ensure exactly 10 digits each part)
    const hashStr = hash.toString().padStart(20, '0')
    const firstPart = hashStr.slice(0, 10)
    const secondPart = hashStr.slice(10, 20)
    return `${firstPart}.${secondPart}`
  } else {
    // Random client ID as last resort - format as XXXXXXXXXX.YYYYYYYYYY
    const timestamp = Date.now().toString().slice(-10)
    const random = Math.floor(Math.random() * 10000000000)
      .toString()
      .padStart(10, '0')
    return `${random}.${timestamp}`
  }
}

/**
 * Generate a session ID (simple timestamp-based)
 */
function generateSessionId(): string {
  return Date.now().toString()
}

/**
 * Simple hash function for creating consistent client IDs
 * Note: This is not cryptographically secure, just for analytics purposes
 */
function simpleHash(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return Math.abs(hash)
}
