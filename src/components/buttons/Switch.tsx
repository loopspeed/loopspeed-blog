import { type FC, InputHTMLAttributes, type ReactNode } from 'react'
import { twMerge } from 'tailwind-merge'

const BASE_CLASSES =
  "relative shrink-0 grow-0 cursor-pointer appearance-none h-[32px] w-[54px] rounded-full border border-dark transition-all duration-200 bg-white checked:border-transparent checked:bg-accent-teal after:absolute after:content-[''] after:top-[4px] after:start-[5px] after:h-[22px] after:w-[22px] after:rounded-full after:bg-light checked:after:bg-white after:transition-transform after:duration-200 checked:after:translate-x-[20px] focus-visible:after:ring-4 focus-visible:after:ring-dark/40 disabled:opacity-50 disabled:cursor-not-allowed"

export type SwitchProps = InputHTMLAttributes<HTMLInputElement> & {
  className?: string
}

export const Switch: FC<SwitchProps> = ({ className, ...props }) => (
  <input type="checkbox" className={twMerge(BASE_CLASSES, className)} {...props} />
)

export default Switch

export interface LabelledSwitchProps extends SwitchProps {
  label: ReactNode
  labelClassName?: string
}

export const LabelledSwitch: FC<LabelledSwitchProps> = ({ label, labelClassName, className, ...switchProps }) => (
  <label
    className={twMerge(
      'flex w-full items-center justify-between text-start text-lg font-bold capitalize',
      labelClassName,
    )}>
    {label && <span className="pr-24 leading-6 [@media(max-height:667px)]:pr-16">{label}</span>}
    <Switch className={className} {...switchProps} />
  </label>
)
