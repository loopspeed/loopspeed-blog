declare module '*.mdx' {
  import type { FC } from 'react'

  import type { BlogMetadata } from '@/model/blog'

  const Component: FC
  export const metadata: BlogMetadata
  export default Component
}
