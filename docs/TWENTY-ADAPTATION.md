# Twenty → Kusini adaptation spec

How we take the best of Twenty CRM (github twentyhq/twenty, mirrored at gitlab.com/brn-mwai/twenty)
and apply it to Kusini. Grounded in the per-package code-graph maps generated 2026-07-03
(`packages/twenty-{front,server,ui}/CODE-GRAPH.md` in the Twenty checkout).

## Ground rules

1. **License.** Twenty is AGPL-3.0, with some files marked `@license Enterprise` (commercial-only).
   Kusini is a hosted network service, so incorporating AGPL source verbatim would force Kusini's
   entire codebase to be released under AGPL. We therefore **do not copy Twenty source files**. We
   extract patterns, architecture, and token *values* (colours, spacing, type scale — facts/ideas,
   not copyrightable) and re-implement them in Kusini's own stack. Enterprise-marked files are off
   limits entirely.
2. **Stack reality.** Twenty is React 18 + Jotai + Linaria + Vite + NestJS + TypeORM + GraphQL +
   Postgres. Kusini is Next 15 + React 19 + Convex + a CSS-token design system. A verbatim copy will
   not compile. Every item below is re-expressed in Kusini's stack.
3. **Kusini already has a working design system** (`packages/ui/styles/tokens.css`): forest-green
   brand, KTP-derived KPI nested-cards, DataTable, command palette, light/dark. We graft Twenty's
   systematic depth onto that brand — additively, without breaking existing component CSS.

## Layer 1 — Design system (from twenty-ui)

Twenty's theme lives in `packages/twenty-ui/src/theme/constants/*`. What we adopt, as **additive**
tokens in `packages/ui/styles/tokens.css` (new variables; existing `--text-1`/`--primary`/etc. stay
and get remapped onto the new ramp so nothing breaks):

- **12-step neutral ramp** (`--gray-1..--gray-12`), light + dark, replacing ad-hoc text/border vars
  underneath. Twenty uses `color(display-p3 …)`; we keep sRGB hex for browser reach and add a P3
  `@supports` block later if wanted. Map: `--text-1→gray12`, `--text-2→gray11`, `--text-3→gray9`,
  `--border→gray6`, `--border-s→gray4`, `--card→gray1`, `--page→gray2`.
- **Semantic colour palette** (`--c-red … --c-gray`, 24 hues) from `MainColors*`/`SecondaryColors*`.
  Kusini today has only 4 accents; a CRM-style app needs a wide, stable palette for record/object/tag
  colours. Values are the Radix P3 `*9` steps; we pin them as hex.
- **Spacing scale** — Twenty's `spacingMultiplicator: 4` + `spacing(n)=n*4px`. Add `--s-1..--s-12`
  (4/8/12/16/20/24/32/40/48/56/64) and stop hand-typing px.
- **Radius** — keep Kusini's `--r`/`--r-sm`; add Twenty's `--radius-xs:2px` and `--radius-pill:999px`
  for chips/tags.
- **Shadow scale** — add `--shadow-strong`, `--shadow-underline`, `--shadow-heavy` alongside the
  existing single `--shadow`.
- **Motion scale** — `--dur-instant:75ms --dur-fast:150ms --dur-normal:300ms`, replacing inline
  `.12s/.15s`.
- **Table + side-panel metrics** — Twenty's `table.horizontalCellPadding:8px`,
  `checkboxColumnWidth:32px`, `sidePanelWidth:500px`. Kusini's DataTable already uses 16px cell
  padding; adopt the 32px checkbox column + a `--side-panel-w` token for the arrival detail drawer.

Concrete extracted values are in `packages/ui/styles/twenty-tokens.css` (proposed, not yet wired).

**Primitives to rebuild** (not copy) from twenty-ui clusters, in Kusini's plain-CSS/React style:
Chip/Tag, Avatar, Status pill (Kusini has these), plus new ones worth having — **SortableMenuItem**
(drag + multiselect), **JSON tree viewer** (debug/inspector), **Surface containers** (Modal/Card/Tab
picker Kusini partly has).

