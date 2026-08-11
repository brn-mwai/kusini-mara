# CycleTrack by Revlog

Battery traceability from first registration to final disposition. One Convex
backend, five surfaces:

| Surface | Path | Audience |
|---|---|---|
| Public | `/find-drop-off`, `/impact`, `/q/[token]`, `/v/[reportId]` | anyone, no sign-in |
| Producer console | `/oem` | OEMs handing over end-of-life units |
| Partner console | `/partners` | second-life buyers and recyclers |
| Field PWA | `/field` | collection crew — installable, offline queue |
| Control tower | `/admin` | Revlog operations |

Host-based rewrites map `oem.` / `partners.` / `field.` / `admin.` subdomains
onto those path prefixes (see `next.config.ts`).

## Stack

Next.js 16 (App Router, Turbopack) · TypeScript strict · Tailwind CSS 4 ·
Convex (live queries, no API routes) · Clerk (one application per console) ·
ECharts (`echarts-for-react`) · Phosphor icons · Inter + DM Mono.

## Getting started

```bash
npm install
npx convex dev          # provisions a deployment, writes NEXT_PUBLIC_CONVEX_URL
npx convex run seed:run # rich demo data with real hash chains
npm run dev
```

Copy `.env.example` to `.env.local`. Without Clerk keys each console runs in
demo-tenancy mode (a fixed seed org per surface, resolved server-side — the
same convention as the Kusini apps in this repository). Without a Mapbox token
the map surfaces degrade to an explicit notice; everything else works.

## Backend invariants

- `custodyEvents` and `batteryEvents` are append-only hash chains. They are
  written **only** through `convex/model/custody.ts`; each event commits to its
  predecessor's hash, and weekly anchor periods carry a Merkle root over the
  period's event hashes.
- Every function authorises from the verified Clerk identity inside the
  function (with the demo-tenancy fallback when no identity is present) —
  never from an argument.
- Chain-of-custody certificates hash the producer's events in the period;
  `/v/[reportId]` recomputes and compares, so verification is a real check,
  not a lookup.

## Verify

```bash
npm run verify   # tsc --noEmit, eslint, vitest (25 tests)
npm run build    # full production build
```
