'use client'
import { useGSAP } from '@gsap/react'
import { PerformanceMonitor, Stats } from '@react-three/drei'
import { Canvas, extend } from '@react-three/fiber'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/dist/ScrollTrigger'
import React, { type FC, useLayoutEffect, useState } from 'react'
import * as THREE from 'three'

import Camera from './Camera'
import LoopPoints from './points/LoopPoints'

gsap.registerPlugin(useGSAP, ScrollTrigger)
ScrollTrigger.config({ ignoreMobileResize: true })

type Props = {
  isMobile: boolean
}

// @ts-expect-error - Extend THREE with the necessary types
extend(THREE)

const LandingCanvas: FC<Props> = ({ isMobile }) => {
  const [dpr, setDpr] = useState(1)
  const minDpr = isMobile ? 0.8 : 1

  useLayoutEffect(() => {
    setDpr(window.devicePixelRatio ?? 1)
  }, [])

  const onPerformanceInline = () => {
    if (dpr < window.devicePixelRatio) setDpr((prev) => prev + 0.2)
  }

  const onPerformanceDecline = () => {
    if (dpr > minDpr) setDpr((prev) => prev - 0.2)
  }

  // TODO: handle prefers reduced motion

  return (
    <Canvas
      className="bg-darkest pointer-events-none fixed! top-0 left-0 h-lvh! w-full sm:pointer-events-auto"
      camera={{ position: [0, 0, 5], fov: 60, far: 20, near: 0.01 }}
      performance={{ min: 0.5, max: 1, debounce: 300 }}
      dpr={dpr}
      flat={true}
      gl={{
        alpha: false,
        antialias: false,
      }}>
      <PerformanceMonitor
        onIncline={onPerformanceInline}
        onDecline={onPerformanceDecline}
        flipflops={5} // number of times it will incline/decline
        factor={0.8}
        step={0.1}>
        <LoopPoints isMobile={isMobile} />
        <Camera isMobile={isMobile} />
      </PerformanceMonitor>
      {process.env.NODE_ENV === 'development' && <Stats />}
    </Canvas>
  )
}

export default LandingCanvas
