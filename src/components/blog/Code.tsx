'use client'
import { CheckIcon, CopyIcon } from 'lucide-react'
import { type FC, type HTMLAttributes, type PropsWithChildren, useRef, useState } from 'react'
import { twMerge } from 'tailwind-merge'

const CodeBlock: FC<PropsWithChildren<HTMLAttributes<HTMLPreElement>>> = ({ children, className, ...attributes }) => {
  const pre = useRef<HTMLPreElement>(null)
  const [isCopied, setIsCopied] = useState(false)

  const onCopyClick = async () => {
    try {
      if (!pre.current) throw new Error('No code block found')
      navigator.clipboard.writeText(pre.current.innerText)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy text to clipboard:', err)
    }
  }

  return (
    <pre
      {...attributes}
      ref={pre}
      style={{
        overscrollBehavior: 'auto',
      }}
      className={twMerge('relative overflow-x-auto', className)}>
      {children}
      <button
        aria-label="Copy code"
        className="group absolute top-2 right-2 z-50 hidden size-8 items-center justify-center rounded border border-white/20 bg-black hover:border-white/50 md:flex"
        onClick={onCopyClick}>
        {isCopied ? <CheckIcon /> : <CopyIcon />}
      </button>
    </pre>
  )
}
export default CodeBlock
