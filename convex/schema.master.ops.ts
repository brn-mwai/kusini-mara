import { defineTable } from "convex/server";
import { v } from "convex/values";

import { channel, fullName, emails, phones, region } from "./schema.master.foundation";

// ═════════════════════════════════════════════════════════════════════════════
// Kusini MASTER schema — Groups E-K — REVIEW ARTIFACT (companion to
// schema.master.foundation.ts). Same conventions: portable `id`, FK-as-string,
// createdAt/updatedAt, denormalized tenancy keys. Authored to KUSINI-SCHEMA.md.
//
// PWA OWNERSHIP (two apps, one backend — lodge.kusini.app / air.kusini.app):
//  • LODGE  — Groups E, F, G, and print_jobs. Camp operations.
//  • AIR    — (fleet/flights live in foundation Group C). No Group E-K table is
//             air-exclusive; Air reads the shared spine + board_projections(air).
//  • SHARED — Groups H (notifications), I (security/DPA), J (plumbing),
//             K (read-models: board_projections has scope=property|air, one row
//             feeds each app's board). Platform-level, both apps.
// Ownership is enforced in mutations + tenancy wrapper, not by schema.
// ═════════════════════════════════════════════════════════════════════════════

const portable = { id: v.string() };
const stamps = {
  createdAt: v.number(),
  updatedAt: v.number(),
  archivedAt: v.optional(v.number()),
};

// ── enums (§2 — E-K subset) ───────────────────────────────────────────────────
export const staffRole = v.union(
  v.literal("guide"),
  v.literal("driver"),
  v.literal("porter"),
  v.literal("front_desk"),
  v.literal("housekeeping"),
);
export const vehicleStatus = v.union(
  v.literal("active"),
  v.literal("unavailable"),
  v.literal("maintenance"),
);
export const dutyType = v.union(
  v.literal("airstrip_pickup"),
  v.literal("airstrip_dropoff"),
  v.literal("welcome_drive"),
  v.literal("luggage"),
  v.literal("guiding"),
);
export const dutyStatus = v.union(
  v.literal("unassigned"),
  v.literal("assigned"),
  v.literal("notified"),
  v.literal("accepted"),
  v.literal("declined"),
  v.literal("completed"),
  v.literal("reassigned"),
);
export const roomType = v.union(
  v.literal("tented_suite"),
  v.literal("family_unit"),
  v.literal("honeymoon"),
  v.literal("standard"),
  v.literal("suite"),
  v.literal("villa"),
);
export const housekeepingStatus = v.union(
  v.literal("clean"),
  v.literal("dirty"),
  v.literal("being_serviced"),
  v.literal("inspected"),
  v.literal("out_of_order"),
);
export const guestType = v.union(
  v.literal("adult"),
  v.literal("teen"),
  v.literal("child"),
  v.literal("infant"),
);
export const boardBasis = v.union(
  v.literal("room_only"),
  v.literal("bed_and_breakfast"),
  v.literal("half_board"),
  v.literal("full_board"),
  v.literal("full_board_plus"),
  v.literal("all_inclusive"),
);
export const stayStatus = v.union(
  v.literal("reserved"),
  v.literal("due_in"),
  v.literal("checked_in"),
  v.literal("in_house"),
  v.literal("due_out"),
  v.literal("checked_out"),
  v.literal("no_show"),
  v.literal("cancelled"),
);
export const requirementCategory = v.union(
  v.literal("dietary"),
  v.literal("allergy"),
  v.literal("medical"),
  v.literal("mobility"),
  v.literal("accessibility"),
  v.literal("preference"),
  v.literal("other"),
);
export const requirementSeverity = v.union(
  v.literal("preference"),
  v.literal("requirement"),
  v.literal("critical"),
);
export const occasion = v.union(
  v.literal("none"),
  v.literal("honeymoon"),
  v.literal("anniversary"),
  v.literal("birthday"),
  v.literal("wedding"),
  v.literal("family"),
  v.literal("business"),
  v.literal("other"),
);
export const vipStatus = v.union(
  v.literal("none"),
  v.literal("vip"),
  v.literal("vvip"),
  v.literal("repeat_guest"),
);
export const leaveStatus = v.union(
  v.literal("proposed"),
  v.literal("approved"),
  v.literal("taken"),
  v.literal("locked"),
  v.literal("cancelled"),
);
export const leaveSource = v.union(v.literal("solver"), v.literal("manual"));
export const solveStatus = v.union(
  v.literal("queued"),
  v.literal("running"),
  v.literal("optimal"),
  v.literal("feasible"),
  v.literal("infeasible"),
  v.literal("error"),
);
export const printType = v.union(
  v.literal("weekly_duty"),
  v.literal("monthly_leave"),
  v.literal("daily_run"),
);
export const notificationStatus = v.union(
  v.literal("queued"),
  v.literal("sent"),
  v.literal("delivered"),
  v.literal("failed"),
  v.literal("bounced"),
);
export const notificationProvider = v.union(
  v.literal("africas_talking"),
  v.literal("twilio_whatsapp"),
  v.literal("meta_whatsapp"),
  v.literal("resend"),
  v.literal("expo_push"),
  v.literal("web_push"),
);
export const outboxStatus = v.union(
  v.literal("pending"),
  v.literal("dispatching"),
  v.literal("sent"),
  v.literal("failed"),
  v.literal("dead_letter"),
);
export const webhookStatus = v.union(
  v.literal("pending"),
  v.literal("delivered"),
  v.literal("failed"),
  v.literal("retrying"),
);
export const integrationProvider = v.union(
  v.literal("africas_talking"),
  v.literal("twilio"),
  v.literal("meta_whatsapp"),
  v.literal("resend"),
  v.literal("sentry"),
  v.literal("posthog"),
  v.literal("daraja_mpesa"),
  v.literal("resrequest"),
  v.literal("karibukit"),
  v.literal("ortools_solver"),
  v.literal("storage"),
);
export const integrationDirection = v.union(
  v.literal("inbound"),
  v.literal("outbound"),
);
export const integrationStatus = v.union(
  v.literal("ok"),
  v.literal("error"),
  v.literal("retry"),
);
export const consentPurpose = v.union(
  v.literal("transfer_coordination"),
  v.literal("guest_safety"),
  v.literal("returning_guest_profile"),
  v.literal("statutory"),
  v.literal("marketing"),
);
export const lawfulBasis = v.union(
  v.literal("consent"),
  v.literal("contract"),
  v.literal("legal_obligation"),
  v.literal("vital_interest"),
  v.literal("legitimate_interest"),
);
export const dsrType = v.union(
  v.literal("access"),
  v.literal("erasure"),
  v.literal("rectification"),
  v.literal("portability"),
  v.literal("objection"),
);
export const dsrStatus = v.union(
  v.literal("received"),
  v.literal("verifying"),
  v.literal("in_progress"),
  v.literal("completed"),
  v.literal("rejected"),
);
export const erasureMethod = v.union(
  v.literal("hard_delete"),
  v.literal("anonymize"),
);
export const projectionScope = v.union(v.literal("property"), v.literal("airline"));

