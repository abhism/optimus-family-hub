import { useState } from 'react'
import { Clock, Send } from 'lucide-react'
import { useActions } from '../../../store/StoreContext'
import {
  AppBar,
  ScreenBody,
  ScreenFooter,
  Surface,
} from '../../../components/ui/Layout'
import { Button } from '../../../components/ui/Button'
import { SETTLEMENT_TAIL } from '../../../lib/copy'
import { firstName, stamp } from '../../../lib/format'
import type { Member } from '../../../store/types'

/**
 * 3.2 Request card removal.
 *
 * A child can ask, but cannot terminate. This is not a request-and-approve
 * workflow for spending — it is the one thing a minor cardholder may initiate,
 * and the screen is explicit that the accountholder confirms it.
 */
export function RequestRemoval({ member }: { member: Member }) {
  const { state, pop, requestRemoval } = useActions()
  const user = firstName(state.account.holder)

  const [sent, setSent] = useState(Boolean(member.removalRequestedAt))

  if (sent) {
    return (
      <>
        <AppBar title="Request sent" onBack={pop} />
        <ScreenBody className="flex flex-col items-center text-center">
          <div className="mt-6 grid h-16 w-16 place-items-center rounded-full bg-accent-soft text-accent">
            <Clock className="h-7 w-7" aria-hidden />
          </div>
          <h1 className="mt-5 text-[20px] font-semibold leading-snug">
            {user} has been asked
          </h1>
          <p className="mt-2 max-w-[18rem] text-[13.5px] leading-relaxed text-ink-muted">
            {user} will see your request in their app. Your card{' '}
            <strong className="font-semibold">keeps working normally</strong>{' '}
            until they confirm the removal.
          </p>

          {member.removalRequestedAt && (
            <p className="mt-3 text-[11.5px] text-ink-faint">
              Asked {stamp(member.removalRequestedAt)}
            </p>
          )}

          <Surface className="mt-6 w-full p-4 text-left">
            <h2 className="text-[13.5px] font-semibold">
              When {user} confirms
            </h2>
            <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-muted">
              {SETTLEMENT_TAIL}
            </p>
          </Surface>

          <Button full className="mt-6" variant="secondary" onClick={pop}>
            Back to card settings
          </Button>
        </ScreenBody>
      </>
    )
  }

  return (
    <>
      <AppBar title="Give up your card" onBack={pop} />

      <ScreenBody>
        <h1 className="mt-2 text-[21px] font-semibold leading-snug tracking-[-0.02em]">
          Ask {user} to remove your card?
        </h1>
        <p className="mt-2 text-[13.5px] leading-relaxed text-ink-muted">
          You can ask for your Family Hub card to be removed. Because you’re
          under 18, {user} has to confirm it — you can’t close the card
          yourself.
        </p>

        <Surface className="mt-5 p-4">
          <h2 className="text-[13.5px] font-semibold">How this works</h2>
          <ol className="mt-2.5 space-y-2.5 text-[12.5px] leading-relaxed text-ink-muted">
            <Step n={1}>{user} gets a notification about your request.</Step>
            <Step n={2}>
              Your card keeps working exactly as normal in the meantime.
            </Step>
            <Step n={3}>
              If {user} confirms, the card stops working straight away.
            </Step>
          </ol>
        </Surface>

        <Surface className="mt-4 p-4" tone="warn">
          <p className="text-[12.5px] font-semibold text-warn">
            If it does get removed
          </p>
          <p className="mt-1 text-[12.5px] leading-relaxed text-amber-900/85">
            {SETTLEMENT_TAIL}
          </p>
        </Surface>

        <p className="mt-4 px-1 text-[11.5px] leading-relaxed text-ink-faint">
          Changed your mind? You can just close this screen — nothing is sent
          until you tap the button below.
        </p>
      </ScreenBody>

      <ScreenFooter>
        <div className="space-y-2">
          <Button
            full
            icon={<Send className="h-4 w-4" />}
            onClick={() => {
              requestRemoval(member.id)
              setSent(true)
            }}
          >
            Ask {user} to remove my card
          </Button>
          <Button full variant="ghost" size="md" onClick={pop}>
            Keep my card
          </Button>
        </div>
      </ScreenFooter>
    </>
  )
}

function Step({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <li className="flex gap-2.5">
      <span className="numeral mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full bg-accent-soft text-[10px] font-bold text-accent">
        {n}
      </span>
      <span>{children}</span>
    </li>
  )
}
