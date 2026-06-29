import { v } from "convex/values";
import { internalMutation } from "./_generated/server";
import { newCorrelationId, recordEvent } from "./lib/events";
import { escalationWindowMs } from "./lib/constants";
import type { Id } from "./_generated/dataModel";

const DAY = 86400000;
const TZ = "Africa/Nairobi";

const TABLES = [
  "transferEvents",
  "notifications",
  "acknowledgments",
  "roomAssignments",
  "dutyAssignments",
  "leaveDays",
  "leaveRequests",
  "coverageRules",
  "rooms",
  "vehicles",
  "arrivalGuests",
  "arrivalEvents",
  "flights",
  "staff",
  "pilots",
  "aircraft",
  "propertyAirstrips",
  "airstrips",
  "airlinePropertyLinks",
  "subscriptions",
  "users",
  "properties",
  "airlines",
  "operators",
] as const;

async function clearAll(ctx: any): Promise<void> {
  for (const t of TABLES) {
    const rows = await ctx.db.query(t).collect();
    for (const r of rows) await ctx.db.delete(r._id);
  }
}

export const reset = internalMutation({
  args: {},
  returns: v.object({ cleared: v.boolean() }),
  handler: async (ctx) => {
    await clearAll(ctx);
    return { cleared: true };
  },
});

