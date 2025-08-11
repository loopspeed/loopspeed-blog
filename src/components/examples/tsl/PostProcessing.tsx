'use client'

import { PerformanceMonitorApi, usePerformanceMonitor } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { useControls } from 'leva'
import { type FC, useEffect, useMemo, useRef, useState } from 'react'
import { bloom } from 'three/addons/tsl/display/BloomNode.js'
import { emissive, float, Fn, mrt, output, pass, screenUV, uniform, viewportSharedTexture } from 'three/tsl'
import { WebGPURenderer } from 'three/webgpu'
import * as THREE from 'three/webgpu'

// https://github.com/ektogamat/r3f-webgpu-starter/blob/main/src/components/WebGPUPostProcessing.js
const Bloom: FC = () => {
  const scene = useThree((s) => s.scene)
  const renderer = useThree((s) => s.gl) as unknown as WebGPURenderer
  const camera = useThree((s) => s.camera)
  const size = useThree((s) => s.size)
  const [isEnabled, setIsEnabled] = useState(true)

  const postProcessing = useRef<THREE.PostProcessing | null>(null)

  const onIncline = (api: PerformanceMonitorApi) => {
    setIsEnabled(api.fps > 40)
  }

  const onDecline = (api: PerformanceMonitorApi) => {
    setIsEnabled(!(api.fps > 40))
  }

  usePerformanceMonitor({ onIncline, onDecline })

  const [bloomIntensity, setBloomIntensity] = useState(0.6)

  useControls('Bloom', {
    enableBloom: {
      label: 'Enable Bloom',
      value: true,
      onChange: (value) => {
        setIsEnabled(value)
      },
    },
    bloomIntensity: {
      label: 'Bloom Intensity',
      value: 0.6,
      min: 0.1,
      max: 1.0,
      step: 0.05,
      onChange: (value) => {
        setBloomIntensity(value)
      },
    },
  })

  useEffect(() => {
    if (!renderer || !scene || !camera) return

    const scenePass = pass(scene, camera, {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
    })

    // Setup Multiple Render Targets (MRT) - this is crucial!
    scenePass.setMRT(
      mrt({
        output,
        emissive,
      }),
    )

    // Get texture nodes - these represent the rendered outputs
    const scenePassColor = scenePass.getTextureNode('output')
    // const scenePassEmissive = scenePass.getTextureNode('emissive')

    // Apply bloom with dynamic intensity, or bypass if disabled
    const finalPass = isEnabled ? bloom(scenePassColor, bloomIntensity, 0.05) : scenePassColor

    postProcessing.current = new THREE.PostProcessing(renderer)
    postProcessing.current.outputNode = finalPass

    return () => {
      postProcessing.current?.dispose()
      postProcessing.current = null
    }
  }, [camera, renderer, scene, bloomIntensity, isEnabled])

  useFrame(({ gl }) => {
    if (!postProcessing.current) return
    gl.clear()
    postProcessing.current.render()
  }, 1) // Priority 1 ensures this runs after the main scene render

  return null
}

const MotionBlur: FC = () => {
  const scene = useThree((s) => s.scene)
  const renderer = useThree((s) => s.gl) as unknown as WebGPURenderer
  const camera = useThree((s) => s.camera)
  const size = useThree((s) => s.size)
  const [isEnabled, setIsEnabled] = useState(true)

  const postProcessing = useRef<THREE.PostProcessing | null>(null)

  // Create persistent uniforms that can be updated
  const uMotionBlurDecay = useMemo(() => uniform(float(0.95)).label('uMotionBlurDecay'), [])
  const uCurrentFrameWeight = useMemo(() => uniform(float(0.6)).label('uCurrentFrameWeight'), [])

  const onIncline = (api: PerformanceMonitorApi) => {
    setIsEnabled(api.fps > 30)
  }

  const onDecline = (api: PerformanceMonitorApi) => {
    setIsEnabled(!(api.fps > 30))
  }

  usePerformanceMonitor({ onIncline, onDecline })

  useControls('Motion Blur', {
    enableTrail: {
      label: 'Enable Motion Blur',
      value: true,
      onChange: (value: boolean) => {
        setIsEnabled(value)
      },
    },
    motionBlurDecay: {
      label: 'Trail Persistence',
      value: 0.95,
      min: 0.7,
      max: 0.99,
      step: 0.01,
      onChange: (value: number) => {
        uMotionBlurDecay.value = value
      },
    },
    currentFrameWeight: {
      label: 'Trail Strength',
      value: 0.6,
      min: 0.1,
      max: 0.9,
      step: 0.01,
      onChange: (value: number) => {
        uCurrentFrameWeight.value = value
      },
    },
  })

  useEffect(() => {
    if (!renderer || !scene || !camera) return

    // Create the scene pass
    const scenePass = pass(scene, camera, {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
    })

    // Setup Multiple Render Targets (MRT)
    scenePass.setMRT(
      mrt({
        output,
        // emissive,
      }),
    )

    // Get the scene texture
    const scenePassColor = scenePass.getTextureNode('output')

    // Create motion blur effect using TSL with viewport shared texture for feedback
    const motionBlurEffect = Fn(() => {
      const currentColor = scenePassColor.sample(screenUV)

      if (!isEnabled) {
        return currentColor
      }

      // Get the previous frame using viewportSharedTexture for feedback effect
      const previousColor = viewportSharedTexture(screenUV)

      // Create very strong trailing effect
      // High decay value keeps trails visible for longer
      const persistentTrail = previousColor.mul(uMotionBlurDecay)

      // Create an obvious silhouette by strongly blending the trail
      // This creates a ghosting effect where previous frames are clearly visible
      const blendedResult = persistentTrail.add(currentColor)

      // Use the trail strength to control how much of the trail shows through
      // Higher values = more obvious trailing silhouettes
      const finalColor = currentColor.mix(blendedResult, uCurrentFrameWeight)

      return finalColor
    })()

    // Apply the motion blur effect
    const finalPass = motionBlurEffect

    postProcessing.current = new THREE.PostProcessing(renderer)
    postProcessing.current.outputNode = finalPass

    return () => {
      postProcessing.current?.dispose()
      postProcessing.current = null
    }
  }, [camera, renderer, scene, size, isEnabled, uMotionBlurDecay, uCurrentFrameWeight])

  useFrame(({ gl }) => {
    if (!postProcessing.current) return
    gl.clear()
    postProcessing.current.render()
  }, 1) // Priority 1 ensures this runs after the main scene render

  return null
}

export { Bloom, MotionBlur }
