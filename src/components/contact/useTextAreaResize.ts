import { useLayoutEffect, useRef } from 'react'

export function useTextAreaResize(value: string | null) {
  const textarea = useRef<HTMLTextAreaElement>(null)

  useLayoutEffect(() => {
    if (!textarea.current) return
    // Sets height of text area to match the content
    textarea.current.style.height = 'auto'
    textarea.current.style.height = `${textarea.current.scrollHeight}px`
  }, [value])

  return { textarea }
}
