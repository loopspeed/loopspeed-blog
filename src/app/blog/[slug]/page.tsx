import { type Metadata } from 'next'

import { BLOG_CONTENT, BLOG_METADATA } from '@/resources/blog'
import { BlogSlug } from '@/resources/pathname'

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
  const metadata = BLOG_METADATA[slug]
  return {
    title: metadata.title,
    description: metadata.description,
    authors: metadata.authors,
  }
}

export default async function BlogPage({ params }: Props) {
  const { slug } = await params
  const Content = BLOG_CONTENT[slug]
  return <Content />
}
