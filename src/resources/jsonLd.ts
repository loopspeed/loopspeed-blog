import { type BlogMetadata } from '@/model/blog'
import {
  getBlogDemoOgImageUrl,
  getBlogDemoUrl,
  getBlogPostOgImageUrl,
  getBlogPostUrl,
  getCanonicalUrl,
  SEO,
} from '@/resources/seo'

type JsonLdNode = Record<string, unknown>

const buildPersonNodes = (metadata: BlogMetadata): JsonLdNode[] => {
  return metadata.authors.map((author) => ({
    '@type': 'Person',
    name: author.name,
    ...(author.url ? { url: author.url } : {}),
  }))
}

export const HOME_BREADCRUMB = {
  '@type': 'ListItem',
  position: 1,
  name: 'Blog',
  item: getCanonicalUrl(),
} as const

export const ORGANIZATION_NODE = {
  '@type': 'Organization',
  '@id': SEO.organizationId,
  name: SEO.organizationName,
  legalName: SEO.legalName,
  url: SEO.mainSiteUrl,
  logo: SEO.logoUrl,
  image: SEO.defaultOgImage,
  description:
    'Loopspeed designs and builds interactive 3D experiences, bespoke AI tools, and advanced web applications for teams launching ambitious digital products and campaigns.',
  email: SEO.email,
  sameAs: [SEO.linkedinUrl],
  contactPoint: {
    '@type': 'ContactPoint',
    email: SEO.email,
    contactType: 'customer service',
    availableLanguage: 'English',
  },
  knowsAbout: ['Next.js', 'TypeScript', 'Three.js', 'WebGL', 'WebGPU', 'AI Development', 'Full-stack Development'],
} as const

export const WEBSITE_NODE = {
  '@type': 'WebSite',
  '@id': SEO.websiteId,
  name: SEO.siteName,
  url: SEO.siteUrl,
  inLanguage: SEO.language,
  publisher: {
    '@id': SEO.organizationId,
  },
} as const

export const BLOG_NODE = {
  '@type': 'Blog',
  '@id': SEO.blogId,
  name: SEO.siteName,
  description: SEO.defaultDescription,
  url: SEO.siteUrl,
  inLanguage: SEO.language,
  publisher: {
    '@id': SEO.organizationId,
  },
  isPartOf: {
    '@id': SEO.websiteId,
  },
} as const

export const buildBlogListingJsonLd = (posts: BlogMetadata[]): JsonLdNode => ({
  '@context': 'https://schema.org',
  '@graph': [
    ORGANIZATION_NODE,
    WEBSITE_NODE,
    BLOG_NODE,
    {
      '@type': 'ItemList',
      '@id': `${SEO.siteUrl}/#blog-posts`,
      name: 'Loopspeed Blog Posts',
      itemListElement: posts.map((metadata, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        url: getBlogPostUrl(metadata.slug),
        item: {
          '@type': 'BlogPosting',
          '@id': `${getBlogPostUrl(metadata.slug)}#blog-posting`,
          headline: metadata.title,
          description: metadata.description,
          url: getBlogPostUrl(metadata.slug),
          image: getBlogPostOgImageUrl(metadata.slug),
          datePublished: metadata.date,
          dateModified: metadata.date,
          author: buildPersonNodes(metadata),
          keywords: metadata.tags,
          publisher: {
            '@id': SEO.organizationId,
          },
        },
      })),
    },
  ],
})

export const buildBlogPostingJsonLd = (metadata: BlogMetadata): JsonLdNode => {
  const url = getBlogPostUrl(metadata.slug)

  return {
    '@context': 'https://schema.org',
    '@graph': [
      ORGANIZATION_NODE,
      WEBSITE_NODE,
      BLOG_NODE,
      {
        '@type': 'BlogPosting',
        '@id': `${url}#blog-posting`,
        headline: metadata.title,
        description: metadata.description,
        abstract: metadata.description,
        url,
        mainEntityOfPage: url,
        image: getBlogPostOgImageUrl(metadata.slug),
        datePublished: metadata.date,
        dateModified: metadata.date,
        author: buildPersonNodes(metadata),
        keywords: metadata.tags,
        publisher: {
          '@id': SEO.organizationId,
        },
        isPartOf: {
          '@id': SEO.blogId,
        },
      },
    ],
  }
}

export const buildDemoCreativeWorkJsonLd = (metadata: BlogMetadata): JsonLdNode => {
  const url = getBlogDemoUrl(metadata.slug)
  const postUrl = getBlogPostUrl(metadata.slug)

  return {
    '@context': 'https://schema.org',
    '@graph': [
      ORGANIZATION_NODE,
      WEBSITE_NODE,
      {
        '@type': 'CreativeWork',
        '@id': `${url}#creative-work`,
        name: `${metadata.title} Demo`,
        headline: `${metadata.title} Demo`,
        description: metadata.description,
        url,
        mainEntityOfPage: url,
        image: getBlogDemoOgImageUrl(metadata.slug),
        datePublished: metadata.date,
        dateModified: metadata.date,
        author: buildPersonNodes(metadata),
        keywords: metadata.tags,
        publisher: {
          '@id': SEO.organizationId,
        },
        isPartOf: {
          '@id': `${postUrl}#blog-posting`,
        },
        about: {
          '@id': `${postUrl}#blog-posting`,
        },
      },
    ],
  }
}
