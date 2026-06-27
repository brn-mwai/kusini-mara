# Kusini

**Guest-transfer coordination between charter airlines and remote Maasai Mara safari lodges.**

A transfer scheduled by the airline must be **explicitly acknowledged** by the lodge.
Any transfer that stays unacknowledged near its time **escalates** — by SMS to the
lodge backup contact and airline ops — so a guest is never silently stranded at an
airstrip. **The acknowledgment loop is the product.**

Two real apps, **one shared Convex backend**. An action in one app shows up in the
other **live**, with no polling.

| App | Live (Vercel) | Audience | Posture |
|---|---|---|---|
| **Kusini Lodge** | `kusini-lodge-brn-mwais-projects.vercel.app` | lodge duty contact + team | offline-first PWA |
| **Kusini Air** | `kusini-air-brn-mwais-projects.vercel.app` | charter operator ops | online-first PWA |

> **Live now** (demo mode): both deployed to Vercel (team `brn-mwais-projects`)
> against one Convex prod deployment (`judicious-giraffe-509`), publicly reachable,
> no credentials. Auth is a **fake login** for the demo (no Clerk); each app acts
> as a fixed seed org — Lodge = Riverbend, Air = Mara Wings. The shared Convex
> backend stays live, so scheduling on Air updates Lodge in real time.

---

## The linkage (the whole point)

```
booking ──spawns──> 2 movements ──airline attaches──> flight
   (lodge)            (the spine)        (Air)
```

1. **Air schedules** a queued movement onto a flight → it appears on the **Lodge**
   board as a confirmed transfer awaiting acknowledgment (stops showing “awaiting flight”).
2. **Lodge acknowledges** → an `acknowledgments` row is written and the **Air** flight’s
   ack count (X/Y) ticks up **live**.
3. **Lodge assigns ground staff** → written to `dutyAssignments`.
4. **Scheduler** — if a movement stays unacknowledged within the escalation window before
   its scheduled time, it’s set `escalated`, a `transferEvent` is written, and SMS goes to
   the backup contact + airline ops. **Both boards flag it live.**
5. Every state change writes a `transferEvent` carrying the **`correlationId`**, so the
   audit log is the single source of truth.

Convex reactive queries drive the cross-app updates — the two apps subscribe to the same
rows, so a mutation in one is pushed to the other within ~a second.

---

## Architecture

- **Monorepo** — pnpm + turborepo.
  - `apps/lodge` — Next.js PWA (Lodge)
  - `apps/air` — Next.js PWA (Air)
  - `packages/ui` — shared design system (tokens, shell, ⌘K palette, theme switcher,
    table/menu/modal/toast primitives) ported verbatim from the prototypes
  - `convex/` — the single shared backend (schema, queries, mutations, actions, cron)
  - `tests/` — convex-test suite (loop + tenant isolation)
- **Backend = Convex.** Database, reactive queries, mutations, actions, the escalation
  cron, and file storage. Reactive queries are what make the two apps update each other.
- **Auth = fake login (demo)**. Clerk is removed for this demo; each app uses a cosmetic
  login and acts as a fixed seed org (Lodge = Riverbend, Air = Mara Wings). Production
  would swap the demo resolver in `convex/lib/tenancy.ts` for the Clerk-identity resolver
  (kept in git history).
- **No row-level security.** Tenant isolation is enforced **in code**: every public query
  and mutation is built from a centralized wrapper (`convex/lib/tenancy.ts`) that injects
  the caller’s org and filters by tenant key (`lodgeId` / `airlineId`). Cross-tenant guards
  hold even in demo mode — a test proves the Lodge app cannot read or acknowledge another
  lodge’s movement.
- **Notifications port** (`convex/lib/providers.ts`, `convex/notifications.ts`) — Africa’s
  Talking **SMS is the guaranteed channel and escalation backbone**; WhatsApp (Twilio) is a
  preference channel. Both sit behind one interface; with no creds the pilot runs SMS-only
  and the rest is mocked (the escalation is still recorded and auditable).
- Frontends deploy on **Vercel**. The OR-Tools leave optimizer is **out of scope**.

### Data model — the shared spine

`organizations · users · airlineLodgeLinks · airstrips · aircraft · pilots · staff ·
bookings · movements · flights · acknowledgments · dutyAssignments · notifications ·
transferEvents`

The **movement** is the unit that links the two apps: a booking spawns two movements; the
airline attaches a flight to a movement; the lodge acknowledges a movement.

**Movement lifecycle:** `requested → scheduled` (flight assigned) `→ acknowledged` (lodge)
`→ in_flight → landed → completed`; plus **`escalated`** if unacknowledged within the window.
Physical progress is kept distinct from the lodge confirmation gate.

See `convex/schema.ts` (validators + indexes on every table).

---

## Quick start (local)

