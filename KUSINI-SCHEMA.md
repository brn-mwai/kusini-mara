# Kusini — Data Schema (detailed outline) — MASTER

> Canonical schema spec (2026-07-04). Source of truth for `convex/schema.ts`. Backend = Convex +
> Clerk now, written to lift onto AWS (Aurora Postgres) at scale with no re-model. Twenty is
> borrowed for UI/design-system/patterns only — NOT run as a backend.

Reconciles **Pilot Scope v2** (generic arrival event, operator → property → airstrip
hierarchy, six transport modes, duties, rooms, leave planner) with the **coordination spine**
from the prototypes (booking → arrival_event ← flight).

**Stack decision (locked):** **Clerk** for auth, **Convex** for the pilot phase, and the schema
written to **lift onto AWS** (Aurora Postgres + managed services) at scale with no re-model. The
schema is therefore backend-neutral: logical types map to Convex today and AWS/Postgres later
(§14), and every table carries a portable key so a migration is a data copy, not a rewrite (§21).

---

## 1. Conventions

| Concern | Rule |
|---|---|
| Primary key | Every table carries an **explicit portable `id` (ULID/UUID)** set by the app — **not** just Convex's system `_id` — so foreign keys stay stable across a Convex→AWS move. Convex: store `id` as an indexed field alongside `_id`. Postgres/RDS: `id uuid PRIMARY KEY`. |
| Foreign key | `ref<Entity>` = FK to that entity's portable `id`. Never persist Convex `_id` in another row; always the portable `id`. |
| Timestamps | `timestamp` = UTC. Convex: `number` (epoch ms). Postgres/RDS: `timestamptz`. All rows carry `created_at`, `updated_at`. |
| Soft delete | `archived_at timestamp?` on long-lived entities; never hard-delete records tied to an audit trail. |
| Tenancy key | Every tenant-scoped row **denormalizes** `operator_id` and/or `airline_id` (and usually `property_id`) so isolation holds under the Convex code-wrapper now and Postgres RLS on AWS later (§13). |
| Identity | Users/orgs are **owned by Clerk** and mirrored here via `clerk_user_id` / `clerk_org_id`; the app never stores passwords, sessions, or OTPs (§16). |
| Derived fields | Marked *(derived)* — never stored as source of truth; computed on read (Convex query / Postgres view). |
| Enums | Centralized in §2; referenced as `enum<name>`. Convex: `v.union(v.literal)`. Postgres: `text + CHECK` or native enum. |
| Arrays | `text[]` logical. Convex: `v.array`. Postgres: native array or child table. |
| Mode detail | Conditional per-mode fields on `arrival_events` stored as a `json` blob (Convex `v.object` / Postgres `jsonb`) — see §6. |

---

## 2. Enumerations

