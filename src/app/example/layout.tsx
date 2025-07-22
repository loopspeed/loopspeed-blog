'use client'
import { Leva } from 'leva'
import { type ReactNode } from 'react'

export default function ExampleLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {/* Positions the Leva controls if used */}
      <Leva titleBar={{ position: { x: -16, y: 56 } }} />
      {children}
    </>
  )
}
