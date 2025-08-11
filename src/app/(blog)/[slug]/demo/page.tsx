// Example / Demo accompanying the blog post..
import { type Metadata } from 'next'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

import JSONSchema from '@/components/JSONSchema'
import LevaControls from '@/components/LevaControls'
import { BLOG_CONTENT } from '@/resources/blog'
import { BlogSlug, Pathname } from '@/resources/pathname'

type Props = {
  params: Promise<{ slug: BlogSlug }>
}

export function generateStaticParams() {
  // Only generate paths for posts that have a DemoComponent
  return Object.values(BlogSlug)
    .filter((slug) => !!BLOG_CONTENT[slug]?.Demo)
    .map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const metadata = BLOG_CONTENT[slug]?.metadata
  if (!metadata) return {}
  return {
    title: metadata.title + ' Demo',
    description: metadata.description ?? 'Creative development work by Loopspeed',
  }
}

export default async function BlogDemoPage({ params }: Props) {
  const { slug } = await params
  const blog = BLOG_CONTENT[slug]
  if (!blog) redirect(Pathname.Home)
  const { Demo: DemoComponent, metadata } = blog
  if (!DemoComponent) redirect(Pathname.Home)

  const headersList = await headers()
  const userAgent = headersList.get('user-agent')
  const isMobile = !!userAgent?.includes('Mobile')
  return (
    <>
      <DemoComponent />
      <LevaControls isMobile={isMobile} />
      <JSONSchema type="CreativeWork" {...metadata} />
    </>
  )
}
