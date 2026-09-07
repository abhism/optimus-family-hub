import { useEffect, useState } from 'react'
import { Delete } from 'lucide-react'
import { cx } from '../../lib/format'

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del']

/**
 * Mock 4-digit entry, used for the onboarding passcode, the card PIN, and the
 * passcode fallback on the authentication gate.
 */
export function PinPad({
  onComplete,
  title,
  subtitle,
  error,
  length = 4,
}: {
  onComplete: (code: string) => void
  title: string
  subtitle?: string
  error?: string | null
  length?: number
}) {
  const [code, setCode] = useState('')

  useEffect(() => {
    if (code.length === length) {
      const timer = setTimeout(() => {
        onComplete(code)
        setCode('')
      }, 220)
      return () => clearTimeout(timer)
    }
  }, [code, length, onComplete])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (/^[0-9]$/.test(e.key)) {
        setCode((c) => (c.length < length ? c + e.key : c))
      } else if (e.key === 'Backspace') {
        setCode((c) => c.slice(0, -1))
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [length])

  return (
    <div className="flex flex-col items-center">
      <h2 className="text-[17px] font-semibold">{title}</h2>
      {subtitle && (
        <p className="mt-1.5 max-w-[17rem] text-center text-[13px] leading-relaxed text-ink-muted">
          {subtitle}
        </p>
      )}

      <div className="mt-7 flex items-center gap-3.5" aria-live="polite">
        {Array.from({ length }).map((_, i) => (
          <span
            key={i}
            className={cx(
              'h-3.5 w-3.5 rounded-full border-2 transition-all duration-200',
              i < code.length
                ? 'scale-110 border-accent bg-accent'
                : 'border-neutral-300 bg-transparent',
              error && 'border-danger',
            )}
          />
        ))}
      </div>

      {error && (
        <p role="alert" className="mt-3 text-[12.5px] font-medium text-danger">
          {error}
        </p>
      )}

      <div className="mt-8 grid w-full max-w-[15rem] grid-cols-3 gap-x-5 gap-y-3">
        {KEYS.map((key, i) =>
          key === '' ? (
            <span key={i} />
          ) : (
            <button
              key={i}
              type="button"
              aria-label={key === 'del' ? 'Delete' : key}
              onClick={() =>
                key === 'del'
                  ? setCode((c) => c.slice(0, -1))
                  : setCode((c) => (c.length < length ? c + key : c))
              }
              className={cx(
                'tap grid h-[58px] place-items-center rounded-2xl text-[22px] font-medium',
                key === 'del'
                  ? 'text-ink-muted hover:bg-neutral-200/60'
                  : 'bg-white text-ink shadow-card hover:bg-neutral-50',
              )}
            >
              {key === 'del' ? <Delete className="h-5 w-5" /> : key}
            </button>
          ),
        )}
      </div>
    </div>
  )
}
