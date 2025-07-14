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

  if (!headingLinks.length) return null

  return (
    <nav
      ref={container}
      className="sticky top-12 z-50 hidden h-fit min-w-md shrink-0 px-12 pt-16 pb-10 xl:block 2xl:px-16">
      <h4 role="button" className="text-light mb-3 w-full text-sm tracking-wide uppercase" onClick={scrollToTop}>
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
                  'w-full py-1.5 text-left text-base font-medium hover:text-white',
                  isActive ? 'font-semibold text-white' : 'text-light',
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
