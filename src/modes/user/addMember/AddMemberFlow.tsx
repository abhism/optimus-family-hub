import { useState } from 'react'
import { useActions } from '../../../store/StoreContext'
import { AppBar, ScreenBody, ScreenFooter } from '../../../components/ui/Layout'
import { ProgressDots } from '../../../components/ui/Layout'
import { Button } from '../../../components/ui/Button'
import { MIN_CHILD_AGE } from '../../../store/policy'
import { ageFromDob, endOfMonth, uid } from '../../../lib/format'
import type { ConsentRecord, Member } from '../../../store/types'
import {
  emptyDraft,
  generateCard,
  spouseDefaults,
  STEP_TITLES,
  type MemberDraft,
} from './draft'
import { StepRelationship } from './StepRelationship'
import { StepDetails } from './StepDetails'
import { StepCardSetup } from './StepCardSetup'
import { StepReview } from './StepReview'
import { StepInvitationSent } from './StepInvitationSent'

/**
 * 1.3 Add Member — five steps, one decision per screen, with a progress
 * indicator and back navigation throughout.
 */
export function AddMemberFlow() {
  const { state, pop, reset, dispatch } = useActions()

  const [step, setStep] = useState(0)
  const [draft, setDraft] = useState<MemberDraft>(emptyDraft)
  const [createdId, setCreatedId] = useState<string | null>(null)

  const patch = (p: Partial<MemberDraft>) => setDraft((d) => ({ ...d, ...p }))

  const age = ageFromDob(draft.dob)
  const isChild = draft.relationship === 'child'

  const dobError =
    draft.dob && isChild && age !== null && age < MIN_CHILD_AGE
      ? `A child must be at least ${MIN_CHILD_AGE} to hold an add-on card. Based on this date of birth, ${
          draft.name.split(' ')[0] || 'they'
        } ${age < 0 ? 'is not born yet' : `is ${age}`}.`
      : null

  const canContinue = (() => {
    switch (step) {
      case 0:
        return draft.relationship !== null
      case 1:
        return (
          draft.name.trim().length > 1 &&
          draft.dob.length > 0 &&
          draft.address.trim().length > 4 &&
          !dobError
        )
      case 2:
        return true
      case 3:
        return isChild ? draft.parentalConsent : true
      default:
        return true
    }
  })()

  const sendInvitation = () => {
    const now = new Date().toISOString()
    const card = generateCard()
    const id = uid('mem')

    const member: Member = {
      id,
      name: draft.name.trim(),
      relationship: draft.relationship!,
      dob: draft.dob,
      address: draft.address.trim(),
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
      monthlyLimit: isChild ? draft.monthlyLimit : null,
      periodSpend: 0,
      periodStart: now,
      periodEnd: endOfMonth(now),
      refresh: {
        cadence: isChild ? 'monthly' : 'none',
        nextAt: isChild ? endOfMonth(now) : null,
      },
      controls: isChild ? draft.controls : spouseDefaults(),
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

    if (isChild && draft.parentalConsentAt) {
      consents.push({
        id: uid('con'),
        memberId: id,
        type: 'parental_consent',
        actor: state.account.holder,
        at: draft.parentalConsentAt,
      })
    }

    if (!isChild) {
      consents.push({
        id: uid('con'),
        memberId: id,
        type: 'reciprocal_visibility_ack',
        actor: state.account.holder,
        at: now,
      })
    }

    dispatch({ type: 'ADD_MEMBER', member, consents })
    setCreatedId(id)
    setStep(4)
  }

  // Final confirmation screen owns its own chrome.
  if (step === 4 && createdId) {
    return (
      <StepInvitationSent
        memberId={createdId}
        onDone={() => reset({ name: 'family-hub' })}
        onOpenInvite={() => {
          dispatch({ type: 'ONBOARDING_START', memberId: createdId })
        }}
        onViewMember={() =>
          reset({ name: 'member-detail', memberId: createdId })
        }
      />
    )
  }

  return (
    <>
      <AppBar
        title="Add a family member"
        subtitle={STEP_TITLES[step]}
        onBack={step === 0 ? pop : () => setStep((s) => s - 1)}
        right={<ProgressDots total={4} index={step} label="Add member progress" />}
      />

      <ScreenBody>
        {step === 0 && (
          <StepRelationship
            value={draft.relationship}
            onChange={(relationship) => {
              patch({
                relationship,
                controls:
                  relationship === 'spouse'
                    ? spouseDefaults()
                    : emptyDraft().controls,
              })
              setStep(1)
            }}
          />
        )}

        {step === 1 && (
          <StepDetails
            draft={draft}
            patch={patch}
            dobError={dobError}
            age={age}
          />
        )}

        {step === 2 && <StepCardSetup draft={draft} patch={patch} />}

        {step === 3 && <StepReview draft={draft} patch={patch} />}
      </ScreenBody>

      {step > 0 && (
        <ScreenFooter>
          <Button
            full
            disabled={!canContinue}
            onClick={() => (step === 3 ? sendInvitation() : setStep((s) => s + 1))}
          >
            {step === 3
              ? `Send invitation to ${draft.name.split(' ')[0] || 'them'}`
              : 'Continue'}
          </Button>
          {step === 1 && dobError && (
            <p className="mt-2 text-center text-[11.5px] text-ink-faint">
              Correct the date of birth to continue
            </p>
          )}
        </ScreenFooter>
      )}
    </>
  )
}
