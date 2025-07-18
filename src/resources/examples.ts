import { type FC } from 'react'

import AnimatedGridPage from '@/components/examples/animatedCSSGrid/AnimatedGridPage'
import MarqueePage from '@/components/examples/animatedMarquee/MarqueePage'
import ImageSequencePage from '@/components/examples/imageSequence/ImageSequenceHeader'
import RayMarchingPage from '@/components/examples/raymarching/RayMarchingPage'
import EnergyTransferCanvas from '@/components/examples/three/energyTransfer/EnergyTransfer'
import FBOEffectsCanvas from '@/components/examples/three/fboEffectShader/FBOEffects'
import LoopPointsCanvas from '@/components/examples/three/loopPoints/LoopPointsCanvas'
import StarWarsPage from '@/components/examples/three/particles/stars/StarWarsPage'
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
  [ExampleSlug.StarsParticles]: {
    Component: StarWarsPage,
    metadata: {
      title: 'Stars Wars particles with scrolling text',
      slug: ExampleSlug.StarsParticles,
      tags: [TagName.React, TagName.ThreeJS, TagName.Particles, TagName.Tailwind],
      authors: [{ name: 'Matthew Frawley' }],
      youtubeUrl: 'https://youtu.be/E4XKY-ISKdU',
      githubUrl: 'https://github.com/prag-matt-ic/pragmattic/blob/main/src/app/examples/stars-particles/page.tsx',
    },
  },
  [ExampleSlug.FBOEffects]: {
    Component: FBOEffectsCanvas,
    metadata: {
      title: 'FBO Effects',
      slug: ExampleSlug.FBOEffects,
      tags: [TagName.PostProcessing, TagName.ThreeJS, TagName.FragmentShader],
      authors: [{ name: 'Matthew Frawley' }],
      youtubeUrl: 'https://youtu.be/vJaLN3UMnso',
      githubUrl:
        'https://github.com/prag-matt-ic/pragmattic/blob/main/src/components/examples/fboEffectShader/FBOEffects.tsx',
    },
  },
  [ExampleSlug.InfiniteMarquee]: {
    Component: MarqueePage,
    metadata: {
      title: 'Infinite marquee for logos or icons',
      slug: ExampleSlug.InfiniteMarquee,
      tags: [TagName.React, TagName.GSAP, TagName.Tailwind],
      authors: [{ name: 'Matthew Frawley' }],
      youtubeUrl: 'https://youtu.be/KLruwdU28bw',
      githubUrl: 'https://github.com/prag-matt-ic/pragmattic/blob/main/src/components/examples/Marquee.tsx',
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
  [ExampleSlug.EnergyTransfer]: {
    Component: EnergyTransferCanvas,
    metadata: {
      title: 'Energy Transfer',
      description: `This was inspired by a magnet attraction effect in the thoroughly enjoyable game "It Takes Two"! It's essentially just a cylindrical tunnel, points and two spheres. Each with
        their own vertex and fragment shader. The energy “lines” are spawned in JS with random colour, length and
        duration before being drawn in the cylinder fragment shader. I've been learning that it's much easier to manage animation progress and randomise parameters outside of
        the shader code!`,
      tags: [TagName.ThreeJS, TagName.FragmentShader, TagName.VertexShader, TagName.PostProcessing, TagName.Particles],
      slug: ExampleSlug.EnergyTransfer,
      authors: [{ name: 'Matthew Frawley' }],
      githubUrl: 'https://github.com/prag-matt-ic/pragmattic/tree/main/src/components/examples/three/energyTransfer',
    },
  },
  [ExampleSlug.LoopPoints]: {
    Component: LoopPointsCanvas,
    metadata: {
      title: 'Scatty Loop Points',
      description: `In this example I'm sampling points on the loop mesh and creating a second set of scattered 3D positions. Both position sets are passed into a simulation shader as a data texture. Noise is then applied to animate the positions. Toggling between the two states triggers a GSAP tween on the scattered value, which is used in the simulation shader to mix between the two positions. The output of the simulation is then passed into the points vertex shader to set their positions. The code is written in such a way that any mesh can be used as the basis for points. You could make something pretty cool if you used a scroll trigger to update the scattered value!`,
      tags: [TagName.ThreeJS, TagName.FragmentShader, TagName.VertexShader, TagName.Particles],
      slug: ExampleSlug.LoopPoints,
      authors: [{ name: 'Matthew Frawley' }],
      githubUrl: 'https://github.com/prag-matt-ic/pragmattic/tree/main/src/components/examples/three/loopPoints',
    },
  },
} as const

export default EXAMPLES
