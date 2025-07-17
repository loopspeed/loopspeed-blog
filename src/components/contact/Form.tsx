'use client'

import { SendHorizonal } from 'lucide-react'
import React, { type FC, useRef, useState } from 'react'
import { SwitchTransition, Transition } from 'react-transition-group'

import Button from '@/components/buttons/Button'
import Input from '@/components/contact/Input'
import LoadingSpinner from '@/components/contact/LoadingSpinner'
import TextArea from '@/components/contact/TextArea'
import CopyEmail from '@/components/footer/CopyEmail'
// import { useGA4Event } from '@/hooks/useGA4Event'
import useHomeStore, { ContactMenuContent } from '@/hooks/useHomeStore'
// import { ConversionEventName } from '@/resources/analytics'
import { type ContactRequest, contactSchema, type ShowreelRequest, showreelSchema } from '@/schemas/api'

export enum FormStatus {
  Idle = 'idle',
  Submitting = 'submitting',
  Invalid = 'invalid',
  Success = 'success',
  Error = 'error',
}

// TODO: add loading/sending state to button

export const FORM_CONFIG: Record<
  string,
  { title: string; buttonCTA: string; showMessage: boolean; apiEndpoint: string }
> = {
  [ContactMenuContent.GetInTouch]: {
    title: 'What could we build together?',
    buttonCTA: 'Send Message',
    showMessage: true,
    apiEndpoint: 'api/contact',
  },
  [ContactMenuContent.Showreel]: {
    title: 'Get our showreel straight to your inbox',
    buttonCTA: 'Get it',
    showMessage: false,
    apiEndpoint: 'api/showreel',
  },
}

const Form: FC = () => {
  // const { sendEvent } = useGA4Event()
  const contactMenu = useHomeStore((s) => s.contactMenuContent)
  const config = !!contactMenu ? FORM_CONFIG[contactMenu] : null
  const [status, setStatus] = useState<FormStatus>(FormStatus.Idle)
  const [invalidFields, setInvalidFields] = useState<string[]>([])
  const form = useRef<HTMLFormElement>(null)
  const container = useRef<HTMLDivElement>(null)
  const getIsInvalid = (name: string): boolean => status === FormStatus.Invalid && invalidFields.includes(name)

  const isValidInput = (): boolean => {
    if (!form.current) return false

    // Extract form data
    const formData: Record<string, string> = {
      name: (form.current.elements.namedItem('name') as HTMLInputElement)?.value || '',
      email: (form.current.elements.namedItem('email') as HTMLInputElement)?.value || '',
    }

    // Add message if it's a contact form
    if (config?.showMessage) {
      formData.message = (form.current.elements.namedItem('message') as HTMLTextAreaElement)?.value || ''
    }

    // Choose the appropriate schema based on form type
    const schema = config?.showMessage ? contactSchema : showreelSchema
    const validationResult = schema.safeParse(formData)

    if (!validationResult.success) {
      setStatus(FormStatus.Invalid)
      // Extract field names from Zod validation errors
      const invalidFields = Object.keys(validationResult.error.format()).filter((key) => key !== '_errors')
      setInvalidFields(invalidFields)
      return false
    }

    setInvalidFields([])
    return true
  }

  const handleSubmit = async () => {
    if (!form.current) return

    const body: ContactRequest | ShowreelRequest = {
      name: (form.current.elements.namedItem('name') as HTMLInputElement)?.value || '',
      email: (form.current.elements.namedItem('email') as HTMLInputElement)?.value || '',
    }
    if (config?.showMessage) {
      ;(body as ContactRequest).message =
        (form.current.elements.namedItem('message') as HTMLTextAreaElement)?.value || ''
    }

    try {
      const response = await fetch(config!.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to submit form')
      }

      // const eventName =
      //   contactMenu === ContactMenuContent.Showreel
      //     ? ConversionEventName.RequestShowreel
      //     : ConversionEventName.SubmitEnquiry
      // sendEvent(eventName, {})

      setStatus(FormStatus.Success)
    } catch (error) {
      console.error('Form submission error:', error)
      setStatus(FormStatus.Error)
    }
  }

  const onSubmitClick = () => {
    setStatus(FormStatus.Submitting)
    if (!isValidInput()) return
    handleSubmit()
  }

  const showError = status === FormStatus.Error
  const showSuccess = status === FormStatus.Success
  const transitionKey = `${showError}-${showSuccess}`

  const isSubmitting = status === FormStatus.Submitting

  return (
    <div className="w-full flex-1">
      <h3 className="heading-md mb-8">{config?.title}</h3>

      <SwitchTransition>
        <Transition key={transitionKey} nodeRef={container} timeout={300}>
          {() => {
            return (
              <div ref={container}>
                {showError && (
                  <div className="">
                    <p className="text-accent-orange paragraph py-4">
                      There was an error sending your message.
                      <br />
                      Please reload and try again, or reach out to us at:
                    </p>
                    <CopyEmail />
                  </div>
                )}
                {showSuccess && (
                  <p className="text-light bg-mid/10 paragraph-lg rounded-lg py-8 text-center">
                    Thanks for your message!
                    <br />
                    We look forward to chatting soon.
                  </p>
                )}

                {!showError && !showSuccess && (
                  <form ref={form} className="w-full space-y-1" onSubmit={(e) => e.preventDefault()}>
                    {config?.showMessage && (
                      <TextArea
                        className="form-element"
                        name="message"
                        id="message"
                        placeholder="How can we help? Tell us a little about your business or project and we'll be in touch to arrange an intro meeting..."
                        rows={3}
                        isInvalid={getIsInvalid('message')}
                        disabled={isSubmitting}
                      />
                    )}
                    <Input
                      name="name"
                      id="name"
                      placeholder="Your name"
                      type="name"
                      autoComplete="given-name"
                      isInvalid={getIsInvalid('name')}
                      disabled={isSubmitting}
                    />
                    <Input
                      className="form-element"
                      name="email"
                      id="email"
                      placeholder="Your work email"
                      type="email"
                      autoComplete="email"
                      isInvalid={getIsInvalid('email')}
                      disabled={isSubmitting}
                    />

                    <div className="mt-6 flex items-center justify-between gap-2 md:gap-4">
                      <Button
                        type="button"
                        onClick={onSubmitClick}
                        variant="filled"
                        disabled={isSubmitting}
                        icon={
                          !isSubmitting ? <SendHorizonal strokeWidth={1.5} className="hidden size-5 sm:block" /> : null
                        }>
                        {isSubmitting ? <LoadingSpinner /> : config?.buttonCTA}
                      </Button>

                      <CopyEmail />
                    </div>
                  </form>
                )}
              </div>
            )
          }}
        </Transition>
      </SwitchTransition>
    </div>
  )
}

export default Form
