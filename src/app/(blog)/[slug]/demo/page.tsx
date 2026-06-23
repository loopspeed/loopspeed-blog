// Example / Demo accompanying the blog post..
import { type Metadata } from 'next'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

import { JsonLd } from '@/components/JsonLd'
import LevaControls from '@/components/LevaControls'
import { BLOG_CONTENT } from '@/resources/blog'
import { buildDemoCreativeWorkJsonLd } from '@/resources/jsonLd'
import { BlogSlug, Pathname } from '@/resources/pathname'
import { getBlogDemoOgImageUrl, getBlogDemoUrl, SEO } from '@/resources/seo'

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
  const title = `${metadata.title} Demo`
  const url = getBlogDemoUrl(metadata.slug)
  const image = getBlogDemoOgImageUrl(metadata.slug)

  return {
    title,
    description: metadata.description ?? 'Creative development work by Loopspeed',
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description: metadata.description,
      url,
      siteName: SEO.siteName,
      locale: SEO.locale,
      type: 'website',
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: metadata.description,
      images: [image],
    },
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
      <JsonLd data={buildDemoCreativeWorkJsonLd(metadata)} />
    </>
  )
}
