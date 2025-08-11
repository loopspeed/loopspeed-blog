'use client'

import * as faceapi from 'face-api.js'
import { type FC, useEffect, useRef } from 'react'
import { twJoin } from 'tailwind-merge'

import { useFaceIDStore, VerificationStatus } from '@/components/examples/rebuilds/faceId/useFaceIDStore'

const VIDEO_WIDTH = 640
const VIDEO_HEIGHT = 480
const DETECTION_INTERVAL_MS = 500
const HAPPY_THRESHOLD = 0.7 // >0.7 usually means "smiling"
const TIMEOUT_DURATION_MS = 10000

const MODEL_URL = '/faceApiModels'

const isDevelopment = process.env.NODE_ENV === 'development'

const FaceIDCamera: FC = () => {
  const status = useFaceIDStore((s) => s.status)
  const setStatus = useFaceIDStore((s) => s.setStatus)
  const isCameraReady = useFaceIDStore((s) => s.isCameraReady)
  const setIsCameraReady = useFaceIDStore((s) => s.setIsCameraReady)
  const shouldInit = status === VerificationStatus.Initialising
  const shouldAnalyse = status === VerificationStatus.Analysing

  const videoRef = useRef<HTMLVideoElement>(null)
  const detectionIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const idleTimeout = useRef<NodeJS.Timeout | null>(null)

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

    const loadModels = async () => {
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
      ])
    }

    const init = async () => {
      try {
        await initCamera()
        await loadModels()
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

    if (shouldAnalyse && isCameraReady) {
      detectionIntervalRef.current = setInterval(detectFace, DETECTION_INTERVAL_MS)
      startIdleTimeout()
    }

    return () => {
      if (detectionIntervalRef.current) clearInterval(detectionIntervalRef.current)
      if (idleTimeout.current) clearTimeout(idleTimeout.current)
    }
  }, [isCameraReady, shouldAnalyse, setStatus])

  return (
    <video
      ref={videoRef}
      className={twJoin(
        isDevelopment ? 'absolute right-0 bottom-0 z-500 origin-bottom-right scale-50' : 'absolute hidden',
      )}
      width={VIDEO_WIDTH}
      height={VIDEO_HEIGHT}
      autoPlay
      muted
    />
  )
}
export default FaceIDCamera
