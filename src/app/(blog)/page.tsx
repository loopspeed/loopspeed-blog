import { format } from 'date-fns'
import { ArrowRightIcon } from 'lucide-react'
import type { Metadata } from 'next'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import type { FC } from 'react'

import Button from '@/components/buttons/Button'
import Header from '@/components/Header'
import { JsonLd } from '@/components/JsonLd'
import Tag from '@/components/Tag'
// import { useGA4Event } from '@/hooks/useGA4Event'
import { BlogMetadata } from '@/model/blog'
// import { EventName } from '@/resources/analytics'
import { ORDERED_BLOG_CONTENT } from '@/resources/blog'
import { buildBlogListingJsonLd } from '@/resources/jsonLd'
import { Pathname, replaceSlug } from '@/resources/pathname'
import { getCanonicalUrl, SEO } from '@/resources/seo'

const CTA = dynamic(() => import('@/components/CTA'))

const isProduction = process.env.NODE_ENV === 'production'

export const metadata: Metadata = {
  title: SEO.defaultTitle,
  description: SEO.defaultDescription,
  alternates: {
    canonical: getCanonicalUrl(),
  },
  openGraph: {
    title: SEO.defaultTitle,
    description: SEO.defaultDescription,
    url: getCanonicalUrl(),
    siteName: SEO.siteName,
    locale: SEO.locale,
    type: 'website',
    images: [
      {
        url: SEO.defaultOgImage,
        width: 1200,
        height: 630,
        alt: SEO.siteName,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: SEO.defaultTitle,
    description: SEO.defaultDescription,
    images: [SEO.defaultOgImage],
  },
}

export default function BlogListingPage() {
  const visiblePosts = ORDERED_BLOG_CONTENT.filter(({ metadata, videoSrc }) => {
    if (!!metadata.isDraft && isProduction) return false
    if (!videoSrc && isProduction) return false

    return true
  })

  return (
    <main className="relative min-h-lvh w-full text-white">
      <Header />

      <section className="flex flex-col items-center space-y-24 px-(--x-padding) py-20 lg:space-y-32">
        {visiblePosts.map(({ metadata, videoSrc }) => {
          const { slug } = metadata
          return (
            <BlogPostCard key={slug} href={replaceSlug(Pathname.BlogPost, slug)} {...metadata} videoSrc={videoSrc} />
          )
        })}
      </section>

      <CTA />
      <JsonLd data={buildBlogListingJsonLd(visiblePosts.map(({ metadata }) => metadata))} />
    </main>
  )
}

type CardProps = BlogMetadata & {
  href: string
  videoSrc: string | null
}

const BlogPostCard: FC<CardProps> = ({ href, title, tags, authors, description, date, videoSrc }) => {
  // const { sendEvent } = useGA4Event()
  return (
    <div className="flex flex-col items-center gap-6 lg:gap-10">
      <Link href={href}>
        <video
          autoPlay
          loop
          muted
          playsInline
          className="shadow-light/15 outline-darkest hover:outline-accent-teal aspect-video max-h-[60svh] w-4xl overflow-hidden rounded-sm object-cover shadow-2xl outline">
          {!!videoSrc && <source src={videoSrc} type="video/mp4" />}
          {/* TODO: update to support poster images. */}
        </video>
      </Link>

      <div className="relative z-10 flex w-full max-w-2xl flex-col gap-3 lg:gap-4">
        {/* Tags */}
        <div className="hidden w-fit max-w-full flex-wrap gap-1.5 sm:flex">
          {tags.map((tag) => (
            <Tag key={tag} name={tag} />
          ))}
        </div>
        {/* Title and description */}
        <h3 className="heading-md !font-medium">{title}</h3>
        <p className="paragraph text-white/80">{description}</p>
        {/* Authors and date */}
        <div className="paragraph-sm flex gap-2 text-white/60 *:block">
          <span>{authors.map(({ name }) => name).join(', ')}</span> •
          <span className="shrink-0 whitespace-nowrap">{format(new Date(date), 'MMM yyyy')}</span>
        </div>
        <Button
          className="w-fit"
          href={href}
          size="small"
          variant="outlined"
          icon={<ArrowRightIcon size={20} />}
          // onClick={() => sendEvent(EventName.ClickReadMore, { blog_post: title })}
        >
          Read more
        </Button>
      </div>
    </div>
  )
}
