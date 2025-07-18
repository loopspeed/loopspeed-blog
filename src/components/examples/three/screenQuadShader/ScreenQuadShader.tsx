'use client'

import { ScreenQuad, shaderMaterial, useTexture } from '@react-three/drei'
import { extend, useFrame, useThree } from '@react-three/fiber'
import React, { type FC, useRef } from 'react'
import { Texture } from 'three'

import gradientFragment from './gradient.frag'
import vertexShader from './screen.vert'
import textureImg from './texture.jpg'

// Boilerplate for creating a screen quad shader - ideal for backgrounds, post-processing effects, etc.

type Uniforms = {
  uTime: number
  uAspect: number
  uTexture: Texture | null
}

const INITIAL_UNIFORMS: Uniforms = {
  uTime: 0,
  uAspect: 1,
  uTexture: null,
}

const ScreenQuadShaderMaterial = shaderMaterial(INITIAL_UNIFORMS, vertexShader, gradientFragment)
const ScreenQuadShader_Extended = extend(ScreenQuadShaderMaterial)

const ScreenQuadShader: FC = () => {
  const texture = useTexture(textureImg.src)
  const { viewport } = useThree()
  const shader = useRef<typeof ScreenQuadShader_Extended & Partial<Uniforms>>(null)

  useFrame(({ clock }) => {
    if (!shader.current) return
    shader.current.uTime = clock.elapsedTime
  })

  return (
    <ScreenQuad>
      <ScreenQuadShader_Extended
        key={ScreenQuadShaderMaterial.key}
        ref={shader}
        // Uniforms
        uTime={0}
        uAspect={viewport.aspect}
        uTexture={texture}
      />
    </ScreenQuad>
  )
}

export default ScreenQuadShader
