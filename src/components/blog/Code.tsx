'use client'
import { CheckIcon, ChevronDownIcon, CopyIcon } from 'lucide-react'
import { type FC, type HTMLAttributes, type PropsWithChildren, useRef, useState } from 'react'
import { twMerge } from 'tailwind-merge'

const CodeBlock: FC<PropsWithChildren<HTMLAttributes<HTMLPreElement>>> = ({ children, className, ...attributes }) => {
  const pre = useRef<HTMLPreElement>(null)
  const [isCopied, setIsCopied] = useState(false)
  const [isOpen, setIsOpen] = useState(true)

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
      className={twMerge(
        'relative overflow-x-auto',
        isOpen ? 'h-auto' : 'h-12 overflow-hidden [&>code]:opacity-50',
        className,
      )}>
      <div className="absolute top-0 right-0 left-0 z-10 flex items-center justify-end gap-2 p-2">
        <button
          name="Copy code"
          aria-label="Copy code"
          className="group z-50 hidden size-8 items-center justify-center rounded border border-white/20 bg-black hover:border-white/50 md:flex"
          onClick={onCopyClick}>
          {isCopied ? <CheckIcon strokeWidth={1.5} /> : <CopyIcon strokeWidth={1.5} />}
        </button>
        <button
          name="Toggle visibility"
          aria-label="Toggle visibility"
          className="group z-50 hidden size-8 items-center justify-center rounded border border-white/20 bg-black hover:border-white/50 md:flex"
          onClick={() => setIsOpen(!isOpen)}>
          <ChevronDownIcon strokeWidth={1.5} className={`transition-transform ${isOpen ? 'rotate-0' : '-rotate-90'}`} />
        </button>
      </div>
      {children}
    </pre>
  )
}
export default CodeBlock
