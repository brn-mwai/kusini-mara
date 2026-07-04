# Kusini operator console on Twenty (application manifest)

Decision (2026-07-04): build the **operator / back-office console** as a **Twenty application**,
defined by a code manifest; keep the **Convex lodge/air PWAs** as the field product (offline, SMS,
ack loop, escalation). Both share one ontology — the Convex `schema.ts` is the source of truth, this
manifest mirrors it. Source studied: fork `Downloads/twenty` (twenty-server + twenty-shared).

## Why the manifest path (not decorators, not standard-application)

This Twenty version dropped `@WorkspaceEntity` decorators. Objects are declared as an **application
manifest** (`twenty-shared/application` → `Manifest`) and installed via
`engine/core-modules/application/application-install` + `application-sync.service`. Adding Kusini
objects = author one manifest, install it → tables + full UI generated. We do NOT edit
`twenty-standard-application/` (that's the built-in app's private builders, 31 utils/object).

### Manifest contract (confirmed from twenty-shared)
```ts
Manifest = {
  application: ApplicationManifest;   // displayName, description, defaultRoleUniversalIdentifier
  objects: ObjectManifest[];          // nameSingular/Plural, label*, icon, fields[], labelIdentifier
  fields: FieldManifest[];            // type: FieldMetadataType, name, label, objectUniversalIdentifier
  views; viewFields; navigationMenuItems; pageLayouts; pageLayoutTabs; roles; ...
}
```
- Regular field: `{ type, name, label, options?, isNullable?, defaultValue?, objectUniversalIdentifier }`
- Relation field: `type: RELATION` + `relationTargetObjectMetadataUniversalIdentifier` +
  `relationTargetFieldMetadataUniversalIdentifier` + `universalSettings.relationType` = MANY_TO_ONE / ONE_TO_MANY.
- `FieldMetadataType`: TEXT NUMBER NUMERIC DATE_TIME DATE CURRENCY ADDRESS SELECT MULTI_SELECT
  BOOLEAN PHONES EMAILS LINKS RATING RAW_JSON RELATION MORPH_RELATION FULL_NAME POSITION UUID ARRAY.
- Everything is wired by **universalIdentifier** (deterministic UUIDs via
  `twenty-shared/application/deterministic-identifier/*`). Convention below.

### universalIdentifier convention
Deterministic, stable, human-greppable: `kusini.<object>` for objects,
`kusini.<object>.<field>` for fields, `kusini.<object>.<relation>` for relations. Feed these
through the shared `get-*-universal-identifier` utils so re-installs are idempotent (no dupes).

## Object map — Convex `schema.ts` → Twenty ObjectManifest

Operator-console scope (rich CRM views over the domain). Every object also gets Twenty's base
fields free (id, createdAt, updatedAt, deletedAt, position, createdBy, updatedBy, searchVector).

