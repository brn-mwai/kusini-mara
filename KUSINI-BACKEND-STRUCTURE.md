# Kusini backend structure — Twenty-aligned (Convex)

Target architecture for the shared Kusini backend (Lodge + Air apps, one Convex deployment
`judicious-giraffe-509`). Follows Twenty CRM's backend organization, mapped onto Convex.
Source study: Twenty fork `Downloads/twenty/packages/twenty-server` + `CODE-GRAPH.md`.

## Twenty's backend pattern (what we copy)

Twenty splits into two zones:
- **`engine/`** — the platform kernel: `twenty-orm`, `metadata-modules`, `workspace-manager`,
  `guards`, `api`, `dataloaders`. This is the framework itself. **Convex replaces this** — we do
  NOT rebuild it. `convex/lib/` is our thin kernel (tenancy, events, providers, constants).
- **`modules/<object>/`** — one folder per business object, with a rigidly consistent layout:

```
modules/<object>/
  standard-objects/<object>.workspace-entity.ts   data model: fields + relations + metadata
  services/                                        business logic
  resolvers/  controllers/                         GraphQL + REST API
  dtos/  dtos/inputs/                              request/response shapes
  query-hooks/<object>-<op>.pre-query.hook.ts      lifecycle: validate/guard/side-effects
  constants/  types/  utils/ (+ __tests__/)        pure helpers, one fn per file, kebab.util.ts
  exceptions/  filters/                            typed errors + exception filters
  tools/ (+ schemas/)                              AI-agent tools (create/list/update object)
  <object>.module.ts                               wiring
```

Every object extends **BaseWorkspaceEntity**: `id · createdAt · updatedAt · deletedAt (soft) ·
position (manual order)`. Objects are **metadata-driven** — each carries label, labelPlural, icon,
description, standardId, color; fields carry a FieldMetadataType (TEXT / NUMBER / DATE_TIME / SELECT
/ RELATION / FULL_NAME / CURRENCY / ADDRESS / …). The UI, API and charts read that metadata.

## Twenty → Kusini/Convex mapping

