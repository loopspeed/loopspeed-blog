'use client'

import { useGSAP } from '@gsap/react'
import { OrthographicCamera, PerformanceMonitor } from '@react-three/drei'
import { Canvas, extend, type ThreeToJSXElements, useFrame, useThree } from '@react-three/fiber'
import gsap from 'gsap'
import { useControls } from 'leva'
import { type FC, useEffect, useMemo, useRef } from 'react'
import { bloom } from 'three/examples/jsm/tsl/display/BloomNode.js'
import { degToRad } from 'three/src/math/MathUtils.js'
import { color, ShaderNodeObject } from 'three/src/nodes/tsl/TSLBase.js'
import { type WebGPURendererParameters } from 'three/src/renderers/webgpu/WebGPURenderer.js'
import {
  abs,
  blendScreen,
  Break,
  cos,
  float,
  Fn,
  If,
  int,
  length,
  Loop,
  mat2,
  max,
  min,
  mix,
  mrt,
  normalize,
  output,
  pass,
  positionGeometry,
  screenUV,
  select,
  sin,
  step,
  uniform,
  varying,
  vec2,
  vec3,
  vec4,
  viewportSize,
} from 'three/tsl'
import { WebGPURenderer } from 'three/webgpu'
import * as THREE from 'three/webgpu'

import { useFaceIDStore, VerificationStatus } from '@/components/examples/rebuilds/faceId/useFaceIDStore'

declare module '@react-three/fiber' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface ThreeElements extends ThreeToJSXElements<typeof THREE> {}
}

extend(THREE as any)

type Props = {
  className?: string
  style?: React.CSSProperties
}

const TSLFaceIDCanvas: FC<Props> = ({ className, style }) => {
  return (
    <Canvas
      id="face-id-unlocking-canvas"
      className={className}
      style={style}
      performance={{ min: 0.3, debounce: 300 }}
      flat={true}
      gl={async (props) => {
        const renderer = new WebGPURenderer(props as WebGPURendererParameters)
        renderer.outputColorSpace = 'srgb'
        renderer.toneMapping = THREE.NoToneMapping
        renderer.transparent = false
        renderer.alpha = false
        await renderer.init()
        return renderer
      }}>
      <OrthographicCamera makeDefault={true} position={[0, 0, 1]} near={0.1} far={2} />
      <PerformanceMonitor>
        <FaceIDUnlockingRays />
        <Bloom />
      </PerformanceMonitor>
    </Canvas>
  )
}

export default TSLFaceIDCanvas

// https://github.com/ektogamat/r3f-webgpu-starter/blob/main/src/components/WebGPUPostProcessing.js
const Bloom: FC = () => {
  const status = useFaceIDStore((s) => s.status)

  const scene = useThree((s) => s.scene)
  const renderer = useThree((s) => s.gl) as unknown as WebGPURenderer
  const camera = useThree((s) => s.camera)
  const postProcessing = useRef<THREE.PostProcessing | null>(null)

  const uBloomIntensity = useMemo(() => {
    return uniform(float(0.0)).label('uBloomIntensity')
  }, [])

  useGSAP(
    () => {
      gsap.to(uBloomIntensity, {
        value: status === VerificationStatus.Analysing ? 1.0 : 0.0,
        duration: status === VerificationStatus.Analysing ? 0.4 : 0.15,
      })
    },
    {
      dependencies: [status],
    },
  )

  useEffect(() => {
    if (!renderer || !scene || !camera) return

    const scenePass = pass(scene, camera, {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
    })

    // Setup Multiple Render Targets (MRT)
    scenePass.setMRT(
      mrt({
        output,
      }),
    )

    // Get texture nodes - these represent the rendered outputs
    const scenePassColor = scenePass.getTextureNode('output')
    // const scenePassEmissive = scenePass.getTextureNode('emissive')

    // Apply bloom with dynamic intensity
    // 1 - Generate bloom pass
    // 2 - Blend it over the scene colour based on intensity uniform
    const bloomPass = bloom(scenePassColor, 0.18, 0.2)
    const finalPass = mix(scenePassColor, blendScreen(bloomPass, scenePassColor), uBloomIntensity)

    postProcessing.current = new THREE.PostProcessing(renderer)
    postProcessing.current.outputNode = finalPass

    return () => {
      postProcessing.current?.dispose()
      postProcessing.current = null
    }
  }, [camera, renderer, scene, uBloomIntensity])

  useFrame(({ gl }) => {
    if (!postProcessing.current) return
    gl.clear()
    postProcessing.current.render()
  }, 1) // Priority 1 ensures this runs after the main scene render

  return null
}

