import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cx } from '../../lib/format'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'dangerSoft'
type Size = 'md' | 'lg' | 'sm'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  full?: boolean
  icon?: ReactNode
  trailingIcon?: ReactNode
}

const VARIANTS: Record<Variant, string> = {
  primary:
    'bg-accent text-white hover:bg-accent-hover disabled:bg-neutral-200 disabled:text-ink-faint',
  secondary:
    'bg-white text-ink border border-line hover:bg-neutral-50 disabled:text-ink-faint disabled:hover:bg-white',
  ghost:
    'bg-transparent text-accent hover:bg-accent-soft disabled:text-ink-faint disabled:hover:bg-transparent',
  danger: 'bg-danger text-white hover:bg-red-800 disabled:bg-neutral-200',
  dangerSoft:
    'bg-dangersoft text-danger border border-red-100 hover:bg-red-50',
}

const SIZES: Record<Size, string> = {
  sm: 'h-9 px-3 text-[13px] rounded-xl gap-1.5',
  md: 'h-11 px-4 text-[14px] rounded-xl gap-2',
  lg: 'h-13 px-5 text-[15px] rounded-2xl gap-2 min-h-[52px]',
}

export function Button({
  variant = 'primary',
  size = 'lg',
  full,
  icon,
  trailingIcon,
  className,
  children,
  ...rest
}: Props) {
  return (
    <button
      className={cx(
        'tap inline-flex items-center justify-center font-semibold disabled:cursor-not-allowed',
        VARIANTS[variant],
        SIZES[size],
        full && 'w-full',
        className,
      )}
      {...rest}
    >
      {icon}
      {children}
      {trailingIcon}
    </button>
  )
}
