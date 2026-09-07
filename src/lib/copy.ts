/**
 * Centralised product copy.
 *
 * The disclosure and settlement-tail strings are exported from exactly one
 * place so that the two hardest product rules cannot drift as screens are
 * added: every Member-facing spending figure renders FUNDS_DISCLOSURE, and
 * every termination path renders SETTLEMENT_TAIL.
 *
 * scripts/audit-copy.mjs enforces the companion rule — that banned
 * account-holder vocabulary ("balance", "wallet", "your money") never reaches
 * a Member-facing screen.
 */

/** Rendered on every Member-facing screen that shows a spending figure. */
export const FUNDS_DISCLOSURE =
  'Purchases are also subject to available funds in the primary account.'

/** Rendered on every termination path, for the User and for the Member. */
export const SETTLEMENT_TAIL =
  'The card will stop working immediately. Transactions already authorised may still settle over the next few days and will be charged to your account.'

/** Fixed rule for spouse cards. Rendered as a badge, never as a setting. */
export const reciprocalVisibility = (memberName: string) =>
  `You and ${memberName} can both see activity on each other's Family Hub cards. This can't be turned off.`

export const reciprocalVisibilityForMember = (userName: string) =>
  `You and ${userName} can both see activity on each other's Family Hub cards. This can't be turned off.`

export const SPOUSE_CONTROLS_EXPLAINER =
  'Spouse cards ship with minimal restrictions by design. An adult member is a full cardholder on your account, so Optimus does not let one adult set spending controls on another.'

export const SPOUSE_CONTROLS_FOOTNOTE =
  'Jointly agreed spending rules are coming in a later release.'

export const POLICY_CATEGORY_LABEL = 'Gambling & adult content'

export const POLICY_CATEGORY_NOTE =
  'Blocked by default on every card issued to a member under 18. You can review this at any time.'

/** Non-toggleable notification group. */
export const MANDATORY_ALERTS_NOTE =
  'Security alerts, declines, freeze events and card replacements are always sent. They tell you that something changed on your account, so they cannot be switched off.'

export const CHILD_UNFREEZE_NOTE =
  'Only the primary accountholder can unfreeze this card.'

export const memberFrozenByUserNote = (userName: string) =>
  `${userName} froze this card, so only ${userName} can unfreeze it.`

/** Cardholder terms summary, shared by the User review step and Member onboarding. */
export const CARDHOLDER_TERMS: { heading: string; body: string }[] = [
  {
    heading: 'This is an add-on card, not an account',
    body: 'The card is issued on the primary accountholder’s Optimus checking account. The cardholder does not hold an Optimus account and has no separate funds.',
  },
  {
    heading: 'The accountholder is liable',
    body: 'All purchases made on this card are charged to the primary account. The primary accountholder is responsible for repaying them.',
  },
  {
    heading: 'Card spending limits',
    body: 'Any spending limit on the card is a ceiling on what the card may authorise. It is not money set aside. Every purchase is also checked against available funds in the primary account.',
  },
  {
    heading: 'Activity is visible to the accountholder',
    body: 'The primary accountholder can see every transaction made on this card, including merchant, amount and time.',
  },
  {
    heading: 'The card can be stopped',
    body: 'The primary accountholder can freeze or remove the card at any time. Transactions already authorised may still settle afterwards.',
  },
  {
    heading: 'Card security',
    body: 'The cardholder must keep the card, PIN and passcode secure, and report a lost or stolen card to Optimus without delay.',
  },
  {
    heading: 'Governing terms',
    body: 'This summary sits alongside the Optimus Deposit Account Agreement and the Optimus Card Agreement, which apply in full.',
  },
]

export const RELATIONSHIP_LABEL: Record<string, string> = {
  spouse: 'Spouse or partner',
  child: 'Child',
  parent: 'Parent',
}

export const DECLINE_RULE_LABEL: Record<string, string> = {
  card_frozen: 'Card frozen',
  card_inactive: 'Card not active',
  category_blocked: POLICY_CATEGORY_LABEL,
  online_blocked: 'Online purchases turned off',
  atm_blocked: 'ATM withdrawals turned off',
  international_blocked: 'International use turned off',
  per_transaction_cap: 'Per-transaction cap',
  monthly_limit: 'Monthly card spending limit',
  insufficient_account_funds: 'Available funds in the primary account',
}
