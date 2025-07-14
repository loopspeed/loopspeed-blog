'use client'

import { useGSAP } from '@gsap/react'
import { ScreenQuad, shaderMaterial } from '@react-three/drei'
import { extend, useFrame, useThree } from '@react-three/fiber'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/dist/ScrollTrigger'
import React, { type FC, useRef } from 'react'

import fragmentShader from './alone.frag'
import vertexShader from './screen.vert'

gsap.registerPlugin(useGSAP, ScrollTrigger)

type Uniforms = {
  uTime: number
  uScrollProgress: number
  uAspectRatio: number
}

const ArtShaderMaterial = shaderMaterial(
  {
    uTime: 0,
    uScrollProgress: 0,
    uAspectRatio: 1,
  } as Uniforms,
  vertexShader,
  fragmentShader,
)
const ShaderMaterial = extend(ArtShaderMaterial)

type Props = {
  screens: number
}

const ArtShader: FC<Props> = ({ screens }) => {
  const viewport = useThree((s) => s.viewport)
  const gradientShader = useRef<typeof ShaderMaterial & Partial<Uniforms>>(null)
  const scrollProgress = useRef(0)

  useFrame(({ clock }) => {
    if (!gradientShader.current) return
    gradientShader.current.uTime = clock.elapsedTime
    gradientShader.current.uScrollProgress = scrollProgress.current
  })

  useGSAP(() => {
    ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate: ({ progress }) => {
        const adjustedProgress = progress * screens
        scrollProgress.current = adjustedProgress
      },
    })
  }, [])

  return (
    <ScreenQuad>
      <ShaderMaterial
        key={ArtShaderMaterial.key}
        ref={gradientShader}
        uTime={0}
        uScrollProgress={0}
        uAspectRatio={viewport.aspect}
      />
    </ScreenQuad>
  )
}

export default ArtShader
