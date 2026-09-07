import { Ban, Eye, ListChecks, Receipt, TriangleAlert } from 'lucide-react'
import { useActions } from '../../../store/StoreContext'
import { MemberCardArt } from '../../../components/CardArt'
import { TransactionRow } from '../../../components/TransactionRow'
import { FundsDisclosure } from '../../../components/Disclosure'
import {
  AppBar,
  Divider,
  EmptyState,
  ScreenBody,
  SectionLabel,
  Surface,
} from '../../../components/ui/Layout'
import { Avatar, LimitBar, MoneyDisplay } from '../../../components/ui/Primitives'
import { Button } from '../../../components/ui/Button'
import { FrozenNotice } from '../FrozenNotice'
import {
  authorisableCeiling,
  isFundsConstrained,
  remainingLimit,
} from '../../../store/engine'
import { availableFunds } from '../../../store/policy'
import { firstName, longDate, money } from '../../../lib/format'
import type { Member } from '../../../store/types'

/** 3.2 Child home. */
export function ChildHome({ member }: { member: Member }) {
  const { state, push, reset } = useActions()
  const user = firstName(state.account.holder)
  const funds = availableFunds(state)

  const txns = state.transactions
    .filter((t) => t.cardId === member.id)
    .slice(0, 6)

  const lastDecline = state.transactions.find(
    (t) => t.cardId === member.id && t.status === 'declined',
  )

  const left = remainingLimit(member)
  const constrained = isFundsConstrained(member, funds)
  const ceiling = authorisableCeiling(member, funds)

  return (
    <>
      <AppBar
        title={`Hi, ${firstName(member.name)}`}
        subtitle="Your Optimus card"
        border={false}
        right={<Avatar name={member.name} size="sm" tone="child" />}
      />

      <ScreenBody>
        <FrozenNotice member={member} />

        <div className="mx-auto mb-5 max-w-[16rem]">
          <MemberCardArt member={member} size="md" />
        </div>

        {/* Spending limit and usage against it. */}
        <div className="mb-5">
          <Surface className="p-4">
            <h2 className="mb-3 text-[13px] font-semibold text-ink">
              Your card spending limit
            </h2>
            {member.monthlyLimit === null ? (
              <p className="text-[14px] font-semibold">No limit set</p>
            ) : (
              <>
                <div className="flex items-end justify-between gap-3">
                  <div>
                    <p className="text-[11.5px] text-ink-muted">
                      You’ve spent this month
                    </p>
                    <MoneyDisplay
                      value={member.periodSpend}
                      size="lg"
                      className="mt-1"
                    />
                  </div>
                  <p className="numeral pb-1 text-[13px] text-ink-muted">
                    of {money(member.monthlyLimit)}
                  </p>
                </div>

                <LimitBar
                  className="mt-3.5"
                  spent={member.periodSpend}
                  limit={member.monthlyLimit}
                  fundsCeiling={constrained ? funds : null}
                />

                <div className="mt-2.5 flex items-center justify-between gap-3 text-[12px]">
                  <span className="text-ink-muted">
                    {money(left ?? 0)} left on your limit
                  </span>
                  <span className="text-ink-faint">
                    Refreshes {longDate(member.periodEnd)}
                  </span>
                </div>

                <p className="mt-3 text-[12px] leading-relaxed text-ink-muted">
                  This is the most your card can spend this month. It isn’t
                  money set aside for you.
                </p>
              </>
            )}

            {/* Explanatory state when funds bind before the limit does. */}
            {constrained && (
              <div className="mt-3 rounded-xl border border-amber-200/70 bg-warnsoft px-3.5 py-3">
                <p className="flex items-center gap-1.5 text-[12.5px] font-semibold text-warn">
                  <TriangleAlert className="h-3.5 w-3.5" aria-hidden />
                  Your card can’t spend the full amount right now
                </p>
                <p className="mt-1 text-[12.5px] leading-relaxed text-amber-900/85">
                  Your limit says {money(left ?? 0)} is left, but there isn’t
                  that much available in {user}’s account at the moment. Right
                  now your card could authorise up to about{' '}
                  {money(ceiling)} — and that can change at any time.
                </p>
              </div>
            )}

            <FundsDisclosure className="mt-3" />
          </Surface>
        </div>

        <Button
          full
          variant="secondary"
          className="mb-6"
          icon={<ListChecks className="h-4 w-4" />}
          onClick={() => reset({ name: 'm-card-rules' })}
        >
          See your card rules
        </Button>

        {lastDecline && (
          <button
            type="button"
            onClick={() =>
              push({ name: 'm-declined', transactionId: lastDecline.id })
            }
            className="tap mb-6 flex w-full items-start gap-3 rounded-2xl border border-red-100 bg-dangersoft p-4 text-left"
          >
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-danger text-white">
              <Ban className="h-4 w-4" aria-hidden />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[13.5px] font-semibold text-danger">
                A purchase didn’t go through
              </span>
              <span className="mt-0.5 block text-[12.5px] leading-relaxed text-red-900/80">
                {lastDecline.merchant} · {money(lastDecline.amount)}. Tap to see
                why.
              </span>
            </span>
          </button>
        )}

        <div>
          <SectionLabel>Your purchases</SectionLabel>
          {txns.length === 0 ? (
            <EmptyState
              icon={<Receipt className="h-5 w-5" />}
              title="Nothing yet"
              body="When you buy something with your card, it’ll show up here."
            />
          ) : (
            <Surface className="overflow-hidden">
              {txns.map((t, i) => (
                <div key={t.id}>
                  {i > 0 && <Divider />}
                  <TransactionRow
                    txn={t}
                    onClick={
                      t.status === 'declined'
                        ? () =>
                            push({ name: 'm-declined', transactionId: t.id })
                        : undefined
                    }
                  />
                </div>
              ))}
            </Surface>
          )}
        </div>

        <div className="mt-5 flex items-start gap-2 rounded-xl bg-neutral-100 px-3.5 py-3">
          <Eye
            className="mt-[1px] h-3.5 w-3.5 shrink-0 text-ink-muted"
            aria-hidden
          />
          <p className="text-[12px] leading-relaxed text-ink-soft">
            {user} can see these purchases too. That’s part of how a Family Hub
            card works.
          </p>
        </div>
      </ScreenBody>
    </>
  )
}
