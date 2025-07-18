import './code.css'

import { type Metadata } from 'next'
import { redirect } from 'next/navigation'

import BlogHeadingsNav from '@/components/blog/BlogHeadingsNav'
import BlogPostHeader from '@/components/blog/BlogPostHeader'
import JSONSchema from '@/components/JSONSchema'
import { BLOG_CONTENT } from '@/resources/blog'
import { BlogSlug, Pathname } from '@/resources/pathname'

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
  const Component = BLOG_CONTENT[slug]?.Component
  const metadata = BLOG_CONTENT[slug]?.metadata

  if (!Component || !metadata) redirect(Pathname.Home)

  return (
    <>
      <main className="relative w-full font-sans">
        <BlogPostHeader {...metadata} />

        <div className="grid grid-cols-1 grid-rows-1 xl:grid-cols-[auto_1fr]">
          <article className="prose-sm md:prose xl:prose-lg prose-pre:bg-off-black mx-auto w-full !max-w-6xl overflow-hidden bg-white px-4 py-12 text-pretty text-black md:px-12 xl:px-16 xl:py-16">
            <Component />
            <hr />
            <h3>Thanks for reading, Loopspeed ✌️</h3>
          </article>
          <BlogHeadingsNav />
        </div>
      </main>

      <JSONSchema {...metadata} />
    </>
  )
}
