import { GraduationCap, Heart, LayoutGrid, MailOpen, Wallet } from 'lucide-react'
import { useActions } from '../store/StoreContext'
import type { Mode } from '../store/types'
import { cx } from '../lib/format'

const TABS: { mode: Exclude<Mode, 'select'>; label: string; icon: typeof Wallet }[] =
  [
    { mode: 'user', label: 'User app', icon: Wallet },
    { mode: 'onboarding', label: 'Onboarding', icon: MailOpen },
    { mode: 'member-spouse', label: 'Spouse', icon: Heart },
    { mode: 'member-child', label: 'Child', icon: GraduationCap },
  ]

const CAPTION: Record<Exclude<Mode, 'select'>, string> = {
  user: 'Mode 1 — the Optimus customer managing their family’s cards',
  onboarding: 'Mode 2 — a family member accepting an invite',
  'member-spouse': 'Mode 3 — an adult member using their add-on card',
  'member-child': 'Mode 4 — a teen member using their add-on card',
}

/**
 * Prototype chrome above the phone frame.
 *
 * The Demo dock can also switch modes, but it reads as a debug panel, so mode
 * switching needs an affordance that is visible without opening anything.
 * Styled as scaffolding rather than product UI so it isn't mistaken for part
 * of the app being demonstrated.
 */
export function ModeSwitcher({ current }: { current: Exclude<Mode, 'select'> }) {
  const { setMode } = useActions()

  return (
    <div className="mb-4 flex flex-col items-center gap-2.5">
      <nav
        aria-label="Prototype mode"
        className="flex items-center gap-1 rounded-full border border-line bg-white p-1 shadow-card"
      >
        <button
          type="button"
          onClick={() => setMode('select')}
          title="All modes"
          className="tap grid h-8 w-8 place-items-center rounded-full text-ink-muted hover:bg-neutral-100 hover:text-ink"
        >
          <LayoutGrid className="h-3.5 w-3.5" aria-hidden />
          <span className="sr-only">All modes</span>
        </button>

        <span className="h-5 w-px bg-line" aria-hidden />

        {TABS.map((t) => {
          const Icon = t.icon
          const on = t.mode === current
          return (
            <button
              key={t.mode}
              type="button"
              onClick={() => setMode(t.mode)}
              aria-current={on ? 'page' : undefined}
              className={cx(
                'tap inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12.5px] font-semibold',
                on
                  ? 'bg-ink text-white'
                  : 'text-ink-muted hover:bg-neutral-100 hover:text-ink',
              )}
            >
              <Icon className="h-3.5 w-3.5" aria-hidden />
              {t.label}
            </button>
          )
        })}
      </nav>

      <p className="text-[11.5px] text-ink-faint">{CAPTION[current]}</p>
    </div>
  )
}
