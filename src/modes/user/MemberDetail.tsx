import { useState } from 'react'
import {
  Bell,
  Eye,
  Globe,
  Landmark,
  Lock,
  MailOpen,
  Repeat,
  ShieldBan,
  ShoppingCart,
  Snowflake,
  Sun,
  Trash2,
  Wallet,
} from 'lucide-react'
import { useActions } from '../../store/StoreContext'
import { MemberCardArt } from '../../components/CardArt'
import { TransactionRow } from '../../components/TransactionRow'
import {
  AppBar,
  Divider,
  EmptyState,
  ListRow,
  ScreenBody,
  SectionLabel,
  Surface,
} from '../../components/ui/Layout'
import { Badge, LimitBar, MoneyDisplay } from '../../components/ui/Primitives'
import { Button } from '../../components/ui/Button'
import { remainingLimit } from '../../store/engine'
import { userMaySetControls, userMaySetLimits } from '../../store/policy'
import {
  POLICY_CATEGORY_LABEL,
  SPOUSE_CONTROLS_EXPLAINER,
  SPOUSE_CONTROLS_FOOTNOTE,
  reciprocalVisibility,
} from '../../lib/copy'
import { longDate, money, relativeDay, stamp } from '../../lib/format'

/** 1.4 Member detail. */
export function MemberDetail({ memberId }: { memberId: string }) {
  const { state, push, pop, freeze, unfreeze, setMode, dispatch } = useActions()
  const [busy, setBusy] = useState(false)

  const member = state.members.find((m) => m.id === memberId)
  if (!member) {
    return (
      <>
        <AppBar title="Member" onBack={pop} />
        <ScreenBody>
          <EmptyState
            icon={<Wallet className="h-5 w-5" />}
            title="This member is no longer on your account"
            body="The card has been removed. Any transactions already authorised will still settle."
            action={<Button onClick={pop}>Back to Family Hub</Button>}
          />
        </ScreenBody>
      </>
    )
  }

  const first = member.name.split(' ')[0]!
  const txns = state.transactions.filter((t) => t.cardId === member.id).slice(0, 6)
  const left = remainingLimit(member)
  const isChild = member.relationship === 'child'
  const frozen = member.status === 'frozen'
  const pending = member.status === 'pending'
  const fundsBind = left !== null && state.account.balance < left

  const toggleFreeze = () => {
    setBusy(true)
    setTimeout(() => {
      if (frozen) unfreeze(member.id, 'user')
      else freeze(member.id, 'user')
      setBusy(false)
    }, 420)
  }

  return (
    <>
      <AppBar
        title={member.name}
        subtitle={`${member.relationship} · card ···· ${member.card.last4}`}
        onBack={pop}
      />

      <ScreenBody>
        <div className="mx-auto mb-4 max-w-[16rem]">
          <MemberCardArt member={member} size="md" />
        </div>

        <div className="mb-5 flex flex-wrap items-center justify-center gap-2">
          {pending ? (
            <Badge tone="warn">Invitation pending</Badge>
          ) : frozen ? (
            <Badge tone="dark" icon={<Snowflake className="h-3 w-3" />}>
              Frozen by you
            </Badge>
          ) : (
            <Badge tone="positive">Active</Badge>
          )}
          <Badge tone="neutral">
            Add-on card on {state.account.card.label}
          </Badge>
        </div>

        {/* Pending: the invite has to be accepted before anything else works. */}
        {pending && (
          <Surface className="mb-5 p-4">
            <h3 className="text-[14px] font-semibold">
              Waiting for {first} to accept
            </h3>
            <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-muted">
              Invitation sent {relativeDay(member.invite.sentAt).toLowerCase()}.
              The card is issued as soon as {first} accepts and confirms their
              details.
            </p>
            <Button
              full
              className="mt-3.5"
              variant="secondary"
              icon={<MailOpen className="h-4 w-4" />}
              onClick={() => {
                dispatch({ type: 'ONBOARDING_START', memberId: member.id })
                setMode('onboarding')
              }}
            >
              Open {first}’s invite (Mode 2)
            </Button>
          </Surface>
        )}

        {/* Reciprocal visibility — rule 3. A badge, never a setting. */}
        {member.relationship === 'spouse' && (
          <Surface className="mb-5 p-4" tone="accent">
            <div className="flex items-start gap-3">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-accent text-white">
                <Eye className="h-4 w-4" aria-hidden />
              </span>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h3 className="text-[13.5px] font-semibold text-accent-deep">
                    Reciprocal visibility
                  </h3>
                  <Lock className="h-3 w-3 text-accent" aria-hidden />
                </div>
                <p className="mt-1 text-[12.5px] leading-relaxed text-accent-deep/85">
                  {reciprocalVisibility(first)}
                </p>
              </div>
            </div>
          </Surface>
        )}

        {/* ------------------------------------------- limit and usage */}
        {!pending && (
          <div className="mb-6">
            <SectionLabel>Card spending limit</SectionLabel>
            <Surface className="p-4">
              {member.monthlyLimit === null ? (
                <>
                  <p className="text-[14px] font-semibold">No limit set</p>
                  <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-muted">
                    {SPOUSE_CONTROLS_EXPLAINER}
                  </p>
                  <p className="mt-2 text-[12px] font-medium text-ink-faint">
                    {SPOUSE_CONTROLS_FOOTNOTE}
                  </p>
                  <Divider />
                  <div className="flex items-baseline justify-between gap-3 pt-3">
                    <span className="text-[12.5px] text-ink-muted">
                      Spent this period
                    </span>
                    <span className="numeral text-[15px] font-semibold">
                      {money(member.periodSpend)}
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-end justify-between gap-3">
                    <div>
                      <p className="text-[11.5px] text-ink-muted">
                        Spent this period
                      </p>
                      <MoneyDisplay
                        value={member.periodSpend}
                        size="md"
                        className="mt-1"
                      />
                    </div>
                    <p className="numeral pb-0.5 text-[13px] text-ink-muted">
                      of {money(member.monthlyLimit)}
                    </p>
                  </div>

                  <LimitBar
                    className="mt-3"
                    spent={member.periodSpend}
                    limit={member.monthlyLimit}
                    fundsCeiling={fundsBind ? state.account.balance : null}
                  />

                  <div className="mt-2.5 flex items-center justify-between gap-3 text-[12px]">
                    <span className="text-ink-muted">
                      {money(left ?? 0)} left under the limit
                    </span>
                    <span className="text-ink-faint">
                      Resets {longDate(member.periodEnd)}
                    </span>
                  </div>

                  {fundsBind && (
                    <div className="mt-3 rounded-xl border border-amber-200/70 bg-warnsoft px-3.5 py-3">
                      <p className="text-[12.5px] font-semibold text-warn">
                        Funds, not the limit, are the constraint right now
                      </p>
                      <p className="mt-1 text-[12.5px] leading-relaxed text-amber-900/85">
                        {first}’s card has {money(left ?? 0)} of limit left, but
                        your account holds {money(state.account.balance)}. The
                        card can only authorise up to available funds.
                      </p>
                    </div>
                  )}

                  {member.refresh.cadence !== 'none' && (
                    <div className="mt-3 flex items-center gap-2 rounded-xl bg-neutral-50 px-3 py-2.5">
                      <Repeat className="h-3.5 w-3.5 text-accent" aria-hidden />
                      <p className="text-[12px] text-ink-soft">
                        Budget refreshes{' '}
                        <span className="font-semibold">
                          {member.refresh.cadence}
                        </span>
                        {member.refresh.nextAt &&
                          ` · next on ${longDate(member.refresh.nextAt)}`}
                      </p>
                    </div>
                  )}
                </>
              )}
            </Surface>
          </div>
        )}

        {/* -------------------------------------------- controls summary */}
        {!pending && (
          <div className="mb-6">
            <SectionLabel>Card controls</SectionLabel>
            <Surface className="overflow-hidden">
              <ControlLine
                icon={<ShoppingCart className="h-3.5 w-3.5" />}
                label="Online purchases"
                on={member.controls.onlinePurchases}
                locked={!userMaySetControls(member)}
              />
              <Divider />
              <ControlLine
                icon={<Landmark className="h-3.5 w-3.5" />}
                label="ATM withdrawals"
                on={member.controls.atmWithdrawals}
                locked={!userMaySetControls(member)}
              />
              <Divider />
              <ControlLine
                icon={<Globe className="h-3.5 w-3.5" />}
                label="International use"
                on={member.controls.internationalUse}
                locked={!userMaySetControls(member)}
              />
              {isChild && (
                <>
                  <Divider />
                  <ControlLine
                    icon={<ShieldBan className="h-3.5 w-3.5" />}
                    label={POLICY_CATEGORY_LABEL}
                    on={!member.controls.blockGamblingAdult}
                    invertLabel
                  />
                  <Divider />
                  <div className="flex items-center gap-3 px-4 py-3.5">
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-neutral-100 text-ink-soft">
                      <Sun className="h-3.5 w-3.5" aria-hidden />
                    </span>
                    <span className="flex-1 text-[13.5px]">
                      Per-transaction cap
                    </span>
                    <span className="numeral text-[13.5px] font-semibold">
                      {member.controls.perTransactionCap === null
                        ? 'None'
                        : money(member.controls.perTransactionCap, {
                            cents: false,
                          })}
                    </span>
                  </div>
                </>
              )}
            </Surface>

            {!userMaySetControls(member) && (
              <p className="mt-2 px-1 text-[11.5px] leading-relaxed text-ink-faint">
                These are shown for transparency. You can’t change controls on
                an adult member’s card.
              </p>
            )}
          </div>
        )}

        {/* ---------------------------------------------- transactions */}
        {!pending && (
          <div className="mb-6">
            <SectionLabel>Recent transactions</SectionLabel>
            {txns.length === 0 ? (
              <EmptyState
                icon={<Wallet className="h-5 w-5" />}
                title="No transactions yet"
                body={`Purchases on ${first}’s card will appear here. Use the Demo control to simulate one.`}
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
          </div>
        )}

        {/* -------------------------------------------------- actions */}
        <div className="mb-4">
          <SectionLabel>Manage</SectionLabel>
          <Surface className="overflow-hidden">
            {!pending && (
              <>
                <ListRow
                  icon={<Snowflake className="h-4 w-4" />}
                  title={frozen ? 'Unfreeze card' : 'Freeze card'}
                  subtitle={
                    frozen
                      ? 'You froze this card, so you can lift it'
                      : 'Blocks new purchases straight away'
                  }
                  right={
                    <span className="text-[12.5px] font-semibold text-accent">
                      {busy ? '…' : frozen ? 'Unfreeze' : 'Freeze'}
                    </span>
                  }
                  onClick={toggleFreeze}
                />
                <Divider />
              </>
            )}

            {userMaySetLimits(member) && !pending && (
              <>
                <ListRow
                  icon={<Wallet className="h-4 w-4" />}
                  title="Edit spending limit"
                  subtitle="Monthly limit and budget refresh"
                  onClick={() =>
                    push({ name: 'spending-limit', memberId: member.id })
                  }
                />
                <Divider />
                <ListRow
                  icon={<ShieldBan className="h-4 w-4" />}
                  title="Edit controls"
                  subtitle="Online, ATM, international and policy blocks"
                  onClick={() => push({ name: 'controls', memberId: member.id })}
                />
                <Divider />
              </>
            )}

            {!userMaySetLimits(member) && !pending && (
              <>
                <ListRow
                  icon={<Lock className="h-4 w-4" />}
                  title="Spending limit"
                  subtitle="Not available on an adult member’s card"
                  disabled
                  right={
                    <span className="text-[12px] font-semibold text-ink-faint">
                      Locked
                    </span>
                  }
                />
                <Divider />
              </>
            )}

            <ListRow
              icon={<Bell className="h-4 w-4" />}
              title="Notification settings"
              subtitle={
                member.notifications.spendAlerts
                  ? `Spend alerts on · ${member.notifications.delivery === 'daily' ? 'daily summary' : 'immediate'}`
                  : 'Spend alerts off · security alerts always on'
              }
              onClick={() =>
                push({ name: 'notification-settings', memberId: member.id })
              }
            />
            <Divider />
            <ListRow
              icon={<Trash2 className="h-4 w-4" />}
              title={pending ? 'Cancel invitation' : 'Remove member'}
              subtitle="Stops the card immediately"
              danger
              onClick={() => push({ name: 'remove-member', memberId: member.id })}
            />
          </Surface>
        </div>

        {member.removalRequestedAt && (
          <Surface className="mb-4 p-4" tone="warn">
            <h3 className="text-[13.5px] font-semibold text-warn">
              {first} asked to give up this card
            </h3>
            <p className="mt-1 text-[12.5px] leading-relaxed text-amber-900/85">
              Requested {stamp(member.removalRequestedAt)}. The card keeps
              working until you confirm the removal.
            </p>
            <div className="mt-3 flex gap-2">
              <Button
                size="md"
                onClick={() =>
                  push({ name: 'remove-member', memberId: member.id })
                }
              >
                Review removal
              </Button>
              <Button
                size="md"
                variant="secondary"
                onClick={() =>
                  dispatch({ type: 'CANCEL_REMOVAL_REQUEST', id: member.id })
                }
              >
                Dismiss
              </Button>
            </div>
          </Surface>
        )}

        <p className="px-1 text-[11.5px] leading-relaxed text-ink-faint">
          {member.name} is an authorized user on your account. They don’t hold
          an Optimus account, and purchases on this card are charged to you.
        </p>
      </ScreenBody>
    </>
  )
}

function ControlLine({
  icon,
  label,
  on,
  locked,
  invertLabel,
}: {
  icon: React.ReactNode
  label: string
  on: boolean
  locked?: boolean
  invertLabel?: boolean
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3.5">
      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-neutral-100 text-ink-soft">
        {icon}
      </span>
      <span className="flex flex-1 items-center gap-1.5 text-[13.5px]">
        {label}
        {locked && <Lock className="h-3 w-3 text-ink-faint" aria-hidden />}
      </span>
      <Badge tone={on ? 'positive' : 'neutral'}>
        {invertLabel ? (on ? 'Allowed' : 'Blocked') : on ? 'On' : 'Off'}
      </Badge>
    </div>
  )
}
