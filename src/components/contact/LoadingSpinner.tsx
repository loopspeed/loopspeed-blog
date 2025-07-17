'use client'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { DrawSVGPlugin } from 'gsap/all'
import { type FC, forwardRef, useRef } from 'react'
import { twJoin } from 'tailwind-merge'

gsap.registerPlugin(DrawSVGPlugin, useGSAP)

const LoadingSpinner: FC = () => {
  return (
    <div className="relative flex h-fit items-center justify-center px-16">
      <LoopspeedLogo animate />
      <LoopspeedLogo className="opacity-50" />
    </div>
  )
}

export default LoadingSpinner

type Props = {
  className?: string
  animate?: boolean
}

const LoopspeedLogo = forwardRef<SVGPathElement, Props>(({ animate = false, className }, ref) => {
  const pathAnimate = useRef<SVGPathElement | null>(null)
  const path = ref || pathAnimate

  useGSAP(
    () => {
      if (animate && path && 'current' in path) {
        gsap.fromTo(
          path.current,
          { drawSVG: 0 },
          { drawSVG: '100%', duration: 1.2, ease: 'none', yoyo: true, repeatDelay: 0.3, repeat: -1 },
        )
      }
    },
    { dependencies: [animate] },
  )

  return (
    <svg
      width="52"
      height="25"
      viewBox="0 0 412 202"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={twJoin('absolute', className)}>
      <path
        ref={path}
        d="M168.5 57.5C149.5 40.5 136.5 30 106.68 30C64.3308 30 30 61.7878 30 101C30 140.212 64.3308 172 106.68 172C131.572 172 151 163 167.703 144L243 58.5C258 41.5 279.544 30 304.68 30C347.029 30 381.36 61.7878 381.36 101C381.36 140.212 347.029 172 304.68 172C279.544 172 264 162 243.249 143.5"
        stroke="#fff"
        strokeWidth={60}
      />
    </svg>
  )
})
LoopspeedLogo.displayName = 'LoopspeedLogo'
