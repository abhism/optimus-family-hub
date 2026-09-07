import { Field, TextArea, TextInput } from '../../../components/ui/Field'
import { MIN_CHILD_AGE } from '../../../store/policy'
import type { MemberDraft } from './draft'

/** Step 2 — member details, with the child minimum-age check inline. */
export function StepDetails({
  draft,
  patch,
  dobError,
  age,
}: {
  draft: MemberDraft
  patch: (p: Partial<MemberDraft>) => void
  dobError: string | null
  age: number | null
}) {
  const isChild = draft.relationship === 'child'

  return (
    <div className="animate-fade-up">
      <h1 className="text-[22px] font-semibold leading-snug tracking-[-0.02em]">
        {isChild ? 'Your child’s details' : 'Their details'}
      </h1>
      <p className="mt-2 text-[13.5px] leading-relaxed text-ink-muted">
        We need these to issue the card and to run the identity checks required
        for an authorized user.
      </p>

      <div className="mt-5 space-y-1">
        <Field label="Full name" htmlFor="member-name">
          <TextInput
            id="member-name"
            value={draft.name}
            autoComplete="off"
            placeholder={isChild ? 'Aarav Raman' : 'Meera Raman'}
            onChange={(e) => patch({ name: e.target.value })}
          />
        </Field>

        <Field
          label="Date of birth"
          htmlFor="member-dob"
          error={dobError}
          hint={
            isChild
              ? `Must be ${MIN_CHILD_AGE} or over.${
                  age !== null && age >= MIN_CHILD_AGE ? ` Currently ${age}.` : ''
                }`
              : age !== null
                ? `Currently ${age}.`
                : undefined
          }
        >
          <TextInput
            id="member-dob"
            type="date"
            value={draft.dob}
            invalid={Boolean(dobError)}
            max={new Date().toISOString().slice(0, 10)}
            onChange={(e) => patch({ dob: e.target.value })}
          />
        </Field>

        <Field
          label="Home address"
          htmlFor="member-address"
          hint="Where the physical card is posted. Pre-filled from your account."
        >
          <TextArea
            id="member-address"
            rows={3}
            value={draft.address}
            onChange={(e) => patch({ address: e.target.value })}
          />
        </Field>
      </div>

      <p className="mt-4 px-1 text-[11.5px] leading-relaxed text-ink-faint">
        {isChild
          ? 'A card issued to someone under 18 requires your consent as their parent or guardian. You’ll give that on the review step.'
          : 'Adult members confirm their own details and accept the cardholder terms themselves when they open the invitation.'}
      </p>
    </div>
  )
}
