'use client'

import { Stats } from '@react-three/drei'
import { Canvas, extend, type ThreeToJSXElements, useFrame, useThree } from '@react-three/fiber'
import { type FC, useEffect, useLayoutEffect, useMemo } from 'react'
import { color, ShaderNodeObject } from 'three/src/nodes/tsl/TSLBase.js'
import { type WebGPURendererParameters } from 'three/src/renderers/webgpu/WebGPURenderer.js'
import {
  abs,
  Break,
  cos,
  exp,
  float,
  floor,
  Fn,
  fract,
  If,
  int,
  length,
  Loop,
  mat2,
  max,
  min,
  mix,
  normalize,
  pow,
  screenUV,
  select,
  sin,
  step,
  time,
  uniform,
  vec2,
  vec3,
  vec4,
  viewportSize,
} from 'three/tsl'
import { WebGPURenderer } from 'three/webgpu'
import * as THREE from 'three/webgpu'

import {
  ACCENT_ORANGE,
  ACCENT_TEAL,
  BLACK,
  BLACK_VEC3,
  DARK,
  DARKEST,
  LIGHT,
  MID,
  ORANGE_ACCENT_VEC3,
} from '@/resources/colours'

declare module '@react-three/fiber' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface ThreeElements extends ThreeToJSXElements<typeof THREE> {}
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
extend(THREE as any)

type Props = {
  isMobile: boolean
}

const RayMarchingScene: FC<Props> = ({ isMobile }) => {
  return (
    <Canvas
      id="ray-marching-canvas"
      className="fixed inset-0 !h-lvh"
      performance={{ min: 0.3, debounce: 300 }}
      flat={true}
      gl={async (props) => {
        const renderer = new WebGPURenderer(props as WebGPURendererParameters)
        renderer.outputColorSpace = 'srgb'
        await renderer.init()
        return renderer
      }}>
      {process.env.NODE_ENV === 'development' && <Stats />}
      {/* <RayMarchedInstances /> */}
      <Background />
    </Canvas>
  )
}

export default RayMarchingScene

enum MaterialId {
  Background = 0,
  InnerRing = 1,
  MiddleRing = 2,
  OuterRing = 3,
  Sphere = 4,
}

const MATERIAL_IDS: Record<MaterialId, ShaderNodeObject<THREE.Node>> = {
  [MaterialId.Background]: float(0.0),
  [MaterialId.InnerRing]: float(1.0),
  [MaterialId.MiddleRing]: float(2.0),
  [MaterialId.OuterRing]: float(3.0),
  [MaterialId.Sphere]: float(4.0),
}

const MATERIAL_COLOURS: Record<MaterialId, ShaderNodeObject<THREE.Node>> = {
  [MaterialId.Background]: color(BLACK),
  [MaterialId.InnerRing]: color(ACCENT_TEAL),
  [MaterialId.MiddleRing]: color(DARK),
  [MaterialId.OuterRing]: color(DARKEST),
  [MaterialId.Sphere]: color(ACCENT_TEAL), // React blue
}

