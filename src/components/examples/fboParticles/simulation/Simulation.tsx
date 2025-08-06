'use client'

import { ScreenQuad, shaderMaterial } from '@react-three/drei'
import { createPortal, extend } from '@react-three/fiber'
import React, { forwardRef, memo, type RefObject } from 'react'
import { DataTexture, FloatType, Mesh, RGBAFormat, Scene, Vector3 } from 'three'
import { MeshSurfaceSampler } from 'three/addons/math/MeshSurfaceSampler.js'

import simulationFragment from './simulation.frag'
import simulationVertex from './simulation.vert'

type SimulationUniforms = {
  uTime: number
  uScatteredPositions: DataTexture | null
  uModelPositions: DataTexture | null
  uSpherePositions: DataTexture | null
  uRingPositions: DataTexture | null
  uSeedTexture: DataTexture | null
  uScatteredAmount: number
  uSphereAmount: number
  uRingAmount: number
}

const INITIAL_UNIFORMS: SimulationUniforms = {
  uTime: 0,
  uScatteredPositions: null,
  uModelPositions: null,
  uSpherePositions: null,
  uRingPositions: null,
  uSeedTexture: null,
  uScatteredAmount: 1,
  uSphereAmount: 0,
  uRingAmount: 0,
}

const CustomShaderMaterial = shaderMaterial(INITIAL_UNIFORMS, simulationVertex, simulationFragment)
const SimulationShaderMaterial = extend(CustomShaderMaterial)

type Props = {
  mesh: RefObject<Mesh | null>
  particlesCount: number
  textureSize: number
  fboScene: Scene
  seeds: Float32Array
}

export type SimulationShaderRef = typeof SimulationShaderMaterial & SimulationUniforms

const FBOPointsSimulation = forwardRef<SimulationShaderRef, Props>(
  ({ mesh, particlesCount, textureSize, fboScene, seeds }, ref) => {
    // Off-screen simulation material
    return (
      <>
        {createPortal(
          <ScreenQuad>
            <SimulationShaderMaterial
              key={CustomShaderMaterial.key}
              ref={ref}
              {...INITIAL_UNIFORMS}
              onBeforeCompile={(shader) => {
                if (!shader || !mesh.current) return

                // We calculate the positions for the particles at different stages
                // Then convert them into textures (that can read in the shader)
                // Finally set them as uniforms

                const scatteredPositions = createDataTextureFromPositions(
                  getMeshSurfacePositions({
                    mesh: mesh.current,
                    count: particlesCount,
                    scale: 3,
                  }),
                  textureSize,
                )

                const modelPositions = createDataTextureFromPositions(
                  getMeshSurfacePositions({
                    mesh: mesh.current,
                    count: particlesCount,
                    scale: mesh.current.scale.x,
                  }),
                  textureSize,
                )

                const spherePositions = createDataTextureFromPositions(
                  getSpherePositions({
                    count: particlesCount,
                    radius: 1.2,
                    offset: { x: 0, y: 0, z: 0 },
                  }),
                  textureSize,
                )

                const ringPositions = createDataTextureFromPositions(
                  getRingPositions({
                    count: particlesCount,
                    radius: 1.6,
                    spread: 0.3,
                    seeds: seeds,
                  }),
                  textureSize,
                )

                const seedTexture = createDataTextureFromSeeds(seeds, textureSize)

                shader.uniforms.uScatteredPositions = {
                  value: scatteredPositions as SimulationUniforms['uScatteredPositions'],
                }
                shader.uniforms.uModelPositions = {
                  value: modelPositions as SimulationUniforms['uModelPositions'],
                }
                shader.uniforms.uSpherePositions = {
                  value: spherePositions as SimulationUniforms['uSpherePositions'],
                }
                shader.uniforms.uRingPositions = {
                  value: ringPositions as SimulationUniforms['uRingPositions'],
                }
                shader.uniforms.uSeedTexture = {
                  value: seedTexture as SimulationUniforms['uSeedTexture'],
                }
              }}
            />
          </ScreenQuad>,
          fboScene,
        )}
      </>
    )
  },
)

