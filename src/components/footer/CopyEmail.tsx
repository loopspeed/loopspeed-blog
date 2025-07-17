'use client'
import { Check, Copy } from 'lucide-react'
import React, { type FC, useState } from 'react'

// import { useGA4Event } from '@/hooks/useGA4Event'
// import { ConversionEventName } from '@/resources/analytics'
import { EMAIL_ADDRESS } from '@/resources/brand'

const CopyEmail: FC = () => {
  const [isCopied, setIsCopied] = useState(false)
  // const { sendEvent } = useGA4Event()

  const onCopyEmailClick = async () => {
    try {
      navigator.clipboard.writeText(EMAIL_ADDRESS)
      setIsCopied(true)
      // sendEvent(ConversionEventName.CopyEmail)
      setTimeout(() => setIsCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy text to clipboard:', err)
    }
  }

  return (
    <button className="group flex w-fit items-center gap-2 px-2 py-1" onClick={onCopyEmailClick}>
      <span className="paragraph-sm text-white">{EMAIL_ADDRESS}</span>
      {isCopied ? (
        <Check strokeWidth={1.5} className="text-accent-teal m-0 size-5 p-0" />
      ) : (
        <Copy strokeWidth={1.5} className="m-0 size-5 p-0 text-white opacity-60 group-hover:opacity-100" />
      )}
    </button>
  )
}

export default CopyEmail
