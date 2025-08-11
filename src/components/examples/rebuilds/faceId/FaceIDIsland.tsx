'use client'
import { useDidUpdate } from '@mantine/hooks'
import gsap from 'gsap'
import { MorphSVGPlugin } from 'gsap/MorphSVGPlugin'
import { type FC, useRef } from 'react'

import FaceIDCanvas from '@/components/examples/rebuilds/faceId/FaceIDCanvas'
import FaceIDCheckMark from '@/components/examples/rebuilds/faceId/FaceIDCheckMark'
import { useFaceIDStore, VerificationStatus } from '@/components/examples/rebuilds/faceId/useFaceIDStore'

gsap.registerPlugin(MorphSVGPlugin)

// Scaled paths - uniformly scaled by 0.714 (320/448) to fit 320px width while maintaining aspect ratio
const pathStart = 'M320 34C320 14 304 0 286 0H34C15 0 0 14 0 34C0 54 16 69 34 69H286C304 69 320 54 320 34Z'
const pathMiddle = 'M290 34C290 14 274 0 256 0H64C45 0 30 14 30 34C30 54 46 69 64 69H256C274 69 290 54 290 34Z'
const pathEnd =
  'M289 84C289 38 273 0 207 0H113C47 0 31 38 31 84V178C31 224 47 261 113 261H207C273 261 289 224 289 178V84Z'

const FaceIDIsland: FC = () => {
  const status = useFaceIDStore((s) => s.status)
  const path = useRef<SVGPathElement>(null)
  const container = useRef<HTMLDivElement>(null)
  const isExpanded = status === VerificationStatus.Analysing || status === VerificationStatus.Success
  const timeline = useRef<GSAPTimeline | null>(null)

  useDidUpdate(() => {
    if (isExpanded) {
      // Expand the Island
      timeline.current = gsap
        .timeline()
        .to(path.current, {
          duration: 0.1,
          morphSVG: { shape: pathMiddle, type: 'linear', origin: '50% 0%' },
          transformOrigin: '50% 0%',
          ease: 'power2.out',
        })
        .to(
          path.current,
          {
            duration: 0.6,
            morphSVG: { shape: pathEnd, type: 'linear', origin: '50% 20%' },
            transformOrigin: '50% 50%',
            ease: 'back.out(1.4)',
          },
          0.09,
        )
    }

    if (!isExpanded) {
      // Collapse the Island
      timeline.current = gsap
        .timeline()
        .to(path.current, {
          duration: 0.35,
          morphSVG: { shape: pathMiddle, type: 'linear', origin: '50% 20%' },
          transformOrigin: '50% 20%',
          ease: 'back.in(1.4)',
        })
        .to(path.current, {
          duration: 0.16,
          morphSVG: { shape: pathStart, type: 'linear', origin: '50% 20%' },
          transformOrigin: '50% 20%',
          ease: 'back.out(1.6)',
        })
    }

    return () => {
      timeline.current?.kill()
    }
  }, [isExpanded])

  return (
    <div
      ref={container}
      className="pointer-events-none relative z-100 flex h-[72px] w-[320px] flex-col items-center justify-center">
      <svg
        width={320}
        height={261}
        viewBox="0 0 320 261"
        fill="none"
        className="relative"
        xmlns="http://www.w3.org/2000/svg">
        <defs>
          <clipPath id="island-clip" clipPathUnits="userSpaceOnUse">
            <path ref={path} d={pathStart} />
          </clipPath>
        </defs>
      </svg>
      {/* The masked element is taller because the back easing causes the clip path to expand beyond 261px height */}
      <div
        className="absolute top-0 flex h-[281px] w-[320px] items-center justify-center bg-[#000] pb-[10px]"
        style={{ clipPath: 'url(#island-clip)' }}>
        <FaceIDCanvas className="!absolute top-0 !h-[261px] !w-[320px] bg-[#000]" />
        <FaceIDCheckMark className="absolute z-20 size-[64px]" />
      </div>
    </div>
  )
}

export default FaceIDIsland
