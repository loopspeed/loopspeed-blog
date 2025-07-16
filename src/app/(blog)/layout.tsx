import { ReactNode } from 'react'

import BlogBackgroundCanvas from '@/components/blog/blogBackground/BlogBackground'
import Services from '@/components/Services'

export default function BlogLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <BlogBackgroundCanvas />
      {children}
      <Services />
    </>
  )
}