// v2 seed: operator → properties → shared airstrip, one airline, and arrivals
// across every transport mode. Crafted to show the demo shapes —
//   • Chen: a charter arrival still "awaiting flight"
//   • F-101: one flight, mixed arr+dep, across TWO properties on a SHARED strip
//   • Hargreaves: scheduled+unacknowledged, escalates ~90s after seeding
//   • road / scheduled / self-drive / helicopter arrivals on the property board
export const run = internalMutation({
  args: {},
  returns: v.object({ properties: v.number(), arrivals: v.number(), flights: v.number() }),
  handler: async (ctx) => {
    await clearAll(ctx);
    const now = Date.now();
    const midnight = new Date(now);
    midnight.setHours(0, 0, 0, 0);
    const at = (h: number, m: number) => midnight.getTime() + (h * 60 + m) * 60_000;
    const win = escalationWindowMs();

    // ── operator + subscription ───────────────────────────────────────────────
    const operator = await ctx.db.insert("operators", {
      name: "Mara Collection",
      legalName: "Mara Collection Ltd",
      shortCode: "MC",
      countryCode: "KE",
      billingEmail: "billing@maracollection.example",
      timezone: TZ,
    });
    await ctx.db.insert("subscriptions", {
      operatorId: operator,
      status: "trial",
      planCode: "pilot",
      currency: "USD",
      activeProperties: 3,
    });

    // ── properties (Riverbend is the demo property — first inserted) ──────────
    const riverbend = await ctx.db.insert("properties", {
      operatorId: operator, name: "Riverbend", region: "Maasai Mara", shortCode: "RB",
      timezone: TZ, countryCode: "KE", latitude: -1.41, longitude: 35.0,
      carryOverPolicy: "carry_capped", carryOverCapDays: 5, leaveYearStartMonth: 1,
      opsPhone: "+254700000010",
    });
    const acacia = await ctx.db.insert("properties", {
      operatorId: operator, name: "Acacia", region: "Maasai Mara", shortCode: "AC",
      timezone: TZ, countryCode: "KE", opsPhone: "+254700000011",
    });
    const topi = await ctx.db.insert("properties", {
      operatorId: operator, name: "Topi Plains", region: "Laikipia", shortCode: "TP",
      timezone: TZ, countryCode: "KE",
    });

    // ── airline ────────────────────────────────────────────────────────────────
    const mara = await ctx.db.insert("airlines", {
      name: "Mara Wings", shortCode: "MW", base: "Wilson", timezone: TZ,
      opsPhone: process.env.ESCALATION_AIRLINE_OPS_PHONE ?? "+254700000001",
      opsEmail: "ops@marawings.example",
    });

    // ── users ────────────────────────────────────────────────────────────────
    const opsUser = await ctx.db.insert("users", {
      scope: "airline", airlineId: mara, tokenIdentifier: "seed|mara-ops",
      name: "James Mutua", role: "airline_ops", phoneE164: "+254700000001",
      email: "ops@marawings.example", whatsappOptIn: true,
    });
    const rbDuty = await ctx.db.insert("users", {
      scope: "property", propertyId: riverbend, tokenIdentifier: "seed|rb-duty",
      name: "Joseph Kipng'eno", role: "duty_contact", phoneE164: "+254720551902",
      email: "duty@riverbend.example", whatsappOptIn: true,
    });
    const rbBackup = await ctx.db.insert("users", {
      scope: "property", propertyId: riverbend, tokenIdentifier: "seed|rb-backup",
      name: "Mary Wanjiru", role: "backup_contact", phoneE164: "+254701233880",
      email: "backup@riverbend.example",
    });
    const acDuty = await ctx.db.insert("users", {
      scope: "property", propertyId: acacia, tokenIdentifier: "seed|ac-duty",
      name: "Naserian Ole", role: "duty_contact", phoneE164: "+254745119027",
    });
    await ctx.db.patch(riverbend, { dutyContactId: rbDuty, backupContactId: rbBackup });
    await ctx.db.patch(acacia, { dutyContactId: acDuty, backupContactId: acDuty });

    // ── airstrips + property links (Ol Kiombo SHARED by Riverbend + Acacia) ──
    const strips: Record<string, Id<"airstrips">> = {};
    for (const [name, region] of [
      ["Ol Kiombo", "Central Mara"], ["Keekorok", "Southern Mara"],
      ["Musiara", "Northern Mara"], ["Wilson", "Nairobi"], ["Mara North", "Northern Mara"],
    ] as const) {
      strips[name] = await ctx.db.insert("airstrips", { name, region, timezone: TZ });
    }
    const linkStrip = async (p: Id<"properties">, s: string, primary: boolean, drive: number) =>
      ctx.db.insert("propertyAirstrips", { propertyId: p, airstripId: strips[s]!, isPrimary: primary, driveMinutes: drive });
    await linkStrip(riverbend, "Ol Kiombo", true, 25);
    await linkStrip(acacia, "Ol Kiombo", true, 40); // shared strip
    await linkStrip(riverbend, "Keekorok", false, 50);
    await linkStrip(topi, "Musiara", true, 30);
    for (const p of [riverbend, acacia, topi]) {
      await ctx.db.insert("airlinePropertyLinks", { airlineId: mara, propertyId: p });
    }

    // ── fleet ──────────────────────────────────────────────────────────────────
    const fleet: Array<[string, string, number, "in_service" | "available" | "maintenance"]> = [
      ["5Y-BMF", "Cessna 208 Caravan", 12, "in_service"],
      ["5Y-CAC", "Cessna 208", 12, "in_service"],
      ["5H-TGT", "Pilatus PC-12", 9, "in_service"],
      ["5Y-KQA", "Cessna 208B", 13, "available"],
      ["5Y-AKA", "Cessna 206", 6, "maintenance"],
    ];
    for (const [reg, type, seats, status] of fleet) {
      await ctx.db.insert("aircraft", { airlineId: mara, reg, type, seats, base: "Wilson", status });
    }
    const crew: Array<[string, string, number, "flying" | "available" | "rest"]> = [
      ["A. Mwangi", "CPL", 3200, "flying"], ["L. Korir", "ATPL", 5400, "available"],
      ["S. Otieno", "CPL", 2100, "flying"], ["J. Mutua", "ATPL", 6100, "available"],
      ["P. Njoroge", "CPL", 1800, "rest"],
    ];
    for (const [name, license, hours, status] of crew) {
      await ctx.db.insert("pilots", { airlineId: mara, name, license, hours, status });
    }

    // ── Riverbend staff, vehicles, rooms, coverage, leave ─────────────────────
    const team: Array<["driver" | "guide" | "front_desk" | "housekeeping" | "porter", string, string, string[]]> = [
      ["driver", "Daniel Saitoti", "+254712004118", ["EN", "SW", "Maa"]],
      ["guide", "Joseph Kipng'eno", "+254720551902", ["EN", "SW", "Maa"]],
      ["guide", "Peter Lemayian", "+254733870145", ["EN", "SW", "Maa"]],
      ["front_desk", "Mary Wanjiru", "+254701233880", ["EN", "SW"]],
      ["housekeeping", "Grace Naserian", "+254745119027", ["SW", "Maa"]],
      ["porter", "Samuel Otieno", "+254718660431", ["EN", "SW"]],
    ];
    const staffIds: Id<"staff">[] = [];
    for (const [role, name, phone, languages] of team) {
      staffIds.push(await ctx.db.insert("staff", {
        propertyId: riverbend, name, role, phoneE164: phone, certifications: [],
        languages, allowedDays: 21, dailyDutyCap: 2, active: true,
      }));
    }
    const vehicles: Array<["land_cruiser" | "safari_van", string, number]> = [
      ["land_cruiser", "Land Cruiser 1", 7], ["land_cruiser", "Land Cruiser 2", 7], ["safari_van", "Safari Van", 9],
    ];
    for (const [type, name, seats] of vehicles) {
      await ctx.db.insert("vehicles", { propertyId: riverbend, name, type, seats, active: true });
    }
    const rooms: Array<["tented_suite" | "family_unit" | "honeymoon" | "standard", string, number]> = [
      ["tented_suite", "Riverine 1", 2], ["tented_suite", "Riverine 2", 2],
      ["family_unit", "Acacia Family", 4], ["honeymoon", "Honeymoon Deck", 2],
      ["standard", "Plains 1", 2], ["standard", "Plains 2", 2],
    ];
    for (const [type, name, capacity] of rooms) {
      await ctx.db.insert("rooms", { propertyId: riverbend, name, type, capacity, status: "available" });
    }
    for (const [role, min] of [["guide", 2], ["driver", 1], ["front_desk", 1]] as const) {
      await ctx.db.insert("coverageRules", { propertyId: riverbend, role, minStaff: min, resilienceBuffer: 1 });
    }
    const dayStart = midnight.getTime();
    const addLeave = async (idx: number, offsets: number[]) => {
      for (const o of offsets) {
        await ctx.db.insert("leaveDays", {
          propertyId: riverbend, staffId: staffIds[idx]!, date: dayStart + o * DAY,
          leaveYear: new Date(dayStart + o * DAY).getFullYear(), source: "manual",
        });
      }
    };
    await addLeave(4, [2, 3, 4, 5, 6]);
    await addLeave(2, [8, 9, 10]);
    await addLeave(0, [14, 15]);

    // ── flights ────────────────────────────────────────────────────────────────
    const F = async (code: string, reg: string, pilot: string, h: number, m: number, status: "planned" | "in_flight") =>
      ctx.db.insert("flights", { airlineId: mara, code, aircraftReg: reg, pilotName: pilot, departTime: at(h, m), timezone: TZ, base: "Wilson", status });
    const f101 = await F("F-101", "5Y-BMF", "A. Mwangi", 8, 40, "planned");
    const f102 = await F("F-102", "5Y-CAC", "L. Korir", 10, 30, "planned");
    const f103 = await F("F-103", "5H-TGT", "S. Otieno", 9, 0, "in_flight");
    const f104 = await F("F-104", "5Y-KQA", "J. Mutua", 11, 30, "planned");

    // ── arrival events (all modes) ─────────────────────────────────────────────
    let arrivals = 0;
    type Av = {
      mode: "charter" | "scheduled" | "helicopter" | "road" | "self_drive" | "self_fly";
      property: Id<"properties">; dir: "arrival" | "departure"; guest: string; pax: number;
      origin: string; dest: string; strip?: string; time: number; flight?: Id<"flights"> | null;
      status: "requested" | "scheduled" | "acknowledged"; acked?: boolean; escalateSoon?: boolean;
      airline?: boolean; modeDetail?: any; createdBy?: "property" | "airline";
    };
    const mk = async (a: Av) => {
      const correlationId = newCorrelationId();
      const deadline = a.escalateSoon ? now + 90_000 : (a.status === "scheduled" ? a.time - win : undefined);
      const id = await ctx.db.insert("arrivalEvents", {
        mode: a.mode, direction: a.dir, propertyId: a.property, operatorId: operator,
        airlineId: a.airline ? mara : undefined, airstripId: a.strip ? strips[a.strip] : undefined,
        origin: a.origin, destinationLabel: a.dest, guestName: a.guest, pax: a.pax, special: [],
        timezone: TZ, scheduledTime: a.time, timeConfidence: "scheduled",
        status: a.status, flightId: a.flight ?? undefined, modeDetail: a.modeDetail,
        createdBy: a.createdBy ?? "property", claimedByAirline: a.airline === true && a.createdBy === "airline",
        reconfirmRequested: false, escalationDeadline: deadline,
        acknowledgedAt: a.acked ? now - 3 * 3600_000 : undefined,
        correlationId,
      });
      arrivals++;
      await recordEvent(ctx, {
        correlationId, propertyId: a.property, airlineId: a.airline ? mara : undefined,
        type: "arrival_created", summary: `${a.mode} ${a.dir} for ${a.guest}`, arrivalId: id,
      });
      if (a.acked) {
        await ctx.db.insert("acknowledgments", {
          arrivalId: id, propertyId: a.property,
          byUserId: a.property === riverbend ? rbDuty : acDuty,
          at: now - 3 * 3600_000, channel: "mock", type: "initial",
        });
      }
      return id;
    };

    // F-101 — mixed arr+dep across Riverbend + Acacia, shared Ol Kiombo strip.
    await mk({ mode: "charter", property: riverbend, dir: "arrival", guest: "Hargreaves", pax: 4, origin: "Wilson", dest: "Ol Kiombo", strip: "Ol Kiombo", time: at(13, 15), flight: f101, status: "scheduled", airline: true, escalateSoon: true });
    await mk({ mode: "charter", property: riverbend, dir: "departure", guest: "Vanterpool", pax: 2, origin: "Ol Kiombo", dest: "Wilson", strip: "Ol Kiombo", time: at(8, 0), flight: f101, status: "acknowledged", airline: true, acked: true });
    await mk({ mode: "charter", property: acacia, dir: "arrival", guest: "Brandt", pax: 3, origin: "Wilson", dest: "Ol Kiombo", strip: "Ol Kiombo", time: at(13, 20), flight: f101, status: "scheduled", airline: true });

    // Other charters.
    await mk({ mode: "charter", property: riverbend, dir: "arrival", guest: "Lindqvist", pax: 2, origin: "Wilson", dest: "Keekorok", strip: "Keekorok", time: at(13, 40), flight: f102, status: "scheduled", airline: true });
    await mk({ mode: "charter", property: riverbend, dir: "arrival", guest: "Okoth", pax: 3, origin: "Wilson", dest: "Musiara", strip: "Musiara", time: at(10, 5), flight: f103, status: "acknowledged", airline: true, acked: true });
    await mk({ mode: "charter", property: riverbend, dir: "departure", guest: "Adeyemi", pax: 6, origin: "Wilson", dest: "Wilson", strip: "Wilson", time: at(12, 15), flight: f104, status: "acknowledged", airline: true, acked: true });

    // Awaiting flight (the demo schedules these on Air → Requests).
    await mk({ mode: "charter", property: riverbend, dir: "arrival", guest: "Chen", pax: 2, origin: "Wilson", dest: "Ol Kiombo", strip: "Ol Kiombo", time: at(16, 30), flight: null, status: "requested", airline: true });
    await mk({ mode: "charter", property: acacia, dir: "arrival", guest: "Sato", pax: 2, origin: "Wilson", dest: "Keekorok", strip: "Keekorok", time: at(15, 0), flight: null, status: "requested", airline: true });

    // Multi-mode arrivals (non-charter) on the Riverbend / Topi boards.
    await mk({ mode: "road", property: riverbend, dir: "arrival", guest: "Okafor", pax: 4, origin: "Nairobi", dest: "Main gate", time: at(17, 0), status: "scheduled", modeDetail: { operator: "Mara Roadways", vehicle: "Land Cruiser KDA 221X", driverName: "Kibet", driverContact: "+254799112233", gateTime: at(17, 0) } });
    await mk({ mode: "scheduled", property: riverbend, dir: "arrival", guest: "Müller", pax: 2, origin: "Wilson (Nairobi)", dest: "Keekorok", strip: "Keekorok", time: at(14, 50), status: "scheduled", modeDetail: { carrier: "Safarilink", flightNumber: "JS-120", connectionNotes: "Connects ex-KQA from Amsterdam" } });
    await mk({ mode: "self_drive", property: riverbend, dir: "arrival", guest: "Bennett", pax: 2, origin: "Nakuru", dest: "Main gate", time: at(15, 30), status: "scheduled", modeDetail: { guestVehicle: "Toyota Prado KCX 884Y", routeNotes: "Via Sekenani gate" } });
    await mk({ mode: "helicopter", property: topi, dir: "arrival", guest: "Petrova", pax: 2, origin: "Loisaba", dest: "Helipad", time: at(12, 30), status: "scheduled", modeDetail: { operator: "Tropic Air", landingPoint: "North helipad", pilotContact: "+254700556677" } });

    return { properties: 3, arrivals, flights: 4 };
  },
});
