'use client'

import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import ScrollToPlugin from 'gsap/dist/ScrollToPlugin'
import ScrollTrigger from 'gsap/dist/ScrollTrigger'
import React, { type FC, useLayoutEffect, useRef, useState } from 'react'
import { twJoin } from 'tailwind-merge'

gsap.registerPlugin(ScrollTrigger, useGSAP, ScrollToPlugin)

const BlogHeadingsNav: FC = () => {
  const [headingLinks, setHeadingLinks] = useState<HTMLAnchorElement[]>([])
  const [activeHeadingId, setActiveHeadingId] = useState<string | null>(null)
  const container = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    // Find headings from the MDX body using the class name applied to <h2> elements
    const richTextHeadingLinks = gsap.utils.toArray('.blog-heading') as HTMLAnchorElement[]
    if (richTextHeadingLinks.length === 0) return
    setHeadingLinks(richTextHeadingLinks)
    setActiveHeadingId(richTextHeadingLinks[0].id)
  }, [])

  useGSAP(
    () => {
      // Create a scroll trigger for setting the active heading id
      gsap.matchMedia().add('(min-width: 1280px)', () => {
        headingLinks.forEach((el) => {
          const id = el.id
          ScrollTrigger.create({
            trigger: el,
            start: 'top 40%',
            end: 'top top',
            onEnter: () => setActiveHeadingId(id),
            onEnterBack: () => setActiveHeadingId(id),
          })
        })
      })
    },
    {
      scope: container,
      dependencies: [headingLinks],
    },
  )

  const scrollToTop = () => {
    gsap.to(window, {
      duration: 0.9,
      ease: 'power2.out',
      scrollTo: { y: 0 },
    })
  }

  const scrollToHeading = (id: string) => {
    gsap.to(window, {
      duration: 0.8,
      ease: 'power2.out',
      scrollTo: { y: `#${id}`, offsetY: 96 },
      onComplete: () => {
        setActiveHeadingId(id)
      },
    })
  }

  return (
    <nav
      ref={container}
      className="sticky top-(--nav-height) z-50 hidden h-fit w-sm px-8 pt-12 pb-10 xl:block 2xl:px-16">
      <h4 role="button" className="text-light paragraph-sm mb-3 w-full tracking-wide uppercase" onClick={scrollToTop}>
        Contents
      </h4>
      <ul className="flex w-full flex-col">
        {headingLinks.map((element, index) => {
          const heading = element.dataset.heading
          const isActive = activeHeadingId === element.id
          return (
            <li key={index}>
              <button
                className={twJoin(
                  'paragraph-sm w-full py-1 text-left !font-medium hover:text-white',
                  isActive ? 'text-white opacity-100' : 'text-light opacity-70',
                )}
                onClick={() => scrollToHeading(element.id)}>
                {heading}
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

export default BlogHeadingsNav
