'use client'
import { Canvas, extend, ThreeToJSXElements } from '@react-three/fiber'
import React, { type FC } from 'react'
import { type WebGPURendererParameters } from 'three/src/renderers/webgpu/WebGPURenderer.js'
import { color, Fn, mix, mx_noise_float, screenUV, time } from 'three/tsl'
import * as THREE from 'three/webgpu'

import { DARK, DARKEST } from '@/resources/colours'

declare module '@react-three/fiber' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface ThreeElements extends ThreeToJSXElements<typeof THREE> {}
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
extend(THREE as any)

const BlogBackgroundCanvas: FC = () => {
  return (
    <Canvas
      id="blog-background-canvas"
      className="!fixed !inset-0 !h-lvh"
      flat={true}
      scene={{ backgroundNode: BackgroundNode }}
      gl={async (props) => {
        props.powerPreference = 'low-power'
        const renderer = new THREE.WebGPURenderer(props as WebGPURendererParameters)
        renderer.outputColorSpace = 'srgb'
        await renderer.init()
        return renderer
      }}
    />
  )
}

// Equivalent GLSL code for the background node
// void main() {
//   float n = noise(vec3(vUv.x * 1.2, vUv.y * 1.2, uTime * 0.16));
//   vec3 colour = mix(uMidColour, uDarkColour, n + 0.8);

//   float nf = noise(vec3(vUv * 400.0, uTime * 0.4));
//   vec3 noiseColour = mix(colour, uMidColour, nf);

//   colour = mix(colour, noiseColour, 0.3);
//   gl_FragColor = vec4(colour, 1.0);
// }

const BackgroundNode = Fn(() => {
  const colourNoise = mx_noise_float(screenUV.mul(1.4).add(time.mul(0.16)))
    .mul(0.5)
    .add(0.5)
    .clamp(0.0, 1.0)
  const c = mix(color(DARK), color(DARKEST), colourNoise)

  const grainNoise = mx_noise_float(screenUV.mul(640)).mul(0.5).add(0.5).clamp(0.0, 1.0)
  const finalColour = mix(color(DARKEST), c, grainNoise)

  return finalColour
})()

export default BlogBackgroundCanvas
