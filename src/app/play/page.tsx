import type { Viewport } from 'next'

// import { headers } from 'next/headers'
// import IslandMorph from '@/components/examples/faceRecognition/IslandMorph'
import PhoneContainer from '@/components/examples/faceRecognition/PhoneContainer'
// import FBOParticlesCanvas from '@/components/examples/fboParticles/FBOParticles'
// import Scene from '@/components/examples/tsl/TSLRayMarchingAtom'
import { DARKEST } from '@/resources/colours'

export const viewport: Viewport = {
  themeColor: DARKEST,
}

const PlaygroundPage = async () => {
  // const headersList = await headers()
  // const userAgent = headersList.get('user-agent')
  // const isMobile = !!userAgent?.includes('Mobile')

  return (
    <main className="bg-light flex min-h-screen w-full items-center justify-center">
      {/* <FBOParticlesCanvas /> */}
      {/* <IslandMorph /> */}
      <PhoneContainer />
    </main>
  )
}

export default PlaygroundPage
