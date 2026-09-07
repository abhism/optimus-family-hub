import { useEffect, useState } from 'react'
import {
  Apple,
  Check,
  Copy,
  CreditCard,
  Eye,
  EyeOff,
  PartyPopper,
  Smartphone,
  Sparkles,
  Truck,
  Wallet,
} from 'lucide-react'
import { Divider, SectionLabel, Surface } from '../../components/ui/Layout'
import { Button } from '../../components/ui/Button'
import { PinPad } from '../../components/ui/PinPad'
import { MemberCardArt } from '../../components/CardArt'
import { FundsDisclosure } from '../../components/Disclosure'
import { SuccessHeader } from './ComprehensionSteps'
import { groupCardNumber, longDate, money } from '../../lib/format'
import type { StepProps } from './stepTypes'

/* ------------------------------------------------------------------ step 6 */

/**
 * Virtual card issued immediately (rule 9). Activation is never gated on the
 * physical card arriving.
 */
export function CardReady({ member, next }: StepProps) {
  const isChild = member.relationship === 'child'
  const [revealed, setRevealed] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 120)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    if (!copied) return
    const t = setTimeout(() => setCopied(null), 1800)
    return () => clearTimeout(t)
  }, [copied])

  const copy = (label: string, value: string) => {
    navigator.clipboard?.writeText(value).catch(() => undefined)
    setCopied(label)
  }

  return (
    <div className="animate-fade-up">
      <SuccessHeader
        icon={<Sparkles className="h-7 w-7" aria-hidden />}
        title={isChild ? 'Your card is ready!' : 'Your card is ready'}
        body={
          isChild
            ? 'You can start using it right now for online things. The plastic one is on its way too.'
            : 'Your virtual card is active immediately. Use it online or in a digital wallet straight away.'
        }
      />

      <div className="mx-auto mt-7 max-w-[17rem]">
        {mounted && (
          <MemberCardArt member={member} size="lg" reveal={revealed} animateIn />
        )}
      </div>

      <div className="mt-4 flex justify-center">
        <button
          type="button"
          onClick={() => setRevealed((r) => !r)}
          className="tap inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-2 text-[12.5px] font-semibold text-accent shadow-card"
        >
          {revealed ? (
            <>
              <EyeOff className="h-3.5 w-3.5" aria-hidden />
              Hide details
            </>
          ) : (
            <>
              <Eye className="h-3.5 w-3.5" aria-hidden />
              Show card details
            </>
          )}
        </button>
      </div>

      {revealed && (
        <div className="mt-4 animate-fade-up">
          <SectionLabel>Card details</SectionLabel>
          <Surface className="overflow-hidden">
            <CopyRow
              label="Card number"
              value={groupCardNumber(member.card.number)}
              onCopy={() => copy('Card number', member.card.number)}
              copied={copied === 'Card number'}
            />
            <Divider />
            <CopyRow
              label="Expiry"
              value={member.card.expiry}
              onCopy={() => copy('Expiry', member.card.expiry)}
              copied={copied === 'Expiry'}
            />
            <Divider />
            <CopyRow
              label="CVV"
              value={member.card.cvv}
              onCopy={() => copy('CVV', member.card.cvv)}
              copied={copied === 'CVV'}
            />
          </Surface>
          <p className="mt-2 px-1 text-[11.5px] leading-relaxed text-ink-faint">
            Keep these private. Anyone with them can spend on your card.
          </p>
        </div>
      )}

      {member.monthlyLimit !== null && (
        <Surface className="mt-5 p-4">
          <div className="flex items-baseline justify-between gap-3">
            <span className="text-[12.5px] text-ink-muted">
              Your card spending limit
            </span>
            <span className="numeral text-[16px] font-semibold">
              {money(member.monthlyLimit)}
            </span>
          </div>
          <p className="mt-1.5 text-[12px] leading-relaxed text-ink-muted">
            The most this card can spend in a month. It isn’t money set aside
            for you.
          </p>
          <FundsDisclosure className="mt-2.5" />
        </Surface>
      )}

      <Button full className="mt-6" onClick={next}>
        Continue
      </Button>
    </div>
  )
}

