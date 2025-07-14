'use client'
import { Calendar } from 'lucide-react'
import { type FC } from 'react'

import Button, { type ButtonProps } from '@/components/buttons/Button'
import { useGA4Event } from '@/hooks/useGA4Event'
import useHomeStore, { ContactMenuContent } from '@/hooks/useHomeStore'
import { EventName } from '@/resources/analytics'

type Props = ButtonProps

const BookIntroCallButton: FC<Props> = ({
  variant = 'outlined',
  colour = 'dark',
  children = 'Book a 15 min intro',
  ...rest
}) => {
  const { sendEvent } = useGA4Event()
  const setContactMenuContent = useHomeStore((s) => s.setContactMenuContent)
  return (
    <Button
      variant={variant}
      colour={colour}
      onClick={() => {
        setContactMenuContent(ContactMenuContent.BookCall)
        sendEvent(EventName.ClickBookCall)
      }}
      icon={<Calendar strokeWidth={1.5} className="size-4 sm:size-5" />}
      {...rest}>
      {children}
    </Button>
  )
}

export default BookIntroCallButton