| Object | Key fields (FieldMetadataType) | Relations |
|--------|-------------------------------|-----------|
| **Operator** | name(TEXT)*, shortCode(TEXT), countryCode(TEXT), billingEmail(EMAILS), timezone(TEXT) | ← properties, ← flightPrograms |
| **Property** | name(TEXT)*, region(TEXT), shortCode(TEXT), timezone(TEXT), location(ADDRESS), opsPhone(PHONES) | → operator (MANY_TO_ONE); ← arrivals, staff, vehicles, rooms |
| **Airstrip** | name(TEXT)*, code(TEXT), region(TEXT), location(ADDRESS), surface(SELECT), lengthM(NUMBER) | ← arrivals; ↔ properties (link) |
| **Airline** | name(TEXT)*, shortCode(TEXT), opsPhone(PHONES), base(TEXT) | ← flights, aircraft, arrivals |
| **Arrival** | guest(TEXT)*, pax(NUMBER), mode(SELECT: charter/scheduled/heli/road/self_drive/self_fly), direction(SELECT: arrival/departure), scheduledTime(DATE_TIME), estimatedTime(DATE_TIME), status(SELECT), reportBufferMinutes(NUMBER), vip(BOOLEAN), dietary(MULTI_SELECT) | → property, → flight, → airstrip, → airline, → flightProgram (all MANY_TO_ONE) |
| **Flight** | code(TEXT)*, aircraftReg(TEXT), pilotName(TEXT), departTime(DATE_TIME), status(SELECT) | → airline (MANY_TO_ONE); ← arrivals (the rotation) |
| **FlightProgram** | date(DATE)*, region(TEXT), status(SELECT: draft/published/closed) | → operator, → airline; ← arrivals |
| **Reprotection** | fromCarrier(TEXT), toCarrierName(TEXT), reason(TEXT)*, newPickupTime(DATE_TIME), sharedVia(SELECT: mail/whatsapp/sms) | → arrival (MANY_TO_ONE) |
| **Staff** | name(TEXT)*, role(SELECT), phone(PHONES), allowedDays(NUMBER), active(BOOLEAN), languages(MULTI_SELECT) | → property; ← duties |
| **Vehicle** | name(TEXT)*, type(SELECT), registration(TEXT), seats(NUMBER), active(BOOLEAN) | → property; ← duties |
| **Duty** | dutyType(SELECT: airstrip_pickup/dropoff/game_drive/luggage/guiding/transfer), status(SELECT), seatsCovered(NUMBER) | → arrival, → staff, → vehicle |
| **Room** | name(TEXT)*, type(SELECT), capacity(NUMBER), status(SELECT) | → property; ← roomAssignments |

`*` = `labelIdentifierFieldMetadataUniversalIdentifier` (the record title field).

### Stays on Convex (NOT in the operator console)
`notifications`, `transferEvents`, `acknowledgments`, `leaveDays`, `coverageRules`,
`propertyAirstrips`/`airlinePropertyLinks` (modeled as Twenty relations), subscriptions. These are
real-time / operational / audit plumbing the PWAs own. The console reads domain state; the loop
(post → confirm → escalate) stays in the field apps.

## Deliverables & file layout (in the fork)

```
packages/twenty-server/src/modules/kusini-application/
  kusini.manifest.ts          exports const kusiniManifest: Manifest
  objects/                    one file per ObjectManifest (operator.object.ts, property.object.ts, …)
  fields/                     FieldManifest[] per object (or inline in each object file)
  ids.ts                      universalIdentifier constants (kusini.<object>[.<field>])
  install-kusini.script.ts    dev script: load manifest → application-install service → sync
```
SELECT option sets (mode, status, role, dutyType, roomType, vehicleType) port 1:1 from the Convex
enums in `schema.ts`.

## Build phases

1. **Skeleton** — `ids.ts` + `application` block + Operator + Property objects + the
   Operator↔Property relation. Install into a dev workspace, confirm the object shows in the
   Data-model UI + a table view renders. Proves the pipeline end-to-end.
2. **Fan out** — remaining 10 objects + all fields + relations, SELECT option sets from the enums.
3. **Views + nav** — a default table view per object (columns, sensible sort), navigationMenuItems
   for the sidebar (Arrivals, Flights, Properties, Staff…), a dashboard pageLayout with arrival/flight KPIs.
4. **Seed + bridge** — seed demo records; decide sync direction with Convex (one-way export
   Convex→Twenty for reporting first; two-way later if needed).

## Risks / notes
- AGPL-3.0 fork — internal reuse fine per the KTP IP rule; source-offer applies if externally hosted.
- Self-host stack: Postgres + Redis + worker + server. Heavier than Convex; the console is
  back-office (few operator users), so scale is modest.
- Manifest must typecheck **inside the fork** (needs `twenty-shared` build). Author against the
  types here, verify with the fork's tsc before install — do not assume compile.
- Shared ontology drift: when `convex/schema.ts` changes, mirror into this manifest. Keep the map
  table above in sync (single source = Convex).
