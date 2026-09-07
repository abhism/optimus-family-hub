import { PhoneFrame } from './components/PhoneFrame'
import { ModeSwitcher } from './components/ModeSwitcher'
import { DevDock } from './modes/DevDock'
import { ModeSelector } from './modes/ModeSelector'
import { OnboardingMode } from './modes/onboarding/OnboardingMode'
import { UserApp } from './modes/user/UserApp'
import { MemberApp } from './modes/member/MemberApp'
import { useStore } from './store/StoreContext'
import type { Mode } from './store/types'

export default function App() {
  const { state } = useStore()

  if (state.mode === 'select') {
    return (
      <>
        <ModeSelector />
        <DevDock />
      </>
    )
  }

  return (
    <>
      <main className="flex min-h-full flex-col items-center justify-center bg-neutral-100 px-6 py-8">
        <ModeSwitcher current={state.mode} />
        <PhoneFrame>
          <ModeScreens mode={state.mode} />
        </PhoneFrame>
      </main>
      <DevDock />
    </>
  )
}

function ModeScreens({ mode }: { mode: Exclude<Mode, 'select'> }) {
  switch (mode) {
    case 'user':
      return <UserApp />
    case 'onboarding':
      return <OnboardingMode />
    case 'member-spouse':
    case 'member-child':
      return <MemberApp />
  }
}