const Background: FC = () => {
  const currentPerformance = useThree((s) => s.performance.current)

  const { colorNode, uPointer } = useMemo(() => {
    const MAX_ITERATIONS = int(100).mul(currentPerformance)
    const MIN_DISTANCE = float(0.01)
    const MAX_DISTANCE = float(10.0)

    const LIGHT_POS = vec3(1.0, 5.0, 0.0)
    const OBJECT_POS = vec3(0, 0, 0.0)

    const uPointer = uniform(vec2(0.0)).label('uPointer')

    const getReactAtomPosition = Fn(([p]: [p: ShaderNodeObject<THREE.VarNode>]) => {
      // Rotational repetition for 3 torus rings (React atom style)
      const torusP = p.toVar().sub(OBJECT_POS)
      const rotationTime = time.mul(1.0)

      torusP.yz.assign(torusP.yz.mul(rotate2D(rotationTime)))

      // First ring - tilted 60 degrees around X axis
      const p1 = torusP.toVar()
      const xRot1 = rotate2D(float(Math.PI / 3).add(rotationTime))
      p1.yz.assign(p1.yz.mul(xRot1))

      // Second ring - tilted -60 degrees around X axis
      const p2 = torusP.toVar()
      const xRot2 = rotate2D(float(-Math.PI / 3).add(rotationTime))
      p2.yz.assign(p2.yz.mul(xRot2))

      // Third ring - horizontal
      const p3 = torusP.toVar()
      const zRot3 = rotate2D(rotationTime)
      p3.xy.assign(p3.xy.mul(zRot3))

      const torusRadius = float(0.5)
      const torusTubeRadius = float(0.05)

      // Calculate distances with material IDs
      const innerRing = vec2(torusSDF(p1, vec2(torusRadius, torusTubeRadius)), MATERIAL_IDS[MaterialId.InnerRing])
      const middleRing = vec2(
        torusSDF(p2, vec2(torusRadius.add(0.2), torusTubeRadius)),
        MATERIAL_IDS[MaterialId.MiddleRing],
      )
      const outerRing = vec2(
        torusSDF(p3, vec2(torusRadius.add(0.4), torusTubeRadius)),
        MATERIAL_IDS[MaterialId.OuterRing],
      )

      const torusMixFactor = sin(rotationTime).add(1.0).div(2.0).mul(0.72)
      // Smooth minimum with color blending
      const torus12 = smoothMinWithColor(innerRing, middleRing, torusMixFactor)
      const torus123 = smoothMinWithColor(torus12, outerRing, torusMixFactor)

      // Sphere at center
      const sphereRadius = float(0.2)
      const sphere = vec2(sphereSDF(p.toVar().sub(OBJECT_POS), sphereRadius), MATERIAL_IDS[MaterialId.Sphere]) // Cyan sphere

      return select(
        torus123.x.lessThan(sphere.x), // If torus is closer than sphere
        torus123, // Return torus distance and material ID
        sphere, // Otherwise return sphere distance and material ID
      )
    }).setLayout({
      name: 'getReactAtomPosition',
      type: 'vec2',
      inputs: [{ name: 'p', type: 'vec3' }],
    })

    const getDistance = Fn(([p_immutable]: [p: ShaderNodeObject<THREE.VarNode>]) => {
      const result = getReactAtomPosition(p_immutable)
      return result.x // Return only distance for ray marching
    }).setLayout({
      name: 'getDistance',
      type: 'float',
      inputs: [{ name: 'p', type: 'vec3' }],
    })

    const getNormal = Fn(([p]: [p: ShaderNodeObject<THREE.VarNode>]) => {
      // Reference: https://iquilezles.org/articles/normalsSDF
      const e = vec2(1.0, -1.0).mul(0.5773).mul(0.005) // 0.5773 ≈ 1/√3 for tetrahedral sampling
      return normalize(
        e.xyy
          .mul(getDistance(p.add(e.xyy)))
          .add(e.yyx.mul(getDistance(p.add(e.yyx))))
          .add(e.yxy.mul(getDistance(p.add(e.yxy))))
          .add(e.xxx.mul(getDistance(p.add(e.xxx)))),
      )
    }).setLayout({
      name: 'getNormal',
      type: 'vec3',
      inputs: [{ name: 'p', type: 'vec3' }],
    })

    // const getDiffuse = Fn(([p]: [p: ShaderNodeObject<THREE.VarNode>]) => {
    //   const l = normalize(LIGHT_POS.sub(p)) // Light direction
    //   const n = getNormal(p) // Normal at the point
    //   let dif = l.dot(n).clamp(0.0, 1.0) // Diffuse
    //   dif = pow(dif, 1.5)
    //   return dif
    // }).setLayout({
    //   name: 'getSimpleLight',
    //   type: 'float',
    //   inputs: [{ name: 'p', type: 'vec3' }],
    // })

    const rayMarch = Fn(([ro, rd]: [ro: ShaderNodeObject<THREE.VarNode>, rd: ShaderNodeObject<THREE.VarNode>]) => {
      const totalDistance = float(0.0).toVar()
      const finalMaterialId = float(MATERIAL_IDS[MaterialId.Background]).toVar() // Track material ID

      Loop(MAX_ITERATIONS, () => {
        const p = ro.add(rd.mul(totalDistance)) // Current point on the ray
        const result = getReactAtomPosition(p) // Get both distance and material ID
        const distance = result.x
        finalMaterialId.assign(result.y) // Store material ID from hit point
        totalDistance.addAssign(distance) // Move the ray forward
        // If we're close enough, it's a hit, so we can do an early return
        If(distance.lessThanEqual(MIN_DISTANCE), () => {
          Break()
        })
        // If we've gone too far, we can stop
        If(totalDistance.greaterThanEqual(MAX_DISTANCE), () => {
          Break()
        })
      })

      return vec2(totalDistance, finalMaterialId) // Return both distance and material ID
    }).setLayout({
      name: 'rayMarch',
      type: 'vec2',
      inputs: [
        { name: 'ro', type: 'vec3' },
        { name: 'rd', type: 'vec3' },
      ],
    })

    const getAdvancedLighting = Fn(
      ([pos, nor, rd]: [
        pos: ShaderNodeObject<THREE.VarNode>,
        nor: ShaderNodeObject<THREE.VarNode>,
        rd: ShaderNodeObject<THREE.VarNode>,
      ]) => {
        // Fresnel effect - surfaces become more reflective at grazing angles
        const fresnel = float(1.0).add(nor.toVar().dot(rd)).clamp(0.0, 1.0)

        // Basic diffuse lighting
        const lightDir = normalize(LIGHT_POS.sub(pos))
        const diffuse = lightDir.dot(nor).clamp(0.0, 1.0)

        // Ambient lighting based on normal (sky lighting simulation)
        const ambient = nor.toVar().y.mul(0.5).add(0.5).mul(0.6) // Adjusted ambient strength

        // Specular highlights based on reflected vector
        const reflected = rd.reflect(nor)
        const specular = max(reflected.y, 0.0).pow(3.0)

        return vec4(diffuse, fresnel, specular, ambient)
      },
    ).setLayout({
      name: 'getAdvancedLighting',
      type: 'vec4',
      inputs: [
        { name: 'pos', type: 'vec3' },
        { name: 'nor', type: 'vec3' },
        { name: 'rd', type: 'vec3' },
      ],
    })

    const applyColorGrading = Fn(([col]: [col: ShaderNodeObject<THREE.VarNode>]) => {
      // Gamma correction
      const gradedCol = col.toVar().pow(vec3(0.4545))
      // Slight darkening for mood
      gradedCol.mulAssign(0.9)
      // S-curve for better contrast (smoothstep-like)
      // gradedCol.mulAssign(gradedCol).mul(vec3(3.0).sub(gradedCol.mul(2.0)))
      return gradedCol
    }).setLayout({
      name: 'applyColorGrading',
      type: 'vec3',
      inputs: [{ name: 'col', type: 'vec3' }],
    })

    const main = Fn(() => {
      // RAY MARCHING MAIN FUNCTION

      // Use frag coordinates to get an aspect-fixed UV
      const aspect = viewportSize.x.div(viewportSize.y)
      const _uv = screenUV.toVar().sub(vec2(0.5, 0.5))
      _uv.x.mulAssign(aspect)

      // Ray origin (camera position) - orbit around the center
      const cameraDistance = float(4.0).add(sin(time))
      const cameraAngle = time.mul(1.5)
      const ro = vec3(cos(cameraAngle).mul(cameraDistance), 0.0, sin(cameraAngle).mul(cameraDistance)).toVar()
      // Create proper camera basis vectors for perspective projection
      const target = vec3(0.0, 0.0, 0.0)
      const worldUp = vec3(0.0, 1.0, 0.0)
      // Camera forward (looking at center)
      const cameraForward = normalize(target.sub(ro))
      // Camera right (perpendicular to forward and world up)
      const cameraRight = normalize(cameraForward.cross(worldUp))
      // Camera up (perpendicular to forward and right)
      const cameraUp = normalize(cameraRight.cross(cameraForward))
      // Construct ray direction with proper field of view
      const fov = float(1.0) // Field of view factor
      const rd = normalize(cameraForward.add(cameraRight.mul(_uv.x.mul(fov))).add(cameraUp.mul(_uv.y.mul(fov))))

      // Total distance and material ID
      const marchResult = rayMarch(ro, rd)
      const td = marchResult.x
      const materialId = marchResult.y

      // Current point on the ray
      const p = ro.add(rd.mul(td))

      // Calculate lighting first
      const normal = getNormal(p)
      const lighting = getAdvancedLighting(p, normal, rd)
      const diffuse = lighting.x
      const fresnel = lighting.y
      const specular = lighting.z
      const ambient = lighting.w

      // Check if we hit something
      const isHit = step(td, MAX_DISTANCE.sub(0.05))

      // Increase ambient to reduce dark patches - try values between 0.6-1.0
      const totalLighting = diffuse.add(ambient)

      // Get base material color and apply lighting
      const finalColor = getMaterialColor(materialId).mul(totalLighting).toVar() // Apply lighting to color

      // Reduce specular intensity to prevent over-brightening - try values between 0.5-1.5
      const specularColor = color('#fff').mul(specular).mul(fresnel.pow(3.0).mul(0.5).add(0.2)) // Reduced from pow(5.0) and intensity
      finalColor.addAssign(specularColor) // Reduced from 2.0

      // Apply color grading
      finalColor.assign(applyColorGrading(finalColor))

      finalColor.assign(select(isHit, finalColor, MATERIAL_COLOURS[MaterialId.Background]))

      return finalColor
    })()

    return { colorNode: main, uPointer }
  }, [currentPerformance])

  const scene = useThree((s) => s.scene)

  useLayoutEffect(() => {
    scene.backgroundNode = colorNode
  }, [colorNode, scene, colorNode.uuid])

  // useFrame(({ pointer }) => {
  //   // @ts-expect-error ignore
  //   uPointer.value = pointer
  // })

  return null
}

