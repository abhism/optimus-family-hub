# Optimus — Family Hub

A clickable prototype of a neobank feature that lets an accountholder issue
**add-on cards** to family members. No backend, no API — all state is local,
mocked, and persisted to `localStorage`.

React + Vite + TypeScript · Tailwind CSS · lucide-react · React Context +
`useReducer`.

---

## Running it

Node 18+ is required (Vite 5). An `.nvmrc` pins Node 20:

```bash
nvm use          # or: nvm install 20
npm install
npm run dev      # http://localhost:5173
```

Other scripts:

| Script | What it does |
| --- | --- |
| `npm run dev` | Dev server |
| `npm run build` | Typecheck, then production build |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run audit:copy` | Enforces the Member-facing copy rules (see below) |
| `npm run verify` | Typecheck + copy audit + build |

---

## The account model

This is the idea the whole interface is built around, and the thing most
family-banking demos get wrong.

A Member card is an **add-on card on the User's existing account**. The Member
is an *authorized user*, not an accountholder. So:

- A Member has **no account and no funds of their own**.
- A Member's spending limit is a **policy ceiling, not reserved money**.
- Every Member transaction authorizes against the **lower of** the card's
  spending limit and the User's available account funds.
- Two Members can hold limits that sum to more than the account holds. This is
  expected, and the UI never implies otherwise.

Terminology, used consistently in code and UI:

- **User** — the Optimus primary accountholder (Priya Raman)
- **Member** — a family member who receives an add-on card

`src/store/engine.ts` is where this lives. `authorize()` is the single source of
truth for approve-vs-decline, and **every** simulated purchase resolves through
it — so the account model is real behaviour rather than static copy. Note that
`insufficient_account_funds` is checked last and reported as its own distinct
decline reason: a card-policy decline is always explained by the policy the
Member can actually see, and funds are only surfaced when they genuinely bind.

---

## The four modes

Every mode renders inside a centred phone frame, and all four read and write
**one shared store**. There is no per-mode mock data.

### Screen 0 — Mode selector
Landing page outside the phone frame. Shows current demo state (account
balance, active cards, pending invites) so a reviewer knows where they are.

Once you're inside a mode, a **switcher sits above the phone frame** — four
tabs plus an "all modes" button — so changing mode never requires opening the
Demo dock. It's styled as scaffolding rather than product UI so it isn't
mistaken for part of the app being demonstrated.

### Deep links

The active mode lives in the URL hash, so modes are linkable, bookmarkable, and
reachable with the browser back and forward buttons:

| URL | Mode |
| --- | --- |
| `#/` | Mode selector |
| `#/user` | Mode 1 — User app |
| `#/invite` | Mode 2 — Invitation & onboarding |
| `#/spouse` | Mode 3 — Existing member (spouse) |
| `#/child` | Mode 3 — Existing member (child) |

There's still no router and no router dependency — navigation *inside* a mode is
pure state, as specified. Only the mode is in the URL, because that's the thing
worth linking to. An unrecognised hash falls back to the stored mode rather
than blanking the app.

### Mode 1 — User App
Priya managing her family's cards.

Account home → Family Hub → member detail, plus the 5-step **Add Member** flow
(relationship → details → card setup → review & consent → invitation sent),
spending limit & budget refresh, card controls, notification settings, remove
member, and the **decline → adjust limit** flow.

### Mode 2 — Member: Invitation & Onboarding
Simulates opening an invite link, then nine screens: invite landing → what this
is → confirm details → cardholder terms → set up access → **card ready** (with
reveal animation) → add to wallet → set PIN → physical card on its way. Lands
in Mode 3.

Driven by real pending Members from the store. If none exist, the picker offers
to create one so the mode is never a dead end.

Both spouse and child variants are built. The child variant is warmer and
simpler and — importantly — **never asks the child to accept legal terms in
their parent's place**; it explains that consent has already been given.

### Mode 3 — Member: Existing
The Member's own app, in two variants.

**Spouse (Meera):** card home, shared activity across all Family Hub cards
(reciprocal visibility made visible), card settings split honestly into what
she *can* change and what is **"Managed by Priya"**, and self-service **end card
access**.

**Child (Aarav):** card home with usage against the limit, read-only **card
rules**, a **declined transaction** screen that explains the specific rule, card
settings, and **request card removal** — a request, not a termination.

---

## Seeded state

- **Priya Raman**, account balance **$2,480.00**
- **Aarav** — child, 15, **active** card. $200/month limit, $50 per-transaction
  cap, ATM and international off, gambling blocked. Six transactions including
  one historical decline.
- **Meera** — spouse, **pending invite**.

Meera starts pending on purpose: it means Mode 2 has a real invitation to open
on first run, and accepting it activates her card and lights up Mode 3 —
demonstrating the Mode 1 → 2 → 3 chain without any setup. Until then, Mode 3
(spouse) shows a gate that links straight to her invite.

