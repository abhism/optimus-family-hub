import {
  ArrowDownLeft,
  ArrowUpRight,
  ChevronRight,
  Plus,
  Search,
  Users,
} from 'lucide-react'
import { useActions } from '../../store/StoreContext'
import { CardArt } from '../../components/CardArt'
import { TransactionRow } from '../../components/TransactionRow'
import {
  AppBar,
  Divider,
  ScreenBody,
  SectionLabel,
  Surface,
} from '../../components/ui/Layout'
import { Avatar, Badge, MoneyDisplay } from '../../components/ui/Primitives'
import { NotificationBanners } from './NotificationBanner'
import { money } from '../../lib/format'

/** 1.1 Account home. */
export function AccountHome() {
  const { state, push } = useActions()

  const own = state.transactions.filter((t) => t.cardId === 'user').slice(0, 5)

  const cardholders = state.members.filter(
    (m) => m.status === 'active' || m.status === 'frozen',
  )
  const pending = state.members.filter((m) => m.status === 'pending')
  const familySpend = state.members
    .filter((m) => m.status !== 'removed')
    .reduce((sum, m) => sum + m.periodSpend, 0)

  return (
    <>
      <AppBar
        border={false}
        right={
          <div className="flex items-center gap-1">
            <button
              type="button"
              aria-label="Search"
              className="tap grid h-9 w-9 place-items-center rounded-full text-ink hover:bg-neutral-200/60"
            >
              <Search className="h-4.5 w-4.5" />
            </button>
            <Avatar name={state.account.holder} size="sm" />
          </div>
        }
      />

      <ScreenBody className="pt-1">
        <div className="mb-5">
          <h1 className="text-[13px] text-ink-muted">
            Good morning, {state.account.firstName}
          </h1>
          <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.09em] text-ink-faint">
            Available balance
          </p>
          <MoneyDisplay value={state.account.balance} size="xl" className="mt-1.5" />
          <p className="mt-2 text-[12.5px] text-ink-muted">
            {state.account.card.label} ···· {state.account.card.last4}
          </p>
        </div>

        <div className="mb-5 grid grid-cols-2 gap-2.5">
          <QuickAction icon={<ArrowUpRight className="h-4 w-4" />} label="Send" />
          <QuickAction icon={<ArrowDownLeft className="h-4 w-4" />} label="Request" />
        </div>

        <div className="mb-5">
          <NotificationBanners />
        </div>

        <div className="mb-6">
          <SectionLabel>Your card</SectionLabel>
          <CardArt
            holderName={state.account.holder}
            last4={state.account.card.last4}
            expiry={state.account.card.expiry}
            skin="user"
            label="Optimus Checking"
            size="sm"
          />
        </div>

        {/* Family Hub entry point — a first-class module, not a settings row. */}
        <div className="mb-6">
          <SectionLabel>Family</SectionLabel>
          <Surface className="overflow-hidden">
            <button
              type="button"
              onClick={() => push({ name: 'family-hub' })}
              className="tap w-full px-4 py-4 text-left hover:bg-neutral-50"
            >
              <div className="flex items-start gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-accent to-violet-600 text-white">
                  <Users className="h-4.5 w-4.5" aria-hidden />
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-[15px] font-semibold">Family Hub</h3>
                    {pending.length > 0 && (
                      <Badge tone="warn">{pending.length} pending</Badge>
                    )}
                  </div>
                  <p className="mt-0.5 text-[12.5px] leading-relaxed text-ink-muted">
                    {cardholders.length === 0
                      ? 'Give a family member a card on your account'
                      : `${cardholders.length} add-on ${
                          cardholders.length === 1 ? 'card' : 'cards'
                        } · ${money(familySpend)} spent this period`}
                  </p>
                </div>

                <ChevronRight
                  className="mt-2 h-4 w-4 shrink-0 text-ink-faint"
                  aria-hidden
                />
              </div>

              {cardholders.length > 0 && (
                <div className="mt-3.5 flex items-center gap-2 border-t border-line pt-3.5">
                  <div className="flex -space-x-2">
                    {cardholders.map((m) => (
                      <span
                        key={m.id}
                        className="rounded-full ring-2 ring-white"
                        title={m.name}
                      >
                        <Avatar
                          name={m.name}
                          size="sm"
                          tone={m.relationship === 'child' ? 'child' : 'accent'}
                        />
                      </span>
                    ))}
                  </div>
                  <span className="text-[12px] text-ink-muted">
                    {cardholders.map((m) => m.name.split(' ')[0]).join(', ')}
                  </span>
                </div>
              )}
            </button>

            {cardholders.length === 0 && (
              <>
                <Divider />
                <button
                  type="button"
                  onClick={() => push({ name: 'add-member' })}
                  className="tap flex w-full items-center gap-2 px-4 py-3 text-[13.5px] font-semibold text-accent hover:bg-accent-soft/50"
                >
                  <Plus className="h-4 w-4" aria-hidden />
                  Add a family member
                </button>
              </>
            )}
          </Surface>
        </div>

        <div>
          <SectionLabel>Recent transactions</SectionLabel>
          <Surface className="overflow-hidden">
            {own.map((t, i) => (
              <div key={t.id}>
                {i > 0 && <Divider />}
                <TransactionRow txn={t} />
              </div>
            ))}
          </Surface>
        </div>
      </ScreenBody>
    </>
  )
}

function QuickAction({
  icon,
  label,
}: {
  icon: React.ReactNode
  label: string
}) {
  return (
    <button
      type="button"
      className="tap flex items-center justify-center gap-2 rounded-xl border border-line bg-white py-3 text-[13.5px] font-semibold text-ink shadow-card hover:bg-neutral-50"
    >
      <span className="text-accent">{icon}</span>
      {label}
    </button>
  )
}
