import { Eye, Receipt } from 'lucide-react'
import { useActions } from '../../../store/StoreContext'
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
import { Badge } from '../../../components/ui/Primitives'
import { familyHubCardMembers } from '../../../store/policy'
import { firstName, money, relativeDay } from '../../../lib/format'
import type { Member } from '../../../store/types'

/**
 * 3.1 Shared activity — the visible consequence of reciprocal visibility.
 *
 * Shows every Family Hub card, not the User's own personal card: the rule is
 * about add-on cards on the account, and overstating it would be inaccurate.
 */
export function SharedActivity({ member }: { member: Member }) {
  const { state } = useActions()
  const user = firstName(state.account.holder)

  const cards = familyHubCardMembers(state)
  const cardIds = cards.map((c) => c.id)

  const txns = state.transactions
    .filter((t) => cardIds.includes(t.cardId))
    .slice(0, 20)

  const labelFor = (cardId: string) => {
    const m = cards.find((c) => c.id === cardId)
    if (!m) return undefined
    return m.id === member.id ? 'You' : firstName(m.name)
  }

  return (
    <>
      <AppBar
        title="Shared activity"
        subtitle={`Every Family Hub card on ${user}’s account`}
      />

      <ScreenBody>
        <Surface className="mb-5 p-4" tone="accent">
          <div className="flex items-start gap-3">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-accent text-white">
              <Eye className="h-4 w-4" aria-hidden />
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-[13.5px] font-semibold text-accent-deep">
                  You’re seeing this because visibility is reciprocal
                </h2>
              </div>
              <p className="mt-1 text-[12.5px] leading-relaxed text-accent-deep/85">
                {user} sees your card activity, and you see the activity on
                every Family Hub card. This works both ways and can’t be turned
                off.
              </p>
            </div>
          </div>
        </Surface>

        <div className="mb-5">
          <SectionLabel>Cards on this account</SectionLabel>
          <Surface className="overflow-hidden">
            {cards.map((c, i) => (
              <div key={c.id}>
                {i > 0 && <Divider />}
                <div className="flex items-center gap-3 px-4 py-3">
                  <span
                    className={
                      c.relationship === 'child'
                        ? 'h-8 w-11 shrink-0 rounded-md bg-gradient-to-br from-violet-500 to-pink-500'
                        : 'h-8 w-11 shrink-0 rounded-md bg-gradient-to-br from-accent to-violet-600'
                    }
                    aria-hidden
                  />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span className="truncate text-[13.5px] font-medium">
                        {c.id === member.id ? 'Your card' : firstName(c.name)}
                      </span>
                      {c.status === 'frozen' && (
                        <Badge tone="dark">Frozen</Badge>
                      )}
                    </span>
                    <span className="mt-0.5 block text-[11.5px] text-ink-muted">
                      ···· {c.card.last4} ·{' '}
                      {c.monthlyLimit === null
                        ? 'no spending limit'
                        : `${money(c.monthlyLimit)} card spending limit`}
                    </span>
                  </span>
                  <span className="numeral shrink-0 text-[13px] font-semibold">
                    {money(c.periodSpend)}
                  </span>
                </div>
              </div>
            ))}
          </Surface>
          <FundsDisclosure className="mt-2.5 px-1" />
        </div>

        <div>
          <SectionLabel>All activity</SectionLabel>
          {txns.length === 0 ? (
            <EmptyState
              icon={<Receipt className="h-5 w-5" />}
              title="Nothing here yet"
              body="Purchases on any Family Hub card will appear in this list."
            />
          ) : (
            <Surface className="overflow-hidden">
              {txns.map((t, i) => {
                const prev = txns[i - 1]
                const newDay =
                  i === 0 || relativeDay(prev!.at) !== relativeDay(t.at)
                return (
                  <div key={t.id}>
                    {newDay ? (
                      <div
                        className={`bg-neutral-50 px-4 py-1.5 text-[10.5px] font-bold uppercase tracking-[0.09em] text-ink-faint ${
                          i === 0 ? '' : 'border-t border-line'
                        }`}
                      >
                        {relativeDay(t.at)}
                      </div>
                    ) : (
                      <Divider />
                    )}
                    <TransactionRow txn={t} cardLabel={labelFor(t.cardId)} />
                  </div>
                )
              })}
            </Surface>
          )}
        </div>
      </ScreenBody>
    </>
  )
}
