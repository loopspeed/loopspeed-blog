import type { FC, PropsWithChildren } from 'react'

import BlogBackgroundCanvas from '@/components/blog/blogBackground/BlogBackground'

const BlogLayout: FC<PropsWithChildren> = ({ children }) => {
  return (
    <>
      <BlogBackgroundCanvas />
      {children}
    </>
  )
}

export default BlogLayout
