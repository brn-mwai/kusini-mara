import { internalMutation } from "./_generated/server";
import type { MutationCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import type { Infer } from "convex/values";
import { chemistryV } from "./schema";
import {
  appendBatteryEvent,
  appendCustodyEvent,
  merkleRoot,
} from "./model/custody";
import { contentHashFor } from "./reports";
import { sha256Hex } from "./lib/sha256";
import { DAY_MS, startOfDay } from "./lib/joins";

type Chemistry = Infer<typeof chemistryV>;

// Deterministic PRNG so the demo data has a stable shape run-to-run.
function mulberry32(a: number) {
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const TABLES = [
  "settings",
  "reports",
  "anchors",
  "labelTokens",
  "labelBatches",
  "interests",
  "permits",
  "batteryEvents",
  "custodyEvents",
  "collections",
  "batteries",
  "containers",
  "points",
  "members",
  "orgs",
] as const;

async function clearAll(ctx: MutationCtx) {
  for (const table of TABLES) {
    const rows = await ctx.db.query(table).collect();
    for (const row of rows) await ctx.db.delete(row._id);
  }
}

export const reset = internalMutation({
  args: {},
  handler: async (ctx) => {
    await clearAll(ctx);
    return "cleared";
  },
});

export const run = internalMutation({
  args: {},
  handler: async (ctx) => {
    await clearAll(ctx);
    const rand = mulberry32(20260811);
    const pick = <T>(xs: readonly T[]): T => xs[Math.floor(rand() * xs.length)]!;
    const between = (lo: number, hi: number) => lo + rand() * (hi - lo);
    const now = Date.now();
    const today = startOfDay(now);

    // ── orgs & members ───────────────────────────────────────────────────────
    const operator = await ctx.db.insert("orgs", {
      name: "Revlog Operations",
      kind: "operator",
      status: "active",
      contactEmail: "ops@revlog.io",
      createdAt: now - 180 * DAY_MS,
    });
    const producers = {
      kinetic: await ctx.db.insert("orgs", {
        name: "Kinetic Mobility",
        kind: "producer",
        status: "active",
        contactEmail: "fleet@kineticmobility.co.ke",
        createdAt: now - 150 * DAY_MS,
      }),
      suncycle: await ctx.db.insert("orgs", {
        name: "SunCycle Energy",
        kind: "producer",
        status: "active",
        contactEmail: "returns@suncycle.africa",
        createdAt: now - 120 * DAY_MS,
      }),
      tembo: await ctx.db.insert("orgs", {
        name: "Tembo Tools",
        kind: "producer",
        status: "active",
        contactEmail: "warranty@tembotools.com",
        createdAt: now - 90 * DAY_MS,
      }),
    };
    const partners = {
      gridreturn: await ctx.db.insert("orgs", {
        name: "GridReturn Storage",
        kind: "partner",
        partnerKind: "second_life",
        status: "active",
        contactEmail: "sourcing@gridreturn.energy",
        createdAt: now - 100 * DAY_MS,
      }),
      mwangaza: await ctx.db.insert("orgs", {
        name: "Mwangaza Microgrids",
        kind: "partner",
        partnerKind: "second_life",
        status: "pending",
        contactEmail: "hello@mwangaza.co.ke",
        createdAt: now - 20 * DAY_MS,
      }),
      ecometals: await ctx.db.insert("orgs", {
        name: "Ecometals Recovery",
        kind: "partner",
        partnerKind: "recycler",
        status: "active",
        contactEmail: "intake@ecometals.africa",
        createdAt: now - 80 * DAY_MS,
      }),
      basel: await ctx.db.insert("orgs", {
        name: "Basel Metals EA",
        kind: "partner",
        partnerKind: "recycler",
        status: "suspended",
        contactEmail: "compliance@baselmetals.com",
        createdAt: now - 60 * DAY_MS,
      }),
    };
    const memberRows: [Id<"orgs">, string, "admin" | "ops" | "driver" | "compliance", string][] = [
      [operator, "Wanjiru Kamau", "admin", "wanjiru@revlog.io"],
      [operator, "Daniel Otieno", "driver", "daniel@revlog.io"],
      [operator, "Amina Hassan", "ops", "amina@revlog.io"],
      [producers.kinetic, "Peter Njoroge", "ops", "peter@kineticmobility.co.ke"],
      [producers.suncycle, "Grace Achieng", "ops", "grace@suncycle.africa"],
      [producers.tembo, "Samuel Mwangi", "ops", "samuel@tembotools.com"],
      [partners.gridreturn, "Lucy Wambui", "ops", "lucy@gridreturn.energy"],
      [partners.mwangaza, "Brian Ochieng", "ops", "brian@mwangaza.co.ke"],
      [partners.ecometals, "Faith Muthoni", "compliance", "faith@ecometals.africa"],
      [partners.basel, "John Kariuki", "ops", "john@baselmetals.com"],
    ];
    for (const [orgId, name, role, email] of memberRows)
      await ctx.db.insert("members", { orgId, name, role, email });

    // ── collection points (Nairobi) ──────────────────────────────────────────
    const accepted = [
      "E-bike and e-scooter packs",
      "Power tool packs",
      "Laptop batteries",
      "Phone batteries",
      "AA/AAA rechargeables",
    ];
    const prohibited = [
      "Swollen, leaking or hot packs",
      "Lead-acid vehicle batteries",
      "Wet or corroded cells",
    ];
    const pointDefs: [string, string, number, number, boolean][] = [
      ["Westgate Mall", "Mwanzi Rd, Westlands", -1.2569, 36.8034, true],
      ["Sarit Centre", "Karuna Rd, Westlands", -1.2609, 36.8022, true],
      ["Two Rivers Mall", "Limuru Rd, Ruaka", -1.2094, 36.7972, true],
      ["Garden City Mall", "Thika Rd, Kasarani", -1.2318, 36.8787, true],
      ["The Hub Karen", "Dagoretti Rd, Karen", -1.3191, 36.7079, true],
      ["Yaya Centre", "Argwings Kodhek Rd, Kilimani", -1.2926, 36.7858, true],
      ["Village Market", "Limuru Rd, Gigiri", -1.2296, 36.8036, true],
      ["Galleria Mall", "Langata Rd, Karen", -1.3399, 36.7659, true],
      ["TRM Thika Road", "Thika Rd, Roysambu", -1.2195, 36.8886, true],
      ["Junction Mall", "Ngong Rd, Dagoretti", -1.2986, 36.7602, true],
      ["Industrial Area Depot", "Enterprise Rd", -1.3081, 36.8510, false],
      ["Athi River Facility", "EPZ Rd, Athi River", -1.4569, 36.9782, false],
    ];
    const pointIds: Id<"points">[] = [];
    for (const [name, address, lat, lng, isPublic] of pointDefs) {
      pointIds.push(
        await ctx.db.insert("points", {
          name,
          address,
          lat,
          lng,
          hours: isPublic ? "Mon–Sat 09:00–19:00" : "Mon–Fri 07:00–17:00",
          acceptedItems: accepted,
          prohibitedItems: prohibited,
          isPublic,
          active: name !== "Galleria Mall",
          operatorOrgId: operator,
        }),
      );
    }

    // ── containers ───────────────────────────────────────────────────────────
    const containerIds: Id<"containers">[] = [];
    let containerSeq = 1;
    const newContainer = async (opts: {
      pointId?: Id<"points">;
      custodianOrgId: Id<"orgs">;
      stage: "deployed" | "in_transit" | "at_facility";
      fillPct: number;
      lat?: number;
      lng?: number;
      labelState?: "none" | "printed" | "bound" | "revoked";
    }) => {
      const tag = `CTR-${String(containerSeq++).padStart(3, "0")}`;
      const capacityKg = pick([90, 120, 120, 160]);
      const id = await ctx.db.insert("containers", {
        tag,
        publicToken: sha256Hex(`ctr|${tag}`).slice(0, 12),
        pointId: opts.pointId,
        custodianOrgId: opts.custodianOrgId,
        stage: opts.stage,
        fillPct: opts.fillPct,
        capacityKg,
        currentMassKg: Math.round(capacityKg * (opts.fillPct / 100)),
        lastTempCheckAt: now - Math.floor(between(0.2, 6) * DAY_MS),
        lastTempC: Math.round(between(19, 27) * 10) / 10,
        labelState: opts.labelState ?? "bound",
        lat: opts.lat,
        lng: opts.lng,
      });
      containerIds.push(id);
      return id;
    };
    // One container on each public point (first ten points).
    for (let i = 0; i < 10; i++) {
      const [, , lat, lng] = pointDefs[i]!;
      await newContainer({
        pointId: pointIds[i],
        custodianOrgId: operator,
        stage: "deployed",
        fillPct: Math.round(between(8, 92)),
        lat: lat + between(-0.001, 0.001),
        lng: lng + between(-0.001, 0.001),
      });
    }
    // Producer-site containers (visible in /oem/service).
    await newContainer({
      custodianOrgId: producers.kinetic,
      stage: "deployed",
      fillPct: 64,
      lat: -1.3005,
      lng: 36.7845,
    });
    await newContainer({
      custodianOrgId: producers.kinetic,
      stage: "deployed",
      fillPct: 22,
      lat: -1.3005,
      lng: 36.7845,
      labelState: "printed",
    });
    await newContainer({
      custodianOrgId: producers.suncycle,
      stage: "deployed",
      fillPct: 47,
      lat: -1.2721,
      lng: 36.8119,
    });
    await newContainer({
      custodianOrgId: producers.tembo,
      stage: "deployed",
      fillPct: 81,
      lat: -1.3102,
      lng: 36.8394,
    });
    // In motion / at the facility.
    await newContainer({
      custodianOrgId: operator,
      stage: "in_transit",
      fillPct: 100,
      lat: -1.3252,
      lng: 36.8973,
    });
    await newContainer({
      pointId: pointIds[11],
      custodianOrgId: operator,
      stage: "at_facility",
      fillPct: 0,
      labelState: "printed",
    });

    // ── batteries with real event chains ─────────────────────────────────────
    type Profile = {
      chemistries: Chemistry[];
      massLo: number;
      massHi: number;
      kwhLo?: number;
      kwhHi?: number;
    };
    const profiles: Record<string, Profile> = {
      ebike: { chemistries: ["LFP", "NMC", "NCA"], massLo: 2.2, massHi: 3.4, kwhLo: 0.4, kwhHi: 0.9 },
      scooter: { chemistries: ["NMC", "LMO"], massLo: 1.1, massHi: 1.7, kwhLo: 0.25, kwhHi: 0.5 },
      solar: { chemistries: ["LFP", "lead_acid"], massLo: 4.5, massHi: 14, kwhLo: 0.6, kwhHi: 1.4 },
      tool: { chemistries: ["NMC", "NiMH"], massLo: 0.4, massHi: 0.9 },
      laptop: { chemistries: ["LCO"], massLo: 0.28, massHi: 0.44 },
    };
    const producerProfiles: [Id<"orgs">, string[]][] = [
      [producers.kinetic, ["ebike", "ebike", "scooter"]],
      [producers.suncycle, ["solar", "solar", "ebike"]],
      [producers.tembo, ["tool", "tool", "laptop"]],
    ];
    // stage plan: [stage, count] — spread across producers round-robin.
    const stagePlan: ["with_producer" | "registered" | "in_transit" | "at_facility" | "graded" | "allocated" | "second_life" | "recycled", number][] = [
      ["registered", 10],
      ["with_producer", 58],
      ["in_transit", 20],
      ["at_facility", 46],
      ["graded", 58],
      ["allocated", 10],
      ["second_life", 6],
      ["recycled", 12],
    ];
    const gradedGrades = ["reusable", "repairable", "recycle"] as const;
    let batterySeq = 1;
    const batteryIds: Id<"batteries">[] = [];
    let producerIdx = 0;

    for (const [stage, count] of stagePlan) {
      for (let i = 0; i < count; i++) {
        const [producerOrgId, kinds] = producerProfiles[producerIdx % 3]!;
        producerIdx++;
        const profile = profiles[pick(kinds)]!;
        const chemistry = pick(profile.chemistries);
        const massKg = Math.round(between(profile.massLo, profile.massHi) * 100) / 100;
        const capacityKwh = profile.kwhLo
          ? Math.round(between(profile.kwhLo, profile.kwhHi!) * 100) / 100
          : undefined;
        const tag = `RVL-${String(batterySeq++).padStart(5, "0")}`;
        const createdAt = now - Math.floor(between(5, 85)) * DAY_MS;

        const beyondProducer =
          stage !== "registered" && stage !== "with_producer";
        const graded =
          stage === "graded" ||
          stage === "allocated" ||
          stage === "second_life" ||
          stage === "recycled";
        const grade = !graded
          ? ("ungraded" as const)
          : stage === "recycled"
            ? ("recycle" as const)
            : stage === "second_life"
              ? ("reusable" as const)
              : pick(gradedGrades);
        const soh = graded
          ? Math.round(
              grade === "reusable"
                ? between(74, 96)
                : grade === "repairable"
                  ? between(55, 74)
                  : between(20, 60),
            )
          : undefined;
        const cycleCount = graded ? Math.round(between(150, 900)) : undefined;

        const batteryId = await ctx.db.insert("batteries", {
          tag,
          publicToken: sha256Hex(`bat|${tag}`).slice(0, 12),
          chemistry,
          massKg,
          capacityKwh,
          stateOfHealthPct: soh,
          cycleCount,
          remainingCycles:
            grade === "reusable" ? Math.round(between(300, 1400)) : undefined,
          grade,
          stage,
          producerOrgId,
          custodianOrgId: beyondProducer ? operator : producerOrgId,
          containerId: beyondProducer ? undefined : pick(containerIds.slice(10, 14)),
          quarantined: false,
          dismantlingNotes:
            grade === "recycle"
              ? pick([
                  "Cell-level disassembly; screws not glued.",
                  "Glued casing — shred line only.",
                  "BMS board recoverable; nickel tabs.",
                ])
              : undefined,
          lastEventAt: createdAt,
          createdAt,
        });
        batteryIds.push(batteryId);

        // Event chain, in narrative order.
        let t = createdAt;
        await appendBatteryEvent(ctx, {
          at: t,
          type: "register",
          batteryId,
          actorOrgId: producerOrgId,
          note: "Registered by producer",
        });
        if (beyondProducer) {
          t += Math.floor(between(0.5, 4) * DAY_MS);
          await appendCustodyEvent(ctx, {
            at: t,
            type: "handover",
            batteryId,
            actorOrgId: producerOrgId,
            fromOrgId: producerOrgId,
            toOrgId: operator,
            note: "Staged for collection",
          });
          t += Math.floor(between(0.2, 2) * DAY_MS);
          await appendCustodyEvent(ctx, {
            at: t,
            type: "pickup",
            batteryId,
            actorOrgId: operator,
            fromOrgId: producerOrgId,
            toOrgId: operator,
            massKg,
          });
          if (stage !== "in_transit") {
            t += Math.floor(between(0.1, 1) * DAY_MS);
            await appendCustodyEvent(ctx, {
              at: t,
              type: "arrival",
              batteryId,
              actorOrgId: operator,
              note: "Received at Athi River facility",
            });
          }
        }
        if (graded) {
          t += Math.floor(between(0.5, 5) * DAY_MS);
          await appendBatteryEvent(ctx, {
            at: t,
            type: "grade",
            batteryId,
            actorOrgId: operator,
            note: `Graded ${grade}${soh !== undefined ? ` — SoH ${soh}%` : ""}`,
          });
        }
        if (stage === "allocated" || stage === "second_life") {
          t += Math.floor(between(0.5, 4) * DAY_MS);
          await appendBatteryEvent(ctx, {
            at: t,
            type: "allocate",
            batteryId,
            actorOrgId: operator,
            note: "Allocated to offtake partner",
          });
        }
        if (stage === "second_life" || stage === "recycled") {
          t += Math.floor(between(1, 6) * DAY_MS);
          await appendCustodyEvent(ctx, {
            at: t,
            type: "deliver",
            batteryId,
            actorOrgId: operator,
            fromOrgId: operator,
            toOrgId:
              stage === "second_life" ? partners.gridreturn : partners.ecometals,
            massKg,
          });
          await appendBatteryEvent(ctx, {
            at: t + Math.floor(0.2 * DAY_MS),
            type: "disposition",
            batteryId,
            actorOrgId: operator,
            note:
              stage === "second_life"
                ? "Commissioned into second-life storage"
                : "Material recovery complete",
          });
        }
        if (stage !== "registered" && stage !== "with_producer") {
          await ctx.db.patch(batteryId, { lastEventAt: t });
        }
      }
    }

    // A handful of quarantined units (triage in the field / at intake).
    const quarantineNotes = ["Swollen", "Leaking", "Thermal damage"];
    for (let i = 0; i < 6; i++) {
      const [producerOrgId] = producerProfiles[i % 3]!;
      const tag = `RVL-${String(batterySeq++).padStart(5, "0")}`;
      const createdAt = now - Math.floor(between(4, 30)) * DAY_MS;
      const reason = quarantineNotes[i % 3]!;
      const massKg = Math.round(between(0.9, 3.1) * 100) / 100;
      const batteryId = await ctx.db.insert("batteries", {
        tag,
        publicToken: sha256Hex(`bat|${tag}`).slice(0, 12),
        chemistry: pick(["NMC", "LCO", "LFP"] as const),
        massKg,
        grade: "hazardous",
        stage: "quarantined",
        producerOrgId,
        custodianOrgId: operator,
        quarantined: true,
        quarantineReason: reason,
        lastEventAt: createdAt,
        createdAt,
      });
      batteryIds.push(batteryId);
      await appendBatteryEvent(ctx, {
        at: createdAt,
        type: "register",
        batteryId,
        actorOrgId: producerOrgId,
        note: "Registered by producer",
      });
      const t = createdAt + Math.floor(between(0.5, 3) * DAY_MS);
      await appendBatteryEvent(ctx, {
        at: t,
        type: "triage",
        batteryId,
        actorOrgId: operator,
        note: reason,
      });
      await ctx.db.patch(batteryId, { lastEventAt: t });
    }

    // ── collections: 30 days of history + today's route ──────────────────────
    const publicContainers = containerIds.slice(0, 10);
    for (let d = 30; d >= 1; d--) {
      const day = today - d * DAY_MS;
      const dow = new Date(day).getUTCDay();
      if (dow === 0) continue; // no Sunday runs
      const stops = 1 + Math.floor(rand() * 3);
      for (let s = 0; s < stops; s++) {
        const ci = Math.floor(rand() * publicContainers.length);
        const containerId = publicContainers[ci]!;
        const pointId = pointIds[ci]!;
        const refused = rand() < 0.04;
        const completedAt = day + Math.floor(between(9, 16) * 60 * 60 * 1000);
        await ctx.db.insert("collections", {
          containerId,
          pointId,
          scheduledFor: day,
          status: refused ? "refused" : "collected",
          expectedFillPct: Math.round(between(40, 95)),
          distanceKm: Math.round(between(3, 24) * 10) / 10,
          collectedMassKg: refused
            ? undefined
            : Math.round(between(16, 68) * 10) / 10,
          unitCount: refused ? undefined : Math.round(between(10, 72)),
          tempOk: !refused,
          note: refused ? "Container above temperature threshold" : undefined,
          completedAt,
        });
      }
    }
    // Today's stops.
    const todayPlan: [number, number, "scheduled" | "en_route"][] = [
      [0, 6.2, "en_route"],
      [3, 9.8, "en_route"],
      [4, 14.1, "scheduled"],
      [6, 11.5, "scheduled"],
      [8, 19.3, "scheduled"],
    ];
    let order = 0;
    for (const [ci, distanceKm, status] of todayPlan) {
      await ctx.db.insert("collections", {
        containerId: publicContainers[ci]!,
        pointId: pointIds[ci]!,
        scheduledFor: today,
        routeOrder: order++,
        status,
        expectedFillPct: Math.round(between(35, 90)),
        distanceKm,
      });
    }

    // ── permits ──────────────────────────────────────────────────────────────
    const permitRows: [
      Id<"orgs">,
      "waste_carrier" | "recycler_licence" | "second_life_cert",
      "pending" | "approved" | "rejected",
      string,
      string | undefined,
    ][] = [
      [partners.gridreturn, "waste_carrier", "approved", "gridreturn-waste-carrier-2026.pdf", "Valid to 2027-03. Checked against NEMA register."],
      [partners.gridreturn, "second_life_cert", "approved", "gridreturn-2nd-life-cert.pdf", undefined],
      [partners.ecometals, "recycler_licence", "approved", "ecometals-recycler-licence.pdf", "Facility audit passed 2026-05."],
      [partners.mwangaza, "waste_carrier", "pending", "mwangaza-waste-carrier-application.pdf", undefined],
      [partners.basel, "recycler_licence", "rejected", "basel-licence-scan.pdf", "Licence expired 2025-12; renewal not evidenced."],
    ];
    for (const [orgId, kind, status, filename, reviewerNote] of permitRows) {
      const submittedAt = now - Math.floor(between(5, 45)) * DAY_MS;
      await ctx.db.insert("permits", {
        orgId,
        kind,
        filename,
        fileSizeBytes: Math.round(between(120, 2400)) * 1024,
        status,
        reviewerNote,
        submittedAt,
        reviewedAt: status === "pending" ? undefined : submittedAt + 2 * DAY_MS,
      });
    }

    // ── interests ────────────────────────────────────────────────────────────
    const reusable = await ctx.db
      .query("batteries")
      .withIndex("by_grade", (q) => q.eq("grade", "reusable"))
      .collect();
    const offtakeable = reusable.filter((b) => b.stage === "graded");
    for (let i = 0; i < Math.min(3, offtakeable.length); i++) {
      await ctx.db.insert("interests", {
        partnerOrgId: partners.gridreturn,
        batteryId: offtakeable[i]!._id,
        status: "open",
        note: i === 0 ? "For 48V rack build — need matched SoH" : undefined,
        createdAt: now - Math.floor(between(1, 6)) * DAY_MS,
      });
    }
    if (offtakeable.length > 3) {
      await ctx.db.insert("interests", {
        partnerOrgId: partners.ecometals,
        batteryId: offtakeable[3]!._id,
        status: "accepted",
        createdAt: now - 12 * DAY_MS,
      });
    }

    // ── label batches ────────────────────────────────────────────────────────
    const batch1 = await ctx.db.insert("labelBatches", {
      code: "LB-001",
      count: 250,
      createdAt: now - 40 * DAY_MS,
      printedAt: now - 38 * DAY_MS,
    });
    for (let i = 0; i < 250; i++) {
      const bound = i < 180;
      const revoked = !bound && i < 186;
      await ctx.db.insert("labelTokens", {
        batchId: batch1,
        token: sha256Hex(`LB-001|${i}`).slice(0, 12),
        state: bound ? "bound" : revoked ? "revoked" : "printed",
        batteryId: bound ? batteryIds[i % batteryIds.length] : undefined,
      });
    }
    const batch2 = await ctx.db.insert("labelBatches", {
      code: "LB-002",
      count: 100,
      createdAt: now - 2 * DAY_MS,
    });
    for (let i = 0; i < 100; i++) {
      await ctx.db.insert("labelTokens", {
        batchId: batch2,
        token: sha256Hex(`LB-002|${i}`).slice(0, 12),
        state: "generated",
      });
    }

    // ── anchors: real Merkle roots over each week's event hashes ─────────────
    const allCustody = await ctx.db.query("custodyEvents").collect();
    const allUnit = await ctx.db.query("batteryEvents").collect();
    const allHashes = [
      ...allCustody.map((e) => ({ at: e.at, hash: e.hash })),
      ...allUnit.map((e) => ({ at: e.at, hash: e.hash })),
    ].sort((a, b) => a.at - b.at);
    for (let w = 4; w >= 1; w--) {
      const periodStart = today - w * 7 * DAY_MS;
      const periodEnd = periodStart + 7 * DAY_MS;
      const inPeriod = allHashes.filter(
        (h) => h.at >= periodStart && h.at < periodEnd,
      );
      if (inPeriod.length === 0) continue;
      const root = merkleRoot(inPeriod.map((h) => h.hash));
      const confirmed = w > 1;
      await ctx.db.insert("anchors", {
        periodStart,
        periodEnd,
        merkleRoot: root,
        eventCount: inPeriod.length,
        provider: "OP Sepolia (testnet)",
        txId: confirmed ? `0x${sha256Hex(`anchor|${periodStart}`)}` : undefined,
        state: confirmed ? "confirmed" : "pending",
        createdAt: periodEnd,
      });
    }

    // ── one issued chain-of-custody report for Kinetic Mobility ──────────────
    const periodStart = today - 30 * DAY_MS;
    const periodEnd = today;
    const { hash, eventCount } = await contentHashFor(
      ctx,
      producers.kinetic,
      periodStart,
      periodEnd,
    );
    if (eventCount > 0) {
      await ctx.db.insert("reports", {
        reportId: `CC-${sha256Hex(`seed|${producers.kinetic}`).slice(0, 8).toUpperCase()}`,
        kind: "chain_of_custody",
        orgId: producers.kinetic,
        contentHash: hash,
        periodStart,
        periodEnd,
        eventCount,
        issuedAt: now - 3 * DAY_MS,
      });
    }

    // ── pilot cost model ─────────────────────────────────────────────────────
    await ctx.db.insert("settings", {
      key: "servicing_cost_per_stop_kes",
      value: 1450,
    });

    return {
      orgs: 8,
      batteries: batteryIds.length,
      containers: containerIds.length,
      points: pointIds.length,
    };
  },
});
