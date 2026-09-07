import type { Member } from '../../store/types'

export interface StepProps {
  member: Member
  userName: string
  userFirstName: string
  next: () => void
  patchMember: (patch: Partial<Member>) => void
}

/**
 * Tone differs by relationship: the child variant is warmer and simpler, and
 * never asks the child to accept legal terms in their parent's place.
 */
export const voiceFor = (member: Member) =>
  member.relationship === 'child' ? 'child' : 'adult'

export const ONBOARDING_STEPS = [
  'Invitation',
  'What this is',
  'Your details',
  'Terms',
  'Passcode',
  'Your card',
  'Wallet',
  'PIN',
  'In the post',
] as const

export const TOTAL_STEPS = ONBOARDING_STEPS.length
