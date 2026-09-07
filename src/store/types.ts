/**
 * Domain model for Family Hub.
 *
 * The single most important idea encoded here: a Member has no account and no
 * balance. `monthlyLimit` is a policy ceiling on an add-on card that draws on
 * the User's account — never a pot of reserved money. See store/engine.ts for
 * how that ceiling interacts with account funds at authorization time.
 */

export type Mode =
  | 'select'
  | 'user'
  | 'onboarding'
  | 'member-spouse'
  | 'member-child'

export type Relationship = 'spouse' | 'child' | 'parent'

/** Relationships we actually issue cards for. `parent` is intentionally excluded. */
export type SupportedRelationship = Exclude<Relationship, 'parent'>

export type MemberStatus = 'pending' | 'active' | 'frozen' | 'removed'

/** Who applied the current freeze. Determines who is allowed to lift it. */
export type FreezeSource = 'user' | 'member'

export type Channel = 'instore' | 'online' | 'atm' | 'international'

export type DeclineRule =
  | 'card_frozen'
  | 'card_inactive'
  | 'category_blocked'
  | 'online_blocked'
  | 'atm_blocked'
  | 'international_blocked'
  | 'per_transaction_cap'
  | 'monthly_limit'
  | 'insufficient_account_funds'

export type RefreshCadence = 'none' | 'weekly' | 'monthly'

export type MerchantCategory =
  | 'groceries'
  | 'dining'
  | 'transport'
  | 'entertainment'
  | 'shopping'
  | 'subscription'
  | 'gambling'
  | 'cash'
  | 'income'

export interface CardDetails {
  last4: string
  number: string
  expiry: string
  cvv: string
  network: 'Visa'
  pinSet: boolean
  inWallet: boolean
  virtualIssuedAt: string | null
  physicalOrderedAt: string | null
  physicalArrivesBy: string | null
}

export interface Controls {
  onlinePurchases: boolean
  atmWithdrawals: boolean
  internationalUse: boolean
  /** Policy default, on at issue. */
  blockGamblingAdult: boolean
  perTransactionCap: number | null
}

export interface NotificationPrefs {
  spendAlerts: boolean
  delivery: 'immediate' | 'daily'
}

export interface InviteRecord {
  sentAt: string
  acceptedAt: string | null
  termsAcceptedAt: string | null
  passcodeSet: boolean
  biometric: boolean
}

export interface Member {
  id: string
  name: string
  relationship: SupportedRelationship
  dob: string
  address: string
  status: MemberStatus
  freezeSource: FreezeSource | null
  card: CardDetails
  /**
   * Policy ceiling for the period, in dollars. `null` for spouse cards, which
   * ship without a User-set limit by design.
   */
  monthlyLimit: number | null
  periodSpend: number
  periodStart: string
  periodEnd: string
  refresh: { cadence: RefreshCadence; nextAt: string | null }
  controls: Controls
  notifications: NotificationPrefs
  invite: InviteRecord
  /** Child-initiated removal request. The User still confirms. */
  removalRequestedAt: string | null
  /**
   * Set when a budget refresh landed while account funds sat below the card's
   * refreshed ceiling. Nothing failed to move — no money moves at refresh — but
   * the card cannot actually authorise up to its limit until funds recover.
   */
  refreshConstrainedAt: string | null
}

export interface Transaction {
  id: string
  /** `'user'` for the accountholder's own card, otherwise a Member id. */
  cardId: string
  merchant: string
  category: MerchantCategory
  /** Positive is a debit, negative is a credit. */
  amount: number
  at: string
  channel: Channel
  status: 'approved' | 'declined'
  decline?: { rule: DeclineRule; limitValue: number | null }
}

export type NotificationKind =
  | 'decline'
  | 'refresh_failed'
  | 'freeze'
  | 'spend'
  | 'low_funds'

export interface AppNotification {
  id: string
  kind: NotificationKind
  memberId: string | null
  transactionId: string | null
  at: string
  read: boolean
  title: string
  body: string
}

export interface ConsentRecord {
  id: string
  memberId: string
  type:
    | 'parental_consent'
    | 'cardholder_terms'
    | 'reciprocal_visibility_ack'
    | 'invitation_sent'
  actor: string
  at: string
}

export interface UserCard {
  label: string
  last4: string
  expiry: string
  network: 'Visa'
}

export type Screen =
  // Mode 1 — User app
  | { name: 'account-home' }
  | { name: 'family-hub' }
  | { name: 'add-member' }
  | { name: 'member-detail'; memberId: string }
  | { name: 'spending-limit'; memberId: string }
  | { name: 'controls'; memberId: string }
  | { name: 'notification-settings'; memberId: string }
  | { name: 'remove-member'; memberId: string }
  | { name: 'decline-resolve'; notificationId: string }
  // Mode 2 — Invitation & onboarding
  | { name: 'invite-picker' }
  | { name: 'onboarding' }
  // Mode 3 — Existing member
  | { name: 'm-home' }
  | { name: 'm-shared-activity' }
  | { name: 'm-card-rules' }
  | { name: 'm-declined'; transactionId: string }
  | { name: 'm-settings' }
  | { name: 'm-change-pin' }
  | { name: 'm-report-lost' }
  | { name: 'm-end-access' }
  | { name: 'm-request-removal' }
  | { name: 'm-invite-pending' }

export interface AppState {
  schema: number
  mode: Mode
  /** Navigation stack for the active mode. Reset on mode change. */
  stack: Screen[]
  account: {
    holder: string
    firstName: string
    balance: number
    card: UserCard
  }
  members: Member[]
  transactions: Transaction[]
  notifications: AppNotification[]
  consents: ConsentRecord[]
  onboarding: {
    memberId: string | null
    step: number
  }
}
