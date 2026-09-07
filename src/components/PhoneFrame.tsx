import type { ReactNode } from 'react'
import { BatteryFull, Signal, Wifi } from 'lucide-react'
import { cx } from '../lib/format'

/**
 * Centred phone frame. Every mode renders inside one of these so the
 * prototype reads as a mobile banking app when viewed on a desktop.
 */
export function PhoneFrame({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div className={cx('flex flex-col items-center', className)}>
      <div className="rounded-phone bg-neutral-900 p-[10px] shadow-device">
        <div className="relative flex h-[812px] max-h-[calc(100vh-11rem)] w-[390px] flex-col overflow-hidden rounded-screen bg-paper">
          <StatusBar />
          {children}
          <HomeIndicator />
        </div>
      </div>
    </div>
  )
}

function StatusBar() {
  return (
    <div
      className="relative z-30 flex shrink-0 items-center justify-between bg-paper px-6 pb-1 pt-3.5 text-ink"
      aria-hidden
    >
      <span className="numeral text-[13px] font-semibold">9:41</span>
      <div className="pointer-events-none absolute left-1/2 top-2 h-6 w-[104px] -translate-x-1/2 rounded-full bg-neutral-900" />
      <div className="flex items-center gap-1.5">
        <Signal className="h-3.5 w-3.5" />
        <Wifi className="h-3.5 w-3.5" />
        <BatteryFull className="h-4 w-4" />
      </div>
    </div>
  )
}

function HomeIndicator() {
  return (
    <div className="shrink-0 bg-paper pb-2 pt-1.5" aria-hidden>
      <div className="mx-auto h-[5px] w-[134px] rounded-full bg-ink/25" />
    </div>
  )
}
