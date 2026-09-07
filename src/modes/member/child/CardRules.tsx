import {
  Check,
  Globe,
  Landmark,
  Repeat,
  ShieldBan,
  ShoppingCart,
  Sun,
  X,
} from 'lucide-react'
import { useActions } from '../../../store/StoreContext'
import { FundsDisclosure } from '../../../components/Disclosure'
import {
  AppBar,
  Divider,
  ScreenBody,
  SectionLabel,
  Surface,
} from '../../../components/ui/Layout'
import { POLICY_CATEGORY_LABEL } from '../../../lib/copy'
import { firstName, longDate, money } from '../../../lib/format'
import type { Member } from '../../../store/types'

/**
 * 3.2 Your card rules — read-only, and written plainly rather than punitively.
 *
 * This screen is the Member's side of rule 5: everything the User set is
 * visible here, in the same terms.
 */
export function CardRules({ member }: { member: Member }) {
  const { state } = useActions()
  const user = firstName(state.account.holder)
  const c = member.controls

  return (
    <>
      <AppBar title="Your card rules" subtitle={`Set by ${user}`} />

      <ScreenBody>
        <p className="mb-5 text-[13.5px] leading-relaxed text-ink-muted">
          Here’s exactly how your card is set up. You can’t change these
          yourself — but nothing here is hidden from you.
        </p>

        <div className="mb-5">
          <SectionLabel>How much you can spend</SectionLabel>
          <Surface className="overflow-hidden">
            <RuleRow
              icon={<Repeat className="h-4 w-4" />}
              label="Card spending limit"
              value={
                member.monthlyLimit === null
                  ? 'No limit'
                  : `${money(member.monthlyLimit)} a month`
              }
              note={
                member.monthlyLimit === null
                  ? undefined
                  : `You’ve used ${money(member.periodSpend)} of it so far. It refreshes on ${longDate(member.periodEnd)}.`
              }
            />
            <Divider />
            <RuleRow
              icon={<Sun className="h-4 w-4" />}
              label="Most you can spend at once"
              value={
                c.perTransactionCap === null
                  ? 'No cap'
                  : money(c.perTransactionCap)
              }
              note={
                c.perTransactionCap === null
                  ? undefined
                  : `A single purchase over ${money(
                      c.perTransactionCap,
                    )} will be declined, even if you have limit left.`
              }
            />
          </Surface>
          <FundsDisclosure className="mt-2.5 px-1" />
        </div>

        <div className="mb-5">
          <SectionLabel>Where your card works</SectionLabel>
          <Surface className="overflow-hidden">
            <OnOffRow
              icon={<ShoppingCart className="h-4 w-4" />}
              label="Buying online"
              on={c.onlinePurchases}
              onNote="You can use your card on websites and in apps."
              offNote="Your card won’t work on websites or in apps."
            />
            <Divider />
            <OnOffRow
              icon={<Landmark className="h-4 w-4" />}
              label="Cash from an ATM"
              on={c.atmWithdrawals}
              onNote="You can take out cash using your PIN."
              offNote="Your card can’t be used to take out cash."
            />
            <Divider />
            <OnOffRow
              icon={<Globe className="h-4 w-4" />}
              label="Paying abroad"
              on={c.internationalUse}
              onNote="Your card works outside the United States."
              offNote="Your card only works inside the United States."
            />
          </Surface>
        </div>

        <div className="mb-5">
          <SectionLabel>Blocked categories</SectionLabel>
          <Surface className="overflow-hidden">
            <OnOffRow
              icon={<ShieldBan className="h-4 w-4" />}
              label={POLICY_CATEGORY_LABEL}
              on={!c.blockGamblingAdult}
              onNote="Not blocked on your card."
              offNote="Optimus blocks these on every card for someone under 18."
            />
          </Surface>
        </div>

        <Surface className="p-4">
          <h2 className="text-[13.5px] font-semibold">
            Want something changed?
          </h2>
          <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-muted">
            Talk to {user} about it. There’s no button here to send a request —
            {user} makes changes from their own app, and you’ll see the new
            settings on this screen straight away.
          </p>
        </Surface>
      </ScreenBody>
    </>
  )
}

function RuleRow({
  icon,
  label,
  value,
  note,
}: {
  icon: React.ReactNode
  label: string
  value: string
  note?: string
}) {
  return (
    <div className="flex items-start gap-3 px-4 py-3.5">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-neutral-100 text-ink-soft">
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-3">
          <p className="text-[13.5px] font-medium">{label}</p>
          <p className="numeral shrink-0 text-[13.5px] font-semibold">{value}</p>
        </div>
        {note && (
          <p className="mt-1 text-[12px] leading-relaxed text-ink-muted">
            {note}
          </p>
        )}
      </div>
    </div>
  )
}

function OnOffRow({
  icon,
  label,
  on,
  onNote,
  offNote,
}: {
  icon: React.ReactNode
  label: string
  on: boolean
  onNote: string
  offNote: string
}) {
  return (
    <div className="flex items-start gap-3 px-4 py-3.5">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-neutral-100 text-ink-soft">
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[13.5px] font-medium">{label}</p>
          <span
            className={
              on
                ? 'inline-flex shrink-0 items-center gap-1 rounded-full bg-teal-50 px-2 py-0.5 text-[11px] font-semibold text-positive'
                : 'inline-flex shrink-0 items-center gap-1 rounded-full bg-neutral-100 px-2 py-0.5 text-[11px] font-semibold text-ink-muted'
            }
          >
            {on ? (
              <Check className="h-2.5 w-2.5" aria-hidden />
            ) : (
              <X className="h-2.5 w-2.5" aria-hidden />
            )}
            {on ? 'Yes' : 'No'}
          </span>
        </div>
        <p className="mt-1 text-[12px] leading-relaxed text-ink-muted">
          {on ? onNote : offNote}
        </p>
      </div>
    </div>
  )
}
