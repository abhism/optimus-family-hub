import type {
  Channel,
  DeclineRule,
  Member,
  MerchantCategory,
  Transaction,
} from './types'

/**
 * Authorization engine.
 *
 * Single source of truth for whether a Member transaction is approved. Every
 * simulated purchase and every decline screen in the prototype resolves
 * through `authorize`, so the account model is real behaviour rather than
 * static copy:
 *
 *   A Member transaction authorizes against the LOWER of
 *     (a) the card's remaining spending limit, and
 *     (b) available funds in the User's account.
 *
 * (b) is why two Members can hold limits that sum to more than the account
 * balance without the model breaking — neither limit reserves anything.
 */

export type AuthResult =
  | { approved: true }
  | { approved: false; rule: DeclineRule; limitValue: number | null }

export interface AuthInput {
  amount: number
  channel: Channel
  category: MerchantCategory
  member: Member
  balance: number
}

/** Remaining headroom under the card's policy ceiling. `null` = no ceiling set. */
export const remainingLimit = (member: Member): number | null => {
  if (member.monthlyLimit === null) return null
  return Math.max(0, member.monthlyLimit - member.periodSpend)
}

/**
 * The largest purchase the card could authorise right now — the lower of the
 * card's remaining limit and the account's available funds.
 *
 * Deliberately not named "available balance". It is a computed ceiling, not a
 * pot of money, and it is never rendered to a Member as a guaranteed figure.
 */
export const authorisableCeiling = (member: Member, balance: number): number => {
  const remaining = remainingLimit(member)
  if (remaining === null) return Math.max(0, balance)
  return Math.max(0, Math.min(remaining, balance))
}

/**
 * True when account funds — not the card's limit — are the binding constraint.
 * Drives the explanatory state on Member screens.
 */
export const isFundsConstrained = (member: Member, balance: number): boolean => {
  const remaining = remainingLimit(member)
  if (remaining === null) return false
  return balance < remaining
}

export function authorize(input: AuthInput): AuthResult {
  const { amount, channel, category, member, balance } = input

  if (member.status === 'frozen') {
    return { approved: false, rule: 'card_frozen', limitValue: null }
  }
  if (member.status !== 'active') {
    return { approved: false, rule: 'card_inactive', limitValue: null }
  }

  const c = member.controls

  if (category === 'gambling' && c.blockGamblingAdult) {
    return { approved: false, rule: 'category_blocked', limitValue: null }
  }
  if (channel === 'online' && !c.onlinePurchases) {
    return { approved: false, rule: 'online_blocked', limitValue: null }
  }
  if (channel === 'atm' && !c.atmWithdrawals) {
    return { approved: false, rule: 'atm_blocked', limitValue: null }
  }
  if (channel === 'international' && !c.internationalUse) {
    return { approved: false, rule: 'international_blocked', limitValue: null }
  }

  if (c.perTransactionCap !== null && amount > c.perTransactionCap) {
    return {
      approved: false,
      rule: 'per_transaction_cap',
      limitValue: c.perTransactionCap,
    }
  }

  const remaining = remainingLimit(member)
  if (remaining !== null && amount > remaining) {
    return { approved: false, rule: 'monthly_limit', limitValue: member.monthlyLimit }
  }

  // Checked last so that a card-policy decline is always explained by the
  // policy the Member can see, and funds are only surfaced when they truly bind.
  if (amount > balance) {
    return {
      approved: false,
      rule: 'insufficient_account_funds',
      limitValue: balance,
    }
  }

  return { approved: true }
}

/** Human-readable reason, phrased for the User. */
export function declineReasonForUser(
  txn: Transaction,
  member: Member,
): string {
  const rule = txn.decline?.rule
  const limit = txn.decline?.limitValue
  const cur = (n: number | null | undefined) =>
    n === null || n === undefined ? '' : `$${n.toFixed(2)}`
  switch (rule) {
    case 'per_transaction_cap':
      return `exceeds the ${cur(limit)} per-transaction cap`
    case 'monthly_limit':
      return `exceeds the ${cur(limit)} monthly card spending limit`
    case 'category_blocked':
      return 'is blocked by the gambling & adult content policy'
    case 'online_blocked':
      return 'was an online purchase, which is turned off on this card'
    case 'atm_blocked':
      return 'was an ATM withdrawal, which is turned off on this card'
    case 'international_blocked':
      return 'was an international payment, which is turned off on this card'
    case 'card_frozen':
      return `was attempted while ${member.name}'s card is frozen`
    case 'insufficient_account_funds':
      return 'exceeds available funds in your account'
    default:
      return 'was declined'
  }
}

/** Human-readable reason, phrased for the Member. Specific, never punitive. */
export function declineReasonForMember(txn: Transaction): string {
  const rule = txn.decline?.rule
  const limit = txn.decline?.limitValue
  const cur = (n: number | null | undefined) =>
    n === null || n === undefined ? '' : `$${n.toFixed(2)}`
  switch (rule) {
    case 'per_transaction_cap':
      return `This was over your ${cur(limit)} per-purchase limit.`
    case 'monthly_limit':
      return `This would have taken you past your ${cur(limit)} card spending limit for this period.`
    case 'category_blocked':
      return 'This merchant falls under gambling & adult content, which is blocked on your card.'
    case 'online_blocked':
      return 'Online purchases are turned off on your card.'
    case 'atm_blocked':
      return 'ATM withdrawals are turned off on your card.'
    case 'international_blocked':
      return 'International payments are turned off on your card.'
    case 'card_frozen':
      return 'Your card is frozen, so it cannot be used right now.'
    case 'insufficient_account_funds':
      return 'There were not enough available funds in the primary account to cover this purchase.'
    default:
      return 'This purchase was declined.'
  }
}

/** Which control a decline maps to, for the User's adjust-limit screen. */
export const adjustableRule = (rule: DeclineRule | undefined) =>
  rule === 'per_transaction_cap' || rule === 'monthly_limit' ? rule : null
