'use client'

import { offset, size as floatingSize, useDismiss, useFloating, useInteractions } from '@floating-ui/react'
import { useGSAP } from '@gsap/react'
import { format } from 'date-fns'
import gsap from 'gsap'
import { ArrowUpRight, ChevronDown, ChevronUp } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { type FC, RefObject, useEffect, useRef, useState } from 'react'
import { Transition, type TransitionStatus } from 'react-transition-group'
import { twJoin } from 'tailwind-merge'

import logo from '@/assets/brand/logo.svg'
import Button from '@/components/buttons/Button'
import { BLOG_CONTENT, ORDERED_BLOG_CONTENT } from '@/resources/blog'
import { BlogSlug, Pathname, replaceSlug } from '@/resources/pathname'

const Nav: FC = () => {
  const buttonRef = useRef<HTMLButtonElement>(null)
  const slug = useParams().slug as BlogSlug | undefined
  const blogPostContent = BLOG_CONTENT?.[slug!]
  const [showDropdown, setShowDropdown] = useState(false)

  return (
    <nav className="z-max fixed top-0 left-0 flex h-(--nav-height) w-full items-center gap-2.5 bg-black px-(--x-padding) py-2 sm:gap-4">
      <Link
        href={Pathname.Home}
        className="paragraph-sm flex shrink-0 items-center gap-3 text-white/60 transition-colors hover:text-white sm:text-sm">
        <Image src={logo} alt="Loopspeed Logo" className="h-4 w-auto flex-shrink-0 sm:h-5" />
        Blog
      </Link>
      {!!blogPostContent ? (
        <div className="flex flex-1 items-center gap-2 overflow-hidden sm:gap-3">
          <span className="paragraph-sm flex-shrink-0 text-white/60">/</span>
          <button
            ref={buttonRef}
            className="flex min-w-0 items-center gap-1 py-2 text-left font-semibold text-white transition-colors hover:text-white/60 sm:gap-2"
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
      ) : (
        <div className="flex-1" />
      )}

      <Button size="small" icon={<ArrowUpRight className="size-4.5" />} href="https://loopspeed.co.uk" target="_blank">
        Loopspeed
      </Button>
    </nav>
  )
}

export default Nav

type DropdownProps = {
  buttonRef: RefObject<HTMLButtonElement | null>
  closeDropdown: () => void
}

const Dropdown: FC<DropdownProps & { show: boolean }> = ({ show, buttonRef, closeDropdown }) => {
  // Floating UI
  const { refs, floatingStyles, context } = useFloating({
    strategy: 'fixed',
    placement: 'bottom-start',
    transform: false, // keep GSAP transform animations (scaleY) separate from positioning
    open: show,
    onOpenChange: (open) => {
      if (!open) closeDropdown()
    },
    middleware: [
      offset(8),
      floatingSize({
        padding: 8,
        apply({ availableHeight, elements }) {
          Object.assign(elements.floating.style, {
            maxHeight: `${availableHeight}px`,
          })
        },
      }),
    ],
  })

  useEffect(() => {
    if (buttonRef.current) refs.setReference(buttonRef.current)
  }, [buttonRef, refs])

  // Close on outside click / Escape
  const dismiss = useDismiss(context)
  const { getFloatingProps } = useInteractions([dismiss])

  return (
    <Transition
      in={show}
      nodeRef={refs.floating as RefObject<HTMLDivElement>}
      timeout={{ enter: 0, exit: 150 }}
      appear
      unmountOnExit
      mountOnEnter>
      {(status) => (
        <div
          ref={refs.setFloating}
          {...getFloatingProps()}
          style={floatingStyles}
          className={twJoin(
            // NOTE: Floating handles positioning; no absolute/top/left/margins needed here
            'z-max flex size-fit max-w-4xl origin-top flex-col gap-4 rounded bg-black/90 pt-4 pb-3 text-left text-white shadow-xl backdrop-blur sm:pt-5 sm:pb-4',
          )}>
          <DropdownPanel
            container={refs.floating as RefObject<HTMLDivElement>}
            transitionStatus={status}
            buttonRef={buttonRef}
            closeDropdown={closeDropdown}
          />
        </div>
      )}
    </Transition>
  )
}

type DropdownPanelProps = DropdownProps & {
  container: React.RefObject<HTMLDivElement | null>
  transitionStatus: TransitionStatus
}

const DropdownPanel: FC<DropdownPanelProps> = ({ container, transitionStatus, closeDropdown }) => {
  const { contextSafe } = useGSAP({ scope: container })
  const push = useRouter().push

  const animateClose = contextSafe((onComplete?: () => void) => {
    gsap.to(container.current, {
      opacity: 0,
      scaleY: 0.8,
      duration: 0.13,
      ease: 'power2.in',
      onComplete: () => onComplete?.(),
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
            '#post-list button',
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
  // const tags = useMemo(() => {
  //   return ORDERED_BLOG_CONTENT.flatMap(({ metadata: { tags } }) => tags)
  //     .filter((tag, index, self) => self.indexOf(tag) === index)
  //     .sort(() => Math.random() - 0.5)
  //     .slice(0, 30)
  //     .map((tag) => <Tag key={tag} name={tag} className="md:text-sm" />)
  // }, [])
  return (
    <div id="post-list" className="h-fit max-h-[540px] space-y-2 overflow-y-auto sm:space-y-4">
      {/* <div id="tags" className="flex w-full max-w-3xl flex-wrap px-2 sm:px-4">
        {tags}
      </div> */}
      {ORDERED_BLOG_CONTENT.map(({ metadata: { slug, title, date } }) => (
        <button
          key={slug}
          className="group flex w-full items-baseline gap-2 px-2 py-1 text-left opacity-0 sm:gap-4 sm:px-4"
          onClick={() => onPostClick(slug)}>
          <span className="paragraph-xs text-light/70 whitespace-nowrap">{format(new Date(date), 'MMM yyyy')}</span>
          <p className="paragraph-sm group-hover:text-accent-teal max-w-lg overflow-hidden text-ellipsis transition-colors">
            {title}
          </p>
        </button>
      ))}
    </div>
  )
}
