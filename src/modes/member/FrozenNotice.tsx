import { Snowflake } from 'lucide-react'
import { useActions } from '../../store/StoreContext'
import { Button } from '../../components/ui/Button'
import { canUnfreeze, unfreezeBlockedReason } from '../../store/policy'
import { firstName } from '../../lib/format'
import type { Member } from '../../store/types'

/**
 * Frozen-card notice for the Member's own app.
 *
 * Rule 6 lives here: a Member may lift their own self-freeze, but never a
 * freeze the User applied — and never at all on a child card. When they can't,
 * the screen says who can.
 */
export function FrozenNotice({ member }: { member: Member }) {
  const { state, unfreeze } = useActions()
  if (member.status !== 'frozen') return null

  const user = firstName(state.account.holder)
  const allowed = canUnfreeze(member, 'member')
  const blockedReason = unfreezeBlockedReason(member, user)

  return (
    <div className="mb-5 rounded-2xl border border-line bg-white p-4 shadow-card">
      <div className="flex items-start gap-3">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-ink text-white">
          <Snowflake className="h-4 w-4" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-[14px] font-semibold">
            {member.freezeSource === 'member'
              ? 'You froze this card'
              : `${user} froze this card`}
          </h2>
          <p className="mt-1 text-[12.5px] leading-relaxed text-ink-muted">
            {member.freezeSource === 'member'
              ? 'No new purchases will go through until you unfreeze it.'
              : `No new purchases will go through. ${blockedReason ?? ''}`}
          </p>

          {allowed ? (
            <Button
              size="sm"
              className="mt-3"
              onClick={() => unfreeze(member.id, 'member')}
            >
              Unfreeze my card
            </Button>
          ) : (
            <p className="mt-2.5 rounded-lg bg-neutral-100 px-3 py-2 text-[12px] leading-relaxed text-ink-soft">
              {blockedReason}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