// Volume Rendering documentation:
// https://www.scratchapixel.com/lessons/3d-basic-rendering/volume-rendering-for-developers/ray-marching-algorithm.html

// Constants
const OPACITY_IDLE = 0.0
const SOLIDIFICATION_IDLE = 0.0
const SOLIDIFICATION_MAX = 1.0

const DENSITY_IDLE = 0.0
const DENSITY_MAX = 10.0
const SCATTERING_IDLE = 0.1
const SCATTERING_MAX = 20.0
const FALLOFF_DISTANCE_IDLE = 0.4
const FALLOFF_DISTANCE_MIN = 0.04
const FALLOFF_DISTANCE_MAX = 0.4
const RING_A_VISIBILITY_IDLE = 0.3
const RING_B_VISIBILITY_IDLE = 0.3
const MIX_STRENGTH_IDLE = 0.0

const FaceIDUnlockingRays: FC = () => {
  const nodes = useMemo(() => {
    const uOpacity = uniform(float(OPACITY_IDLE)).label('uOpacity')
    const uSolidification = uniform(float(SOLIDIFICATION_IDLE)).label('uSolidification') // 0 = soft/transparent, 1 = solid
    const uDensity = uniform(float(DENSITY_IDLE)).label('uDensity') // Volume density coefficient - Higher density: More material present, more interactions with light
    const uScattering = uniform(float(SCATTERING_IDLE)).label('uScattering') // Scattering coefficient - Controls the brightness/luminosity of the volumetric material
    const uFallOffDistance = uniform(float(FALLOFF_DISTANCE_IDLE)).label('uFallOffDistance') // Distance over which density falls off (softness)

    const uRingMixStrength = uniform(float(MIX_STRENGTH_IDLE)).label('uRingMixStrength') // Smooth minimum blending strength between rings
    const uRingAVisibility = uniform(float(RING_A_VISIBILITY_IDLE)).label('uRingAVisibility') // 0 = hidden, 1 = visible
    const uRingBVisibility = uniform(float(RING_B_VISIBILITY_IDLE)).label('uRingBVisibility') // 0 = hidden, 1 = visible
    const uRingARotation = uniform(vec3(0, 0, 0)).label('uRingARotation')
    const uRingBRotation = uniform(vec3(0, 0, 0)).label('uRingBRotation')

    const MAX_ITERATIONS = int(80)
    const MAX_DISTANCE = float(6.0)
    const OBJECT_POS = vec3(0, 0, 0.0)
    // Torus parameters
    const TORUS_RADIUS = float(1.0)
    const TORUS_TUBE_RADIUS = float(0.035)

    // Volumetric density function for torus rings - returns both density and material ID
    const getDensityWithMaterial = Fn(([p]: [p: ShaderNodeObject<THREE.VarNode>]) => {
      // Base position relative to object center
      const baseP = p.toVar().sub(OBJECT_POS)

      // Calculate distances for both rings separately
      const ringADistance = float(0).toVar()
      const ringBDistance = float(0).toVar()

      // Ring A: Use uRingARotation for full 3D rotation (x, y, z)
      const torusPA = baseP.toVar()
      // Apply X-axis rotation (YZ plane)
      const rotXA = rotate2D(uRingARotation.x)
      torusPA.yz.assign(torusPA.yz.mul(rotXA))
      // Apply Y-axis rotation (XZ plane)
      const rotYA = rotate2D(uRingARotation.y)
      torusPA.xz.assign(torusPA.xz.mul(rotYA))
      // Apply Z-axis rotation (XY plane)
      const rotZA = rotate2D(uRingARotation.z)
      torusPA.xy.assign(torusPA.xy.mul(rotZA))
      ringADistance.assign(torusSDF(torusPA, vec2(TORUS_RADIUS, TORUS_TUBE_RADIUS)))

      // Ring B: Use uRingBRotation for full 3D rotation (x, y, z)
      const torusPB = baseP.toVar()
      // Apply X-axis rotation (YZ plane)
      const rotXB = rotate2D(uRingBRotation.x)
      torusPB.yz.assign(torusPB.yz.mul(rotXB))
      // Apply Y-axis rotation (XZ plane)
      const rotYB = rotate2D(uRingBRotation.y)
      torusPB.xz.assign(torusPB.xz.mul(rotYB))
      // Apply Z-axis rotation (XY plane)
      const rotZB = rotate2D(uRingBRotation.z)
      torusPB.xy.assign(torusPB.xy.mul(rotZB))
      ringBDistance.assign(torusSDF(torusPB, vec2(TORUS_RADIUS, TORUS_TUBE_RADIUS)))

      // Create material-based approach with ring identification
      // Ring A gets material ID 1.0, Ring B gets material ID 2.0
      const ringAWithMaterial = vec2(ringADistance, float(1.0))
      const ringBWithMaterial = vec2(ringBDistance, float(2.0))

      // Use smooth minimum with material blending for organic mixing
      const blendedResult = smoothMinWithMaterial(ringAWithMaterial, ringBWithMaterial, uRingMixStrength)
      const blendedDistance = blendedResult.x
      const materialId = blendedResult.y

      // Convert blended distance to density using smooth falloff
      const falloffDistance = uFallOffDistance
      const baseDensity = float(1.0).sub(abs(blendedDistance).div(falloffDistance)).clamp(0.0, 1.0)

      // Apply smoothstep for better falloff
      const smoothDensity = baseDensity.mul(baseDensity).mul(float(3.0).sub(baseDensity.mul(2.0)))

      // Apply ring-specific visibility based on material ID
      // When materialId is close to 1.0, it's mostly Ring A
      // When materialId is close to 2.0, it's mostly Ring B
      // Fractional values indicate blending between rings
      const ringAWeight = float(2.0).sub(materialId).clamp(0.0, 1.0) // 1.0 for pure Ring A, 0.0 for pure Ring B
      const ringBWeight = materialId.sub(1.0).clamp(0.0, 1.0) // 0.0 for pure Ring A, 1.0 for pure Ring B

      // Apply visibility controls to the density based on material contribution
      const visibilityModulator = ringAWeight.mul(uRingAVisibility).add(ringBWeight.mul(uRingBVisibility))

      const finalDensity = smoothDensity.mul(visibilityModulator).mul(uDensity).mul(uOpacity)

      // Return both density and material ID for color determination
      return vec2(finalDensity, materialId)
    }).setLayout({
      name: 'getDensityWithMaterial',
      type: 'vec2',
      inputs: [{ name: 'p', type: 'vec3' }],
    })

    // Function to get ring-specific colors based on material ID
    const getRingColor = Fn(([materialId]: [materialId: ShaderNodeObject<THREE.VarNode>]) => {
      // const ringAColor = color('#AFF8A5') // Original green color
      // const ringBColor = color('#AFF8A5')
      const blendFactor = materialId.sub(1.0).clamp(0.0, 1.0)
      return mix(color('#AFF8A5'), color('#AFF8A5'), blendFactor)
    }).setLayout({
      name: 'getRingColor',
      type: 'vec4',
      inputs: [{ name: 'materialId', type: 'float' }],
    })

    // Volumetric ray marching using forward marching
    const volumetricRayMarch = Fn(
      ([ro, rd]: [ro: ShaderNodeObject<THREE.VarNode>, rd: ShaderNodeObject<THREE.VarNode>]) => {
        const stepSize = float(0.05).toVar() // Fixed step size for volumetric rendering
        const transmission = float(1.0).toVar() // Start fully transparent
        const scatteredLight = vec3(0.0).toVar() // Accumulated scattered light

        // Volume bounds - simple sphere for now
        const volumeCenter = OBJECT_POS
        const volumeRadius = float(3.0)

        // Ray-sphere intersection to find volume bounds
        const oc = ro.sub(volumeCenter)
        const a = rd.dot(rd)
        const b = float(2.0).mul(oc.dot(rd))
        const c = oc.dot(oc).sub(volumeRadius.mul(volumeRadius))
        const discriminant = b.mul(b).sub(float(4.0).mul(a).mul(c))

        // Early exit if no intersection
        If(discriminant.lessThan(0.0), () => {
          // Return background contribution only
        })

        const t0 = b.negate().sub(discriminant.sqrt()).div(float(2.0).mul(a)).max(0.0)
        const t1 = b.negate().add(discriminant.sqrt()).div(float(2.0).mul(a))

        const startT = t0
        const endT = min(t1, MAX_DISTANCE)

        // Forward ray marching
        Loop(MAX_ITERATIONS, ({ i }) => {
          const t = startT.add(float(i).mul(stepSize))

          // Exit if we've gone past the volume
          If(t.greaterThanEqual(endT), () => {
            Break()
          })

          const samplePos = ro.add(rd.mul(t))
          const densityResult = getDensityWithMaterial(samplePos)
          const density = densityResult.x
          const materialId = densityResult.y

          // Skip if no density
          If(density.lessThanEqual(0.001), () => {
            // Continue to next sample
          }).Else(() => {
            // Calculate absorption coefficient based on density and solidification
            // Much higher range for full opacity control
            const absorptionCoeff = density.mul(mix(float(0.1), float(10.0), uSolidification))

            // Beer's law for sample transmission
            const sampleTransmission = absorptionCoeff.mul(stepSize).negate().exp()

            // In-scattering calculation
            // Simplified directional lighting
            const lightIntensity = float(1.2) // Could be attenuated by distance

            // Phase function (simplified isotropic scattering)
            const phaseFunction = float(1.0).div(float(4.0).mul(Math.PI))

            // Scattering coefficient - allow higher values for opacity
            const scatteringCoeff = density.mul(uScattering).mul(mix(float(1.0), float(3.0), uSolidification))

            // Amount of light scattered toward camera
            const scatteredContrib = lightIntensity
              .mul(scatteringCoeff)
              .mul(phaseFunction)
              .mul(stepSize)
              .mul(transmission) // Attenuated by accumulated transmission

            // Get ring-specific color based on material ID
            const ringColor = getRingColor(materialId).mul(mix(float(0.2), float(1.0), uSolidification))
            scatteredLight.addAssign(ringColor.mul(scatteredContrib))

            // Update transmission for next samples
            transmission.mulAssign(sampleTransmission)

            // Lower early termination threshold for higher opacity
            If(transmission.lessThan(0.005), () => {
              Break()
            })
          })
        })

        return vec4(scatteredLight, float(1.0).sub(transmission)) // Return color and opacity
      },
    ).setLayout({
      name: 'volumetricRayMarch',
      type: 'vec4',
      inputs: [
        { name: 'ro', type: 'vec3' },
        { name: 'rd', type: 'vec3' },
      ],
    })

    const main = Fn(() => {
      // VOLUMETRIC RAY MARCHING MAIN FUNCTION

      // Use frag coordinates to get an aspect-fixed UV
      const aspect = viewportSize.x.div(viewportSize.y)
      const _uv = screenUV.toVar().sub(vec2(0.5, 0.5))
      _uv.x.mulAssign(aspect)

      const ro = vec3(0.0, 0.0, 4.0) // Ray origin (camera position)
      const rd = normalize(vec3(_uv, -1.0)) // Ray direction (camera forward)

      // Volumetric ray marching
      const volumeResult = volumetricRayMarch(ro, rd)
      const volumeColor = volumeResult.xyz
      const volumeOpacity = volumeResult.w

      // Background color
      const backgroundColor = color('#000000')

      // Combine volume with background using alpha blending
      const finalColor = backgroundColor.mul(float(1.0).sub(volumeOpacity)).add(volumeColor)

      return vec4(finalColor, 1.0)
    })()

    const screenQuadVertexNode = Fn(() => {
      const vUv = varying(vec2(), 'vUv')
      vUv.assign(positionGeometry.xy.mul(0.5).add(0.5))
      return vec4(positionGeometry.xy, 0.0, 1.0)
    })()

    return {
      colorNode: main,
      vertexNode: screenQuadVertexNode,
      uOpacity,
      uSolidification,
      uDensity,
      uScattering,
      uFallOffDistance,
      uRingARotation,
      uRingBRotation,
      uRingMixStrength,
      uRingAVisibility,
      uRingBVisibility,
    }
  }, [])

  useAnimateUniforms({ nodes })

  const screenQuadGeometry = useMemo(() => createScreenQuadGeometry(), [])

  return (
    <mesh geometry={screenQuadGeometry} frustumCulled={false}>
      <meshBasicNodeMaterial colorNode={nodes.colorNode} vertexNode={nodes.vertexNode} />
    </mesh>
  )
}

