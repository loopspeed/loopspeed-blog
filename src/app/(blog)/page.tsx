import { format } from 'date-fns'
import Link from 'next/link'
import type { FC, PropsWithChildren, ReactNode } from 'react'

import Header from '@/components/Header'
import { ORDERED_BLOG_CONTENT } from '@/resources/blog'
import { Pathname, replaceSlug } from '@/resources/pathname'

const isProduction = process.env.NODE_ENV === 'production'

export default function BlogHomePage() {
  return (
    <main className="relative min-h-lvh w-full text-white">
      <Header />

      <section className="horizontal-padding w-full space-y-12">
        {ORDERED_BLOG_CONTENT.map(({ metadata: { slug, title, description, date, isDraft }, CardComponent }) => {
          if (!!isDraft && !isProduction) return null
          return (
            <BlogPostCard
              key={slug}
              href={replaceSlug(Pathname.BlogPost, slug)}
              heading={title}
              description={description}
              date={date}>
              {CardComponent}
            </BlogPostCard>
          )
        })}
      </section>
    </main>
  )
}

type CardProps = {
  href: string
  heading: ReactNode
  description: ReactNode
  date: string
}

const BlogPostCard: FC<PropsWithChildren<CardProps>> = ({ children, href, heading, description, date }) => {
  return (
    <Link
      href={href}
      className="flex flex-col items-center gap-4 rounded-lg border-black bg-black/20 p-2 hover:bg-black/40 sm:flex-row sm:p-4 lg:gap-12">
      {!!children && (
        <div className="relative aspect-square w-full shrink-0 overflow-hidden rounded sm:size-64 md:size-80 lg:size-96">
          {children}
        </div>
      )}
      <div className="max-w-4xl space-y-3 p-3 sm:p-0">
        <span className="text-light block text-xs sm:text-sm">{format(new Date(date), 'MMM yyyy')}</span>
        <h3 className="text-lg font-bold sm:text-xl md:text-2xl xl:text-3xl">{heading}</h3>
        <p className="text-white/70">{description}</p>
      </div>
    </Link>
  )
}

// TODO: add structured data
