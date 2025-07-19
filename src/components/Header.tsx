'use client'
import { useGSAP } from '@gsap/react'
import { useGLTF } from '@react-three/drei'
import { Canvas, extend, type ThreeToJSXElements } from '@react-three/fiber'
import gsap from 'gsap'
import SplitText from 'gsap/dist/SplitText'
import { type FC, useMemo, useRef } from 'react'
import type { GLTF } from 'three/examples/jsm/Addons.js'
import { type WebGPURendererParameters } from 'three/src/renderers/webgpu/WebGPURenderer.js'
import { color, Fn, mix, normalWorld } from 'three/tsl'
import { WebGPURenderer } from 'three/webgpu'
import * as THREE from 'three/webgpu'

import { Heading1 } from '@/components/Heading'
import { DARK, LIGHT } from '@/resources/colours'

gsap.registerPlugin(SplitText)

const Header: FC = () => {
  const container = useRef<HTMLDivElement>(null)

  // Animations only run on MD and up (768px)
  useGSAP(
    () => {
      gsap.fromTo(
        ['span', 'h1'],
        { opacity: 0, y: 8 },
        { opacity: 1, y: 0, duration: 0.4, ease: 'power1.in', delay: 0.2, stagger: 0.16 },
      )
    },
    { dependencies: [], scope: container },
  )

  return (
    <header
      ref={container}
      className="horizontal-padding bg-darkest relative mt-(--nav-height) grid min-h-[60vh] grid-cols-1 grid-rows-[296px_auto] gap-6 overflow-hidden pt-12 pb-24 lg:grid-cols-[480px_1fr] lg:grid-rows-1 lg:gap-16 lg:pb-12">
      <HeaderModelCanvas />

      <div className="flex h-full flex-col items-center gap-4 lg:items-start lg:justify-center">
        <span className="heading-sm !font-medium text-white opacity-0 lg:text-left">Welcome to the Loopspeed Blog</span>
        <Heading1 className="from-accent-teal max-w-3xl to-white to-85% opacity-0 lg:text-left">
          A growing collection of guides, patterns, and fun stuff we&apos;ve been building
        </Heading1>
      </div>
    </header>
  )
}

export default Header

declare module '@react-three/fiber' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface ThreeElements extends ThreeToJSXElements<typeof THREE> {}
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
extend(THREE as any)

const HeaderModelCanvas: FC = () => {
  return (
    <Canvas
      id="playground-canvas"
      className="!relative aspect-square w-full overflow-hidden bg-transparent"
      performance={{ min: 0.5, debounce: 300 }}
      flat={true}
      gl={async (props) => {
        const renderer = new WebGPURenderer(props as WebGPURendererParameters)
        renderer.outputColorSpace = 'srgb'
        await renderer.init()
        return renderer
      }}>
      <ambientLight intensity={0.4} />
      <pointLight position={[-1, 2.5, 1]} intensity={3} />
      <LoopModel />
    </Canvas>
  )
}

type LoopGLTF = GLTF & {
  nodes: {
    INFINITY_ThickMesh: THREE.Mesh
  }
  materials: object
}

const LoopModel: FC = () => {
  const { nodes } = useGLTF('/models/LogoInfin_ThickMesh.glb') as unknown as LoopGLTF
  const loopMesh = useRef<THREE.Mesh>(null)

  const { key, colorNode } = useMemo(() => {
    const colorNode = Fn(() => {
      const normalW = normalWorld.y.clamp(0, 1)
      return mix(color(DARK), color(LIGHT), normalW)
    })()

    return { key: colorNode.uuid, colorNode }
  }, [])

  useGSAP(() => {
    if (!loopMesh.current) return
    gsap.to(loopMesh.current.rotation, {
      x: Math.PI * 2,
      z: Math.PI * 2,
      duration: 12,
      ease: 'none',
      repeat: -1,
    })
  }, [loopMesh])

  return (
    <mesh ref={loopMesh} position={[0, 0, 0]} geometry={nodes.INFINITY_ThickMesh.geometry} scale={2}>
      <meshStandardNodeMaterial key={key} metalness={0.6} roughness={0.5} colorNode={colorNode} />
    </mesh>
  )
}

useGLTF.preload('/models/LogoInfin_ThickMesh.glb')
