import { useEffect, useState } from 'react'
import {
  ArrowRight,
  Ban,
  CreditCard,
  Eraser,
  GraduationCap,
  Heart,
  LayoutGrid,
  MailOpen,
  RefreshCw,
  RotateCcw,
  SlidersHorizontal,
  TrendingDown,
  Wallet,
  X,
} from 'lucide-react'
import { useActions } from '../store/StoreContext'
import type { Member, Mode } from '../store/types'
import { cx, money } from '../lib/format'
import { remainingLimit } from '../store/engine'

const MODE_BUTTONS: {
  mode: Mode
  label: string
  icon: typeof Wallet
}[] = [
  { mode: 'select', label: 'Mode selector', icon: LayoutGrid },
  { mode: 'user', label: 'User app', icon: Wallet },
  { mode: 'onboarding', label: 'Invite & onboarding', icon: MailOpen },
  { mode: 'member-spouse', label: 'Member — spouse', icon: Heart },
  { mode: 'member-child', label: 'Member — child', icon: GraduationCap },
]

/**
 * Persistent demo control.
 *
 * Visible in every mode. Without the simulate actions a reviewer only sees
 * static screens, so this is part of the deliverable rather than a debug aid.
 */
export function DevDock() {
  const {
    state,
    dispatch,
    setMode,
    resetDemo,
    simulateTransaction,
    simulateDecline,
    simulateRefresh,
    dropBalanceBelowLimit,
  } = useActions()

  const [open, setOpen] = useState(false)
  const [confirmReset, setConfirmReset] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  const cardholders = state.members.filter(
    (m) => m.status === 'active' || m.status === 'frozen',
  )
  const [targetId, setTargetId] = useState<string | null>(
    cardholders[0]?.id ?? null,
  )

  // Keep the target valid as members are added, removed or onboarded.
  useEffect(() => {
    if (cardholders.length === 0) {
      if (targetId !== null) setTargetId(null)
      return
    }
    if (!cardholders.some((m) => m.id === targetId)) {
      setTargetId(cardholders[0]!.id)
    }
  }, [cardholders, targetId])

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 3400)
    return () => clearTimeout(t)
  }, [toast])

  const target = cardholders.find((m) => m.id === targetId) ?? null

  const run = (fn: (m: Member) => void, message: string) => {
    if (!target) return
    fn(target)
    setToast(message)
  }

  return (
    <>
      {toast && (
        <div
          role="status"
          className="fixed bottom-24 right-6 z-[60] max-w-[19rem] animate-fade-up rounded-xl bg-ink px-3.5 py-2.5 text-[12.5px] leading-relaxed text-white shadow-dock"
        >
          {toast}
        </div>
      )}

      {open && (
        <div className="fixed bottom-[5.5rem] right-6 z-[60] w-[21rem] animate-fade-up overflow-hidden rounded-2xl border border-line bg-white shadow-dock">
          <div className="flex items-center gap-2 border-b border-line px-4 py-3">
            <SlidersHorizontal className="h-3.5 w-3.5 text-accent" aria-hidden />
            <h2 className="flex-1 text-[13px] font-semibold">Demo controls</h2>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close demo controls"
              className="tap -mr-1 grid h-7 w-7 place-items-center rounded-full hover:bg-neutral-100"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="thin-scrollbar max-h-[68vh] overflow-y-auto">
            {/* ---------------------------------------------- switch mode */}
            <section className="px-4 py-3.5">
              <h3 className="mb-2 text-[10.5px] font-bold uppercase tracking-[0.11em] text-ink-faint">
                Switch mode
              </h3>
              <div className="grid gap-1">
                {MODE_BUTTONS.map((b) => {
                  const Icon = b.icon
                  const active = state.mode === b.mode
                  return (
                    <button
                      key={b.mode}
                      type="button"
                      onClick={() => setMode(b.mode)}
                      className={cx(
                        'tap flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[13px] font-medium',
                        active
                          ? 'bg-accent-soft text-accent'
                          : 'text-ink-soft hover:bg-neutral-100',
                      )}
                    >
                      <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden />
                      <span className="flex-1">{b.label}</span>
                      {active && (
                        <span className="text-[10px] font-bold uppercase tracking-wide">
                          Open
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            </section>

            <div className="h-px bg-line" />

            {/* ------------------------------------------------- simulate */}
            <section className="px-4 py-3.5">
              <h3 className="mb-2 text-[10.5px] font-bold uppercase tracking-[0.11em] text-ink-faint">
                Simulate
              </h3>

              {cardholders.length === 0 ? (
                <p className="rounded-lg bg-neutral-50 px-3 py-2.5 text-[12px] leading-relaxed text-ink-muted">
                  No active cards yet. Add a member in the User app, then accept
                  the invite in Mode 2 to unlock these.
                </p>
              ) : (
                <>
                  <div className="mb-3 flex flex-wrap gap-1.5">
                    {cardholders.map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setTargetId(m.id)}
                        className={cx(
                          'tap rounded-full px-2.5 py-1 text-[12px] font-semibold',
                          m.id === targetId
                            ? 'bg-ink text-white'
                            : 'bg-neutral-100 text-ink-soft hover:bg-neutral-200',
                        )}
                      >
                        {m.name.split(' ')[0]}
                        <span className="ml-1 font-normal opacity-60">
                          {m.relationship}
                        </span>
                      </button>
                    ))}
                  </div>

                  <div className="grid gap-1">
                    <SimButton
                      icon={<CreditCard className="h-3.5 w-3.5" />}
                      label="Simulate a transaction"
                      onClick={() =>
                        run(
                          simulateTransaction,
                          `Purchase attempted on ${target?.name.split(' ')[0]}'s card. Check the transaction list in any mode.`,
                        )
                      }
                    />
                    <SimButton
                      icon={<Ban className="h-3.5 w-3.5" />}
                      label="Simulate a declined transaction"
                      hint="Breaches the tightest rule on the card"
                      onClick={() =>
                        run(
                          simulateDecline,
                          `Declined. Mode 1 now shows the alert that opens the adjust-limit flow; Mode 3 shows the reason.`,
                        )
                      }
                    />
                    <SimButton
                      icon={<RefreshCw className="h-3.5 w-3.5" />}
                      label="Simulate allowance refresh"
                      hint={
                        target && target.monthlyLimit === null
                          ? 'Spouse cards have no User-set limit to refresh'
                          : undefined
                      }
                      disabled={!target || target.monthlyLimit === null}
                      onClick={() =>
                        run(
                          simulateRefresh,
                          `Budget refreshed for ${target?.name.split(' ')[0]}. Period spend reset to zero.`,
                        )
                      }
                    />
                    <SimButton
                      icon={<TrendingDown className="h-3.5 w-3.5" />}
                      label="Drop account funds below the limit"
                      hint={
                        target && target.monthlyLimit === null
                          ? 'Needs a member with a card spending limit'
                          : undefined
                      }
                      disabled={!target || target.monthlyLimit === null}
                      onClick={() =>
                        run(
                          dropBalanceBelowLimit,
                          `Account funds dropped. ${target?.name.split(' ')[0]}'s screens now explain that funds, not the limit, are the constraint.`,
                        )
                      }
                    />
                  </div>
                </>
              )}
            </section>

            <div className="h-px bg-line" />

            {/* ----------------------------------------------- state peek */}
            <section className="px-4 py-3.5">
              <h3 className="mb-2 text-[10.5px] font-bold uppercase tracking-[0.11em] text-ink-faint">
                Shared state
              </h3>
              <dl className="space-y-1.5 text-[12px]">
                <div className="flex justify-between gap-3">
                  <dt className="text-ink-muted">Account balance</dt>
                  <dd className="numeral font-semibold">
                    {money(state.account.balance)}
                  </dd>
                </div>
                {state.members
                  .filter((m) => m.status !== 'removed')
                  .map((m) => {
                    const left = remainingLimit(m)
                    return (
                      <div key={m.id} className="flex justify-between gap-3">
                        <dt className="truncate text-ink-muted">
                          {m.name.split(' ')[0]}
                          <span className="ml-1 text-ink-faint">{m.status}</span>
                        </dt>
                        <dd className="numeral shrink-0 font-semibold">
                          {m.monthlyLimit === null
                            ? 'No limit set'
                            : `${money(m.periodSpend)} / ${money(m.monthlyLimit)}`}
                          {left !== null && left === 0 && (
                            <span className="ml-1 font-normal text-danger">
                              spent
                            </span>
                          )}
                        </dd>
                      </div>
                    )
                  })}
              </dl>
            </section>

            <div className="h-px bg-line" />

            {/* ---------------------------------------------------- reset */}
            <section className="px-4 py-3.5">
              {confirmReset ? (
                <div className="rounded-xl border border-red-100 bg-dangersoft p-3">
                  <p className="text-[12px] leading-relaxed text-danger">
                    Reset wipes saved demo state — members, transactions and
                    consent records — back to the seed.
                  </p>
                  <div className="mt-2.5 flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        resetDemo()
                        setConfirmReset(false)
                        setOpen(false)
                      }}
                      className="tap flex-1 rounded-lg bg-danger px-3 py-2 text-[12.5px] font-semibold text-white"
                    >
                      Reset everything
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmReset(false)}
                      className="tap rounded-lg bg-white px-3 py-2 text-[12.5px] font-semibold text-ink-soft"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid gap-1">
                  <button
                    type="button"
                    onClick={() => setConfirmReset(true)}
                    className="tap flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[13px] font-medium text-danger hover:bg-dangersoft"
                  >
                    <RotateCcw className="h-3.5 w-3.5" aria-hidden />
                    <span className="flex-1">Reset demo data</span>
                    <ArrowRight className="h-3.5 w-3.5 opacity-50" aria-hidden />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      dispatch({ type: 'RESET_EMPTY' })
                      setOpen(false)
                    }}
                    className="tap flex w-full items-start gap-2.5 rounded-lg px-2.5 py-2 text-left hover:bg-neutral-100"
                  >
                    <Eraser
                      className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent"
                      aria-hidden
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block text-[13px] font-medium text-ink-soft">
                        Clear all members
                      </span>
                      <span className="mt-0.5 block text-[11.5px] leading-snug text-ink-faint">
                        Opens the Family Hub empty state
                      </span>
                    </span>
                  </button>
                </div>
              )}
            </section>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label="Demo controls"
        className="tap fixed bottom-6 right-6 z-[60] inline-flex items-center gap-2 rounded-full bg-ink px-4 py-3 text-[13px] font-semibold text-white shadow-dock hover:bg-neutral-800"
      >
        <SlidersHorizontal className="h-4 w-4" aria-hidden />
        Demo
      </button>
    </>
  )
}

function SimButton({
  icon,
  label,
  hint,
  onClick,
  disabled,
}: {
  icon: React.ReactNode
  label: string
  hint?: string
  onClick: () => void
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cx(
        'flex items-start gap-2.5 rounded-lg px-2.5 py-2 text-left',
        disabled
          ? 'cursor-not-allowed opacity-45'
          : 'tap text-ink-soft hover:bg-neutral-100',
      )}
    >
      <span className="mt-0.5 shrink-0 text-accent">{icon}</span>
      <span className="min-w-0 flex-1">
        <span className="block text-[13px] font-medium">{label}</span>
        {hint && (
          <span className="mt-0.5 block text-[11.5px] leading-snug text-ink-faint">
            {hint}
          </span>
        )}
      </span>
    </button>
  )
}
