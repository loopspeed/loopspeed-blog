import type { Viewport } from 'next'
import { headers } from 'next/headers'

import Scene from '@/components/examples/tsl/TSLRayMarchingAtom'
import { DARKEST } from '@/resources/colours'
import FBOParticlesCanvas from '@/components/examples/fboParticles/FBOParticles'
import RayMarchingScene from '@/components/examples/tsl/TSLRayMarchingAtom'

export const viewport: Viewport = {
  themeColor: DARKEST,
}

const PlaygroundPage = async () => {
  const headersList = await headers()
  const userAgent = headersList.get('user-agent')
  const isMobile = !!userAgent?.includes('Mobile')

  return (
    <main className="w-full bg-black">
      <RayMarchingScene isMobile={isMobile} />
    </main>
  )
}

export default PlaygroundPage
