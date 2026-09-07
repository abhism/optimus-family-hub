import { useCallback } from 'react'
import { useActions } from '../../store/StoreContext'
import { AppBar, ProgressDots, ScreenBody } from '../../components/ui/Layout'
import { Badge } from '../../components/ui/Primitives'
import type { Member } from '../../store/types'
import {
  CardholderTerms,
  ConfirmDetails,
  InviteLanding,
  SetUpAccess,
  WhatThisIs,
} from './ComprehensionSteps'
import {
  AddToWallet,
  CardReady,
  PhysicalCardOnItsWay,
  SetPin,
} from './CardIssueSteps'
import { TOTAL_STEPS, ONBOARDING_STEPS, type StepProps } from './stepTypes'
import { firstName } from '../../lib/format'

/**
 * Mode 2 — the ten-screen onboarding run.
 *
 * The virtual card is issued when the Member finishes setting up access
 * (step 5 → 6), never when the physical card arrives. Completing the run
 * lands the Member in their own app for their relationship type.
 */
export function OnboardingFlow({ memberId }: { memberId: string }) {
  const { state, dispatch, setMode } = useActions()

  const member = state.members.find((m) => m.id === memberId)
  const step = state.onboarding.step

  const patchMember = useCallback(
    (patch: Partial<Member>) =>
      dispatch({ type: 'ONBOARDING_PATCH_MEMBER', patch }),
    [dispatch],
  )

  if (!member) return null

  const isChild = member.relationship === 'child'
  const goTo = (next: number) =>
    dispatch({ type: 'ONBOARDING_STEP', step: next })

  const next = () => {
    // Issuing happens on the way into step 5 (index 5): the card becomes
    // active the moment access is set up.
    if (step === 4) {
      const now = new Date().toISOString()
      dispatch({ type: 'ONBOARDING_COMPLETE', at: now })
      patchMember({
        card: { ...member.card, virtualIssuedAt: now },
      })
      if (!isChild) {
        dispatch({
          type: 'ADD_CONSENT',
          record: {
            id: `con_${member.id}_terms`,
            memberId: member.id,
            type: 'cardholder_terms',
            actor: member.name,
            at: member.invite.termsAcceptedAt ?? now,
          },
        })
      }
    }

    if (step >= TOTAL_STEPS - 1) {
      // Step 10 — land in the existing-member home for this relationship.
      // Clear the in-flight invite first: setup is finished, so re-entering
      // Mode 2 should pick up the next pending invite rather than replay this
      // member's completed flow.
      dispatch({ type: 'ONBOARDING_EXIT' })
      setMode(isChild ? 'member-child' : 'member-spouse')
      return
    }
    goTo(step + 1)
  }

  const props: StepProps = {
    member,
    userName: state.account.holder,
    userFirstName: firstName(state.account.holder),
    next,
    patchMember,
  }

  const back = () => goTo(step - 1)

  // Step 0 is now the mode's entry point, so there is nothing above it to go
  // back to — leaving the mode is the switcher's job. Card details and PIN
  // can't be un-issued, so back also stops once the card exists.
  const canGoBack = step > 0 && step < 5

  /** Other invitations still waiting, reachable from the landing step. */
  const otherPending = state.members.filter(
    (m) => m.status === 'pending' && m.id !== member.id,
  )

  return (
    <>
      <AppBar
        title={ONBOARDING_STEPS[step]}
        subtitle={isChild ? 'Child invitation' : 'Spouse invitation'}
        onBack={canGoBack ? back : undefined}
        right={
          step < 5 ? (
            <ProgressDots
              total={TOTAL_STEPS}
              index={step}
              label="Card setup progress"
            />
          ) : (
            <Badge tone="positive">Card issued</Badge>
          )
        }
      />

      <ScreenBody className="flex flex-col">
        {step === 0 && <InviteLanding {...props} />}
        {step === 1 && <WhatThisIs {...props} />}
        {step === 2 && <ConfirmDetails {...props} />}
        {step === 3 && <CardholderTerms {...props} />}
        {step === 4 && <SetUpAccess {...props} />}
        {step === 5 && <CardReady {...props} />}
        {step === 6 && <AddToWallet {...props} />}
        {step === 7 && <SetPin {...props} />}
        {step === 8 && <PhysicalCardOnItsWay {...props} />}

        {/*
          Auto-selecting the newest invite means a second pending invite would
          otherwise be unreachable from the mode switcher, so offer it here.
        */}
        {step === 0 && otherPending.length > 0 && (
          <div className="mt-6 border-t border-line pt-4 text-center">
            <p className="text-[12px] text-ink-muted">
              {otherPending.length === 1
                ? 'Another invitation is waiting'
                : `${otherPending.length} other invitations are waiting`}
            </p>
            <div className="mt-2 flex flex-wrap justify-center gap-2">
              {otherPending.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() =>
                    dispatch({ type: 'ONBOARDING_START', memberId: m.id })
                  }
                  className="tap rounded-full border border-line bg-white px-3 py-1.5 text-[12.5px] font-semibold text-accent shadow-card hover:bg-accent-soft/50"
                >
                  Open {firstName(m.name)}’s invite
                </button>
              ))}
            </div>
          </div>
        )}
      </ScreenBody>
    </>
  )
}
