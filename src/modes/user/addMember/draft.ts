import type { Controls, SupportedRelationship } from '../../../store/types'

/** Draft collected across the Add Member steps. */
export interface MemberDraft {
  relationship: SupportedRelationship | null
  name: string
  dob: string
  address: string
  monthlyLimit: number
  controls: Controls
  parentalConsent: boolean
  parentalConsentAt: string | null
  reciprocalAck: boolean
}

export const emptyDraft = (): MemberDraft => ({
  relationship: null,
  name: '',
  dob: '',
  address: '218 Kestrel Row, Apt 4B, Austin, TX 78704',
  monthlyLimit: 150,
  controls: {
    onlinePurchases: true,
    atmWithdrawals: false,
    internationalUse: false,
    blockGamblingAdult: true,
    perTransactionCap: 50,
  },
  parentalConsent: false,
  parentalConsentAt: null,
  reciprocalAck: false,
})

/** Spouse cards ship with minimal restrictions and no User-set limit. */
export const spouseDefaults = (): Controls => ({
  onlinePurchases: true,
  atmWithdrawals: true,
  internationalUse: true,
  blockGamblingAdult: false,
  perTransactionCap: null,
})

const digits = (n: number) =>
  Array.from({ length: n }, () => Math.floor(Math.random() * 10)).join('')

export const generateCard = () => {
  const number = `4213${digits(12)}`
  const expiryDate = new Date()
  expiryDate.setFullYear(expiryDate.getFullYear() + 4)
  const expiry = `${String(expiryDate.getMonth() + 1).padStart(2, '0')}/${String(
    expiryDate.getFullYear(),
  ).slice(2)}`
  return {
    number,
    last4: number.slice(-4),
    expiry,
    cvv: digits(3),
  }
}

export const STEP_TITLES = [
  'Relationship',
  'Their details',
  'Card setup',
  'Review',
  'Invitation',
]