| Enum | Values |
|---|---|
| `org_kind` | `lodge_operator`, `airline`, `transfer_provider` |
| `user_role` | `operator_admin`, `property_manager`, `duty_contact`, `airline_ops`, `staff`, `platform_admin` |
| `region` | `maasai_mara`, `laikipia` (extensible) |
| `transport_mode` | `charter`, `scheduled_flight`, `helicopter`, `road_transfer`, `self_drive`, `self_fly` |
| `event_direction` | `arrival`, `departure` |
| `event_status` | `draft`, `posted`, `scheduled`, `acknowledged`, `reconfirm_required`, `in_transit`, `arrived`, `completed`, `escalated`, `cancelled` |
| `field_owner` | `lodge`, `airline` |
| `ack_type` | `initial`, `reconfirm` |
| `booking_source` | `manual`, `pms_resrequest`, `pms_karibukit`, `agent` |
| `aircraft_status` | `available`, `in_service`, `maintenance` |
| `pilot_status` | `available`, `flying`, `rest`, `off` |
| `flight_status` | `planned`, `boarding`, `dispatched`, `in_flight`, `completed`, `cancelled` |
| `duty_type` | `airstrip_pickup`, `airstrip_dropoff`, `welcome_drive`, `luggage`, `guiding` |
| `duty_status` | `unassigned`, `assigned`, `notified`, `accepted`, `declined`, `completed`, `reassigned` |
| `vehicle_status` | `active`, `unavailable`, `maintenance` |
| `room_type` | `tented_suite`, `family_unit`, `honeymoon`, `standard`, `suite`, `villa` (per-property extensible) |
| `housekeeping_status` | `clean`, `dirty`, `being_serviced`, `inspected`, `out_of_order` |
| `guest_type` | `adult`, `teen`, `child`, `infant` |
| `board_basis` | `room_only`, `bed_and_breakfast`, `half_board`, `full_board`, `full_board_plus`, `all_inclusive` |
| `stay_status` | `reserved`, `due_in`, `checked_in`, `in_house`, `due_out`, `checked_out`, `no_show`, `cancelled` |
| `requirement_category` | `dietary`, `allergy`, `medical`, `mobility`, `accessibility`, `preference`, `other` |
| `requirement_severity` | `preference`, `requirement`, `critical` |
| `dietary_type` | `vegetarian`, `vegan`, `pescatarian`, `halal`, `kosher`, `gluten_free`, `dairy_free`, `nut_free`, `no_pork`, `no_beef`, `no_shellfish`, `diabetic`, `other` |
| `occasion` | `none`, `honeymoon`, `anniversary`, `birthday`, `wedding`, `family`, `business`, `other` |
| `vip_status` | `none`, `vip`, `vvip`, `repeat_guest` |
| `staff_role` | `guide`, `driver`, `porter`, `front_desk`, `housekeeping` |
| `channel` | `sms`, `whatsapp`, `push`, `email` |
| `notification_status` | `queued`, `sent`, `delivered`, `failed`, `bounced` |
| `notification_provider` | `africas_talking`, `twilio_whatsapp`, `meta_whatsapp`, `resend`, `expo_push`, `web_push` |
| `outbox_status` | `pending`, `dispatching`, `sent`, `failed`, `dead_letter` |
| `webhook_status` | `pending`, `delivered`, `failed`, `retrying` |
| `integration_provider` | `africas_talking`, `twilio`, `meta_whatsapp`, `resend`, `sentry`, `posthog`, `daraja_mpesa`, `resrequest`, `karibukit`, `ortools_solver`, `storage` |
| `integration_direction` | `inbound`, `outbound` |
| `integration_status` | `ok`, `error`, `retry` |
| `consent_purpose` | `transfer_coordination`, `guest_safety`, `returning_guest_profile`, `statutory`, `marketing` |
| `lawful_basis` | `consent`, `contract`, `legal_obligation`, `vital_interest`, `legitimate_interest` |
| `dsr_type` | `access`, `erasure`, `rectification`, `portability`, `objection` |
| `dsr_status` | `received`, `verifying`, `in_progress`, `completed`, `rejected` |
| `erasure_method` | `hard_delete`, `anonymize` |
| `leave_source` | `solver`, `manual` |
| `leave_status` | `proposed`, `approved`, `taken`, `locked`, `cancelled` |
| `carryover_policy` | `hard_reset`, `carry_capped` |
| `solve_status` | `queued`, `running`, `optimal`, `feasible`, `infeasible`, `error` |
| `print_type` | `weekly_duty`, `monthly_leave`, `daily_run` |
| `projection_scope` | `property`, `airline` |
| `cache_tier` | `client_pwa`, `edge_cdn`, `read_model`, `convex_auto`, `in_memory` |

---

## 3-25. (full table definitions, lifecycles, tenancy, portability, DPA, caching)

> The complete Group A-K table definitions, relationship cardinalities (§11), status lifecycles
> (§12), tenancy model (§13), backend type mapping (§14), current-state WhatsApp evidence (§15.1),
> shorthand parser (§15.2), security/auth/audit (§16), notifications/integration plumbing (§17),
> integrations catalog (§18), security posture (§19), observability (§20), AWS portability (§21),
> caching/read-models (§22-23), and data-protection/minimization (§24-25) are the authoritative
> spec as provided by Brian 2026-07-04. Kept in full in the conversation of record; this file is
> the working master — expand any section inline as it gets implemented.

