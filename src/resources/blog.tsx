import { type FC } from 'react'

import { ScrollBackgroundGradientCanvas } from '@/components/examples/three/scrollingBackgroundGradient/ScrollingBackgroundGradient'
import { GridLinesFragmentShaderPlaneCanvas } from '@/components/examples/three/wavePlane/blog/WavePlaneBlog'
import type { BlogMetadata } from '@/model/blog'
import { BlogSlug } from '@/resources/pathname'

import AnimatedCSSGrid, { metadata as animatedCSSGridMetadata } from './posts/animated-css-grid.mdx'
import ImageSequence, { metadata as imageSequenceMetadata } from './posts/image-sequence.mdx'
import NextJsShaders, { metadata as nextShadersMetadata } from './posts/next-shaders.mdx'
import ReactThreeFiberWebGPUTypescript, { metadata as r3fWebGPUMetadata } from './posts/r3f-webgpu-setup.mdx'
import WavePlane, { metadata as wavePlaneMetadata } from './posts/wave-plane.mdx'

const Video: FC<{ src: string }> = ({ src }) => {
  return (
    <video autoPlay loop muted playsInline className="-mt-9 h-[calc(100%+36px)] w-full overflow-hidden object-cover">
      <source src={src} type="video/mp4" />
    </video>
  )
}

export const BLOG_CONTENT: Record<BlogSlug, { Component: FC; metadata: BlogMetadata; CardComponent: React.ReactNode }> =
  {
    [BlogSlug.WavePlane]: {
      Component: WavePlane,
      metadata: wavePlaneMetadata,
      CardComponent: <GridLinesFragmentShaderPlaneCanvas sectionClassName="overflow-hidden size-full" />,
    },
    [BlogSlug.ImageSequenceHeader]: {
      Component: ImageSequence,
      metadata: imageSequenceMetadata,
      CardComponent: <Video src="/blog/videos/scroll-driven-image-sequence.mp4" />,
    },
    [BlogSlug.AnimatedCSSGrid]: { Component: AnimatedCSSGrid, metadata: animatedCSSGridMetadata, CardComponent: null },
    [BlogSlug.ReactThreeFiberWebGPUTypescript]: {
      Component: ReactThreeFiberWebGPUTypescript,
      metadata: r3fWebGPUMetadata,
      CardComponent: null,
    },
    [BlogSlug.NextJsShaderSetup]: {
      Component: NextJsShaders,
      metadata: nextShadersMetadata,
      CardComponent: <ScrollBackgroundGradientCanvas />,
    },
  }

const sortBlogContentByDate = (a: { metadata: BlogMetadata }, b: { metadata: BlogMetadata }) => {
  return new Date(b.metadata.date).getTime() - new Date(a.metadata.date).getTime()
}

export const ORDERED_BLOG_CONTENT = Object.values(BLOG_CONTENT).sort(sortBlogContentByDate)
