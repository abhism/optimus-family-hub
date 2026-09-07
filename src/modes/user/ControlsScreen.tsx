import { useState } from 'react'
import { Check, Eye, ShieldBan } from 'lucide-react'
import { useActions } from '../../store/StoreContext'
import {
  AppBar,
  Divider,
  ScreenBody,
  ScreenFooter,
  SectionLabel,
  Surface,
} from '../../components/ui/Layout'
import { Toggle } from '../../components/ui/Toggle'
import { AmountStepper, Field } from '../../components/ui/Field'
import { Button } from '../../components/ui/Button'
import { LIMIT_BOUNDS, userMaySetControls } from '../../store/policy'
import {
  POLICY_CATEGORY_LABEL,
  POLICY_CATEGORY_NOTE,
  SPOUSE_CONTROLS_EXPLAINER,
  SPOUSE_CONTROLS_FOOTNOTE,
} from '../../lib/copy'
import type { Controls } from '../../store/types'
import { money } from '../../lib/format'

/** 1.4 → Edit controls. Child cards only; spouse controls are locked. */
export function ControlsScreen({ memberId }: { memberId: string }) {
  const { state, pop, dispatch } = useActions()
  const member = state.members.find((m) => m.id === memberId)!
  const editable = userMaySetControls(member)
  const first = member.name.split(' ')[0]!

  const [draft, setDraft] = useState<Controls>(member.controls)
  const [saved, setSaved] = useState(false)

  const set = <K extends keyof Controls>(key: K, value: Controls[K]) =>
    setDraft((d) => ({ ...d, [key]: value }))

  const dirty = JSON.stringify(draft) !== JSON.stringify(member.controls)

  const save = () => {
    dispatch({ type: 'PATCH_CONTROLS', id: member.id, patch: draft })
    setSaved(true)
    setTimeout(pop, 900)
  }

  return (
    <>
      <AppBar
        title="Card controls"
        subtitle={`${first} · card ···· ${member.card.last4}`}
        onBack={pop}
      />

      <ScreenBody>
        {!editable && (
          <Surface className="mb-5 p-4">
            <h3 className="text-[13.5px] font-semibold">
              These controls are locked
            </h3>
            <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-muted">
              {SPOUSE_CONTROLS_EXPLAINER}
            </p>
            <p className="mt-2 text-[12px] font-medium text-ink-faint">
              {SPOUSE_CONTROLS_FOOTNOTE}
            </p>
          </Surface>
        )}

        <div className="mb-6">
          <SectionLabel>Where the card works</SectionLabel>
          <Surface className="px-4">
            <Toggle
              label="Online purchases"
              description="Websites and in-app payments"
              checked={draft.onlinePurchases}
              locked={!editable}
              lockNote={!editable ? 'Set by policy on adult cards' : undefined}
              onChange={(v) => set('onlinePurchases', v)}
            />
            <Divider />
            <Toggle
              label="ATM withdrawals"
              description="Cash from an ATM using the card PIN"
              checked={draft.atmWithdrawals}
              locked={!editable}
              lockNote={!editable ? 'Set by policy on adult cards' : undefined}
              onChange={(v) => set('atmWithdrawals', v)}
            />
            <Divider />
            <Toggle
              label="International use"
              description="Payments outside the United States"
              checked={draft.internationalUse}
              locked={!editable}
              lockNote={!editable ? 'Set by policy on adult cards' : undefined}
              onChange={(v) => set('internationalUse', v)}
            />
          </Surface>
        </div>

        {editable && (
          <>
            <div className="mb-6">
              <SectionLabel>Per-transaction cap</SectionLabel>
              <Surface className="p-4">
                <Field
                  label="Largest single purchase"
                  hint={`Any single purchase over this amount is declined, even when ${first} has limit left.`}
                >
                  <AmountStepper
                    value={draft.perTransactionCap ?? LIMIT_BOUNDS.perTransaction.min}
                    onChange={(v) => set('perTransactionCap', v)}
                    min={LIMIT_BOUNDS.perTransaction.min}
                    max={Math.min(
                      LIMIT_BOUNDS.perTransaction.max,
                      member.monthlyLimit ?? LIMIT_BOUNDS.perTransaction.max,
                    )}
                    step={LIMIT_BOUNDS.perTransaction.step}
                    label="per-transaction cap"
                    suffix="per purchase"
                  />
                </Field>
                {member.monthlyLimit !== null && (
                  <p className="mt-1 text-[11.5px] text-ink-faint">
                    Capped at the monthly card spending limit of{' '}
                    {money(member.monthlyLimit, { cents: false })}.
                  </p>
                )}
              </Surface>
            </div>

            <div className="mb-6">
              <SectionLabel>Policy blocks</SectionLabel>
              <Surface className="px-4">
                <Toggle
                  label={POLICY_CATEGORY_LABEL}
                  description={POLICY_CATEGORY_NOTE}
                  checked={draft.blockGamblingAdult}
                  onChange={(v) => set('blockGamblingAdult', v)}
                />
              </Surface>
              <p className="mt-2 flex items-start gap-1.5 px-1 text-[11.5px] leading-relaxed text-ink-faint">
                <ShieldBan className="mt-[1px] h-3 w-3 shrink-0" aria-hidden />
                Optimus applies this block by default to every card issued to a
                member under 18.
              </p>
            </div>
          </>
        )}

        {/* Rule 5: nothing applied to a member is hidden from them. */}
        <Surface className="mb-4 p-4" tone="accent">
          <div className="flex items-start gap-3">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-accent text-white">
              <Eye className="h-4 w-4" aria-hidden />
            </span>
            <div>
              <h3 className="text-[13.5px] font-semibold text-accent-deep">
                {first} can see these settings
              </h3>
              <p className="mt-1 text-[12.5px] leading-relaxed text-accent-deep/85">
                Every control on this card appears in {first}’s own app, exactly
                as set here. Optimus doesn’t apply anything silently.
              </p>
            </div>
          </div>
        </Surface>
      </ScreenBody>

      {editable && (
        <ScreenFooter>
          <Button
            full
            onClick={save}
            disabled={!dirty || saved}
            icon={saved ? <Check className="h-4 w-4" /> : undefined}
          >
            {saved ? 'Controls updated' : 'Save controls'}
          </Button>
        </ScreenFooter>
      )}
    </>
  )
}
