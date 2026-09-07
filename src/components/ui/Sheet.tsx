import type { ReactNode } from 'react'
import { X } from 'lucide-react'

/** Bottom sheet, constrained to the phone frame it is rendered inside. */
export function Sheet({
  open,
  onClose,
  title,
  children,
  footer,
}: {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  footer?: ReactNode
}) {
  if (!open) return null

  return (
    <div className="absolute inset-0 z-40 flex flex-col justify-end">
      <button
        type="button"
        aria-label="Dismiss"
        onClick={onClose}
        className="absolute inset-0 animate-fade-in bg-ink/30 backdrop-blur-[2px]"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="relative max-h-[86%] animate-sheet-up overflow-hidden rounded-t-3xl bg-paper shadow-lift"
      >
        <div className="flex items-center gap-2 border-b border-line px-4 py-3.5">
          <h2 className="flex-1 text-[15px] font-semibold">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="tap -mr-1 grid h-8 w-8 place-items-center rounded-full hover:bg-neutral-200/60"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="thin-scrollbar max-h-[52vh] overflow-y-auto px-4 py-4">
          {children}
        </div>
        {footer && (
          <div className="border-t border-line bg-white px-4 pb-5 pt-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}
