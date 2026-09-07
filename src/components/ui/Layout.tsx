import type { ReactNode } from 'react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { cx } from '../../lib/format'

/**
 * Card surface.
 *
 * `tone` exists because passing `bg-accent-soft` via className would collide
 * with the base `bg-white`: Tailwind resolves same-property conflicts by the
 * order utilities appear in the generated stylesheet, not the order they
 * appear in the class attribute. Selecting the background here keeps it
 * deterministic.
 */
export function Surface({
  children,
  className,
  tone = 'plain',
  as: Tag = 'section',
}: {
  children: ReactNode
  className?: string
  tone?: 'plain' | 'accent' | 'warn' | 'danger'
  as?: 'section' | 'div' | 'article'
}) {
  const tones = {
    plain: 'border-line bg-white',
    accent: 'border-accent-line bg-accent-soft/70',
    warn: 'border-amber-200/70 bg-warnsoft',
    danger: 'border-red-100 bg-dangersoft',
  }
  return (
    <Tag
      className={cx(
        'rounded-2xl border shadow-card',
        tones[tone],
        className,
      )}
    >
      {children}
    </Tag>
  )
}

export function SectionLabel({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <h2
      className={cx(
        'px-1 pb-2 text-[11px] font-semibold uppercase tracking-[0.09em] text-ink-faint',
        className,
      )}
    >
      {children}
    </h2>
  )
}

/** Top app bar. `onBack` and `onClose` are mutually exclusive in practice. */
export function AppBar({
  title,
  subtitle,
  onBack,
  onClose,
  right,
  border = true,
}: {
  title?: string
  subtitle?: string
  onBack?: () => void
  onClose?: () => void
  right?: ReactNode
  border?: boolean
}) {
  return (
    <header
      className={cx(
        'sticky top-0 z-20 flex items-center gap-2 bg-paper/90 px-4 pb-3 pt-3 backdrop-blur-md',
        border && 'border-b border-line/70',
      )}
    >
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          aria-label="Back"
          className="tap -ml-2 grid h-9 w-9 place-items-center rounded-full text-ink hover:bg-neutral-200/60"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
      )}
      <div className="min-w-0 flex-1">
        {title && (
          <h1 className="truncate text-[15px] font-semibold leading-tight">
            {title}
          </h1>
        )}
        {subtitle && (
          <p className="truncate text-[12px] text-ink-muted">{subtitle}</p>
        )}
      </div>
      {right}
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="tap -mr-2 grid h-9 w-9 place-items-center rounded-full text-ink hover:bg-neutral-200/60"
        >
          <X className="h-5 w-5" />
        </button>
      )}
    </header>
  )
}

/** Scrollable body for a screen. */
export function ScreenBody({
  children,
  className,
  pad = true,
}: {
  children: ReactNode
  className?: string
  pad?: boolean
}) {
  return (
    <div
      className={cx(
        'thin-scrollbar flex-1 overflow-y-auto overscroll-contain',
        pad && 'px-4 pb-8 pt-4',
        className,
      )}
    >
      {children}
    </div>
  )
}

/** Sticky action area pinned to the bottom of a screen. */
export function ScreenFooter({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={cx(
        'sticky bottom-0 border-t border-line/70 bg-paper/95 px-4 pb-5 pt-3 backdrop-blur-md',
        className,
      )}
    >
      {children}
    </div>
  )
}

export function ListRow({
  icon,
  title,
  meta,
  right,
  onClick,
  danger,
  disabled,
  subtitle,
}: {
  icon?: ReactNode
  title: string
  subtitle?: string
  meta?: string
  right?: ReactNode
  onClick?: () => void
  danger?: boolean
  disabled?: boolean
}) {
  const Tag = onClick ? 'button' : 'div'
  return (
    <Tag
      {...(onClick ? { type: 'button' as const, onClick, disabled } : {})}
      className={cx(
        'flex w-full items-center gap-3 px-4 py-3.5 text-left',
        onClick && !disabled && 'tap hover:bg-neutral-50',
        disabled && 'opacity-45',
      )}
    >
      {icon && (
        <span
          className={cx(
            'grid h-9 w-9 shrink-0 place-items-center rounded-xl',
            danger ? 'bg-dangersoft text-danger' : 'bg-neutral-100 text-ink-soft',
          )}
        >
          {icon}
        </span>
      )}
      <span className="min-w-0 flex-1">
        <span
          className={cx(
            'block truncate text-[14px] font-medium',
            danger ? 'text-danger' : 'text-ink',
          )}
        >
          {title}
        </span>
        {subtitle && (
          <span className="mt-0.5 block text-[12.5px] leading-snug text-ink-muted">
            {subtitle}
          </span>
        )}
      </span>
      {meta && (
        <span className="numeral shrink-0 text-[13px] text-ink-muted">{meta}</span>
      )}
      {right}
      {onClick && !right && !meta && (
        <ChevronRight className="h-4 w-4 shrink-0 text-ink-faint" aria-hidden />
      )}
    </Tag>
  )
}

export function Divider() {
  return <div className="h-px bg-line" role="presentation" />
}

export function EmptyState({
  icon,
  title,
  body,
  action,
}: {
  icon: ReactNode
  title: string
  body: string
  action?: ReactNode
}) {
  return (
    <div className="animate-fade-up rounded-2xl border border-dashed border-line bg-white/60 px-6 py-10 text-center">
      <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-accent-soft text-accent">
        {icon}
      </div>
      <h3 className="mt-4 text-[15px] font-semibold">{title}</h3>
      <p className="mx-auto mt-1.5 max-w-[16rem] text-[13px] leading-relaxed text-ink-muted">
        {body}
      </p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

/** Step dots for multi-step flows. */
export function ProgressDots({
  total,
  index,
  label,
}: {
  total: number
  index: number
  label?: string
}) {
  return (
    <div className="flex items-center gap-2.5">
      <div
        className="flex items-center gap-1.5"
        role="progressbar"
        aria-valuemin={1}
        aria-valuemax={total}
        aria-valuenow={index + 1}
        aria-label={label ?? `Step ${index + 1} of ${total}`}
      >
        {Array.from({ length: total }).map((_, i) => (
          <span
            key={i}
            className={cx(
              'h-1.5 rounded-full transition-all duration-300',
              i === index
                ? 'w-5 bg-accent'
                : i < index
                  ? 'w-1.5 bg-accent/45'
                  : 'w-1.5 bg-neutral-300',
            )}
          />
        ))}
      </div>
      <span className="numeral text-[11px] font-medium text-ink-faint">
        {index + 1}/{total}
      </span>
    </div>
  )
}
