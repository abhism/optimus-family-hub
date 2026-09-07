import { useState } from 'react'
import { Check, LogOut } from 'lucide-react'
import { useActions } from '../../../store/StoreContext'
import {
  AppBar,
  ScreenBody,
  ScreenFooter,
  Surface,
} from '../../../components/ui/Layout'
import { Button } from '../../../components/ui/Button'
import { Checkbox } from '../../../components/ui/Field'
import { SettlementTail, FundsDisclosure } from '../../../components/Disclosure'
import { firstName, money } from '../../../lib/format'
import type { Member } from '../../../store/types'

/**
 * 3.1 End card access.
 *
 * An adult member can self-terminate without asking. The settlement tail is
 * the same text the User sees in 1.8 — it comes from lib/copy.ts.
 */
export function EndCardAccess({ member }: { member: Member }) {
  const { state, pop, setMode, dispatch } = useActions()
  const user = firstName(state.account.holder)

  const [ack, setAck] = useState(false)
  const [done, setDone] = useState(false)

  if (done) {
    return (
      <>
        <AppBar />
        <ScreenBody className="flex flex-col items-center justify-center text-center">
          <div className="grid h-16 w-16 place-items-center rounded-full bg-positive text-white">
            <Check className="h-8 w-8" aria-hidden />
          </div>
          <h1 className="mt-5 text-[20px] font-semibold leading-snug">
            Your card access has ended
          </h1>
          <p className="mt-2 max-w-[18rem] text-[13.5px] leading-relaxed text-ink-muted">
            Your Family Hub card has stopped working and {user} has been
            notified. You no longer have access to activity on this account.
          </p>

          <SettlementTail className="mt-6 w-full text-left" />

          <Button
            full
            className="mt-6"
            variant="secondary"
            onClick={() => setMode('select')}
          >
            Back to the mode selector
          </Button>
        </ScreenBody>
      </>
    )
  }

  return (
    <>
      <AppBar title="End card access" onBack={pop} />

      <ScreenBody>
        <h1 className="mt-2 text-[21px] font-semibold leading-snug tracking-[-0.02em]">
          End your Family Hub card?
        </h1>
        <p className="mt-2 text-[13.5px] leading-relaxed text-ink-muted">
          You can do this yourself — you don’t need {user} to approve it. It
          can’t be undone, though {user} could invite you again later.
        </p>

        <SettlementTail className="mt-5" />

        <Surface className="mt-4 p-4">
          <h2 className="text-[13.5px] font-semibold">What you’ll lose</h2>
          <ul className="mt-2.5 space-y-2 text-[12.5px] leading-relaxed text-ink-muted">
            <li className="flex gap-2">
              <Dot />
              Your card, including the version in your phone.
            </li>
            <li className="flex gap-2">
              <Dot />
              Access to activity on {user}’s Family Hub cards.
            </li>
            <li className="flex gap-2">
              <Dot />
              The {money(member.periodSpend)} you’ve spent this period stays
              charged to {user}’s account.
            </li>
          </ul>
        </Surface>

        <FundsDisclosure className="mt-3 px-1" />

        <div className="mt-5">
          <Checkbox id="end-access-ack" checked={ack} onChange={setAck}>
            I understand that purchases already authorised may still settle and
            will be charged to {user}’s account.
          </Checkbox>
        </div>
      </ScreenBody>

      <ScreenFooter>
        <div className="space-y-2">
          <Button
            full
            variant="danger"
            disabled={!ack}
            icon={<LogOut className="h-4 w-4" />}
            onClick={() => {
              dispatch({ type: 'REMOVE_MEMBER', id: member.id })
              setDone(true)
            }}
          >
            End my card access
          </Button>
          <Button full variant="ghost" size="md" onClick={pop}>
            Keep my card
          </Button>
        </div>
      </ScreenFooter>
    </>
  )
}

function Dot() {
  return (
    <span
      className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-ink-faint"
      aria-hidden
    />
  )
}
