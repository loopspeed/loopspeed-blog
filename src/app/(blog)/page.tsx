import { format } from 'date-fns'
import Link from 'next/link'
import type { FC } from 'react'

import Button from '@/components/buttons/Button'
import Header from '@/components/Header'
import Tag from '@/components/Tag'
import { BlogMetadata } from '@/model/blog'
import { ORDERED_BLOG_CONTENT } from '@/resources/blog'
import { Pathname, replaceSlug } from '@/resources/pathname'

const isProduction = process.env.NODE_ENV === 'production'

export default function BlogListingPage() {
  return (
    <main className="relative min-h-lvh w-full pt-(--nav-height) text-white">
      <Header />

      <section className="horizontal-padding flex flex-col items-center space-y-24 py-20 lg:space-y-32">
        {ORDERED_BLOG_CONTENT.map(({ metadata, videoSrc }) => {
          const { slug, isDraft } = metadata
          if (!!isDraft && isProduction) return null
          if (!videoSrc && isProduction) return null
          return (
            <BlogPostCard key={slug} href={replaceSlug(Pathname.BlogPost, slug)} {...metadata} videoSrc={videoSrc} />
          )
        })}
      </section>
    </main>
  )
}

type CardProps = BlogMetadata & {
  href: string
  videoSrc: string | null
}

const BlogPostCard: FC<CardProps> = ({ href, title, tags, authors, description, date, videoSrc }) => {
  return (
    <div className="flex flex-col items-center gap-6 lg:gap-10">
      <Link href={href}>
        <video
          autoPlay
          loop
          muted
          playsInline
          className="shadow-light/15 outline-darkest aspect-video max-h-[60svh] w-4xl overflow-hidden rounded-sm object-cover shadow-2xl outline">
          <source src={videoSrc ?? '/blog/videos/scroll-driven-image-sequence.mp4'} type="video/mp4" />
        </video>
      </Link>

      <div className="relative z-10 flex w-full max-w-2xl flex-col gap-3 lg:gap-4">
        {/* Tags */}
        <div className="hidden w-fit max-w-full flex-wrap justify-center gap-1.5 sm:flex">
          {tags.map((tag) => (
            <Tag key={tag} name={tag} />
          ))}
        </div>
        {/* Title and description */}
        <h3 className="heading-md !font-medium">{title}</h3>
        <p className="paragraph-md text-white/80">{description}</p>
        {/* Authors and date */}
        <div className="paragraph-sm flex items-center gap-2 text-white/80 *:block">
          <span>{authors.map(({ name }) => name).join(', ')}</span> •<span>{format(new Date(date), 'MMM yyyy')}</span>
        </div>
        <Button className="w-fit" href={href} size="small" variant="outlined">
          Read more
        </Button>
      </div>
    </div>
  )
}

// TODO: add structured data (use AI and #fetch the relevant schema documentation)
