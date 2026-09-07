import { Info } from 'lucide-react'
import { FUNDS_DISCLOSURE, SETTLEMENT_TAIL } from '../lib/copy'
import { cx } from '../lib/format'

/**
 * The funds disclosure. Rule 1: this renders on every Member-facing screen
 * that shows a spending figure.
 *
 * It reads its text from lib/copy.ts rather than taking a prop, so no caller
 * can accidentally soften or reword it.
 */
export function FundsDisclosure({
  variant = 'plain',
  className,
}: {
  variant?: 'plain' | 'boxed' | 'inline'
  className?: string
}) {
  if (variant === 'inline') {
    return (
      <span className={cx('text-[11.5px] leading-snug text-ink-muted', className)}>
        {FUNDS_DISCLOSURE}
      </span>
    )
  }

  if (variant === 'boxed') {
    return (
      <div
        className={cx(
          'flex items-start gap-2 rounded-xl bg-accent-soft/70 px-3 py-2.5',
          className,
        )}
      >
        <Info className="mt-[1px] h-3.5 w-3.5 shrink-0 text-accent" aria-hidden />
        <p className="text-[12px] leading-relaxed text-accent-deep">
          {FUNDS_DISCLOSURE}
        </p>
      </div>
    )
  }

  return (
    <p
      className={cx(
        'flex items-start gap-1.5 text-[11.5px] leading-relaxed text-ink-muted',
        className,
      )}
    >
      <Info className="mt-[1px] h-3 w-3 shrink-0" aria-hidden />
      {FUNDS_DISCLOSURE}
    </p>
  )
}

/**
 * The settlement tail. Rule 8: this renders on every termination path — the
 * User removing a Member, and a Member ending their own card access.
 */
export function SettlementTail({ className }: { className?: string }) {
  return (
    <div
      className={cx(
        'rounded-xl border border-amber-200/70 bg-warnsoft px-3.5 py-3',
        className,
      )}
    >
      <p className="text-[12.5px] font-semibold text-warn">
        What happens to purchases in flight
      </p>
      <p className="mt-1 text-[12.5px] leading-relaxed text-amber-900/85">
        {SETTLEMENT_TAIL}
      </p>
    </div>
  )
}
