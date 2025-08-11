'use client'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { useControls } from 'leva'
import { LockIcon, SmileIcon, UnlockIcon } from 'lucide-react'
import { type FC, useEffect, useRef } from 'react'
import { Transition } from 'react-transition-group'
import { twJoin } from 'tailwind-merge'

import FaceIDCamera from '@/components/examples/rebuilds/faceId/FaceIDCamera'
import FaceIDIsland from '@/components/examples/rebuilds/faceId/FaceIDIsland'
import { useFaceIDStore, VerificationStatus } from '@/components/examples/rebuilds/faceId/useFaceIDStore'

const FaceIDMain: FC = () => {
  const status = useFaceIDStore((s) => s.status)
  const setStatus = useFaceIDStore((s) => s.setStatus)
  const isUnlocked = useFaceIDStore((s) => s.isUnlocked)
  const lock = useFaceIDStore((s) => s.lock)
  const unlock = useFaceIDStore((s) => s.unlock)

  const [, setControls] = useControls('Face ID', () => {
    return {
      status: {
        value: status,
        label: 'Status',
        options: Object.values(VerificationStatus),
        onChange: (value) => {
          setStatus(value)
        },
      },
    }
  })

  // Sync controls with the store state
  useEffect(() => {
    setControls({
      status,
    })
  }, [status, setControls])

  const showUnlockIcon = !isUnlocked && status === VerificationStatus.Idle
  const showCameraCTA = !isUnlocked && status === VerificationStatus.Analysing

  return (
    <main className="bg-darkest to-darkest flex !h-lvh w-full justify-center overflow-hidden bg-linear-0 from-black to-80% pt-30 xl:pt-40">
      <FaceIDCamera />

      <h1 className="absolute -bottom-5 -left-1.5 z-50 hidden max-w-full text-[88px] leading-none font-black tracking-tighter overflow-ellipsis whitespace-nowrap lg:block 2xl:text-[116px]">
        Face ID Web Smile Edition
      </h1>

      {/* Device */}
      <div className="bg-light relative mx-auto flex !w-[560px] max-w-full flex-col items-center overflow-hidden rounded-t-[64px] pt-6 outline-8 outline-[#000]">
        <FaceIDIsland />

        <div className="flex w-full items-center justify-center text-black lg:top-40">
          <div
            className={twJoin(
              'px-8 py-10 opacity-100 transition-opacity delay-100 duration-300 lg:px-10',
              !isUnlocked && 'opacity-40 blur-md select-none',
            )}>
            <h2 className="mb-4 text-xl font-bold tracking-tight lg:text-2xl">Top Secret</h2>
            <h3 className="text-lg font-bold lg:text-xl">How we recreated the Face ID interaction</h3>
            <ul className="mt-3 list-disc pl-5 leading-loose lg:text-xl">
              <li>SVG path morphing for the expanding island</li>
              <li>Tensorflow WebGL for recognising facial features</li>
              <li>Three.js Shading Language and a ray marching algorithm for volumetric spinning rings</li>
              <li>SVG line drawing for the animated check</li>
            </ul>
            <button className="mt-6 flex cursor-pointer items-center gap-2 font-bold lg:text-lg" onClick={lock}>
              <LockIcon />
              Click to lock
            </button>
          </div>

          {showUnlockIcon && (
            <UnlockIcon
              strokeWidth={2}
              size={64}
              role="button"
              className="text-dark absolute cursor-pointer hover:opacity-50"
              onClick={unlock}
            />
          )}

          <CameraCTA show={showCameraCTA} />
        </div>
      </div>
    </main>
  )
}

export default FaceIDMain

const CameraCTA: FC<{ show: boolean }> = ({ show }) => {
  const cameraMessageContainer = useRef<HTMLDivElement>(null)
  const { contextSafe } = useGSAP({ scope: cameraMessageContainer })

  const onEnter = contextSafe(() => {
    gsap.fromTo(
      '.cta-element',
      { y: 12, opacity: 0 },
      {
        opacity: 1,
        y: 0,
        duration: 0.3,
        ease: 'power1.out',
        stagger: 0.08,
        delay: 1,
      },
    )
  })

  const onExiting = contextSafe(() => {
    gsap.to(cameraMessageContainer.current, {
      opacity: 0,
      duration: 0.2,
      ease: 'power1.out',
    })
  })

  return (
    <Transition
      nodeRef={cameraMessageContainer}
      in={show}
      timeout={{ enter: 0, exit: 300 }}
      appear
      mountOnEnter
      unmountOnExit
      onEnter={onEnter}
      onExiting={onExiting}>
      <div
        ref={cameraMessageContainer}
        className="text-dark absolute flex flex-col items-center justify-center gap-4 pt-48">
        <SmileIcon strokeWidth={2} size={64} className="cta-element" />
        <p className="cta-element text-xl font-bold">Get close and smile for the camera!</p>
      </div>
    </Transition>
  )
}
