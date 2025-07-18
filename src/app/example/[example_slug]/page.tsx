import { type Metadata } from 'next'
import { redirect } from 'next/navigation'

import JSONSchema from '@/components/JSONSchema'
import EXAMPLES from '@/resources/examples'
import { ExampleSlug, Pathname } from '@/resources/pathname'

type Props = {
  params: Promise<{ example_slug: ExampleSlug }>
}

export function generateStaticParams() {
  return Object.values(ExampleSlug).map((slug) => ({
    example_slug: slug,
  }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { example_slug } = await params
  const metadata = EXAMPLES[example_slug]?.metadata
  if (!metadata) return {}
  return {
    title: metadata.title,
    description: metadata.description ?? 'Creative development work by Loopspeed',
  }
}

export default async function ExamplePage({ params }: Props) {
  const { example_slug } = await params
  const example = EXAMPLES[example_slug]
  if (!example) redirect(Pathname.Home)
  const { Component, metadata } = example
  return (
    <>
      <Component />
      <JSONSchema type="CreativeWork" {...metadata} />
    </>
  )
}
