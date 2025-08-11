import type { Viewport } from 'next'
import { headers } from 'next/headers'

import FBOParticlesCanvas from '@/components/examples/fboParticles/FBOParticles'
import FaceIDMain from '@/components/examples/rebuilds/faceId/FaceIDMain'
import Scene from '@/components/examples/tsl/TSLRayMarchingAtom'
import RayMarchingScene from '@/components/examples/tsl/TSLRayMarchingAtom'
import { DARKEST } from '@/resources/colours'

export const viewport: Viewport = {
  themeColor: DARKEST,
}

const PlaygroundPage = async () => {
  const headersList = await headers()
  const userAgent = headersList.get('user-agent')
  const isMobile = !!userAgent?.includes('Mobile')

  return <FaceIDMain />
}

export default PlaygroundPage
