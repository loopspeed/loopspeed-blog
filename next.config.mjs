/** @type {import('next').NextConfig} */

import createMDX from '@next/mdx'
import rehypePrettyCode from 'rehype-pretty-code'
import remarkGFM from 'remark-gfm'

const nextConfig = {
  reactStrictMode: false,
  devIndicators: false,
  pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
  webpack: (config) => {
    config.module.rules.push({
      test: /\.(glsl|vs|fs|vert|frag)$/,
      use: ['raw-loader', 'glslify', 'glslify-loader'],
    })

    // Add fallbacks for Node.js modules that face-api.js tries to use
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      crypto: false,
      encoding: false,
    }

    return config
  },
}

// https://rehype-pretty.pages.dev/

const codeOptions = {
  theme: 'github-dark-dimmed',
  keepBackground: false,
  defaultLang: {
    inline: 'plaintext',
  },
}

const withMDX = createMDX({
  extension: /\.mdx?$/,
  options: {
    remarkPlugins: [remarkGFM],
    rehypePlugins: [[rehypePrettyCode, codeOptions]],
  },
})

export default withMDX(nextConfig)
