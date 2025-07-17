import React, { type FC, type InputHTMLAttributes, useEffect, useState } from 'react'
import { twMerge } from 'tailwind-merge'

type Props = InputHTMLAttributes<HTMLInputElement> & { isInvalid?: boolean }

export const INPUT_CLASSES =
  'w-full text-sm sm:text-base border bg-transparent focus:ring-2 focus:ring-accent-teal outline-none focus:outline-hidden rounded-md border-accent-teal/40 px-4 transition-colors duration-300'

const Input: FC<Props> = ({ className, isInvalid, id, placeholder, ...props }) => {
  const [isError, setIsError] = useState(isInvalid)

  useEffect(() => {
    setIsError(isInvalid)
  }, [isInvalid])

  const handleFocus = () => {
    setIsError(false)
  }

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    if (id === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      setIsError(!emailRegex.test(e.target.value)) // Set error if email format is invalid
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    props.onChange?.(e)
  }

  return (
    <div className="relative flex w-full flex-col">
      {/* Floating label */}
      {isInvalid !== undefined && (
        <label htmlFor={id} className="mb-0.5 h-4 text-xs">
          {isError ? (id === 'email' ? 'Invalid email address' : 'This field is required') : null}
        </label>
      )}

      {/* Input field */}
      <input
        id={id}
        className={twMerge(
          'h-14 [@media(max-height:700px)]:h-12',
          INPUT_CLASSES,
          isError && 'placeholder:text-error',
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

export default Input
