import { Eye, FileText, Lock } from 'lucide-react'
import { Divider, SectionLabel, Surface } from '../../../components/ui/Layout'
import { Checkbox } from '../../../components/ui/Field'
import { Badge } from '../../../components/ui/Primitives'
import {
  CARDHOLDER_TERMS,
  POLICY_CATEGORY_LABEL,
  reciprocalVisibility,
} from '../../../lib/copy'
import { longDate, money, stamp } from '../../../lib/format'
import type { MemberDraft } from './draft'

/** Step 4 — review and consent. */
export function StepReview({
  draft,
  patch,
}: {
  draft: MemberDraft
  patch: (p: Partial<MemberDraft>) => void
}) {
  const isChild = draft.relationship === 'child'
  const first = draft.name.trim().split(/\s+/)[0] || 'they'

  return (
    <div className="animate-fade-up">
      <h1 className="text-[22px] font-semibold leading-snug tracking-[-0.02em]">
        Review and confirm
      </h1>
      <p className="mt-2 text-[13.5px] leading-relaxed text-ink-muted">
        Check this over before the invitation goes out.
      </p>

      {/* summary */}
      <div className="mt-5">
        <SectionLabel>The card</SectionLabel>
        <Surface className="overflow-hidden">
          <Row label="Cardholder" value={draft.name.trim() || '—'} />
          <Divider />
          <Row
            label="Relationship"
            value={isChild ? 'Child' : 'Spouse or partner'}
          />
          <Divider />
          <Row
            label="Date of birth"
            value={draft.dob ? longDate(draft.dob) : '—'}
          />
          <Divider />
          <Row
            label="Card spending limit"
            value={
              isChild
                ? `${money(draft.monthlyLimit, { cents: false })} per month`
                : 'None set'
            }
          />
          {isChild && (
            <>
              <Divider />
              <Row
                label="Per-transaction cap"
                value={
                  draft.controls.perTransactionCap === null
                    ? 'None'
                    : money(draft.controls.perTransactionCap, { cents: false })
                }
              />
              <Divider />
              <Row
                label={POLICY_CATEGORY_LABEL}
                value={draft.controls.blockGamblingAdult ? 'Blocked' : 'Allowed'}
              />
            </>
          )}
          <Divider />
          <Row
            label="Online / ATM / International"
            value={[
              draft.controls.onlinePurchases ? 'On' : 'Off',
              draft.controls.atmWithdrawals ? 'On' : 'Off',
              draft.controls.internationalUse ? 'On' : 'Off',
            ].join(' · ')}
          />
        </Surface>
      </div>

      {/* terms summary */}
      <div className="mt-5">
        <SectionLabel>Cardholder terms — summary</SectionLabel>
        <Surface className="p-4">
          <div className="mb-3 flex items-center gap-2">
            <FileText className="h-4 w-4 text-accent" aria-hidden />
            <p className="text-[13px] font-semibold">
              What {first} is agreeing to
            </p>
          </div>
          <ul className="thin-scrollbar max-h-52 space-y-3 overflow-y-auto pr-1">
            {CARDHOLDER_TERMS.map((t) => (
              <li key={t.heading}>
                <p className="text-[12.5px] font-semibold text-ink">
                  {t.heading}
                </p>
                <p className="mt-0.5 text-[12px] leading-relaxed text-ink-muted">
                  {t.body}
                </p>
              </li>
            ))}
          </ul>
        </Surface>
      </div>

      {/* consent */}
      {isChild ? (
        <div className="mt-5">
          <SectionLabel>Parental consent</SectionLabel>
          <Surface className="p-4">
            <Checkbox
              id="parental-consent"
              checked={draft.parentalConsent}
              onChange={(next) =>
                patch({
                  parentalConsent: next,
                  parentalConsentAt: next ? new Date().toISOString() : null,
                })
              }
            >
              I am {first}’s parent or legal guardian, and I consent to Optimus
              issuing an add-on card in their name on my account. I accept the
              cardholder terms on their behalf and I am responsible for all
              purchases made on this card.
            </Checkbox>

            {draft.parentalConsentAt && (
              <div className="mt-3.5 flex items-center gap-2 rounded-xl bg-neutral-50 px-3 py-2.5">
                <Lock className="h-3.5 w-3.5 shrink-0 text-positive" aria-hidden />
                <p className="text-[11.5px] leading-relaxed text-ink-soft">
                  Consent recorded {stamp(draft.parentalConsentAt)}. This
                  timestamp is kept on your account records.
                </p>
              </div>
            )}
          </Surface>
          <p className="mt-2 px-1 text-[11.5px] leading-relaxed text-ink-faint">
            {first} will be shown a plain-language explanation when they set the
            card up. They won’t be asked to accept legal terms themselves.
          </p>
        </div>
      ) : (
        <div className="mt-5">
          <SectionLabel>Before you send it</SectionLabel>
          <Surface className="p-4" tone="accent">
            <div className="flex items-start gap-3">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-accent text-white">
                <Eye className="h-4 w-4" aria-hidden />
              </span>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-[13.5px] font-semibold text-accent-deep">
                    Visibility is reciprocal
                  </h2>
                  <Badge tone="accent">Can’t be turned off</Badge>
                </div>
                <p className="mt-1 text-[12.5px] leading-relaxed text-accent-deep/85">
                  {reciprocalVisibility(first)}
                </p>
              </div>
            </div>
          </Surface>
          <p className="mt-2 px-1 text-[11.5px] leading-relaxed text-ink-faint">
            {first} accepts the cardholder terms themselves when they open the
            invitation. You’re not accepting on their behalf.
          </p>
        </div>
      )}
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 px-4 py-3">
      <span className="text-[12.5px] text-ink-muted">{label}</span>
      <span className="numeral max-w-[55%] text-right text-[12.5px] font-medium">
        {value}
      </span>
    </div>
  )
}
