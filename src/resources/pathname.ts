export enum Pathname {
  Home = '/',
  BlogPost = '/[slug]',
}

export const replaceSlug = (pathname: string, slug: string) => pathname.replace('[slug]', slug)

export enum BlogSlug {
  WavePlane = 'wave-plane',
  NextJsWebGLShaderSetup = 'nextjs-setup-glsl-shaders',
  ImageSequenceHeader = 'scroll-driven-image-sequence-header',
  AnimatedCSSGrid = 'animated-css-grid-with-tailwind-gsap',
  ReactThreeFiberWebGPUTypescript = 'react-three-fiber-webgpu-typescript',
  FBOParticles = 'fbo-particles-simulation',
  NextJsLocalisation = 'next-js-localisation',
  FaceIDRebuild = 'face-id-rebuild',
  LiquidGlass = 'liquid-glass',
  AlcedoAI = 'alcedo-ai',
}
