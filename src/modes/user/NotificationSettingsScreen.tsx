import {
  Ban,
  CreditCard,
  Lock,
  ShieldCheck,
  Snowflake,
  TriangleAlert,
} from 'lucide-react'
import { useActions } from '../../store/StoreContext'
import {
  AppBar,
  Divider,
  ScreenBody,
  SectionLabel,
  Surface,
} from '../../components/ui/Layout'
import { Toggle } from '../../components/ui/Toggle'
import { Field, Segmented } from '../../components/ui/Field'
import { MANDATORY_ALERTS_NOTE } from '../../lib/copy'

/** 1.6 Notification settings, per Member card. */
export function NotificationSettingsScreen({
  memberId,
}: {
  memberId: string
}) {
  const { state, pop, dispatch } = useActions()
  const member = state.members.find((m) => m.id === memberId)!
  const first = member.name.split(' ')[0]!

  const prefs = member.notifications

  return (
    <>
      <AppBar
        title="Notifications"
        subtitle={`${first} · card ···· ${member.card.last4}`}
        onBack={pop}
      />

      <ScreenBody>
        <div className="mb-6">
          <SectionLabel>Routine spending</SectionLabel>
          <Surface className="px-4">
            <Toggle
              label="Spend alerts"
              description={`Tell me when ${first} makes a purchase on this card.`}
              checked={prefs.spendAlerts}
              onChange={(v) =>
                dispatch({
                  type: 'SET_NOTIF_PREFS',
                  id: member.id,
                  patch: { spendAlerts: v },
                })
              }
            />
          </Surface>

          {prefs.spendAlerts && (
            <Surface className="mt-3 p-4">
              <Field
                label="How you get them"
                hint={
                  prefs.delivery === 'immediate'
                    ? 'A push notification for each purchase, as it happens.'
                    : 'One notification each evening covering the day’s purchases.'
                }
              >
                <Segmented
                  label="Spend alert delivery"
                  value={prefs.delivery}
                  onChange={(v) =>
                    dispatch({
                      type: 'SET_NOTIF_PREFS',
                      id: member.id,
                      patch: { delivery: v },
                    })
                  }
                  options={[
                    { value: 'immediate', label: 'Immediate' },
                    { value: 'daily', label: 'Daily summary' },
                  ]}
                />
              </Field>
            </Surface>
          )}
        </div>

        {/* Mandatory group — on, and not toggleable. */}
        <div className="mb-4">
          <SectionLabel>Always on</SectionLabel>
          <Surface className="overflow-hidden">
            <MandatoryRow
              icon={<Ban className="h-4 w-4" />}
              title="Declined transactions"
              body="Including which rule blocked it, so you can act on it."
            />
            <Divider />
            <MandatoryRow
              icon={<ShieldCheck className="h-4 w-4" />}
              title="Security alerts"
              body="Suspected fraud, unusual activity and login attempts."
            />
            <Divider />
            <MandatoryRow
              icon={<Snowflake className="h-4 w-4" />}
              title="Freeze events"
              body={`When you or ${first} freezes or unfreezes this card.`}
            />
            <Divider />
            <MandatoryRow
              icon={<CreditCard className="h-4 w-4" />}
              title="Card replacements"
              body="Lost or stolen reports, and cards reissued to a new number."
            />
          </Surface>

          <div className="mt-3 flex items-start gap-2 rounded-xl bg-neutral-100 px-3.5 py-3">
            <TriangleAlert
              className="mt-[1px] h-3.5 w-3.5 shrink-0 text-ink-muted"
              aria-hidden
            />
            <p className="text-[12px] leading-relaxed text-ink-soft">
              {MANDATORY_ALERTS_NOTE}
            </p>
          </div>
        </div>
      </ScreenBody>
    </>
  )
}

function MandatoryRow({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode
  title: string
  body: string
}) {
  return (
    <div className="flex items-start gap-3 px-4 py-3.5">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-neutral-100 text-ink-soft">
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-1.5 text-[14px] font-medium">
          {title}
          <Lock className="h-3 w-3 text-ink-faint" aria-hidden />
        </p>
        <p className="mt-0.5 text-[12.5px] leading-relaxed text-ink-muted">
          {body}
        </p>
      </div>
      <span className="mt-1 shrink-0 text-[11px] font-bold uppercase tracking-wide text-ink-faint">
        On
      </span>
    </div>
  )
}