function CopyRow({
  label,
  value,
  onCopy,
  copied,
}: {
  label: string
  value: string
  onCopy: () => void
  copied: boolean
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <span className="flex-1 text-[12.5px] text-ink-muted">{label}</span>
      <span className="numeral text-[13.5px] font-semibold">{value}</span>
      <button
        type="button"
        onClick={onCopy}
        aria-label={`Copy ${label}`}
        className="tap grid h-8 w-8 place-items-center rounded-lg bg-neutral-100 text-ink-soft hover:bg-neutral-200"
      >
        {copied ? (
          <Check className="h-3.5 w-3.5 text-positive" aria-hidden />
        ) : (
          <Copy className="h-3.5 w-3.5" aria-hidden />
        )}
      </button>
    </div>
  )
}

/* ------------------------------------------------------------------ step 7 */

/** Add to wallet — Apple / Google mock. */
export function AddToWallet({ member, next, patchMember }: StepProps) {
  const [added, setAdded] = useState(member.card.inWallet)
  const [busy, setBusy] = useState(false)

  const add = (provider: string) => {
    setBusy(true)
    setTimeout(() => {
      patchMember({ card: { ...member.card, inWallet: true } })
      setAdded(true)
      setBusy(false)
      void provider
    }, 900)
  }

  return (
    <div className="animate-fade-up">
      <SuccessHeader
        icon={<Wallet className="h-7 w-7" aria-hidden />}
        title="Add it to your phone"
        body="Put the card in your phone’s wallet so you can tap to pay before the plastic arrives."
      />

      <div className="mx-auto mt-6 w-[13rem]">
        <MemberCardArt member={member} size="sm" />
      </div>

      {added ? (
        <Surface className="mt-6 p-4">
          <div className="flex items-center gap-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-teal-50 text-positive">
              <Check className="h-4 w-4" aria-hidden />
            </span>
            <div>
              <p className="text-[13.5px] font-semibold">Added to your phone</p>
              <p className="mt-0.5 text-[12px] text-ink-muted">
                Card ···· {member.card.last4} is ready to tap.
              </p>
            </div>
          </div>
        </Surface>
      ) : (
        <div className="mt-6 space-y-2.5">
          <button
            type="button"
            disabled={busy}
            onClick={() => add('apple')}
            className="tap flex w-full items-center justify-center gap-2 rounded-2xl bg-ink py-3.5 text-[14px] font-semibold text-white disabled:opacity-60"
          >
            <Apple className="h-4 w-4" aria-hidden />
            {busy ? 'Adding…' : 'Add to Apple Wallet'}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => add('google')}
            className="tap flex w-full items-center justify-center gap-2 rounded-2xl border border-line bg-white py-3.5 text-[14px] font-semibold text-ink disabled:opacity-60"
          >
            <Smartphone className="h-4 w-4" aria-hidden />
            {busy ? 'Adding…' : 'Add to Google Wallet'}
          </button>
        </div>
      )}

      <Button
        full
        variant={added ? 'primary' : 'ghost'}
        size={added ? 'lg' : 'md'}
        className="mt-4"
        onClick={next}
      >
        {added ? 'Continue' : 'Skip for now'}
      </Button>
    </div>
  )
}

/* ------------------------------------------------------------------ step 8 */