### Table inventory (~47 tables across 11 groups)
- **A Identity/tenancy:** organizations, users
- **B Lodge hierarchy:** properties, airstrips, property_airstrips, airline_property_links
- **C Airline/fleet:** aircraft, pilots, flights
- **D Coordination spine:** bookings, arrival_events, acknowledgments, transfer_events
- **E Duty allocation:** staff, vehicles, duty_assignments
- **F Rooms/guests/check-in (light PMS):** rooms, guest_profiles, guests, guest_requirements, stays, stay_guests
- **G Leave planner:** leave_register, leave_requests, leave_plan, coverage_rules, demand_calendar, solve_runs
- **H Messaging/print:** notifications, print_jobs
- **I Security/auth/audit:** clerk_sync_events, api_keys, security_audit_log, pii_access_log, consents, data_subject_requests, deletion_log
- **J Delivery/integration plumbing:** notification_templates, notification_preferences, message_outbox, webhook_endpoints, webhook_deliveries, integration_logs, inbound_messages
- **K Caching/read-models:** board_projections, cache_versions

### Key structural shifts vs current `convex/schema.ts`
1. **Unified `organizations`** (kind = lodge_operator | airline | transfer_provider) REPLACES separate `operators` + `airlines`. Breaking — touches tenancy + every function.
2. **Portable `id`** (ULID) on every row alongside Convex `_id`; FKs reference `id`, never `_id`. New convention.
3. **Clerk auth** — users/orgs mirrored via `clerk_*` + `clerk_sync_events`; drop the demo-org resolver.
4. **Carrier as top-level** on arrival_events (`carrier_name`, `carrier_ops_contact`, `carrier_airline_id`) — carriers are often NON-tenant (Safarilink, Governors Aviation).
5. **Light PMS depth:** guests / guest_requirements / stays / stay_guests / rooms(+housekeeping) REPLACE tag-only room_assignments.
6. **Leave solver** (OR-Tools): leave_plan / demand_calendar / solve_runs added to existing leave.
7. **Reliability plumbing:** message_outbox (transactional outbox), webhook_*, integration_logs, inbound_messages.
8. **Security/DPA (Kenya DPA 2019):** pii_access_log, consents, data_subject_requests, deletion_log, security_audit_log.
9. **Read models:** board_projections (write-through hot doc per scope/day) + cache_versions + materialized counters — the Convex-cost strategy.
10. **AWS-portability rules:** ports for Notifications/Storage/Solver/Realtime; side-effects only via outbox; auth claims not auth storage.

See the conversation of record for the full field-by-field definitions of every table above.

---

## Field reference — implemented (48 tables)

Authored + typechecked on branch `feat/master-schema` as `convex/schema.master.foundation.ts`
(Groups A-D, 13) + `convex/schema.master.ops.ts` (Groups E-K + Calendar, 35). Every row carries `id`
(portable ULID) + `createdAt`/`updatedAt`/`archivedAt` unless marked *(no stamps)*. **FKs are
portable string ids** (`→x`), never Convex `_id`. `[LODGE]` / `[AIR]` / `[SHARED]` = owning PWA.

> **People/place entities reuse Twenty's composite field types** (applied faithfully to the
> `person`/`company` shapes): `name` = **FULL_NAME** `{firstName,lastName}`, `phones` = **PHONES**
> `{primaryPhoneNumber,callingCode?,countryCode?,additional?}`, `emails` = **EMAILS**
> `{primaryEmail,additional?}`, `location` = **ADDRESS**, links = **LINKS**. Indexes hit the nested
> primary (e.g. `phones.primaryPhoneNumber`). staff/users/pilots/guests/guestProfiles are people;
> properties carry an address.

