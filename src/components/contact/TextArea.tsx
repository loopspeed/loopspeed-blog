import React, { type FC, type TextareaHTMLAttributes, useState } from 'react'
import { twMerge } from 'tailwind-merge'

import { useTextAreaResize } from '@/components/contact/useTextAreaResize'

import { INPUT_CLASSES } from './Input'

type Props = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  isInvalid?: boolean
}

const TextArea: FC<Props> = ({ className, isInvalid, id, placeholder, ...props }) => {
  const [isFocused, setIsFocused] = useState(false)
  const [hasValue, setHasValue] = useState(false)

  const [value, setValue] = useState(props.value as string)
  const { textarea } = useTextAreaResize(value)

  const handleFocus = () => setIsFocused(true)

  const handleBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    if (!e.target.value) setIsFocused(false)
  }

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setHasValue(e.target.value !== '')
    setValue(e.target.value)
    if (props.onChange) props.onChange(e)
  }

  return (
    <div className="flex w-full flex-col">
      {/* Floating label */}
      {isInvalid !== undefined && (
        <label htmlFor={id} className="mb-0.5 h-4 text-xs">
          {isInvalid && 'This field is required'}
        </label>
      )}
      {/* Textarea field */}
      <textarea
        id={id}
        ref={textarea}
        className={twMerge(
          'min-h-24 resize-none py-2 [@media(max-height:700px)]:min-h-16',
          INPUT_CLASSES,
          isInvalid && 'border-error placeholder:text-[red]',
          className,
        )}
        {...props}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onChange={handleChange}
        placeholder={placeholder} // Actual placeholder managed by label
      />
    </div>
  )
}

export default TextArea
