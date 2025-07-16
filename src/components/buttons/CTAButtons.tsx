'use client'
import { ArrowRight, CalendarPlus2, Video } from 'lucide-react'
import { type FC } from 'react'

import Button, { type ButtonProps } from '@/components/buttons/Button'
// import { useGA4Event } from '@/hooks/useGA4Event'
import useHomeStore, { ContactMenuContent } from '@/hooks/useHomeStore'
// import { EventName } from '@/resources/analytics'

// PRIMARY CTA
const BookIntroCallButton: FC<ButtonProps> = ({
  variant = 'filled',
  colour = 'dark',
  children = 'Schedule an intro',
  onClick,
  ...rest
}) => {
  // const { sendEvent } = useGA4Event()
  const setContactMenuContent = useHomeStore((s) => s.setContactMenuContent)
  return (
    <Button
      {...rest}
      variant={variant}
      colour={colour}
      onClick={(e) => {
        setContactMenuContent(ContactMenuContent.BookCall)
        // sendEvent(EventName.ClickBookCall)
        onClick?.(e)
      }}
      icon={<CalendarPlus2 strokeWidth={1.5} className="size-4 sm:size-5" />}>
      {children}
    </Button>
  )
}

const GetInTouchButton: FC<ButtonProps> = ({
  variant = 'outlined',
  colour = 'dark',
  children = 'Get in touch',
  icon = <ArrowRight className="size-4 sm:size-5" />,
  onClick,
  ...rest
}) => {
  // const { sendEvent } = useGA4Event()
  const setContactMenu = useHomeStore((s) => s.setContactMenuContent)

  return (
    <Button
      {...rest}
      variant={variant}
      colour={colour}
      icon={icon}
      onClick={(e) => {
        setContactMenu(ContactMenuContent.GetInTouch)
        // sendEvent(EventName.ClickGetInTouch)
        onClick?.(e)
      }}>
      {children}
    </Button>
  )
}

const ShowreelButton: FC<ButtonProps> = ({
  children = 'Request showreel',
  variant = 'outlined',
  colour = 'dark',
  onClick,
  ...rest
} = {}) => {
  // const { sendEvent } = useGA4Event()
  const setContactMenu = useHomeStore((s) => s.setContactMenuContent)

  return (
    <Button
      {...rest}
      variant={variant}
      colour={colour}
      icon={<Video strokeWidth={1.5} className="size-4 sm:size-5" />}
      onClick={(e) => {
        setContactMenu(ContactMenuContent.Showreel)
        // sendEvent(EventName.ClickGetShowreel)
        onClick?.(e)
      }}>
      {children}
    </Button>
  )
}

export { BookIntroCallButton, GetInTouchButton, ShowreelButton }
