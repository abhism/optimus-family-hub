import { Clock, MailOpen, Send } from 'lucide-react'
import { useActions } from '../../../store/StoreContext'
import { AppBar, ScreenBody, Surface } from '../../../components/ui/Layout'
import { Button } from '../../../components/ui/Button'
import { MemberCardArt } from '../../../components/CardArt'
import { stamp } from '../../../lib/format'

/** Step 5 — invitation sent. The Member is now `pending`. */
export function StepInvitationSent({
  memberId,
  onDone,
  onOpenInvite,
  onViewMember,
}: {
  memberId: string
  onDone: () => void
  onOpenInvite: () => void
  onViewMember: () => void
}) {
  const { state, setMode } = useActions()
  const member = state.members.find((m) => m.id === memberId)
  if (!member) return null

  const first = member.name.split(' ')[0]!

  return (
    <>
      <AppBar />
      <ScreenBody className="flex flex-col">
        <div className="flex flex-col items-center text-center">
          <div className="grid h-16 w-16 place-items-center rounded-full bg-accent-soft text-accent">
            <Send className="h-7 w-7" aria-hidden />
          </div>
          <h1 className="mt-5 text-[21px] font-semibold leading-snug tracking-[-0.02em]">
            Invitation sent to {first}
          </h1>
          <p className="mt-2 max-w-[18rem] text-[13.5px] leading-relaxed text-ink-muted">
            {first} gets a link to confirm their details and set up the card.
            Nothing is issued until they accept.
          </p>
        </div>

        <div className="mx-auto mt-6 w-[13rem] opacity-60">
          <MemberCardArt member={member} size="sm" />
        </div>

        <Surface className="mt-6 p-4">
          <div className="flex items-center gap-2">
            <Clock className="h-3.5 w-3.5 text-warn" aria-hidden />
            <p className="text-[13px] font-semibold">Pending acceptance</p>
          </div>
          <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-muted">
            Sent {stamp(member.invite.sentAt)}. The card number, expiry and CVV
            are generated now but stay inactive until {first} completes setup.
          </p>
        </Surface>

        <Surface className="mt-3 p-4">
          <h2 className="text-[13px] font-semibold">What happens next</h2>
          <ol className="mt-2.5 space-y-2 text-[12.5px] leading-relaxed text-ink-muted">
            <Step n={1}>
              {first} opens the invitation and reads what an add-on card means.
            </Step>
            <Step n={2}>
              They confirm their details and set up a passcode.
            </Step>
            <Step n={3}>
              The virtual card is issued straight away — the physical card
              follows in the post.
            </Step>
          </ol>
        </Surface>

        <div className="mt-6 space-y-2">
          <Button
            full
            icon={<MailOpen className="h-4 w-4" />}
            onClick={() => {
              onOpenInvite()
              setMode('onboarding')
            }}
          >
            Open {first}’s invite (Mode 2)
          </Button>
          <Button full variant="secondary" onClick={onViewMember}>
            View {first}’s card
          </Button>
          <Button full variant="ghost" size="md" onClick={onDone}>
            Back to Family Hub
          </Button>
        </div>
      </ScreenBody>
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
