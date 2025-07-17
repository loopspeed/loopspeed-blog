'use client'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { X } from 'lucide-react'
import { type FC, useEffect, useRef } from 'react'
import { Transition } from 'react-transition-group'

import Button from '@/components/buttons/Button'
import { BookIntroCallButton } from '@/components/buttons/CTAButtons'
import Form from '@/components/contact/Form'
import useHomeStore, { ContactMenuContent } from '@/hooks/useHomeStore'

import CalendlyEmbed from './CalendlyEmbed'

gsap.registerPlugin(useGSAP)

const ContactMenu: FC = () => {
  const content = useHomeStore((s) => s.contactMenuContent)
  const setContent = useHomeStore((s) => s.setContactMenuContent)
  const container = useRef<HTMLDivElement>(null)
  const { contextSafe } = useGSAP({ scope: container })

  const onEnter = contextSafe(() => {
    gsap
      .timeline()
      .fromTo(container.current, { opacity: 0 }, { opacity: 1, duration: 0.2, ease: 'power1.in' })
      .fromTo('section', { xPercent: 100 }, { xPercent: 0, duration: 0.24 })
  })

  const onExit = contextSafe(() => {
    gsap.to(container.current, { opacity: 0, duration: 0.2, ease: 'power1.in' })
    gsap.to('section', { opacity: 0, xPercent: 100, duration: 0.2 })
  })

  const isOpen = !!content

  // Disable scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'auto'
    }
    // Cleanup: restore scroll when component unmounts
    return () => {
      document.body.style.overflow = 'auto'
    }
  }, [isOpen])

  return (
    <Transition
      in={isOpen}
      timeout={{ enter: 0, exit: 300 }}
      mountOnEnter
      unmountOnExit
      onEnter={onEnter}
      onExit={onExit}
      nodeRef={container}>
      <div ref={container} className="z-max fixed inset-0 flex items-center justify-center opacity-0">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setContent(null)} />
        <section className="hide-scrollbar bg-darkest pointer-events-auto absolute top-0 right-0 bottom-0 z-10 flex max-h-full w-[calc(100%-32px)] flex-col gap-6 overflow-x-hidden overflow-y-auto px-4 py-4 text-white shadow-xl shadow-black sm:px-8 sm:py-10 md:max-w-[max(40vw,540px)] md:gap-10">
          <header className="h-16">
            {isOpen && (
              <Button
                onClick={() => setContent(null)}
                variant="outlined"
                size="small"
                icon={<X strokeWidth={1.5} className="size-5 text-white" />}>
                Close
              </Button>
            )}
          </header>

          {content === ContactMenuContent.BookCall ? <CalendlyEmbed /> : <Form />}

          {content !== ContactMenuContent.BookCall && (
            <div className="space-y-4 text-left">
              <h3 className="heading-sm">Straight to a call?</h3>
              <BookIntroCallButton />
            </div>
          )}
        </section>
      </div>
    </Transition>
  )
}

export default ContactMenu
