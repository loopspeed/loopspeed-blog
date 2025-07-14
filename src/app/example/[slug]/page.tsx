import { type Metadata } from 'next'
import { redirect } from 'next/navigation'

import { EXAMPLES_CONTENT, EXAMPLES_METADATA } from '@/resources/examples'
import { ExampleSlug, Pathname } from '@/resources/pathname'

type Props = {
  params: Promise<{ slug: ExampleSlug }>
}

export function generateStaticParams() {
  return Object.values(ExampleSlug).map((slug) => ({
    slug,
  }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const example = EXAMPLES_METADATA[slug]
  return {
    title: example.title,
    description: example.description ?? 'Creative development work by Matthew Frawley',
  }
}

export default async function ExamplePage({ params }: Props) {
  const { slug } = await params
  const Content = EXAMPLES_CONTENT[slug]
  if (!Content) redirect(Pathname.Home)
  return <Content />
}