---

## Demo controls

The floating **Demo** button, bottom-right, is visible in every mode. Without
it a reviewer only sees static screens, so it's part of the deliverable.

- **Switch mode** — jump between all four modes and Screen 0
- **Simulate** (pick a target member first):
  - *Simulate a transaction* — a plausible everyday purchase
  - *Simulate a declined transaction* — engineered to breach the tightest rule
    the card actually has, so the reason is always specific and truthful
  - *Simulate allowance refresh* — resets the period
  - *Drop account funds below the limit* — triggers the explanatory low-funds
    state on Member screens
- **Shared state** — a live readout of the balance and each Member's usage
- **Reset demo data** — back to seed
- **Clear all members** — opens the Family Hub empty state (seed state always
  has a card, so this is how that state is reached)

---

## How the product rules are enforced

Several rules are the point of the prototype, so they're enforced structurally
rather than by remembering to type the right thing.

**`src/lib/copy.ts`** exports `FUNDS_DISCLOSURE` and `SETTLEMENT_TAIL` as
constants. The `FundsDisclosure` component reads the text from there rather than
taking a prop, so no caller can soften or reword it. Every Member spending
screen renders it; both termination paths render the settlement tail.

**`src/store/policy.ts`** holds the rules that aren't about a single
authorization: who may lift a freeze (`canUnfreeze`), what a User may set on a
spouse (`userMaySetLimits`), and the bounds a limit change must respect
(`LIMIT_BOUNDS`).

**`Toggle`** has a first-class `locked` state, distinct from `disabled`, because
several rules require a control to be *visible to the person who cannot change
it* — spouse spending controls, and the mandatory alert group.

**`npm run audit:copy`** checks the 19 Member-facing files for banned
accountholder vocabulary, and verifies that any file rendering a spending figure
also renders the disclosure. Member-facing components read account funds through
an `availableFunds()` selector instead of `state.account.balance`, so the word
never appears in those files and the audit can be a plain grep.

### Two decisions worth flagging

1. **The spec's screen-2 copy conflicted with the "balance" ban.** It asked the
   comprehension screen to say "you won't have your own Optimus account or
   balance", while a non-negotiable rule bans that word from all Member UI. The
   comprehension point is kept and the word dropped: *"You won't have an Optimus
   account of your own… no funds are held in your name."*

2. **"Wallet" can't be banned outright**, because an Apple/Google Wallet button
   is required. The audit bans `balance`, `your money`, `top up`,
   `funds available to you`, `reserved`, `guaranteed`, and
   `your`/`own`/`wallet balance` phrasings, while allowing the Apple/Google
   sense.

---

## Structure

```
src/
  store/
    types.ts          domain model
    engine.ts         authorization: lower-of-limit-and-funds, decline reasons
    policy.ts         freeze rules, limit bounds, relationship options
    reducer.ts        all state transitions (pure)
    actions.ts        action union + transaction candidate
    seed.ts           seeded demo state
    StoreContext.tsx  provider, localStorage persistence, action helpers
  lib/
    copy.ts           disclosure + settlement tail + terms, single source
    format.ts         money, dates, misc
  components/
    PhoneFrame.tsx    device chrome
    CardArt.tsx       gradient keyed to relationship type
    Disclosure.tsx    FundsDisclosure + SettlementTail
    AuthGate.tsx      mock Face ID / passcode
    ui/               Button, Toggle, Field, Layout, Primitives, PinPad, Sheet
  modes/
    ModeSelector.tsx  Screen 0
    DevDock.tsx       demo controls
    user/             Mode 1 (+ addMember/ for the 5-step flow)
    onboarding/       Mode 2
    member/           Mode 3 (spouse/ and child/)
```

The reducer is pure: ids and timestamps are generated in the action helpers and
passed in as payload, so `(state, action)` always yields the same next state.

---

## Design

Near-white `#FAFAF9` page, white cards, 14–18px radii, soft borders over heavy
shadows. Inter, with tight tabular numerals for money. A single indigo accent
(`#3730A3`) reserved for primary actions, focus rings and active states.

Card art differs by relationship so a card is identifiable at a glance:
indigo→violet for spouse, violet→pink for child, near-black for the User's own
card.

Empty, loading and error states are designed rather than skipped. Focus states
are visible for keyboard users, switches use `role="switch"` with `aria-checked`,
the step indicator is a real `progressbar`, and decorative icons are
`aria-hidden`.

---

## Out of scope

Parent relationship flows (the option is visible but disabled), any
request-and-approve workflow, merchant-category rule builders, savings goals,
spend summaries or statements, relationship-type changes after setup, and any
real authentication or backend.
