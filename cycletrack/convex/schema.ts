import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// ─────────────────────────────────────────────────────────────────────────────
// CycleTrack — battery traceability. One backend, five surfaces.
// custodyEvents and batteryEvents are append-only hash chains; they are ONLY
// written through convex/model/custody.ts.
// ─────────────────────────────────────────────────────────────────────────────

export const chemistryV = v.union(
  v.literal("LFP"),
  v.literal("NMC"),
  v.literal("NCA"),
  v.literal("LCO"),
  v.literal("LMO"),
  v.literal("NiMH"),
  v.literal("lead_acid"),
);

export const gradeV = v.union(
  v.literal("reusable"),
  v.literal("repairable"),
  v.literal("recycle"),
  v.literal("hazardous"),
  v.literal("ungraded"),
);

export const stageV = v.union(
  v.literal("registered"),
  v.literal("with_producer"),
  v.literal("in_transit"),
  v.literal("at_facility"),
  v.literal("graded"),
  v.literal("allocated"),
  v.literal("second_life"),
  v.literal("recycled"),
  v.literal("quarantined"),
);

export const custodyEventTypeV = v.union(
  v.literal("handover"),
  v.literal("pickup"),
  v.literal("arrival"),
  v.literal("weigh"),
  v.literal("temp_check"),
  v.literal("deliver"),
);

export const batteryEventTypeV = v.union(
  v.literal("register"),
  v.literal("grade"),
  v.literal("quarantine"),
  v.literal("release"),
  v.literal("allocate"),
  v.literal("disposition"),
  v.literal("triage"),
);