### Group A — Identity & tenancy `[SHARED]`
- **organizations** — clerkOrgId?, kind(lodge_operator/airline/transfer_provider), name, billingDetails?, region?
- **users** *(person)* — clerkUserId, name(FULL_NAME), phones(PHONES), emails?, avatarUrl?, jobTitle?, role, active, →organization, →property?

### Group B — Lodge hierarchy `[LODGE]`
- **properties** — →operator, name, region, location(ADDRESS)?, →dutyContactUser?, →backupContactUser?, escalationWindowMinutes, defaultReportOffsetMinutes, carryoverPolicy, carryoverCapDays?, timezone
- **airstrips** — name, code?, lat?, lng?, region
- **propertyAirstrips** — →property, →airstrip, isPrimary
- **airlinePropertyLinks** — →airline, →property, active

### Group C — Airline / fleet `[AIR]`
- **aircraft** — →airline, registration, type, seats, →baseAirstrip?, status
- **pilots** *(person)* — →airline, name(FULL_NAME), license, hours, phones(PHONES), status
- **flights** — →airline, →aircraft, →pilot?, flightRef, date, departTime?, circuit[], status

### Group D — Coordination spine `[SHARED]`
- **bookings** — →property, →operator, guestName, partySize, externalRef?, source, arrivalDate, departureDate, specialNeeds?, syncedAt?
- **arrivalEvents** *(the movement)* — →booking?, direction, mode, →destinationProperty, originText?, →originProperty?, →airstrip?, carrierName?, →carrierAirline?, carrierOpsContact?, partySize, guestNames?[], specialNeeds?, scheduledTime?, guestReportOffsetMinutes?, status, →flight?, correlationId, →createdByOrg, →claimedByAirline?, →operator, →airline?, lastTimingChangeAt?, reprotectCount, lastReprotectedAt?, modeDetails{}
  - *lodge owns guest/rooming fields; air owns flight/tail/ETA; attaching →flight = the crossing act*
- **acknowledgments** — →arrivalEvent, →user, type, channel, at, →property, →operator
- **transferEvents** *(audit spine)* — →arrivalEvent, correlationId, →actorUser?, action, fromStatus?, toStatus?, payload?, at, →operator?, →airline?

### Group E — Duty allocation `[LODGE]`
- **staff** *(person)* — →property, →operator, name(FULL_NAME), jobTitle?, phones(PHONES), emails?, avatarUrl?, role, certifications[], languages[], dailyDutyCap, allowedLeaveDays, active
- **vehicles** — →property, name, seatCapacity, status
- **dutyAssignments** — →arrivalEvent, →property, dutyType, →staff?, →vehicle?, seatsCommitted?, status, notifiedAt?, acceptedAt?, completedAt?

### Group F — Light PMS `[LODGE]`
- **rooms** — →property, name, type, capacity, maxAdults, maxChildren, bedConfig, features[], zone?, accessible, housekeepingStatus, active
- **guestProfiles** *(person)* — →operator, name(FULL_NAME), emails?, phones?, vipStatus, notes?, →consent?, erasedAt?
- **guests** *(person)* — →booking, →property, →profile?, name(FULL_NAME), emails?, phones?, guestType, age?, isLead, relationship?, erasedAt?
- **guestRequirements** *(no stamps)* — →guest, →property, category, label, severity, notes?, carriesForward
- **stays** *(check-in)* — →booking, →property, →room?, →arrivalEvent?, →departureEvent?, plannedCheckIn, plannedCheckOut, actualCheckInAt?, actualCheckOutAt?, status, boardBasis, adults, children, infants, occasion, specialRequests?
- **stayGuests** *(no stamps)* — →stay, →guest, isPrimary

### Group G — Leave planner `[LODGE]`
- **leaveRegister** *(no stamps)* — →staff, →property, year, allowed, taken, carriedIn *(remaining derived)*
- **leaveRequests** *(no stamps)* — →staff, →property, startDate, endDate, status, reason?, conflictFlags?
- **leavePlan** *(no stamps)* — →staff, →property, date, source, status, →solveRun?
- **coverageRules** *(no stamps)* — →property, role, minStaff, seasonStart?, seasonEnd?, seasonMinStaff?, resilienceBuffer
- **demandCalendar** *(no stamps)* — →property, date, expectedArrivals, expectedLoadScore *(both derived)*
- **solveRuns** *(no stamps)* — →property, year, status, objectiveValue?, infeasibleReason?, startedAt, finishedAt?, →requestedBy?

