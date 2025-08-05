'use client'
import { useGSAP } from '@gsap/react'
import { shaderMaterial, useFBO, useGLTF } from '@react-three/drei'
import { extend, useFrame, useThree } from '@react-three/fiber'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/dist/ScrollTrigger'
import React, { type FC, useMemo, useRef, useState } from 'react'
import {
  AdditiveBlending,
  Color,
  FloatType,
  Mesh,
  NearestFilter,
  OrthographicCamera,
  Points,
  RGBAFormat,
  Scene,
  Texture,
} from 'three'
import { GLTF } from 'three/examples/jsm/Addons.js'

import LoopParticleSimulationMaterial, { type SimulationShaderRef } from '../simulation/Simulation'
import particleFragment from './point.frag'
import particleVertex from './point.vert'

gsap.registerPlugin(useGSAP, ScrollTrigger)

/**
 * A simple seeded pseudo-random number generator (mulberry32)
 * Returns a function that generates deterministic random numbers based on the provided seed
 */
const createMulberry32 = (seed: number): (() => number) => {
  let a = seed
  return function () {
    let t = (a += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

type PointsShaderUniforms = {
  uTime: number
  uPositions: Texture | null
  uScatteredAmount: number
  uAboutAmount: number
  uProcessAmount: number
  uDpr: number
}

const INITIAL_POINTS_UNIFORMS: PointsShaderUniforms = {
  uTime: 0,
  uPositions: null,
  uScatteredAmount: 1,
  uAboutAmount: 0,
  uProcessAmount: 0,
  uDpr: 1,
}

const CustomShaderMaterial = shaderMaterial(INITIAL_POINTS_UNIFORMS, particleVertex, particleFragment)
const LoopPointsShaderMaterial = extend(CustomShaderMaterial)

type Props = {
  isMobile: boolean
}

type LoopGLTF = GLTF & {
  nodes: {
    INFINITY_ThickMesh: Mesh
  }
  materials: object
}

const LoopPoints: FC<Props> = ({ isMobile }) => {
  const { nodes } = useGLTF('/models/LogoInfin_ThickMesh.glb') as unknown as LoopGLTF
  const loopMesh = useRef<Mesh>(null)
  const dpr = useThree((s) => s.viewport.dpr)
  const performance = useThree((s) => s.performance).current

  const particlesCount = useMemo(
    () => (isMobile ? Math.pow(56 * performance, 2) : Math.pow(128 * performance, 2)),
    [isMobile, performance],
  )
  const textureSize = useMemo(() => Math.sqrt(particlesCount), [particlesCount])

  const points = useRef<Points>(null)
  const pointsShaderMaterial = useRef<typeof LoopPointsShaderMaterial & PointsShaderUniforms>(null)
  const simulationShaderMaterial = useRef<SimulationShaderRef>(null)

  // Animation values
  const scatteredAmount = useRef({ value: 1 })
  const aboutAmount = useRef({ value: 0 })
  const processAmount = useRef({ value: 0 })
  const [hasEntered, setHasEntered] = useState(false)

  useGSAP(() => {
    // Transition points in
    gsap.to(scatteredAmount.current, {
      value: 0,
      duration: 1,
      delay: 1,
      ease: 'power2.inOut',
      onComplete: () => {
        setHasEntered(true)
      },
    })
    // Transition to About (2 spheres connected via tunnel)
    gsap.to(aboutAmount.current, {
      value: 1,
      duration: 1,
      ease: 'power1.out',
      scrollTrigger: {
        trigger: `#${SectionId.ABOUT_US}`,
        start: 'top 95%',
        end: 'top top',
        scrub: true,
        fastScrollEnd: true,
      },
    })
    // Transition to Process (ring within in the middle)
    gsap.to(processAmount.current, {
      value: 1,
      duration: 0.55,
      ease: 'power1.inOut',
      scrollTrigger: {
        trigger: `#${SectionId.PROCESS}`,
        start: 'top top',
        toggleActions: 'play none none reverse',
        fastScrollEnd: true,
      },
    })
  }, [])

  // ------------------
  // SIMULATION SETUP
  // ------------------
  const FBOscene = useMemo(() => new Scene(), [])
  const renderTarget = useFBO({
    stencilBuffer: false,
    minFilter: NearestFilter,
    magFilter: NearestFilter,
    format: RGBAFormat,
    type: FloatType,
  })
  const fboCamera = useMemo(() => new OrthographicCamera(-1, 1, 1, -1, 0.1, 1), [])

  // ------------------
  // PARTICLE GEOMETRY SETUP
  // ------------------
  // Use a dummy position attribute (all zeros) because our vertex shader will sample from uPositions.
  const particlesPositions = useMemo(() => {
    return new Float32Array(particlesCount * 3).fill(0)
  }, [particlesCount])

  // Create UVs for the particles (for sampling the simulation texture)
  const { seeds, textureUvs, tealColours, orangeColours } = useMemo(() => {
    // Allocate single buffer: 1 seed + 2 UVs + 3 teal + 3 orange = 9 floats per particle
    const totalFloats = particlesCount * 9
    const singleBuffer = new Float32Array(totalFloats)

    // Create views into the buffer
    const seeds = singleBuffer.subarray(0, particlesCount)
    const textureUvs = singleBuffer.subarray(particlesCount, particlesCount * 3)
    const tealColours = singleBuffer.subarray(particlesCount * 3, particlesCount * 6)
    const orangeColours = singleBuffer.subarray(particlesCount * 6, particlesCount * 9)

    const seedRandomFunc = createMulberry32(123456789)
    const tealColorRandomFunc = createMulberry32(987654321)
    const orangeColorRandomFunc = createMulberry32(456789123)

    for (let i = 0; i < particlesCount; i++) {
      // Generate seed
      seeds[i] = seedRandomFunc()

      // Generate UV coordinates
      const x = (i % textureSize) / (textureSize - 1)
      const y = Math.floor(i / textureSize) / (textureSize - 1)
      textureUvs[i * 2] = x
      textureUvs[i * 2 + 1] = y

      const i3 = i * 3

      // Pick teal color
      const tealColorIndex = Math.floor(tealColorRandomFunc() * TEAL_PALETTE.length)
      const tealColor = new Color(TEAL_PALETTE[tealColorIndex])
      tealColours[i3 + 0] = tealColor.r
      tealColours[i3 + 1] = tealColor.g
      tealColours[i3 + 2] = tealColor.b

      // Pick orange color
      const orangeColorIndex = Math.floor(orangeColorRandomFunc() * ORANGE_PALETTE.length)
      const orangeColor = new Color(ORANGE_PALETTE[orangeColorIndex])
      orangeColours[i3 + 0] = orangeColor.r
      orangeColours[i3 + 1] = orangeColor.g
      orangeColours[i3 + 2] = orangeColor.b
    }

    return { seeds, textureUvs, tealColours, orangeColours }
  }, [particlesCount, textureSize])

  useFrame(({ gl, clock }) => {
    if (!pointsShaderMaterial.current || !simulationShaderMaterial.current || !loopMesh.current) return

    const time = clock.elapsedTime

    // Set simulation uniforms BEFORE rendering to FBO
    simulationShaderMaterial.current.uTime = time
    simulationShaderMaterial.current.uScatteredAmount = scatteredAmount.current.value
    simulationShaderMaterial.current.uAboutAmount = aboutAmount.current.value
    simulationShaderMaterial.current.uProcessAmount = processAmount.current.value

    // Render simulation to FBO
    gl.setRenderTarget(renderTarget)
    gl.clear()
    gl.render(FBOscene, fboCamera)
    gl.setRenderTarget(null)

    // Set points uniforms AFTER FBO rendering
    pointsShaderMaterial.current.uTime = time
    pointsShaderMaterial.current.uPositions = renderTarget.texture
    pointsShaderMaterial.current.uAboutAmount = aboutAmount.current.value
    pointsShaderMaterial.current.uScatteredAmount = scatteredAmount.current.value
    pointsShaderMaterial.current.uProcessAmount = processAmount.current.value
  })

  return (
    <>
      {/* Loop mesh */}
      <mesh ref={loopMesh} geometry={nodes.INFINITY_ThickMesh.geometry} scale={1.8}>
        <meshBasicMaterial transparent={true} opacity={0} depthTest={false} />
      </mesh>

      {/* Simulation */}
      <LoopParticleSimulationMaterial
        ref={simulationShaderMaterial}
        particlesCount={particlesCount}
        loopMesh={loopMesh}
        fboScene={FBOscene}
        seeds={seeds}
      />

      {/* Points */}
      <points ref={points} dispose={null} frustumCulled={false}>
        <bufferGeometry attach="geometry">
          <bufferAttribute
            attach="attributes-position"
            args={[particlesPositions, 3]}
            count={particlesPositions.length / 3}
            itemSize={3}
          />
          <bufferAttribute attach="attributes-uv" args={[textureUvs, 2]} count={textureUvs.length / 2} />
          <bufferAttribute attach="attributes-seed" args={[seeds, 1]} count={seeds.length} />
          <bufferAttribute attach="attributes-tealColor" args={[tealColours, 3]} count={tealColours.length / 3} />
          <bufferAttribute attach="attributes-orangeColor" args={[orangeColours, 3]} count={orangeColours.length / 3} />
        </bufferGeometry>
        <LoopPointsShaderMaterial
          key={CustomShaderMaterial.key}
          ref={pointsShaderMaterial}
          transparent={true}
          depthTest={false}
          blending={AdditiveBlending}
          {...INITIAL_POINTS_UNIFORMS}
          uDpr={dpr}
        />
      </points>
    </>
  )
}

useGLTF.preload('/models/LogoInfin_ThickMesh.glb')

export default LoopPoints

const TEAL_PALETTE = [
  '#00fcdf', // 0
  '#00f0d0', // 1
  '#00ffff', // 2
  '#00ffff', // 3
  '#00ecdc', // 4
  '#00ffe2', // 5
  '#00fff5', // 6
  '#00ffff', // 7
  '#00fff1', // 8
  '#00ffff', // 9
  '#00ffff', // 10
  '#00fffa', // 11
  '#00f2d5', // 12
  '#00fff1', // 13
  '#00ffff', // 14
  '#00fff9', // 15
  '#00eec7', // 16
  '#00ffdd', // 17
  '#00fffd', // 18
  '#00fffb', // 19
  '#caeae6', // 20
  '#d6f1f2', // 21
  '#e8f6f5', // 22
  '#d8fcf9', // 23
  '#d9fef4', // 24
  '#d7e6e7', // 25
  '#e4fffc', // 26
  '#d0e8e4', // 27
  '#c1efeb', // 28
  '#d7ffff', // 29
  '#3f918d', // 30
  '#3f8985', // 31
  '#52b1a8', // 32
  '#5ca598', // 33
  '#005b4e', // 34
  '#005449', // 35
  '#5aa39a', // 36
  '#56aaa3', // 37
  '#46978e', // 38
  '#42a99f', // 39
]

const ORANGE_PALETTE = [
  '#ffb770', // 0
  '#ffb271', // 1
  '#ffb684', // 2
  '#ffb876', // 3
  '#ffa35d', // 4
  '#ffa759', // 5
  '#ffcc72', // 6
  '#ffa362', // 7
  '#ffa878', // 8
  '#ffa258', // 9
  '#ff7e7e', // 10
  '#ff957a', // 11
  '#ffbf8d', // 12
  '#ff8a8e', // 13
  '#ff9792', // 14
  '#ffb38a', // 15
  '#ff9f84', // 16
  '#ff7f6c', // 17
  '#ffac7c', // 18
  '#ff9d6a', // 19
  '#ffeedb', // 20
  '#f7e5d9', // 21
  '#f9dfd8', // 22
  '#eee0d8', // 23
  '#fff1ed', // 24
  '#ffeff0', // 25
  '#ffdddb', // 26
  '#f8e1e2', // 27
  '#ffdbd3', // 28
  '#ffddd3', // 29
  '#7a462a', // 30
  '#8e5b48', // 31
  '#c88b7a', // 32
  '#8c5d49', // 33
  '#874d3e', // 34
  '#a4675a', // 35
  '#81443a', // 36
  '#a76e66', // 37
  '#8c4540', // 38
  '#d48f7f', // 39
]

// const TEAL_PALETTE = generateDynamicPalette([ACCENT_TEAL, MID])
// const ORANGE_PALETTE = generateDynamicPalette([ACCENT_ORANGE, ACCENT_RED])

/**
//  * Generates a dynamic color palette from an array of hex color values using @thi.ng/color
//  */
// function generateDynamicPalette(hexColors: string[]): string[] {
//   const palette = [
//     ...hexColors.flatMap((color) => [
//       ...colorsFromRange('bright', {
//         base: rgb(color),
//         num: 10,
//         variance: 0.05,
//       }),
//     ]),
//     ...hexColors.flatMap((color) => [
//       ...colorsFromRange('cool', {
//         base: rgb(color),
//         num: 5,
//         variance: 0.05,
//       }),
//     ]),
//     ...hexColors.flatMap((color) => [
//       ...colorsFromRange('neutral', {
//         base: rgb(color),
//         num: 5,
//         variance: 0.02,
//       }),
//     ]),
//   ].map((color) => css(color))

//   return palette
// }

// ------------------
// RAYCASTING SETUP
// ------------------
// const shouldRaycast = size.width >= 768
// const raycaster = useMemo(() => new Raycaster(), [])
// Define a fallback plane; adjust the normal and constant so that the plane
// is positioned slightly in front of the mesh. For example, a plane facing +Z with constant -0.5
// const pointerPlane = useMemo(() => new Plane(new Vector3(0, 0, 1), 0), [])
// A persistent vector to store the fallback intersection
// const fallbackIntersection = new Vector3()
// Store the smoothed pointer position
// const smoothedPointer = useRef(new Vector3(0, 0, 10))
// const pointerIntensity = useRef(0)

// --- Raycasting the Pointer ---

// Set the raycaster from the camera and pointer
// if (shouldRaycast && scatteredAmount.current.value === 0 && sphereAmount.current.value < 0.2) {
//   raycaster.setFromCamera(pointer, camera)

//   // Try intersecting the mesh.
//   raycaster.firstHitOnly = true
//   const intersections = raycaster.intersectObjects([loopMesh.current], false)

//   const isPointerOverModel = intersections.length > 0

//   let intersectionPoint: Vector3

//   if (isPointerOverModel) {
//     intersectionPoint = intersections[0].point
//   } else {
//     // Compute the fallback intersection with our pointer plane.
//     raycaster.ray.intersectPlane(pointerPlane, fallbackIntersection)
//     intersectionPoint = fallbackIntersection
//   }

//   // Smooth the pointer position by lerping toward the target intersection.
//   if (points.current) {
//     // Clone the intersection point so you don't modify the original.
//     const localIntersection = intersectionPoint.clone()
//     // Transform from world space to the group's local space.
//     points.current.worldToLocal(localIntersection)
//     // Then use this localIntersection for your pointer uniform.
//     smoothedPointer.current.lerp(localIntersection, 0.3)
//   } else {
//     smoothedPointer.current.lerp(intersectionPoint, 0.3)
//   }

//   // TODO: reduce pointer intensity over time. e.g start at 1 then lerp to 0 so that if it is idle it will fade out

//   // When the pointer is over, targetNoise = 1, otherwise 0.
//   const intensity = MathUtils.lerp(pointerIntensity.current, isPointerOverModel ? 1 : 0, 0.1)
//   pointerIntensity.current = intensity

//   // Simulation uniforms for desktop
//   simulationShaderMaterial.current.uPointerPosition = smoothedPointer.current
//   simulationShaderMaterial.current.uPointerIntensity = intensity
// }
//   // TODO: reduce pointer intensity over time. e.g start at 1 then lerp to 0 so that if it is idle it will fade out

//   // When the pointer is over, targetNoise = 1, otherwise 0.
//   const intensity = MathUtils.lerp(pointerIntensity.current, isPointerOverModel ? 1 : 0, 0.1)
//   pointerIntensity.current = intensity

//   // Simulation uniforms for desktop
//   simulationShaderMaterial.current.uPointerPosition = smoothedPointer.current
//   simulationShaderMaterial.current.uPointerIntensity = intensity
// }
//   // Simulation uniforms for desktop
//   simulationShaderMaterial.current.uPointerPosition = smoothedPointer.current
//   simulationShaderMaterial.current.uPointerIntensity = intensity
// }
