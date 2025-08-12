'use client'
import Image from 'next/image'
import { type FC } from 'react'

import IslandMorph from '@/components/examples/faceRecognition/IslandMorph'
import iphone from '@/components/examples/faceRecognition/svg/iphone.svg'

const PhoneContainer: FC = () => {
  return (
    <div className="flex size-full flex-col items-center justify-center">
      <Image src={iphone} alt="phone" className="fixed z-0 h-96 w-auto object-contain" />
      <IslandMorph />
    </div>
  )
}

export default PhoneContainer
