import { GraduationCap, Heart, MailOpen, Plus } from 'lucide-react'
import { useActions } from '../../store/StoreContext'
import {
  AppBar,
  Divider,
  EmptyState,
  ScreenBody,
  SectionLabel,
  Surface,
} from '../../components/ui/Layout'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Primitives'
import { endOfMonth, uid } from '../../lib/format'
import { spouseDefaults, generateCard } from '../user/addMember/draft'
import type { ConsentRecord, Member, SupportedRelationship } from '../../store/types'

/**
 * Fallback for Mode 2 when nothing is pending.
 *
 * Entering the mode normally jumps straight into the newest pending
 * invitation (see SET_MODE in store/reducer.ts), so this screen only appears
 * once every invitation has been accepted — where it offers to create one
 * rather than leaving the mode a dead end.
 */
export function InvitePicker() {
  const { state, dispatch } = useActions()

  const alreadyOnboarded = state.members.filter(
    (m) => m.status === 'active' || m.status === 'frozen',
  )

  const createDemoInvite = (relationship: SupportedRelationship) => {
    const now = new Date().toISOString()
    const id = uid('mem')
    const card = generateCard()
    const isChild = relationship === 'child'

    const member: Member = {
      id,
      name: isChild ? 'Kiran Raman' : 'Meera Raman',
      relationship,
      dob: isChild ? '2012-06-02' : '1989-07-22',
      address: '218 Kestrel Row, Apt 4B, Austin, TX 78704',
      status: 'pending',
      freezeSource: null,
      card: {
        ...card,
        network: 'Visa',
        pinSet: false,
        inWallet: false,
        virtualIssuedAt: null,
        physicalOrderedAt: null,
        physicalArrivesBy: null,
      },
      monthlyLimit: isChild ? 150 : null,
      periodSpend: 0,
      periodStart: now,
      periodEnd: endOfMonth(now),
      refresh: {
        cadence: isChild ? 'monthly' : 'none',
        nextAt: isChild ? endOfMonth(now) : null,
      },
      controls: isChild
        ? {
            onlinePurchases: true,
            atmWithdrawals: false,
            internationalUse: false,
            blockGamblingAdult: true,
            perTransactionCap: 50,
          }
        : spouseDefaults(),
      notifications: {
        spendAlerts: true,
        delivery: isChild ? 'immediate' : 'daily',
      },
      invite: {
        sentAt: now,
        acceptedAt: null,
        termsAcceptedAt: null,
        passcodeSet: false,
        biometric: false,
      },
      removalRequestedAt: null,
      refreshConstrainedAt: null,
    }

    const consents: ConsentRecord[] = [
      {
        id: uid('con'),
        memberId: id,
        type: 'invitation_sent',
        actor: state.account.holder,
        at: now,
      },
    ]
    if (isChild) {
      consents.push({
        id: uid('con'),
        memberId: id,
        type: 'parental_consent',
        actor: state.account.holder,
        at: now,
      })
    }

    dispatch({ type: 'ADD_MEMBER', member, consents })
    dispatch({ type: 'ONBOARDING_START', memberId: id })
  }

  return (
    <>
      <AppBar title="No invitation waiting" />

      <ScreenBody>
        <EmptyState
          icon={<MailOpen className="h-5 w-5" />}
          title="Every invitation has been accepted"
          body="Invitations sent from the User app open here automatically. You can also create one to walk the onboarding flow again."
        />

        <div className="mt-5">
          <SectionLabel>Create an invitation</SectionLabel>
          <div className="space-y-2.5">
            <Button
              full
              variant="secondary"
              icon={<Heart className="h-4 w-4" />}
              onClick={() => createDemoInvite('spouse')}
            >
              Invite a spouse
            </Button>
            <Button
              full
              variant="secondary"
              icon={<GraduationCap className="h-4 w-4" />}
              onClick={() => createDemoInvite('child')}
            >
              Invite a child
            </Button>
          </div>
          <p className="mt-3 px-1 text-[11.5px] leading-relaxed text-ink-faint">
            This writes a real pending member into the shared store — the same
            thing the User app’s Add Member flow does — then opens their
            invitation straight away.
          </p>
        </div>

        {alreadyOnboarded.length > 0 && (
          <div className="mt-7">
            <SectionLabel>Already set up</SectionLabel>
            <Surface className="overflow-hidden">
              {alreadyOnboarded.map((m, i) => (
                <div key={m.id}>
                  {i > 0 && <Divider />}
                  <div className="flex items-center gap-3 px-4 py-3">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-neutral-100 text-ink-faint">
                      <Plus className="h-3.5 w-3.5 rotate-45" aria-hidden />
                    </span>
                    <span className="min-w-0 flex-1 truncate text-[13.5px]">
                      {m.name}
                    </span>
                    <Badge tone="positive">Card active</Badge>
                  </div>
                </div>
              ))}
            </Surface>
          </div>
        )}
      </ScreenBody>
    </>
  )
}
