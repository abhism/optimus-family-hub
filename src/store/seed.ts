import type { AppState, CardDetails, Member, Transaction } from './types'
import { endOfMonth } from '../lib/format'

export const SCHEMA_VERSION = 1
export const STORAGE_KEY = 'optimus.familyhub.v1'

const hoursAgo = (h: number) =>
  new Date(Date.now() - h * 3_600_000).toISOString()

const daysAgo = (d: number) => hoursAgo(d * 24)

const monthStart = () => {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
}

export const makeCard = (
  last4: string,
  number: string,
  expiry: string,
  cvv: string,
  overrides: Partial<CardDetails> = {},
): CardDetails => ({
  last4,
  number,
  expiry,
  cvv,
  network: 'Visa',
  pinSet: false,
  inWallet: false,
  virtualIssuedAt: null,
  physicalOrderedAt: null,
  physicalArrivesBy: null,
  ...overrides,
})

/** Aarav — child, 15, active card. The populated demo state. */
const aarav = (): Member => ({
  id: 'mem_aarav',
  name: 'Aarav Raman',
  relationship: 'child',
  dob: '2011-03-14',
  address: '218 Kestrel Row, Apt 4B, Austin, TX 78704',
  status: 'active',
  freezeSource: null,
  card: makeCard('4417', '4213880244174417', '09/30', '318', {
    pinSet: true,
    inWallet: true,
    virtualIssuedAt: daysAgo(94),
    physicalOrderedAt: daysAgo(94),
    physicalArrivesBy: daysAgo(88),
  }),
  monthlyLimit: 200,
  periodSpend: 86.5,
  periodStart: monthStart(),
  periodEnd: endOfMonth(new Date().toISOString()),
  refresh: { cadence: 'monthly', nextAt: endOfMonth(new Date().toISOString()) },
  controls: {
    onlinePurchases: true,
    atmWithdrawals: false,
    internationalUse: false,
    blockGamblingAdult: true,
    perTransactionCap: 50,
  },
  notifications: { spendAlerts: true, delivery: 'immediate' },
  invite: {
    sentAt: daysAgo(95),
    acceptedAt: daysAgo(94),
    termsAcceptedAt: daysAgo(94),
    passcodeSet: true,
    biometric: true,
  },
  removalRequestedAt: null,
  refreshConstrainedAt: null,
})

/**
 * Meera — spouse, invite sent but not yet accepted. Mode 2 has a real pending
 * invite to open on first run, which then lights up Mode 3 (spouse).
 */
const meera = (): Member => ({
  id: 'mem_meera',
  name: 'Meera Raman',
  relationship: 'spouse',
  dob: '1989-07-22',
  address: '218 Kestrel Row, Apt 4B, Austin, TX 78704',
  status: 'pending',
  freezeSource: null,
  card: makeCard('2071', '4213880290812071', '09/30', '774'),
  monthlyLimit: null,
  periodSpend: 0,
  periodStart: monthStart(),
  periodEnd: endOfMonth(new Date().toISOString()),
  refresh: { cadence: 'none', nextAt: null },
  controls: {
    onlinePurchases: true,
    atmWithdrawals: true,
    internationalUse: true,
    blockGamblingAdult: false,
    perTransactionCap: null,
  },
  notifications: { spendAlerts: true, delivery: 'daily' },
  invite: {
    sentAt: hoursAgo(20),
    acceptedAt: null,
    termsAcceptedAt: null,
    passcodeSet: false,
    biometric: false,
  },
  removalRequestedAt: null,
  refreshConstrainedAt: null,
})

const userTransactions = (): Transaction[] => [
  {
    id: 'txn_u1',
    cardId: 'user',
    merchant: 'Blue Bottle Coffee',
    category: 'dining',
    amount: 6.75,
    at: hoursAgo(5),
    channel: 'instore',
    status: 'approved',
  },
  {
    id: 'txn_u2',
    cardId: 'user',
    merchant: 'Whole Foods Market',
    category: 'groceries',
    amount: 84.32,
    at: hoursAgo(27),
    channel: 'instore',
    status: 'approved',
  },
  {
    id: 'txn_u3',
    cardId: 'user',
    merchant: 'Shell',
    category: 'transport',
    amount: 52.1,
    at: daysAgo(2),
    channel: 'instore',
    status: 'approved',
  },
  {
    id: 'txn_u4',
    cardId: 'user',
    merchant: 'Netflix',
    category: 'subscription',
    amount: 17.99,
    at: daysAgo(3),
    channel: 'online',
    status: 'approved',
  },
  {
    id: 'txn_u5',
    cardId: 'user',
    merchant: 'CVS Pharmacy',
    category: 'shopping',
    amount: 23.14,
    at: daysAgo(4),
    channel: 'instore',
    status: 'approved',
  },
  {
    id: 'txn_u6',
    cardId: 'user',
    merchant: 'Northwind Systems — Payroll',
    category: 'income',
    amount: -3180,
    at: daysAgo(5),
    channel: 'instore',
    status: 'approved',
  },
]