const getMaterialColor = Fn(([materialId]: [materialId: ShaderNodeObject<THREE.VarNode>]) => {
  // SMOOTH COLOR BLENDING EXPLANATION:
  // The materialId can be fractional (e.g., 1.7, 2.3) due to smoothMinWithColor blending
  // When two surfaces blend, their material IDs also blend proportionally
  // We need to interpolate between adjacent colors based on the fractional part
  // Special case: if materialId is 4 (sphere), always use solid color with no blending
  const isSphere = materialId.equal(MATERIAL_IDS[MaterialId.Sphere])

  // Extract integer part (which material we're closest to) and fractional part (blend amount)
  const blendFactor = fract(materialId) // This is the key to smooth blending!

  // Create smooth color interpolation between adjacent materials
  // Instead of sharp step functions, we use the fractional part directly for smooth mixing
  const materialColor = vec4(0.0).toVar() // Start with a black color

  // Blend between materials 1 and 2
  const innerMiddleMix = mix(
    materialColor,
    mix(MATERIAL_COLOURS[MaterialId.InnerRing], MATERIAL_COLOURS[MaterialId.MiddleRing], blendFactor),
    step(MATERIAL_IDS[MaterialId.InnerRing], materialId).mul(
      step(materialId, MATERIAL_IDS[MaterialId.MiddleRing].add(0.1)),
    ),
  )

  materialColor.assign(innerMiddleMix)

  // Blend between materials 2 and 3
  const middleOuterMix = mix(
    materialColor,
    mix(MATERIAL_COLOURS[MaterialId.MiddleRing], MATERIAL_COLOURS[MaterialId.OuterRing], blendFactor),
    step(MATERIAL_IDS[MaterialId.MiddleRing], materialId).mul(
      step(materialId, MATERIAL_IDS[MaterialId.OuterRing].add(0.1)),
    ),
  )

  materialColor.assign(middleOuterMix)

  // Handle exact material ID matches when blendFactor is 0
  const isExactInner = materialId.equal(MATERIAL_IDS[MaterialId.InnerRing]).toFloat()
  const isExactMiddle = materialId.equal(MATERIAL_IDS[MaterialId.MiddleRing]).toFloat()
  const isExactOuter = materialId.equal(MATERIAL_IDS[MaterialId.OuterRing]).toFloat()

  materialColor.assign(mix(materialColor, MATERIAL_COLOURS[MaterialId.InnerRing], isExactInner))
  materialColor.assign(mix(materialColor, MATERIAL_COLOURS[MaterialId.MiddleRing], isExactMiddle))
  materialColor.assign(mix(materialColor, MATERIAL_COLOURS[MaterialId.OuterRing], isExactOuter))

  // Handle sphere as solid color - no blending with rings
  return select(isSphere, MATERIAL_COLOURS[MaterialId.Sphere], materialColor)
}).setLayout({
  name: 'getMaterialColor',
  type: 'vec4',
  inputs: [{ name: 'materialId', type: 'float' }],
})

