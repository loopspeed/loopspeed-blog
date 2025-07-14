import { shaderMaterial, ShapeProps, Sphere } from '@react-three/drei'
import { extend, useFrame } from '@react-three/fiber'
import React, { type FC, useRef } from 'react'
import { Color, SphereGeometry } from 'three'

import fragmentShader from './energySphere.frag'
import vertexShader from './energySphere.vert'

export const SPHERE_RADIUS = 0.2

type Uniforms = {
  uTime: number
  uSeed: number
  uColour: Color
  uIsOnLeft: boolean
}

const INITIAL_UNIFORMS: Uniforms = {
  uTime: 0,
  uSeed: 0,
  uColour: new Color('#ffffff'),
  uIsOnLeft: false,
}

const EnergySphereShaderMaterial = shaderMaterial(INITIAL_UNIFORMS, vertexShader, fragmentShader)

const EnergySphereShaderMaterialExtended = extend(EnergySphereShaderMaterial)

type Props = ShapeProps<typeof SphereGeometry> & {
  seed: number
  colour: Color
  isOnLeft: boolean
}

const EnergySphere: FC<Props> = ({ seed, colour, isOnLeft, ...props }) => {
  const shaderMaterial = useRef<typeof EnergySphereShaderMaterialExtended & Uniforms>(null)

  useFrame(({ clock }) => {
    if (!shaderMaterial.current) return
    shaderMaterial.current.uTime = clock.elapsedTime
  })

  return (
    <Sphere args={[SPHERE_RADIUS, 32, 32]} {...props}>
      <EnergySphereShaderMaterialExtended
        key={EnergySphereShaderMaterial.key}
        ref={shaderMaterial}
        attach="material"
        // transparent={true}
        uTime={0}
        uSeed={seed}
        uColour={colour}
        uIsOnLeft={isOnLeft}
      />
    </Sphere>
  )
}

export default EnergySphere