type NodesType = {
  colorNode: ShaderNodeObject<THREE.TSL.ShaderCallNodeInternal>
  vertexNode: ShaderNodeObject<THREE.TSL.ShaderCallNodeInternal>
  uOpacity: ShaderNodeObject<THREE.UniformNode<number>>
  uSolidification: ShaderNodeObject<THREE.UniformNode<number>>
  uDensity: ShaderNodeObject<THREE.UniformNode<number>>
  uScattering: ShaderNodeObject<THREE.UniformNode<number>>
  uFallOffDistance: ShaderNodeObject<THREE.UniformNode<number>>
  uRingARotation: ShaderNodeObject<THREE.UniformNode<{ x: number; y: number; z: number }>>
  uRingBRotation: ShaderNodeObject<THREE.UniformNode<{ x: number; y: number; z: number }>>
  uRingMixStrength: ShaderNodeObject<THREE.UniformNode<number>>
  uRingAVisibility: ShaderNodeObject<THREE.UniformNode<number>>
  uRingBVisibility: ShaderNodeObject<THREE.UniformNode<number>>
}

function useAnimateUniforms({ nodes }: { nodes: NodesType }) {
  const status = useFaceIDStore((s) => s.status)
  const tweens = useRef<gsap.core.Tween[]>([])

  const {
    uRingARotation,
    uRingBRotation,
    uOpacity,
    uSolidification,
    uDensity,
    uScattering,
    uFallOffDistance,
    uRingMixStrength,
    uRingAVisibility,
    uRingBVisibility,
  } = nodes

  const [, setControls] = useControls(
    'Rings',
    () => {
      return {
        density: {
          label: 'Density',
          value: DENSITY_IDLE,
          step: 0.25,
          min: 0.0,
          max: DENSITY_MAX,
          onChange: (value) => {
            uDensity.value = value
          },
        },
        scattering: {
          label: 'Scattering',
          value: SCATTERING_IDLE,
          step: 0.1,
          min: 0.0,
          max: SCATTERING_MAX,
          onChange: (value) => {
            uScattering.value = value
          },
        },
        solidification: {
          label: 'Solidification',
          value: SOLIDIFICATION_IDLE,
          step: 0.05,
          min: 0.0,
          max: SOLIDIFICATION_MAX,
          onChange: (value) => {
            uSolidification.value = value
          },
        },
        fallOffDistance: {
          label: 'Falloff Distance',
          value: FALLOFF_DISTANCE_IDLE,
          step: 0.01,
          min: FALLOFF_DISTANCE_MIN,
          max: FALLOFF_DISTANCE_MAX,
          onChange: (value) => {
            uFallOffDistance.value = value
          },
        },
        ringMixStrength: {
          label: 'Ring Mix Strength',
          value: MIX_STRENGTH_IDLE,
          step: 0.1,
          min: 0.1,
          max: 1.0,
          onChange: (value) => {
            uRingMixStrength.value = value
          },
        },
        ringAVisibility: {
          label: 'Ring A Visibility',
          value: RING_A_VISIBILITY_IDLE,
          step: 0.1,
          min: 0.0,
          max: 1.0,
          onChange: (value) => {
            uRingAVisibility.value = value
          },
        },
        ringBVisibility: {
          label: 'Ring B Visibility',
          value: RING_B_VISIBILITY_IDLE,
          step: 0.1,
          min: 0.0,
          max: 1.0,
          onChange: (value) => {
            uRingBVisibility.value = value
          },
        },
      }
    },
    { collapsed: true },
  )

  useEffect(() => {
    // Kill any existing tweens
    tweens.current.forEach((tween) => tween.kill())
    tweens.current = []

    if (status === VerificationStatus.Idle) {
      // Reset all values to idle state
      tweens.current = [
        gsap.to(uOpacity, {
          value: OPACITY_IDLE,
          duration: 0.2,
        }),
        gsap.to(uDensity, {
          value: DENSITY_IDLE,
          duration: 0.2,
          onUpdate: () => setControls({ density: uDensity.value }),
        }),
        gsap.set(uFallOffDistance, {
          value: FALLOFF_DISTANCE_IDLE,
          onComplete: () => setControls({ fallOffDistance: uFallOffDistance.value }),
        }),
        gsap.set(uSolidification, {
          value: SOLIDIFICATION_IDLE,
          onComplete: () => setControls({ solidification: uSolidification.value }),
        }),
        gsap.set(uScattering, {
          value: SCATTERING_IDLE,
          onComplete: () => setControls({ scattering: uScattering.value }),
        }),
        gsap.set(uRingMixStrength, {
          value: MIX_STRENGTH_IDLE,
          onComplete: () => setControls({ ringMixStrength: uRingMixStrength.value }),
        }),
        gsap.set(uRingAVisibility, {
          value: RING_A_VISIBILITY_IDLE,
          onComplete: () => setControls({ ringAVisibility: uRingAVisibility.value }),
        }),
        gsap.set(uRingBVisibility, {
          value: RING_B_VISIBILITY_IDLE,
          onComplete: () => setControls({ ringBVisibility: uRingBVisibility.value }),
        }),
        gsap.set(uRingARotation.value, { x: 0, y: 0, z: 0 }),
        gsap.set(uRingBRotation.value, { x: 0, y: 0, z: 0 }),
      ]
    }

    if (status === VerificationStatus.Analysing) {
      const delay = 0.2

      tweens.current = [
        gsap.to(uDensity, {
          value: 5.0,
          duration: 1,
          ease: 'power2.out',
          delay,
          onUpdate: () => setControls({ density: uDensity.value }),
        }),
        gsap.to(uScattering, {
          value: 12.0,
          duration: 4.0,
          ease: 'power2.out',
          delay,
          onUpdate: () => setControls({ scattering: uScattering.value }),
        }),
        gsap.to(uFallOffDistance, {
          value: 0.16,
          duration: 4.0,
          ease: 'power2.out',
          delay,
          onUpdate: () => setControls({ fallOffDistance: uFallOffDistance.value }),
        }),
        gsap.to(uSolidification, {
          value: 0.0,
          duration: 0.5,
          ease: 'power2.out',
          delay,
          onUpdate: () => setControls({ solidification: uSolidification.value }),
        }),
        gsap.to(uRingMixStrength, {
          value: 1.0,
          duration: 1.5,
          delay,
          onUpdate: () => setControls({ ringMixStrength: uRingMixStrength.value }),
        }),
        gsap.to(uOpacity, {
          value: 0.8,
          duration: 0.3,
          ease: 'power2.out',
          delay,
        }),
        gsap.to(uRingARotation.value, {
          x: 0,
          y: degToRad(-360),
          z: degToRad(360),
          duration: 1.3,
          repeat: -1,
          ease: 'none',
          delay,
        }),
        gsap.to(uRingBRotation.value, {
          x: 0,
          y: degToRad(360),
          z: degToRad(-360),
          duration: 0.7,
          repeat: -1,
          ease: 'none',
          delay: 0.2,
        }),
        gsap.fromTo(
          uRingBVisibility,
          { value: RING_B_VISIBILITY_IDLE },
          {
            value: 1.0,
            yoyo: true,
            repeat: -1,
            duration: 0.8,
            ease: 'power1.inOut',
            delay,
            onUpdate: () => setControls({ ringBVisibility: uRingBVisibility.value }),
          },
        ),
        gsap.fromTo(
          uRingAVisibility,
          { value: RING_A_VISIBILITY_IDLE },
          {
            value: 1.0,
            yoyo: true,
            repeat: -1,
            duration: 1.4,
            ease: 'power1.inOut',
            delay,
            onUpdate: () => setControls({ ringAVisibility: uRingAVisibility.value }),
          },
        ),
      ]
    }

    if (status === VerificationStatus.Success) {
      // Make the rings solid and forward facing, fade 1 ring out
      tweens.current = [
        gsap.to(uDensity, {
          value: DENSITY_MAX,
          duration: 0.3,
          ease: 'power1.out',
          onUpdate: () => setControls({ density: uDensity.value }),
        }),
        gsap.to(uScattering, {
          value: SCATTERING_MAX,
          duration: 0.3,
          ease: 'power1.out',
          onUpdate: () => setControls({ scattering: uScattering.value }),
        }),
        gsap.to(uSolidification, {
          value: SOLIDIFICATION_MAX,
          duration: 0.3,
          ease: 'power1.out',
          onUpdate: () => setControls({ solidification: uSolidification.value }),
        }),
        gsap.to(uOpacity, {
          value: 1,
          duration: 0.3,
          ease: 'power1.out',
        }),
        gsap.to(uRingMixStrength, {
          value: 0.05,
          duration: 0.3,
          ease: 'power1.out',
          onUpdate: () => setControls({ ringMixStrength: uRingMixStrength.value }),
        }),
        gsap.to(uFallOffDistance, {
          value: FALLOFF_DISTANCE_MIN,
          duration: 0.3,
          ease: 'power1.out',
          onUpdate: () => setControls({ fallOffDistance: uFallOffDistance.value }),
        }),
        gsap.to(uRingAVisibility, {
          value: 1.0,
          duration: 0.3,
          ease: 'power1.out',
          onUpdate: () => setControls({ ringAVisibility: uRingAVisibility.value }),
        }),
        gsap.to(uRingBVisibility, {
          value: 0.0,
          duration: 0.5,
          ease: 'power1.out',
          onUpdate: () => setControls({ ringBVisibility: uRingBVisibility.value }),
        }),
        gsap.to(uRingARotation.value, {
          x: degToRad(90),
          y: degToRad(180),
          z: degToRad(180),
          duration: 0.6,
          ease: 'power2.out',
        }),
        gsap.to(uRingBRotation.value, {
          x: degToRad(90),
          y: degToRad(180),
          z: degToRad(180),
          duration: 0.7,
          ease: 'power2.out',
        }),
      ]
    }

    return () => {
      tweens.current.forEach((tween) => tween.kill())
      tweens.current = []
    }
  }, [
    status,
    uDensity,
    uFallOffDistance,
    uRingMixStrength,
    uOpacity,
    uRingARotation,
    uRingBRotation,
    uScattering,
    uSolidification,
    uRingAVisibility,
    uRingBVisibility,
    setControls,
  ])
}

