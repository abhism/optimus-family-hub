import { useMemo, useState } from 'react'
import {
  ArrowRight,
  Ban,
  Check,
  Info,
  Lock,
  ShieldCheck,
  Store,
} from 'lucide-react'
import { useActions } from '../../store/StoreContext'
import { AuthGate } from '../../components/AuthGate'
import {
  AppBar,
  Divider,
  ScreenBody,
  ScreenFooter,
  SectionLabel,
  Surface,
} from '../../components/ui/Layout'
import { AmountStepper } from '../../components/ui/Field'
import { Toggle } from '../../components/ui/Toggle'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Primitives'
import { FundsDisclosure } from '../../components/Disclosure'
import { adjustableRule, declineReasonForUser } from '../../store/engine'
import { LIMIT_BOUNDS } from '../../store/policy'
import { DECLINE_RULE_LABEL } from '../../lib/copy'
import type { Controls, DeclineRule } from '../../store/types'
import { addDays, endOfMonth, money, stamp } from '../../lib/format'

type Phase = 'auth' | 'adjust' | 'confirm' | 'done'

/** Which single control a control-based decline maps to. */
const CONTROL_FOR_RULE: Partial<Record<DeclineRule, keyof Controls>> = {
  online_blocked: 'onlinePurchases',
  atm_blocked: 'atmWithdrawals',
  international_blocked: 'internationalUse',
  category_blocked: 'blockGamblingAdult',
}

/**
 * 1.7 Decline → adjust limit.
 *
 * Deliberately not a request-and-approve inbox (rule 7): the Member cannot ask
 * for anything. This flow starts from the User's own decline alert, passes
 * through authentication, and only ever exposes the single rule that blocked
 * the purchase.
 */
