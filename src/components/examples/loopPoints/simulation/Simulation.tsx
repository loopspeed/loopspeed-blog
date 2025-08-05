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
  uLoopPositions: DataTexture | null
  uLeftSpherePositions: DataTexture | null
  uRightSpherePositions: DataTexture | null
  uProcessPositions: DataTexture | null
  uSeedTexture: DataTexture | null
  uScatteredAmount: number
  uAboutAmount: number
  uProcessAmount: number
  uSpheresGlobalCenter: Vector3
  uSpheresGlobalDir: Vector3
}

const INITIAL_UNIFORMS: SimulationUniforms = {
  uTime: 0,
  uScatteredPositions: null,
  uLoopPositions: null,
  uLeftSpherePositions: null,
  uRightSpherePositions: null,
  uProcessPositions: null,
  uSeedTexture: null,
  uScatteredAmount: 1,
  uAboutAmount: 0,
  uProcessAmount: 0,

  // Used to center the About spheres based on their positions
  uSpheresGlobalCenter: new Vector3(-0.2, -0.5, 0.3), // (uLeftSphereCenter + uRightSphereCenter) * 0.5
  uSpheresGlobalDir: new Vector3(0.8, 1.5, 1.8).normalize(), // normalize(uRightSphereCenter - uLeftSphereCenter)
}

const CustomShaderMaterial = shaderMaterial(INITIAL_UNIFORMS, simulationVertex, simulationFragment)
const SimulationShaderMaterial = extend(CustomShaderMaterial)

type Props = {
  loopMesh: RefObject<Mesh | null>
  particlesCount: number
  fboScene: Scene
  seeds: Float32Array
}

export type SimulationShaderRef = typeof SimulationShaderMaterial & SimulationUniforms

const LoopParticleSimulationMaterial = forwardRef<SimulationShaderRef, Props>(
  ({ loopMesh, particlesCount, fboScene, seeds }, ref) => {
    // const viewport = useThree((s) => s.viewport)
    const textureSize = Math.sqrt(particlesCount)
    // TODO: use this to simplify noise etc.
    // const currentPerformance = useThree((s) => s.performance).current

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
                if (!shader || !loopMesh.current) return

                const scatteredPositions = createDataTextureFromPositions(
                  getMeshSurfacePositions({
                    mesh: loopMesh.current,
                    count: particlesCount,
                    scale: loopMesh.current.scale.x,
                    // offset: new Vector3(0, 0, 0),
                    extrude: 0.5, // Extrude the positions along their normals
                  }),
                  textureSize,
                )

                const loopPositions = createDataTextureFromPositions(
                  getMeshSurfacePositions({
                    mesh: loopMesh.current,
                    count: particlesCount,
                    scale: loopMesh.current.scale.x,
                  }),
                  textureSize,
                )

                const leftSpherePositions = createDataTextureFromPositions(
                  getSpherePositions({
                    count: particlesCount,
                    radius: 0.5,
                    // If these offset values are changed, adjust the uSpheresGlobalCenter & uSpheresGlobalDir uniforms to match
                    offset: { x: -2, y: -1, z: -0.6 },
                  }),
                  textureSize,
                )

                const rightSpherePositions = createDataTextureFromPositions(
                  getSpherePositions({
                    count: particlesCount,
                    radius: 0.8,
                    offset: { x: 1.6, y: 1, z: 1.2 },
                  }),
                  textureSize,
                )

                const processSpherePositions = createDataTextureFromPositions(
                  getRingPositions({
                    count: particlesCount,
                    radius: 1.7,
                    spread: 0.3,
                    seeds: seeds,
                    offset: { x: 0, y: 0, z: 0 },
                  }),
                  textureSize,
                )

                const seedTexture = createDataTextureFromSeeds(seeds, textureSize)

                shader.uniforms.uScatteredPositions = {
                  value: scatteredPositions as SimulationUniforms['uScatteredPositions'],
                }
                shader.uniforms.uLoopPositions = {
                  value: loopPositions as SimulationUniforms['uLoopPositions'],
                }
                shader.uniforms.uLeftSpherePositions = {
                  value: leftSpherePositions as SimulationUniforms['uLeftSpherePositions'],
                }
                shader.uniforms.uRightSpherePositions = {
                  value: rightSpherePositions as SimulationUniforms['uRightSpherePositions'],
                }
                shader.uniforms.uProcessPositions = {
                  value: processSpherePositions as SimulationUniforms['uProcessPositions'],
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

LoopParticleSimulationMaterial.displayName = 'LoopParticleSimulationMaterial'

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
  offset,
  spread,
  seeds,
}: {
  count: number
  radius: number
  offset: { x: number; y: number; z: number }
  spread: number
  seeds: Float32Array
}): Float32Array => {
  const positions = new Float32Array(count * 4)

  for (let i = 0; i < count; i++) {
    // Apply greater spread if seed is less than 0.1
    const amplifiedSpread = seeds[i] < 0.25 ? spread * 3 : spread

    const angle = (i / count) * Math.PI * 2
    const x = Math.cos(angle) * radius + offset.x + (Math.random() - 0.5) * amplifiedSpread
    const y = Math.sin(angle) * radius + offset.y + (Math.random() - 0.5) * amplifiedSpread
    const z = offset.z + (Math.random() - 0.5) * amplifiedSpread

    positions.set([x, y, z, 1.0], i * 4)
  }

  return positions
}

// const getScatteredPositions = (count: number, viewport: Viewport): Float32Array => {
//   const positions = new Float32Array(count * 4)

//   // spread across a box
//   const width = viewport.width + 1
//   const height = viewport.height + 1
//   const depth = 2

//   for (let i = 0; i < count; i++) {
//     const x = Math.random() * width - width / 2
//     const y = Math.random() * height - height / 2
//     const z = Math.random() * depth - depth / 2
//     const a = 1.0

//     positions.set([x, y, z, a], i * 4)
//   }

//   return positions
// }

export default memo(LoopParticleSimulationMaterial)
