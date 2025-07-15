import { type FC } from 'react'

import type { BlogMetadata } from '@/model/blog'
import { BlogSlug } from '@/resources/pathname'

import AnimatedCSSGrid, { metadata as animatedCSSGridMetadata } from './posts/animated-css-grid.mdx'
import ImageSequence, { metadata as imageSequenceMetadata } from './posts/image-sequence.mdx'
import NextJsShaders, { metadata as nextShadersMetadata } from './posts/next-shaders.mdx'
import ReactThreeFiberWebGPUTypescript, { metadata as r3fWebGPUMetadata } from './posts/r3f-webgpu-setup.mdx'
import WavePlane, { metadata as wavePlaneMetadata } from './posts/wave-plane.mdx'

export const BLOG_CONTENT: Record<BlogSlug, { Component: FC; metadata: BlogMetadata }> = {
  [BlogSlug.WavePlane]: { Component: WavePlane, metadata: wavePlaneMetadata },
  [BlogSlug.ImageSequenceHeader]: { Component: ImageSequence, metadata: imageSequenceMetadata },
  [BlogSlug.AnimatedCSSGrid]: { Component: AnimatedCSSGrid, metadata: animatedCSSGridMetadata },
  [BlogSlug.ReactThreeFiberWebGPUTypescript]: {
    Component: ReactThreeFiberWebGPUTypescript,
    metadata: r3fWebGPUMetadata,
  },
  [BlogSlug.NextJsShaderSetup]: { Component: NextJsShaders, metadata: nextShadersMetadata },
}

const sortBlogContentByDate = (a: { metadata: BlogMetadata }, b: { metadata: BlogMetadata }) => {
  return new Date(b.metadata.date).getTime() - new Date(a.metadata.date).getTime()
}

export const ORDERED_BLOG_CONTENT = Object.values(BLOG_CONTENT).sort(sortBlogContentByDate)
