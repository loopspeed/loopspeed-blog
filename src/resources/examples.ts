import { type FC } from 'react'

import AnimatedGridPage from '@/components/examples/animatedCSSGrid/AnimatedGridPage'
import ImageSequencePage from '@/components/examples/imageSequence/ImageSequenceHeader'
import RayMarchingPage from '@/components/examples/raymarching/RayMarchingPage'
import ScrollingBackgroundShaderPage from '@/components/examples/three/scrollingBackgroundGradient/ScrollingBackgroundGradientPage'
import ScrollingScenePage from '@/components/examples/three/scrollingScene/ScrollingScenePage'
import { WavePlanePage } from '@/components/examples/three/wavePlane/WavePlane'
import { type ExampleMetadata } from '@/model/example'
import { BlogSlug, ExampleSlug } from '@/resources/pathname'
import { TagName } from '@/resources/tags'

const EXAMPLES: Record<ExampleSlug, { Component: FC; metadata: ExampleMetadata }> = {
  [ExampleSlug.ImageSequence]: {
    Component: ImageSequencePage,
    metadata: {
      title: 'Scroll-driven image sequence header',
      tags: [TagName.React, TagName.GSAP, TagName.Tailwind],
      slug: ExampleSlug.ImageSequence,
      authors: [{ name: 'Matthew Frawley' }],
      blogSlug: BlogSlug.ImageSequenceHeader,
      youtubeUrl: 'https://youtu.be/l8hwkDAr0Eg',
      githubUrl:
        'https://github.com/prag-matt-ic/pragmattic/blob/main/src/components/examples/imageSequence/ImageSequenceHeader.tsx',
    },
  },
  [ExampleSlug.ScrollingBackgroundShader]: {
    Component: ScrollingBackgroundShaderPage,
    metadata: {
      title: 'Magical scrolling gradients',
      description: `This is a fun illustration of what's possible with a simple fragment shader - and almost impossible using Javascript and CSS. It's coloured using a cosine gradient function which uses a noise value generated within a loop. You can experiment with the settings to get a wide range of effects! I personally like setting the time to 0, iterations to 4 and intensity to 0.5.`,
      slug: ExampleSlug.ScrollingBackgroundShader,
      tags: [TagName.NextJS, TagName.FragmentShader, TagName.GSAP],
      authors: [{ name: 'Matthew Frawley' }],
      youtubeUrl: 'https://youtu.be/_YvCZ4I16Vg',
      githubUrl:
        'https://github.com/prag-matt-ic/pragmattic/blob/main/src/components/examples/scrollingBackgroundGradient/ScrollingBackgroundGradient.tsx',
    },
  },
  [ExampleSlug.ScrollingThreeJs]: {
    Component: ScrollingScenePage,
    metadata: {
      title: 'Scrolling React Three Fiber Scene',
      slug: ExampleSlug.ScrollingThreeJs,
      tags: [TagName.React, TagName.ThreeJS, TagName.GSAP],
      authors: [{ name: 'Matthew Frawley' }],
      youtubeUrl: 'https://youtu.be/1GGe3j59aKQ',
      githubUrl: 'https://github.com/prag-matt-ic/pragmattic/blob/main/src/app/examples/scrolling-three-scene/page.tsx',
    },
  },
  [ExampleSlug.WavePlane]: {
    Component: WavePlanePage,
    metadata: {
      title: 'ThreeJS Wave Plane',
      slug: ExampleSlug.WavePlane,
      tags: [TagName.React, TagName.ThreeJS, TagName.FragmentShader, TagName.VertexShader],
      authors: [{ name: 'Matthew Frawley' }],
      youtubeUrl: 'https://youtu.be/CepFdiDe3Lw',
      githubUrl: 'https://github.com/prag-matt-ic/pragmattic/tree/main/src/components/examples/three/wavePlane',
      blogSlug: BlogSlug.WavePlane,
    },
  },
  [ExampleSlug.RayMarching]: {
    Component: RayMarchingPage,
    metadata: {
      title: 'GLSL Ray Marching with infinite scroll',
      tags: [TagName.FragmentShader, TagName.GSAP],
      slug: ExampleSlug.RayMarching,
      authors: [{ name: 'Matthew Frawley' }],
      githubUrl:
        'https://github.com/prag-matt-ic/pragmattic/blob/main/src/components/examples/raymarching/RayMarchingScreenQuad.tsx',
    },
  },
  [ExampleSlug.AnimatedCSSGrid]: {
    Component: AnimatedGridPage,
    metadata: {
      title: 'Animated CSS Grid using Tailwind and GSAP',
      tags: [TagName.NextJS, TagName.GSAP, TagName.Responsive, TagName.Tailwind],
      slug: ExampleSlug.AnimatedCSSGrid,
      authors: [{ name: 'Matthew Frawley' }],
      githubUrl:
        'https://github.com/prag-matt-ic/pragmattic/blob/main/src/components/examples/animatedCSSGrid/AnimatedCSSGrid.tsx',
    },
  },
} as const

export default EXAMPLES