| Twenty (NestJS/TypeORM) | Kusini (Convex) |
|-------------------------|-----------------|
| `engine/` kernel | `convex/lib/` + Convex platform (don't rebuild) |
| `standard-objects/*.workspace-entity.ts` | `objects/<x>/<x>.entity.ts` — `defineTable` fragment + enums |
| `resolvers/` + `controllers/` (read) | `objects/<x>/<x>.queries.ts` — Convex `query` fns |
| `services/` (writes) | `objects/<x>/<x>.mutations.ts` — Convex `mutation` fns |
| `dtos/inputs/` | Convex arg validators (`v.*` in each fn) |
| `query-hooks/*.pre-query.hook.ts` | `objects/<x>/<x>.hooks.ts` — pre-write: tenancy guard + validate + emit `transferEvent` |
| `exceptions/` `filters/` | `convex/lib/errors.ts` (typed ConvexError codes) |
| object metadata (label/icon/standardId) | `objects/registry.ts` — one entry per table |
| field metadata (FieldMetadataType) | `objects/<x>/<x>.meta.ts` (Phase B) |
| `tools/` agent tools | `objects/<x>/tools/` (Phase B, for Atlas agents) |
| `BaseWorkspaceEntity` | `convex/lib/base.ts` field groups (audit/geo/source/**position**) |
| Postgres per-workspace tables | Convex tables + `lib/tenancy.ts` code-level isolation (no RLS) |

## Target `convex/` tree

```
convex/
  schema.ts                    composes table defs imported from objects/*/*.entity.ts
  lib/
    base.ts                    field groups: audit, geo, source, position (BaseWorkspaceEntity)
    tenancy.ts                 custom-function wrappers (property/airline scoping)
    events.ts                  emitTransferEvent — the audit spine
    errors.ts                  typed ConvexError codes (was: exceptions/filters)
    providers.ts  constants.ts
  objects/
    registry.ts                per-table { label, labelPlural, icon, color, description, app }
    operator/   operator.entity.ts  .queries.ts  .mutations.ts  .hooks.ts
    property/   property.entity.ts  ...
    airstrip/   airline/   user/   subscription/
    arrival/    arrival.entity.ts  arrival.queries.ts  arrival.mutations.ts  arrival.hooks.ts
                arrival.constants.ts  utils/*.ts
    arrivalGuest/   acknowledgment/   flight/   aircraft/   pilot/
    staff/   vehicle/   duty/   room/   leave/   coverage/
  shared/
    notifications.ts   escalation.ts   crons.ts   seed.ts   transferEvents.ts
```

### App split (Lodge vs Air)
Objects are tagged by app in `registry.ts` (`app: "lodge" | "air" | "shared"`):
- **Lodge (`apps/lodge`)**: property, staff, vehicle, duty, room, leave, coverage, arrival(ground)
- **Air (`apps/air`)**: airline, aircraft, pilot, flight, arrival(charter claim)
- **Shared spine**: operator, airstrip, arrival, arrivalGuest, acknowledgment, user, subscription,
  notifications, transferEvents

Both apps hit the **same** Convex deployment; `lib/tenancy.ts` resolves the demo org by type
(first property = Lodge, first airline = Air) and guards every read/write by `propertyId`/`airlineId`.

## Data conventions to adopt (the "data also")

1. **BaseWorkspaceEntity fields on every object** — Kusini already has `audit` (updatedAt,
   createdByUserId, updatedByUserId, deletedAt) + `_creationTime` (createdAt). **Add `position:
   v.optional(v.number())`** — Twenty uses it everywhere for manual drag-order; Kusini lacks it.
   Put it in `lib/base.ts` alongside audit/geo/source and spread into every table.
2. **Object registry (metadata-driven UI)** — `objects/registry.ts` maps each table to
   `{ label, labelPlural, icon (Phosphor), color, description, app }`. The dashboard/nav renders
   from this, exactly like Twenty's object-metadata drives its sidebar + record pages.
3. **Field-metadata types (Phase B)** — type composite fields the Twenty way: guest name →
   FULL_NAME, subscription price → CURRENCY (already cents+ISO-4217, good), geo → ADDRESS/POSITION,
   enums → SELECT with option colors. Enables generic form + chart rendering.
4. **Standard action surface per object** — every object exposes the same verbs (Twenty:
   findMany/findOne/createOne/createMany/updateOne/deleteOne(soft)/restore). Kusini: a
   `lib/crud.ts` factory that, given a table + tenancy key, generates these + runs the object's
   `.hooks.ts` pre-write. Bespoke logic (acknowledge, buildFlight, dispatch) stays hand-written.
5. **Query-hooks → pre-write lifecycle** — Twenty's `*.pre-query.hook.ts` becomes each object's
   `<x>.hooks.ts`: `assertTenant()`, `validate()`, then on success `emitTransferEvent()`. One place
   per object, called by both the CRUD factory and bespoke mutations.
6. **Soft-delete everywhere** — already present (`deletedAt`). Standard queries must filter
   `deletedAt === undefined`; add a `withLive()` helper in `lib/base.ts`.
7. **Correlation + idempotency** — keep `correlationId` (audit spine) + `source.idempotencyKey`
   (re-import dedupe). Matches Twenty's integration-ready convention.

## Migration plan

### Phase A — structure + registry (additive, push-safe, NO seed reset)
1. `lib/base.ts` — extract audit/geo/source field groups from schema.ts; add `position`.
2. Split `schema.ts`: move each table into `objects/<x>/<x>.entity.ts` exporting its `defineTable`;
   `schema.ts` imports + composes them. Same tables/fields → **schema push is a no-op**, no reset.
3. Add optional `position` to orderable tables (arrivals, staff, vehicles, rooms) — optional =
   additive = push-safe.
4. `objects/registry.ts` — metadata map.
5. Move function files into `objects/<x>/{queries,mutations,hooks}.ts` and `shared/`.
   **GOTCHA:** this renames Convex API paths (`api.arrivals.board` →
   `api.objects.arrival.queries.board`). Every frontend call site in `apps/lodge` + `apps/air`
   (and `uikit`) must update in the same commit. Grep `api\.` across `apps/` first; migrate object
   by object; run `pnpm test` (6 convex-test cases) + build both apps after each.
6. Verify: `npx convex dev` typechecks, `pnpm test` green, both apps build, live board renders.

### Phase B — metadata depth + agent tools (later)
- `<x>.meta.ts` field-metadata types; `lib/crud.ts` standard-action factory; `objects/<x>/tools/`
  agent tools (create/list/update) for Atlas. Wire chart widgets to read registry + field metadata.

## Risk notes
- Live public demo (kusini-lodge / kusini-air .vercel.app) reads prod `judicious-giraffe-509`.
  Phase A steps 1-4 are additive/no-op on the schema. Step 5 is a pure code+import move — risk is
  broken frontend imports, caught by build; do it object-by-object on a branch.
- Per prior migration lesson: only a schema that changes/removes existing fields needs
  `convex run seed:reset` before `convex deploy`. Phase A changes none, so no reset.
- Keep `packages/ui` ↔ `apps/*/uikit` vendor sync discipline unchanged.