/** Set the PIN for the physical card. */
export function SetPin({ member, next, patchMember }: StepProps) {
  const isChild = member.relationship === 'child'
  const [stage, setStage] = useState<'create' | 'confirm' | 'done'>('create')
  const [first, setFirst] = useState('')
  const [error, setError] = useState<string | null>(null)

  if (stage === 'done') {
    return (
      <div className="animate-fade-up">
        <SuccessHeader
          icon={<Check className="h-7 w-7" aria-hidden />}
          title="PIN set"
          body={
            isChild
              ? 'Use this PIN when you pay with the plastic card. Don’t tell anyone what it is.'
              : 'You’ll use this PIN for chip-and-PIN payments once the physical card arrives.'
          }
        />
        <Button full className="mt-7" onClick={next}>
          Continue
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-1 animate-fade-up flex-col justify-center">
      <PinPad
        title={stage === 'create' ? 'Choose your card PIN' : 'Confirm your PIN'}
        subtitle={
          stage === 'create'
            ? 'Four digits for chip-and-PIN payments and ATMs.'
            : 'Enter the same four digits again.'
        }
        error={error}
        onComplete={(code) => {
          if (stage === 'create') {
            setFirst(code)
            setError(null)
            setStage('confirm')
          } else if (code === first) {
            patchMember({ card: { ...member.card, pinSet: true } })
            setError(null)
            setStage('done')
          } else {
            setError('Those didn’t match. Try again.')
            setFirst('')
            setStage('create')
          }
        }}
      />
    </div>
  )
}

/* ------------------------------------------------------------------ step 9 */

/** Physical card confirmation. */
export function PhysicalCardOnItsWay({ member, next, patchMember }: StepProps) {
  const isChild = member.relationship === 'child'

  useEffect(() => {
    if (!member.card.physicalOrderedAt) {
      const now = new Date()
      const arrival = new Date(now)
      arrival.setDate(arrival.getDate() + 7)
      patchMember({
        card: {
          ...member.card,
          physicalOrderedAt: now.toISOString(),
          physicalArrivesBy: arrival.toISOString(),
        },
      })
    }
  }, [member.card, patchMember])

  return (
    <div className="animate-fade-up">
      <SuccessHeader
        icon={<Truck className="h-7 w-7" aria-hidden />}
        title="Your physical card is on its way"
        body="Arriving in 5–7 days. Your virtual card already works, so there’s nothing to wait for."
      />

      <Surface className="mt-6 overflow-hidden">
        <div className="flex items-start gap-3 p-4">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-accent-soft text-accent">
            <CreditCard className="h-4 w-4" aria-hidden />
          </span>
          <div className="min-w-0">
            <p className="text-[13.5px] font-semibold">
              Virtual card — active now
            </p>
            <p className="mt-0.5 text-[12px] leading-relaxed text-ink-muted">
              Card ···· {member.card.last4}
              {member.card.inWallet && ' · in your phone’s wallet'}
              {member.card.pinSet && ' · PIN set'}
            </p>
          </div>
        </div>
        <Divider />
        <div className="flex items-start gap-3 p-4">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-neutral-100 text-ink-soft">
            <Truck className="h-4 w-4" aria-hidden />
          </span>
          <div className="min-w-0">
            <p className="text-[13.5px] font-semibold">Plastic card — posted</p>
            <p className="mt-0.5 text-[12px] leading-relaxed text-ink-muted">
              To {member.address}
              {member.card.physicalArrivesBy &&
                ` · expected by ${longDate(member.card.physicalArrivesBy)}`}
            </p>
          </div>
        </div>
      </Surface>

      <div className="mt-5 flex items-start gap-2 rounded-xl bg-teal-50 px-3.5 py-3">
        <PartyPopper
          className="mt-[1px] h-3.5 w-3.5 shrink-0 text-positive"
          aria-hidden
        />
        <p className="text-[12px] leading-relaxed text-teal-900/85">
          {isChild
            ? 'That’s everything. Your card is set up and ready to use.'
            : 'Setup is complete. You can manage your card from the app at any time.'}
        </p>
      </div>

      <Button full className="mt-6" onClick={next}>
        {isChild ? 'See my card' : 'Go to my card'}
      </Button>
    </div>
  )
}
