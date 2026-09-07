import { CreditCard, Home, ListChecks, Receipt } from 'lucide-react'
import { useActions, useStore } from '../../store/StoreContext'
import { viewingMember } from '../../store/policy'
import type { Screen } from '../../store/types'
import { cx } from '../../lib/format'
import { MemberGate } from './MemberGate'
import { SpouseHome } from './spouse/SpouseHome'
import { SharedActivity } from './spouse/SharedActivity'
import { EndCardAccess } from './spouse/EndCardAccess'
import { ChildHome } from './child/ChildHome'
import { CardRules } from './child/CardRules'
import { DeclinedScreen } from './child/DeclinedScreen'
import { RequestRemoval } from './child/RequestRemoval'
import { MemberCardSettings } from './MemberCardSettings'
import { ChangePin } from './ChangePin'
import { ReportLost } from './ReportLost'

/** Mode 3 router — one app, two relationship variants. */
export function MemberApp() {
  const { state } = useStore()
  const member = viewingMember(state)
  const screen: Screen =
    state.stack[state.stack.length - 1] ?? { name: 'm-home' }

  if (!member || member.status === 'pending') {
    return <MemberGate />
  }

  const isChild = member.relationship === 'child'

  const body = (() => {
    switch (screen.name) {
      case 'm-home':
        return isChild ? <ChildHome member={member} /> : <SpouseHome member={member} />
      case 'm-shared-activity':
        return <SharedActivity member={member} />
      case 'm-card-rules':
        return <CardRules member={member} />
      case 'm-declined':
        return (
          <DeclinedScreen member={member} transactionId={screen.transactionId} />
        )
      case 'm-settings':
        return <MemberCardSettings member={member} />
      case 'm-change-pin':
        return <ChangePin member={member} />
      case 'm-report-lost':
        return <ReportLost member={member} />
      case 'm-end-access':
        return <EndCardAccess member={member} />
      case 'm-request-removal':
        return <RequestRemoval member={member} />
      default:
        return isChild ? <ChildHome member={member} /> : <SpouseHome member={member} />
    }
  })()

  const rootScreens: Screen['name'][] = [
    'm-home',
    'm-shared-activity',
    'm-card-rules',
    'm-settings',
  ]
  const showTabs = rootScreens.includes(screen.name)

  return (
    <>
      <div
        key={`${screen.name}-${state.stack.length}`}
        className="flex min-h-0 flex-1 flex-col animate-slide-in-right"
      >
        {body}
      </div>
      {showTabs && <MemberTabBar active={screen.name} isChild={isChild} />}
    </>
  )
}

function MemberTabBar({
  active,
  isChild,
}: {
  active: Screen['name']
  isChild: boolean
}) {
  const { reset } = useActions()

  const tabs: { screen: Screen; label: string; icon: typeof Home }[] = [
    { screen: { name: 'm-home' }, label: 'Card', icon: Home },
    isChild
      ? { screen: { name: 'm-card-rules' }, label: 'My rules', icon: ListChecks }
      : { screen: { name: 'm-shared-activity' }, label: 'Shared', icon: Receipt },
    { screen: { name: 'm-settings' }, label: 'Settings', icon: CreditCard },
  ]

  return (
    <nav
      className="shrink-0 border-t border-line bg-paper/95 backdrop-blur-md"
      aria-label="Main"
    >
      <ul className="flex items-stretch">
        {tabs.map((t) => {
          const Icon = t.icon
          const on = t.screen.name === active
          return (
            <li key={t.screen.name} className="flex-1">
              <button
                type="button"
                onClick={() => reset(t.screen)}
                aria-current={on ? 'page' : undefined}
                className={cx(
                  'tap flex w-full flex-col items-center gap-1 py-2.5 text-[10.5px] font-semibold',
                  on ? 'text-accent' : 'text-ink-faint hover:text-ink-muted',
                )}
              >
                <Icon className="h-[18px] w-[18px]" aria-hidden />
                {t.label}
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
