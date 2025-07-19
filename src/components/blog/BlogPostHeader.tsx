import { format } from 'date-fns'
import { ArrowUpRight } from 'lucide-react'
import React, { type FC } from 'react'

import Button from '@/components/buttons/Button'
import Tag from '@/components/Tag'
import type { BlogMetadata } from '@/model/blog'
import { Pathname, replaceSlug } from '@/resources/pathname'

const BlogPostHeader: FC<BlogMetadata> = ({ title, tags, exampleSlug, date, authors }) => {
  const formattedDate = format(new Date(date), 'PPP')
  return (
    <header className="relative flex w-full bg-linear-0 from-black/90 to-black/0 to-40% select-none">
      <div className="relative z-10 mx-auto flex size-full max-w-6xl flex-col items-center space-y-5 px-4 py-20 sm:px-12 sm:py-32">
        <div className="hidden flex-wrap justify-center gap-1.5 sm:flex">
          {tags.map((tag) => (
            <Tag key={tag} name={tag} />
          ))}
        </div>

        <h1
          className="heading-xl text-center text-balance"
          style={{
            textShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          }}>
          {title}
        </h1>

        <div className="paragraph-md relative flex w-fit items-center gap-2 whitespace-nowrap text-white/90 sm:gap-3">
          <span>{authors.map(({ name }) => name).join(', ')}</span>
          <span className="text-3xl">•</span>
          <span>{formattedDate}</span>
        </div>

        {!!exampleSlug && (
          <Button href={replaceSlug(Pathname.Example, exampleSlug)} target="_blank" icon={<ArrowUpRight />}>
            Live demo
          </Button>
        )}
      </div>
    </header>
  )
}

export default BlogPostHeader