export default defineSchema({
  orgs: defineTable({
    name: v.string(),
    kind: v.union(
      v.literal("producer"),
      v.literal("partner"),
      v.literal("operator"),
    ),
    partnerKind: v.optional(
      v.union(v.literal("second_life"), v.literal("recycler")),
    ),
    status: v.union(
      v.literal("active"),
      v.literal("pending"),
      v.literal("suspended"),
    ),
    contactEmail: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_kind", ["kind"]),

  members: defineTable({
    orgId: v.id("orgs"),
    // Clerk `tokenIdentifier`. Absent for pure seed members (demo mode).
    tokenIdentifier: v.optional(v.string()),
    name: v.string(),
    role: v.union(
      v.literal("admin"),
      v.literal("ops"),
      v.literal("driver"),
      v.literal("compliance"),
    ),
    email: v.optional(v.string()),
  })
    .index("by_token", ["tokenIdentifier"])
    .index("by_org", ["orgId"]),

  points: defineTable({
    name: v.string(),
    address: v.string(),
    lat: v.number(),
    lng: v.number(),
    hours: v.string(),
    acceptedItems: v.array(v.string()),
    prohibitedItems: v.array(v.string()),
    photoUrl: v.optional(v.string()),
    isPublic: v.boolean(),
    active: v.boolean(),
    operatorOrgId: v.optional(v.id("orgs")),
  }).index("by_active", ["active"]),

  containers: defineTable({
    tag: v.string(),
    publicToken: v.string(),
    pointId: v.optional(v.id("points")),
    custodianOrgId: v.id("orgs"),
    stage: v.union(
      v.literal("deployed"),
      v.literal("in_transit"),
      v.literal("at_facility"),
    ),
    fillPct: v.number(),
    capacityKg: v.number(),
    currentMassKg: v.number(),
    lastTempCheckAt: v.optional(v.number()),
    lastTempC: v.optional(v.number()),
    labelState: v.union(
      v.literal("none"),
      v.literal("printed"),
      v.literal("bound"),
      v.literal("revoked"),
    ),
    lat: v.optional(v.number()),
    lng: v.optional(v.number()),
  })
    .index("by_tag", ["tag"])
    .index("by_token", ["publicToken"])
    .index("by_custodian", ["custodianOrgId"])
    .index("by_point", ["pointId"]),

  batteries: defineTable({
    tag: v.string(),
    publicToken: v.string(),
    chemistry: chemistryV,
    massKg: v.number(),
    capacityKwh: v.optional(v.number()),
    stateOfHealthPct: v.optional(v.number()),
    cycleCount: v.optional(v.number()),
    remainingCycles: v.optional(v.number()),
    grade: gradeV,
    stage: stageV,
    producerOrgId: v.id("orgs"),
    custodianOrgId: v.optional(v.id("orgs")),
    containerId: v.optional(v.id("containers")),
    quarantined: v.boolean(),
    quarantineReason: v.optional(v.string()),
    dismantlingNotes: v.optional(v.string()),
    lastEventAt: v.number(),
    createdAt: v.number(),
  })
    .index("by_tag", ["tag"])
    .index("by_token", ["publicToken"])
    .index("by_producer", ["producerOrgId"])
    .index("by_stage", ["stage"])
    .index("by_grade", ["grade"]),

  collections: defineTable({
    containerId: v.id("containers"),
    pointId: v.id("points"),
    assignedMemberId: v.optional(v.id("members")),
    scheduledFor: v.number(),
    routeOrder: v.optional(v.number()),
    status: v.union(
      v.literal("scheduled"),
      v.literal("en_route"),
      v.literal("arrived"),
      v.literal("collected"),
      v.literal("refused"),
      v.literal("cancelled"),
    ),
    expectedFillPct: v.number(),
    distanceKm: v.optional(v.number()),
    collectedMassKg: v.optional(v.number()),
    unitCount: v.optional(v.number()),
    tempOk: v.optional(v.boolean()),
    signatureHash: v.optional(v.string()),
    note: v.optional(v.string()),
    completedAt: v.optional(v.number()),
  })
    .index("by_status", ["status"])
    .index("by_scheduledFor", ["scheduledFor"])
    .index("by_container", ["containerId"]),

  // Append-only. Written ONLY via convex/model/custody.ts.
  custodyEvents: defineTable({
    seq: v.number(),
    at: v.number(),
    type: custodyEventTypeV,
    batteryId: v.optional(v.id("batteries")),
    containerId: v.optional(v.id("containers")),
    actorOrgId: v.optional(v.id("orgs")),
    fromOrgId: v.optional(v.id("orgs")),
    toOrgId: v.optional(v.id("orgs")),
    massKg: v.optional(v.number()),
    note: v.optional(v.string()),
    prevHash: v.string(),
    hash: v.string(),
  })
    .index("by_seq", ["seq"])
    .index("by_battery", ["batteryId"])
    .index("by_container", ["containerId"]),

  // Append-only. Written ONLY via convex/model/custody.ts.
  batteryEvents: defineTable({
    seq: v.number(),
    at: v.number(),
    type: batteryEventTypeV,
    batteryId: v.id("batteries"),
    actorOrgId: v.optional(v.id("orgs")),
    note: v.optional(v.string()),
    prevHash: v.string(),
    hash: v.string(),
  })
    .index("by_seq", ["seq"])
    .index("by_battery", ["batteryId"]),

  permits: defineTable({
    orgId: v.id("orgs"),
    kind: v.union(
      v.literal("waste_carrier"),
      v.literal("recycler_licence"),
      v.literal("second_life_cert"),
    ),
    filename: v.string(),
    fileSizeBytes: v.optional(v.number()),
    status: v.union(
      v.literal("pending"),
      v.literal("approved"),
      v.literal("rejected"),
    ),
    reviewerNote: v.optional(v.string()),
    submittedAt: v.number(),
    reviewedAt: v.optional(v.number()),
  })
    .index("by_org", ["orgId"])
    .index("by_status", ["status"]),

  interests: defineTable({
    partnerOrgId: v.id("orgs"),
    batteryId: v.id("batteries"),
    status: v.union(
      v.literal("open"),
      v.literal("accepted"),
      v.literal("declined"),
      v.literal("withdrawn"),
    ),
    note: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_partner", ["partnerOrgId"])
    .index("by_battery", ["batteryId"])
    .index("by_status", ["status"]),

  labelBatches: defineTable({
    code: v.string(),
    count: v.number(),
    createdAt: v.number(),
    printedAt: v.optional(v.number()),
  }).index("by_code", ["code"]),

  labelTokens: defineTable({
    batchId: v.id("labelBatches"),
    token: v.string(),
    state: v.union(
      v.literal("generated"),
      v.literal("printed"),
      v.literal("bound"),
      v.literal("revoked"),
    ),
    batteryId: v.optional(v.id("batteries")),
  })
    .index("by_batch", ["batchId"])
    .index("by_token", ["token"]),

  anchors: defineTable({
    periodStart: v.number(),
    periodEnd: v.number(),
    merkleRoot: v.string(),
    eventCount: v.number(),
    provider: v.string(),
    txId: v.optional(v.string()),
    state: v.union(
      v.literal("pending"),
      v.literal("submitted"),
      v.literal("confirmed"),
    ),
    createdAt: v.number(),
  }).index("by_periodStart", ["periodStart"]),

  reports: defineTable({
    reportId: v.string(),
    kind: v.literal("chain_of_custody"),
    orgId: v.id("orgs"),
    contentHash: v.string(),
    periodStart: v.number(),
    periodEnd: v.number(),
    eventCount: v.number(),
    issuedAt: v.number(),
  })
    .index("by_reportId", ["reportId"])
    .index("by_org", ["orgId"]),

  // Operational settings seeded once (pilot cost model etc.). Read-only in UI.
  settings: defineTable({
    key: v.string(),
    value: v.number(),
  }).index("by_key", ["key"]),
});
