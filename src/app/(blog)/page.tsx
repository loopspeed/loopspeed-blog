import { format } from 'date-fns'
import { ArrowRightIcon } from 'lucide-react'
import Link from 'next/link'
import type { FC } from 'react'

import Button from '@/components/buttons/Button'
import CTA from '@/components/CTA'
import Header from '@/components/Header'
import Tag from '@/components/Tag'
// import { useGA4Event } from '@/hooks/useGA4Event'
import { BlogMetadata } from '@/model/blog'
// import { EventName } from '@/resources/analytics'
import { ORDERED_BLOG_CONTENT } from '@/resources/blog'
import { Pathname, replaceSlug } from '@/resources/pathname'

const isProduction = process.env.NODE_ENV === 'production'

export default function BlogListingPage() {
  const blogData = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: ORDERED_BLOG_CONTENT.map(({ metadata }, index) => ({
      '@type': 'BlogPosting',
      position: index + 1,
      headline: metadata.title,
      description: metadata.description,
      url: `https://blog.loopspeed.co.uk/${metadata.slug}`,
      author: metadata.authors?.map((author) => ({ '@type': 'Person', name: author.name })),
      datePublished: metadata.date,
    })),
  }

  return (
    <main className="relative min-h-lvh w-full text-white">
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

      <CTA />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(blogData) }} />
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
        <p className="paragraph-md text-white/80">{description}</p>
        {/* Authors and date */}
        <div className="paragraph-sm flex items-center gap-2 text-white/80 *:block">
          <span>{authors.map(({ name }) => name).join(', ')}</span> •<span>{format(new Date(date), 'MMM yyyy')}</span>
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

// TODO: add structured data (use AI and #fetch the relevant schema documentation)
