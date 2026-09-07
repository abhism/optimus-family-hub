import {
  ChevronRight,
  Clock,
  GraduationCap,
  Heart,
  Link2,
  MailOpen,
  Plus,
} from 'lucide-react'
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
import { endOfMonth, relativeDay, uid } from '../../lib/format'
import { spouseDefaults, generateCard } from '../user/addMember/draft'
import type { ConsentRecord, Member, SupportedRelationship } from '../../store/types'

/**
 * Entry point for Mode 2 — simulates opening an invite link.
 *
 * Driven by real pending members from the shared store, so a Member added in
 * Mode 1 shows up here. When there are none, a seeded fallback keeps the mode
 * from being a dead end for a reviewer.
 */
export function InvitePicker() {
  const { state, dispatch } = useActions()

  const pending = state.members.filter((m) => m.status === 'pending')
  const alreadyOnboarded = state.members.filter(
    (m) => m.status === 'active' || m.status === 'frozen',
  )

  const open = (memberId: string) =>
    dispatch({ type: 'ONBOARDING_START', memberId })

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
    open(id)
  }

  return (
    <>
      <AppBar title="Invitations" subtitle="Open an invite link" border />

      <ScreenBody>
        {pending.length > 0 ? (
          <>
            <div className="mb-5 flex items-start gap-3 rounded-2xl border border-accent-line bg-accent-soft/70 p-4">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-accent text-white">
                <Link2 className="h-4 w-4" aria-hidden />
              </span>
              <div>
                <p className="text-[13.5px] font-semibold text-accent-deep">
                  These are live invitations
                </p>
                <p className="mt-1 text-[12.5px] leading-relaxed text-accent-deep/85">
                  Each one was created in the User app. Opening it runs the real
                  onboarding flow and issues the card in the shared store.
                </p>
              </div>
            </div>

            <SectionLabel>Waiting to be accepted</SectionLabel>
            <Surface className="overflow-hidden">
              {pending.map((m, i) => (
                <div key={m.id}>
                  {i > 0 && <Divider />}
                  <button
                    type="button"
                    onClick={() => open(m.id)}
                    className="tap flex w-full items-center gap-3 px-4 py-4 text-left hover:bg-neutral-50"
                  >
                    <span
                      className={
                        m.relationship === 'child'
                          ? 'grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-violet-500 to-pink-500 text-white'
                          : 'grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-accent to-violet-600 text-white'
                      }
                    >
                      {m.relationship === 'child' ? (
                        <GraduationCap className="h-4.5 w-4.5" aria-hidden />
                      ) : (
                        <Heart className="h-4.5 w-4.5" aria-hidden />
                      )}
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2">
                        <span className="truncate text-[14.5px] font-semibold">
                          {m.name}
                        </span>
                        <Badge tone="neutral">
                          {m.relationship === 'child' ? 'Child' : 'Spouse'}
                        </Badge>
                      </span>
                      <span className="mt-0.5 flex items-center gap-1 text-[12px] text-ink-muted">
                        <Clock className="h-3 w-3" aria-hidden />
                        Invited {relativeDay(m.invite.sentAt).toLowerCase()}
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

            <p className="mt-4 px-1 text-[11.5px] leading-relaxed text-ink-faint">
              Tapping an invitation is the equivalent of the invited person
              opening the link on their own phone.
            </p>
          </>
        ) : (
          <>
            <EmptyState
              icon={<MailOpen className="h-5 w-5" />}
              title="No invitations waiting"
              body="Invitations sent from the User app appear here. You can also create one directly to walk the onboarding flow."
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
                This writes a real pending member into the shared store — the
                same thing the User app’s Add Member flow does.
              </p>
            </div>
          </>
        )}

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
