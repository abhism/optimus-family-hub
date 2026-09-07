import type { FreezeSource, Member, Screen, Mode, AppState } from './types'

/**
 * Product policy that is not about a single authorization decision.
 *
 * Kept separate from engine.ts so the rules a reviewer will check — who may
 * lift a freeze, what a User may set on a spouse, what bounds a limit change
 * must respect — are readable in one place.
 */

/** Bounds a User must stay inside when setting or adjusting a child's limits. */
export const LIMIT_BOUNDS = {
  monthly: { min: 20, max: 1000, step: 10 },
  perTransaction: { min: 10, max: 250, step: 5 },
  oneOff: { min: 10, max: 500, step: 10 },
} as const

/**
 * Rule 4: a User cannot set a spending limit on a spouse. Spouse controls are
 * rendered but locked, and this is the function that says so.
 */
export const userMaySetLimits = (member: Member) => member.relationship === 'child'

export const userMaySetControls = (member: Member) => member.relationship === 'child'

/**
 * Rule 6: a Member cannot unfreeze a freeze they did not apply.
 *
 * - A Member may lift their own self-freeze — but never on a child card.
 * - Only the User may lift a User-applied freeze.
 * - Child cards: only the User can unfreeze, ever.
 */
export function canUnfreeze(member: Member, actor: 'user' | 'member'): boolean {
  if (member.status !== 'frozen') return false
  if (actor === 'user') return true
  if (member.relationship === 'child') return false
  return member.freezeSource === 'member'
}

/** Explains a refused unfreeze to the Member, in their own terms. */
export function unfreezeBlockedReason(
  member: Member,
  userName: string,
): string | null {
  if (member.status !== 'frozen') return null
  if (member.relationship === 'child') {
    return `Only ${userName} can unfreeze this card.`
  }
  if (member.freezeSource === 'user') {
    return `${userName} froze this card, so only ${userName} can unfreeze it.`
  }
  return null
}

/** Rule 10: parent is visible in the picker but never issuable. */
export const RELATIONSHIP_OPTIONS = [
  {
    value: 'spouse' as const,
    label: 'Spouse or partner',
    blurb: 'An adult who shares your account. Minimal restrictions by design.',
    enabled: true,
  },
  {
    value: 'child' as const,
    label: 'Child',
    blurb: 'Aged 8 or over. You set the spending limit and card controls.',
    enabled: true,
  },
  {
    value: 'parent' as const,
    label: 'Parent',
    blurb: 'Support a parent with a card on your account.',
    enabled: false,
  },
]

export const MIN_CHILD_AGE = 8

/** A spouse Member may end their own card access; a child may only request it. */
export const memberMaySelfTerminate = (member: Member) =>
  member.relationship === 'spouse'

export const isFrozenByUser = (member: Member) =>
  member.status === 'frozen' && member.freezeSource === 'user'

export const activeMembers = (state: AppState) =>
  state.members.filter((m) => m.status !== 'removed')

export const familyHubCardMembers = (state: AppState) =>
  state.members.filter((m) => m.status === 'active' || m.status === 'frozen')

export const memberById = (state: AppState, id: string | null | undefined) =>
  id ? state.members.find((m) => m.id === id) ?? null : null

export const findMemberByRelationship = (
  state: AppState,
  relationship: 'spouse' | 'child',
) =>
  state.members.find(
    (m) => m.relationship === relationship && m.status !== 'removed',
  ) ?? null

export const pendingMembers = (state: AppState) =>
  state.members.filter((m) => m.status === 'pending')

/** Root screen for a mode, chosen from current state. */
export function rootScreen(mode: Mode, state: AppState): Screen {
  switch (mode) {
    case 'user':
      return { name: 'account-home' }
    case 'onboarding':
      return state.onboarding.memberId
        ? { name: 'onboarding' }
        : { name: 'invite-picker' }
    case 'member-spouse': {
      const spouse = findMemberByRelationship(state, 'spouse')
      return spouse && spouse.status !== 'pending'
        ? { name: 'm-home' }
        : { name: 'm-invite-pending' }
    }
    case 'member-child': {
      const child = findMemberByRelationship(state, 'child')
      return child && child.status !== 'pending'
        ? { name: 'm-home' }
        : { name: 'm-invite-pending' }
    }
    default:
      return { name: 'account-home' }
  }
}

/** The Member whose app is being viewed in Mode 3. */
export function viewingMember(state: AppState): Member | null {
  if (state.mode === 'member-spouse') {
    return findMemberByRelationship(state, 'spouse')
  }
  if (state.mode === 'member-child') {
    return findMemberByRelationship(state, 'child')
  }
  return null
}

export const freezeLabel = (source: FreezeSource | null, userName: string) =>
  source === 'user' ? `Frozen by ${userName}` : 'Frozen by you'

/**
 * Available funds in the User's account.
 *
 * Member-facing components read funds through this selector rather than
 * touching `state.account.balance`, so accountholder vocabulary never enters
 * those files — which is what makes scripts/audit-copy.mjs a plain grep
 * rather than a fragile parse.
 */
export const availableFunds = (state: AppState) => state.account.balance
