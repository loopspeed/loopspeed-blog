import type { FC, PropsWithChildren } from 'react'
import { twMerge } from 'tailwind-merge'

const COMMON_CLASSES =
  'size-fit text-center max-w-4xl pointer-events-none relative isolate bg-linear-50/oklch bg-clip-text'

type Props = PropsWithChildren<{
  className?: string
  spanClassName?: string
}>

const Span: FC<Props> = ({ children, spanClassName }) => {
  return (
    <span
      style={{
        WebkitTextFillColor: 'transparent',
      }}
      className={spanClassName}>
      {children}
    </span>
  )
}

const Heading1: FC<Props> = ({ children, className, spanClassName }) => {
  return (
    <h1 className={twMerge('heading-xl', COMMON_CLASSES, className)}>
      <Span spanClassName={spanClassName}>{children}</Span>
    </h1>
  )
}

const Heading2: FC<Props> = ({ children, className, spanClassName }) => {
  return (
    <h2 className={twMerge('heading-lg', COMMON_CLASSES, className)}>
      <Span spanClassName={spanClassName}>{children}</Span>
    </h2>
  )
}

export { Heading1, Heading2 }