FBOPointsSimulation.displayName = 'FBOPointsSimulation'

const createDataTextureFromSeeds = (seeds: Float32Array, textureSize: number): DataTexture => {
  const expectedLength = textureSize * textureSize * 4
  const data = new Float32Array(expectedLength)
  // Fill with each seed in the red channel, others are set to 0 (alpha = 1)
  for (let i = 0; i < textureSize * textureSize; i++) {
    data[i * 4] = seeds[i] !== undefined ? seeds[i] : 0
    data[i * 4 + 1] = 0
    data[i * 4 + 2] = 0
    data[i * 4 + 3] = 1
  }
  const dt = new DataTexture(data, textureSize, textureSize, RGBAFormat, FloatType)
  dt.needsUpdate = true
  return dt
}

const createDataTextureFromPositions = (positions: Float32Array, textureSize: number): DataTexture => {
  const expectedLength = textureSize * textureSize * 4
  if (positions.length !== expectedLength) {
    const padded = new Float32Array(expectedLength)
    padded.set(positions)
    positions = padded
  }
  const dt = new DataTexture(positions, textureSize, textureSize, RGBAFormat, FloatType)
  dt.needsUpdate = true
  return dt
}

const getMeshSurfacePositions = ({
  mesh,
  count,
  scale,
  offset,
  extrude,
}: {
  mesh: Mesh
  count: number
  scale?: number
  offset?: Vector3
  extrude?: number
}): Float32Array => {
  const positions = new Float32Array(count * 4)
  const sampler = new MeshSurfaceSampler(mesh).build()
  const pos = new Vector3()
  const normal = new Vector3()

  for (let i = 0; i < count; i++) {
    sampler.sample(pos, normal)
    // Extrude the position along its normal
    if (!!extrude) pos.addScaledVector(normal, extrude)
    // Apply scaling and offset
    if (!!scale) pos.multiplyScalar(scale)
    if (!!offset) pos.add(offset)
    positions.set([pos.x, pos.y, pos.z, 1.0], i * 4)
  }

  return positions
}

const getSpherePositions = ({
  count,
  radius,
  offset,
}: {
  count: number
  radius: number
  offset: { x: number; y: number; z: number }
}): Float32Array => {
  const positions = new Float32Array(count * 4)

  for (let i = 0; i < count; i++) {
    // Uniformly sample a point on the sphere
    const u = Math.random() * 2 - 1 // random value in [-1, 1]
    const phi = Math.random() * 2 * Math.PI // random angle in [0, 2π]

    // Convert spherical coordinates to Cartesian coordinates
    const sqrtOneMinusU2 = Math.sqrt(1 - u * u)
    const x = sqrtOneMinusU2 * Math.cos(phi) * radius + offset.x
    const y = sqrtOneMinusU2 * Math.sin(phi) * radius + offset.y
    const z = u * radius + offset.z
    const a = 1.0

    positions.set([x, y, z, a], i * 4)
  }

  return positions
}

const getRingPositions = ({
  count,
  radius,
  spread,
  seeds,
}: {
  count: number
  radius: number
  spread: number
  seeds: Float32Array
}): Float32Array => {
  const positions = new Float32Array(count * 4)

  for (let i = 0; i < count; i++) {
    // Apply greater spread if seed is less than 0.1
    const amplifiedSpread = seeds[i] < 0.25 ? spread * 3 : spread

    const angle = (i / count) * Math.PI * 2
    const x = Math.cos(angle) * radius + (Math.random() - 0.5) * amplifiedSpread
    const y = Math.sin(angle) * radius + (Math.random() - 0.5) * amplifiedSpread
    const z = (Math.random() - 0.5) * amplifiedSpread

    positions.set([x, y, z, 1.0], i * 4)
  }

  return positions
}

export default memo(FBOPointsSimulation)
