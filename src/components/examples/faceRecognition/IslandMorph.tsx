'use client'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { MorphSVGPlugin } from 'gsap/MorphSVGPlugin'
import { type FC, useRef, useState } from 'react'

gsap.registerPlugin(MorphSVGPlugin)

const pathStart =
  'M448.007 48C448.007 20 426.516 0 400.007 0H48C21.4904 0 0 20 0 48C0 76 22.3289 96 48 96H400.007C425.678 96 448.007 76 448.007 48Z'
const pathMiddle =
  'M406 48C406 20 384.51 0 358.001 0H89.9993C63.49 0 42 20 42 48C42 76 64.3286 96 89.9993 96H358.001C383.671 96 406 76 406 48Z'
const pathEnd =
  'M405 117C405 53 382 0 290 0H158C66 0 43 53 43 117V249C43 313 66 366 158 366H290C382 366 405 313 405 249V117Z'

const IslandMorph: FC = () => {
  const path = useRef<SVGPathElement>(null)
  const container = useRef<HTMLDivElement>(null)
  const tl = useRef<gsap.core.Timeline>(null)
  const [isExpanded, setIsExpanded] = useState(false)

  useGSAP(
    () => {
      tl.current = gsap
        .timeline({
          paused: true,
          defaults: { ease: 'power2.inOut' },
        })
        .to(path.current, {
          duration: 0.3,
          morphSVG: { shape: pathMiddle, type: 'linear', origin: '50% 0%' },
          transformOrigin: '50% 0%',
        })
        .to(path.current, {
          duration: 0.4,
          morphSVG: { shape: pathEnd, type: 'linear', origin: '50% 20%' },
          transformOrigin: '50% 20%',
        })
    },
    { scope: container },
  )

  const onClick = () => {
    const timeline = tl.current!

    if (isExpanded) {
      timeline.reverse()
    } else {
      timeline.play()
    }
    setIsExpanded(!isExpanded)
  }

  return (
    <section className="flex w-full flex-col items-center justify-center" ref={container}>
      <svg
        width="50%"
        viewBox="0 0 448 366"
        fill="none"
        className="flex items-center justify-center"
        xmlns="http://www.w3.org/2000/svg">
        <path ref={path} d={pathStart} fill="black" />
      </svg>
      <button onClick={onClick} className="mt-4 cursor-pointer rounded-full bg-black px-4 py-2 text-white">
        MORPH
      </button>
    </section>
  )
}

export default IslandMorph
