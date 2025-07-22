'use client'

import { useGSAP } from '@gsap/react'
import { useDidUpdate, useViewportSize } from '@mantine/hooks'
import { format } from 'date-fns'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/dist/ScrollTrigger'
import { ArrowUpRight, ChevronDown, ChevronUp, Menu, X } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { type FC, useEffect, useMemo, useRef, useState } from 'react'
import { Transition, type TransitionStatus } from 'react-transition-group'
import { twJoin } from 'tailwind-merge'

import logo from '@/assets/brand/logo.svg'
import Button from '@/components/buttons/Button'
import Tag from '@/components/Tag'
// import { useGA4Event } from '@/hooks/useGA4Event'
// import { EventName } from '@/resources/analytics'
import { BLOG_CONTENT, ORDERED_BLOG_CONTENT } from '@/resources/blog'
import { BlogSlug, Pathname, replaceSlug } from '@/resources/pathname'

// Constant value matches the width at which the nav expands to show all links - md = 768px
const DESKTOP_BREAKPOINT = 768
const MOBILE_BREAKPOINT = DESKTOP_BREAKPOINT - 1

gsap.registerPlugin(ScrollTrigger)

const Nav: FC = () => {
  const { width } = useViewportSize()
  const isLargeWidth = width >= DESKTOP_BREAKPOINT

  const buttonRef = useRef<HTMLButtonElement>(null)
  const slug = useParams().slug as BlogSlug | undefined
  const blogPostContent = BLOG_CONTENT?.[slug!]
  const [showDropdown, setShowDropdown] = useState(false)
  // const { sendEvent } = useGA4Event()

  const nav = useRef<HTMLElement>(null)
  const background = useRef<HTMLDivElement>(null)
  const links = useRef<HTMLDivElement>(null)

  const [isExpanded, setIsExpanded] = useState(false)

  useDidUpdate(() => {
    if (!isLargeWidth) {
      setIsExpanded(false)
    }
  }, [isLargeWidth])

  useGSAP(
    () => {
      gsap.set(nav.current, { display: 'flex' })
      gsap.set(links.current, { display: 'none' })
      gsap.from(nav.current, { y: -96, duration: 1, ease: 'power2.in' })

      const matchMedia = gsap.matchMedia()
      matchMedia.add(`(min-width: ${DESKTOP_BREAKPOINT}px)`, () => {
        ScrollTrigger.create({
          start: 400,
          onEnter: () => setIsExpanded(true),
          onLeave: () => setIsExpanded(false),
          onEnterBack: () => setIsExpanded(true),
          onLeaveBack: () => setIsExpanded(false),
          onRefresh: (self) => setIsExpanded(self.isActive),
        })
      })
    },
    { scope: nav, dependencies: [] },
  )

  useGSAP(
    () => {
      const matchMedia = gsap.matchMedia()

      const expandNav = () => {
        // large
        matchMedia.add(`(min-width: ${DESKTOP_BREAKPOINT}px)`, () => {
          gsap
            .timeline()
            .to(background.current, { width: 840, duration: 0.3, ease: 'power2.inOut' })
            .set(background.current, { clearProps: 'height' })
            .set(links.current, { display: 'flex' })
            .to('.link', {
              opacity: 1,
              y: 0,
              duration: 0.4,
              stagger: 0.05,
              ease: 'power2.inOut',
            })
        })
        // small
        matchMedia.add(`(max-width: ${MOBILE_BREAKPOINT}px)`, () => {
          gsap
            .timeline()
            .to(background.current, { width: '100%', height: '100%', duration: 0.3, ease: 'power2.out' })
            .set(links.current, { display: 'flex' })
            .to('.link', {
              opacity: 1,
              y: 0,
              duration: 0.2,
              stagger: 0.05,
              ease: 'power2.out',
            })
        })
      }

      const collapseNav = () => {
        // large
        matchMedia.add(`(min-width: ${DESKTOP_BREAKPOINT}px)`, () => {
          gsap
            .timeline()
            .to('.link', {
              opacity: 0,
              y: 16,
              duration: 0.2,
              ease: 'power2.in',
            })
            .set(links.current, { display: 'none' })
            .to(background.current, { width: 'auto', duration: 0.3, ease: 'power2.out' })
            .set(background.current, { clearProps: 'height' })
        })

        // small
        matchMedia.add(`(max-width: ${MOBILE_BREAKPOINT}px)`, () => {
          gsap
            .timeline()
            .to('.link', {
              opacity: 0,
              y: 16,
              duration: 0.2,
              stagger: 0.05,
              ease: 'power2.in',
            })
            .set(links.current, { display: 'none' })
            .to(background.current, { width: 'auto', duration: 0.3, ease: 'power2.out' })
        })
      }

      if (isExpanded) expandNav()
      else collapseNav()
    },
    { scope: nav, dependencies: [isExpanded] },
  )

  return (
    <nav
      ref={nav}
      className="fixed top-0 right-0 left-0 z-1000 hidden max-w-full items-center justify-center px-4 py-2 md:px-8">
      {/* Background is wrapping the elements. */}

      <div
        ref={background}
        className="flex w-fit flex-col items-center justify-center gap-4 rounded-3xl bg-black px-4 py-3 md:h-16 md:flex-row md:justify-between md:rounded-full">
        {/* Alternative layout for mobile */}
        {!isLargeWidth && isExpanded ? (
          <div className="flex gap-2">
            <Link
              href={Pathname.Home}
              className="paragraph-sm flex shrink-0 items-center gap-3 text-white/60 transition-colors hover:text-white sm:text-sm">
              <Image src={logo} alt="Loopspeed Logo" className="h-4 w-auto flex-shrink-0 sm:h-5" />
              Blog
            </Link>
            <Button
              size="small"
              icon={<ArrowUpRight className="size-4.5" />}
              href="https://loopspeed.co.uk"
              target="_blank"
              // className="link"
              // onClick={() => {
              //   sendEvent(EventName.ClickGoToLoopspeed)
              // }}
              className="link ml-2">
              Loopspeed
            </Button>
          </div>
        ) : (
          <Link
            href={Pathname.Home}
            className="paragraph-sm flex shrink-0 items-center gap-3 text-white/60 transition-colors hover:text-white sm:text-sm">
            <Image src={logo} alt="Loopspeed Logo" className="h-4 w-auto flex-shrink-0 sm:h-5" />
            Blog
          </Link>
        )}

        {!!blogPostContent && (
          <div ref={links} className="flex w-full flex-1 items-center gap-2 overflow-hidden px-2 sm:gap-3">
            <span className="paragraph-sm flex-shrink-0 text-white/60">/</span>
            <button
              ref={buttonRef}
              className="flex min-w-0 items-center gap-1 text-left font-semibold text-white transition-colors hover:text-white/60 sm:gap-2"
              onClick={() => {
                setShowDropdown((prev) => !prev)
              }}>
              <span className="truncate">{blogPostContent.metadata.title}</span>
              {showDropdown ? (
                <ChevronUp className="size-4 flex-shrink-0 sm:size-5" />
              ) : (
                <ChevronDown className="size-4 flex-shrink-0 sm:size-5" />
              )}
            </button>

            <Dropdown buttonRef={buttonRef} show={showDropdown} closeDropdown={() => setShowDropdown(false)} />
          </div>
        )}

        {isLargeWidth && isExpanded && (
          <Button
            size="small"
            icon={<ArrowUpRight className="size-4.5" />}
            href="https://loopspeed.co.uk"
            target="_blank"
            // className="link"
            // onClick={() => {
            //   sendEvent(EventName.ClickGoToLoopspeed)
            // }}
            className="link ml-2">
            Loopspeed
          </Button>
        )}
      </div>

      <button
        className="absolute top-2.5 right-4 flex size-10 items-center justify-center rounded-full bg-black md:hidden"
        aria-label="Menu Toggle"
        onClick={() => setIsExpanded((prev) => !prev)}>
        {isExpanded ? (
          <X strokeWidth={1.5} className="size-5 text-white" />
        ) : (
          <Menu strokeWidth={1.5} className="size-5 text-white" />
        )}
      </button>
    </nav>
  )
}

export default Nav

type DropdownProps = {
  buttonRef: React.RefObject<HTMLButtonElement | null>
  closeDropdown: () => void
}

const Dropdown: FC<DropdownProps & { show: boolean }> = ({ show, ...props }) => {
  const container = useRef<HTMLDivElement>(null)
  // TODO: Refactor to use Floating UI..
  return (
    <Transition in={show} nodeRef={container} timeout={{ enter: 0, exit: 150 }} appear unmountOnExit mountOnEnter>
      {(status) => (
        <div
          ref={container}
          className={twJoin(
            'z-max fixed top-full mx-auto mt-1 mr-8 flex size-fit max-w-4xl origin-top flex-col gap-4 rounded bg-black/90 pt-4 pb-3 text-left text-white shadow-xl backdrop-blur sm:pt-5 sm:pb-4',
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

const DropDownContent: FC<DropDownContentProps> = ({ container, buttonRef, transitionStatus, closeDropdown }) => {
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
      .slice(0, 30)
      .map((tag) => <Tag key={tag} name={tag} className="md:text-sm" />)
  }, [])

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
