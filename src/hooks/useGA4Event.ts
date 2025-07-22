import { sendGAEvent } from '@next/third-parties/google'

import { ConversionEventName, type CustomEventProperties, EventName } from '@/resources/analytics'

const isDevelopment = process.env.NODE_ENV === 'development'

export function useGA4Event() {
  const sendEvent = async (eventName: EventName | ConversionEventName, properties: CustomEventProperties = {}) => {
    if (isDevelopment) {
      console.warn('GA4 Event:', { eventName, properties })
      return
    }
    sendGAEvent('event', eventName, properties)
  }

  return { sendEvent }
}
