import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// ═════════════════════════════════════════════════════════════════════════════
// Kusini data model (v2) — production-grade depth.
//
// Design conventions, applied consistently like a large platform would:
//  • Time is never abstract. Events carry a UTC instant (ms) AND an IANA
//    timezone, plus a graduated set of times — tentative → scheduled → estimated
//    → actual — so a tentative booking, a firm slot, a live ETA, and the moment
//    it actually happened are distinct, queryable facts.
//  • Audit on every mutable row: createdByUserId / updatedAt / updatedByUserId,
//    plus soft-delete (deletedAt) so nothing is hard-lost. _creationTime is the
//    created-at.
//  • Integration-ready: source system + external ref + idempotency key on rows
//    that may originate in a PMS or reservation system, so re-imports dedupe.
//  • Money/commercial is structured now (subscriptions, per-property metering)
//    even though the pilot is free — no migration at commercial rollout.
// ═════════════════════════════════════════════════════════════════════════════

// ── reusable field groups ─────────────────────────────────────────────────────
const audit = {
  updatedAt: v.optional(v.number()),
  createdByUserId: v.optional(v.id("users")),
  updatedByUserId: v.optional(v.id("users")),
  deletedAt: v.optional(v.number()), // soft delete
};

const geo = {
  latitude: v.optional(v.number()),
  longitude: v.optional(v.number()),
  elevationM: v.optional(v.number()),
};

const source = {
  sourceSystem: v.optional(v.string()), // "pms" | "reservations" | "manual" | "api"
  externalRef: v.optional(v.string()),
  idempotencyKey: v.optional(v.string()),
};

// ── closed enums ──────────────────────────────────────────────────────────────
export const transportMode = v.union(
  v.literal("charter"),
  v.literal("scheduled"),
  v.literal("helicopter"),
  v.literal("road"),
  v.literal("self_drive"),
  v.literal("self_fly"),
);

export const direction = v.union(v.literal("arrival"), v.literal("departure"));

export const arrivalStatus = v.union(
  v.literal("requested"),
  v.literal("scheduled"),
  v.literal("acknowledged"),
  v.literal("in_transit"),
  v.literal("arrived"),
  v.literal("completed"),
  v.literal("escalated"),
  v.literal("cancelled"),
  v.literal("no_show"),
);

export const timeConfidence = v.union(
  v.literal("tentative"), // booking-agent window, not firm
  v.literal("scheduled"), // firm slot
  v.literal("estimated"), // live ETA revised
  v.literal("actual"), // happened
);

export const createdByParty = v.union(
  v.literal("property"),
  v.literal("airline"),
  v.literal("operator"),
);

export const userScope = v.union(
  v.literal("operator"),
  v.literal("property"),
  v.literal("airline"),
);

export const userRole = v.union(
  v.literal("operator_admin"),
  v.literal("property_manager"),
  v.literal("duty_contact"),
  v.literal("backup_contact"),
  v.literal("staff"),
  v.literal("airline_ops"),
  v.literal("airline_dispatcher"),
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
  v.literal("grounded"),
);

export const pilotStatus = v.union(
  v.literal("flying"),
  v.literal("available"),
  v.literal("rest"),
  v.literal("off"),
);

export const staffRole = v.union(
  v.literal("guide"),
  v.literal("driver"),
  v.literal("porter"),
  v.literal("front_desk"),
  v.literal("housekeeping"),
  v.literal("chef"),
  v.literal("manager"),
  v.literal("security"),
  v.literal("other"),
);

export const dutyType = v.union(
  v.literal("airstrip_pickup"),
  v.literal("airstrip_dropoff"),
  v.literal("welcome_game_drive"),
  v.literal("luggage"),
  v.literal("guiding"),
  v.literal("transfer"),
);

export const dutyStatus = v.union(
  v.literal("assigned"),
  v.literal("notified"),
  v.literal("accepted"),
  v.literal("declined"),
  v.literal("completed"),
  v.literal("cancelled"),
);

export const roomType = v.union(
  v.literal("tented_suite"),
  v.literal("family_unit"),
  v.literal("honeymoon"),
  v.literal("standard"),
  v.literal("private_house"),
);

export const roomStatus = v.union(
  v.literal("available"),
  v.literal("occupied"),
  v.literal("cleaning"),
  v.literal("maintenance"),
  v.literal("blocked"),
);