```bash
pnpm install

# 1) Provision / connect the shared Convex deployment (writes .env.local)
npx convex dev --once

# 2) Set the Clerk issuer on the deployment (see “Auth setup” below)
npx convex env set CLERK_JWT_ISSUER_DOMAIN https://<your-instance>.clerk.accounts.dev

# 3) Seed the demo data (mirrors the prototypes)
pnpm seed        # convex run seed:run
# pnpm reset     # wipe everything

# 4) Run Convex + both apps together
pnpm dev         # Lodge → http://localhost:3000 · Air → http://localhost:3001
```

Each app needs `apps/<app>/.env.local`:

```
NEXT_PUBLIC_CONVEX_URL=https://<deployment>.convex.cloud
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

Until valid Clerk keys are present, each app renders a **“setup required”** notice (so it
still builds and deploys); it activates the moment real keys are set.

---

## Auth setup (Clerk) — 3 values, ~2 minutes

1. **Create a Clerk application** (or reuse one) at <https://dashboard.clerk.com>.
2. **JWT template** → New template → choose **Convex** → save. Copy its **Issuer** URL
   (e.g. `https://your-instance.clerk.accounts.dev`).
3. Copy the **Publishable key** and **Secret key** from *API keys*.

Then wire them:

| Value | Where it goes |
|---|---|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | each app’s env (`.env.local` / Vercel) |
| `CLERK_SECRET_KEY` | each app’s env (`.env.local` / Vercel) |
| `CLERK_JWT_ISSUER_DOMAIN` | the **Convex** deployment (`npx convex env set …` / Convex dashboard) |
| `NEXT_PUBLIC_CONVEX_URL` | each app’s env (same deployment for both — this is the linkage) |

On first sign-in each app links the Clerk identity to an org (`users.ensureForApp`):
Lodge → Riverbend, Air → Mara Wings.

---

## Demo script

Open both apps side by side, sign into each.

1. **Air → Requests**: the **Chen** movement is queued (“awaiting flight”). Click
   **Schedule** → pick an existing flight or build a new one → confirm.
2. Watch the **Lodge → Today** board: Chen flips from *Awaiting flight* to *Awaiting ack*
   within ~a second, **no refresh**.
3. On **Lodge**, click **Acknowledge** on Chen. On **Air → Flights**, that flight’s
   **ack count (X/Y) ticks up live**.
4. **Escalation:** the seeded **Hargreaves** arrival is scheduled but unacknowledged; its
   deadline lapses ~90 s after seeding. Within a minute the cron sets it **`escalated`** —
   **both** boards flag it red and an entry lands in **Notifications** (SMS, or “logged
   (mock)” without creds). To force it immediately: `npx convex run escalation:sweep`.

A flight in the seed (**F-101**) carries **mixed arrivals + departures across two lodges**
(Riverbend + Acacia) — see its **Manifest**.

---

## Tests

```bash
pnpm test    # vitest + convex-test
```

Asserts the full loop and tenancy:

- schedule → lodge sees it → acknowledge → air sees the ack
- escalation fires for a scheduled, unacknowledged movement past its deadline (and an SMS
  lands in the log)
- an acknowledged movement is **not** escalated
- a lodge **cannot** read or acknowledge another lodge’s movement (cross-tenant read fails)
- an airline account cannot call lodge-only mutations

---

## Deploy (Vercel — two projects, one Convex)

1. **Convex (prod):** `npx convex deploy` → note the prod URL; set `CLERK_JWT_ISSUER_DOMAIN`
   on it.
2. **Two Vercel projects** from this repo, each with **Root Directory** set:
   - `apps/lodge` → `lodge.kusini.app`
   - `apps/air` → `air.kusini.app`
3. Set env on **both** Vercel projects: `NEXT_PUBLIC_CONVEX_URL` (prod), Clerk publishable +
   secret keys. Build runs `next build`; install is the workspace `pnpm install`.

Both apps point at the **same** Convex deployment — that shared backend is what makes them
update each other live.

---

## Design system

Forest-green operator UI ported 1:1 from the prototypes — rounded inset shell, grouped
sidebar with project switcher, command palette (⌘K), light/dark/system theme switcher.
Tokens: primary `#1C3319`, page `#FAFCF1`, sidebar `#EDEFE4`, border `#DBDED4`.
Operational data (tail numbers, ETAs, refs) in **IBM Plex Mono**; UI text in **Hanken
Grotesk**; **Phosphor** icons (self-hosted for offline).

## Deploy notes

Each Vercel project has **Root Directory** set to its app (`apps/lodge` / `apps/air`)
and builds on git push. Each app vendors the design system into `apps/*/uikit` (synced
from the canonical `packages/ui`) so it builds standalone. Only env var needed:
`NEXT_PUBLIC_CONVEX_URL` → the shared Convex prod deployment.

To restore real auth later, reinstate Clerk: `@clerk/nextjs` + `ClerkProvider` +
`ConvexProviderWithClerk` + `clerkMiddleware`, and swap the demo resolver in
`convex/lib/tenancy.ts` back to the Clerk-identity one.

## License

MIT — see [LICENSE](LICENSE).
