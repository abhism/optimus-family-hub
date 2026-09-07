import { useState } from 'react'
import {
  Ban,
  CreditCard,
  Eye,
  KeyRound,
  Lock,
  LogOut,
  Snowflake,
  Trash2,
  TriangleAlert,
  Wallet,
} from 'lucide-react'
import { useActions } from '../../store/StoreContext'
import { MemberCardArt } from '../../components/CardArt'
import {
  AppBar,
  Divider,
  ListRow,
  ScreenBody,
  SectionLabel,
  Surface,
} from '../../components/ui/Layout'
import { Button } from '../../components/ui/Button'
import { Sheet } from '../../components/ui/Sheet'
import { Badge } from '../../components/ui/Primitives'
import { FundsDisclosure } from '../../components/Disclosure'
import { canUnfreeze, memberMaySelfTerminate } from '../../store/policy'
import { firstName, money } from '../../lib/format'
import type { Member } from '../../store/types'

/**
 * 3.1 / 3.2 Card settings.
 *
 * Split honestly into two lists: what this Member can actually do, and what is
 * managed by the accountholder. The second list is read-only and labelled with
 * the User's name rather than hidden away.
 */
export function MemberCardSettings({ member }: { member: Member }) {
  const { state, push, freeze, unfreeze, dispatch } = useActions()
  const user = firstName(state.account.holder)
  const isChild = member.relationship === 'child'

  const [freezeSheet, setFreezeSheet] = useState(false)
  const frozen = member.status === 'frozen'
  const mayUnfreeze = canUnfreeze(member, 'member')

  const doFreeze = () => {
    freeze(member.id, 'member')
    setFreezeSheet(false)
  }

  return (
    <>
      <AppBar title="Card settings" subtitle={`···· ${member.card.last4}`} />

      <ScreenBody>
        <div className="mx-auto mb-6 max-w-[14rem]">
          <MemberCardArt member={member} size="sm" />
        </div>

        {/* ------------------------------------------- what you can do */}
        <div className="mb-6">
          <SectionLabel>You can change these</SectionLabel>
          <Surface className="overflow-hidden">
            {frozen ? (
              <ListRow
                icon={<Snowflake className="h-4 w-4" />}
                title={mayUnfreeze ? 'Unfreeze my card' : 'Card is frozen'}
                subtitle={
                  mayUnfreeze
                    ? 'Start using your card again'
                    : isChild
                      ? `Only ${user} can unfreeze this card`
                      : `${user} froze this card, so only ${user} can unfreeze it`
                }
                disabled={!mayUnfreeze}
                right={
                  mayUnfreeze ? (
                    <span className="text-[12.5px] font-semibold text-accent">
                      Unfreeze
                    </span>
                  ) : (
                    <Lock className="h-3.5 w-3.5 text-ink-faint" aria-hidden />
                  )
                }
                onClick={
                  mayUnfreeze ? () => unfreeze(member.id, 'member') : undefined
                }
              />
            ) : (
              <ListRow
                icon={<Snowflake className="h-4 w-4" />}
                title="Freeze my card"
                subtitle="Stops new purchases straight away"
                onClick={() => setFreezeSheet(true)}
              />
            )}

            <Divider />
            <ListRow
              icon={<KeyRound className="h-4 w-4" />}
              title="Change my PIN"
              subtitle={
                member.card.pinSet ? 'Used at ATMs and card machines' : 'Not set yet'
              }
              onClick={() => push({ name: 'm-change-pin' })}
            />

            {!isChild && (
              <>
                <Divider />
                <ListRow
                  icon={<Wallet className="h-4 w-4" />}
                  title={
                    member.card.inWallet
                      ? 'Added to your phone'
                      : 'Add to your phone'
                  }
                  subtitle={
                    member.card.inWallet
                      ? 'Ready to tap with Apple or Google Wallet'
                      : 'Tap to pay with Apple or Google Wallet'
                  }
                  right={
                    member.card.inWallet ? (
                      <Badge tone="positive">Added</Badge>
                    ) : undefined
                  }
                  onClick={
                    member.card.inWallet
                      ? undefined
                      : () =>
                          dispatch({
                            type: 'PATCH_MEMBER',
                            id: member.id,
                            patch: { card: { ...member.card, inWallet: true } },
                          })
                  }
                />
              </>
            )}

            <Divider />
            <ListRow
              icon={<TriangleAlert className="h-4 w-4" />}
              title="Report lost or stolen"
              subtitle="Blocks the card and orders a replacement"
              danger
              onClick={() => push({ name: 'm-report-lost' })}
            />
          </Surface>
        </div>

        {/* ------------------------------------- what the User manages */}
        <div className="mb-6">
          <SectionLabel>Managed by {user}</SectionLabel>
          <Surface className="overflow-hidden">
            <ManagedRow
              icon={<CreditCard className="h-4 w-4" />}
              title="Card spending limit"
              body={
                member.monthlyLimit === null
                  ? `No limit is set on your card. ${user} can’t set one — Optimus doesn’t allow spending limits between adults.`
                  : `${money(member.monthlyLimit)} per period, set by ${user}. You can see it but not change it.`
              }
            />
            <Divider />
            <ManagedRow
              icon={<Wallet className="h-4 w-4" />}
              title="How the card is funded"
              body={`Purchases are charged to ${user}’s Optimus account. There’s no separate funding you can set up.`}
            />
            <Divider />
            <ManagedRow
              icon={<Eye className="h-4 w-4" />}
              title="Who can see your activity"
              body={
                isChild
                  ? `${user} can see every purchase on your card. This is part of how the card works and can’t be switched off.`
                  : `You and ${user} can both see activity on each other’s Family Hub cards. This can’t be turned off.`
              }
            />
            <Divider />
            <ManagedRow
              icon={<Ban className="h-4 w-4" />}
              title={`Removing ${user} from the account`}
              body={`${user} is the accountholder. You’re an authorized user on their account, so you can’t remove them or change the account itself.`}
            />
          </Surface>
          <FundsDisclosure className="mt-2.5 px-1" />
          <p className="mt-2 px-1 text-[11.5px] leading-relaxed text-ink-faint">
            Everything in this list is shown to you deliberately. Optimus
            doesn’t apply settings to your card without telling you.
          </p>
        </div>

        {/* --------------------------------------------- ending access */}
        <div className="mb-4">
          <SectionLabel>Ending your card</SectionLabel>
          {memberMaySelfTerminate(member) ? (
            <Button
              full
              variant="dangerSoft"
              icon={<LogOut className="h-4 w-4" />}
              onClick={() => push({ name: 'm-end-access' })}
            >
              End my card access
            </Button>
          ) : (
            <Button
              full
              variant="secondary"
              icon={<Trash2 className="h-4 w-4" />}
              onClick={() => push({ name: 'm-request-removal' })}
            >
              Ask to give up my card
            </Button>
          )}
          <p className="mt-2 px-1 text-[11.5px] leading-relaxed text-ink-faint">
            {memberMaySelfTerminate(member)
              ? 'As an adult cardholder you can end your own access without asking.'
              : `${user} confirms before your card is removed.`}
          </p>
        </div>
      </ScreenBody>

      {/* Child freeze is one-way for the Member — say so before they do it. */}
      <Sheet
        open={freezeSheet}
        onClose={() => setFreezeSheet(false)}
        title="Freeze your card?"
        footer={
          <div className="space-y-2">
            <Button full onClick={doFreeze}>
              Freeze my card
            </Button>
            <Button
              full
              variant="ghost"
              size="md"
              onClick={() => setFreezeSheet(false)}
            >
              Cancel
            </Button>
          </div>
        }
      >
        <p className="text-[13px] leading-relaxed text-ink-soft">
          Freezing stops new purchases on your card straight away. Anything
          already authorised may still go through.
        </p>

        {isChild ? (
          <div className="mt-3.5 flex items-start gap-2 rounded-xl border border-amber-200/70 bg-warnsoft px-3.5 py-3">
            <TriangleAlert
              className="mt-[1px] h-3.5 w-3.5 shrink-0 text-warn"
              aria-hidden
            />
            <p className="text-[12.5px] leading-relaxed text-amber-900/85">
              <span className="font-semibold">
                You won’t be able to unfreeze it yourself.
              </span>{' '}
              Only {user} can unfreeze a card issued to someone under 18. Ask{' '}
              {user} when you want it working again.
            </p>
          </div>
        ) : (
          <div className="mt-3.5 flex items-start gap-2 rounded-xl bg-neutral-100 px-3.5 py-3">
            <Snowflake
              className="mt-[1px] h-3.5 w-3.5 shrink-0 text-ink-muted"
              aria-hidden
            />
            <p className="text-[12.5px] leading-relaxed text-ink-soft">
              Because you’re freezing it yourself, you can unfreeze it yourself
              too — from this screen, whenever you like.
            </p>
          </div>
        )}
      </Sheet>
    </>
  )
}

function ManagedRow({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode
  title: string
  body: string
}) {
  return (
    <div className="flex items-start gap-3 px-4 py-3.5">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-neutral-100 text-ink-faint">
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-1.5 text-[13.5px] font-medium text-ink-soft">
          {title}
          <Lock className="h-3 w-3 shrink-0 text-ink-faint" aria-hidden />
        </p>
        <p className="mt-0.5 text-[12.5px] leading-relaxed text-ink-muted">
          {body}
        </p>
      </div>
    </div>
  )
}