export function DeclineResolveFlow({
  notificationId,
}: {
  notificationId: string
}) {
  const { state, pop, reset, dispatch } = useActions()

  const notification = state.notifications.find((n) => n.id === notificationId)
  const txn = state.transactions.find(
    (t) => t.id === notification?.transactionId,
  )
  const member = state.members.find((m) => m.id === notification?.memberId)

  const [phase, setPhase] = useState<Phase>('auth')

  const rule = txn?.decline?.rule
  const limitRule = adjustableRule(rule)
  const controlKey = rule ? CONTROL_FOR_RULE[rule] : undefined

  const currentValue = useMemo(() => {
    if (!member) return 0
    if (limitRule === 'per_transaction_cap') {
      return member.controls.perTransactionCap ?? LIMIT_BOUNDS.perTransaction.min
    }
    if (limitRule === 'monthly_limit') {
      return member.monthlyLimit ?? LIMIT_BOUNDS.monthly.min
    }
    return 0
  }, [member, limitRule])

  const [nextValue, setNextValue] = useState(() => {
    if (!txn) return 0
    const bounds =
      limitRule === 'monthly_limit'
        ? LIMIT_BOUNDS.monthly
        : LIMIT_BOUNDS.perTransaction
    // Default to the smallest step that would have let this purchase through.
    const needed = Math.ceil(txn.amount / bounds.step) * bounds.step
    return Math.min(bounds.max, Math.max(bounds.min, needed))
  })

  if (!notification || !txn || !member) {
    return (
      <>
        <AppBar title="Declined transaction" onBack={pop} />
        <ScreenBody>
          <Surface className="p-5 text-center">
            <p className="text-[14px] font-semibold">This alert has expired</p>
            <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-muted">
              The transaction it referred to is no longer on the account.
            </p>
            <Button className="mt-4" onClick={pop}>
              Go back
            </Button>
          </Surface>
        </ScreenBody>
      </>
    )
  }

  const first = member.name.split(' ')[0]!
  const bounds =
    limitRule === 'monthly_limit'
      ? LIMIT_BOUNDS.monthly
      : LIMIT_BOUNDS.perTransaction

  // ------------------------------------------------------------------ auth
  if (phase === 'auth') {
    return (
      <AuthGate
        reason={`Confirm it’s you before reviewing a card limit on ${first}’s card.`}
        onSuccess={() => setPhase('adjust')}
        onCancel={pop}
      />
    )
  }

  const applyChange = () => {
    if (limitRule === 'per_transaction_cap') {
      dispatch({
        type: 'PATCH_CONTROLS',
        id: member.id,
        patch: { perTransactionCap: nextValue },
      })
    } else if (limitRule === 'monthly_limit') {
      const now = new Date().toISOString()
      dispatch({
        type: 'SET_LIMIT',
        id: member.id,
        monthlyLimit: nextValue,
        cadence: member.refresh.cadence,
        nextAt:
          member.refresh.cadence === 'none'
            ? null
            : member.refresh.cadence === 'weekly'
              ? addDays(now, 7)
              : endOfMonth(now),
      })
    } else if (controlKey) {
      const patch: Partial<Controls> =
        controlKey === 'blockGamblingAdult'
          ? { blockGamblingAdult: false }
          : ({ [controlKey]: true } as Partial<Controls>)
      dispatch({ type: 'PATCH_CONTROLS', id: member.id, patch })
    }
    dispatch({ type: 'READ_NOTIFICATION', id: notification.id })
    setPhase('done')
  }

  // ------------------------------------------------------------------ done
  if (phase === 'done') {
    return (
      <>
        <AppBar />
        <ScreenBody className="flex flex-col items-center text-center">
          <div className="mt-6 grid h-16 w-16 place-items-center rounded-full bg-positive text-white">
            <Check className="h-8 w-8" aria-hidden />
          </div>
          <h1 className="mt-5 text-[20px] font-semibold leading-snug">
            {limitRule ? 'Limit updated' : 'Control updated'}
          </h1>
          <p className="mt-2 max-w-[18rem] text-[13.5px] leading-relaxed text-ink-muted">
            {limitRule
              ? `${first}’s ${DECLINE_RULE_LABEL[limitRule].toLowerCase()} is now ${money(nextValue, { cents: false })}.`
              : `${first}’s card control has been changed.`}
          </p>

          <Surface className="mt-6 w-full p-4 text-left">
            <h2 className="text-[13.5px] font-semibold">What this changes</h2>
            <ul className="mt-2.5 space-y-2.5 text-[12.5px] leading-relaxed text-ink-muted">
              <li className="flex gap-2">
                <ArrowRight
                  className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent"
                  aria-hidden
                />
                <span>
                  It applies to <strong className="font-semibold">future</strong>{' '}
                  transactions. The declined purchase at {txn.merchant} was not
                  retried and has not been charged.
                </span>
              </li>
              <li className="flex gap-2">
                <ArrowRight
                  className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent"
                  aria-hidden
                />
                <span>
                  Purchases remain subject to available funds in your account,
                  which currently holds {money(state.account.balance)}.
                </span>
              </li>
              <li className="flex gap-2">
                <ArrowRight
                  className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent"
                  aria-hidden
                />
                <span>
                  {first} can see the new setting in their own app straight
                  away.
                </span>
              </li>
            </ul>
          </Surface>

          <div className="mt-6 w-full space-y-2">
            <Button
              full
              onClick={() => reset({ name: 'member-detail', memberId: member.id })}
            >
              View {first}’s card
            </Button>
            <Button
              full
              variant="ghost"
              size="md"
              onClick={() => reset({ name: 'account-home' })}
            >
              Back to home
            </Button>
          </div>
        </ScreenBody>
      </>
    )
  }

  // ------------------------------------------------------- adjust / confirm
  const adjustable = Boolean(limitRule || controlKey)

  return (
    <>
      <AppBar
        title={phase === 'confirm' ? 'Confirm the change' : 'Declined transaction'}
        onBack={phase === 'confirm' ? () => setPhase('adjust') : pop}
        right={
          <span className="inline-flex items-center gap-1 rounded-full bg-teal-50 px-2 py-0.5 text-[10.5px] font-bold uppercase tracking-wide text-positive">
            <ShieldCheck className="h-3 w-3" aria-hidden />
            Verified
          </span>
        }
      />

      <ScreenBody>
        {/* the declined transaction */}
        <Surface className="mb-4 overflow-hidden">
          <div className="flex items-start gap-3 p-4">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-dangersoft text-danger">
              <Store className="h-4.5 w-4.5" aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <p className="truncate text-[15px] font-semibold">
                  {txn.merchant}
                </p>
                <p className="numeral shrink-0 text-[15px] font-semibold text-ink-faint line-through">
                  {money(txn.amount)}
                </p>
              </div>
              <p className="mt-0.5 text-[12px] text-ink-muted">
                {stamp(txn.at)} · {first}’s card ···· {member.card.last4}
              </p>
              <Badge tone="danger" className="mt-2" icon={<Ban className="h-3 w-3" />}>
                Declined
              </Badge>
            </div>
          </div>

          <Divider />

          <div className="bg-dangersoft/50 p-4">
            <p className="text-[11px] font-bold uppercase tracking-[0.09em] text-danger">
              Rule that blocked it
            </p>
            <p className="mt-1.5 text-[14px] font-semibold text-ink">
              {rule ? DECLINE_RULE_LABEL[rule] : 'Card policy'}
            </p>
            <p className="mt-1 text-[12.5px] leading-relaxed text-ink-soft">
              {money(txn.amount)} {declineReasonForUser(txn, member)}.
            </p>
          </div>
        </Surface>

        {/* the single adjustable rule */}
        {!adjustable ? (
          <Surface className="p-4">
            <h2 className="text-[14px] font-semibold">
              There’s no limit to change here
            </h2>
            <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-muted">
              {rule === 'insufficient_account_funds'
                ? `This wasn’t blocked by ${first}’s card limit. Your account held less than the purchase amount, so no change to the card would have let it through.`
                : `This card is frozen. Unfreeze it from ${first}’s card screen to allow purchases again.`}
            </p>
            <Button
              full
              className="mt-4"
              variant="secondary"
              onClick={() => reset({ name: 'member-detail', memberId: member.id })}
            >
              Go to {first}’s card
            </Button>
          </Surface>
        ) : phase === 'adjust' ? (
          <>
            <SectionLabel>Adjust this limit only</SectionLabel>
            <Surface className="p-4">
              {limitRule ? (
                <>
                  <div className="mb-3.5 flex items-baseline justify-between gap-3">
                    <span className="text-[12.5px] text-ink-muted">
                      Current {DECLINE_RULE_LABEL[limitRule].toLowerCase()}
                    </span>
                    <span className="numeral text-[14px] font-semibold">
                      {money(currentValue, { cents: false })}
                    </span>
                  </div>

                  <AmountStepper
                    value={nextValue}
                    onChange={setNextValue}
                    min={bounds.min}
                    max={bounds.max}
                    step={bounds.step}
                    label={DECLINE_RULE_LABEL[limitRule]}
                    suffix={
                      limitRule === 'monthly_limit'
                        ? 'per month'
                        : 'per purchase'
                    }
                  />

                  <p className="mt-3 text-[12px] leading-relaxed text-ink-muted">
                    Optimus allows {money(bounds.min, { cents: false })} to{' '}
                    {money(bounds.max, { cents: false })} on a card issued to a
                    member under 18. Nothing else on {first}’s card changes.
                  </p>
                </>
              ) : (
                controlKey && (
                  <>
                    <Toggle
                      label={
                        controlKey === 'blockGamblingAdult'
                          ? 'Allow gambling & adult content'
                          : `Turn on ${DECLINE_RULE_LABEL[rule!].replace(' turned off', '').toLowerCase()}`
                      }
                      description="This is the only control this screen can change."
                      checked
                      onChange={() => undefined}
                      locked
                      lockNote="Confirm on the next step to apply it"
                    />
                    <p className="mt-2 text-[12px] leading-relaxed text-ink-muted">
                      Continuing turns this control on for {first}’s card. Every
                      other control stays exactly as it is.
                    </p>
                  </>
                )
              )}

              <FundsDisclosure variant="boxed" className="mt-3.5" />
            </Surface>

            <div className="mt-4 flex items-start gap-2 px-1">
              <Lock className="mt-0.5 h-3 w-3 shrink-0 text-ink-faint" aria-hidden />
              <p className="text-[11.5px] leading-relaxed text-ink-faint">
                {first} can’t request a change from their app. Optimus only lets
                you change this here, after verifying it’s you.
              </p>
            </div>
          </>
        ) : (
          <>
            <SectionLabel>Review</SectionLabel>
            <Surface className="overflow-hidden">
              <div className="flex items-center justify-between gap-3 px-4 py-3.5">
                <span className="text-[13px] text-ink-muted">Card</span>
                <span className="text-[13px] font-medium">
                  {first} ···· {member.card.last4}
                </span>
              </div>
              <Divider />
              <div className="flex items-center justify-between gap-3 px-4 py-3.5">
                <span className="text-[13px] text-ink-muted">Setting</span>
                <span className="text-[13px] font-medium">
                  {rule ? DECLINE_RULE_LABEL[rule] : '—'}
                </span>
              </div>
              <Divider />
              <div className="flex items-center justify-between gap-3 px-4 py-3.5">
                <span className="text-[13px] text-ink-muted">Change</span>
                <span className="numeral flex items-center gap-2 text-[13px] font-semibold">
                  {limitRule ? (
                    <>
                      <span className="text-ink-faint line-through">
                        {money(currentValue, { cents: false })}
                      </span>
                      <ArrowRight className="h-3 w-3 text-accent" aria-hidden />
                      <span>{money(nextValue, { cents: false })}</span>
                    </>
                  ) : (
                    <>
                      <span className="text-ink-faint">Off</span>
                      <ArrowRight className="h-3 w-3 text-accent" aria-hidden />
                      <span>On</span>
                    </>
                  )}
                </span>
              </div>
            </Surface>

            <div className="mt-4 flex items-start gap-2 rounded-xl bg-neutral-100 px-3.5 py-3">
              <Info
                className="mt-[1px] h-3.5 w-3.5 shrink-0 text-ink-muted"
                aria-hidden
              />
              <p className="text-[12px] leading-relaxed text-ink-soft">
                This applies to future transactions only. The {money(txn.amount)}{' '}
                purchase at {txn.merchant} stays declined. Purchases remain
                subject to available funds in your account.
              </p>
            </div>
          </>
        )}
      </ScreenBody>

      {adjustable && (
        <ScreenFooter>
          {phase === 'adjust' ? (
            <Button
              full
              onClick={() => setPhase('confirm')}
              disabled={Boolean(limitRule) && nextValue === currentValue}
            >
              {Boolean(limitRule) && nextValue === currentValue
                ? 'Change the amount to continue'
                : 'Continue'}
            </Button>
          ) : (
            <div className="space-y-2">
              <Button full onClick={applyChange}>
                Confirm change
              </Button>
              <Button
                full
                variant="ghost"
                size="md"
                onClick={() => setPhase('adjust')}
              >
                Go back
              </Button>
            </div>
          )}
        </ScreenFooter>
      )}
    </>
  )
}
