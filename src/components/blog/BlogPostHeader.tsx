import { format } from 'date-fns'
import { ArrowUpRight } from 'lucide-react'
import Image from 'next/image'
import React, { type FC } from 'react'

import githubIcon from '@/assets/icons/socials/github.svg'
import youtubeIcon from '@/assets/icons/socials/youtube.svg'
import Button from '@/components/buttons/Button'
import Tag from '@/components/Tag'
import type { BlogMetadata } from '@/model/blog'

const BlogPostHeader: FC<BlogMetadata & { hasDemo: boolean }> = ({
  slug,
  title,
  tags,
  date,
  authors,
  hasDemo,
  githubUrl,
  youtubeUrl,
  externalDemoUrl,
  viewLiveLink,
}) => {
  const formattedDate = format(new Date(date), 'PPP')

  return (
    <header className="relative flex w-full bg-linear-0 from-black/30 to-black/0 to-40% select-none">
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

        {hasDemo && (
          <Button href={`/${slug}/demo`} target="_blank" icon={<ArrowUpRight />}>
            Live demo
          </Button>
        )}

        {!!externalDemoUrl && (
          <Button href={externalDemoUrl} icon={<ArrowUpRight />} target="_blank">
            Live demo
          </Button>
        )}

        {!!viewLiveLink && (
          <Button href={viewLiveLink} target="_blank" icon={<ArrowUpRight />}>
            View Live
          </Button>
        )}

        <div className="flex gap-3">
          {!!githubUrl && (
            <Button variant="outlined" href={githubUrl} target="_blank">
              <Image src={githubIcon} alt="GitHub" className="size-5 md:size-6" />
            </Button>
          )}

          {!!youtubeUrl && (
            <Button variant="outlined" href={youtubeUrl} target="_blank">
              <Image src={youtubeIcon} alt="YouTube" className="size-5 md:size-6" />
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}

export default BlogPostHeader
