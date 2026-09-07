import { ChevronRight, Clock, Plus, Snowflake, UserPlus, Users } from 'lucide-react'
import { useActions } from '../../store/StoreContext'
import { MemberCardArt } from '../../components/CardArt'
import {
  AppBar,
  EmptyState,
  ScreenBody,
  SectionLabel,
  Surface,
} from '../../components/ui/Layout'
import { Badge, LimitBar } from '../../components/ui/Primitives'
import { Button } from '../../components/ui/Button'
import { NotificationBanners } from './NotificationBanner'
import type { Member } from '../../store/types'
import { money, relativeDay } from '../../lib/format'
import { remainingLimit } from '../../store/engine'

/** 1.2 Family Hub home. */
export function FamilyHubHome() {
  const { state, push, pop } = useActions()

  const cardholders = state.members.filter(
    (m) => m.status === 'active' || m.status === 'frozen',
  )
  const pending = state.members.filter((m) => m.status === 'pending')
  const hasAny = cardholders.length + pending.length > 0

  return (
    <>
      <AppBar title="Family Hub" onBack={pop} />

      <ScreenBody>
        <div className="mb-5">
          <NotificationBanners />
        </div>

        {!hasAny ? (
          <>
            <EmptyState
              icon={<Users className="h-5 w-5" />}
              title="No family cards yet"
              body="Issue an add-on card to your partner or your child. It draws on this account — they don’t open one of their own."
              action={
                <Button
                  onClick={() => push({ name: 'add-member' })}
                  icon={<UserPlus className="h-4 w-4" />}
                >
                  Add a family member
                </Button>
              }
            />

            <Surface className="mt-4 p-4">
              <h3 className="text-[13.5px] font-semibold">How Family Hub works</h3>
              <ul className="mt-2.5 space-y-2 text-[12.5px] leading-relaxed text-ink-muted">
                <li className="flex gap-2">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-accent" />
                  Each member gets a card on your existing account, not an
                  account of their own.
                </li>
                <li className="flex gap-2">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-accent" />
                  A card spending limit caps what the card can authorise. It
                  doesn’t set money aside.
                </li>
                <li className="flex gap-2">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-accent" />
                  You can freeze or remove a card at any time.
                </li>
              </ul>
            </Surface>
          </>
        ) : (
          <>
            {cardholders.length > 0 && (
              <div className="mb-6 space-y-3">
                <SectionLabel>Cards</SectionLabel>
                {cardholders.map((m) => (
                  <MemberTile
                    key={m.id}
                    member={m}
                    balance={state.account.balance}
                    onOpen={() => push({ name: 'member-detail', memberId: m.id })}
                  />
                ))}
              </div>
            )}

            {pending.length > 0 && (
              <div className="mb-6">
                <SectionLabel>Invitations sent</SectionLabel>
                <Surface className="overflow-hidden">
                  {pending.map((m, i) => (
                    <div key={m.id}>
                      {i > 0 && <div className="h-px bg-line" />}
                      <button
                        type="button"
                        onClick={() =>
                          push({ name: 'member-detail', memberId: m.id })
                        }
                        className="tap flex w-full items-center gap-3 px-4 py-3.5 text-left hover:bg-neutral-50"
                      >
                        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-warnsoft text-warn">
                          <Clock className="h-4 w-4" aria-hidden />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[14px] font-medium">
                            {m.name}
                          </span>
                          <span className="mt-0.5 block text-[12px] text-ink-muted">
                            Invited {relativeDay(m.invite.sentAt).toLowerCase()} ·
                            waiting for them to accept
                          </span>
                        </span>
                        <ChevronRight
                          className="h-4 w-4 shrink-0 text-ink-faint"
                          aria-hidden
                        />
                      </button>
                    </div>
                  ))}
                </Surface>
              </div>
            )}

            <Button
              full
              variant="secondary"
              onClick={() => push({ name: 'add-member' })}
              icon={<Plus className="h-4 w-4" />}
            >
              Add a family member
            </Button>
          </>
        )}
      </ScreenBody>
    </>
  )
}

function MemberTile({
  member,
  balance,
  onOpen,
}: {
  member: Member
  balance: number
  onOpen: () => void
}) {
  const left = remainingLimit(member)
  const frozen = member.status === 'frozen'

  return (
    <Surface className="overflow-hidden">
      <button
        type="button"
        onClick={onOpen}
        className="tap w-full p-4 text-left hover:bg-neutral-50"
      >
        <div className="flex gap-3.5">
          <div className="w-[104px] shrink-0">
            <MemberCardArt member={member} size="sm" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-start gap-2">
              <div className="min-w-0 flex-1">
                <h3 className="truncate text-[14.5px] font-semibold leading-tight">
                  {member.name.split(' ')[0]}
                </h3>
                <p className="mt-0.5 text-[11.5px] capitalize text-ink-muted">
                  {member.relationship} · ···· {member.card.last4}
                </p>
              </div>
              <ChevronRight
                className="mt-0.5 h-4 w-4 shrink-0 text-ink-faint"
                aria-hidden
              />
            </div>

            <div className="mt-2">
              {frozen ? (
                <Badge tone="dark" icon={<Snowflake className="h-3 w-3" />}>
                  Frozen
                </Badge>
              ) : (
                <Badge tone="positive">Active</Badge>
              )}
            </div>
          </div>
        </div>

        <div className="mt-3.5 border-t border-line pt-3">
          {member.monthlyLimit === null ? (
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-[12px] text-ink-muted">
                Spent this period
              </span>
              <span className="numeral text-[14px] font-semibold">
                {money(member.periodSpend)}
              </span>
            </div>
          ) : (
            <>
              <div className="mb-2 flex items-baseline justify-between gap-3">
                <span className="text-[12px] text-ink-muted">
                  This period
                </span>
                <span className="numeral text-[13px] font-semibold">
                  {money(member.periodSpend)}
                  <span className="font-normal text-ink-muted">
                    {' '}
                    of {money(member.monthlyLimit)}
                  </span>
                </span>
              </div>
              <LimitBar
                spent={member.periodSpend}
                limit={member.monthlyLimit}
                fundsCeiling={left !== null && balance < left ? balance : null}
              />
              {left !== null && balance < left && (
                <p className="mt-2 text-[11.5px] leading-snug text-warn">
                  Account funds are currently below this card’s remaining limit,
                  so the card can only authorise up to {money(balance)}.
                </p>
              )}
            </>
          )}
        </div>
      </button>
    </Surface>
  )
}
