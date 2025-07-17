import Script from 'next/script'
import { type FC, useEffect, useRef } from 'react'

// import { useGA4Event } from '@/hooks/useGA4Event'
// import { ConversionEventName } from '@/resources/analytics'

declare global {
  interface Window {
    Calendly?: {
      initInlineWidget: (options: { url: string; parentElement: HTMLElement | null; resize?: boolean }) => void
    }
  }
}

const CalendlyEmbed: FC = () => {
  // const { sendEvent } = useGA4Event()
  const hasLoggedEvent = useRef(false)

  useEffect(() => {
    const onMesage = (e: MessageEvent) => {
      if (hasLoggedEvent.current) return
      const isCalendlyEvent = e.origin === 'https://calendly.com' && e.data.event?.startsWith('calendly.')
      if (!isCalendlyEvent) return
      if (e.data.event !== 'calendly.event_scheduled') return
      if (process.env.NODE_ENV === 'development') {
        console.warn('Calendly Event:', e.data.event, e.data.payload)
      }
      // sendEvent(ConversionEventName.ScheduleMeeting)
      hasLoggedEvent.current = true
    }
    window.addEventListener('message', onMesage)

    return () => {
      window.removeEventListener('message', onMesage)
    }
  }, [])

  const initializeCalendly = () => {
    window.Calendly?.initInlineWidget({
      url: 'https://calendly.com/loopspeed/intro',
      parentElement: document.getElementById('calendly-embed'),
      resize: true,
    })
  }

  useEffect(() => {
    // If Calendly is already loaded, initialize immediately
    if (!!window?.Calendly) initializeCalendly()
  }, [])

  return (
    <>
      <Script
        src="https://assets.calendly.com/assets/external/widget.js"
        type="text/javascript"
        onLoad={initializeCalendly}
      />
      <div id="calendly-embed" className="h-fit w-full" />
    </>
  )
}

export default CalendlyEmbed