## Layer 2 — UI / UX patterns (from twenty-front)

Rebuild these behaviours on Next + Convex reactive queries (Twenty uses Jotai + Apollo; we use Convex
`useQuery` + React state). Priority order:

1. **Record table with inline edit** — the CRM table cell that turns into an editor on click, commits
   on blur/enter. Kusini's DataTable is read-only today; add per-cell edit → Convex mutation.
2. **Advanced Filter System** (twenty-front cluster 10, 326 files) — composable filters over typed
   fields (text/number/date/select) with AND/OR groups. Model as a Convex-queryable filter tree; UI
   is a filter-chip bar (Kusini already has `.filter-bar`).
3. **Page Layout / widget system** (cluster 8, 432 files) — configurable dashboards of widgets. Maps
   to a Convex `pageLayouts` table (tabs → widgets → config) + a render surface. High value for the
   Lodge/Air operational dashboards.
4. **Command Menu ⌘K** (cluster 3) — Kusini already has `.cmdk`; adopt Twenty's *context actions*
   idea (menu items change based on the selected record).

## Layer 3 — Server / data design (from twenty-server) → Convex

Twenty's backend is NestJS/TypeORM; do **not** port it. Adopt the *concepts* into Convex:

- **Composite field value-types.** Twenty models rich fields as typed objects: `CurrencyMetadata
  {amount, currencyCode}`, `LinksMetadata {primaryLinkUrl, secondaryLinks[]}`, `ActorMetadata
  {source, name, workspaceMemberId}`, `AddressMetadata {street, city, postcode, country, lat, lng}`.
  Kusini already does this informally (`arrivalEvents.modeDetail`, `geo`). Formalise a small library
  of reusable Convex validators in `convex/lib/fieldTypes.ts` (Actor, Money, Links, Address, Geo) and
  reuse across tables — this is the single highest-leverage server borrow.
- **Actor tracking** (`createdBy`/`updatedBy` as Actor, not just a user id) — who/what/which channel
  made each change. Extends Kusini's existing `audit` group; feeds the `transferEvents` audit spine.
- **Query Hook System** (twenty-server cluster 10, 256 files) — pre/post hooks that auto-populate
  audit fields and run side effects. In Convex this is the **custom-function wrapper** pattern Kusini
  already uses in `convex/lib/tenancy.ts`; extend those wrappers to stamp actor + emit a
  `transferEvents` row on every mutation, centrally.
- **Standard-object metadata + field-metadata-type registry** — Twenty describes every object/field
  as data (so users add custom fields at runtime). Kusini does not need full runtime-custom-objects
  yet, but a lightweight **object/field descriptor** (label, icon, field kind, colour) driving the
  record table + filters is worth it, and it is the same idea as the AIP/ontology work in the brain
  (`reference_aip_pattern`, `project_ktp_ontology`). Start descriptor-only; defer runtime DDL.
- **Search** — Twenty's `searchVector` per entity → Convex search indexes on the record tables.

## Phasing

- **P1 (foundation):** Layer-1 tokens wired in + re-vendored to `apps/*/uikit`; `convex/lib/fieldTypes.ts`
  composite validators; actor-stamping in the tenancy wrappers. Non-breaking, high leverage.
- **P2 (records):** inline-edit DataTable + Advanced Filter over one object (arrivals), driven by a
  field descriptor.
- **P3 (dashboards):** page-layout/widget system for Lodge + Air.
- **P4 (breadth):** roll descriptors/filters across the other objects; search indexes.

## Non-goals

- No verbatim Twenty source in Kusini (AGPL).
- No NestJS/TypeORM/GraphQL/Jotai/Linaria — Kusini stays Next + Convex + CSS tokens.
- No runtime custom-object DDL in P1–P3 (descriptor-driven only until there is a real need).
