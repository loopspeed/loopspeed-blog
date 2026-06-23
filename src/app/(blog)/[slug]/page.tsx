import './code.css'

import { type Metadata } from 'next'
import dynamic from 'next/dynamic'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'

import BlogPostHeader from '@/components/blog/BlogPostHeader'
import { JsonLd } from '@/components/JsonLd'
import { BLOG_CONTENT } from '@/resources/blog'
import { buildBlogPostingJsonLd } from '@/resources/jsonLd'
import { BlogSlug, Pathname } from '@/resources/pathname'
import { getBlogPostOgImageUrl, getBlogPostUrl, SEO } from '@/resources/seo'

const BlogBackgroundCanvas = dynamic(() => import('@/components/blog/BlogBackground'))
const BlogHeadingsNav = dynamic(() => import('@/components/blog/BlogHeadingsNav'))
const CTA = dynamic(() => import('@/components/CTA'))

type Props = {
  params: Promise<{ slug: BlogSlug }>
}

export function generateStaticParams() {
  return Object.values(BlogSlug).map((slug) => ({
    slug,
  }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const metadata = BLOG_CONTENT[slug]?.metadata
  if (!metadata) return {}
  const url = getBlogPostUrl(metadata.slug)
  const image = getBlogPostOgImageUrl(metadata.slug)
  const authors = metadata.authors.map((author) => author.name)

  return {
    title: metadata.title,
    description: metadata.description,
    authors: metadata.authors,
    keywords: metadata.keywords,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: metadata.title,
      description: metadata.description,
      url,
      siteName: SEO.siteName,
      locale: SEO.locale,
      type: 'article',
      publishedTime: metadata.date,
      modifiedTime: metadata.date,
      authors,
      tags: metadata.tags,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: metadata.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: metadata.title,
      description: metadata.description,
      images: [image],
    },
  }
}

export default async function BlogPage({ params }: Props) {
  const { slug } = await params
  const Component = BLOG_CONTENT[slug]?.Blog
  const Demo = BLOG_CONTENT[slug]?.Demo
  const metadata = BLOG_CONTENT[slug]?.metadata
  if (!Component || !metadata) redirect(Pathname.Home)

  return (
    <>
      <Suspense>
        <BlogBackgroundCanvas />
      </Suspense>
      <main className="relative w-full pt-(--nav-height)">
        <BlogPostHeader {...metadata} hasDemo={!!Demo} />

        <div className="grid grid-cols-1 grid-rows-1 xl:grid-cols-[1fr_auto]">
          <article className="w-full overflow-hidden bg-white px-4 py-12 text-pretty text-black md:px-8">
            <div className="prose-sm md:prose xl:prose-lg prose-pre:bg-darkest mx-auto w-full !max-w-5xl">
              <Component />
              <hr />
              <h4>Thanks for reading, Loopspeed ✌️</h4>
            </div>
          </article>
          <BlogHeadingsNav />
        </div>

        <CTA />
      </main>

      <JsonLd data={buildBlogPostingJsonLd(metadata)} />
    </>
  )
}
