import { AlertTriangle, Ban, ChevronRight, Snowflake, X } from 'lucide-react'
import { useActions } from '../../store/StoreContext'
import type { AppNotification } from '../../store/types'
import { cx, relativeDay, timeOfDay } from '../../lib/format'

const SKIN = {
  decline: {
    icon: Ban,
    wrap: 'border-red-100 bg-dangersoft',
    chip: 'bg-danger text-white',
    title: 'text-danger',
    body: 'text-red-900/80',
  },
  refresh_failed: {
    icon: AlertTriangle,
    wrap: 'border-amber-200/70 bg-warnsoft',
    chip: 'bg-warn text-white',
    title: 'text-warn',
    body: 'text-amber-900/80',
  },
  freeze: {
    icon: Snowflake,
    wrap: 'border-line bg-white',
    chip: 'bg-ink text-white',
    title: 'text-ink',
    body: 'text-ink-muted',
  },
} as const

type BannerKind = keyof typeof SKIN

const BANNER_KINDS: BannerKind[] = ['decline', 'refresh_failed', 'freeze']

/**
 * In-app alerts for the User.
 *
 * A decline banner is the entry point to the adjust-limit flow (spec 1.7).
 * Tapping it does not change anything — it opens an authentication gate first.
 */
export function NotificationBanners({ limit = 2 }: { limit?: number }) {
  const { state, push, dispatch } = useActions()

  const items = state.notifications
    .filter(
      (n) => !n.read && BANNER_KINDS.includes(n.kind as BannerKind),
    )
    .slice(0, limit)

  if (items.length === 0) return null

  return (
    <div className="space-y-2">
      {items.map((n) => (
        <Banner
          key={n.id}
          notification={n}
          onOpen={
            n.kind === 'decline'
              ? () => push({ name: 'decline-resolve', notificationId: n.id })
              : n.kind === 'refresh_failed' && n.memberId
                ? () => push({ name: 'spending-limit', memberId: n.memberId! })
                : n.memberId
                  ? () => push({ name: 'member-detail', memberId: n.memberId! })
                  : undefined
          }
          onDismiss={() => dispatch({ type: 'READ_NOTIFICATION', id: n.id })}
        />
      ))}
    </div>
  )
}

function Banner({
  notification: n,
  onOpen,
  onDismiss,
}: {
  notification: AppNotification
  onOpen?: () => void
  onDismiss: () => void
}) {
  const skin = SKIN[n.kind as BannerKind] ?? SKIN.freeze
  const Icon = skin.icon

  return (
    <div
      className={cx(
        'animate-fade-up overflow-hidden rounded-2xl border shadow-card',
        skin.wrap,
      )}
    >
      <div className="flex items-start gap-3 p-3.5">
        <span
          className={cx('grid h-8 w-8 shrink-0 place-items-center rounded-xl', skin.chip)}
        >
          <Icon className="h-4 w-4" aria-hidden />
        </span>

        <div className="min-w-0 flex-1">
          <p className={cx('text-[13.5px] font-semibold leading-snug', skin.title)}>
            {n.title}
          </p>
          <p className={cx('mt-1 text-[12.5px] leading-relaxed', skin.body)}>
            {n.body}
          </p>
          <p className="mt-1.5 text-[11px] text-ink-faint">
            {relativeDay(n.at)} · {timeOfDay(n.at)}
          </p>

          {onOpen && (
            <button
              type="button"
              onClick={onOpen}
              className={cx(
                'tap mt-2.5 inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[12.5px] font-semibold',
                n.kind === 'decline'
                  ? 'bg-danger text-white'
                  : 'bg-white text-ink shadow-sm',
              )}
            >
              {n.kind === 'decline' ? 'Review and adjust' : 'Open'}
              <ChevronRight className="h-3.5 w-3.5" aria-hidden />
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss alert"
          className="tap -mr-1 -mt-1 grid h-7 w-7 shrink-0 place-items-center rounded-full text-ink-faint hover:bg-black/5"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}