function createScreenQuadGeometry(): THREE.BufferGeometry {
  const geometry = new THREE.BufferGeometry()
  const vertices = new Float32Array([-1, -1, 3, -1, -1, 3])
  geometry.boundingSphere = new THREE.Sphere()
  geometry.boundingSphere.set(new THREE.Vector3(), Infinity)
  geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 2))
  return geometry
}

const smoothMinWithMaterial = /*#__PURE__*/ Fn(
  ([a_immutable, b_immutable, k_immutable]: [
    a: ShaderNodeObject<THREE.VarNode>, // vec2(distance, materialId)
    b: ShaderNodeObject<THREE.VarNode>, // vec2(distance, materialId)
    k: ShaderNodeObject<THREE.VarNode>, // smoothing factor
  ]) => {
    const a = a_immutable.toVar()
    const b = b_immutable.toVar()
    const k = float(k_immutable).toVar()

    const h = float(max(k.sub(abs(a.x.sub(b.x))), 0.0).div(k)).toVar()
    const blendedDistance = min(a.x, b.x).sub(
      h
        .mul(h)
        .mul(h)
        .mul(k)
        .mul(1.0 / 6.0),
    )

    // Blend material IDs based on the smoothing factor
    const materialBlend = h.mul(h).mul(h) // Cubic interpolation for smooth material transition

    // Choose the material of the closer surface when no blending
    const closerMaterial = select(a.x.lessThan(b.x), a.y, b.y)

    // Blend materials when smoothing occurs
    const blendedMaterial = mix(
      closerMaterial, // Use closer surface material when no smoothing
      mix(a.y, b.y, 0.5), // Blend materials when smoothing occurs
      materialBlend.mul(step(0.001, h)), // Only blend when h is significant
    )

    return vec2(blendedDistance, blendedMaterial)
  },
).setLayout({
  name: 'smoothMinWithMaterial',
  type: 'vec2',
  inputs: [
    { name: 'a', type: 'vec2' },
    { name: 'b', type: 'vec2' },
    { name: 'k', type: 'float' },
  ],
})

