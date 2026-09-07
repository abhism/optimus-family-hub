import { useState } from 'react'
import { Check, Trash2, X } from 'lucide-react'
import { useActions } from '../../store/StoreContext'
import { MemberCardArt } from '../../components/CardArt'
import {
  AppBar,
  ScreenBody,
  ScreenFooter,
  Surface,
} from '../../components/ui/Layout'
import { Button } from '../../components/ui/Button'
import { Checkbox } from '../../components/ui/Field'
import { SettlementTail } from '../../components/Disclosure'
import { money, stamp } from '../../lib/format'

/** 1.8 Remove member. */
export function RemoveMemberScreen({ memberId }: { memberId: string }) {
  const { state, pop, reset, dispatch } = useActions()
  const member = state.members.find((m) => m.id === memberId)!
  const first = member.name.split(' ')[0]!
  const pending = member.status === 'pending'

  const [ack, setAck] = useState(false)
  const [done, setDone] = useState(false)

  const remove = () => {
    dispatch({ type: 'REMOVE_MEMBER', id: member.id })
    setDone(true)
  }

  if (done) {
    return (
      <>
        <AppBar />
        <ScreenBody className="flex flex-col items-center justify-center text-center">
          <div className="grid h-16 w-16 place-items-center rounded-full bg-positive text-white">
            <Check className="h-8 w-8" aria-hidden />
          </div>
          <h1 className="mt-5 text-[20px] font-semibold">
            {pending ? 'Invitation cancelled' : `${first}’s card is removed`}
          </h1>
          <p className="mt-2 max-w-[17rem] text-[13.5px] leading-relaxed text-ink-muted">
            {pending
              ? `${first} can no longer use the invitation link. Nothing was issued.`
              : `The card stopped working immediately. ${first} has been told the card was removed.`}
          </p>

          {!pending && <SettlementTail className="mt-6 w-full text-left" />}

          <Button
            full
            className="mt-6"
            onClick={() => reset({ name: 'family-hub' })}
          >
            Back to Family Hub
          </Button>
        </ScreenBody>
      </>
    )
  }

  return (
    <>
      <AppBar
        title={pending ? 'Cancel invitation' : 'Remove member'}
        onBack={pop}
      />

      <ScreenBody>
        <div className="mx-auto mb-5 max-w-[13rem]">
          <MemberCardArt member={member} size="sm" />
        </div>

        <h1 className="text-center text-[19px] font-semibold leading-snug">
          {pending
            ? `Cancel ${first}’s invitation?`
            : `Remove ${first}’s card?`}
        </h1>
        <p className="mx-auto mt-2 max-w-[18rem] text-center text-[13.5px] leading-relaxed text-ink-muted">
          {pending
            ? `The invitation link stops working and no card is issued. You can invite ${first} again later.`
            : `${first} will lose access to this card and to the Family Hub app. This can’t be undone — inviting them again issues a new card.`}
        </p>

        {!pending && (
          <>
            <SettlementTail className="mt-5" />

            <Surface className="mt-4 p-4">
              <h2 className="text-[13.5px] font-semibold">
                What happens right away
              </h2>
              <ul className="mt-2.5 space-y-2 text-[12.5px] leading-relaxed text-ink-muted">
                <Bullet>
                  The card and its digital wallet entry stop working for new
                  purchases.
                </Bullet>
                <Bullet>
                  {first}’s spending limit no longer applies to anything.
                </Bullet>
                <Bullet>
                  {money(member.periodSpend)} already spent this period stays on
                  your account.
                </Bullet>
                <Bullet>
                  Records of transactions and consent stay on your account
                  statement.
                </Bullet>
              </ul>
            </Surface>

            {member.removalRequestedAt && (
              <p className="mt-3 px-1 text-[12px] leading-relaxed text-ink-faint">
                {first} requested this on {stamp(member.removalRequestedAt)}.
              </p>
            )}

            <div className="mt-5">
              <Checkbox
                id="ack-settlement"
                checked={ack}
                onChange={setAck}
              >
                I understand that transactions already authorised may still
                settle and be charged to my account.
              </Checkbox>
            </div>
          </>
        )}
      </ScreenBody>

      <ScreenFooter>
        <div className="space-y-2">
          <Button
            full
            variant="danger"
            disabled={!pending && !ack}
            onClick={remove}
            icon={
              pending ? (
                <X className="h-4 w-4" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )
            }
          >
            {pending ? 'Cancel invitation' : `Remove ${first}’s card`}
          </Button>
          <Button full variant="ghost" size="md" onClick={pop}>
            Keep the card
          </Button>
        </div>
      </ScreenFooter>
    </>
  )
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex gap-2">
      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-ink-faint" />
      <span>{children}</span>
    </li>
  )
}
