import { Info, Lock, ShieldBan } from 'lucide-react'
import { AmountStepper, Field } from '../../../components/ui/Field'
import { Toggle } from '../../../components/ui/Toggle'
import { Divider, Surface, SectionLabel } from '../../../components/ui/Layout'
import { FundsDisclosure } from '../../../components/Disclosure'
import { LIMIT_BOUNDS } from '../../../store/policy'
import {
  POLICY_CATEGORY_LABEL,
  POLICY_CATEGORY_NOTE,
  SPOUSE_CONTROLS_EXPLAINER,
  SPOUSE_CONTROLS_FOOTNOTE,
} from '../../../lib/copy'
import { money } from '../../../lib/format'
import type { MemberDraft } from './draft'

/**
 * Step 3 — card setup.
 *
 * Child: limit, per-transaction cap and controls are all editable.
 * Spouse: the same controls are rendered but locked (rule 4).
 */
export function StepCardSetup({
  draft,
  patch,
}: {
  draft: MemberDraft
  patch: (p: Partial<MemberDraft>) => void
}) {
  const isChild = draft.relationship === 'child'
  const first = draft.name.trim().split(/\s+/)[0] || 'they'

  const setControl = <K extends keyof MemberDraft['controls']>(
    key: K,
    value: MemberDraft['controls'][K],
  ) => patch({ controls: { ...draft.controls, [key]: value } })

  return (
    <div className="animate-fade-up">
      <h1 className="text-[22px] font-semibold leading-snug tracking-[-0.02em]">
        Set up {first}’s card
      </h1>

      {isChild ? (
        <>
          <p className="mt-2 text-[13.5px] leading-relaxed text-ink-muted">
            You choose the ceiling and where the card works. You can change all
            of this later.
          </p>

          <div className="mt-6">
            <SectionLabel>Monthly card spending limit</SectionLabel>
            <Surface className="p-4">
              <AmountStepper
                value={draft.monthlyLimit}
                onChange={(monthlyLimit) =>
                  patch({
                    monthlyLimit,
                    controls: {
                      ...draft.controls,
                      perTransactionCap: Math.min(
                        draft.controls.perTransactionCap ??
                          LIMIT_BOUNDS.perTransaction.min,
                        monthlyLimit,
                      ),
                    },
                  })
                }
                min={LIMIT_BOUNDS.monthly.min}
                max={LIMIT_BOUNDS.monthly.max}
                step={LIMIT_BOUNDS.monthly.step}
                label="monthly card spending limit"
                suffix="per month"
              />
              <p className="mt-3.5 text-[12.5px] leading-relaxed text-ink-muted">
                A ceiling on what the card can authorise in a month. It doesn’t
                move money or set anything aside.
              </p>
              <FundsDisclosure variant="boxed" className="mt-3" />
            </Surface>
          </div>

          <div className="mt-5">
            <SectionLabel>Per-transaction cap</SectionLabel>
            <Surface className="p-4">
              <Field
                label="Largest single purchase"
                hint={`Any single purchase above this is declined, even when ${first} has limit left.`}
              >
                <AmountStepper
                  value={
                    draft.controls.perTransactionCap ??
                    LIMIT_BOUNDS.perTransaction.min
                  }
                  onChange={(v) => setControl('perTransactionCap', v)}
                  min={LIMIT_BOUNDS.perTransaction.min}
                  max={Math.min(
                    LIMIT_BOUNDS.perTransaction.max,
                    draft.monthlyLimit,
                  )}
                  step={LIMIT_BOUNDS.perTransaction.step}
                  label="per-transaction cap"
                  suffix="per purchase"
                />
              </Field>
              <p className="mt-1 text-[11.5px] text-ink-faint">
                Capped at the monthly limit of{' '}
                {money(draft.monthlyLimit, { cents: false })}.
              </p>
            </Surface>
          </div>
        </>
      ) : (
        <>
          <p className="mt-2 text-[13.5px] leading-relaxed text-ink-muted">
            Adult members get a card with minimal restrictions. Here’s what that
            means.
          </p>

          <Surface className="mt-5 p-4" tone="accent">
            <div className="flex items-start gap-3">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-accent text-white">
                <Info className="h-4 w-4" aria-hidden />
              </span>
              <div>
                <h2 className="text-[13.5px] font-semibold text-accent-deep">
                  No spending limit on a spouse card
                </h2>
                <p className="mt-1 text-[12.5px] leading-relaxed text-accent-deep/85">
                  {SPOUSE_CONTROLS_EXPLAINER}
                </p>
                <p className="mt-2 text-[12px] font-medium text-accent-deep/70">
                  {SPOUSE_CONTROLS_FOOTNOTE}
                </p>
              </div>
            </div>
          </Surface>
        </>
      )}

      {/* Controls: editable for a child, visibly locked for a spouse. */}
      <div className="mt-5">
        <SectionLabel>
          Where the card works
          {!isChild && ' · locked'}
        </SectionLabel>
        <Surface className="px-4">
          <Toggle
            label="Online purchases"
            description="Websites and in-app payments"
            checked={draft.controls.onlinePurchases}
            locked={!isChild}
            lockNote={!isChild ? 'On by default for adult members' : undefined}
            onChange={(v) => setControl('onlinePurchases', v)}
          />
          <Divider />
          <Toggle
            label="ATM withdrawals"
            description="Cash from an ATM using the card PIN"
            checked={draft.controls.atmWithdrawals}
            locked={!isChild}
            lockNote={!isChild ? 'On by default for adult members' : undefined}
            onChange={(v) => setControl('atmWithdrawals', v)}
          />
          <Divider />
          <Toggle
            label="International use"
            description="Payments outside the United States"
            checked={draft.controls.internationalUse}
            locked={!isChild}
            lockNote={!isChild ? 'On by default for adult members' : undefined}
            onChange={(v) => setControl('internationalUse', v)}
          />
        </Surface>

        {!isChild && (
          <p className="mt-2 flex items-start gap-1.5 px-1 text-[11.5px] leading-relaxed text-ink-faint">
            <Lock className="mt-[1px] h-3 w-3 shrink-0" aria-hidden />
            These are shown so you know what {first}’s card can do. Optimus
            doesn’t let one adult restrict another’s card.
          </p>
        )}
      </div>

      {isChild && (
        <div className="mt-5">
          <SectionLabel>Policy blocks</SectionLabel>
          <Surface className="px-4">
            <Toggle
              label={POLICY_CATEGORY_LABEL}
              description={POLICY_CATEGORY_NOTE}
              checked={draft.controls.blockGamblingAdult}
              onChange={(v) => setControl('blockGamblingAdult', v)}
            />
          </Surface>
          <p className="mt-2 flex items-start gap-1.5 px-1 text-[11.5px] leading-relaxed text-ink-faint">
            <ShieldBan className="mt-[1px] h-3 w-3 shrink-0" aria-hidden />
            Applied by default to every card issued to a member under 18.
          </p>
        </div>
      )}
    </div>
  )
}