### Calendar `[LODGE]` — reuses Twenty's calendarEvent/participant model
One surface bookings/stays **and** leave both project onto (so the Lodge renders one calendar).
- **calendarEvents** — →property, kind(stay/leave/duty/other), title, startsAt, endsAt, isFullDay, location?, description?, isCanceled, →stay?/→booking?/→leavePlan?/→leaveRequest?/→dutyAssignment?/→staff?/→arrivalEvent?
- **calendarEventParticipants** *(no stamps)* — →calendarEvent, →property, participantKind(staff/guest), →staff?, →guest?, displayName, isOrganizer, responseStatus

### Group H — Messaging & print `[SHARED; print=LODGE]`
- **notifications** *(no stamps)* — →recipientUser?, recipientPhone?, recipientEmail?, channel, provider, →arrivalEvent?, →template?, templateKey, subject?, fromAddress?, payload, status, providerMessageId?, errorCode?, retryCount, correlationId?, queuedAt?, sentAt?, deliveredAt?, →operator?, →airline?
- **printJobs** *(no stamps)* — →property, type, rangeStart, rangeEnd, versionStamp, fileId, →generatedBy?, generatedAt, supersededAt?

### Group I — Security, auth & audit `[SHARED / platform]`
- **clerkSyncEvents** *(no stamps)* — clerkEventId, type, payload, status, at
- **apiKeys** *(no stamps)* — →organization, name, keyHash, scopes[], lastUsedAt?, revokedAt?
- **securityAuditLog** *(no stamps)* — →actorUser?, clerkUserId?, →organization?, action, entityType?, entityId?, ip?, userAgent?, metadata?, at
- **piiAccessLog** *(no stamps)* — →actorUser, →guest?, →booking?, fields[], purpose?, at
- **consents** *(no stamps)* — →guestProfile?, →booking?, purpose, lawfulBasis, granted, grantedBy?, source, withdrawnAt?, expiresAt?, at
- **dataSubjectRequests** *(no stamps)* — type, subjectKind, subjectRef, →operator?, requestedAt, verifiedAt?, status, →handledBy?, completedAt?, notes?
- **deletionLog** *(no stamps)* — →dsr?, subjectKind, subjectRef, method, scopes[], retainedExceptions[], →executedBy?, at

### Group J — Delivery & integration plumbing `[SHARED]`
- **notificationTemplates** *(no stamps)* — key, channel, locale, subject?, body, active
- **notificationPreferences** *(no stamps)* — →user, channelPriority[], quietHours?, optedOutChannels[]
- **messageOutbox** *(no stamps)* — kind, refId, payload, status, attempts, nextAttemptAt?, lastError?, dispatchedAt?
- **webhookEndpoints** *(no stamps)* — →organization, url, secret, events[], active
- **webhookDeliveries** *(no stamps)* — →endpoint, event, payload, status, responseCode?, attempts, deliveredAt?
- **integrationLogs** *(no stamps)* — provider, direction, ref?, status, correlationId?, request?, response?, latencyMs?, at
- **inboundMessages** *(no stamps)* — channel, provider, fromAddress, raw, →parsedEvent?, status, at

### Group K — Caching & read-models `[SHARED]`
- **boardProjections** *(no stamps)* — scope(property/airline), scopeId, date, kpis, rows, →operator?, →airline?, rebuiltAt
- **cacheVersions** *(no stamps)* — scope, version, updatedAt

---

## Migration delta — current `convex/schema.ts` (26) → master (46)

What the live pilot schema (being replaced) maps to. **18 carried, 2 merged, 3 replaced,
3 removed, 23 net-new.**

