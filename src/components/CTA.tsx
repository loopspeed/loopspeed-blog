import { type FC } from 'react'

import Button from '@/components/buttons/Button'
import { Heading2 } from '@/components/Heading'
import Technologies from '@/components/Technologies'

const CTA: FC = () => {
  return (
    <section
      id="cta"
      className="bg-darkest relative flex w-full flex-1 flex-col items-center justify-center gap-6 px-3 py-20 sm:px-6 md:gap-8 md:px-12 lg:py-30">
      <Heading2 className="from-accent-teal bg-linear-30/oklch to-white text-balance">
        Looking for an experienced team to help bring a project to life?
      </Heading2>

      <Button href="https://www.loopspeed.co.uk/">Meet Loopspeed</Button>

      <Technologies showAll />
    </section>
  )
}

export default CTA
