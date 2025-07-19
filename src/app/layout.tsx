import './globals.css'

import type { Metadata } from 'next'
import { Red_Hat_Display } from 'next/font/google'
import { twJoin } from 'tailwind-merge'

import Footer from '@/components/footer/Footer'
import Nav from '@/components/Nav'
import { ALL_AUTHORS } from '@/model/blog'

const sans = Red_Hat_Display({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
})

export const metadata: Metadata = {
  title: { template: '%s | Loopspeed', default: 'Loopspeed Blog' },
  description: "A growing collection of guides, patterns, and fun stuff we've been building.",
  authors: ALL_AUTHORS.map((author) => ({
    name: author.name,
  })),
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
        <Footer />
      </body>
    </html>
  )
}