const sphereSDF = /*#__PURE__*/ Fn(
  ([p, r]: [p: ShaderNodeObject<THREE.VarNode>, r: ShaderNodeObject<THREE.VarNode>]) => {
    // Sphere distance function
    return length(p).sub(r)
  },
).setLayout({
  name: 'sphereSDF',
  type: 'float',
  inputs: [
    { name: 'p', type: 'vec3' },
    { name: 'r', type: 'float' },
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
  const matrixValues = vec4(c, s, s.negate(), c)
  return mat2(matrixValues)
}).setLayout({
  name: 'rotate2D',
  type: 'mat2',
  inputs: [{ name: 'angle', type: 'float' }],
})

// // Cubic Polynomial Smooth-minimum
// vec2 smin( float a, float b, float k )
// {
//     k *= 6.0;
//     float h = max( k-abs(a-b), 0.0 )/k;
//     float m = h*h*h*0.5;
//     float s = m*k*(1.0/3.0);
//     return (a<b) ? vec2(a-s,m) : vec2(b-s,1.0-m);
// }

// https://iquilezles.org/articles/smin/

const smoothMin = /*#__PURE__*/ Fn(
  ([a_immutable, b_immutable, k_immutable]: [
    a: ShaderNodeObject<THREE.VarNode>,
    b: ShaderNodeObject<THREE.VarNode>,
    k: ShaderNodeObject<THREE.VarNode>,
  ]) => {
    const k = float(k_immutable).toVar()
    const b = float(b_immutable).toVar()
    const a = float(a_immutable).toVar()
    const h = float(max(k.sub(abs(a.sub(b))), 0.0).div(k)).toVar()

    return min(a, b).sub(
      h
        .mul(h)
        .mul(h)
        .mul(k)
        .mul(1.0 / 6.0),
    )
  },
).setLayout({
  name: 'smoothMin',
  type: 'float',
  inputs: [
    { name: 'a', type: 'float' },
    { name: 'b', type: 'float' },
    { name: 'k', type: 'float' },
  ],
})

// https://iquilezles.org/articles/sdfrepetition/

// correct way to repeat space every s units
// float repeated( vec2 p, float s )
// {
//     vec2 id = round(p/s);
//     vec2  o = sign(p-s*id); // neighbor offset direction

//     float d = 1e20;
//     for( int j=0; j<2; j++ )
//     for( int i=0; i<2; i++ )
//     {
//         vec2 rid = id + vec2(i,j)*o;
//         vec2 r = p - s*rid;
//         d = min( d, sdf(r) );
//     }
//     return d;
// }

const smoothMinWithColor = /*#__PURE__*/ Fn(
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

    // Only blend materials when there's actual smoothing happening (h > 0)
    const materialBlend = h.mul(h).mul(h) // Cubic interpolation for smooth color transition

    // Choose the material of the closer surface when no blending
    const closerMaterial = select(a.x.lessThan(b.x), a.y, b.y)

    // Only apply material blending when surfaces are actually being smoothed together
    const blendedMaterial = mix(
      closerMaterial, // Use closer surface material when no smoothing
      mix(a.y, b.y, 0.5), // Blend materials only when smoothing occurs
      materialBlend.mul(step(0.001, h)), // Only blend when h is significant
    )

    return vec2(blendedDistance, blendedMaterial)
  },
).setLayout({
  name: 'smoothMinWithColor',
  type: 'vec2',
  inputs: [
    { name: 'a', type: 'vec2' },
    { name: 'b', type: 'vec2' },
    { name: 'k', type: 'float' },
  ],
})
