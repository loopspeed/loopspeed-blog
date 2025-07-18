import type { MetadataRoute } from 'next'

import { BlogSlug, ExampleSlug, Pathname } from '@/resources/pathname'

// Sitemap for the blog

// TODO: review and validate that this is working correctly after deployment

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://blog.loopspeed.co.uk'

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date().toISOString().split('T')[0]

  const blogs: MetadataRoute.Sitemap = Object.values(BlogSlug).map((slug) => ({
    url: `${baseUrl}/${slug}`,
    lastModified: lastModified,
    priority: 1,
  }))

  const examples: MetadataRoute.Sitemap = Object.values(ExampleSlug).map((slug) => ({
    url: `${baseUrl}${Pathname.Example}/${slug}`,
    lastModified: lastModified,
    priority: 0.5,
  }))

  const site: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: lastModified,
      changeFrequency: 'weekly',
      priority: 1,
    },
    ...blogs,
    ...examples,
  ]

  return site
}
