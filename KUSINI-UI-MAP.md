# Kusini UI map — schema → twenty-ui components (LODGESIDE)

How every Lodge table/field renders, which vaulted twenty-ui component draws it, and how the Lodge
**workflows** wire schema → functions → UI. Companion to `KUSINI-SCHEMA.md`. twenty-ui is vaulted at
`Claude_brain/projects/twenty-ui/library/src/` (191 components) + `dashboard/` (shell + page-layout
+ graph widgets). Styled with Linaria (native in Vite; Lodge app = `apps/lodge`, Vite PWA). Tokens =
`theme-*.css` (`--t-*` vars) / `useTheme()`.

## 1. Field type → twenty-ui component

| Kusini field type | Component (`library/src/…`) | Notes |
|---|---|---|
| FULL_NAME (name) | `data-display/Avatar` + `typography/StyledText` | initials avatar + name cell |
| PHONES | `data-display/LinkChip` | `tel:` primaryPhoneNumber |
| EMAILS | `data-display/LinkChip` | `mailto:` primaryEmail |
| ADDRESS | `typography` (text) → map later | property.location, guest addr |
| SELECT — status | `data-display/Status` | colored dot + label (event/stay/duty status) |
| SELECT — role/type/kind | `data-display/Tag` · `Pill` | tinted label |
| RELATION (→x) | `data-display/Chip` (record chip) + `navigation/MenuItemSelectAvatar` | display + picker |
| MULTI_SELECT (languages, dietary) | `data-display/Tag` row | |
| BOOLEAN (active, isFullDay) | `input/Toggle` · `data-display/Checkmark` | |
| NUMBER (pax, seats, capacity) | `typography` tabular-nums | |
| DATE_TIME / DATE | `typography` (HHhMM / d MMM) + `data-display/Chip` for "in 2h" | |
| CURRENCY (billing) | `typography` | later |
| note body | `surfaces/Card` + `CardContent` | note card |
| files (printJobs.fileId) | `data-display/LinkChip` | PDF download |
| counter/KPI | `feedback/CircularProgressBar` · graph `aggregate-chart` | acked X/Y |

## 2. Object → surface / widget

