import { defineTable } from "convex/server";
import { v } from "convex/values";

// ═════════════════════════════════════════════════════════════════════════════
// Kusini MASTER schema — FOUNDATION (Groups A-D) — REVIEW ARTIFACT
//
// Authored to KUSINI-SCHEMA.md. Not yet wired as the active schema (that swap +
// function migration is Phase 1 proper). Conventions per the master doc §1:
//  • Portable `id` (ULID) on every row, set by the app, indexed `by_id`. Convex
//    `_id` still exists but is NEVER used as a foreign key.
//  • Every FK is the target's portable `id` → typed v.string() (NOT v.id(...)),
//    so a Convex→AWS move is a data copy, not a rewrite.
//  • createdAt/updatedAt on every row (epoch ms); archivedAt for soft-delete.
//  • Tenancy keys (operatorId / airlineId / propertyId) denormalized per row.
//  • Identity owned by Clerk, mirrored via clerkOrgId / clerkUserId (§16).
// snake_case in the doc maps to camelCase here (Convex idiom).
// ═════════════════════════════════════════════════════════════════════════════

// ── shared field groups ───────────────────────────────────────────────────────
const portable = {
  id: v.string(), // ULID/UUID set by the app — the portable primary key
};
const stamps = {
  createdAt: v.number(),
  updatedAt: v.number(),
  archivedAt: v.optional(v.number()), // soft delete on long-lived entities
};

// ── Twenty-style composite field types (FULL_NAME / EMAILS / PHONES / LINKS /
//    ADDRESS) — reused across all people & place entities, applied faithfully to
//    Twenty's person/company field shapes. ────────────────────────────────────
export const fullName = v.object({
  firstName: v.string(),
  lastName: v.string(),
});
export const emails = v.object({
  primaryEmail: v.string(),
  additionalEmails: v.optional(v.array(v.string())),
});
export const phones = v.object({
  primaryPhoneNumber: v.string(),
  primaryPhoneCallingCode: v.optional(v.string()), // e.g. "+254"
  primaryPhoneCountryCode: v.optional(v.string()), // e.g. "KE"
  additionalPhones: v.optional(v.array(v.string())),
});
export const links = v.object({
  primaryLinkUrl: v.optional(v.string()),
  primaryLinkLabel: v.optional(v.string()),
  secondaryLinks: v.optional(
    v.array(v.object({ url: v.string(), label: v.string() })),
  ),
});
export const address = v.object({
  addressStreet1: v.optional(v.string()),
  addressStreet2: v.optional(v.string()),
  addressCity: v.optional(v.string()),
  addressState: v.optional(v.string()),
  addressCountry: v.optional(v.string()),
  addressPostcode: v.optional(v.string()),
  addressLat: v.optional(v.number()),
  addressLng: v.optional(v.number()),
});

// ── enums (foundation subset of §2) ───────────────────────────────────────────
export const orgKind = v.union(
  v.literal("lodge_operator"),
  v.literal("airline"),
  v.literal("transfer_provider"),
);
export const userRole = v.union(
  v.literal("operator_admin"),
  v.literal("property_manager"),
  v.literal("duty_contact"),
  v.literal("airline_ops"),
  v.literal("staff"),
  v.literal("platform_admin"),
);
export const region = v.union(v.literal("maasai_mara"), v.literal("laikipia"));
export const transportMode = v.union(
  v.literal("charter"),
  v.literal("scheduled_flight"),
  v.literal("helicopter"),
  v.literal("road_transfer"),
  v.literal("self_drive"),
  v.literal("self_fly"),
);
export const eventDirection = v.union(v.literal("arrival"), v.literal("departure"));
export const eventStatus = v.union(
  v.literal("draft"),
  v.literal("posted"),
  v.literal("scheduled"),
  v.literal("acknowledged"),
  v.literal("reconfirm_required"),
  v.literal("in_transit"),
  v.literal("arrived"),
  v.literal("completed"),
  v.literal("escalated"),
  v.literal("cancelled"),
);
export const ackType = v.union(v.literal("initial"), v.literal("reconfirm"));
export const channel = v.union(
  v.literal("sms"),
  v.literal("whatsapp"),
  v.literal("push"),
  v.literal("email"),
);
export const bookingSource = v.union(
  v.literal("manual"),
  v.literal("pms_resrequest"),
  v.literal("pms_karibukit"),
  v.literal("agent"),
);
export const aircraftStatus = v.union(
  v.literal("available"),
  v.literal("in_service"),
  v.literal("maintenance"),
);
export const pilotStatus = v.union(
  v.literal("available"),
  v.literal("flying"),
  v.literal("rest"),
  v.literal("off"),
);
export const flightStatus = v.union(
  v.literal("planned"),
  v.literal("boarding"),
  v.literal("dispatched"),
  v.literal("in_flight"),
  v.literal("completed"),
  v.literal("cancelled"),
);
export const carryoverPolicy = v.union(
  v.literal("hard_reset"),
  v.literal("carry_capped"),
);

