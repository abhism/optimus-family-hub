import type { ReactNode } from 'react'
import { cx, moneyParts } from '../../lib/format'

type Tone = 'neutral' | 'accent' | 'positive' | 'warn' | 'danger' | 'dark'

const TONES: Record<Tone, string> = {
  neutral: 'bg-neutral-100 text-ink-soft',
  accent: 'bg-accent-soft text-accent',
  positive: 'bg-teal-50 text-positive',
  warn: 'bg-warnsoft text-warn',
  danger: 'bg-dangersoft text-danger',
  dark: 'bg-ink text-white',
}

export function Badge({
  children,
  tone = 'neutral',
  icon,
  className,
}: {
  children: ReactNode
  tone?: Tone
  icon?: ReactNode
  className?: string
}) {
  return (
    <span
      className={cx(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold',
        TONES[tone],
        className,
      )}
    >
      {icon}
      {children}
    </span>
  )
}

/** Large display figure. Integer dollars dominant, cents subordinate. */
export function MoneyDisplay({
  value,
  size = 'lg',
  className,
}: {
  value: number
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}) {
  const { sign, whole, cents } = moneyParts(value)
  const scale = {
    sm: ['text-[19px]', 'text-[12px]'],
    md: ['text-[26px]', 'text-[14px]'],
    lg: ['text-[34px]', 'text-[17px]'],
    xl: ['text-[42px]', 'text-[20px]'],
  }[size]

  return (
    <p className={cx('numeral font-semibold leading-none', scale[0], className)}>
      {sign}
      <span className="text-[0.62em] align-top font-semibold">$</span>
      {whole}
      <span className={cx('font-semibold text-ink-muted', scale[1])}>
        .{cents}
      </span>
    </p>
  )
}

/** Usage bar for spend against a card's policy ceiling. */
export function LimitBar({
  spent,
  limit,
  /** When funds bind before the limit does, show where that cut-off sits. */
  fundsCeiling,
  className,
}: {
  spent: number
  limit: number
  fundsCeiling?: number | null
  className?: string
}) {
  const pct = limit > 0 ? Math.min(100, (spent / limit) * 100) : 0
  const fundsPct =
    fundsCeiling !== null && fundsCeiling !== undefined && limit > 0
      ? Math.min(100, ((spent + fundsCeiling) / limit) * 100)
      : null

  const tone =
    pct >= 100 ? 'bg-danger' : pct >= 80 ? 'bg-warn' : 'bg-accent'

  return (
    <div
      className={cx('relative h-2 w-full rounded-full bg-neutral-200', className)}
      role="img"
      aria-label={`${Math.round(pct)}% of the card spending limit used`}
    >
      <div
        className={cx('h-full rounded-full transition-all duration-500', tone)}
        style={{ width: `${pct}%` }}
      />
      {fundsPct !== null && fundsPct < 100 && (
        <span
          className="absolute top-[-3px] h-[14px] w-[2px] rounded-full bg-warn"
          style={{ left: `${fundsPct}%` }}
          aria-hidden
        />
      )}
    </div>
  )
}

export function Avatar({
  name,
  tone = 'accent',
  size = 'md',
}: {
  name: string
  tone?: 'accent' | 'child' | 'neutral'
  size?: 'sm' | 'md' | 'lg'
}) {
  const dims = {
    sm: 'h-8 w-8 text-[11px]',
    md: 'h-10 w-10 text-[13px]',
    lg: 'h-14 w-14 text-[17px]',
  }[size]
  const skin = {
    accent: 'bg-gradient-to-br from-accent to-violet-600 text-white',
    child: 'bg-gradient-to-br from-violet-500 to-pink-500 text-white',
    neutral: 'bg-neutral-200 text-ink-soft',
  }[tone]
  const letters = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('')

  return (
    <span
      className={cx(
        'grid shrink-0 place-items-center rounded-full font-semibold',
        dims,
        skin,
      )}
      aria-hidden
    >
      {letters}
    </span>
  )
}
