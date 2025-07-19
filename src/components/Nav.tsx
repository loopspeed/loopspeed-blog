'use client'

import { useGSAP } from '@gsap/react'
import { format } from 'date-fns'
import gsap from 'gsap'
import { ChevronDown, ChevronUp } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { type FC, useEffect, useMemo, useRef, useState } from 'react'
import { Transition, type TransitionStatus } from 'react-transition-group'
import { twJoin } from 'tailwind-merge'

import logo from '@/assets/brand/logo.svg'
import Tag from '@/components/Tag'
import { BLOG_CONTENT, ORDERED_BLOG_CONTENT } from '@/resources/blog'
import { BlogSlug, Pathname, replaceSlug } from '@/resources/pathname'

type Props = {
  isMobile: boolean
}

const Nav: FC<Props> = ({ isMobile }) => {
  const buttonRef = useRef<HTMLButtonElement>(null)
  const slug = useParams().slug as BlogSlug | undefined
  const blogPostContent = BLOG_CONTENT?.[slug!]
  const [showDropdown, setShowDropdown] = useState(false)

  const Icon = useMemo(() => (showDropdown ? ChevronUp : ChevronDown), [showDropdown])

  return (
    <header className="z-max horizontal-padding fixed top-0 left-0 flex h-(--nav-height) w-full items-center gap-4 bg-black sm:gap-8">
      <a href="https://loopspeed.co.uk" target="_blank" rel="noopener noreferrer">
        <Image src={logo} alt="Loopspeed Logo" className="h-4 w-auto flex-shrink-0 sm:h-5" />
      </a>
      <div className={twJoin('flex min-w-0 grow items-center gap-2.5 py-2 sm:gap-4', !isMobile && 'relative')}>
        <Link
          href={Pathname.Home}
          className="flex-shrink-0 py-2 text-xs text-white/60 transition-colors hover:text-white sm:text-sm">
          Blog
        </Link>
        {!!blogPostContent && (
          <>
            <span className="flex-shrink-0 text-xs text-white/60 sm:text-sm">/</span>
            <button
              ref={buttonRef}
              className="flex min-w-0 items-center gap-1 py-2 text-left text-sm font-semibold text-white transition-colors hover:text-white/60 sm:gap-2 sm:text-base"
              onClick={() => {
                setShowDropdown((prev) => !prev)
              }}>
              <span className="truncate">{blogPostContent.metadata.title}</span>
              <Icon className="size-4 flex-shrink-0 sm:size-5" />
            </button>

            <Dropdown
              isMobile={isMobile}
              buttonRef={buttonRef}
              show={showDropdown}
              closeDropdown={() => setShowDropdown(false)}
            />
          </>
        )}
      </div>
    </header>
  )
}

export default Nav

type DropdownProps = {
  isMobile: boolean
  buttonRef: React.RefObject<HTMLButtonElement | null>
  closeDropdown: () => void
}

const Dropdown: FC<DropdownProps & { show: boolean }> = ({ show, ...props }) => {
  const container = useRef<HTMLDivElement>(null)
  return (
    <Transition in={show} nodeRef={container} timeout={{ enter: 0, exit: 150 }} appear unmountOnExit mountOnEnter>
      {(status) => (
        <div
          ref={container}
          className={twJoin(
            'z-max absolute top-full left-0 mt-1 flex size-fit max-w-4xl origin-top flex-col gap-4 rounded bg-black/90 pt-4 pb-3 text-left text-white shadow-xl backdrop-blur sm:pt-5 sm:pb-4',
            props.isMobile && 'mx-2',
          )}>
          <DropDownContent container={container} transitionStatus={status} {...props} />
        </div>
      )}
    </Transition>
  )
}

type DropDownContentProps = DropdownProps & {
  container: React.RefObject<HTMLDivElement | null>
  transitionStatus: TransitionStatus
}

const DropDownContent: FC<DropDownContentProps> = ({
  container,
  buttonRef,
  isMobile,
  transitionStatus,
  closeDropdown,
}) => {
  const { contextSafe } = useGSAP({ scope: container })
  const push = useRouter().push

  useEffect(() => {
    // Set event listener to close dropdown on outside click
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (!container.current?.contains(event.target as Node) && !buttonRef.current?.contains(event.target as Node))
        closeDropdown()
    }

    document.addEventListener('touchstart', handleClickOutside)
    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
    }
  }, [buttonRef, container, closeDropdown])

  const animateClose = contextSafe((onComplete?: () => void) => {
    gsap.to(container.current, {
      opacity: 0,
      scaleY: 0.8,
      duration: 0.13,
      ease: 'power2.in',
      onComplete: () => {
        onComplete?.()
      },
    })
  })

  useGSAP(
    () => {
      if (transitionStatus === 'entering') {
        gsap
          .timeline()
          .fromTo(
            container.current,
            { opacity: 0, scaleY: 0.5 },
            { opacity: 1, scaleY: 1, duration: 0.2, ease: 'power2.out' },
          )
          .fromTo(
            '#tags, #post-list button',
            { opacity: 0, y: -8 },
            { opacity: 1, y: 0, duration: 0.15, stagger: 0.05, ease: 'power2.out' },
            '-=0.1',
          )
      }

      if (transitionStatus === 'exiting') {
        animateClose()
      }
    },
    { scope: container, dependencies: [transitionStatus] },
  )

  const onPostClick = (slug: string) => {
    animateClose(() => {
      push(replaceSlug(Pathname.BlogPost, slug))
      closeDropdown()
    })
  }

  // TODO: add Tags filtering - refer to Pragmattic blog

  // Extracted tags from ORDERED_BLOG_CONTENT
  // Remove duplicates, limit the number of tags to 30 & randomise the order
  const tags = useMemo(() => {
    return ORDERED_BLOG_CONTENT.flatMap(({ metadata: { tags } }) => tags)
      .filter((tag, index, self) => self.indexOf(tag) === index)
      .sort(() => Math.random() - 0.5)
      .slice(0, isMobile ? 10 : 30)
      .map((tag) => <Tag key={tag} name={tag} className="md:text-sm" />)
  }, [isMobile])

  return (
    <>
      <div id="tags" className="flex w-full max-w-3xl flex-wrap px-2 sm:px-4">
        {tags}
      </div>
      <div className="mx-auto h-[1px] w-[97%] bg-white/20" />
      <div id="post-list" className="h-fit max-h-[500px] space-y-2 overflow-y-auto sm:space-y-4">
        {ORDERED_BLOG_CONTENT.map(({ metadata: { slug, title, date } }) => (
          <button
            key={slug}
            className="group flex w-full items-baseline gap-2 px-2 py-1 text-left opacity-0 sm:gap-4 sm:px-4"
            onClick={() => onPostClick(slug)}>
            <span className="text-xxs whitespace-nowrap text-white/60 sm:text-sm md:text-base">
              {format(new Date(date), 'MMM yyyy')}
            </span>
            <p className="text-sm transition-colors group-hover:text-white/80 sm:text-base sm:tracking-wider md:text-lg">
              {title}
            </p>
          </button>
        ))}
      </div>
    </>
  )
}
