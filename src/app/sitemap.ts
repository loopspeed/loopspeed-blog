import type { MetadataRoute } from 'next'

import { BLOG_CONTENT } from '@/resources/blog'
import { getBlogDemoUrl, getBlogPostUrl, SEO } from '@/resources/seo'

export default function sitemap(): MetadataRoute.Sitemap {
  const blogs: MetadataRoute.Sitemap = []
  const demos: MetadataRoute.Sitemap = []

  Object.values(BLOG_CONTENT).forEach(({ metadata, Demo }) => {
    if (metadata.isDraft) return

    blogs.push({
      url: getBlogPostUrl(metadata.slug),
      lastModified: metadata.date,
      changeFrequency: 'monthly',
      priority: 0.9,
    })

    if (!Demo) return

    demos.push({
      url: getBlogDemoUrl(metadata.slug),
      lastModified: metadata.date,
      changeFrequency: 'monthly',
      priority: 0.7,
    })
  })

  const site: MetadataRoute.Sitemap = [
    {
      url: SEO.siteUrl,
      lastModified: new Date().toISOString().split('T')[0],
      changeFrequency: 'weekly',
      priority: 1,
    },
    ...blogs,
    ...demos,
  ]

  return site
}
