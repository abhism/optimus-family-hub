import { useStore } from '../../store/StoreContext'
import { AccountHome } from './AccountHome'
import { FamilyHubHome } from './FamilyHubHome'
import { AddMemberFlow } from './addMember/AddMemberFlow'
import { MemberDetail } from './MemberDetail'
import { SpendingLimitScreen } from './SpendingLimitScreen'
import { ControlsScreen } from './ControlsScreen'
import { NotificationSettingsScreen } from './NotificationSettingsScreen'
import { RemoveMemberScreen } from './RemoveMemberScreen'
import { DeclineResolveFlow } from './DeclineResolveFlow'

/** Mode 1 router. Navigation is driven by the shared store's screen stack. */
export function UserApp() {
  const { state } = useStore()
  const screen = state.stack[state.stack.length - 1] ?? { name: 'account-home' }
  const depth = state.stack.length

  return (
    <div
      key={`${screen.name}-${depth}`}
      className="flex min-h-0 flex-1 flex-col animate-slide-in-right"
    >
      {(() => {
        switch (screen.name) {
          case 'account-home':
            return <AccountHome />
          case 'family-hub':
            return <FamilyHubHome />
          case 'add-member':
            return <AddMemberFlow />
          case 'member-detail':
            return <MemberDetail memberId={screen.memberId} />
          case 'spending-limit':
            return <SpendingLimitScreen memberId={screen.memberId} />
          case 'controls':
            return <ControlsScreen memberId={screen.memberId} />
          case 'notification-settings':
            return <NotificationSettingsScreen memberId={screen.memberId} />
          case 'remove-member':
            return <RemoveMemberScreen memberId={screen.memberId} />
          case 'decline-resolve':
            return <DeclineResolveFlow notificationId={screen.notificationId} />
          default:
            return <AccountHome />
        }
      })()}
    </div>
  )
}
