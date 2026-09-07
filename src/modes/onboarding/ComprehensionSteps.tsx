import { useState } from 'react'
import {
  CreditCard,
  Eye,
  FileText,
  Fingerprint,
  Gift,
  Info,
  Lock,
  MailOpen,
  ShieldCheck,
} from 'lucide-react'
import { Surface } from '../../components/ui/Layout'
import { Button } from '../../components/ui/Button'
import { Checkbox, Field, TextArea, TextInput } from '../../components/ui/Field'
import { Toggle } from '../../components/ui/Toggle'
import { PinPad } from '../../components/ui/PinPad'
import { Badge } from '../../components/ui/Primitives'
import { MemberCardArt } from '../../components/CardArt'
import { CARDHOLDER_TERMS, reciprocalVisibilityForMember } from '../../lib/copy'
import { longDate } from '../../lib/format'
import type { StepProps } from './stepTypes'

/* ------------------------------------------------------------------ step 1 */

/** Invite landing — the equivalent of tapping the link. */
export function InviteLanding({ member, userFirstName, next }: StepProps) {
  const isChild = member.relationship === 'child'
  const first = member.name.split(' ')[0]!

  return (
    <div className="flex flex-1 animate-fade-up flex-col justify-center px-1 text-center">
      <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-accent to-violet-600 text-white shadow-lift">
        {isChild ? (
          <Gift className="h-7 w-7" aria-hidden />
        ) : (
          <MailOpen className="h-7 w-7" aria-hidden />
        )}
      </div>

      <h1 className="mt-6 text-[25px] font-semibold leading-[1.15] tracking-[-0.025em]">
        {userFirstName} has invited you to a Family Hub card
      </h1>

      <p className="mx-auto mt-3 max-w-[18rem] text-[14px] leading-relaxed text-ink-muted">
        {isChild
          ? `Hi ${first} — this is your own card to use, on ${userFirstName}’s Optimus account. It takes about two minutes to set up.`
          : `Hi ${first} — this is a card on ${userFirstName}’s Optimus account. Before you accept, we’ll explain exactly what that means.`}
      </p>

      <div className="mx-auto mt-7 w-[12rem] opacity-90">
        <MemberCardArt member={member} size="sm" />
      </div>

      <div className="mt-8">
        <Button full onClick={next}>
          {isChild ? 'Let’s go' : 'Get started'}
        </Button>
        <p className="mt-3 text-[11.5px] text-ink-faint">
          Invitation sent {longDate(member.invite.sentAt)}
        </p>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ step 2 */

/**
 * The comprehension moment. Nothing here is buried: this is the screen that
 * has to leave the Member with an accurate model of what they now hold.
 */
export function WhatThisIs({ member, userFirstName, next }: StepProps) {
  const isChild = member.relationship === 'child'

  return (
    <div className="animate-fade-up">
      <h1 className="text-[23px] font-semibold leading-snug tracking-[-0.02em]">
        {isChild ? 'How your card works' : 'What this card is'}
      </h1>
      <p className="mt-2 text-[13.5px] leading-relaxed text-ink-muted">
        {isChild
          ? 'Three things worth knowing before you start using it.'
          : 'Please read these three points. They describe what you’re accepting.'}
      </p>

      <div className="mt-6 space-y-3">
        <Point
          icon={<CreditCard className="h-4 w-4" />}
          title={`It’s a card on ${userFirstName}’s account`}
          body={
            isChild
              ? `The card is attached to ${userFirstName}’s Optimus account. When you buy something, it comes out of their account.`
              : `This is an add-on card issued on ${userFirstName}’s Optimus checking account. You are an authorized user on that account.`
          }
        />

        <Point
          icon={<Info className="h-4 w-4" />}
          title="You won’t have an Optimus account of your own"
          body={
            isChild
              ? `You don’t get your own Optimus account, and there’s no money held in your name. Your card has a spending limit, which is the most it can spend — not money set aside for you.`
              : `Opening this card doesn’t open an account for you, and no funds are held in your name. Any limit on the card is a ceiling on what it can authorise, not money set aside for you.`
          }
        />

        <Point
          icon={<Eye className="h-4 w-4" />}
          title={`${userFirstName} can see what you spend`}
          body={
            isChild
              ? `${userFirstName} sees every purchase you make on this card — where it was and how much.`
              : `${userFirstName} can see every transaction on this card, including merchant, amount and time.`
          }
        />
      </div>

      {/* Reciprocal visibility is part of the comprehension moment for a spouse. */}
      {!isChild && (
        <Surface className="mt-4 p-4" tone="accent">
          <div className="flex items-start gap-3">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-accent text-white">
              <Eye className="h-4 w-4" aria-hidden />
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-[13.5px] font-semibold text-accent-deep">
                  And you can see theirs
                </h2>
                <Badge tone="accent">Can’t be turned off</Badge>
              </div>
              <p className="mt-1 text-[12.5px] leading-relaxed text-accent-deep/85">
                {reciprocalVisibilityForMember(userFirstName)}
              </p>
            </div>
          </div>
        </Surface>
      )}

      {isChild && (
        <Surface className="mt-4 p-4">
          <div className="flex items-start gap-3">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-teal-50 text-positive">
              <ShieldCheck className="h-4 w-4" aria-hidden />
            </span>
            <div>
              <h2 className="text-[13.5px] font-semibold">
                {userFirstName} has already said yes
              </h2>
              <p className="mt-1 text-[12.5px] leading-relaxed text-ink-muted">
                As your parent or guardian, {userFirstName} has agreed to the
                card terms for you. There’s no paperwork for you to sign.
              </p>
            </div>
          </div>
        </Surface>
      )}

      <Button full className="mt-6" onClick={next}>
        {isChild ? 'Got it' : 'I understand'}
      </Button>
    </div>
  )
}

function Point({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode
  title: string
  body: string
}) {
  return (
    <Surface className="p-4">
      <div className="flex items-start gap-3">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-accent-soft text-accent">
          {icon}
        </span>
        <div className="min-w-0">
          <h2 className="text-[13.5px] font-semibold leading-snug">{title}</h2>
          <p className="mt-1 text-[12.5px] leading-relaxed text-ink-muted">
            {body}
          </p>
        </div>
      </div>
    </Surface>
  )
}

/* ------------------------------------------------------------------ step 3 */

/** Confirm details — pre-filled from the invitation, editable. */
export function ConfirmDetails({ member, next, patchMember }: StepProps) {
  const isChild = member.relationship === 'child'
  const [name, setName] = useState(member.name)
  const [dob, setDob] = useState(member.dob)
  const [address, setAddress] = useState(member.address)

  const valid = name.trim().length > 1 && dob.length > 0 && address.trim().length > 4

  return (
    <div className="animate-fade-up">
      <h1 className="text-[23px] font-semibold leading-snug tracking-[-0.02em]">
        {isChild ? 'Check your details' : 'Confirm your details'}
      </h1>
      <p className="mt-2 text-[13.5px] leading-relaxed text-ink-muted">
        {isChild
          ? 'These came from your invitation. Fix anything that looks wrong.'
          : 'Pre-filled from the invitation. Correct anything that’s out of date.'}
      </p>

      <div className="mt-5 space-y-1">
        <Field label="Full name" htmlFor="ob-name">
          <TextInput
            id="ob-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </Field>
        <Field label="Date of birth" htmlFor="ob-dob">
          <TextInput
            id="ob-dob"
            type="date"
            value={dob}
            max={new Date().toISOString().slice(0, 10)}
            onChange={(e) => setDob(e.target.value)}
          />
        </Field>
        <Field
          label="Home address"
          htmlFor="ob-address"
          hint="Where we’ll post your physical card."
        >
          <TextArea
            id="ob-address"
            rows={3}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </Field>
      </div>

      <Button
        full
        className="mt-5"
        disabled={!valid}
        onClick={() => {
          patchMember({ name: name.trim(), dob, address: address.trim() })
          next()
        }}
      >
        Confirm and continue
      </Button>
    </div>
  )
}

/* ------------------------------------------------------------------ step 4 */

/**
 * Cardholder terms.
 *
 * An adult accepts them. A child does not — their parent already consented,
 * so the child sees the same summary framed as an explanation.
 */
export function CardholderTerms({ member, userFirstName, next, patchMember }: StepProps) {
  const isChild = member.relationship === 'child'
  const [accepted, setAccepted] = useState(false)
  const [scrolledToEnd, setScrolledToEnd] = useState(false)

  return (
    <div className="animate-fade-up">
      <h1 className="text-[23px] font-semibold leading-snug tracking-[-0.02em]">
        {isChild ? 'The rules of your card' : 'Cardholder terms'}
      </h1>
      <p className="mt-2 text-[13.5px] leading-relaxed text-ink-muted">
        {isChild
          ? `${userFirstName} already agreed to these for you. Here they are in plain language so you know where you stand.`
          : 'A summary of the agreement you’re accepting. Scroll to the end to continue.'}
      </p>

      <Surface className="mt-5 overflow-hidden">
        <div className="flex items-center gap-2 border-b border-line px-4 py-3">
          <FileText className="h-3.5 w-3.5 text-accent" aria-hidden />
          <p className="text-[12.5px] font-semibold">
            Optimus Add-on Card — key terms
          </p>
        </div>

        <div
          className="thin-scrollbar max-h-64 space-y-3.5 overflow-y-auto px-4 py-4"
          onScroll={(e) => {
            const el = e.currentTarget
            if (el.scrollTop + el.clientHeight >= el.scrollHeight - 12) {
              setScrolledToEnd(true)
            }
          }}
        >
          {CARDHOLDER_TERMS.map((t) => (
            <div key={t.heading}>
              <p className="text-[12.5px] font-semibold text-ink">{t.heading}</p>
              <p className="mt-1 text-[12px] leading-relaxed text-ink-muted">
                {t.body}
              </p>
            </div>
          ))}
          <p className="pt-1 text-[11.5px] italic text-ink-faint">
            End of summary.
          </p>
        </div>
      </Surface>

      {isChild ? (
        <>
          <div className="mt-4 flex items-start gap-2 rounded-xl bg-teal-50 px-3.5 py-3">
            <ShieldCheck
              className="mt-[1px] h-3.5 w-3.5 shrink-0 text-positive"
              aria-hidden
            />
            <p className="text-[12px] leading-relaxed text-teal-900/85">
              {userFirstName} agreed to these terms as your parent or guardian.
              You’re not being asked to sign anything.
            </p>
          </div>
          <Button full className="mt-5" onClick={next}>
            Got it
          </Button>
        </>
      ) : (
        <>
          <div className="mt-4">
            <Checkbox
              id="accept-terms"
              checked={accepted}
              onChange={setAccepted}
            >
              I’ve read the summary and I accept the Optimus Card Agreement and
              the Deposit Account Agreement as an authorized user.
            </Checkbox>
          </div>

          {!scrolledToEnd && (
            <p className="mt-2.5 px-1 text-[11.5px] text-ink-faint">
              Scroll to the end of the summary to continue.
            </p>
          )}

          <Button
            full
            className="mt-4"
            disabled={!accepted || !scrolledToEnd}
            onClick={() => {
              patchMember({
                invite: {
                  ...member.invite,
                  termsAcceptedAt: new Date().toISOString(),
                },
              })
              next()
            }}
          >
            Accept and continue
          </Button>
        </>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ step 5 */

/** Set up access — passcode and optional biometrics. */
export function SetUpAccess({ member, next, patchMember }: StepProps) {
  const isChild = member.relationship === 'child'
  const [stage, setStage] = useState<'create' | 'confirm' | 'options'>('create')
  const [firstCode, setFirstCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [biometric, setBiometric] = useState(true)

  if (stage === 'options') {
    return (
      <div className="animate-fade-up">
        <h1 className="text-[23px] font-semibold leading-snug tracking-[-0.02em]">
          {isChild ? 'Unlock with your face?' : 'Sign in faster'}
        </h1>
        <p className="mt-2 text-[13.5px] leading-relaxed text-ink-muted">
          Your passcode is set. You can also use Face ID so you don’t have to
          type it every time.
        </p>

        <Surface className="mt-5 px-4">
          <Toggle
            label="Use Face ID"
            description="Unlock the app and confirm actions with your face."
            checked={biometric}
            onChange={setBiometric}
          />
        </Surface>

        <div className="mt-4 flex items-start gap-2 rounded-xl bg-neutral-100 px-3.5 py-3">
          <Lock
            className="mt-[1px] h-3.5 w-3.5 shrink-0 text-ink-muted"
            aria-hidden
          />
          <p className="text-[12px] leading-relaxed text-ink-soft">
            Your passcode stays on this device. Optimus can’t see it, and you’ll
            need it to change card settings.
          </p>
        </div>

        <Button
          full
          className="mt-6"
          icon={<Fingerprint className="h-4 w-4" />}
          onClick={() => {
            patchMember({
              invite: { ...member.invite, passcodeSet: true, biometric },
            })
            next()
          }}
        >
          Continue
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-1 animate-fade-up flex-col justify-center">
      <PinPad
        title={
          stage === 'create' ? 'Create a passcode' : 'Enter it once more'
        }
        subtitle={
          stage === 'create'
            ? isChild
              ? 'Pick 4 numbers you’ll remember. You’ll use these to open the app.'
              : 'Choose a 4-digit passcode for the Optimus app on this device.'
            : 'Just to make sure it’s the same.'
        }
        error={error}
        onComplete={(code) => {
          if (stage === 'create') {
            setFirstCode(code)
            setError(null)
            setStage('confirm')
          } else if (code === firstCode) {
            setError(null)
            setStage('options')
          } else {
            setError('Those didn’t match. Start again.')
            setFirstCode('')
            setStage('create')
          }
        }}
      />
    </div>
  )
}

/* ------------------------------------------------- shared success chrome */

export function SuccessHeader({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode
  title: string
  body: string
}) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="grid h-16 w-16 place-items-center rounded-full bg-accent-soft text-accent">
        {icon}
      </div>
      <h1 className="mt-5 text-[22px] font-semibold leading-snug tracking-[-0.02em]">
        {title}
      </h1>
      <p className="mt-2 max-w-[18rem] text-[13.5px] leading-relaxed text-ink-muted">
        {body}
      </p>
    </div>
  )
}
