export const money = (value: number, opts: { cents?: boolean } = {}) => {
  const { cents = true } = opts
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: cents ? 2 : 0,
    maximumFractionDigits: cents ? 2 : 0,
  }).format(value)
}

/** Splits money for typographic treatment: large integer, small cents. */
export const moneyParts = (value: number) => {
  const abs = Math.abs(value)
  const whole = Math.floor(abs)
  const cents = Math.round((abs - whole) * 100)
  return {
    sign: value < 0 ? '−' : '',
    whole: new Intl.NumberFormat('en-US').format(whole),
    cents: String(cents).padStart(2, '0'),
  }
}

export const shortDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

export const longDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

export const timeOfDay = (iso: string) =>
  new Date(iso).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  })

export const stamp = (iso: string) =>
  `${new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })} at ${timeOfDay(iso)}`

export const relativeDay = (iso: string) => {
  const then = new Date(iso)
  const now = new Date()
  const startOf = (d: Date) =>
    new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
  const days = Math.round((startOf(now) - startOf(then)) / 86_400_000)
  if (days <= 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days} days ago`
  return shortDate(iso)
}

export const ageFromDob = (dob: string) => {
  if (!dob) return null
  const birth = new Date(dob)
  if (Number.isNaN(birth.getTime())) return null
  const now = new Date()
  let age = now.getFullYear() - birth.getFullYear()
  const monthDelta = now.getMonth() - birth.getMonth()
  if (monthDelta < 0 || (monthDelta === 0 && now.getDate() < birth.getDate())) {
    age -= 1
  }
  return age
}

export const initials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')

export const firstName = (name: string) => name.trim().split(/\s+/)[0] ?? name

/** Groups a card number into 4-digit blocks for display. */
export const groupCardNumber = (raw: string) =>
  raw.replace(/\s+/g, '').replace(/(.{4})/g, '$1 ').trim()

export const cx = (...parts: Array<string | false | null | undefined>) =>
  parts.filter(Boolean).join(' ')

export const uid = (prefix: string) =>
  `${prefix}_${Math.random().toString(36).slice(2, 9)}`

export const addDays = (iso: string, days: number) => {
  const d = new Date(iso)
  d.setDate(d.getDate() + days)
  return d.toISOString()
}

export const addMonths = (iso: string, months: number) => {
  const d = new Date(iso)
  d.setMonth(d.getMonth() + months)
  return d.toISOString()
}

export const endOfMonth = (iso: string) => {
  const d = new Date(iso)
  return new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59).toISOString()
}