/** Sums to Aarav's 86.50 period spend. */
const aaravTransactions = (): Transaction[] => [
  {
    id: 'txn_a1',
    cardId: 'mem_aarav',
    merchant: 'Chipotle Mexican Grill',
    category: 'dining',
    amount: 14.85,
    at: hoursAgo(8),
    channel: 'instore',
    status: 'approved',
  },
  {
    id: 'txn_a2',
    cardId: 'mem_aarav',
    merchant: 'Steam',
    category: 'entertainment',
    amount: 12.99,
    at: hoursAgo(31),
    channel: 'online',
    status: 'approved',
  },
  {
    id: 'txn_a3',
    cardId: 'mem_aarav',
    merchant: 'SpinCity Slots',
    category: 'gambling',
    amount: 20,
    at: daysAgo(3),
    channel: 'online',
    status: 'declined',
    decline: { rule: 'category_blocked', limitValue: null },
  },
  {
    id: 'txn_a4',
    cardId: 'mem_aarav',
    merchant: 'Target',
    category: 'shopping',
    amount: 28.4,
    at: daysAgo(4),
    channel: 'instore',
    status: 'approved',
  },
  {
    id: 'txn_a5',
    cardId: 'mem_aarav',
    merchant: 'GameStop',
    category: 'entertainment',
    amount: 19.27,
    at: daysAgo(6),
    channel: 'instore',
    status: 'approved',
  },
  {
    id: 'txn_a6',
    cardId: 'mem_aarav',
    merchant: 'Spotify',
    category: 'subscription',
    amount: 10.99,
    at: daysAgo(9),
    channel: 'online',
    status: 'approved',
  },
]

export function seedState(): AppState {
  return {
    schema: SCHEMA_VERSION,
    mode: 'select',
    stack: [{ name: 'account-home' }],
    account: {
      holder: 'Priya Raman',
      firstName: 'Priya',
      balance: 2480,
      card: {
        label: 'Optimus Checking',
        last4: '8032',
        expiry: '04/29',
        network: 'Visa',
      },
    },
    members: [aarav(), meera()],
    transactions: [...userTransactions(), ...aaravTransactions()],
    notifications: [],
    consents: [
      {
        id: 'con_aarav_parental',
        memberId: 'mem_aarav',
        type: 'parental_consent',
        actor: 'Priya Raman',
        at: daysAgo(95),
      },
      {
        id: 'con_aarav_terms',
        memberId: 'mem_aarav',
        type: 'cardholder_terms',
        actor: 'Aarav Raman',
        at: daysAgo(94),
      },
      {
        id: 'con_meera_invite',
        memberId: 'mem_meera',
        type: 'invitation_sent',
        actor: 'Priya Raman',
        at: hoursAgo(20),
      },
    ],
    onboarding: { memberId: null, step: 0 },
  }
}

/** Merchants used by the Simulate panel, by relationship. */
export const SIM_MERCHANTS = {
  child: [
    { merchant: 'Chipotle Mexican Grill', category: 'dining', amount: 13.4, channel: 'instore' },
    { merchant: 'Steam', category: 'entertainment', amount: 24.99, channel: 'online' },
    { merchant: 'Starbucks', category: 'dining', amount: 6.45, channel: 'instore' },
    { merchant: 'GameStop', category: 'entertainment', amount: 34.5, channel: 'instore' },
    { merchant: 'Uber', category: 'transport', amount: 18.2, channel: 'online' },
  ],
  spouse: [
    { merchant: 'Trader Joe’s', category: 'groceries', amount: 62.18, channel: 'instore' },
    { merchant: 'Sweetgreen', category: 'dining', amount: 16.9, channel: 'instore' },
    { merchant: 'Lyft', category: 'transport', amount: 22.4, channel: 'online' },
    { merchant: 'Nordstrom', category: 'shopping', amount: 118.0, channel: 'instore' },
    { merchant: 'Shell', category: 'transport', amount: 48.63, channel: 'instore' },
  ],
} as const