export const vehicleType = v.union(
  v.literal("land_cruiser"),
  v.literal("safari_van"),
  v.literal("sedan"),
  v.literal("truck"),
  v.literal("boat"),
);

export const leaveSource = v.union(v.literal("manual"), v.literal("solver"));
export const leaveRequestStatus = v.union(
  v.literal("pending"),
  v.literal("approved"),
  v.literal("rejected"),
  v.literal("cancelled"),
);
export const carryOverPolicy = v.union(
  v.literal("hard_reset"),
  v.literal("carry_capped"),
);

export const notifyChannel = v.union(
  v.literal("sms"),
  v.literal("whatsapp"),
  v.literal("email"),
  v.literal("push"),
  v.literal("mock"),
);
export const outboxStatus = v.union(
  v.literal("pending"),
  v.literal("sent"),
  v.literal("delivered"),
  v.literal("failed"),
);
export const notifyKind = v.union(
  v.literal("arrival_posted"),
  v.literal("arrival_updated"),
  v.literal("reconfirm_required"),
  v.literal("escalation"),
  v.literal("duty_assigned"),
  v.literal("nudge"),
);

export const subscriptionStatus = v.union(
  v.literal("trial"),
  v.literal("active"),
  v.literal("past_due"),
  v.literal("cancelled"),
);

export const eventType = v.union(
  v.literal("arrival_created"),
  v.literal("arrival_scheduled"),
  v.literal("arrival_rescheduled"),
  v.literal("arrival_acknowledged"),
  v.literal("arrival_reconfirm_requested"),
  v.literal("arrival_claimed"),
  v.literal("arrival_cancelled"),
  v.literal("flight_built"),
  v.literal("flight_dispatched"),
  v.literal("flight_landed"),
  v.literal("arrival_completed"),
  v.literal("duty_assigned"),
  v.literal("duty_accepted"),
  v.literal("room_assigned"),
  v.literal("leave_requested"),
  v.literal("leave_approved"),
  v.literal("escalation_fired"),
  v.literal("notification_sent"),
);

// Mode-specific operational detail — all optional; each mode fills what it needs.
const modeDetail = v.optional(
  v.object({
    flightId: v.optional(v.string()),
    aircraftReg: v.optional(v.string()),
    pilotName: v.optional(v.string()),
    pilotContact: v.optional(v.string()),
    carrier: v.optional(v.string()),
    flightNumber: v.optional(v.string()),
    connectionNotes: v.optional(v.string()),
    operator: v.optional(v.string()),
    vehicle: v.optional(v.string()),
    driverName: v.optional(v.string()),
    driverContact: v.optional(v.string()),
    gateTime: v.optional(v.number()),
    landingPoint: v.optional(v.string()),
    routeNotes: v.optional(v.string()),
    guestVehicle: v.optional(v.string()),
    guestPilotName: v.optional(v.string()),
  }),
);

