import Link from 'next/link'
import { type ButtonHTMLAttributes, forwardRef, type PropsWithChildren, ReactNode } from 'react'
import { twMerge } from 'tailwind-merge'

export type Variant = 'filled' | 'outlined'
export type Size = 'xsmall' | 'small' | 'medium' | 'large'
export type ButtonColour = 'dark' | 'light' | 'accent-teal' | 'mid'

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  PropsWithChildren<{
    variant?: Variant
    size?: Size
    href?: string
    colour?: ButtonColour
    icon?: ReactNode
    target?: '_blank' | '_self'
  }>

const DEFAULT_CLASSES =
  'group/button pointer-events-auto relative flex cursor-pointer items-center justify-center overflow-hidden rounded-full font-sans leading-none font-black tracking-wide whitespace-nowrap transition-colors duration-200 select-none outline-none disabled:!opacity-80 disabled:!cursor-not-allowed active:scale-95'

const SIZE_CLASSES: Record<Size, string> = {
  xsmall: 'gap-1.5 px-2 py-1 text-sm min-h-8 [@media(max-height:700px)]:py-0.5 [@media(max-height:700px)]:px-1',
  small:
    'py-1.5 sm:py-2 px-4 text-xs sm:text-sm gap-1.5 min-h-10 [@media(max-height:700px)]:py-1 [@media(max-height:700px)]:px-3',
  medium:
    'py-2 px-5 text-sm sm:text-base sm:px-6 gap-2 min-h-11 [@media(max-height:700px)]:py-1.5 [@media(max-height:700px)]:px-4',
  large:
    'py-2.5 px-6 sm:px-8 text-base sm:text-lg gap-2.5 min-h-12 [@media(max-height:700px)]:py-2 [@media(max-height:700px)]:px-5',
} as const

const VARIANT_CLASSES: Record<
  Variant,
  {
    [key in ButtonColour]: string
  }
> = {
  filled: {
    dark: 'gradient-transition gradient-filled-dark hover:border-white text-black border border-black',
    light: 'bg-white bg-linear-70 from-accent-teal to-accent-teal text-black border border-white',
    'accent-teal': 'bg-accent-teal text-white hover:bg-accent-teal/80',
    mid: 'bg-mid text-black border-accent-teal hover:bg-mid/80 disabled:bg-mid border',
  },
  outlined: {
    dark: 'border text-white border-white/50 backdrop-blur-sm hover:bg-black hover:border-accent-orange',
    light: 'border text-white border-light hover:border-white',
    'accent-teal': 'border text-accent-teal border-accent-teal hover:bg-accent-teal hover:text-white',
    mid: 'bg-mid text-black border-accent-teal hover:bg-mid/80 disabled:bg-mid border',
  },
} as const

const Button = forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => {
  const { children, size = 'medium', variant = 'filled', colour = 'dark', className, href, icon, ...rest } = props

  const button = (
    <button
      ref={ref}
      {...rest}
      className={twMerge(DEFAULT_CLASSES, SIZE_CLASSES[size], VARIANT_CLASSES[variant][colour], className)}>
      {children}
      {icon && <span className="transition-transform duration-200 group-hover/button:translate-x-1">{icon}</span>}
    </button>
  )

  if (href?.startsWith('/'))
    return (
      <Link href={href} target={props.target}>
        {button}
      </Link>
    )

  if (!!href)
    return (
      <a href={href} target="_blank" rel="noreferrer" className="block size-fit">
        {button}
      </a>
    )

  return button
})

Button.displayName = 'Button'

export default Button