// Calendar (reuses Twenty's calendarEvent shape) — the Lodge calendar surface that
// bookings/stays and the leave planner both project onto.
export const calendarEventKind = v.union(
  v.literal("stay"), // a booking's occupancy (check-in → check-out)
  v.literal("leave"), // a staff leave day/range (from leavePlan / leaveRequests)
  v.literal("duty"), // a scheduled ground duty
  v.literal("other"),
);
export const calendarResponseStatus = v.union(
  v.literal("needs_action"),
  v.literal("accepted"),
  v.literal("declined"),
  v.literal("tentative"),
);

// Notes (Twenty note/noteTarget) — a note attached to any lodge record.
export const noteTargetKind = v.union(
  v.literal("arrival_event"),
  v.literal("duty"),
  v.literal("staff"),
  v.literal("booking"),
  v.literal("stay"),
  v.literal("guest"),
);
// Staff broadcasts (Twenty messageCampaign/List/Member) — send-to-a-list.
export const broadcastStatus = v.union(
  v.literal("draft"),
  v.literal("queued"),
  v.literal("sending"),
  v.literal("sent"),
  v.literal("failed"),
);
export const messageThreadKind = v.union(
  v.literal("broadcast"),
  v.literal("acknowledgment"),
  v.literal("inbound"),
  v.literal("duty"),
);
// Recurring workflows (Twenty workflow/version/run/automatedTrigger) — the
// daily/weekly generators that produce driver run-sheets + duty rosters.
export const workflowType = v.union(
  v.literal("daily_run_sheet"), // per-driver pickup schedule for the day
  v.literal("weekly_duty_roster"), // week's duty allocation for the notice board
  v.literal("driver_broadcast"), // push each driver their schedule
  v.literal("custom"),
);
export const workflowCadence = v.union(
  v.literal("daily"),
  v.literal("weekly"),
  v.literal("manual"),
);
export const workflowRunStatus = v.union(
  v.literal("queued"),
  v.literal("running"),
  v.literal("completed"),
  v.literal("failed"),
);
export const suppressionScope = v.union(v.literal("all"), v.literal("marketing"));

