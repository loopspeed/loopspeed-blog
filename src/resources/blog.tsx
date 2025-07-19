import { type FC } from 'react'

import type { BlogMetadata } from '@/model/blog'
import { BlogSlug } from '@/resources/pathname'

import AnimatedCSSGrid, { metadata as animatedCSSGridMetadata } from './posts/animated-css-grid.mdx'
import ImageSequence, { metadata as imageSequenceMetadata } from './posts/image-sequence.mdx'
import NextJsShaders, { metadata as nextShadersMetadata } from './posts/next-shaders.mdx'
import ReactThreeFiberWebGPUTypescript, { metadata as r3fWebGPUMetadata } from './posts/r3f-webgpu-setup.mdx'
import WavePlane, { metadata as wavePlaneMetadata } from './posts/wave-plane.mdx'

// **New Blog Requirements**

// Article and code reviewed by at least one other team member

// Title and description - concise and benefit focused - why should someone read this article?
// Metadata populated and exported from .mdx file
// Preview video recorded for 16:9 aspect ratio (record 1280 x 720 px in dev tools)
// Video optimised using ffmpeg and added to public/blog/videos

export const BLOG_CONTENT: Record<BlogSlug, { Component: FC; metadata: BlogMetadata; videoSrc: string | null }> = {
  [BlogSlug.WavePlane]: {
    Component: WavePlane,
    metadata: wavePlaneMetadata,
    videoSrc: '/blog/videos/wave-plane.mp4',
  },
  [BlogSlug.ImageSequenceHeader]: {
    Component: ImageSequence,
    metadata: imageSequenceMetadata,
    videoSrc: '/blog/videos/scroll-driven-image-sequence.mp4',
  },
  [BlogSlug.AnimatedCSSGrid]: { Component: AnimatedCSSGrid, metadata: animatedCSSGridMetadata, videoSrc: null },
  [BlogSlug.ReactThreeFiberWebGPUTypescript]: {
    Component: ReactThreeFiberWebGPUTypescript,
    metadata: r3fWebGPUMetadata,
    videoSrc: null,
  },
  [BlogSlug.NextJsShaderSetup]: {
    Component: NextJsShaders,
    metadata: nextShadersMetadata,
    videoSrc: '/blog/videos/scrolling-background-shader.mp4',
  },
}

const sortBlogContentByDate = (a: { metadata: BlogMetadata }, b: { metadata: BlogMetadata }) => {
  return new Date(b.metadata.date).getTime() - new Date(a.metadata.date).getTime()
}

export const ORDERED_BLOG_CONTENT = Object.values(BLOG_CONTENT).sort(sortBlogContentByDate)
