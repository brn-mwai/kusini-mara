import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// ─────────────────────────────────────────────────────────────────────────────
// Shared enums (closed sets — every status field draws from a fixed union).
// Exported so functions and the UI reuse the exact same literals.
// ─────────────────────────────────────────────────────────────────────────────
export const orgType = v.union(v.literal("airline"), v.literal("lodge"));
export const direction = v.union(v.literal("arrival"), v.literal("departure"));

// Movement lifecycle. Physical progress (in_flight/landed) is kept distinct from
// the lodge confirmation gate (acknowledged); `escalated` is a parallel flag the
// scheduler raises when an unacknowledged movement crosses its window.
export const movementStatus = v.union(
  v.literal("requested"), // booking spawned it; no flight yet
  v.literal("scheduled"), // airline attached a flight + time
  v.literal("acknowledged"), // lodge closed the loop
  v.literal("in_flight"),
  v.literal("landed"),
  v.literal("completed"),
  v.literal("escalated"), // unacknowledged within window before scheduled_time
);

export const flightStatus = v.union(
  v.literal("planned"),
  v.literal("boarding"),
  v.literal("in_flight"),
  v.literal("completed"),
  v.literal("cancelled"),
);

export const aircraftStatus = v.union(
  v.literal("in_service"),
  v.literal("available"),
  v.literal("maintenance"),
);

export const pilotStatus = v.union(
  v.literal("flying"),
  v.literal("available"),
  v.literal("rest"),
);

export const dutyStatus = v.union(
  v.literal("assigned"),
  v.literal("accepted"),
  v.literal("completed"),
);

export const notifyChannel = v.union(
  v.literal("sms"),
  v.literal("whatsapp"),
  v.literal("mock"),
);

export const outboxStatus = v.union(
  v.literal("pending"),
  v.literal("sent"),
  v.literal("failed"),
);

// Event taxonomy for the audit spine. Every state change writes one transferEvent.
export const eventType = v.union(
  v.literal("booking_created"),
  v.literal("movement_requested"),
  v.literal("movement_scheduled"),
  v.literal("movement_rescheduled"),
  v.literal("movement_acknowledged"),
  v.literal("movement_reconfirm_requested"),
  v.literal("flight_built"),
  v.literal("flight_dispatched"),
  v.literal("flight_landed"),
  v.literal("movement_completed"),
  v.literal("duty_assigned"),
  v.literal("escalation_fired"),
  v.literal("notification_sent"),
);

