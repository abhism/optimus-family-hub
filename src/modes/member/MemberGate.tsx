import { Clock, MailOpen, Trash2, UserPlus } from 'lucide-react'
import { useActions } from '../../store/StoreContext'
import { AppBar, EmptyState, ScreenBody, Surface } from '../../components/ui/Layout'
import { Button } from '../../components/ui/Button'
import { SETTLEMENT_TAIL } from '../../lib/copy'
import { firstName, relativeDay } from '../../lib/format'

/**
 * Entry state for Mode 3 when there is no usable card for this relationship —
 * the invitation hasn't been accepted, the card was removed, or no member of
 * this type exists yet.
 */
export function MemberGate() {
  const { state, setMode, dispatch } = useActions()

  const wantChild = state.mode === 'member-child'
  const relationship = wantChild ? 'child' : 'spouse'
  const label = wantChild ? 'child' : 'spouse'
  const user = firstName(state.account.holder)

  const pending = state.members.find(
    (m) => m.relationship === relationship && m.status === 'pending',
  )
  const removed = state.members.find(
    (m) => m.relationship === relationship && m.status === 'removed',
  )

  return (
    <>
      <AppBar title="Family Hub card" />
      <ScreenBody>
        {pending ? (
          <>
            <EmptyState
              icon={<Clock className="h-5 w-5" />}
              title={`${firstName(pending.name)} hasn’t accepted yet`}
              body={`${user} sent the invitation ${relativeDay(
                pending.invite.sentAt,
              ).toLowerCase()}. The card is issued once the invitation is accepted and access is set up.`}
              action={
                <Button
                  icon={<MailOpen className="h-4 w-4" />}
                  onClick={() => {
                    dispatch({ type: 'ONBOARDING_START', memberId: pending.id })
                    setMode('onboarding')
                  }}
                >
                  Open {firstName(pending.name)}’s invite
                </Button>
              }
            />
            <p className="mt-4 px-1 text-[11.5px] leading-relaxed text-ink-faint">
              This is the shared store at work: accepting the invitation in
              Mode 2 activates the card and this screen becomes the member’s
              home.
            </p>
          </>
        ) : removed ? (
          <>
            <EmptyState
              icon={<Trash2 className="h-5 w-5" />}
              title="This card has been removed"
              body={`${user} removed ${firstName(
                removed.name,
              )}’s Family Hub card. It can no longer be used for purchases.`}
            />
            <Surface className="mt-4 p-4" tone="warn">
              <p className="text-[12.5px] font-semibold text-warn">
                Purchases already in flight
              </p>
              <p className="mt-1 text-[12.5px] leading-relaxed text-amber-900/85">
                {SETTLEMENT_TAIL}
              </p>
            </Surface>
          </>
        ) : (
          <>
            <EmptyState
              icon={<UserPlus className="h-5 w-5" />}
              title={`No ${label} card yet`}
              body={`Add a ${label} in the User app, then accept the invitation in Mode 2. This screen becomes their card home.`}
              action={
                <Button onClick={() => setMode('user')}>
                  Go to the User app
                </Button>
              }
            />
          </>
        )}
      </ScreenBody>
    </>
  )
}
