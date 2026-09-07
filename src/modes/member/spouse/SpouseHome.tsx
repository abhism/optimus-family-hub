import { Eye, Info, Lock, Receipt } from 'lucide-react'
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
import { Avatar, Badge } from '../../../components/ui/Primitives'
import { Button } from '../../../components/ui/Button'
import { FrozenNotice } from '../FrozenNotice'
import { reciprocalVisibilityForMember } from '../../../lib/copy'
import { firstName, money } from '../../../lib/format'
import type { Member } from '../../../store/types'

/** 3.1 Spouse home. */
export function SpouseHome({ member }: { member: Member }) {
  const { state, reset } = useActions()
  const user = firstName(state.account.holder)

  const txns = state.transactions
    .filter((t) => t.cardId === member.id)
    .slice(0, 6)

  return (
    <>
      <AppBar
        title={`Hello, ${firstName(member.name)}`}
        subtitle="Your Family Hub card"
        border={false}
        right={<Avatar name={member.name} size="sm" />}
      />

      <ScreenBody>
        <FrozenNotice member={member} />

        <div className="mx-auto mb-5 max-w-[16rem]">
          <MemberCardArt member={member} size="md" />
        </div>

        {/*
          Spouse cards carry no User-set ceiling, so the only constraint is
          account funds. We say that plainly rather than printing a figure that
          would read as money set aside.
        */}
        <div className="mb-6">
          <Surface className="p-4">
            <h2 className="mb-3 text-[13px] font-semibold text-ink">
              Your card spending limit
            </h2>
            <div className="flex items-start gap-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-accent-soft text-accent">
                <Info className="h-4 w-4" aria-hidden />
              </span>
              <div className="min-w-0">
                <p className="text-[14.5px] font-semibold">
                  No spending limit on this card
                </p>
                <p className="mt-1 text-[12.5px] leading-relaxed text-ink-muted">
                  {user} hasn’t set a ceiling on your card, and Optimus doesn’t
                  let one adult set spending limits on another’s card.
                </p>
              </div>
            </div>

            <Divider />

            <div className="flex items-baseline justify-between gap-3 pt-3">
              <span className="text-[12.5px] text-ink-muted">
                You’ve spent this period
              </span>
              <span className="numeral text-[16px] font-semibold">
                {money(member.periodSpend)}
              </span>
            </div>

            <FundsDisclosure className="mt-3" />
          </Surface>
        </div>

        {/* Rule 3, from the Member's side. */}
        <Surface className="mb-6 p-4" tone="accent">
          <div className="flex items-start gap-3">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-accent text-white">
              <Eye className="h-4 w-4" aria-hidden />
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-[13.5px] font-semibold text-accent-deep">
                  Reciprocal visibility
                </h2>
                <Badge tone="accent" icon={<Lock className="h-2.5 w-2.5" />}>
                  Fixed
                </Badge>
              </div>
              <p className="mt-1 text-[12.5px] leading-relaxed text-accent-deep/85">
                {reciprocalVisibilityForMember(user)}
              </p>
            </div>
          </div>
        </Surface>

        <div>
          <SectionLabel>Your transactions</SectionLabel>
          {txns.length === 0 ? (
            <EmptyState
              icon={<Receipt className="h-5 w-5" />}
              title="No transactions yet"
              body="Purchases on your card will show up here as soon as you make one."
            />
          ) : (
            <Surface className="overflow-hidden">
              {txns.map((t, i) => (
                <div key={t.id}>
                  {i > 0 && <Divider />}
                  <TransactionRow txn={t} />
                </div>
              ))}
            </Surface>
          )}

          <Button
            full
            variant="secondary"
            className="mt-3"
            icon={<Receipt className="h-4 w-4" />}
            onClick={() => reset({ name: 'm-shared-activity' })}
          >
            See all Family Hub activity
          </Button>
        </div>
      </ScreenBody>
    </>
  )
}
