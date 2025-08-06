'use client'

import { useDebouncedValue } from '@mantine/hooks'
import { CameraControls } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import React, { type FC, useEffect, useRef } from 'react'
import { MathUtils } from 'three'

const MIN_POLAR_ANGLE = MathUtils.degToRad(65)
const DEFAULT_POLAR_ANGLE = MathUtils.degToRad(90)
const MAX_POLAR_ANGLE = MathUtils.degToRad(115)

const MIN_AZIMUTH_ANGLE = MathUtils.degToRad(-45)
const DEFAULT_AZIMUTH_ANGLE = MathUtils.degToRad(0)
const MAX_AZIMUTH_ANGLE = MathUtils.degToRad(45)

type Props = {
  isMobile: boolean
}

const Camera: FC<Props> = ({ isMobile }) => {
  const size = useThree((s) => s.size)
  const cameraControls = useRef<CameraControls>(null)
  // Rotation values for pointer move
  const targetPolarAngle = useRef({ value: DEFAULT_POLAR_ANGLE })
  const targetAzimuthAngle = useRef({ value: DEFAULT_AZIMUTH_ANGLE })
  const [debouncedSize] = useDebouncedValue(size, 500, { leading: true })

  useEffect(() => {
    if (!cameraControls.current) return

    if (debouncedSize.width < 768) {
      cameraControls.current.setLookAt(
        0,
        0,
        7, // New camera position
        0,
        0,
        0, // Target position
        false, // Do not use transition (or set true for smooth transition)
      )
      // Don't do pointer on mobile
      return
    }

    cameraControls.current.setLookAt(
      0,
      0,
      5, // New camera position
      0,
      0,
      0, // Target position
      false, // Do not use transition (or set true for smooth transition)
    )
  }, [debouncedSize.width])

  // Setup pointer move events
  useEffect(() => {
    const onPointerMove = (e: PointerEvent) => {
      const normalizedY = e.clientY / debouncedSize.width
      const newPolarAngle = MathUtils.lerp(MIN_POLAR_ANGLE, MAX_POLAR_ANGLE, normalizedY)
      const normalizedX = e.clientX / debouncedSize.width
      const newAzimuthAngle = MathUtils.lerp(MIN_AZIMUTH_ANGLE, MAX_AZIMUTH_ANGLE, normalizedX)
      targetPolarAngle.current.value = newPolarAngle
      targetAzimuthAngle.current.value = newAzimuthAngle
    }

    if (!isMobile) window.addEventListener('pointermove', onPointerMove, { passive: true })
    return () => window.removeEventListener('pointermove', onPointerMove)
  }, [isMobile, debouncedSize.width])

  useFrame((_, delta) => {
    if (isMobile || !cameraControls.current) return

    const isSamePosition =
      cameraControls.current.azimuthAngle === targetAzimuthAngle.current.value &&
      cameraControls.current.polarAngle === targetPolarAngle.current.value
    if (isSamePosition) return

    // Move camera to pointer position with lerp for smoothness
    const newAzimuthAngle = MathUtils.lerp(
      cameraControls.current.azimuthAngle,
      targetAzimuthAngle.current.value,
      delta * 5,
    )
    const newPolarAngle = MathUtils.lerp(cameraControls.current.polarAngle, targetPolarAngle.current.value, delta * 5)
    cameraControls.current.rotateTo(newAzimuthAngle, newPolarAngle, false)
  })

  return (
    <CameraControls
      ref={cameraControls}
      minPolarAngle={MIN_POLAR_ANGLE}
      maxPolarAngle={MAX_POLAR_ANGLE}
      minAzimuthAngle={MIN_AZIMUTH_ANGLE}
      maxAzimuthAngle={MAX_AZIMUTH_ANGLE}
      makeDefault={true}
      mouseButtons={{
        left: 0,
        middle: 0,
        right: 0,
        wheel: 0,
      }}
      touches={{
        one: 0,
        two: 0,
        three: 0,
      }}
    />
  )
}

export default Camera