// Per-mode operational detail (§6). Kept as one optional object; app validates by mode.
const modeDetails = v.optional(
  v.object({
    flightRef: v.optional(v.string()),
    aircraftRegistration: v.optional(v.string()), // tail, e.g. "5Y-GCC"
    pilotName: v.optional(v.string()),
    pilotContact: v.optional(v.string()),
    flightNumber: v.optional(v.string()),
    airport: v.optional(v.string()),
    connectionNotes: v.optional(v.string()),
    aircraft: v.optional(v.string()),
    landingPoint: v.optional(v.string()),
    groundOperator: v.optional(v.string()),
    vehicle: v.optional(v.string()),
    driverContact: v.optional(v.string()),
    expectedGateTime: v.optional(v.number()),
    guestVehicle: v.optional(v.string()),
    guestPilot: v.optional(v.string()),
    routeNotes: v.optional(v.string()),
    eta: v.optional(v.number()),
  }),
);

// ═════════════════════════════════════════════════════════════════════════════
// Group A — Identity & tenancy
// ═════════════════════════════════════════════════════════════════════════════
export const foundationTables = {
  organizations: defineTable({
    ...portable,
    clerkOrgId: v.optional(v.string()), // mirrors Clerk Organization
    kind: orgKind,
    name: v.string(),
    billingDetails: v.optional(v.any()), // operator only; meter per active property
    region: v.optional(region),
    ...stamps,
  })
    .index("by_portable_id", ["id"])
    .index("by_clerk_org", ["clerkOrgId"])
    .index("by_kind", ["kind"]),

  users: defineTable({
    ...portable,
    clerkUserId: v.string(), // the Clerk user — the join to auth
    organizationId: v.string(), // ref<organizations>
    propertyId: v.optional(v.string()), // ref<properties> when scoped to one camp
    name: fullName, // FULL_NAME (Twenty person shape)
    phones: phones, // PHONES — SMS/WhatsApp target
    emails: v.optional(emails), // EMAILS
    avatarUrl: v.optional(v.string()),
    jobTitle: v.optional(v.string()),
    role: userRole,
    active: v.boolean(),
    ...stamps,
  })
    .index("by_portable_id", ["id"])
    .index("by_clerk_user", ["clerkUserId"])
    .index("by_organization", ["organizationId"])
    .index("by_property", ["propertyId"])
    .index("by_phone", ["phones.primaryPhoneNumber"]),

  // ═══════════════════════════════════════════════════════════════════════════
  // Group B — Lodge hierarchy
  // ═══════════════════════════════════════════════════════════════════════════
  properties: defineTable({
    ...portable,
    operatorId: v.string(), // ref<organizations> kind=lodge_operator
    name: v.string(),
    region,
    dutyContactUserId: v.optional(v.string()),
    backupContactUserId: v.optional(v.string()),
    escalationWindowMinutes: v.number(), // default 120
    defaultReportOffsetMinutes: v.number(), // guest-at-strip lead time, e.g. 30
    carryoverPolicy: carryoverPolicy,
    carryoverCapDays: v.optional(v.number()),
    timezone: v.string(), // default Africa/Nairobi
    location: v.optional(address), // ADDRESS (Twenty company shape)
    ...stamps,
  })
    .index("by_portable_id", ["id"])
    .index("by_operator", ["operatorId"]),

  airstrips: defineTable({
    ...portable,
    name: v.string(),
    code: v.optional(v.string()),
    lat: v.optional(v.number()),
    lng: v.optional(v.number()),
    region,
    ...stamps,
  })
    .index("by_portable_id", ["id"])
    .index("by_region", ["region"]),

  propertyAirstrips: defineTable({
    ...portable,
    propertyId: v.string(),
    airstripId: v.string(),
    isPrimary: v.boolean(),
  })
    .index("by_portable_id", ["id"])
    .index("by_property", ["propertyId"])
    .index("by_airstrip", ["airstripId"])
    .index("by_pair", ["propertyId", "airstripId"]),

  airlinePropertyLinks: defineTable({
    ...portable,
    airlineId: v.string(), // ref<organizations> kind=airline/transfer_provider
    propertyId: v.string(),
    active: v.boolean(),
  })
    .index("by_portable_id", ["id"])
    .index("by_airline", ["airlineId"])
    .index("by_property", ["propertyId"])
    .index("by_pair", ["airlineId", "propertyId"]),

  // ═══════════════════════════════════════════════════════════════════════════
  // Group C — Airline / fleet
  // ═══════════════════════════════════════════════════════════════════════════
  aircraft: defineTable({
    ...portable,
    airlineId: v.string(),
    registration: v.string(), // e.g. "5Y-BMF"
    type: v.string(),
    seats: v.number(),
    baseAirstripId: v.optional(v.string()),
    status: aircraftStatus,
    ...stamps,
  })
    .index("by_portable_id", ["id"])
    .index("by_airline", ["airlineId"])
    .index("by_registration", ["registration"]),

  pilots: defineTable({
    ...portable,
    airlineId: v.string(),
    name: fullName, // FULL_NAME (person shape)
    license: v.string(),
    hours: v.number(),
    phones: phones, // PHONES
    status: pilotStatus,
    ...stamps,
  })
    .index("by_portable_id", ["id"])
    .index("by_airline", ["airlineId"]),

  flights: defineTable({
    ...portable,
    airlineId: v.string(),
    aircraftId: v.string(),
    pilotId: v.optional(v.string()),
    flightRef: v.string(), // e.g. "F-101"
    date: v.string(), // ISO date
    departTime: v.optional(v.number()),
    circuit: v.array(v.string()), // ordered airstrip ids/names
    status: flightStatus,
    ...stamps,
  })
    .index("by_portable_id", ["id"])
    .index("by_airline", ["airlineId"])
    .index("by_date", ["date"])
    .index("by_aircraft", ["aircraftId"]),

  // ═══════════════════════════════════════════════════════════════════════════
  // Group D — Coordination spine
  // ═══════════════════════════════════════════════════════════════════════════
  bookings: defineTable({
    ...portable,
    propertyId: v.string(),
    operatorId: v.string(), // denormalized tenant key
    guestName: v.string(),
    partySize: v.number(),
    externalRef: v.optional(v.string()), // PMS booking id
    source: bookingSource,
    arrivalDate: v.string(),
    departureDate: v.string(),
    specialNeeds: v.optional(v.string()),
    syncedAt: v.optional(v.number()),
    ...stamps,
  })
    .index("by_portable_id", ["id"])
    .index("by_property", ["propertyId"])
    .index("by_arrival_date", ["arrivalDate"])
    .index("by_external_ref", ["externalRef"]),

  arrivalEvents: defineTable({
    ...portable,
    bookingId: v.optional(v.string()),
    direction: eventDirection,
    mode: transportMode,
    destinationPropertyId: v.string(), // the camp; explicit (one strip feeds several)
    originText: v.optional(v.string()),
    originPropertyId: v.optional(v.string()), // when origin is another camp (journey-linking)
    airstripId: v.optional(v.string()),
    // carrier is top-level: often a NON-tenant (Safarilink, Governors Aviation)
    carrierName: v.optional(v.string()),
    carrierAirlineId: v.optional(v.string()), // set only when the carrier is an onboarded org
    carrierOpsContact: v.optional(v.string()), // ops-desk phone, for re-protected liaison
    partySize: v.number(), // parsed from "Surnamex N"
    guestNames: v.optional(v.array(v.string())),
    specialNeeds: v.optional(v.string()),
    scheduledTime: v.optional(v.number()), // ETA/ETD, shown HHhMM
    guestReportOffsetMinutes: v.optional(v.number()), // "30 mins early"; defaults from property
    status: eventStatus,
    flightId: v.optional(v.string()), // nullable until scheduled; charter/self-fly only
    correlationId: v.string(), // threads every transfer_events row
    createdByOrgId: v.string(), // who first posted (lodge or airline) — dual entry
    claimedByAirlineId: v.optional(v.string()),
    operatorId: v.string(), // denormalized tenant key (lodge side)
    airlineId: v.optional(v.string()), // denormalized tenant key (air side)
    lastTimingChangeAt: v.optional(v.number()), // drives reconfirm reset
    reprotectCount: v.number(), // default 0
    lastReprotectedAt: v.optional(v.number()),
    modeDetails,
    ...stamps,
  })
    .index("by_portable_id", ["id"])
    .index("by_property_and_date", ["destinationPropertyId", "scheduledTime"])
    .index("by_flight", ["flightId"])
    .index("by_status", ["status"])
    .index("by_operator", ["operatorId"])
    .index("by_airline", ["airlineId"])
    .index("by_carrier", ["carrierName"])
    .index("by_correlation", ["correlationId"]),

  acknowledgments: defineTable({
    ...portable,
    arrivalEventId: v.string(),
    userId: v.string(), // the named duty contact who acked
    type: ackType,
    channel: channel,
    at: v.number(),
    propertyId: v.string(),
    operatorId: v.string(),
  })
    .index("by_portable_id", ["id"])
    .index("by_event", ["arrivalEventId"])
    .index("by_property", ["propertyId"]),

  transferEvents: defineTable({
    ...portable,
    arrivalEventId: v.string(),
    correlationId: v.string(),
    actorUserId: v.optional(v.string()), // null for system/scheduler
    action: v.string(), // posted | enriched | scheduled | reprotected | acknowledged | ...
    fromStatus: v.optional(eventStatus),
    toStatus: v.optional(eventStatus),
    payload: v.optional(v.any()), // diff / context
    at: v.number(),
    operatorId: v.optional(v.string()),
    airlineId: v.optional(v.string()),
  })
    .index("by_portable_id", ["id"])
    .index("by_event", ["arrivalEventId"])
    .index("by_correlation", ["correlationId"])
    .index("by_at", ["at"]),
};
