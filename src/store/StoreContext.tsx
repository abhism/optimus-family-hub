import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  type ReactNode,
} from 'react'
import type { Action, TransactionCandidate } from './actions'
import { hydrate, reducer } from './reducer'
import { SIM_MERCHANTS, STORAGE_KEY } from './seed'
import type { AppState, Member, Mode, Screen } from './types'
import { remainingLimit } from './engine'
import { addDays, endOfMonth, uid } from '../lib/format'
import { hashForMode, modeFromHash } from '../lib/modeUrl'

interface StoreValue {
  state: AppState
  dispatch: React.Dispatch<Action>
}

const StoreContext = createContext<StoreValue | null>(null)

const readStorage = () => {
  try {
    return window.localStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
}

/** Persisted state, with the URL hash winning over the stored mode. */
const initialState = (): AppState => {
  const stored = hydrate(readStorage())
  const fromHash = modeFromHash(window.location.hash)
  return fromHash && fromHash !== stored.mode
    ? reducer(stored, { type: 'SET_MODE', mode: fromHash })
    : stored
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, null, initialState)

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      // Private browsing or a full quota — the demo still works in memory.
    }
  }, [state])

  // Mode -> URL. replaceState on first paint so we don't add a history entry
  // for the mode the app simply loaded in.
  const synced = useRef(false)
  useEffect(() => {
    const next = hashForMode(state.mode)
    if (window.location.hash === next) {
      synced.current = true
      return
    }
    if (synced.current) {
      window.location.hash = next
    } else {
      window.history.replaceState(null, '', next)
      synced.current = true
    }
  }, [state.mode])

  // URL -> mode, so browser back and forward move between modes.
  useEffect(() => {
    const onHashChange = () => {
      const mode = modeFromHash(window.location.hash)
      if (mode) dispatch({ type: 'SET_MODE', mode })
    }
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  const value = useMemo(() => ({ state, dispatch }), [state])

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used inside StoreProvider')
  return ctx
}

export const useAppState = () => useStore().state

/**
 * Action helpers.
 *
 * Anything non-deterministic — ids, timestamps, which merchant a simulated
 * purchase hits — is generated here, so the reducer itself stays pure.
 */
export function useActions() {
  const { state, dispatch } = useStore()

  const setMode = useCallback(
    (mode: Mode) => dispatch({ type: 'SET_MODE', mode }),
    [dispatch],
  )

  const push = useCallback(
    (screen: Screen) => dispatch({ type: 'NAV_PUSH', screen }),
    [dispatch],
  )

  const pop = useCallback(() => dispatch({ type: 'NAV_POP' }), [dispatch])

  const reset = useCallback(
    (screen: Screen) => dispatch({ type: 'NAV_RESET', screen }),
    [dispatch],
  )

  const resetDemo = useCallback(() => {
    try {
      window.localStorage.removeItem(STORAGE_KEY)
    } catch {
      /* no-op */
    }
    dispatch({ type: 'RESET_DEMO' })
  }, [dispatch])

  /** Runs one candidate purchase through the authorization engine. */
  const attemptTransaction = useCallback(
    (candidate: Omit<TransactionCandidate, 'id' | 'at'>) => {
      dispatch({
        type: 'ATTEMPT_TRANSACTION',
        candidate: {
          ...candidate,
          id: uid('txn'),
          at: new Date().toISOString(),
        },
        notificationId: uid('ntf'),
      })
    },
    [dispatch],
  )

  /** Simulate panel: a plausible everyday purchase that should approve. */
  const simulateTransaction = useCallback(
    (member: Member) => {
      const pool = SIM_MERCHANTS[member.relationship]
      const pick = pool[Math.floor(Math.random() * pool.length)]!
      attemptTransaction({
        cardId: member.id,
        merchant: pick.merchant,
        category: pick.category,
        amount: pick.amount,
        channel: pick.channel,
      })
    },
    [attemptTransaction],
  )

  /**
   * Simulate panel: a purchase engineered to breach the tightest rule the card
   * actually has, so the decline reason is always specific and truthful.
   */
  const simulateDecline = useCallback(
    (member: Member) => {
      const cap = member.controls.perTransactionCap
      const remaining = remainingLimit(member)

      if (cap !== null) {
        attemptTransaction({
          cardId: member.id,
          merchant: 'Steam',
          category: 'entertainment',
          amount: Number((cap + 15).toFixed(2)),
          channel: 'online',
        })
        return
      }
      if (remaining !== null) {
        attemptTransaction({
          cardId: member.id,
          merchant: 'Best Buy',
          category: 'shopping',
          amount: Number((remaining + 20).toFixed(2)),
          channel: 'instore',
        })
        return
      }
      // Spouse card with no User-set limits: the only binding rule is funds.
      attemptTransaction({
        cardId: member.id,
        merchant: 'Nordstrom',
        category: 'shopping',
        amount: Number((state.account.balance + 50).toFixed(2)),
        channel: 'instore',
      })
    },
    [attemptTransaction, state.account.balance],
  )

  /** Simulate panel: run the recurring budget refresh for a member. */
  const simulateRefresh = useCallback(
    (member: Member) => {
      const now = new Date().toISOString()
      dispatch({
        type: 'RUN_REFRESH',
        id: member.id,
        at: now,
        periodEnd: endOfMonth(now),
        nextAt:
          member.refresh.cadence === 'weekly'
            ? addDays(now, 7)
            : endOfMonth(now),
        notificationId: uid('ntf'),
      })
    },
    [dispatch],
  )

  /** Simulate panel: push account funds below a member's card limit. */
  const dropBalanceBelowLimit = useCallback(
    (member: Member) => {
      const limit = member.monthlyLimit ?? 200
      const target = Math.max(0, Math.round(limit * 0.42 * 100) / 100)
      dispatch({ type: 'SET_BALANCE', balance: target })
    },
    [dispatch],
  )

  const freeze = useCallback(
    (id: string, source: 'user' | 'member') =>
      dispatch({
        type: 'FREEZE',
        id,
        source,
        at: new Date().toISOString(),
        notificationId: uid('ntf'),
      }),
    [dispatch],
  )

  const unfreeze = useCallback(
    (id: string, by: 'user' | 'member') =>
      dispatch({ type: 'UNFREEZE', id, by }),
    [dispatch],
  )

  const requestRemoval = useCallback(
    (id: string) =>
      dispatch({
        type: 'REQUEST_REMOVAL',
        id,
        at: new Date().toISOString(),
        notificationId: uid('ntf'),
      }),
    [dispatch],
  )

  return {
    state,
    dispatch,
    setMode,
    push,
    pop,
    reset,
    resetDemo,
    attemptTransaction,
    simulateTransaction,
    simulateDecline,
    simulateRefresh,
    dropBalanceBelowLimit,
    freeze,
    unfreeze,
    requestRemoval,
  }
}
