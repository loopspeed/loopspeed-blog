import { type Metadata } from 'next'
import { redirect } from 'next/navigation'
import type { FC } from 'react'

import { Example, EXAMPLES_CONTENT, EXAMPLES_METADATA } from '@/resources/examples'
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
    description: example.description ?? 'Creative development work by Loopspeed',
  }
}

export default async function ExamplePage({ params }: Props) {
  const { slug } = await params
  const Component = EXAMPLES_CONTENT[slug]
  const metadata = EXAMPLES_METADATA[slug]

  if (!Component || !metadata) redirect(Pathname.Home)

  return (
    <>
      <Component />
      <JSONSchema {...metadata} />
    </>
  )
}

const JSONSchema: FC<Example> = ({ title, description, slug: pathname }) => {
  const url = `${process.env.NEXT_PUBLIC_BASE_URL}/${pathname}`
  return (
    <script
      type="application/ld+json"
      suppressHydrationWarning
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'CreativeWork',
          name: title, // using "name" instead of "headline" for a generic work
          abstract: description,
          image: `${process.env.NEXT_PUBLIC_BASE_URL}/opengraph-image.jpg`,
          url: url,
          // Tells search engines that this creative work is the main entity on the page
          mainEntityOfPage: url,
          author: {
            '@type': 'Person',
            givenName: 'Matthew',
            name: 'Matthew Frawley',
            email: 'pragmattic.ltd@gmail.com',
          },
          // TODO: update dates
          datePublished: '2025-02-10',
          dateModified: '2025-02-10',
        }),
      }}
    />
  )
}
