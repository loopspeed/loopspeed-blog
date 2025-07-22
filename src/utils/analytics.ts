/**
 * Utility functions for Google Analytics client ID handling
 */

declare global {
  interface Window {
    gtag: (...args: unknown[]) => void
  }
}

/**
 * Get the Google Analytics client ID from gtag.js
 * This ensures consistency between client-side and server-side events
 *
 * @returns Promise<string | null> The client ID or null if not available
 */
export async function getGAClientId(): Promise<string | null> {
  return new Promise((resolve) => {
    // Check if gtag is available
    if (typeof window === 'undefined' || typeof window.gtag !== 'function') {
      console.warn('gtag is not available - client ID cannot be retrieved')
      resolve(null)
      return
    }

    try {
      // Get the measurement ID from environment
      const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID

      if (!measurementId) {
        console.warn('GA4 Measurement ID not found - client ID cannot be retrieved')
        resolve(null)
        return
      }

      // Use gtag to get the client ID
      window.gtag('get', measurementId, 'client_id', (clientId: string) => {
        if (clientId) {
          resolve(clientId)
        } else {
          console.warn('Failed to retrieve GA client ID')
          resolve(null)
        }
      })
    } catch (error) {
      console.error('Error retrieving GA client ID:', error)
      resolve(null)
    }
  })
}

/**
 * Get the Google Analytics session ID from gtag.js
 * This can be used for server-side events to maintain session consistency
 *
 * @returns Promise<string | null> The session ID or null if not available
 */
export async function getGASessionId(): Promise<string | null> {
  return new Promise((resolve) => {
    // Check if gtag is available
    if (typeof window === 'undefined' || typeof window.gtag !== 'function') {
      console.warn('gtag is not available - session ID cannot be retrieved')
      resolve(null)
      return
    }

    try {
      // Get the measurement ID from environment
      const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID

      if (!measurementId) {
        console.warn('GA4 Measurement ID not found - session ID cannot be retrieved')
        resolve(null)
        return
      }

      // Use gtag to get the session ID
      window.gtag('get', measurementId, 'session_id', (sessionId: string) => {
        if (sessionId) {
          resolve(sessionId)
        } else {
          console.warn('Failed to retrieve GA session ID')
          resolve(null)
        }
      })
    } catch (error) {
      console.error('Error retrieving GA session ID:', error)
      resolve(null)
    }
  })
}

/**
 * Get both client ID and session ID from gtag.js
 * Useful when you need both for server-side event tracking
 *
 * @returns Promise<{clientId: string | null, sessionId: string | null}>
 */
export async function getGAIdentifiers(): Promise<{
  clientId: string | null
  sessionId: string | null
}> {
  const [clientId, sessionId] = await Promise.all([getGAClientId(), getGASessionId()])

  return { clientId, sessionId }
}
