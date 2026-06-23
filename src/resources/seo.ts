import { EMAIL_ADDRESS, SITE_URL } from '@/resources/brand'
import { Pathname } from '@/resources/pathname'

export const SEO = {
  siteName: 'Loopspeed Blog',
  organizationName: 'Loopspeed',
  legalName: 'Loopspeed Ltd',
  siteUrl: SITE_URL,
  mainSiteUrl: 'https://www.loopspeed.co.uk',
  defaultTitle: 'Loopspeed Blog',
  titleTemplate: '%s | Loopspeed Blog',
  defaultDescription: "A growing collection of guides, patterns, and fun stuff we've been building at Loopspeed.",
  locale: 'en_GB',
  language: 'en-GB',
  email: EMAIL_ADDRESS,
  organizationId: `${SITE_URL}/#organization`,
  websiteId: `${SITE_URL}/#website`,
  blogId: `${SITE_URL}/#blog`,
  defaultOgImage: `${SITE_URL}/opengraph-image`,
  defaultTwitterImage: `${SITE_URL}/twitter-image.jpg`,
  logoUrl: `${SITE_URL}/logo-type-dark.png`,
  linkedinUrl: 'https://www.linkedin.com/company/loopspeed',
} as const

export const getCanonicalUrl = (pathname: Pathname | string = Pathname.Home): string => {
  if (pathname === Pathname.Home) {
    return SEO.siteUrl
  }

  return `${SEO.siteUrl}${pathname}`
}

export const getBlogPostUrl = (slug: string): string => getCanonicalUrl(`/${slug}`)

export const getBlogDemoUrl = (slug: string): string => getCanonicalUrl(`/${slug}/demo`)

export const getBlogPostOgImageUrl = (slug: string): string => getCanonicalUrl(`/${slug}/opengraph-image`)

export const getBlogDemoOgImageUrl = (slug: string): string => getCanonicalUrl(`/${slug}/demo/opengraph-image`)
