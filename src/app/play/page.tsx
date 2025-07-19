import type { Viewport } from 'next'
import { headers } from 'next/headers'

import Scene from '@/components/examples/tsl/TSLRayMarchingAtom'
import { DARKEST } from '@/resources/colours'

export const viewport: Viewport = {
  themeColor: DARKEST,
}

const PlaygroundPage = async () => {
  const headersList = await headers()
  const userAgent = headersList.get('user-agent')
  const isMobile = !!userAgent?.includes('Mobile')

  return (
    <main className="bg-darkest h-svh w-full">
      <Scene isMobile={isMobile} />
    </main>
  )
}

export default PlaygroundPage
