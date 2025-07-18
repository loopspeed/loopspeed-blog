export enum Pathname {
  Home = '/',
  BlogPost = '/[slug]',
  Example = '/example/[slug]',
}

export const replaceSlug = (pathname: string, slug: string) => pathname.replace('[slug]', slug)

export enum BlogSlug {
  WavePlane = 'wave-plane',
  NextJsShaderSetup = 'nextjs-setup-glsl-shaders',
  ImageSequenceHeader = 'scroll-driven-image-sequence-header',
  AnimatedCSSGrid = 'animated-css-grid-with-tailwind-gsap',
  ReactThreeFiberWebGPUTypescript = 'react-three-fiber-webgpu-typescript',
}

export enum ExampleSlug {
  ImageSequence = 'scroll-driven-image-sequence-header',
  ScrollingBackgroundShader = 'scrolling-background-shader',
  ScrollingThreeJs = 'three-scrolling-scene',
  StarsParticles = 'three-stars-particles',
  FBOEffects = 'fbo-effects',
  InfiniteMarquee = 'infinite-scrolling-marquee',
  WavePlane = 'three-wave-plane',
  RayMarching = 'raymarching-fragment-shader',
  AnimatedCSSGrid = 'animated-grid-tailwind-gsap',
  EnergyTransfer = 'three-energy-transfer-concept',
  LoopPoints = 'three-loop-mesh-fbo-points',
}
