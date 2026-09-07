import type { Mode } from '../store/types'

/**
 * Mode ↔ URL hash mapping.
 *
 * The brief called for no router, and there isn't one — navigation inside a
 * mode is still pure state. But the *mode* itself is the one thing a reviewer
 * wants to link to, bookmark and reach with the browser back button, so it
 * lives in the hash.
 */
export const MODE_SLUG: Record<Mode, string> = {
  select: '',
  user: 'user',
  onboarding: 'invite',
  'member-spouse': 'spouse',
  'member-child': 'child',
}

const SLUG_TO_MODE = Object.entries(MODE_SLUG).reduce<Record<string, Mode>>(
  (acc, [mode, slug]) => {
    acc[slug] = mode as Mode
    return acc
  },
  {},
)

export const hashForMode = (mode: Mode) =>
  mode === 'select' ? '#/' : `#/${MODE_SLUG[mode]}`

/** Reads a mode out of a location hash, or null if it names nothing valid. */
export const modeFromHash = (hash: string): Mode | null => {
  const slug = hash.replace(/^#\/?/, '').trim().toLowerCase()
  if (slug === '') return 'select'
  return SLUG_TO_MODE[slug] ?? null
}
