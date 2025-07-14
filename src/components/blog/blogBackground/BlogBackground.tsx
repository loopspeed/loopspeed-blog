'use client'
import { ScreenQuad, shaderMaterial } from '@react-three/drei'
import { Canvas, extend, useFrame } from '@react-three/fiber'
import React, { type FC, useRef } from 'react'
import { Color } from 'three'

import { DARK_VEC3, LIGHT_VEC3, MID_VEC3 } from '@/resources/colours'

import fragmentShader from './bg.frag'
import vertexShader from './bg.vert'

type Uniforms = {
  uTime: number
  uLightColour: Color
  uMidColour: Color
  uDarkColour: Color
}

const INITIAL_UNIFORMS: Uniforms = {
  uTime: 0,
  uLightColour: LIGHT_VEC3,
  uMidColour: MID_VEC3,
  uDarkColour: DARK_VEC3,
}

const BlogBackgroundShaderMaterial = shaderMaterial(INITIAL_UNIFORMS, vertexShader, fragmentShader)
const ShaderMaterial = extend(BlogBackgroundShaderMaterial)

const BlogBackgroundCanvas: FC = () => {
  return (
    <Canvas
      className="!fixed inset-0"
      gl={{
        alpha: false,
        antialias: false,
        powerPreference: 'low-power',
      }}>
      <BlogBackground />
    </Canvas>
  )
}

const BlogBackground: FC = () => {
  const material = useRef<typeof ShaderMaterial & Partial<Uniforms>>(null)

  useFrame(({ clock }) => {
    if (!material.current) return
    material.current.uTime = clock.elapsedTime
  })

  return (
    <ScreenQuad>
      <ShaderMaterial key={BlogBackgroundShaderMaterial.key} ref={material} uTime={0} />
    </ScreenQuad>
  )
}

export default BlogBackgroundCanvas