export const opsTables = {
  // ═══════════════════════════════════════════════════════════════════════════
  // Group E — Duty allocation   [LODGE]
  // ═══════════════════════════════════════════════════════════════════════════
  // staff = a PERSON (Twenty person shape) plus employment fields.
  staff: defineTable({
    ...portable,
    propertyId: v.string(),
    operatorId: v.string(), // tenant key
    name: fullName, // FULL_NAME
    jobTitle: v.optional(v.string()),
    phones: phones, // PHONES — SMS confirmation target
    emails: v.optional(emails), // EMAILS
    avatarUrl: v.optional(v.string()),
    role: staffRole, // duty role (guide/driver/…)
    certifications: v.array(v.string()),
    languages: v.array(v.string()),
    dailyDutyCap: v.number(),
    allowedLeaveDays: v.number(), // feeds leave_register
    active: v.boolean(),
    ...stamps,
  })
    .index("by_portable_id", ["id"])
    .index("by_property", ["propertyId"])
    .index("by_property_role", ["propertyId", "role"])
    .index("by_phone", ["phones.primaryPhoneNumber"]),

  vehicles: defineTable({
    ...portable,
    propertyId: v.string(),
    name: v.string(),
    seatCapacity: v.number(), // for pickup capacity checks
    status: vehicleStatus,
    ...stamps,
  })
    .index("by_portable_id", ["id"])
    .index("by_property", ["propertyId"]),

  dutyAssignments: defineTable({
    ...portable,
    arrivalEventId: v.string(),
    propertyId: v.string(), // tenant key
    dutyType: dutyType,
    staffId: v.optional(v.string()), // null while unassigned
    vehicleId: v.optional(v.string()),
    seatsCommitted: v.optional(v.number()), // Σ vs partySize (capacity rule)
    status: dutyStatus,
    notifiedAt: v.optional(v.number()),
    acceptedAt: v.optional(v.number()),
    completedAt: v.optional(v.number()),
    ...stamps,
  })
    .index("by_portable_id", ["id"])
    .index("by_event", ["arrivalEventId"])
    .index("by_property", ["propertyId"])
    .index("by_staff", ["staffId"]),

  // ═══════════════════════════════════════════════════════════════════════════
  // Group F — Rooms, guests & check-in (light PMS)   [LODGE]
  // ═══════════════════════════════════════════════════════════════════════════
  rooms: defineTable({
    ...portable,
    propertyId: v.string(),
    name: v.string(),
    type: roomType,
    capacity: v.number(),
    maxAdults: v.number(),
    maxChildren: v.number(),
    bedConfig: v.string(),
    features: v.array(v.string()),
    zone: v.optional(v.string()),
    accessible: v.boolean(),
    housekeepingStatus: housekeepingStatus, // live readiness for check-in
    active: v.boolean(),
    ...stamps,
  })
    .index("by_portable_id", ["id"])
    .index("by_property", ["propertyId"])
    .index("by_housekeeping_status", ["housekeepingStatus"]),

  guestProfiles: defineTable({
    ...portable,
    operatorId: v.string(), // shareable across the group's properties
    name: fullName, // FULL_NAME (person shape)
    emails: v.optional(emails),
    phones: v.optional(phones),
    vipStatus: vipStatus,
    notes: v.optional(v.string()), // long-lived service prefs; NOT medical
    consentId: v.optional(v.string()), // lawful basis for a persistent profile (§24)
    erasedAt: v.optional(v.number()),
    ...stamps,
  })
    .index("by_portable_id", ["id"])
    .index("by_operator", ["operatorId"])
    .index("by_name", ["name.lastName"]),

  guests: defineTable({
    ...portable,
    bookingId: v.string(),
    propertyId: v.string(), // tenant key
    profileId: v.optional(v.string()), // returning guest
    name: fullName, // FULL_NAME (person shape)
    emails: v.optional(emails),
    phones: v.optional(phones),
    guestType: guestType,
    age: v.optional(v.number()), // only when it affects service; never full DOB
    isLead: v.boolean(),
    relationship: v.optional(v.string()),
    erasedAt: v.optional(v.number()),
    ...stamps,
  })
    .index("by_portable_id", ["id"])
    .index("by_booking", ["bookingId"])
    .index("by_property", ["propertyId"])
    .index("by_profile", ["profileId"]),

  guestRequirements: defineTable({
    ...portable,
    guestId: v.string(),
    propertyId: v.string(), // tenant key
    category: requirementCategory,
    label: v.string(), // dietary uses dietary_type values; else free text
    severity: requirementSeverity,
    notes: v.optional(v.string()),
    carriesForward: v.boolean(), // if true, promote to guest profile
  })
    .index("by_portable_id", ["id"])
    .index("by_guest", ["guestId"])
    .index("by_property", ["propertyId"])
    .index("by_category", ["category"]),

  stays: defineTable({
    ...portable,
    bookingId: v.string(),
    propertyId: v.string(), // tenant key
    roomId: v.optional(v.string()),
    arrivalEventId: v.optional(v.string()), // the inbound transfer bringing them
    departureEventId: v.optional(v.string()),
    plannedCheckIn: v.string(), // ISO date
    plannedCheckOut: v.string(),
    actualCheckInAt: v.optional(v.number()),
    actualCheckOutAt: v.optional(v.number()),
    status: stayStatus,
    boardBasis: boardBasis,
    adults: v.number(),
    children: v.number(),
    infants: v.number(),
    occasion: occasion,
    specialRequests: v.optional(v.string()),
    ...stamps,
  })
    .index("by_portable_id", ["id"])
    .index("by_booking", ["bookingId"])
    .index("by_property", ["propertyId"])
    .index("by_room", ["roomId"])
    .index("by_status", ["status"])
    .index("by_check_in_date", ["plannedCheckIn"])
    .index("by_arrival_event", ["arrivalEventId"]),

  stayGuests: defineTable({
    ...portable,
    stayId: v.string(),
    guestId: v.string(),
    isPrimary: v.boolean(),
  })
    .index("by_portable_id", ["id"])
    .index("by_stay", ["stayId"])
    .index("by_guest", ["guestId"])
    .index("by_pair", ["stayId", "guestId"]),

  // ═══════════════════════════════════════════════════════════════════════════
  // Group G — Smart leave planner   [LODGE]
  // ═══════════════════════════════════════════════════════════════════════════
  leaveRegister: defineTable({
    ...portable,
    staffId: v.string(),
    propertyId: v.string(), // tenant key
    year: v.number(),
    allowed: v.number(),
    taken: v.number(), // remaining is DERIVED (allowed − taken), never stored
    carriedIn: v.number(),
  })
    .index("by_portable_id", ["id"])
    .index("by_staff_year", ["staffId", "year"])
    .index("by_property", ["propertyId"]),

  leaveRequests: defineTable({
    ...portable,
    staffId: v.string(),
    propertyId: v.string(),
    startDate: v.string(),
    endDate: v.string(),
    days: v.number(), // working days requested (excl. holidays/off-days)
    leaveYear: v.number(), // which entitlement year it draws from
    status: leaveStatus,
    reason: v.optional(v.string()),
    conflictFlags: v.optional(v.any()), // coverage warnings computed at request time
    decidedByUserId: v.optional(v.string()),
    decidedAt: v.optional(v.number()),
    decisionNote: v.optional(v.string()),
  })
    .index("by_portable_id", ["id"])
    .index("by_staff", ["staffId"])
    .index("by_property", ["propertyId"])
    .index("by_property_status", ["propertyId", "status"])
    .index("by_dates", ["startDate"]),

  leavePlan: defineTable({
    ...portable,
    staffId: v.string(),
    propertyId: v.string(),
    date: v.string(), // ISO date; one row per staff per leave day
    leaveYear: v.number(),
    source: leaveSource,
    status: leaveStatus, // proposed → approved → taken/locked
    requestId: v.optional(v.string()), // the approved leaveRequest this day came from
    solveRunId: v.optional(v.string()), // provenance for explainability
  })
    .index("by_portable_id", ["id"])
    .index("by_staff", ["staffId"])
    .index("by_staff_year", ["staffId", "leaveYear"])
    .index("by_property_and_date", ["propertyId", "date"])
    .index("by_request", ["requestId"])
    .index("by_solve_run", ["solveRunId"]),

  // Public holidays / off-days the solver excludes from leave-day counts and
  // works around for coverage. Region- or property-scoped.
  publicHolidays: defineTable({
    ...portable,
    propertyId: v.optional(v.string()), // null = applies to all in the region
    region: v.optional(region),
    date: v.string(), // ISO date
    name: v.string(),
  })
    .index("by_portable_id", ["id"])
    .index("by_property", ["propertyId"])
    .index("by_date", ["date"]),

  coverageRules: defineTable({
    ...portable,
    propertyId: v.string(),
    role: staffRole,
    minStaff: v.number(),
    seasonStart: v.optional(v.string()),
    seasonEnd: v.optional(v.string()),
    seasonMinStaff: v.optional(v.number()),
    resilienceBuffer: v.number(), // slack above minimum
  })
    .index("by_portable_id", ["id"])
    .index("by_property", ["propertyId"])
    .index("by_property_role", ["propertyId", "role"]),

  demandCalendar: defineTable({
    ...portable,
    propertyId: v.string(),
    date: v.string(),
    expectedArrivals: v.number(), // derived from arrival_events
    expectedLoadScore: v.number(), // derived
  })
    .index("by_portable_id", ["id"])
    .index("by_property_and_date", ["propertyId", "date"]),

  solveRuns: defineTable({
    ...portable,
    propertyId: v.string(),
    year: v.number(),
    status: solveStatus, // includes infeasible
    objectiveValue: v.optional(v.number()),
    infeasibleReason: v.optional(v.string()),
    startedAt: v.number(),
    finishedAt: v.optional(v.number()),
    requestedBy: v.optional(v.string()),
  })
    .index("by_portable_id", ["id"])
    .index("by_property", ["propertyId"])
    .index("by_year", ["year"]),

  // ═══════════════════════════════════════════════════════════════════════════
  // Calendar   [LODGE] — reuses Twenty's calendarEvent/participant model.
  // One surface for bookings/stays AND leave, so the Lodge renders a single
  // calendar. Each row links back to its source record (stay / leave / duty).
  // ═══════════════════════════════════════════════════════════════════════════
  calendarEvents: defineTable({
    ...portable,
    propertyId: v.string(), // tenant key
    kind: calendarEventKind,
    title: v.string(),
    startsAt: v.number(),
    endsAt: v.number(),
    isFullDay: v.boolean(),
    location: v.optional(v.string()),
    description: v.optional(v.string()),
    // source links (exactly one set, by kind)
    stayId: v.optional(v.string()), // kind=stay
    bookingId: v.optional(v.string()),
    leavePlanId: v.optional(v.string()), // kind=leave
    leaveRequestId: v.optional(v.string()),
    dutyAssignmentId: v.optional(v.string()), // kind=duty
    staffId: v.optional(v.string()), // owning staff (leave/duty)
    arrivalEventId: v.optional(v.string()),
    isCanceled: v.boolean(),
    ...stamps,
  })
    .index("by_portable_id", ["id"])
    .index("by_property", ["propertyId"])
    .index("by_property_and_start", ["propertyId", "startsAt"])
    .index("by_kind", ["kind"])
    .index("by_stay", ["stayId"])
    .index("by_leave_plan", ["leavePlanId"])
    .index("by_staff", ["staffId"]),

  calendarEventParticipants: defineTable({
    ...portable,
    calendarEventId: v.string(),
    propertyId: v.string(), // tenant key
    participantKind: v.union(v.literal("staff"), v.literal("guest")),
    staffId: v.optional(v.string()),
    guestId: v.optional(v.string()),
    displayName: v.string(),
    isOrganizer: v.boolean(),
    responseStatus: calendarResponseStatus, // drives leave approval + booking confirmation
  })
    .index("by_portable_id", ["id"])
    .index("by_event", ["calendarEventId"])
    .index("by_property", ["propertyId"])
    .index("by_staff", ["staffId"])
    .index("by_guest", ["guestId"]),

  // ═══════════════════════════════════════════════════════════════════════════
  // Group L — Notes, staff broadcasts & recurring workflows   [LODGE]
  // Reuses Twenty's note/noteTarget, messageCampaign/List/Member, and
  // workflow/version/run/automatedTrigger shapes for lodge operations.
  // ═══════════════════════════════════════════════════════════════════════════
  // note (Twenty note) — attached to any lodge record via noteTargets.
  notes: defineTable({
    ...portable,
    propertyId: v.string(), // tenant key
    authorUserId: v.optional(v.string()),
    title: v.optional(v.string()),
    body: v.string(),
    pinned: v.boolean(),
    ...stamps,
  })
    .index("by_portable_id", ["id"])
    .index("by_property", ["propertyId"]),

  // noteTarget (Twenty noteTarget) — polymorphic link, one FK set per kind.
  noteTargets: defineTable({
    ...portable,
    noteId: v.string(),
    propertyId: v.string(),
    targetKind: noteTargetKind,
    arrivalEventId: v.optional(v.string()),
    dutyAssignmentId: v.optional(v.string()),
    staffId: v.optional(v.string()),
    bookingId: v.optional(v.string()),
    stayId: v.optional(v.string()),
    guestId: v.optional(v.string()),
  })
    .index("by_portable_id", ["id"])
    .index("by_note", ["noteId"])
    .index("by_property", ["propertyId"])
    .index("by_arrival", ["arrivalEventId"])
    .index("by_duty", ["dutyAssignmentId"])
    .index("by_staff", ["staffId"]),

  // messageList (Twenty) — a staff distribution list, e.g. "Drivers", "On-duty guides".
  staffLists: defineTable({
    ...portable,
    propertyId: v.string(),
    name: v.string(),
    description: v.optional(v.string()),
    dynamic: v.boolean(), // true = auto-membership by roleFilter
    roleFilter: v.optional(staffRole),
    active: v.boolean(),
    ...stamps,
  })
    .index("by_portable_id", ["id"])
    .index("by_property", ["propertyId"]),

  // messageListMember (Twenty) — a staff member on a list (explicit membership).
  staffListMembers: defineTable({
    ...portable,
    listId: v.string(),
    propertyId: v.string(),
    staffId: v.string(),
  })
    .index("by_portable_id", ["id"])
    .index("by_list", ["listId"])
    .index("by_staff", ["staffId"]),

  // messageThread (Twenty) — groups a broadcast with its inbound replies.
  messageThreads: defineTable({
    ...portable,
    propertyId: v.string(),
    kind: messageThreadKind,
    subject: v.string(),
    broadcastId: v.optional(v.string()),
    arrivalEventId: v.optional(v.string()),
    ...stamps,
  })
    .index("by_portable_id", ["id"])
    .index("by_property", ["propertyId"]),

  // messageCampaign (Twenty) — a broadcast to a staff list. Fans out to one
  // `notifications` row per recipient via the outbox; replies land on the thread.
  broadcasts: defineTable({
    ...portable,
    propertyId: v.string(),
    listId: v.optional(v.string()), // target list; null = ad-hoc recipient set
    threadId: v.optional(v.string()),
    channel: channel, // sms | whatsapp | push | email
    subject: v.optional(v.string()),
    body: v.string(),
    status: broadcastStatus,
    scheduledFor: v.optional(v.number()),
    sentAt: v.optional(v.number()),
    recipientCount: v.optional(v.number()),
    createdByUserId: v.optional(v.string()),
    arrivalEventId: v.optional(v.string()), // e.g. "your pickup changed"
    workflowRunId: v.optional(v.string()), // set when a recurring workflow generated it
    ...stamps,
  })
    .index("by_portable_id", ["id"])
    .index("by_property", ["propertyId"])
    .index("by_status", ["status"])
    .index("by_list", ["listId"]),

  // workflow + automatedTrigger (Twenty) — the recurring generators: daily driver
  // run-sheets, weekly duty rosters. A run produces a printJob and/or a broadcast.
  recurringWorkflows: defineTable({
    ...portable,
    propertyId: v.string(),
    name: v.string(),
    type: workflowType,
    cadence: workflowCadence,
    runAtLocalTime: v.optional(v.string()), // "06:30"
    dayOfWeek: v.optional(v.number()), // 0-6 for weekly
    targetListId: v.optional(v.string()), // list to broadcast to
    config: v.optional(v.any()),
    active: v.boolean(),
    lastRunAt: v.optional(v.number()),
    nextRunAt: v.optional(v.number()),
    ...stamps,
  })
    .index("by_portable_id", ["id"])
    .index("by_property", ["propertyId"])
    .index("by_active_next", ["active", "nextRunAt"]),

  // workflowRun (Twenty) — one execution; links to what it produced.
  workflowRuns: defineTable({
    ...portable,
    workflowId: v.string(),
    propertyId: v.string(),
    status: workflowRunStatus,
    startedAt: v.number(),
    finishedAt: v.optional(v.number()),
    producedPrintJobId: v.optional(v.string()),
    producedBroadcastId: v.optional(v.string()),
    error: v.optional(v.string()),
    ...stamps,
  })
    .index("by_portable_id", ["id"])
    .index("by_workflow", ["workflowId"])
    .index("by_property", ["propertyId"])
    .index("by_status", ["status"]),

  // blocklist (Twenty) — do-not-contact / opt-out suppression (DPA-safe).
  // Escalation SMS overrides scope=marketing but respects scope=all.
  suppressionList: defineTable({
    ...portable,
    propertyId: v.optional(v.string()),
    handle: v.string(), // phone/email
    scope: suppressionScope,
    reason: v.optional(v.string()),
    addedByUserId: v.optional(v.string()),
    at: v.number(),
  })
    .index("by_portable_id", ["id"])
    .index("by_handle", ["handle"])
    .index("by_property", ["propertyId"]),

  // ═══════════════════════════════════════════════════════════════════════════
  // Group H — Messaging & print   [SHARED; print_jobs = LODGE]
  // ═══════════════════════════════════════════════════════════════════════════
  notifications: defineTable({
    ...portable,
    recipientUserId: v.optional(v.string()),
    recipientPhone: v.optional(v.string()),
    recipientEmail: v.optional(v.string()),
    channel: channel,
    provider: notificationProvider,
    arrivalEventId: v.optional(v.string()),
    templateId: v.optional(v.string()),
    templateKey: v.string(),
    threadId: v.optional(v.string()), // groups a broadcast + its replies
    broadcastId: v.optional(v.string()), // set when this row is one fan-out of a broadcast
    subject: v.optional(v.string()),
    fromAddress: v.optional(v.string()),
    payload: v.any(), // rendered body + deep link + variables
    status: notificationStatus,
    providerMessageId: v.optional(v.string()),
    errorCode: v.optional(v.string()),
    retryCount: v.number(),
    correlationId: v.optional(v.string()),
    queuedAt: v.optional(v.number()),
    sentAt: v.optional(v.number()),
    deliveredAt: v.optional(v.number()),
    operatorId: v.optional(v.string()),
    airlineId: v.optional(v.string()),
  })
    .index("by_portable_id", ["id"])
    .index("by_recipient", ["recipientUserId"])
    .index("by_event", ["arrivalEventId"])
    .index("by_status", ["status"])
    .index("by_provider_message_id", ["providerMessageId"])
    .index("by_correlation", ["correlationId"]),

  printJobs: defineTable({
    ...portable,
    propertyId: v.string(),
    type: printType,
    rangeStart: v.string(),
    rangeEnd: v.string(),
    versionStamp: v.string(),
    fileId: v.string(), // storage handle
    generatedBy: v.optional(v.string()),
    generatedAt: v.number(),
    supersededAt: v.optional(v.number()),
  })
    .index("by_portable_id", ["id"])
    .index("by_property", ["propertyId"])
    .index("by_type_and_range", ["propertyId", "type"]),

  // ═══════════════════════════════════════════════════════════════════════════
  // Group I — Security, auth & audit   [SHARED / platform]
  // ═══════════════════════════════════════════════════════════════════════════
  clerkSyncEvents: defineTable({
    ...portable,
    clerkEventId: v.string(), // idempotency key
    type: v.string(),
    payload: v.any(),
    status: v.string(), // received | applied | ignored | error
    at: v.number(),
  })
    .index("by_portable_id", ["id"])
    .index("by_clerk_event", ["clerkEventId"])
    .index("by_type", ["type"]),

  apiKeys: defineTable({
    ...portable,
    organizationId: v.string(),
    name: v.string(),
    keyHash: v.string(), // only the hash is stored
    scopes: v.array(v.string()),
    lastUsedAt: v.optional(v.number()),
    revokedAt: v.optional(v.number()),
  })
    .index("by_portable_id", ["id"])
    .index("by_organization", ["organizationId"])
    .index("by_key_hash", ["keyHash"]),

  securityAuditLog: defineTable({
    ...portable,
    actorUserId: v.optional(v.string()),
    clerkUserId: v.optional(v.string()),
    organizationId: v.optional(v.string()),
    action: v.string(), // role_changed | api_key_created | data_exported | tenant_denied | ...
    entityType: v.optional(v.string()),
    entityId: v.optional(v.string()),
    ip: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    metadata: v.optional(v.any()),
    at: v.number(),
  })
    .index("by_portable_id", ["id"])
    .index("by_actor", ["actorUserId"])
    .index("by_organization", ["organizationId"])
    .index("by_action", ["action"])
    .index("by_at", ["at"]),

  piiAccessLog: defineTable({
    ...portable,
    actorUserId: v.string(),
    guestId: v.optional(v.string()),
    bookingId: v.optional(v.string()),
    fields: v.array(v.string()), // which sensitive fields were read
    purpose: v.optional(v.string()),
    at: v.number(),
  })
    .index("by_portable_id", ["id"])
    .index("by_guest", ["guestId"])
    .index("by_actor", ["actorUserId"])
    .index("by_at", ["at"]),

  consents: defineTable({
    ...portable,
    guestProfileId: v.optional(v.string()),
    bookingId: v.optional(v.string()),
    purpose: consentPurpose,
    lawfulBasis: lawfulBasis,
    granted: v.boolean(),
    grantedBy: v.optional(v.string()),
    source: v.string(),
    withdrawnAt: v.optional(v.number()),
    expiresAt: v.optional(v.number()),
    at: v.number(),
  })
    .index("by_portable_id", ["id"])
    .index("by_guest_profile", ["guestProfileId"])
    .index("by_booking", ["bookingId"])
    .index("by_purpose", ["purpose"]),

  dataSubjectRequests: defineTable({
    ...portable,
    type: dsrType,
    subjectKind: v.string(), // guest | guest_profile | user
    subjectRef: v.string(),
    operatorId: v.optional(v.string()),
    requestedAt: v.number(),
    verifiedAt: v.optional(v.number()),
    status: dsrStatus,
    handledBy: v.optional(v.string()),
    completedAt: v.optional(v.number()),
    notes: v.optional(v.string()),
  })
    .index("by_portable_id", ["id"])
    .index("by_status", ["status"])
    .index("by_subject", ["subjectRef"])
    .index("by_operator", ["operatorId"]),

  deletionLog: defineTable({
    ...portable,
    dsrId: v.optional(v.string()),
    subjectKind: v.string(),
    subjectRef: v.string(),
    method: erasureMethod,
    scopes: v.array(v.string()),
    retainedExceptions: v.array(v.string()),
    executedBy: v.optional(v.string()),
    at: v.number(),
  })
    .index("by_portable_id", ["id"])
    .index("by_dsr", ["dsrId"])
    .index("by_subject", ["subjectRef"])
    .index("by_at", ["at"]),

  // ═══════════════════════════════════════════════════════════════════════════
  // Group J — Notifications, delivery & integration plumbing   [SHARED]
  // ═══════════════════════════════════════════════════════════════════════════
  notificationTemplates: defineTable({
    ...portable,
    key: v.string(),
    channel: channel,
    locale: v.string(),
    subject: v.optional(v.string()),
    body: v.string(),
    active: v.boolean(),
  })
    .index("by_portable_id", ["id"])
    .index("by_key_channel_locale", ["key", "channel", "locale"]),

  notificationPreferences: defineTable({
    ...portable,
    userId: v.string(),
    channelPriority: v.array(v.string()),
    quietHours: v.optional(v.any()),
    optedOutChannels: v.array(v.string()),
  })
    .index("by_portable_id", ["id"])
    .index("by_user", ["userId"]),

  messageOutbox: defineTable({
    ...portable,
    kind: v.string(), // notification | webhook
    refId: v.string(),
    payload: v.any(),
    status: outboxStatus,
    attempts: v.number(),
    nextAttemptAt: v.optional(v.number()), // exponential backoff
    lastError: v.optional(v.string()),
    dispatchedAt: v.optional(v.number()),
  })
    .index("by_portable_id", ["id"])
    .index("by_status_next_attempt", ["status", "nextAttemptAt"]),

  webhookEndpoints: defineTable({
    ...portable,
    organizationId: v.string(),
    url: v.string(),
    secret: v.string(), // HMAC signing secret
    events: v.array(v.string()),
    active: v.boolean(),
  })
    .index("by_portable_id", ["id"])
    .index("by_organization", ["organizationId"]),

  webhookDeliveries: defineTable({
    ...portable,
    endpointId: v.string(),
    event: v.string(),
    payload: v.any(),
    status: webhookStatus,
    responseCode: v.optional(v.number()),
    attempts: v.number(),
    deliveredAt: v.optional(v.number()),
  })
    .index("by_portable_id", ["id"])
    .index("by_endpoint", ["endpointId"])
    .index("by_status", ["status"]),

  integrationLogs: defineTable({
    ...portable,
    provider: integrationProvider,
    direction: integrationDirection,
    ref: v.optional(v.string()),
    status: integrationStatus,
    correlationId: v.optional(v.string()),
    request: v.optional(v.any()), // redacted of secrets/PII
    response: v.optional(v.any()),
    latencyMs: v.optional(v.number()),
    at: v.number(),
  })
    .index("by_portable_id", ["id"])
    .index("by_provider", ["provider"])
    .index("by_correlation", ["correlationId"])
    .index("by_at", ["at"]),

  inboundMessages: defineTable({
    ...portable,
    channel: channel,
    provider: notificationProvider,
    fromAddress: v.string(),
    raw: v.string(), // verbatim message
    parsedEventId: v.optional(v.string()),
    threadId: v.optional(v.string()), // reply threaded to a broadcast/ack
    status: v.string(), // received | parsed | unmatched
    at: v.number(),
  })
    .index("by_portable_id", ["id"])
    .index("by_from", ["fromAddress"])
    .index("by_thread", ["threadId"])
    .index("by_status", ["status"]),

  // ═══════════════════════════════════════════════════════════════════════════
  // Group K — Caching & read models   [SHARED — board_projections feeds both boards]
  // ═══════════════════════════════════════════════════════════════════════════
  boardProjections: defineTable({
    ...portable,
    scope: projectionScope, // property (Lodge board) | airline (Air board)
    scopeId: v.string(), // property_id or airline_id
    date: v.string(),
    kpis: v.any(), // precomputed board KPIs
    rows: v.any(), // compact denormalized event rows
    operatorId: v.optional(v.string()),
    airlineId: v.optional(v.string()),
    rebuiltAt: v.number(),
  })
    .index("by_portable_id", ["id"])
    .index("by_scope_and_date", ["scope", "scopeId", "date"]),

  cacheVersions: defineTable({
    ...portable,
    scope: v.string(), // e.g. airstrips:global, fleet:{airline_id}
    version: v.number(),
    updatedAt: v.number(),
  })
    .index("by_portable_id", ["id"])
    .index("by_scope", ["scope"]),
};
