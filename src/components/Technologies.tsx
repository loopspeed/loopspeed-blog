import Image, { type StaticImageData } from 'next/image'
import { type FC } from 'react'

import gsapIcon from '@/assets/icons/technologies/gsap.svg'
import nextIcon from '@/assets/icons/technologies/next.svg'
import reactIcon from '@/assets/icons/technologies/react.svg'
import tailwindIcon from '@/assets/icons/technologies/tailwind.svg'
import threeIcon from '@/assets/icons/technologies/three.svg'
import typescriptIcon from '@/assets/icons/technologies/typescript.svg'
import webglIcon from '@/assets/icons/technologies/webgl.svg'
import webgpuIcon from '@/assets/icons/technologies/webgpu.svg'

export const TECHNOLOGIES: StaticImageData[] = [typescriptIcon, reactIcon, nextIcon, threeIcon, webglIcon]
const TECHNOLOGIES_ALL: StaticImageData[] = [...TECHNOLOGIES, tailwindIcon, webgpuIcon, gsapIcon]

type Props = {
  showAll?: boolean
}

const Technologies: FC<Props> = ({ showAll = false }) => {
  const technologies = showAll ? TECHNOLOGIES_ALL : TECHNOLOGIES

  return (
    <div className="flex flex-wrap items-center justify-center gap-4 px-8 py-4 sm:gap-6 md:gap-8 lg:gap-10">
      {technologies.map((icon, idx) => {
        return <Image key={idx} src={icon} alt="tech icon" className="h-7 w-auto sm:h-8 md:h-9 lg:h-10" />
      })}
    </div>
  )
}

export default Technologies
