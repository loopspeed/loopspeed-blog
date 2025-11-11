import type { Viewport } from 'next'
import { headers } from 'next/headers'

import RayMarchingAtomScene from '@/components/examples/tsl/TSLRayMarchingAtom'
import { DARKEST } from '@/resources/colours'

export const viewport: Viewport = {
  themeColor: DARKEST,
}

const PlaygroundPage = async () => {
  const headersList = await headers()
  const userAgent = headersList.get('user-agent')
  const isMobile = !!userAgent?.includes('Mobile')

  return <RayMarchingAtomScene className="mx-auto h-svh! w-svh! max-w-full" />
}

export default PlaygroundPage
