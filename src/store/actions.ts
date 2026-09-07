import type {
  Channel,
  ConsentRecord,
  Controls,
  FreezeSource,
  Member,
  MerchantCategory,
  Mode,
  NotificationKind,
  NotificationPrefs,
  RefreshCadence,
  Screen,
} from './types'

/** Candidate purchase handed to the reducer, which decides approve vs decline. */
export interface TransactionCandidate {
  id: string
  cardId: string
  merchant: string
  category: MerchantCategory
  amount: number
  at: string
  channel: Channel
}

export type Action =
  | { type: 'SET_MODE'; mode: Mode }
  | { type: 'NAV_PUSH'; screen: Screen }
  | { type: 'NAV_POP' }
  | { type: 'NAV_RESET'; screen: Screen }
  | { type: 'RESET_DEMO' }
  | { type: 'RESET_EMPTY' }
  | { type: 'SET_BALANCE'; balance: number }
  | { type: 'ADD_MEMBER'; member: Member; consents: ConsentRecord[] }
  | { type: 'PATCH_MEMBER'; id: string; patch: Partial<Member> }
  | { type: 'PATCH_CONTROLS'; id: string; patch: Partial<Controls> }
  | {
      type: 'SET_LIMIT'
      id: string
      monthlyLimit: number | null
      cadence: RefreshCadence
      nextAt: string | null
    }
  | { type: 'ONE_OFF_INCREASE'; id: string; amount: number }
  | { type: 'SET_NOTIF_PREFS'; id: string; patch: Partial<NotificationPrefs> }
  | {
      type: 'FREEZE'
      id: string
      source: FreezeSource
      at: string
      notificationId: string
    }
  | { type: 'UNFREEZE'; id: string; by: FreezeSource }
  | { type: 'REMOVE_MEMBER'; id: string }
  | {
      type: 'REQUEST_REMOVAL'
      id: string
      at: string
      notificationId: string
    }
  | { type: 'CANCEL_REMOVAL_REQUEST'; id: string }
  | { type: 'ADD_CONSENT'; record: ConsentRecord }
  | { type: 'ONBOARDING_START'; memberId: string }
  | { type: 'ONBOARDING_EXIT' }
  | { type: 'ONBOARDING_STEP'; step: number }
  | { type: 'ONBOARDING_PATCH_MEMBER'; patch: Partial<Member> }
  | { type: 'ONBOARDING_COMPLETE'; at: string }
  | {
      type: 'ATTEMPT_TRANSACTION'
      candidate: TransactionCandidate
      notificationId: string
    }
  | {
      type: 'RUN_REFRESH'
      id: string
      at: string
      periodEnd: string
      nextAt: string | null
      notificationId: string
    }
  | { type: 'READ_NOTIFICATION'; id: string }
  | { type: 'DISMISS_NOTIFICATION'; id: string }
  | { type: 'CLEAR_MEMBER_NOTIFICATIONS'; id: string; kind: NotificationKind }
