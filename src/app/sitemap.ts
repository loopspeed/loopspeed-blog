import type { MetadataRoute } from 'next'

import { BlogSlug, Pathname } from '@/resources/pathname'

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

  // TODO: add links to demos if they exist
  // const demos: MetadataRoute.Sitemap = Object.values(BlogSlug)
  //   .filter((slug) => !!slug && !!Pathname.BlogPost)
  //   .map((slug) => ({
  //     url: `${baseUrl}${Pathname.BlogPost.replace('[slug]', slug)}/demo`,
  //     lastModified: lastModified,
  //     priority: 0.8,
  //   }))

  const site: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: lastModified,
      changeFrequency: 'weekly',
      priority: 1,
    },
    ...blogs,
    // ...examples,
  ]

  return site
}
