import React, { type FC } from 'react'
import { twMerge } from 'tailwind-merge'

type Props = {
  name: string
  className?: string
}

const Tag: FC<Props> = ({ name, className }) => {
  return (
    <span
      className={twMerge(
        'text-light bg-darkest rounded-sm px-1.5 py-0.5 font-mono text-xs font-semibold tracking-wide shadow-sm',
        className,
      )}>
      #{name}
    </span>
  )
}

export default Tag
