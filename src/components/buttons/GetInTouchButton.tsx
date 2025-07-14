import { ArrowRight, Video } from 'lucide-react'
import { type FC } from 'react'

import Button, { type ButtonProps } from '@/components/buttons/Button'
import { useGA4Event } from '@/hooks/useGA4Event'
import useHomeStore, { ContactMenuContent } from '@/hooks/useHomeStore'
import { EventName } from '@/resources/analytics'

const GetInTouchButton: FC<ButtonProps> = ({
  variant = 'filled',
  colour = 'dark',
  size = 'large',
  children = 'Get in touch',
  ...rest
}) => {
  const { sendEvent } = useGA4Event()
  const setContactMenu = useHomeStore((s) => s.setContactMenuContent)

  return (
    <Button
      variant={variant}
      colour={colour}
      size={size}
      icon={<ArrowRight />}
      onClick={() => {
        setContactMenu(ContactMenuContent.GetInTouch)
        sendEvent(EventName.ClickGetInTouch)
      }}
      {...rest}>
      {children}
    </Button>
  )
}

export default GetInTouchButton

const ShowreelButton: FC<ButtonProps> = ({
  children = 'Request showreel',
  variant = 'outlined',
  colour = 'dark',
  size = 'large',
  ...rest
} = {}) => {
  const { sendEvent } = useGA4Event()
  const setContactMenu = useHomeStore((s) => s.setContactMenuContent)

  return (
    <Button
      variant={variant}
      colour={colour}
      size={size}
      {...rest}
      icon={<Video strokeWidth={1.5} />}
      onClick={() => {
        setContactMenu(ContactMenuContent.Showreel)
        sendEvent(EventName.ClickGetShowreel)
      }}>
      {children}
    </Button>
  )
}

export { GetInTouchButton, ShowreelButton }
