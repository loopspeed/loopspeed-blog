import { type FC } from 'react'

import AnimatedGridPage from '@/components/examples/animatedCSSGrid/AnimatedGridPage'
import FBOParticlesCanvas from '@/components/examples/fboParticles/FBOParticles'
import ImageSequencePage from '@/components/examples/imageSequence/ImageSequenceHeader'
// import RayMarchingPage from '@/components/examples/raymarching/RayMarchingPage'
import ScrollingBackgroundShaderPage from '@/components/examples/three/scrollingBackgroundGradient/ScrollingBackgroundGradientPage'
import ScrollingScenePage from '@/components/examples/three/scrollingScene/ScrollingScenePage'
import { WavePlanePage } from '@/components/examples/three/wavePlane/WavePlane'
import type { BlogMetadata } from '@/model/blog'
import { BlogSlug } from '@/resources/pathname'

import AIChatbot, { metadata as aiChatbotMetadata } from './posts/ai-chatbot.mdx'
import AnimatedCSSGridBlog, { metadata as animatedCSSGridMetadata } from './posts/animated-css-grid.mdx'
import FBOParticlesBlog, { metadata as fboParticlesMetadata } from './posts/fbo-particles.mdx'
import ImageSequenceBlog, { metadata as imageSequenceMetadata } from './posts/image-sequence.mdx'
import NextJsLocalisation, { metadata as nextJsLocalisationMetadata } from './posts/next-js-localisation.mdx'
import NextJsShadersBlog, { metadata as nextShadersMetadata } from './posts/next-webgl-shaders.mdx'
import RTFWebGPUTypescriptBlog, { metadata as r3fWebGPUMetadata } from './posts/r3f-webgpu-setup.mdx'
import WavePlaneBlog, { metadata as wavePlaneMetadata } from './posts/wave-plane.mdx'

// ** New Blog Requirements **
// Article and code reviewed by at least one other team member

// Title and description - concise and benefit focused - why should someone read this article?
// Metadata populated and exported from .mdx file
// Preview video recorded for 16:9 aspect ratio (record 1280 x 720 px)
// Video must fade in and out to black. (Matt can help with this if needed)
// Video added to public/blog/videos in .mp4 format

type BlogContent = {
  Blog: FC
  metadata: BlogMetadata
  videoSrc: string | null
  Demo?: FC // Optional demo component for the blog post
}

export const BLOG_CONTENT: Record<BlogSlug, BlogContent> = {
  // WebGL and React Three Fiber
  [BlogSlug.NextJsWebGLShaderSetup]: {
    Blog: NextJsShadersBlog,
    Demo: ScrollingBackgroundShaderPage,
    metadata: nextShadersMetadata,
    videoSrc: '/blog/videos/scrolling-background-shader.mp4',
  },
  [BlogSlug.WavePlane]: {
    Blog: WavePlaneBlog,
    Demo: WavePlanePage,
    metadata: wavePlaneMetadata,
    videoSrc: '/blog/videos/wave-plane.mp4',
  },
  [BlogSlug.FBOParticles]: {
    Blog: FBOParticlesBlog,
    Demo: FBOParticlesCanvas,
    metadata: fboParticlesMetadata,
    videoSrc: '/blog/videos/fbo-particles.mp4',
  },
  // WebGPU and React Three Fiber
  [BlogSlug.ReactThreeFiberWebGPUTypescript]: {
    Blog: RTFWebGPUTypescriptBlog,
    Demo: ScrollingScenePage,
    metadata: r3fWebGPUMetadata,
    videoSrc: null,
  },
  // Image Sequence
  [BlogSlug.ImageSequenceHeader]: {
    Blog: ImageSequenceBlog,
    Demo: ImageSequencePage,
    metadata: imageSequenceMetadata,
    videoSrc: '/blog/videos/scroll-driven-image-sequence.mp4',
  },
  // HTML / CSS / GSAP
  [BlogSlug.AnimatedCSSGrid]: {
    Blog: AnimatedCSSGridBlog,
    Demo: AnimatedGridPage,
    metadata: animatedCSSGridMetadata,
    videoSrc: '/blog/videos/animated-grid.mp4',
  },
  [BlogSlug.NextJsLocalisation]: {
    Blog: NextJsLocalisation,
    metadata: nextJsLocalisationMetadata,
    videoSrc: '/blog/videos/next-js-localisation.mp4',
  },
  [BlogSlug.AIChatbot]: {
    Blog: AIChatbot,
    metadata: aiChatbotMetadata,
    videoSrc: '/blog/videos/ai-chatbot.mp4',
  },
}

const sortBlogContentByDate = (a: BlogContent, b: BlogContent): number => {
  return new Date(b.metadata.date).getTime() - new Date(a.metadata.date).getTime()
}

export const ORDERED_BLOG_CONTENT = Object.values(BLOG_CONTENT).sort(sortBlogContentByDate)