export default defineSchema({
  // ── account hierarchy: operator → property → airstrip ─────────────────────────
  operators: defineTable({
    name: v.string(),
    legalName: v.optional(v.string()),
    shortCode: v.string(),
    countryCode: v.optional(v.string()), // ISO-3166 alpha-2, e.g. "KE"
    billingEmail: v.optional(v.string()),
    billingPhone: v.optional(v.string()),
    timezone: v.optional(v.string()), // default IANA tz for the group
    ...source,
    ...audit,
  }).index("by_shortCode", ["shortCode"]),

  properties: defineTable({
    operatorId: v.id("operators"),
    name: v.string(),
    region: v.string(),
    shortCode: v.string(),
    timezone: v.string(), // IANA — drives all local time display
    countryCode: v.optional(v.string()),
    ...geo,
    dutyContactId: v.optional(v.id("users")),
    backupContactId: v.optional(v.id("users")),
    opsPhone: v.optional(v.string()),
    carryOverPolicy: v.optional(carryOverPolicy),
    carryOverCapDays: v.optional(v.number()),
    leaveYearStartMonth: v.optional(v.number()), // 1 = January
    ...source,
    ...audit,
  })
    .index("by_operator", ["operatorId"])
    .index("by_shortCode", ["shortCode"]),

  airlines: defineTable({
    name: v.string(),
    shortCode: v.string(),
    opsPhone: v.optional(v.string()),
    opsEmail: v.optional(v.string()),
    base: v.optional(v.string()),
    timezone: v.optional(v.string()),
    ...audit,
  }).index("by_shortCode", ["shortCode"]),

  airstrips: defineTable({
    name: v.string(),
    code: v.optional(v.string()), // ICAO/IATA/local identifier
    region: v.string(),
    timezone: v.optional(v.string()),
    ...geo,
    surface: v.optional(v.string()), // murram | grass | tarmac
    lengthM: v.optional(v.number()),
    ...audit,
  })
    .index("by_name", ["name"])
    .index("by_code", ["code"]),

  // Many-to-many: one strip can serve several properties.
  propertyAirstrips: defineTable({
    propertyId: v.id("properties"),
    airstripId: v.id("airstrips"),
    driveMinutes: v.optional(v.number()), // strip → property transfer time
    isPrimary: v.optional(v.boolean()),
  })
    .index("by_property", ["propertyId"])
    .index("by_airstrip", ["airstripId"])
    .index("by_pair", ["propertyId", "airstripId"]),

  airlinePropertyLinks: defineTable({
    airlineId: v.id("airlines"),
    propertyId: v.id("properties"),
    ...audit,
  })
    .index("by_airline", ["airlineId"])
    .index("by_property", ["propertyId"])
    .index("by_pair", ["airlineId", "propertyId"]),

  // ── commercial (structured now; pilot is free) ───────────────────────────────
  subscriptions: defineTable({
    operatorId: v.id("operators"),
    status: subscriptionStatus,
    planCode: v.string(), // "pilot" | "per_property"
    pricePerPropertyCents: v.optional(v.number()),
    currency: v.optional(v.string()), // ISO-4217, e.g. "USD"
    activeProperties: v.optional(v.number()),
    billingCycleAnchor: v.optional(v.number()),
    trialEndsAt: v.optional(v.number()),
    ...audit,
  }).index("by_operator", ["operatorId"]),

  // ── identity ──────────────────────────────────────────────────────────────────
  users: defineTable({
    scope: userScope,
    operatorId: v.optional(v.id("operators")),
    propertyId: v.optional(v.id("properties")),
    airlineId: v.optional(v.id("airlines")),
    tokenIdentifier: v.string(),
    name: v.string(),
    role: userRole,
    phoneE164: v.optional(v.string()),
    phoneVerifiedAt: v.optional(v.number()),
    whatsappOptIn: v.optional(v.boolean()),
    email: v.optional(v.string()),
    emailVerifiedAt: v.optional(v.number()),
    lastActiveAt: v.optional(v.number()),
    ...audit,
  })
    .index("by_property", ["propertyId"])
    .index("by_airline", ["airlineId"])
    .index("by_operator", ["operatorId"])
    .index("by_token", ["tokenIdentifier"]),

  // ── the core record: generic arrival/departure event ─────────────────────────
  arrivalEvents: defineTable({
    mode: transportMode,
    direction,
    propertyId: v.id("properties"), // destination property (ground tenant key)
    operatorId: v.optional(v.id("operators")), // denormalized for group reporting
    airlineId: v.optional(v.id("airlines")), // charter, once known
    airstripId: v.optional(v.id("airstrips")),

    origin: v.string(),
    destinationLabel: v.string(), // airstrip name or gate, for display

    // guest party — depth, not just a pax count
    guestName: v.string(), // lead guest / party label
    pax: v.number(), // total
    paxAdults: v.optional(v.number()),
    paxChildren: v.optional(v.number()),
    paxInfants: v.optional(v.number()),
    leadGuestNationality: v.optional(v.string()),
    dietary: v.optional(v.array(v.string())),
    mobilityNeeds: v.optional(v.string()),
    vip: v.optional(v.boolean()),
    special: v.array(v.string()),
    luggage: v.optional(v.string()),

    // time — graduated and timezone-aware
    timezone: v.optional(v.string()), // IANA; defaults to property tz
    scheduledTime: v.number(), // the operative UTC instant (firm if known)
    timeConfidence: v.optional(timeConfidence),
    tentativeWindowStart: v.optional(v.number()),
    tentativeWindowEnd: v.optional(v.number()),
    estimatedTime: v.optional(v.number()), // live ETA
    actualTime: v.optional(v.number()), // when it actually happened

    status: arrivalStatus,
    flightId: v.optional(v.id("flights")),
    modeDetail,

    // dual entry + merge + field ownership
    createdBy: createdByParty,
    claimedByAirline: v.boolean(),
    claimedAt: v.optional(v.number()),

    // confirmation gate
    acknowledgedAt: v.optional(v.number()),
    lastAckUserId: v.optional(v.id("users")),
    reconfirmRequested: v.boolean(),

    escalationDeadline: v.optional(v.number()),
    escalatedAt: v.optional(v.number()),

    cancelledAt: v.optional(v.number()),
    cancelReason: v.optional(v.string()),

    correlationId: v.string(),
    ...source,
    ...audit,
  })
    .index("by_property", ["propertyId"])
    .index("by_operator", ["operatorId"])
    .index("by_airline", ["airlineId"])
    .index("by_flight", ["flightId"])
    .index("by_airstrip", ["airstripId"])
    .index("by_status", ["status"])
    .index("by_property_status", ["propertyId", "status"])
    .index("by_airline_status", ["airlineId", "status"])
    .index("by_property_time", ["propertyId", "scheduledTime"])
    .index("by_status_deadline", ["status", "escalationDeadline"])
    .index("by_correlation", ["correlationId"])
    .index("by_externalRef", ["externalRef"]),

  // Named members of a party (optional depth over the pax count).
  arrivalGuests: defineTable({
    arrivalId: v.id("arrivalEvents"),
    propertyId: v.id("properties"),
    fullName: v.string(),
    type: v.optional(v.union(v.literal("adult"), v.literal("child"), v.literal("infant"))),
    nationality: v.optional(v.string()),
    passportRef: v.optional(v.string()),
    dietary: v.optional(v.array(v.string())),
    notes: v.optional(v.string()),
  })
    .index("by_arrival", ["arrivalId"])
    .index("by_property", ["propertyId"]),

  flights: defineTable({
    airlineId: v.id("airlines"),
    code: v.string(),
    aircraftReg: v.string(),
    pilotName: v.string(),
    departTime: v.number(),
    timezone: v.optional(v.string()),
    base: v.string(),
    status: flightStatus,
    ...audit,
  })
    .index("by_airline", ["airlineId"])
    .index("by_code", ["code"])
    .index("by_airline_status", ["airlineId", "status"]),

  acknowledgments: defineTable({
    arrivalId: v.id("arrivalEvents"),
    propertyId: v.id("properties"),
    byUserId: v.id("users"),
    at: v.number(),
    channel: notifyChannel,
    type: v.union(v.literal("initial"), v.literal("reconfirm")),
  })
    .index("by_arrival", ["arrivalId"])
    .index("by_property", ["propertyId"]),

  // ── lodge operations: staff, vehicles, duties, rooms, leave ───────────────────
  staff: defineTable({
    propertyId: v.id("properties"),
    name: v.string(),
    role: staffRole,
    phoneE164: v.optional(v.string()),
    whatsappOptIn: v.optional(v.boolean()),
    certifications: v.array(v.string()),
    languages: v.array(v.string()),
    allowedDays: v.number(), // annual leave entitlement
    dailyDutyCap: v.optional(v.number()),
    employmentStart: v.optional(v.number()),
    active: v.boolean(),
    ...audit,
  })
    .index("by_property", ["propertyId"])
    .index("by_property_role", ["propertyId", "role"]),

  vehicles: defineTable({
    propertyId: v.id("properties"),
    name: v.string(),
    type: v.optional(vehicleType),
    registration: v.optional(v.string()),
    seats: v.number(),
    active: v.optional(v.boolean()),
    ...audit,
  }).index("by_property", ["propertyId"]),

  dutyAssignments: defineTable({
    arrivalId: v.id("arrivalEvents"),
    propertyId: v.id("properties"),
    staffId: v.id("staff"),
    vehicleId: v.optional(v.id("vehicles")),
    dutyType,
    status: dutyStatus,
    seatsCovered: v.optional(v.number()),
    assignedAt: v.number(),
    notifiedAt: v.optional(v.number()),
    confirmedAt: v.optional(v.number()),
    declinedAt: v.optional(v.number()),
    ...audit,
  })
    .index("by_arrival", ["arrivalId"])
    .index("by_property", ["propertyId"])
    .index("by_staff", ["staffId"]),

  rooms: defineTable({
    propertyId: v.id("properties"),
    name: v.string(),
    type: roomType,
    capacity: v.number(),
    status: v.optional(roomStatus),
    ...audit,
  }).index("by_property", ["propertyId"]),

  roomAssignments: defineTable({
    arrivalId: v.id("arrivalEvents"),
    propertyId: v.id("properties"),
    roomId: v.id("rooms"),
    guest: v.string(),
    checkInDate: v.optional(v.number()),
    checkOutDate: v.optional(v.number()),
    ...audit,
  })
    .index("by_arrival", ["arrivalId"])
    .index("by_room", ["roomId"])
    .index("by_property", ["propertyId"]),

  // Leave register: allowed lives on staff; taken is derived from leaveDays;
  // remaining is always allowed − taken (never stored).
  leaveDays: defineTable({
    propertyId: v.id("properties"),
    staffId: v.id("staff"),
    date: v.number(), // day-start ms (local-day aligned)
    leaveYear: v.optional(v.number()),
    source: v.optional(leaveSource),
    requestId: v.optional(v.id("leaveRequests")),
  })
    .index("by_property", ["propertyId"])
    .index("by_staff", ["staffId"])
    .index("by_staff_date", ["staffId", "date"])
    .index("by_property_date", ["propertyId", "date"]),

  leaveRequests: defineTable({
    propertyId: v.id("properties"),
    staffId: v.id("staff"),
    startDate: v.number(),
    endDate: v.number(),
    days: v.number(),
    status: leaveRequestStatus,
    reason: v.optional(v.string()),
    decidedByUserId: v.optional(v.id("users")),
    decidedAt: v.optional(v.number()),
    ...audit,
  })
    .index("by_property", ["propertyId"])
    .index("by_staff", ["staffId"]),

  coverageRules: defineTable({
    propertyId: v.id("properties"),
    role: staffRole,
    minStaff: v.number(),
    peakMinStaff: v.optional(v.number()),
    resilienceBuffer: v.optional(v.number()),
    seasonStart: v.optional(v.number()), // month/day for seasonal overrides
    seasonEnd: v.optional(v.number()),
    ...audit,
  })
    .index("by_property", ["propertyId"])
    .index("by_property_role", ["propertyId", "role"]),

  // ── fleet (air side) ──────────────────────────────────────────────────────────
  aircraft: defineTable({
    airlineId: v.id("airlines"),
    reg: v.string(),
    type: v.string(),
    seats: v.number(),
    base: v.string(),
    status: aircraftStatus,
    ...audit,
  })
    .index("by_airline", ["airlineId"])
    .index("by_reg", ["reg"]),

  pilots: defineTable({
    airlineId: v.id("airlines"),
    name: v.string(),
    license: v.string(),
    hours: v.number(),
    phoneE164: v.optional(v.string()),
    status: pilotStatus,
    ...audit,
  }).index("by_airline", ["airlineId"]),

  // ── append-only logs / outbox ─────────────────────────────────────────────────
  notifications: defineTable({
    at: v.number(),
    channel: notifyChannel,
    status: outboxStatus,
    toPhone: v.optional(v.string()),
    toUserId: v.optional(v.id("users")),
    arrivalId: v.optional(v.id("arrivalEvents")),
    propertyId: v.optional(v.id("properties")),
    airlineId: v.optional(v.id("airlines")),
    kind: notifyKind,
    body: v.string(),
    deepLink: v.optional(v.string()),
    delivered: v.boolean(),
    attempts: v.number(),
    providerMessageId: v.optional(v.string()),
    lastError: v.optional(v.string()),
    correlationId: v.optional(v.string()),
  })
    .index("by_arrival", ["arrivalId"])
    .index("by_status", ["status"])
    .index("by_at", ["at"]),

  // The audit spine — one row per state change, correlation-linked.
  transferEvents: defineTable({
    correlationId: v.string(),
    arrivalId: v.optional(v.id("arrivalEvents")),
    propertyId: v.id("properties"),
    airlineId: v.optional(v.id("airlines")),
    type: eventType,
    at: v.number(),
    byUserId: v.optional(v.id("users")),
    summary: v.string(),
    meta: v.optional(v.any()),
  })
    .index("by_correlation", ["correlationId"])
    .index("by_arrival", ["arrivalId"])
    .index("by_property", ["propertyId"])
    .index("by_at", ["at"]),
});
