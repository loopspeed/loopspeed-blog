'use client'

import * as faceapi from 'face-api.js'
import { type FC, useEffect, useRef, useState } from 'react'
import { twJoin } from 'tailwind-merge'

import { useFaceIDStore, VerificationStatus } from '@/components/examples/rebuilds/faceId/useFaceIDStore'

const VIDEO_WIDTH = 640
const VIDEO_HEIGHT = 480
const DETECTION_INTERVAL_MS = 500
const HAPPY_THRESHOLD = 0.7 // >0.7 usually means "smiling"
const TIMEOUT_DURATION_MS = 12000

const MODEL_URL = '/faceApiModels'

const isDevelopment = process.env.NODE_ENV === 'development'

const FaceIDCamera: FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const detectionIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const idleTimeout = useRef<NodeJS.Timeout | null>(null)

  const status = useFaceIDStore((s) => s.status)
  const isCameraReady = useFaceIDStore((s) => s.isCameraReady)
  const setStatus = useFaceIDStore((s) => s.setStatus)
  const setIsCameraReady = useFaceIDStore((s) => s.setIsCameraReady)

  const [haveModelsLoaded, setHaveModelsLoaded] = useState(false)

  const shouldInit = status === VerificationStatus.Initialising && haveModelsLoaded
  const shouldDetectFace = status === VerificationStatus.Analysing && isCameraReady

  useEffect(() => {
    const loadModels = async () => {
      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
        ])
        setHaveModelsLoaded(true)
      } catch (err) {
        console.error('Failed to load face-api.js models:', err)
      }
    }

    loadModels()
  }, [])

  useEffect(() => {
    const initCamera = async () => {
      if (!videoRef.current) return
      if (videoRef.current.srcObject) return
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: VIDEO_WIDTH, height: VIDEO_HEIGHT },
      })
      videoRef.current.srcObject = stream
      await videoRef.current.play()
    }

    const init = async () => {
      try {
        await initCamera()
        setIsCameraReady(true)
      } catch (err) {
        console.error('Failed to init FaceID camera:', err)
        setIsCameraReady(false)
      }
    }

    if (shouldInit && !isCameraReady) init()
  }, [shouldInit, isCameraReady, setIsCameraReady])

  useEffect(() => {
    const detectFace = async () => {
      if (!videoRef.current) return

      const detections = await faceapi
        .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceExpressions()

      const happy = detections?.expressions?.happy
      if (!!happy && happy > HAPPY_THRESHOLD) setStatus(VerificationStatus.Success)
    }

    const startIdleTimeout = () => {
      if (!!idleTimeout.current) clearTimeout(idleTimeout.current)
      idleTimeout.current = setTimeout(() => {
        setStatus(VerificationStatus.Idle)
      }, TIMEOUT_DURATION_MS)
    }

    if (shouldDetectFace) {
      detectionIntervalRef.current = setInterval(detectFace, DETECTION_INTERVAL_MS)
      startIdleTimeout()
    }

    return () => {
      if (detectionIntervalRef.current) clearInterval(detectionIntervalRef.current)
      if (idleTimeout.current) clearTimeout(idleTimeout.current)
    }
  }, [shouldDetectFace, setStatus])

  return (
    <video
      ref={videoRef}
      className={twJoin(
        isDevelopment ? 'absolute right-0 bottom-0 z-500 origin-bottom-right scale-50' : 'absolute hidden',
      )}
      width={VIDEO_WIDTH}
      height={VIDEO_HEIGHT}
      autoPlay={true}
      muted={true}
      controls={false}
    />
  )
}
export default FaceIDCamera