const torusSDF = /*#__PURE__*/ Fn(
  ([p, t]: [p: ShaderNodeObject<THREE.VarNode>, t: ShaderNodeObject<THREE.VarNode>]) => {
    // Torus distance function
    const q = vec2(length(p.xz).sub(t.x), p.y)
    return length(q).sub(t.y)
  },
).setLayout({
  name: 'torusSDF',
  type: 'float',
  inputs: [
    { name: 'p', type: 'vec3' },
    { name: 't', type: 'vec2' },
  ],
})

const rotate2D = /*#__PURE__*/ Fn(([angle_immutable]: [angle: ShaderNodeObject<THREE.VarNode>]) => {
  const angle = float(angle_immutable).toVar()
  const s = float(sin(angle)).toVar()
  const c = float(cos(angle)).toVar()

  // Return rotation matrix components as vec4 (row-major: [col1, col2])
  // Then we can construct mat2 from this vec4
  // const matrixValues = vec4(c, s, s.negate(), c)
  // @ts-expect-error - ignore
  return mat2(c, s, s.negate(), c)
}).setLayout({
  name: 'rotate2D',
  type: 'mat2',
  inputs: [{ name: 'angle', type: 'float' }],
})

// Legacy density function for compatibility
// const getDensity = Fn(([p]: [p: ShaderNodeObject<THREE.VarNode>]) => {
//   const result = getDensityWithMaterial(p)
//   return result.x // Return only density
// }).setLayout({
//   name: 'getDensity',
//   type: 'float',
//   inputs: [{ name: 'p', type: 'vec3' }],
// })