| Current table (26) | → Master | Change |
|---|---|---|
| operators | **organizations** (kind=lodge_operator) | **MERGED** — breaking; touches tenancy + every fn |
| airlines | **organizations** (kind=airline) | **MERGED** |
| properties | properties | reshaped (portable id) |
| airstrips | airstrips | kept |
| propertyAirstrips | propertyAirstrips | kept |
| airlinePropertyLinks | airlinePropertyLinks | kept |
| subscriptions | *(none)* | **REMOVED** — billing → `organizations.billingDetails`, deferred |
| users | users | reshaped (+clerkUserId) |
| arrivalEvents | arrivalEvents | reshaped (carrier top-level, correlationId, reprotect fields) |
| arrivalGuests | **guests** | **REPLACED** — richer (guestType/age/profile) |
| flightPrograms | *(none)* | **REMOVED** — daily brief is a *query* over arrivalEvents, not a table |
| flights | flights | kept (circuit[]) |
| acknowledgments | acknowledgments | kept |
| reprotections | *(none)* | **REMOVED** — re-protection = `arrivalEvents.reprotectCount/lastReprotectedAt` + `transferEvents(action=reprotected)` |
| staff | staff | kept |
| vehicles | vehicles | kept |
| dutyAssignments | dutyAssignments | kept |
| rooms | rooms | reshaped (housekeeping, occupancy, features) |
| roomAssignments | **stays** + **stayGuests** | **REPLACED** — full check-in lifecycle |
| leaveDays | **leavePlan** | renamed/reshaped |
| leaveRequests | leaveRequests | kept |
| coverageRules | coverageRules | kept (seasonal) |
| aircraft | aircraft | kept |
| pilots | pilots | kept |
| notifications | notifications | reshaped (provider, template, receipts) |
| transferEvents | transferEvents | kept (action-based) |

**Net-new in master (23):** bookings · leaveRegister · demandCalendar · solveRuns · guestProfiles ·
guestRequirements · printJobs · clerkSyncEvents · apiKeys · securityAuditLog · piiAccessLog ·
consents · dataSubjectRequests · deletionLog · notificationTemplates · notificationPreferences ·
messageOutbox · webhookEndpoints · webhookDeliveries · integrationLogs · inboundMessages ·
boardProjections · cacheVersions.

### Note on the earlier "4 domain additions"
The 2026-07-04 additions to the *current* schema.ts (`flightPrograms`, `reprotections` tables,
`reportBufferMinutes`, `legSequence`) are **partly superseded** by the master, which is the more
considered model: re-protection and the daily brief are NOT separate tables — re-protection is
fields on `arrivalEvents` + a `transferEvents` row; the brief is a query. The report buffer lives
on as `arrivalEvents.guestReportOffsetMinutes` + `properties.defaultReportOffsetMinutes`. `legSequence`
is dropped (leg order derives from `flights.circuit[]` + scheduledTime).

### Relation to Twenty — reuse the schemas, don't run the server
Kusini keeps Twenty's **structural shapes** and applies them to its own Convex tables (Twenty is
not run). Concretely reused:
- **person → people entities**: staff, users, pilots, guests, guestProfiles all take Twenty's
  `person` composite fields — `name`(FULL_NAME), `phones`(PHONES), `emails`(EMAILS), avatar, jobTitle.
- **company → organizations/properties**: name + `location`(ADDRESS).
- **calendarEvent/participant → the Lodge calendar**: reused (not dropped) as the surface bookings/
  stays + leave project onto.
- **opportunity → arrivalEvents**, **timelineActivity → transferEvents**, **task → dutyAssignments**,
  **message → notifications**, **dashboard → boardProjections** (shape analogs).
- **field-metadata type vocabulary** (TEXT/NUMBER/DATE_TIME/SELECT/RELATION/ADDRESS/CURRENCY/
  FULL_NAME/EMAILS/PHONES) + base-field discipline (stamped, soft-deletable) + the design system + UI.
Dropped as unneeded: email threads/campaigns, callRecording, generic workflow engine, blocklist.

