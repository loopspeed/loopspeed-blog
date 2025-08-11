'use client'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import DrawSVGPlugin from 'gsap/dist/DrawSVGPlugin'
import { type FC, useRef } from 'react'
import { Transition } from 'react-transition-group'

import { useFaceIDStore } from '@/components/examples/rebuilds/faceId/useFaceIDStore'

gsap.registerPlugin(DrawSVGPlugin)

type Props = {
  className: string
}

const FaceIDCheckMark: FC<Props> = ({ className }) => {
  const status = useFaceIDStore((s) => s.status)
  const svg = useRef(null)

  const { contextSafe } = useGSAP({ scope: svg, dependencies: [status] })

  const onEnter = contextSafe(() => {
    gsap.fromTo(
      '#check-path',
      { drawSVG: '0' },
      { drawSVG: '0 100%', delay: 0.25, duration: 0.42, ease: 'power1.inOut' },
    )
  })

  const onExit = contextSafe(() => {
    gsap.to(svg.current, { opacity: 0, duration: 0.25, ease: 'power1.out' })
  })

  return (
    <Transition
      in={status === 'success'}
      timeout={{ enter: 0, exit: 300 }}
      mountOnEnter={true}
      unmountOnExit={true}
      nodeRef={svg}
      onEnter={onEnter}
      onExit={onExit}>
      <svg
        ref={svg}
        width="89"
        height="86"
        viewBox="0 0 89 86"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}>
        <path
          id="check-path"
          d="M7 46L34.129 78.9423C34.5597 79.4654 35.3749 79.4177 35.7417 78.848L82 7"
          stroke="#AFF8A5"
          strokeWidth="13"
          strokeLinecap="round"
        />
      </svg>
    </Transition>
  )
}

export default FaceIDCheckMark
