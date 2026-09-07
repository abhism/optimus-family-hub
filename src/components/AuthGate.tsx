import { useEffect, useState } from 'react'
import { Check, ScanFace, ShieldCheck } from 'lucide-react'
import { Button } from './ui/Button'
import { PinPad } from './ui/PinPad'

type Phase = 'prompt' | 'scanning' | 'passcode' | 'done'

/**
 * Mock authentication gate.
 *
 * Stands between a decline notification and any change to a Member's limits
 * (spec 1.7 step 2). It is deliberately not skippable — a limit change is a
 * change to who can spend the User's money, so it re-authenticates.
 */
export function AuthGate({
  reason,
  onSuccess,
  onCancel,
}: {
  reason: string
  onSuccess: () => void
  onCancel: () => void
}) {
  const [phase, setPhase] = useState<Phase>('prompt')

  useEffect(() => {
    if (phase === 'scanning') {
      const t = setTimeout(() => setPhase('done'), 1250)
      return () => clearTimeout(t)
    }
    if (phase === 'done') {
      const t = setTimeout(onSuccess, 620)
      return () => clearTimeout(t)
    }
  }, [phase, onSuccess])

  return (
    <div className="absolute inset-0 z-50 flex animate-fade-in flex-col bg-paper">
      <div className="flex flex-1 flex-col items-center justify-center px-7 text-center">
        {phase === 'passcode' ? (
          <PinPad
            title="Enter your passcode"
            subtitle={reason}
            onComplete={() => setPhase('done')}
          />
        ) : (
          <>
            <div className="relative grid h-24 w-24 place-items-center">
              {phase === 'scanning' && (
                <span
                  className="absolute inset-0 animate-pulse-ring rounded-full border-2 border-accent"
                  aria-hidden
                />
              )}
              <div
                className={
                  phase === 'done'
                    ? 'grid h-24 w-24 place-items-center rounded-full bg-positive text-white'
                    : 'grid h-24 w-24 place-items-center rounded-full bg-accent-soft text-accent'
                }
              >
                {phase === 'done' ? (
                  <Check className="h-10 w-10" aria-hidden />
                ) : (
                  <ScanFace
                    className={
                      phase === 'scanning'
                        ? 'h-11 w-11 animate-scan-face'
                        : 'h-11 w-11'
                    }
                    aria-hidden
                  />
                )}
              </div>
            </div>

            <h2 className="mt-7 text-[19px] font-semibold" aria-live="polite">
              {phase === 'done'
                ? 'Verified'
                : phase === 'scanning'
                  ? 'Looking for you…'
                  : 'Confirm it’s you'}
            </h2>
            <p className="mt-2 max-w-[17rem] text-[13.5px] leading-relaxed text-ink-muted">
              {phase === 'done'
                ? 'Taking you to the transaction.'
                : reason}
            </p>

            {phase === 'prompt' && (
              <div className="mt-8 w-full max-w-[17rem] space-y-2.5">
                <Button full onClick={() => setPhase('scanning')} icon={<ScanFace className="h-4 w-4" />}>
                  Confirm with Face ID
                </Button>
                <Button full variant="secondary" onClick={() => setPhase('passcode')}>
                  Use passcode instead
                </Button>
                <Button full variant="ghost" size="md" onClick={onCancel}>
                  Not now
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      <div className="flex items-center justify-center gap-1.5 pb-7 text-[11.5px] text-ink-faint">
        <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
        Optimus asks for this before any change to card limits
      </div>
    </div>
  )
}