export default defineSchema({
  // ── tenancy spine ──────────────────────────────────────────────────────────
  organizations: defineTable({
    type: orgType,
    name: v.string(),
    shortCode: v.string(), // sidebar mono badge: "R", "A"
    dutyContactId: v.optional(v.id("users")),
    backupContactId: v.optional(v.id("users")),
    opsPhone: v.optional(v.string()), // airline ops escalation line
  })
    .index("by_type", ["type"])
    .index("by_shortCode", ["shortCode"]),

  users: defineTable({
    orgId: v.id("organizations"), // each user belongs to exactly ONE org
    // Clerk subject (`tokenIdentifier` / `subject`). Resolved server-side only —
    // a client-supplied tenant id is NEVER trusted.
    tokenIdentifier: v.string(),
    name: v.string(),
    role: v.string(), // ops | duty_contact | backup | staff_admin
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
  })
    .index("by_org", ["orgId"])
    .index("by_token", ["tokenIdentifier"]),

  // Which airline serves which lodge. Authorizes a flight to carry a lodge's
  // movements and gates cross-org reads at the link boundary.
  airlineLodgeLinks: defineTable({
    airlineId: v.id("organizations"),
    lodgeId: v.id("organizations"),
  })
    .index("by_airline", ["airlineId"])
    .index("by_lodge", ["lodgeId"])
    .index("by_pair", ["airlineId", "lodgeId"]),

  // ── reference data ───────────────────────────────────────────────────────────
  airstrips: defineTable({
    name: v.string(),
    region: v.string(),
  }).index("by_name", ["name"]),

  aircraft: defineTable({
    airlineId: v.id("organizations"),
    reg: v.string(), // tail number "5Y-BMF"
    type: v.string(),
    seats: v.number(),
    base: v.string(),
    status: aircraftStatus,
  })
    .index("by_airline", ["airlineId"])
    .index("by_reg", ["reg"]),

  pilots: defineTable({
    airlineId: v.id("organizations"),
    name: v.string(),
    license: v.string(), // CPL | ATPL
    hours: v.number(),
    status: pilotStatus,
  }).index("by_airline", ["airlineId"]),

  staff: defineTable({
    lodgeId: v.id("organizations"),
    name: v.string(),
    role: v.string(),
    phone: v.optional(v.string()),
    certifications: v.array(v.string()),
    languages: v.array(v.string()),
    entitlementDays: v.number(),
    leaveBalance: v.number(),
    available: v.boolean(),
  }).index("by_lodge", ["lodgeId"]),

  // ── booking → movement → flight spine ────────────────────────────────────────
  // Thin PMS reference. Kusini reads bookings in; it never authors travel logic
  // beyond spawning the two movements a booking implies.
  bookings: defineTable({
    lodgeId: v.id("organizations"),
    guest: v.string(),
    pax: v.number(),
    externalRef: v.string(), // PMS id "RR-88231"
    arrivalDate: v.number(), // ms
    departureDate: v.number(), // ms
    arrivalAirstrip: v.string(),
    departureAirstrip: v.string(),
  })
    .index("by_lodge", ["lodgeId"])
    .index("by_externalRef", ["externalRef"]),

  // THE SPINE. The unit a lodge acknowledges and the row both apps watch live.
  movements: defineTable({
    bookingId: v.id("bookings"),
    direction,
    lodgeId: v.id("organizations"), // tenant key (ground side)
    airlineId: v.id("organizations"), // tenant key (air side)
    airstrip: v.string(),
    guestName: v.string(), // denormalized for board reads (no join)
    pax: v.number(),
    special: v.array(v.string()), // dietary / mobility / VIP notes
    luggage: v.optional(v.string()),

    scheduledTime: v.number(), // ms; provisional until a flight is attached
    status: movementStatus,
    flightId: v.optional(v.id("flights")), // null until the airline schedules it

    // Confirmation gate, kept separate from physical status.
    acknowledgedAt: v.optional(v.number()),
    lastAckUserId: v.optional(v.id("users")),
    // Raised when the airline changes the time after an ack — invalidates it.
    reconfirmRequested: v.boolean(),

    // Denormalized escalation deadline (= scheduledTime − window). Lets the cron
    // sweep a single index instead of scanning every movement.
    escalationDeadline: v.optional(v.number()),
    escalatedAt: v.optional(v.number()),

    correlationId: v.string(), // ties every event/notification for this movement
  })
    .index("by_lodge", ["lodgeId"])
    .index("by_airline", ["airlineId"])
    .index("by_flight", ["flightId"])
    .index("by_booking", ["bookingId"])
    .index("by_status", ["status"])
    .index("by_lodge_status", ["lodgeId", "status"])
    .index("by_airline_status", ["airlineId", "status"])
    // Cron sweep: scan scheduled movements ordered by deadline.
    .index("by_status_deadline", ["status", "escalationDeadline"])
    .index("by_correlation", ["correlationId"]),

  // Airline-owned. Carries many movements across multiple lodges, arrivals and
  // departures mixed on one aircraft.
  flights: defineTable({
    airlineId: v.id("organizations"),
    code: v.string(), // "F-101"
    aircraftReg: v.string(),
    pilotName: v.string(),
    departTime: v.number(),
    base: v.string(),
    status: flightStatus,
  })
    .index("by_airline", ["airlineId"])
    .index("by_code", ["code"])
    .index("by_airline_status", ["airlineId", "status"]),

  // Core audit record. Append-only; one row per lodge confirmation.
  acknowledgments: defineTable({
    movementId: v.id("movements"),
    lodgeId: v.id("organizations"),
    byUserId: v.id("users"),
    at: v.number(),
    channel: notifyChannel,
    type: v.union(v.literal("initial"), v.literal("reconfirm")),
  })
    .index("by_movement", ["movementId"])
    .index("by_lodge", ["lodgeId"]),

  // Per-staff leave days (one row per staff per day off). The planner reads a
  // window of these; the optimizer (OR-Tools CP-SAT) is out of scope this pass.
  leaveDays: defineTable({
    lodgeId: v.id("organizations"),
    staffId: v.id("staff"),
    date: v.number(), // day-start ms
  })
    .index("by_lodge", ["lodgeId"])
    .index("by_staff", ["staffId"])
    .index("by_staff_date", ["staffId", "date"]),

  dutyAssignments: defineTable({
    movementId: v.id("movements"),
    lodgeId: v.id("organizations"),
    staffId: v.id("staff"),
    dutyType: v.string(), // pickup | dropoff
    status: dutyStatus,
    assignedAt: v.number(),
    confirmedAt: v.optional(v.number()),
  })
    .index("by_movement", ["movementId"])
    .index("by_lodge", ["lodgeId"])
    .index("by_staff", ["staffId"]),

  // ── append-only logs / outbox ────────────────────────────────────────────────
  // Notifications outbox. A row is created in `pending`, an action attempts
  // delivery and flips it `sent`/`failed`. Retries re-read failed rows. When no
  // provider creds exist the row lands as channel `mock`, status `sent`,
  // delivered:false — the escalation is still auditable.
  notifications: defineTable({
    at: v.number(),
    channel: notifyChannel,
    status: outboxStatus,
    toPhone: v.optional(v.string()),
    toUserId: v.optional(v.id("users")),
    movementId: v.optional(v.id("movements")),
    lodgeId: v.optional(v.id("organizations")),
    airlineId: v.optional(v.id("organizations")),
    kind: v.string(), // escalation | nudge | reconfirm
    body: v.string(),
    delivered: v.boolean(),
    attempts: v.number(),
    lastError: v.optional(v.string()),
    correlationId: v.optional(v.string()),
  })
    .index("by_movement", ["movementId"])
    .index("by_status", ["status"])
    .index("by_at", ["at"]),

  // Every state change writes one event carrying the correlation_id. This is the
  // single source of truth for the audit log.
  transferEvents: defineTable({
    correlationId: v.string(),
    movementId: v.optional(v.id("movements")),
    lodgeId: v.id("organizations"),
    airlineId: v.id("organizations"),
    type: eventType,
    at: v.number(),
    byUserId: v.optional(v.id("users")),
    summary: v.string(),
    meta: v.optional(v.any()),
  })
    .index("by_correlation", ["correlationId"])
    .index("by_movement", ["movementId"])
    .index("by_lodge", ["lodgeId"])
    .index("by_airline", ["airlineId"])
    .index("by_at", ["at"]),
});
