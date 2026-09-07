#!/usr/bin/env node
/**
 * Copy audit for Member-facing UI.
 *
 * Two of the product rules are about vocabulary, which makes them the easiest
 * rules to break by accident as screens get added. This script enforces them
 * mechanically:
 *
 *   1. Banned accountholder vocabulary never reaches a Member-facing screen.
 *   2. Every Member-facing file that renders a spending figure also renders
 *      the funds disclosure.
 *
 * Member-facing files read account funds through `availableFunds(state)`
 * rather than `state.account.balance`, which is what lets rule 1 be a plain
 * grep instead of a fragile parse.
 *
 * Run: npm run audit:copy
 */

import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

const ROOT = new URL('..', import.meta.url).pathname

/** Directories whose output a Member sees. */
const MEMBER_FACING = [
  'src/modes/member',
  'src/modes/onboarding',
]

/**
 * `wallet` is deliberately NOT banned outright: the spec requires an
 * Apple / Google Wallet button. What is banned is the sense of a Member
 * holding a wallet of their own.
 */
const BANNED = [
  {
    pattern: /\bbalances?\b/i,
    why: 'A Member has no balance. Use "card spending limit".',
  },
  {
    pattern: /\byour money\b/i,
    why: 'No money in a Member\'s name. Describe the card ceiling instead.',
  },
  {
    pattern: /\btop\s*-?\s*up\b/i,
    why: 'Nothing is transferred to a Member. Use "budget refreshes".',
  },
  {
    pattern: /\bfunds available to you\b/i,
    why: 'Funds belong to the primary account, not the Member.',
  },
  {
    pattern: /\b(your|own|their)\s+wallet\b(?!\s*(button|entry))/i,
    why: 'A Member has no wallet of their own (Apple/Google Wallet is fine).',
  },
  {
    pattern: /\bwallet balance\b/i,
    why: 'A Member has no wallet and no balance.',
  },
  {
    pattern: /\breserved\b/i,
    why: 'No spending figure may be framed as reserved.',
  },
  {
    pattern: /\bguaranteed\b/i,
    why: 'No spending figure may be framed as guaranteed.',
  },
]

/** Signals that a file renders a spending figure to a Member. */
const SPEND_FIGURE = /money\(|MoneyDisplay|LimitBar/

/** Satisfies the disclosure requirement. */
const DISCLOSURE = /FundsDisclosure|FUNDS_DISCLOSURE/

const walk = (dir) => {
  const out = []
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) out.push(...walk(full))
    else if (/\.tsx?$/.test(entry)) out.push(full)
  }
  return out
}

const files = MEMBER_FACING.flatMap((d) => walk(join(ROOT, d)))

const violations = []
const missingDisclosure = []

for (const file of files) {
  const source = readFileSync(file, 'utf8')
  const rel = relative(ROOT, file)

  source.split('\n').forEach((line, i) => {
    // Skip comment lines: they explain the rules and would self-trip.
    const trimmed = line.trim()
    if (
      trimmed.startsWith('//') ||
      trimmed.startsWith('*') ||
      trimmed.startsWith('/*')
    ) {
      return
    }

    for (const { pattern, why } of BANNED) {
      if (pattern.test(line)) {
        violations.push({ rel, line: i + 1, text: trimmed, why })
      }
    }
  })

  if (SPEND_FIGURE.test(source) && !DISCLOSURE.test(source)) {
    missingDisclosure.push(rel)
  }
}

let failed = false

if (violations.length > 0) {
  failed = true
  console.error('\n✗ Banned vocabulary in Member-facing UI:\n')
  for (const v of violations) {
    console.error(`  ${v.rel}:${v.line}`)
    console.error(`    ${v.text}`)
    console.error(`    → ${v.why}\n`)
  }
}

if (missingDisclosure.length > 0) {
  failed = true
  console.error(
    '\n✗ Member-facing files showing a spending figure without the funds disclosure:\n',
  )
  for (const f of missingDisclosure) console.error(`  ${f}`)
  console.error('')
}

if (failed) {
  console.error(
    `Audited ${files.length} Member-facing files — see failures above.\n`,
  )
  process.exit(1)
}

console.log(
  `✓ Copy audit passed. ${files.length} Member-facing files: no banned vocabulary, every spending figure carries the funds disclosure.`,
)
