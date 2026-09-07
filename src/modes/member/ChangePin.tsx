import { useState } from 'react'
import { Check, ShieldCheck } from 'lucide-react'
import { useActions } from '../../store/StoreContext'
import { AppBar, ScreenBody, Surface } from '../../components/ui/Layout'
import { Button } from '../../components/ui/Button'
import { PinPad } from '../../components/ui/PinPad'
import type { Member } from '../../store/types'

/** Change PIN — available to every Member on their own card. */
export function ChangePin({ member }: { member: Member }) {
  const { pop, dispatch } = useActions()
  const [stage, setStage] = useState<'current' | 'create' | 'confirm' | 'done'>(
    member.card.pinSet ? 'current' : 'create',
  )
  const [first, setFirst] = useState('')
  const [error, setError] = useState<string | null>(null)

  if (stage === 'done') {
    return (
      <>
        <AppBar title="PIN changed" onBack={pop} />
        <ScreenBody className="flex flex-col items-center text-center">
          <div className="mt-8 grid h-16 w-16 place-items-center rounded-full bg-positive text-white">
            <Check className="h-8 w-8" aria-hidden />
          </div>
          <h1 className="mt-5 text-[20px] font-semibold">Your PIN is updated</h1>
          <p className="mt-2 max-w-[17rem] text-[13.5px] leading-relaxed text-ink-muted">
            Use the new PIN at card machines and ATMs. It works right away.
          </p>

          <Surface className="mt-6 w-full p-4 text-left">
            <div className="flex items-start gap-2.5">
              <ShieldCheck
                className="mt-[1px] h-4 w-4 shrink-0 text-positive"
                aria-hidden
              />
              <p className="text-[12.5px] leading-relaxed text-ink-muted">
                Never share your PIN, and don’t write it on the card. Optimus
                will never ask you for it.
              </p>
            </div>
          </Surface>

          <Button full className="mt-6" onClick={pop}>
            Done
          </Button>
        </ScreenBody>
      </>
    )
  }

  const titles = {
    current: 'Enter your current PIN',
    create: 'Choose a new PIN',
    confirm: 'Confirm your new PIN',
  } as const

  const subtitles = {
    current: 'So we know it’s you making the change.',
    create: 'Four digits. Avoid anything obvious like 1234.',
    confirm: 'Enter the same four digits again.',
  } as const

  return (
    <>
      <AppBar title="Change PIN" onBack={pop} />
      <ScreenBody className="flex flex-col justify-center">
        <PinPad
          title={titles[stage]}
          subtitle={subtitles[stage]}
          error={error}
          onComplete={(code) => {
            if (stage === 'current') {
              // Mock verification: any four digits are accepted.
              setError(null)
              setStage('create')
            } else if (stage === 'create') {
              setFirst(code)
              setError(null)
              setStage('confirm')
            } else if (code === first) {
              dispatch({
                type: 'PATCH_MEMBER',
                id: member.id,
                patch: { card: { ...member.card, pinSet: true } },
              })
              setError(null)
              setStage('done')
            } else {
              setError('Those didn’t match. Try again.')
              setFirst('')
              setStage('create')
            }
          }}
        />
      </ScreenBody>
    </>
  )
}
