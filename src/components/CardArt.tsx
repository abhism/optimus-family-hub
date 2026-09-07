import { Snowflake } from 'lucide-react'
import { cx, groupCardNumber } from '../lib/format'
import type { Member } from '../store/types'

/**
 * Card art. Gradient is keyed to relationship type so a card is identifiable
 * at a glance in a list, on a detail screen, and in the Member's own app.
 */
export const CARD_SKIN = {
  user: 'from-[#26262B] via-[#1B1B20] to-[#0E0E12]',
  spouse: 'from-[#4338CA] via-[#5B3FD4] to-[#7C3AED]',
  child: 'from-[#7C3AED] via-[#A833C4] to-[#DB2777]',
} as const

export type CardSkin = keyof typeof CARD_SKIN

export function skinFor(relationship: 'spouse' | 'child'): CardSkin {
  return relationship
}

interface Props {
  holderName: string
  last4: string
  expiry: string
  skin: CardSkin
  label?: string
  frozen?: boolean
  size?: 'sm' | 'md' | 'lg'
  /** Reveals full PAN/CVV — only on the Member's own card-reveal screen. */
  reveal?: { number: string; cvv: string }
  className?: string
  animateIn?: boolean
}

export function CardArt({
  holderName,
  last4,
  expiry,
  skin,
  label = 'Optimus',
  frozen,
  size = 'md',
  reveal,
  className,
  animateIn,
}: Props) {
  const pad = { sm: 'p-3.5', md: 'p-4', lg: 'p-5' }[size]
  const aspect = { sm: 'aspect-[1.7]', md: 'aspect-[1.62]', lg: 'aspect-[1.58]' }[
    size
  ]

  return (
    <div
      className={cx(
        'card-sheen relative isolate overflow-hidden rounded-2xl bg-gradient-to-br text-white shadow-plastic',
        CARD_SKIN[skin],
        aspect,
        pad,
        animateIn && 'animate-card-reveal [transform-style:preserve-3d]',
        className,
      )}
    >
      {/* soft light bloom */}
      <div
        className="absolute -right-10 -top-14 h-40 w-40 rounded-full bg-white/12 blur-2xl"
        aria-hidden
      />
      <div
        className="absolute -bottom-16 -left-8 h-40 w-40 rounded-full bg-black/20 blur-2xl"
        aria-hidden
      />

      <div className="relative flex h-full flex-col justify-between">
        <div className="flex items-start justify-between">
          <span className="text-[12px] font-semibold tracking-[0.14em] opacity-90">
            {label.toUpperCase()}
          </span>
          {frozen ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-white/18 px-2 py-0.5 text-[10.5px] font-semibold backdrop-blur-sm">
              <Snowflake className="h-3 w-3" aria-hidden />
              Frozen
            </span>
          ) : (
            <span className="text-[13px] font-bold italic tracking-tight opacity-95">
              VISA
            </span>
          )}
        </div>

        <div>
          {reveal ? (
            <p className="numeral text-[17px] font-medium tracking-[0.06em]">
              {groupCardNumber(reveal.number)}
            </p>
          ) : (
            <p className="numeral text-[15px] font-medium tracking-[0.18em] opacity-95">
              ···· ···· ···· {last4}
            </p>
          )}

          <div className="mt-3 flex items-end justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[9px] uppercase tracking-[0.13em] opacity-60">
                Cardholder
              </p>
              <p className="truncate text-[12.5px] font-semibold uppercase tracking-wide">
                {holderName}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[9px] uppercase tracking-[0.13em] opacity-60">
                Expires
              </p>
              <p className="numeral text-[12.5px] font-semibold">{expiry}</p>
            </div>
            {reveal && (
              <div className="text-right">
                <p className="text-[9px] uppercase tracking-[0.13em] opacity-60">
                  CVV
                </p>
                <p className="numeral text-[12.5px] font-semibold">{reveal.cvv}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {frozen && (
        <div
          className="absolute inset-0 bg-white/25 backdrop-blur-[1.5px]"
          aria-hidden
        />
      )}
    </div>
  )
}

/** Convenience wrapper for rendering a Member's card. */
export function MemberCardArt({
  member,
  size = 'md',
  reveal,
  animateIn,
  className,
}: {
  member: Member
  size?: 'sm' | 'md' | 'lg'
  reveal?: boolean
  animateIn?: boolean
  className?: string
}) {
  return (
    <CardArt
      holderName={member.name}
      last4={member.card.last4}
      expiry={member.card.expiry}
      skin={skinFor(member.relationship)}
      frozen={member.status === 'frozen'}
      size={size}
      animateIn={animateIn}
      className={className}
      reveal={
        reveal ? { number: member.card.number, cvv: member.card.cvv } : undefined
      }
    />
  )
}
