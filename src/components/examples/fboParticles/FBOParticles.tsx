'use client'
import { useGSAP } from '@gsap/react'
import { PerformanceMonitor, Stats } from '@react-three/drei'
import { Canvas, extend } from '@react-three/fiber'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/dist/ScrollTrigger'
import React, { type FC, useLayoutEffect, useState } from 'react'
import * as THREE from 'three'

import Camera from './Camera'
import Points from './points/Points'

gsap.registerPlugin(useGSAP, ScrollTrigger)
ScrollTrigger.config({ ignoreMobileResize: true })

// @ts-expect-error - Extend THREE with the necessary types
extend(THREE)

const FBOParticlesCanvas: FC = () => {
  const [dpr, setDpr] = useState(1)
  const isMobile = false // TODO: pass in isMobile from the examples page....
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

  return (
    <main className="w-full bg-black">
      <Canvas
        className="fixed! top-0 left-0 h-lvh! w-full bg-black"
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
          <Points isMobile={isMobile} />
          <Camera isMobile={isMobile} />
        </PerformanceMonitor>
        {process.env.NODE_ENV === 'development' && <Stats />}
      </Canvas>
      {/* HTML sections for scroll triggers */}
      <section id="model" className="h-[120lvh] w-full" />
      <section id="sphere" className="h-[120lvh] w-full" />
      <section id="ring" className="h-[120lvh] w-full" />
    </main>
  )
}

export default FBOParticlesCanvas
