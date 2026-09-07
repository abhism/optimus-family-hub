import {
  Ban,
  Banknote,
  Car,
  Clapperboard,
  CreditCard,
  Gamepad2,
  Repeat,
  ShoppingBag,
  ShoppingCart,
  UtensilsCrossed,
} from 'lucide-react'
import type { MerchantCategory, Transaction } from '../store/types'
import { cx, money, relativeDay, timeOfDay } from '../lib/format'

const ICONS: Record<MerchantCategory, typeof ShoppingBag> = {
  groceries: ShoppingCart,
  dining: UtensilsCrossed,
  transport: Car,
  entertainment: Gamepad2,
  shopping: ShoppingBag,
  subscription: Repeat,
  gambling: Clapperboard,
  cash: Banknote,
  income: CreditCard,
}

export function TransactionRow({
  txn,
  onClick,
  /** Shown when a list mixes cards, e.g. the spouse's shared activity view. */
  cardLabel,
}: {
  txn: Transaction
  onClick?: () => void
  cardLabel?: string
}) {
  const Icon = txn.status === 'declined' ? Ban : ICONS[txn.category]
  const credit = txn.amount < 0
  const Tag = onClick ? 'button' : 'div'

  return (
    <Tag
      {...(onClick ? { type: 'button' as const, onClick } : {})}
      className={cx(
        'flex w-full items-center gap-3 px-4 py-3 text-left',
        onClick && 'tap hover:bg-neutral-50',
      )}
    >
      <span
        className={cx(
          'grid h-9 w-9 shrink-0 place-items-center rounded-full',
          txn.status === 'declined'
            ? 'bg-dangersoft text-danger'
            : credit
              ? 'bg-teal-50 text-positive'
              : 'bg-neutral-100 text-ink-soft',
        )}
      >
        <Icon className="h-4 w-4" aria-hidden />
      </span>

      <span className="min-w-0 flex-1">
        <span className="block truncate text-[14px] font-medium text-ink">
          {txn.merchant}
        </span>
        <span className="mt-0.5 block truncate text-[12px] text-ink-muted">
          {txn.status === 'declined' ? (
            <span className="font-medium text-danger">Declined</span>
          ) : (
            relativeDay(txn.at)
          )}
          {' · '}
          {timeOfDay(txn.at)}
          {cardLabel && ` · ${cardLabel}`}
        </span>
      </span>

      <span
        className={cx(
          'numeral shrink-0 text-[14px] font-semibold',
          txn.status === 'declined'
            ? 'text-ink-faint line-through'
            : credit
              ? 'text-positive'
              : 'text-ink',
        )}
      >
        {credit ? '+' : ''}
        {money(Math.abs(txn.amount))}
      </span>
    </Tag>
  )
}
