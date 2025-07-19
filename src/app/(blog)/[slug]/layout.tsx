import { type ReactNode } from 'react'

import BlogBackgroundCanvas from '@/components/blog/BlogBackground'
// import Services from '@/components/Services'
// TODO: redesign CTA block fro blog

export default function ArticleLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <BlogBackgroundCanvas />
      {children}
    </>
  )
}
