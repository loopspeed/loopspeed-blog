import { type FC } from 'react'

import { type BlogMetadata } from '@/model/blog'
import { type ExampleMetadata } from '@/model/example'

type Props = { type?: 'BlogPosting' | 'CreativeWork' } & (BlogMetadata | ExampleMetadata)

const JSONSchema: FC<Props> = ({ type = 'BlogPosting', ...metadata }) => {
  const url = `${process.env.NEXT_PUBLIC_BASE_URL}/${metadata.slug}`

  return (
    <script
      type="application/ld+json"
      suppressHydrationWarning
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': type,
          headline: metadata.title,
          datePublished: metadata.date,
          dateModified: metadata.date,
          description: metadata.description,
          abstract: metadata.description,
          // Tells search engines that this creative work is the main entity on the page
          mainEntityOfPage: url,
          // TODO: dynamically generated image with the blog title.
          url,
          image: `${process.env.NEXT_PUBLIC_BASE_URL}/opengraph-image.jpg`,
          author: metadata.authors?.map((author) => ({
            '@type': 'Person',
            givenName: author.name,
          })),
        }),
      }}
    />
  )
}

export default JSONSchema
