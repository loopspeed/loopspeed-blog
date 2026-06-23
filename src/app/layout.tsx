import './globals.css'

import { GoogleAnalytics } from '@next/third-parties/google'
import type { Metadata } from 'next'
import { Red_Hat_Display } from 'next/font/google'
import { twJoin } from 'tailwind-merge'

import Footer from '@/components/footer/Footer'
import Nav from '@/components/Nav'
import { ALL_AUTHORS } from '@/model/blog'
import { SEO } from '@/resources/seo'

const sans = Red_Hat_Display({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
})

export const metadata: Metadata = {
  metadataBase: new URL(SEO.siteUrl),
  title: { template: SEO.titleTemplate, default: SEO.defaultTitle },
  applicationName: SEO.siteName,
  description: SEO.defaultDescription,
  authors: ALL_AUTHORS.map((author) => ({
    name: author.name,
  })),
  openGraph: {
    title: SEO.defaultTitle,
    description: SEO.defaultDescription,
    url: SEO.siteUrl,
    siteName: SEO.siteName,
    locale: SEO.locale,
    type: 'website',
    images: [
      {
        url: SEO.defaultOgImage,
        width: 1200,
        height: 630,
        alt: SEO.siteName,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: SEO.defaultTitle,
    description: SEO.defaultDescription,
    images: [SEO.defaultTwitterImage],
  },
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={twJoin(sans.variable, 'w-full bg-black font-sans text-white')}>
        <Nav />
        {children}
        {/* Consider that the demos use this layout- keep this to a minimum */}
        <Footer />
      </body>
      <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID!} />
    </html>
  )
}
