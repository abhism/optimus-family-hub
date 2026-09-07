import { Check, GraduationCap, Heart, UserRound } from 'lucide-react'
import { RELATIONSHIP_OPTIONS } from '../../../store/policy'
import type { SupportedRelationship } from '../../../store/types'
import { Badge } from '../../../components/ui/Primitives'
import { cx } from '../../../lib/format'

const ICONS = {
  spouse: Heart,
  child: GraduationCap,
  parent: UserRound,
} as const

/** Step 1 — choose relationship. Parent is visible but disabled (rule 10). */
export function StepRelationship({
  value,
  onChange,
}: {
  value: SupportedRelationship | null
  onChange: (next: SupportedRelationship) => void
}) {
  return (
    <div className="animate-fade-up">
      <h1 className="text-[22px] font-semibold leading-snug tracking-[-0.02em]">
        Who are you adding?
      </h1>
      <p className="mt-2 text-[13.5px] leading-relaxed text-ink-muted">
        This decides what you can set on their card. You can’t change the
        relationship after the card is issued.
      </p>

      <ul className="mt-6 space-y-2.5">
        {RELATIONSHIP_OPTIONS.map((opt) => {
          const Icon = ICONS[opt.value]
          const selected = value === opt.value
          const disabled = !opt.enabled

          return (
            <li key={opt.value}>
              <button
                type="button"
                disabled={disabled}
                aria-disabled={disabled}
                onClick={() =>
                  !disabled && onChange(opt.value as SupportedRelationship)
                }
                className={cx(
                  'flex w-full items-start gap-3.5 rounded-2xl border bg-white p-4 text-left shadow-card',
                  disabled
                    ? 'cursor-not-allowed opacity-60'
                    : 'tap hover:border-accent-line hover:bg-accent-soft/30',
                  selected ? 'border-accent ring-1 ring-accent' : 'border-line',
                )}
              >
                <span
                  className={cx(
                    'grid h-10 w-10 shrink-0 place-items-center rounded-xl',
                    disabled
                      ? 'bg-neutral-100 text-ink-faint'
                      : opt.value === 'child'
                        ? 'bg-gradient-to-br from-violet-500 to-pink-500 text-white'
                        : 'bg-gradient-to-br from-accent to-violet-600 text-white',
                  )}
                >
                  <Icon className="h-4.5 w-4.5" aria-hidden />
                </span>

                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span className="text-[15px] font-semibold">{opt.label}</span>
                    {disabled && <Badge tone="neutral">Coming soon</Badge>}
                  </span>
                  <span className="mt-1 block text-[12.5px] leading-relaxed text-ink-muted">
                    {opt.blurb}
                  </span>
                </span>

                {selected && (
                  <span className="mt-1 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-accent text-white">
                    <Check className="h-3 w-3" aria-hidden />
                  </span>
                )}
              </button>
            </li>
          )
        })}
      </ul>

      <p className="mt-5 px-1 text-[11.5px] leading-relaxed text-ink-faint">
        Whoever you add becomes an authorized user on your account. They don’t
        get an Optimus account of their own, and everything they spend is
        charged to you.
      </p>
    </div>
  )
}
