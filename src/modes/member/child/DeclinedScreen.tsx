import { Ban, Info, MessageCircle, Store } from 'lucide-react'
import { useActions } from '../../../store/StoreContext'
import { FundsDisclosure } from '../../../components/Disclosure'
import {
  AppBar,
  Divider,
  ScreenBody,
  SectionLabel,
  Surface,
} from '../../../components/ui/Layout'
import { Badge } from '../../../components/ui/Primitives'
import { Button } from '../../../components/ui/Button'
import { declineReasonForMember, remainingLimit } from '../../../store/engine'
import { DECLINE_RULE_LABEL } from '../../../lib/copy'
import { firstName, money, stamp } from '../../../lib/format'
import type { Member } from '../../../store/types'

/**
 * 3.2 Declined transaction.
 *
 * Explains the decline in specific terms and points out of band. Rule 7: there
 * is deliberately no request button anywhere on this screen — a Member cannot
 * ask the app for a limit change, only the User can make one.
 */
export function DeclinedScreen({
  member,
  transactionId,
}: {
  member: Member
  transactionId: string
}) {
  const { state, pop } = useActions()
  const user = firstName(state.account.holder)
  const txn = state.transactions.find((t) => t.id === transactionId)

  if (!txn || txn.status !== 'declined') {
    return (
      <>
        <AppBar title="Declined purchase" onBack={pop} />
        <ScreenBody>
          <Surface className="p-5 text-center">
            <p className="text-[14px] font-semibold">
              We can’t find that purchase
            </p>
            <Button className="mt-4" onClick={pop}>
              Go back
            </Button>
          </Surface>
        </ScreenBody>
      </>
    )
  }

  const rule = txn.decline?.rule
  const left = remainingLimit(member)

  return (
    <>
      <AppBar title="Declined purchase" onBack={pop} />

      <ScreenBody>
        <div className="flex flex-col items-center text-center">
          <div className="grid h-14 w-14 place-items-center rounded-full bg-dangersoft text-danger">
            <Ban className="h-6 w-6" aria-hidden />
          </div>
          <h1 className="mt-4 text-[20px] font-semibold leading-snug tracking-[-0.02em]">
            This didn’t go through
          </h1>
          <p className="mt-2 max-w-[18rem] text-[13.5px] leading-relaxed text-ink-muted">
            {declineReasonForMember(txn)}
          </p>
        </div>

        <Surface className="mt-6 overflow-hidden">
          <div className="flex items-start gap-3 p-4">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-neutral-100 text-ink-soft">
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
                {stamp(txn.at)}
              </p>
              <Badge tone="danger" className="mt-2">
                Declined — you weren’t charged
              </Badge>
            </div>
          </div>

          <Divider />

          <div className="p-4">
            <p className="text-[11px] font-bold uppercase tracking-[0.09em] text-ink-faint">
              What stopped it
            </p>
            <p className="mt-1.5 text-[14px] font-semibold">
              {rule ? DECLINE_RULE_LABEL[rule] : 'A rule on your card'}
            </p>
            <p className="mt-1 text-[12.5px] leading-relaxed text-ink-soft">
              {declineReasonForMember(txn)}
            </p>

            {rule === 'per_transaction_cap' && left !== null && (
              <p className="mt-2.5 rounded-lg bg-neutral-50 px-3 py-2 text-[12px] leading-relaxed text-ink-muted">
                You still have {money(left)} of your monthly limit left — this
                was blocked because of the single-purchase cap, not because you
                ran out.
              </p>
            )}
          </div>
        </Surface>

        {/*
          Out-of-band prompt. Text only — no request action, by design.
        */}
        <div className="mt-5">
          <SectionLabel>What you can do</SectionLabel>
          <Surface className="p-4">
            <div className="flex items-start gap-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-accent-soft text-accent">
                <MessageCircle className="h-4 w-4" aria-hidden />
              </span>
              <div className="min-w-0">
                <h2 className="text-[14px] font-semibold">
                  Ask {user} to change this
                </h2>
                <p className="mt-1 text-[12.5px] leading-relaxed text-ink-muted">
                  {user} sets the rules on your card and can change them from
                  their own app. Have a chat with {user} about it — there’s
                  nothing to send from here.
                </p>
              </div>
            </div>

            <div className="mt-3.5 flex items-start gap-2 rounded-xl bg-neutral-100 px-3.5 py-3">
              <Info
                className="mt-[1px] h-3.5 w-3.5 shrink-0 text-ink-muted"
                aria-hidden
              />
              <p className="text-[12px] leading-relaxed text-ink-soft">
                {user} already got an alert about this decline, so they know it
                happened. If they change a limit, you’ll see it on your card
                rules screen.
              </p>
            </div>
          </Surface>
        </div>

        <FundsDisclosure className="mt-4 px-1" />
      </ScreenBody>
    </>
  )
}
