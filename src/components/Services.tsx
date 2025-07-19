import { type FC } from 'react'

import { Heading2 } from '@/components/Heading'
import Technologies from '@/components/Technologies'

// TODDO: Redesign this to CTA Section for Blog - linking to the Loopspeed website

const Services: FC = () => {
  return (
    <section className="relative flex w-full flex-1 flex-col items-center justify-center gap-4 px-6 py-20 md:gap-6 md:px-12 lg:py-48">
      <Heading2 className="bg-linear-30/oklch">Ready to make an impact?</Heading2>

      <div className="mt-2 grid w-full grid-cols-1 gap-4 sm:grid-cols-2 md:w-fit">
        <div className="space-y-4 rounded-lg bg-linear-0 from-black/90 to-black/50 p-5 lg:p-8">
          <h4 className="heading-sm text-white">Design Services</h4>
          <ul className="text-light paragraph-md space-y-2">
            <li>UX Design Sprints </li>
            <li>3D design and motion</li>
            <li>Interactive Prototyping</li>
            <li>UX/UI Design</li>
            <li>Web / Landing Page Design</li>
          </ul>
        </div>

        <div className="space-y-4 rounded-lg bg-linear-0 from-black/90 to-black/50 p-5 lg:p-8">
          <h4 className="heading-sm text-white">Development Services</h4>
          <ul className="text-light paragraph-md space-y-2">
            <li>Full-stack Next.js builds</li>
            <li>Bespoke LLM tools</li>
            <li>3D web with Three.js</li>
            <li>Animated web experiences</li>
            <li>WebGL / WebGPU shaders</li>
          </ul>
        </div>
      </div>

      <Technologies showAll />
    </section>
  )
}

export default Services
