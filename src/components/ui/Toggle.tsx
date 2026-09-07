import { Lock } from 'lucide-react'
import { cx } from '../../lib/format'

interface Props {
  checked: boolean
  onChange?: (next: boolean) => void
  /** Renders the switch as visibly present but unchangeable. */
  locked?: boolean
  label: string
  description?: string
  /** Shown beside the label when the control cannot be changed. */
  lockNote?: string
  id?: string
}

/**
 * A switch that can be *locked* rather than merely disabled.
 *
 * Locked is a first-class state because several product rules require a
 * control to be visible to the person who cannot change it — spouse spending
 * controls (rule 4) and the mandatory alert group (1.6).
 */
export function Toggle({
  checked,
  onChange,
  locked,
  label,
  description,
  lockNote,
  id,
}: Props) {
  const switchId = id ?? `tg_${label.replace(/\s+/g, '-').toLowerCase()}`

  return (
    <div className="flex items-start justify-between gap-4 py-3.5">
      <div className="min-w-0 flex-1">
        <label
          htmlFor={switchId}
          className={cx(
            'flex items-center gap-1.5 text-[14px] font-medium',
            locked ? 'text-ink-muted' : 'text-ink',
          )}
        >
          {label}
          {locked && <Lock className="h-3 w-3 shrink-0 text-ink-faint" aria-hidden />}
        </label>
        {description && (
          <p className="mt-0.5 text-[12.5px] leading-relaxed text-ink-muted">
            {description}
          </p>
        )}
        {locked && lockNote && (
          <p className="mt-1 text-[12px] font-medium text-ink-faint">{lockNote}</p>
        )}
      </div>

      <button
        id={switchId}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-disabled={locked || undefined}
        disabled={locked}
        onClick={() => onChange?.(!checked)}
        className={cx(
          'relative mt-0.5 h-[26px] w-[44px] shrink-0 rounded-full transition-colors duration-200',
          checked ? 'bg-accent' : 'bg-neutral-300',
          locked && 'opacity-45 cursor-not-allowed',
          !locked && 'tap',
        )}
      >
        <span
          className={cx(
            'absolute top-[3px] h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 ease-out',
            checked ? 'translate-x-[21px]' : 'translate-x-[3px]',
          )}
        />
      </button>
    </div>
  )
}
