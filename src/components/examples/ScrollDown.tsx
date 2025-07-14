'use client'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/dist/ScrollTrigger'
import { ArrowDown } from 'lucide-react'
import { type FC } from 'react'
import { twMerge } from 'tailwind-merge'

type Props = {
  className?: string
}

gsap.registerPlugin(ScrollTrigger, useGSAP)

const ScrollDownArrow: FC<Props> = ({ className }) => {
  useGSAP(() => {
    gsap.to('#scroll-down', {
      opacity: 0,
      duration: 1.5,
      scrollTrigger: {
        start: 24,
        once: true,
      },
    })
  }, [])
  return (
    <div
      id="scroll-down"
      className={twMerge('pointer-events-none fixed bottom-0 z-50 flex items-center gap-3 p-6 text-white', className)}>
      <ArrowDown className="size-6 animate-bounce" />
      <span className="text-2xl font-semibold tracking-wide">Scroll</span>
    </div>
  )
}

export default ScrollDownArrow
