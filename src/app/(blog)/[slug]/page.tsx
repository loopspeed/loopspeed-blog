import './code.css'

import { type Metadata } from 'next'
import dynamic from 'next/dynamic'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'

import BlogHeadingsNav from '@/components/blog/BlogHeadingsNav'
import BlogPostHeader from '@/components/blog/BlogPostHeader'
import CTA from '@/components/CTA'
import JSONSchema from '@/components/JSONSchema'
import { BLOG_CONTENT } from '@/resources/blog'
import { BlogSlug, Pathname } from '@/resources/pathname'

const BlogBackgroundCanvas = dynamic(() => import('@/components/blog/BlogBackground'))

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
  const metadata = BLOG_CONTENT[slug].metadata
  if (!metadata) return {}
  return {
    title: metadata.title,
    description: metadata.description,
    authors: metadata.authors,
  }
}

export default async function BlogPage({ params }: Props) {
  const { slug } = await params
  const Component = BLOG_CONTENT[slug]?.Blog
  const metadata = BLOG_CONTENT[slug]?.metadata
  if (!Component || !metadata) redirect(Pathname.Home)

  return (
    <>
      <Suspense>
        <BlogBackgroundCanvas />
      </Suspense>
      <main className="relative w-full pt-(--nav-height)">
        <BlogPostHeader {...metadata} />

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

      <JSONSchema {...metadata} />
    </>
  )
}
