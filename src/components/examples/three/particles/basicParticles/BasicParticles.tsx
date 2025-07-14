'use client'
import { shaderMaterial } from '@react-three/drei'
import { extend, useFrame } from '@react-three/fiber'
import React, { type FC, useMemo, useRef } from 'react'
import { AdditiveBlending } from 'three'

import { getRandomSpherePositions } from '@/utils/particles'

import particleFragment from './particle.frag'
import particleVertex from './particle.vert'

type Uniforms = {
  uTime: number
}

const INITIAL_UNIFORMS: Uniforms = {
  uTime: 0,
} as const

const BasicParticleShaderMaterial = shaderMaterial(INITIAL_UNIFORMS, particleVertex, particleFragment)
const ShaderMaterial = extend(BasicParticleShaderMaterial)

const BasicParticles: FC = () => {
  const particlesCount = 2048
  const particlesPosition: Float32Array = useMemo(() => getRandomSpherePositions(particlesCount), [particlesCount])
  const particlesShader = useRef<typeof ShaderMaterial & Uniforms>(null)

  useFrame(({ clock }) => {
    if (!particlesShader.current) return
    particlesShader.current.uTime = clock.elapsedTime
  })

  return (
    <>
      <points>
        {/* Basic setup with predefined geometry and material */}
        {/* <sphereGeometry attach="geometry" args={[2, 48, 48]} /> */}
        {/* <boxGeometry attach="geometry" args={[1, 1, 1, 16, 16, 16]} /> */}

        {/* <pointsMaterial
          attach="material"
          color="#45F1A6"
          size={0.1}
          opacity={0.5}
          // depthTest={false}
          transparent={true}
          sizeAttenuation={true}
          blending={AdditiveBlending}
        /> */}

        <bufferGeometry attach="geometry">
          <bufferAttribute attach="attributes-position" args={[particlesPosition, 3]} />
        </bufferGeometry>

        <ShaderMaterial
          attach="material"
          key={BasicParticleShaderMaterial.key}
          ref={particlesShader}
          uTime={0}
          depthTest={false}
          transparent={true}
          blending={AdditiveBlending}
        />
      </points>
    </>
  )
}

export default BasicParticles
