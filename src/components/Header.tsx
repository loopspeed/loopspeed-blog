'use client'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import SplitText from 'gsap/dist/SplitText'
import { type FC, useRef } from 'react'

import { Heading1 } from '@/components/Heading'

gsap.registerPlugin(SplitText)

const Header: FC = () => {
  const container = useRef<HTMLDivElement>(null)

  // Animations only run on MD and up (768px)
  useGSAP(
    () => {
      gsap.fromTo(
        ['h1'],
        { opacity: 0, y: 8 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power1.inOut', delay: 0.2, stagger: 0.16 },
      )
    },
    { dependencies: [], scope: container },
  )

  return (
    <header ref={container} className="horizontal-padding flex items-center justify-center py-24 sm:py-32">
      <Heading1 className="from-accent-teal to-white to-85% opacity-0">
        A growing collection of guides, patterns, and fun stuff we&apos;ve been building at Loopspeed
      </Heading1>
    </header>
  )
}

export default Header
