import { useState } from 'react'
import { Check, MapPin, ShieldAlert, Truck } from 'lucide-react'
import { useActions } from '../../store/StoreContext'
import {
  AppBar,
  Divider,
  ScreenBody,
  ScreenFooter,
  Surface,
} from '../../components/ui/Layout'
import { Button } from '../../components/ui/Button'
import { firstName, longDate } from '../../lib/format'
import type { Member } from '../../store/types'

type Reason = 'lost' | 'stolen'

/**
 * Report lost or stolen.
 *
 * Freezes the card as a member-applied freeze and issues a replacement. The
 * virtual card is reissued immediately; the plastic follows (rule 9).
 */
export function ReportLost({ member }: { member: Member }) {
  const { state, pop, freeze } = useActions()
  const user = firstName(state.account.holder)

  const [reason, setReason] = useState<Reason | null>(null)
  const [done, setDone] = useState(false)

  const arrival = new Date()
  arrival.setDate(arrival.getDate() + 7)

  if (done) {
    return (
      <>
        <AppBar title="Card blocked" onBack={pop} />
        <ScreenBody className="flex flex-col items-center text-center">
          <div className="mt-6 grid h-16 w-16 place-items-center rounded-full bg-positive text-white">
            <Check className="h-8 w-8" aria-hidden />
          </div>
          <h1 className="mt-5 text-[20px] font-semibold leading-snug">
            Your card is blocked
          </h1>
          <p className="mt-2 max-w-[18rem] text-[13.5px] leading-relaxed text-ink-muted">
            Nobody can use it now. We’re sending you a replacement with a new
            card number.
          </p>

          <Surface className="mt-6 w-full overflow-hidden text-left">
            <div className="flex items-start gap-3 p-4">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-accent-soft text-accent">
                <ShieldAlert className="h-4 w-4" aria-hidden />
              </span>
              <div>
                <p className="text-[13.5px] font-semibold">
                  Old card ···· {member.card.last4} is dead
                </p>
                <p className="mt-0.5 text-[12px] leading-relaxed text-ink-muted">
                  It’s been removed from your phone too. Any purchases already
                  authorised may still settle.
                </p>
              </div>
            </div>
            <Divider />
            <div className="flex items-start gap-3 p-4">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-neutral-100 text-ink-soft">
                <Truck className="h-4 w-4" aria-hidden />
              </span>
              <div>
                <p className="text-[13.5px] font-semibold">
                  Replacement on its way
                </p>
                <p className="mt-0.5 text-[12px] leading-relaxed text-ink-muted">
                  Arriving in 5–7 days, by {longDate(arrival.toISOString())}. A
                  new virtual card is available as soon as it’s activated.
                </p>
              </div>
            </div>
            <Divider />
            <div className="flex items-start gap-3 p-4">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-neutral-100 text-ink-soft">
                <MapPin className="h-4 w-4" aria-hidden />
              </span>
              <div>
                <p className="text-[13.5px] font-semibold">Posting to</p>
                <p className="mt-0.5 text-[12px] leading-relaxed text-ink-muted">
                  {member.address}
                </p>
              </div>
            </div>
          </Surface>

          <p className="mt-4 text-[11.5px] leading-relaxed text-ink-faint">
            {user} has been notified — card replacements are always reported to
            the accountholder.
          </p>

          <Button full className="mt-6" onClick={pop}>
            Done
          </Button>
        </ScreenBody>
      </>
    )
  }

  return (
    <>
      <AppBar title="Report lost or stolen" onBack={pop} />

      <ScreenBody>
        <h1 className="mt-2 text-[21px] font-semibold leading-snug tracking-[-0.02em]">
          What happened to your card?
        </h1>
        <p className="mt-2 text-[13.5px] leading-relaxed text-ink-muted">
          We’ll block it straight away so nobody else can use it, then send you
          a replacement.
        </p>

        <div className="mt-5 space-y-2.5">
          <ReasonCard
            active={reason === 'lost'}
            title="I’ve lost it"
            body="You can’t find your card but you don’t think anyone has taken it."
            onClick={() => setReason('lost')}
          />
          <ReasonCard
            active={reason === 'stolen'}
            title="It’s been stolen"
            body="You think someone has taken your card. We’ll check recent purchases too."
            onClick={() => setReason('stolen')}
          />
        </div>

        {reason === 'stolen' && (
          <Surface className="mt-4 p-4" tone="warn">
            <p className="text-[12.5px] font-semibold text-warn">
              Tell {user} as well
            </p>
            <p className="mt-1 text-[12.5px] leading-relaxed text-amber-900/85">
              Purchases on this card come out of {user}’s account, so let them
              know. Optimus will send them an alert too.
            </p>
          </Surface>
        )}
      </ScreenBody>

      <ScreenFooter>
        <Button
          full
          variant="danger"
          disabled={!reason}
          onClick={() => {
            freeze(member.id, 'member')
            setDone(true)
          }}
        >
          Block my card
        </Button>
      </ScreenFooter>
    </>
  )
}

function ReasonCard({
  active,
  title,
  body,
  onClick,
}: {
  active: boolean
  title: string
  body: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`tap w-full rounded-2xl border bg-white p-4 text-left shadow-card ${
        active ? 'border-accent ring-1 ring-accent' : 'border-line'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[14.5px] font-semibold">{title}</p>
          <p className="mt-1 text-[12.5px] leading-relaxed text-ink-muted">
            {body}
          </p>
        </div>
        {active && (
          <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-accent text-white">
            <Check className="h-3 w-3" aria-hidden />
          </span>
        )}
      </div>
    </button>
  )
}
