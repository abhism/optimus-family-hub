import { useState } from 'react'
import { AlertTriangle, Check, Repeat, TrendingUp } from 'lucide-react'
import { useActions } from '../../store/StoreContext'
import {
  AppBar,
  Divider,
  ScreenBody,
  ScreenFooter,
  SectionLabel,
  Surface,
} from '../../components/ui/Layout'
import { AmountStepper, Field, Segmented } from '../../components/ui/Field'
import { Button } from '../../components/ui/Button'
import { Sheet } from '../../components/ui/Sheet'
import { FundsDisclosure } from '../../components/Disclosure'
import { LIMIT_BOUNDS } from '../../store/policy'
import { remainingLimit } from '../../store/engine'
import type { RefreshCadence } from '../../store/types'
import { addDays, endOfMonth, longDate, money } from '../../lib/format'

/** 1.5 Spending limit and budget refresh. */
export function SpendingLimitScreen({ memberId }: { memberId: string }) {
  const { state, pop, dispatch } = useActions()
  const member = state.members.find((m) => m.id === memberId)!

  const [limit, setLimit] = useState(member.monthlyLimit ?? 200)
  const [cadence, setCadence] = useState<RefreshCadence>(
    member.refresh.cadence,
  )
  const [oneOffOpen, setOneOffOpen] = useState(false)
  const [oneOff, setOneOff] = useState(LIMIT_BOUNDS.oneOff.min * 5)
  const [saved, setSaved] = useState(false)

  const first = member.name.split(' ')[0]!
  const dirty = limit !== member.monthlyLimit || cadence !== member.refresh.cadence
  const left = remainingLimit(member)
  const fundsShort = state.account.balance < limit

  const save = () => {
    const now = new Date().toISOString()
    dispatch({
      type: 'SET_LIMIT',
      id: member.id,
      monthlyLimit: limit,
      cadence,
      nextAt:
        cadence === 'none' ? null : cadence === 'weekly' ? addDays(now, 7) : endOfMonth(now),
    })
    setSaved(true)
    setTimeout(pop, 900)
  }

  const applyOneOff = () => {
    dispatch({ type: 'ONE_OFF_INCREASE', id: member.id, amount: oneOff })
    setLimit((l) => Math.min(LIMIT_BOUNDS.monthly.max, l + oneOff))
    setOneOffOpen(false)
  }

  return (
    <>
      <AppBar
        title="Card spending limit"
        subtitle={`${first} · card ···· ${member.card.last4}`}
        onBack={pop}
      />

      <ScreenBody>
        <div className="mb-6">
          <SectionLabel>Limit for this period</SectionLabel>
          <Surface className="p-4">
            <AmountStepper
              value={limit}
              onChange={setLimit}
              min={LIMIT_BOUNDS.monthly.min}
              max={LIMIT_BOUNDS.monthly.max}
              step={LIMIT_BOUNDS.monthly.step}
              label="monthly card spending limit"
              suffix="per month"
            />

            <p className="mt-3.5 text-[12.5px] leading-relaxed text-ink-muted">
              This is a ceiling on what {first}’s card can authorise in a
              period. It does not set money aside or move anything out of your
              account.
            </p>

            <FundsDisclosure variant="boxed" className="mt-3" />

            {member.periodSpend > 0 && (
              <>
                <Divider />
                <div className="flex items-baseline justify-between gap-3 pt-3 text-[12.5px]">
                  <span className="text-ink-muted">
                    Already spent this period
                  </span>
                  <span className="numeral font-semibold">
                    {money(member.periodSpend)}
                  </span>
                </div>
                {limit < member.periodSpend && (
                  <p className="mt-2 text-[12px] leading-relaxed text-warn">
                    {first} has already spent more than this limit. The card
                    won’t authorise anything further until the budget refreshes.
                  </p>
                )}
              </>
            )}
          </Surface>
        </div>

        {/* ------------------------------------------- recurring refresh */}
        <div className="mb-6">
          <SectionLabel>Budget refresh</SectionLabel>
          <Surface className="p-4">
            <Field
              label="How often the limit refreshes"
              hint="At a refresh the spending limit resets to its full amount for the new period. Nothing is transferred — no money leaves your account."
            >
              <Segmented
                label="Budget refresh cadence"
                value={cadence}
                onChange={setCadence}
                options={[
                  { value: 'none', label: 'Off' },
                  { value: 'weekly', label: 'Weekly' },
                  { value: 'monthly', label: 'Monthly' },
                ]}
              />
            </Field>

            {cadence !== 'none' && (
              <div className="mt-1 flex items-center gap-2 rounded-xl bg-neutral-50 px-3 py-2.5">
                <Repeat className="h-3.5 w-3.5 shrink-0 text-accent" aria-hidden />
                <p className="text-[12px] leading-relaxed text-ink-soft">
                  Refreshes {cadence} · next on{' '}
                  {longDate(
                    cadence === 'weekly'
                      ? addDays(new Date().toISOString(), 7)
                      : endOfMonth(new Date().toISOString()),
                  )}
                </p>
              </div>
            )}

            {/* Insufficient funds at refresh — 1.5. Nothing "fails to send",
                because nothing is sent. The limit refreshes; funds may not
                support it. */}
            {cadence !== 'none' && fundsShort && (
              <div className="mt-3 rounded-xl border border-amber-200/70 bg-warnsoft px-3.5 py-3">
                <p className="flex items-center gap-1.5 text-[12.5px] font-semibold text-warn">
                  <AlertTriangle className="h-3.5 w-3.5" aria-hidden />
                  Funds are below this limit right now
                </p>
                <p className="mt-1 text-[12.5px] leading-relaxed text-amber-900/85">
                  Your account holds {money(state.account.balance)}. The limit
                  will still refresh to {money(limit)}, but the card can only
                  authorise up to available funds until the account is topped
                  up.
                </p>
              </div>
            )}

            {member.refreshConstrainedAt && (
              <div className="mt-3 rounded-xl border border-amber-200/70 bg-warnsoft px-3.5 py-3">
                <p className="text-[12.5px] font-semibold text-warn">
                  Last refresh landed with funds short
                </p>
                <p className="mt-1 text-[12.5px] leading-relaxed text-amber-900/85">
                  The limit refreshed on {longDate(member.refreshConstrainedAt)}{' '}
                  while the account was below {money(member.monthlyLimit ?? 0)}.
                  {first}’s screens explain this, so nothing looks guaranteed
                  that isn’t.
                </p>
              </div>
            )}
          </Surface>
        </div>

        {/* ------------------------------------------------ one-off bump */}
        <div className="mb-4">
          <SectionLabel>One-off increase</SectionLabel>
          <Surface className="p-4">
            <p className="text-[12.5px] leading-relaxed text-ink-muted">
              Raise the ceiling for this period only — useful for a school trip
              or a one-time purchase. The limit returns to {money(limit)} at the
              next refresh.
            </p>
            <Button
              full
              variant="secondary"
              className="mt-3"
              icon={<TrendingUp className="h-4 w-4" />}
              onClick={() => setOneOffOpen(true)}
            >
              Add a one-off increase
            </Button>
            {left !== null && (
              <p className="mt-2.5 text-center text-[11.5px] text-ink-faint">
                {money(left)} of the current limit is still unused
              </p>
            )}
          </Surface>
        </div>
      </ScreenBody>

      <ScreenFooter>
        <Button
          full
          onClick={save}
          disabled={!dirty || saved}
          icon={saved ? <Check className="h-4 w-4" /> : undefined}
        >
          {saved ? 'Limit updated' : 'Save limit'}
        </Button>
      </ScreenFooter>

      <Sheet
        open={oneOffOpen}
        onClose={() => setOneOffOpen(false)}
        title="One-off increase"
        footer={
          <Button full onClick={applyOneOff}>
            Add {money(oneOff, { cents: false })} for this period
          </Button>
        }
      >
        <AmountStepper
          value={oneOff}
          onChange={setOneOff}
          min={LIMIT_BOUNDS.oneOff.min}
          max={LIMIT_BOUNDS.oneOff.max}
          step={LIMIT_BOUNDS.oneOff.step}
          label="one-off increase"
          suffix="this period only"
        />
        <p className="mt-4 text-[12.5px] leading-relaxed text-ink-muted">
          {first}’s limit becomes{' '}
          <span className="numeral font-semibold">
            {money(Math.min(LIMIT_BOUNDS.monthly.max, limit + oneOff), {
              cents: false,
            })}
          </span>{' '}
          for the rest of this period, then returns to{' '}
          {money(limit, { cents: false })}.
        </p>
        <FundsDisclosure variant="boxed" className="mt-3" />
      </Sheet>
    </>
  )
}
