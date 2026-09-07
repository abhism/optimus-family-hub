import {
  ArrowRight,
  GraduationCap,
  Heart,
  MailOpen,
  Smartphone,
  Wallet,
} from 'lucide-react'
import { useActions } from '../store/StoreContext'
import type { Mode } from '../store/types'
import { money } from '../lib/format'
import { Badge } from '../components/ui/Primitives'

const MODES: {
  mode: Exclude<Mode, 'select'>
  index: string
  title: string
  blurb: string
  icon: typeof Wallet
  tint: string
}[] = [
  {
    mode: 'user',
    index: '1',
    title: 'User App',
    blurb: 'The Optimus customer managing their family’s cards',
    icon: Wallet,
    tint: 'from-[#3730A3] to-[#5B3FD4]',
  },
  {
    mode: 'onboarding',
    index: '2',
    title: 'Member — Invitation & Onboarding',
    blurb: 'A family member accepting an invite and setting up their card',
    icon: MailOpen,
    tint: 'from-[#0F766E] to-[#0E7490]',
  },
  {
    mode: 'member-spouse',
    index: '3',
    title: 'Member — Existing (Spouse)',
    blurb: 'An adult member using their add-on card',
    icon: Heart,
    tint: 'from-[#4338CA] to-[#7C3AED]',
  },
  {
    mode: 'member-child',
    index: '4',
    title: 'Member — Existing (Child)',
    blurb: 'A teen member using their add-on card',
    icon: GraduationCap,
    tint: 'from-[#7C3AED] to-[#DB2777]',
  },
]

export function ModeSelector() {
  const { state, setMode } = useActions()

  const active = state.members.filter(
    (m) => m.status === 'active' || m.status === 'frozen',
  ).length
  const pending = state.members.filter((m) => m.status === 'pending').length

  return (
    <main className="min-h-full bg-neutral-100 px-6 py-14">
      <div className="mx-auto max-w-[46rem]">
        <header className="mb-9">
          <div className="mb-6 flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-ink text-white">
              <Smartphone className="h-4 w-4" aria-hidden />
            </span>
            <span className="text-[13px] font-bold uppercase tracking-[0.18em] text-ink">
              Optimus
            </span>
          </div>

          <h1 className="text-[38px] font-semibold leading-[1.08] tracking-[-0.03em]">
            Family Hub
          </h1>
          <p className="mt-3 max-w-[34rem] text-[15px] leading-relaxed text-ink-muted">
            Add-on cards for family members, issued on a single Optimus account.
            Four modes share one store, so a change in any of them shows up in
            the others.
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-2">
            <Badge tone="neutral">{state.account.holder}</Badge>
            <Badge tone="neutral">
              <span className="numeral">{money(state.account.balance)}</span> account
              balance
            </Badge>
            <Badge tone={active ? 'accent' : 'neutral'}>
              {active} active {active === 1 ? 'card' : 'cards'}
            </Badge>
            {pending > 0 && (
              <Badge tone="warn">
                {pending} pending {pending === 1 ? 'invite' : 'invites'}
              </Badge>
            )}
          </div>
        </header>

        <ul className="grid gap-3.5 sm:grid-cols-2">
          {MODES.map((m) => {
            const Icon = m.icon
            return (
              <li key={m.mode}>
                <button
                  type="button"
                  onClick={() => setMode(m.mode)}
                  className="tap group flex h-full w-full flex-col items-start rounded-2xl border border-line bg-white p-5 text-left shadow-card transition-shadow hover:shadow-lift"
                >
                  <span
                    className={`mb-4 grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br ${m.tint} text-white shadow-sm`}
                  >
                    <Icon className="h-5 w-5" aria-hidden />
                  </span>

                  <span className="mb-1 text-[10.5px] font-bold uppercase tracking-[0.13em] text-ink-faint">
                    Mode {m.index}
                  </span>
                  <span className="text-[16px] font-semibold leading-snug tracking-[-0.01em]">
                    {m.title}
                  </span>
                  <span className="mt-1.5 flex-1 text-[13px] leading-relaxed text-ink-muted">
                    {m.blurb}
                  </span>

                  <span className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-semibold text-accent">
                    Open
                    <ArrowRight
                      className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5"
                      aria-hidden
                    />
                  </span>
                </button>
              </li>
            )
          })}
        </ul>

        <p className="mt-8 text-[12.5px] leading-relaxed text-ink-faint">
          Use the control in the bottom-right corner to switch modes at any
          time, simulate transactions and declines, or reset the demo data.
          State persists in <code className="text-[11.5px]">localStorage</code>,
          so a refresh keeps your place.
        </p>
      </div>
    </main>
  )
}