| Object | Surface / widget | Key components |
|---|---|---|
| **arrivalEvents** (the board) | filtered record table, unacked-first | `page-layout/widgets/record-table`, `Status`, `Chip` |
| **acknowledgments** | one-tap ack | `input/MainButton`, `Status` flip, `AnimatedCheckmark` |
| **dutyAssignments** | assign board | record-table, `MenuItemSelectAvatar` (staff/vehicle), `feedback/Banner` (capacity) |
| **staff / users / guests / guestProfiles** | person record page | `Avatar`, field rows, `Tag` (role/langs) |
| **vehicles** | list | table, `Status` |
| **rooms** | inventory grid | `surfaces/Card` tiles, housekeeping `Status` |
| **stays** (check-in) | check-in board | record-table, `Status` lifecycle, `input/Button` (check-in) |
| **guestRequirements** | severity badges | `Pill` (critical=red), `Callout` for critical |
| **calendarEvents** (bookings+leave) | calendar | Twenty front **calendar** module; `Chip` events by `kind` |
| **leave planner** | calendar + roster | calendar, table, `feedback/Banner` (coverage/infeasible), `ProgressBar` (remaining) |
| **boardProjections** (KPIs) | dashboard | `page-layout` grid + `graph` widgets (bar/line/pie/**aggregate** KPI cards) |
| **broadcasts** | compose + list | `surfaces/Modal`, `input/Button`, `Status`, list |
| **notes** | attached cards | `surfaces/Card`, `IconButton` (pin) |
| **notifications / inboundMessages** | feed | list rows, `Status`, `Tag` (channel) |
| **recurringWorkflows / workflowRuns** | automation settings | table, `Toggle` (active), `Status` (last run) |
| **printJobs** | print centre | `LinkChip` (PDF), `Banner` (superseded) |

## 3. App shell (Lodge) → dashboard shell

From `dashboard/shell/` (ported into `apps/lodge/uikit`):
- **Left nav** (`navigation/MenuItem` + `MainNavigationDrawer`): Board · Bookings · Guests · Rooms ·
  Duties · Staff · Leave · Calendar · Broadcasts · Print · Settings.
- **Page frame** (`shell/page/`): `PageContainer` → `PageHeader` (title + actions) → `PageBody`.
- **Top bar** (`shell/top-bar/TopBar`): property switcher, search, user.
- **Right inspector** (`shell/side-panel/`, 500px): record detail drawer (movement / guest / duty).
- **⌘K** command menu; **MobileNavigationBar** for phones (camp staff on mobile).

## 4. Lodge screens (routes) — everything covered

| Route | Purpose | Tables | Components | Functions needed |
|---|---|---|---|---|
| `/board` | today's movements, unacked-first | arrivalEvents, acknowledgments, boardProjections | record-table, Status, MainButton | `board.today`, `ack.one` |
| `/board/:id` | movement detail (side-panel) | arrivalEvents, transferEvents, dutyAssignments, notes | side-panel, Card, timeline | `movement.get`, `movement.timeline` |
| `/bookings` | incoming bookings → 2 movements | bookings, arrivalEvents | record-table | `bookings.list`, `bookings.import` |
| `/guests` | travellers + requirements | guests, guestRequirements, guestProfiles | person page, Pill, Callout | `guests.list`, `guest.get` |
| `/rooms` | inventory + housekeeping | rooms | Card grid, Status | `rooms.list`, `room.setHousekeeping` |
| `/checkin` | check-in lifecycle | stays, stayGuests, rooms | record-table, Status, Button | `stays.board`, `stay.checkIn/out` |
| `/duties` | assign pickups/dispatches | dutyAssignments, staff, vehicles | MenuItemSelect, Banner(capacity) | `duties.forDay`, `duty.assign` (capacity check), `duty.confirm` |
| `/staff` | roster | staff | person page, Tag | `staff.list`, `staff.upsert` |
| `/leave` | smart leave planner | leaveRegister, leaveRequests, leavePlan, coverageRules, demandCalendar, solveRuns, publicHolidays | calendar, Banner, ProgressBar | `leave.board`, `leave.request`, `leave.decide`, `leave.solve` (OR-Tools action), `leave.balance` |
| `/calendar` | bookings + leave surface | calendarEvents, calendarEventParticipants | calendar module | `calendar.range` |
| `/broadcasts` | message drivers/staff | broadcasts, staffLists, staffListMembers, messageThreads | Modal compose, list | `broadcast.send`, `lists.manage` |
| `/print` | run-sheets + rosters | printJobs, recurringWorkflows, workflowRuns | LinkChip, Toggle | `print.generate`, `workflow.run/schedule` |
| `/notifications` | outbound/inbound feed | notifications, inboundMessages | feed, Status | `notifications.feed` |
| `/settings` | property, coverage, workflows, suppression | properties, coverageRules, recurringWorkflows, suppressionList | forms, Toggle | `settings.*` |

## 5. Core workflows — end-to-end wiring

**A. The acknowledgment loop (the product)**
`airline posts → arrivalEvent(status=posted)` → appears on `/board` unacked-first (Status=needs-ack,
red) → duty contact taps **MainButton** → `ack.one` writes `acknowledgments` + `transferEvents` +
flips Status → `boardProjections` rebuilt write-through → Air board updates live. Unacked near
`scheduledTime` → escalation cron → `notifications` (SMS via outbox) both sides.

**B. Duty assignment + capacity** `/duties`: pick staff+vehicle via `MenuItemSelectAvatar`;
`duty.assign` enforces Σ`vehicle.seatCapacity` ≥ `partySize` else `feedback/Banner` prompts another
vehicle; confirm → SMS to driver.

**C. Check-in** `/checkin`: `stay.checkIn` requires room `housekeepingStatus ∈ {clean,inspected}`;
Status lifecycle reserved→due_in→checked_in→in_house→due_out→checked_out.

**D. Leave solve** `/leave`: `leave.solve` (Convex action → OR-Tools service) reads coverageRules +
demandCalendar + publicHolidays + allowedLeaveDays → writes `leavePlan` (+ solveRuns provenance);
infeasible → `Banner` with reason. `remaining` derived (allowed − taken).

**E. Recurring print + driver broadcast** `recurringWorkflows(type=daily_run_sheet, cadence=daily,
06:30)` → cron fires `workflow.run` → `print.generate` (PDF → printJobs) + `broadcast.send` to
`staffLists("Drivers")` → one `notifications` row per driver via outbox → replies thread on
`messageThreads`.

## 6. Build order (next)

1. **Compose** `schema.master.foundation.ts` + `schema.master.ops.ts` → active `schema.ts` (on branch).
2. **Auth + tenancy**: Clerk provider + `lib/tenancy.ts` (resolve org/property from Clerk JWT) +
   `clerkSyncEvents` webhook.
3. **Seed** a demo property (Riverbend): staff, vehicles, rooms, bookings→movements, a driver list.
4. **Vendor** twenty-ui shell + components into `apps/lodge/uikit`; wire the nav + page frame.
5. **Workflow by workflow** (verify each end-to-end before next): Board+Ack → Duties → Check-in →
   Leave → Print/Broadcast → Calendar → Settings.
6. **Read-models**: `boardProjections` write-through in every mutation that changes the board.
7. **Outbox worker** + escalation cron + Africa's Talking/Twilio/Resend adapters behind ports.

Airside (fleet/flights, Requests queue, Flights board, manifests) is deferred until the Lodge loop
is solid on the shared spine.
