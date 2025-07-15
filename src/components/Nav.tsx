'use client'

import { ArrowDownWideNarrow } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { type FC, useRef, useState } from 'react'
import { Transition } from 'react-transition-group'

import logo from '@/assets/brand/logo.svg'
import { BLOG_CONTENT } from '@/resources/blog'
import { BlogSlug, Pathname } from '@/resources/pathname'

const Nav: FC = () => {
  const slug = useParams().slug as BlogSlug | undefined
  const blogPostContent = BLOG_CONTENT?.[slug!]
  const [showDropdown, setShowDropdown] = useState(false)

  return (
    <header className="z-max fixed top-0 left-0 flex w-full items-center gap-8 bg-black px-8">
      <Image src={logo} alt="Loopspeed Logo" className="h-5 w-auto" />
      <div className="relative flex items-center gap-4 py-4">
        <Link href={Pathname.Home} className="text-white/60 transition-colors hover:text-white">
          Blog
        </Link>
        {!!blogPostContent && (
          <>
            <span className="text-white/60">/</span>
            <button
              className="flex items-center gap-2 text-white/60 transition-colors hover:text-white"
              onClick={() => setShowDropdown((prev) => !prev)}>
              {blogPostContent.metadata.title}
              <ArrowDownWideNarrow />
            </button>

            <Dropdown show={showDropdown} />
          </>
        )}
      </div>
    </header>
  )
}

export default Nav

type Props = {
  show: boolean
}

const Dropdown: FC<Props> = ({ show }) => {
  const container = useRef<HTMLDivElement>(null)

  return (
    <Transition in={show} nodeRef={container} timeout={{ enter: 0, exit: 200 }} appear unmountOnExit mountOnEnter>
      <div
        ref={container}
        className="z-max absolute top-full left-0 mt-1 flex size-fit max-w-96 flex-col gap-4 rounded-lg bg-black/80 py-6 text-white shadow-lg backdrop-blur-2xl">
        {Object.values(BlogSlug).map((slug) => (
          <div key={slug}>
            <Link href={`/${slug}`} className="px-4">
              {slug}
            </Link>
          </div>
        ))}
      </div>
    </Transition>
  )
}
