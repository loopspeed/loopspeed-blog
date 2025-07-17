'use client'

import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import React, { type FC, useRef, useState } from 'react'

const LocalTime: FC = () => {
  const circleRef = useRef<HTMLDivElement>(null)
  const [time, setTime] = useState(new Date())

  useGSAP(() => {
    gsap.to(circleRef.current, {
      opacity: 0.2,
      duration: 1,
      repeat: -1,
      yoyo: true,
      ease: 'power1.inOut',
    })

    setTimeout(() => {
      setTime(new Date())
    }, 1000)
  }, [])

  const formattedTime = new Intl.DateTimeFormat('en', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(time)

  return (
    <div className="flex items-center gap-2 whitespace-nowrap">
      <div ref={circleRef} className="bg-accent-teal/30 flex size-3 items-center justify-center rounded-full">
        <div className="bg-accent-teal size-2 rounded-full" />
      </div>
      <span className="text-xs text-white">{formattedTime}</span>
    </div>
  )
}

export default LocalTime
