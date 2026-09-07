import type { InputHTMLAttributes, ReactNode } from 'react'
import { AlertCircle, Minus, Plus } from 'lucide-react'
import { cx, money } from '../../lib/format'

interface FieldProps {
  label: string
  hint?: string
  error?: string | null
  children: ReactNode
  htmlFor?: string
}

export function Field({ label, hint, error, children, htmlFor }: FieldProps) {
  return (
    <div className="py-2">
      <label
        htmlFor={htmlFor}
        className="mb-1.5 block text-[12.5px] font-semibold text-ink-soft"
      >
        {label}
      </label>
      {children}
      {error ? (
        <p
          role="alert"
          className="mt-1.5 flex items-start gap-1.5 text-[12.5px] font-medium text-danger"
        >
          <AlertCircle className="mt-[1px] h-3.5 w-3.5 shrink-0" aria-hidden />
          {error}
        </p>
      ) : (
        hint && (
          <p className="mt-1.5 text-[12px] leading-relaxed text-ink-muted">
            {hint}
          </p>
        )
      )}
    </div>
  )
}

interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean
}

export function TextInput({ invalid, className, ...rest }: TextInputProps) {
  return (
    <input
      aria-invalid={invalid || undefined}
      className={cx(
        'h-12 w-full rounded-xl border bg-white px-3.5 text-[15px] text-ink placeholder:text-ink-faint',
        invalid ? 'border-danger' : 'border-line',
        className,
      )}
      {...rest}
    />
  )
}

export function TextArea({
  invalid,
  className,
  ...rest
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean }) {
  return (
    <textarea
      aria-invalid={invalid || undefined}
      className={cx(
        'w-full rounded-xl border bg-white p-3.5 text-[15px] leading-relaxed text-ink placeholder:text-ink-faint',
        invalid ? 'border-danger' : 'border-line',
        className,
      )}
      {...rest}
    />
  )
}

/**
 * Stepped money control with hard policy bounds.
 *
 * Bounds are passed in from store/policy.ts, so a User cannot drag a child's
 * limit outside what Optimus allows — including on the decline-resolution
 * screen, where a bounded control is the whole point.
 */
export function AmountStepper({
  value,
  onChange,
  min,
  max,
  step,
  label,
  suffix,
}: {
  value: number
  onChange: (next: number) => void
  min: number
  max: number
  step: number
  label: string
  suffix?: string
}) {
  const clamp = (n: number) => Math.min(max, Math.max(min, n))
  const atMin = value <= min
  const atMax = value >= max

  return (
    <div>
      <div className="flex items-center justify-between rounded-2xl border border-line bg-white p-2">
        <button
          type="button"
          onClick={() => onChange(clamp(value - step))}
          disabled={atMin}
          aria-label={`Decrease ${label}`}
          className="tap grid h-11 w-11 place-items-center rounded-xl bg-neutral-100 text-ink disabled:opacity-35"
        >
          <Minus className="h-4 w-4" />
        </button>
        <div className="text-center">
          <p className="numeral text-[26px] font-semibold leading-none">
            {money(value, { cents: false })}
          </p>
          {suffix && (
            <p className="mt-1 text-[11.5px] text-ink-muted">{suffix}</p>
          )}
        </div>
        <button
          type="button"
          onClick={() => onChange(clamp(value + step))}
          disabled={atMax}
          aria-label={`Increase ${label}`}
          className="tap grid h-11 w-11 place-items-center rounded-xl bg-neutral-100 text-ink disabled:opacity-35"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
      <div className="mt-2 flex items-center justify-between px-1 text-[11.5px] text-ink-faint">
        <span className="numeral">Min {money(min, { cents: false })}</span>
        <span className="numeral">Max {money(max, { cents: false })}</span>
      </div>
    </div>
  )
}

/** Segmented single-select, used for cadence and alert delivery choices. */
export function Segmented<T extends string>({
  value,
  options,
  onChange,
  label,
  locked,
}: {
  value: T
  options: { value: T; label: string }[]
  onChange: (next: T) => void
  label: string
  locked?: boolean
}) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cx(
        'flex gap-1 rounded-xl bg-neutral-100 p-1',
        locked && 'opacity-50',
      )}
    >
      {options.map((opt) => {
        const active = opt.value === value
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={active}
            disabled={locked}
            onClick={() => onChange(opt.value)}
            className={cx(
              'tap flex-1 rounded-lg px-3 py-2 text-[13px] font-semibold transition-colors',
              active
                ? 'bg-white text-ink shadow-sm'
                : 'text-ink-muted hover:text-ink',
              locked && 'cursor-not-allowed',
            )}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}

export function Checkbox({
  checked,
  onChange,
  children,
  id,
}: {
  checked: boolean
  onChange: (next: boolean) => void
  children: ReactNode
  id: string
}) {
  return (
    <div className="flex items-start gap-3">
      <button
        id={id}
        type="button"
        role="checkbox"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cx(
          'tap mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-[6px] border-2 transition-colors',
          checked ? 'border-accent bg-accent' : 'border-neutral-300 bg-white',
        )}
      >
        {checked && (
          <svg viewBox="0 0 12 12" className="h-3 w-3 text-white" aria-hidden>
            <path
              d="M2 6.2 4.6 8.8 10 3.4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </button>
      <label htmlFor={id} className="text-[13.5px] leading-relaxed text-ink-soft">
        {children}
      </label>
    </div>
  )
}
