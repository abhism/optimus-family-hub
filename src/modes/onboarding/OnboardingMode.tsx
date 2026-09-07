import { useStore } from '../../store/StoreContext'
import { InvitePicker } from './InvitePicker'
import { OnboardingFlow } from './OnboardingFlow'

/** Mode 2 — invitation and onboarding. */
export function OnboardingMode() {
  const { state } = useStore()
  const screen = state.stack[state.stack.length - 1] ?? { name: 'invite-picker' }

  const target = state.members.find((m) => m.id === state.onboarding.memberId)

  if (screen.name === 'onboarding' && target) {
    return <OnboardingFlow memberId={target.id} />
  }

  return <InvitePicker />
}
