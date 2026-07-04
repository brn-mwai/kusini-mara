import { v } from "convex/values";
import { internalMutation } from "./_generated/server";
import { newCorrelationId, recordEvent } from "./lib/events";
import { escalationWindowMs } from "./lib/constants";
import type { Id } from "./_generated/dataModel";

const DAY = 86400000;
const HOUR = 3600000;
const TZ = "Africa/Nairobi";

const TABLES = [
  "transferEvents", "notifications", "acknowledgments", "roomAssignments",
  "dutyAssignments", "leaveDays", "leaveRequests", "coverageRules", "rooms",
  "vehicles", "arrivalGuests", "arrivalEvents", "flights", "staff", "pilots",
  "aircraft", "propertyAirstrips", "airstrips", "airlinePropertyLinks",
  "subscriptions", "users", "properties", "airlines", "operators",
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

// ─────────────────────────────────────────────────────────────────────────────
// Rich, realistic seed. Three lodge groups across the Mara + Laikipia; Riverbend
// (the demo property) is deep — full team, vehicles, rooms, coverage, leave —
// with arrivals spanning −3…+7 days across every transport mode, named guest
// parties, duties, room placements, acknowledgments and notification history.
// Demo-critical shapes are preserved: Chen (awaiting flight), F-101 (mixed
// arr+dep across two properties on a shared strip), Hargreaves (escalates ~90s).
// ─────────────────────────────────────────────────────────────────────────────
export const run = internalMutation({
  args: {},
  returns: v.object({
    operators: v.number(), properties: v.number(), staff: v.number(),
    arrivals: v.number(), flights: v.number(), guests: v.number(),
  }),
  handler: async (ctx) => {
    await clearAll(ctx);
    const now = Date.now();
    const midnight = new Date(now); midnight.setHours(0, 0, 0, 0);
    const base = midnight.getTime();
    const win = escalationWindowMs();
    const dayAt = (off: number, h: number, m: number) => base + off * DAY + (h * 60 + m) * 60000;

    let nStaff = 0, nArrivals = 0, nGuests = 0;

    // ── operators + subscriptions ─────────────────────────────────────────────
    const mkOperator = async (name: string, code: string) => {
      const id = await ctx.db.insert("operators", {
        name, legalName: `${name} Ltd`, shortCode: code, countryCode: "KE",
        billingEmail: `billing@${code.toLowerCase()}.example`, timezone: TZ,
      });
      await ctx.db.insert("subscriptions", {
        operatorId: id, status: "trial", planCode: "pilot", currency: "USD", activeProperties: 0,
      });
      return id;
    };
    const maraCollection = await mkOperator("Mara Collection", "MC");
    const laragai = await mkOperator("Laragai Collection", "LG");
    const sandRiver = await mkOperator("Sand River Group", "SR");

    // ── airstrips (Mara + Laikipia + Nairobi hub) ─────────────────────────────
    const stripData: Array<[string, string, string, number, number]> = [
      ["Ol Kiombo", "OLK", "Central Mara", -1.41, 35.18],
      ["Keekorok", "KEU", "Southern Mara", -1.58, 35.25],
      ["Musiara", "MRE", "Northern Mara", -1.27, 35.06],
      ["Mara North", "HKR", "Northern Mara", -1.21, 35.13],
      ["Angama", "ANG", "Western Mara", -1.27, 34.95],
      ["Kichwa Tembo", "KTL", "Western Mara", -1.26, 35.0],
      ["Wilson", "WIL", "Nairobi", -1.32, 36.81],
      ["Loisaba", "LBN", "Laikipia", 0.62, 36.83],
      ["Lewa", "LWA", "Laikipia", 0.2, 37.42],
      ["Nanyuki", "NYK", "Laikipia", -0.06, 37.04],
    ];
    const strips: Record<string, Id<"airstrips">> = {};
    for (const [name, code, region, lat, lng] of stripData) {
      strips[name] = await ctx.db.insert("airstrips", {
        name, code, region, timezone: TZ, latitude: lat, longitude: lng, surface: "murram",
      });
    }

    // ── airline (demo tenant) + fleet + crew ──────────────────────────────────
    const mara = await ctx.db.insert("airlines", {
      name: "Mara Wings", shortCode: "MW", base: "Wilson", timezone: TZ,
      opsPhone: process.env.ESCALATION_AIRLINE_OPS_PHONE ?? "+254700000001",
      opsEmail: "ops@marawings.example",
    });
    const opsUser = await ctx.db.insert("users", {
      scope: "airline", airlineId: mara, tokenIdentifier: "seed|mw-ops",
      name: "James Mutua", role: "airline_ops", phoneE164: "+254700000001",
      email: "ops@marawings.example", whatsappOptIn: true,
    });
    const fleet: Array<[string, string, number, "in_service" | "available" | "maintenance"]> = [
      ["5Y-BMF", "Cessna 208 Caravan", 12, "in_service"],
      ["5Y-CAC", "Cessna 208 Caravan", 12, "in_service"],
      ["5H-TGT", "Pilatus PC-12", 9, "in_service"],
      ["5Y-KQA", "Cessna 208B", 13, "available"],
      ["5Y-AKA", "Cessna 206", 6, "maintenance"],
      ["5Y-NMJ", "Cessna 208B", 13, "in_service"],
    ];
    for (const [reg, type, seats, status] of fleet) {
      await ctx.db.insert("aircraft", { airlineId: mara, reg, type, seats, base: "Wilson", status });
    }
    const crew: Array<[string, string, number, "flying" | "available" | "rest"]> = [
      ["A. Mwangi", "CPL", 3200, "flying"], ["L. Korir", "ATPL", 5400, "available"],
      ["S. Otieno", "CPL", 2100, "flying"], ["J. Mutua", "ATPL", 6100, "available"],
      ["P. Njoroge", "CPL", 1800, "rest"], ["W. Chebet", "CPL", 2750, "available"],
      ["D. Kimani", "ATPL", 4800, "flying"],
    ];
    for (const [name, license, hours, status] of crew) {
      await ctx.db.insert("pilots", { airlineId: mara, name, license, hours, phoneE164: "+25472000" + (1000 + hours % 9000), status });
    }

    // ── property builder ──────────────────────────────────────────────────────
    type StaffSpec = ["guide" | "driver" | "porter" | "front_desk" | "housekeeping" | "chef" | "manager" | "security", string, string[]];
    const phonePool = (i: number) => "+2547" + String(10000000 + i * 13577).slice(0, 8);
    let phoneSeq = 0;

    const buildProperty = async (
      operatorId: Id<"operators">, name: string, code: string, region: string,
      stripLinks: Array<[string, boolean, number]>, team: StaffSpec[],
      vehiclesSpec: Array<["land_cruiser" | "safari_van" | "sedan", string, number]>,
      roomsSpec: Array<["tented_suite" | "family_unit" | "honeymoon" | "standard" | "private_house", string, number]>,
    ) => {
      const property = await ctx.db.insert("properties", {
        operatorId, name, region, shortCode: code, timezone: TZ, countryCode: "KE",
        carryOverPolicy: "carry_capped", carryOverCapDays: 5, leaveYearStartMonth: 1,
        opsPhone: phonePool(phoneSeq++),
      });
      const duty = await ctx.db.insert("users", {
        scope: "property", propertyId: property, tokenIdentifier: `seed|${code}-duty`,
        name: team.find((t) => t[0] === "guide")?.[1] ?? `${name} Duty`, role: "duty_contact",
        phoneE164: phonePool(phoneSeq++), whatsappOptIn: true,
      });
      const backup = await ctx.db.insert("users", {
        scope: "property", propertyId: property, tokenIdentifier: `seed|${code}-backup`,
        name: team.find((t) => t[0] === "front_desk")?.[1] ?? `${name} Backup`, role: "backup_contact",
        phoneE164: phonePool(phoneSeq++),
      });
      await ctx.db.insert("users", {
        scope: "property", propertyId: property, tokenIdentifier: `seed|${code}-manager`,
        name: team.find((t) => t[0] === "manager")?.[1] ?? `${name} Manager`, role: "property_manager",
        phoneE164: phonePool(phoneSeq++),
      });
      await ctx.db.patch(property, { dutyContactId: duty, backupContactId: backup });
      for (const [s, primary, drive] of stripLinks) {
        await ctx.db.insert("propertyAirstrips", { propertyId: property, airstripId: strips[s]!, isPrimary: primary, driveMinutes: drive });
      }
      await ctx.db.insert("airlinePropertyLinks", { airlineId: mara, propertyId: property });

      const staffIds: Id<"staff">[] = [];
      for (const [role, sName, languages] of team) {
        staffIds.push(await ctx.db.insert("staff", {
          propertyId: property, name: sName, role, phoneE164: phonePool(phoneSeq++),
          whatsappOptIn: role !== "housekeeping", certifications: role === "guide" ? ["Silver guide", "First aid"] : role === "driver" ? ["Defensive driving"] : [],
          languages, allowedDays: 21, dailyDutyCap: 2, active: true,
          employmentStart: base - (200 + (staffIds.length * 47)) * DAY,
        }));
        nStaff++;
      }
      const vehicleIds: Id<"vehicles">[] = [];
      for (const [type, vName, seats] of vehiclesSpec) {
        vehicleIds.push(await ctx.db.insert("vehicles", { propertyId: property, name: vName, type, seats, registration: "K" + type[0]!.toUpperCase() + " " + (100 + vehicleIds.length) + "X", active: true }));
      }
      const roomIds: Id<"rooms">[] = [];
      for (const [type, rName, capacity] of roomsSpec) {
        roomIds.push(await ctx.db.insert("rooms", { propertyId: property, name: rName, type, capacity, status: "available" }));
      }
      for (const [role, min] of [["guide", 2], ["driver", 1], ["front_desk", 1], ["housekeeping", 1]] as const) {
        await ctx.db.insert("coverageRules", { propertyId: property, role, minStaff: min, peakMinStaff: min + 1, resilienceBuffer: 1 });
      }
      return { property, duty, backup, staffIds, vehicleIds, roomIds };
    };

    // ── Riverbend (demo property — deep) ──────────────────────────────────────
    const rb = await buildProperty(
      maraCollection, "Riverbend", "RB", "Maasai Mara",
      [["Ol Kiombo", true, 25], ["Keekorok", false, 50], ["Musiara", false, 45]],
      [
        ["guide", "Joseph Kipng'eno", ["EN", "SW", "Maa"]],
        ["guide", "Peter Lemayian", ["EN", "SW", "Maa"]],
        ["guide", "Daniel Saitoti", ["EN", "SW", "Maa"]],
        ["guide", "Esther Naipanoi", ["EN", "SW", "Maa"]],
        ["driver", "Samuel Otieno", ["EN", "SW"]],
        ["driver", "Mohamed Abdi", ["EN", "SW", "SO"]],
        ["driver", "Kevin Mwangi", ["EN", "SW"]],
        ["front_desk", "Mary Wanjiru", ["EN", "SW"]],
        ["front_desk", "Aisha Hassan", ["EN", "SW"]],
        ["housekeeping", "Grace Naserian", ["SW", "Maa"]],
        ["housekeeping", "Faith Chebet", ["SW", "EN"]],
        ["porter", "Brian Ouma", ["EN", "SW"]],
        ["chef", "Antoine Dubois", ["EN", "FR"]],
        ["manager", "Catherine Wairimu", ["EN", "SW"]],
        ["security", "John Lekishon", ["SW", "Maa"]],
      ],
      [
        ["land_cruiser", "Land Cruiser 1", 7], ["land_cruiser", "Land Cruiser 2", 7],
        ["land_cruiser", "Land Cruiser 3", 7], ["safari_van", "Safari Van", 9],
        ["sedan", "Airport Sedan", 4],
      ],
      [
        ["tented_suite", "Riverine 1", 2], ["tented_suite", "Riverine 2", 2],
        ["tented_suite", "Riverine 3", 2], ["family_unit", "Acacia Family", 4],
        ["family_unit", "Sausage Tree Family", 4], ["honeymoon", "Honeymoon Deck", 2],
        ["private_house", "Riverbend House", 6], ["standard", "Plains 1", 2],
        ["standard", "Plains 2", 2], ["standard", "Plains 3", 2],
        ["standard", "Plains 4", 2], ["tented_suite", "Riverine 4", 2],
      ],
    );

    // ── other Mara Collection + group properties (breadth) ────────────────────
    const ac = await buildProperty(
      maraCollection, "Acacia", "AC", "Maasai Mara",
      [["Ol Kiombo", true, 40], ["Keekorok", false, 35]],
      [["guide", "Naserian Ole", ["EN", "SW", "Maa"]], ["guide", "Tom Sankale", ["EN", "SW", "Maa"]],
       ["driver", "Patrick Maina", ["EN", "SW"]], ["front_desk", "Lucy Akinyi", ["EN", "SW"]],
       ["housekeeping", "Mercy Wambui", ["SW"]], ["manager", "David Koech", ["EN", "SW"]]],
      [["land_cruiser", "AC Cruiser 1", 7], ["land_cruiser", "AC Cruiser 2", 7]],
      [["tented_suite", "Tortilis 1", 2], ["tented_suite", "Tortilis 2", 2], ["family_unit", "Tortilis Family", 4], ["honeymoon", "Acacia Honeymoon", 2]],
    );
    const tp = await buildProperty(
      maraCollection, "Topi Plains", "TP", "Maasai Mara",
      [["Musiara", true, 30], ["Mara North", false, 40]],
      [["guide", "Wilson Kones", ["EN", "SW", "Maa"]], ["driver", "Geoffrey Rono", ["EN", "SW"]],
       ["front_desk", "Janet Moraa", ["EN", "SW"]], ["manager", "Alice Njeri", ["EN", "SW"]]],
      [["land_cruiser", "TP Cruiser 1", 7], ["safari_van", "TP Van", 9]],
      [["tented_suite", "Plains Suite 1", 2], ["tented_suite", "Plains Suite 2", 2], ["standard", "Topi 1", 2]],
    );
    const lh = await buildProperty(
      laragai, "Laragai House", "LH", "Laikipia",
      [["Loisaba", true, 20], ["Nanyuki", false, 60]],
      [["guide", "Lemarti Lengai", ["EN", "SW", "Maa"]], ["driver", "Stephen Mutiso", ["EN", "SW"]],
       ["front_desk", "Pauline Atieno", ["EN", "SW"]], ["manager", "Robert Gitonga", ["EN", "SW"]]],
      [["land_cruiser", "LH Cruiser 1", 7], ["land_cruiser", "LH Cruiser 2", 7]],
      [["private_house", "Laragai House", 8], ["tented_suite", "Hill Suite", 2]],
    );
    const sm = await buildProperty(
      sandRiver, "Sand River Mara", "SM", "Maasai Mara",
      [["Keekorok", true, 30], ["Ol Kiombo", false, 55]],
      [["guide", "Charles Kiplagat", ["EN", "SW", "Maa"]], ["driver", "Vincent Owino", ["EN", "SW"]],
       ["front_desk", "Beatrice Nyambura", ["EN", "SW"]], ["manager", "Eunice Cherono", ["EN", "SW"]]],
      [["land_cruiser", "SM Cruiser 1", 7]],
      [["tented_suite", "Sand 1", 2], ["tented_suite", "Sand 2", 2], ["family_unit", "Sand Family", 4]],
    );

    // ── leave register for Riverbend (realistic spread) ───────────────────────
    const addLeave = async (idx: number, offsets: number[]) => {
      for (const o of offsets) {
        await ctx.db.insert("leaveDays", {
          propertyId: rb.property, staffId: rb.staffIds[idx]!, date: base + o * DAY,
          leaveYear: new Date(base + o * DAY).getFullYear(), source: "manual",
        });
      }
    };
    await addLeave(9, [1, 2, 3, 4, 5, 6, 7]); // Grace — week off
    await addLeave(2, [8, 9, 10]); // Daniel
    await addLeave(5, [12, 13]); // Mohamed
    await addLeave(10, [-2, -1, 0, 1]); // Faith — current
    await addLeave(12, [18, 19, 20, 21, 22]); // Antoine
    await addLeave(7, [25, 26]); // Mary

    // ── flights (Mara Wings, across days) ─────────────────────────────────────
    const F = async (code: string, reg: string, pilot: string, off: number, h: number, m: number, status: "planned" | "in_flight" | "completed") =>
      ctx.db.insert("flights", { airlineId: mara, code, aircraftReg: reg, pilotName: pilot, departTime: dayAt(off, h, m), timezone: TZ, base: "Wilson", status });
    const fY1 = await F("F-088", "5Y-CAC", "L. Korir", -1, 9, 0, "completed");
    const fY2 = await F("F-090", "5H-TGT", "S. Otieno", -1, 14, 0, "completed");
    const f101 = await F("F-101", "5Y-BMF", "A. Mwangi", 0, 8, 40, "planned");
    const f102 = await F("F-102", "5Y-CAC", "L. Korir", 0, 10, 30, "planned");
    const f103 = await F("F-103", "5H-TGT", "S. Otieno", 0, 9, 0, "in_flight");
    const f104 = await F("F-104", "5Y-KQA", "J. Mutua", 0, 11, 30, "planned");
    const f105 = await F("F-105", "5Y-NMJ", "W. Chebet", 0, 15, 0, "planned");
    const fT1 = await F("F-110", "5Y-BMF", "A. Mwangi", 1, 9, 0, "planned");
    const fT2 = await F("F-112", "5Y-CAC", "D. Kimani", 2, 10, 0, "planned");

    // ── arrival generator ─────────────────────────────────────────────────────
    const NATS = ["United States", "United Kingdom", "Germany", "France", "Australia", "Canada", "Netherlands", "Italy", "Spain", "Switzerland"];
    const SPECIAL = ["Honeymoon", "Anniversary", "Vegetarian", "Gluten-free", "Wheelchair access", "Child seat", "Birthday", "Photographer — extra luggage"];

    type AOpts = {
      mode: "charter" | "scheduled" | "helicopter" | "road" | "self_drive" | "self_fly";
      property: { property: Id<"properties">; duty: Id<"users">; staffIds: Id<"staff">[]; vehicleIds: Id<"vehicles">[]; roomIds: Id<"rooms">[] };
      operatorId: Id<"operators">;
      dir: "arrival" | "departure"; guest: string; pax: number; origin: string; dest: string;
      strip?: string; flight?: Id<"flights"> | null; off: number; h: number; m: number;
      status: "requested" | "scheduled" | "acknowledged" | "in_transit" | "completed";
      airline?: boolean; modeDetail?: any; special?: string[]; vip?: boolean; nationality?: string;
      escalateSoon?: boolean; guests?: string[]; assignVehicleIdx?: number[]; roomIdx?: number;
    };
    const mk = async (a: AOpts) => {
      const correlationId = newCorrelationId();
      const time = dayAt(a.off, a.h, a.m);
      const acked = a.status === "acknowledged" || a.status === "in_transit" || a.status === "completed";
      const deadline = a.escalateSoon ? now + 90_000 : (a.status === "scheduled" ? time - win : undefined);
      const id = await ctx.db.insert("arrivalEvents", {
        mode: a.mode, direction: a.dir, propertyId: a.property.property, operatorId: a.operatorId,
        airlineId: a.airline ? mara : undefined, airstripId: a.strip ? strips[a.strip] : undefined,
        origin: a.origin, destinationLabel: a.dest, guestName: a.guest, pax: a.pax,
        paxAdults: Math.max(1, a.pax - (a.guests?.filter((g) => g.includes("(child)")).length ?? 0)),
        leadGuestNationality: a.nationality, dietary: a.special?.filter((s) => /Veg|Gluten/.test(s)),
        vip: a.vip, special: a.special ?? [], luggage: a.pax > 3 ? "Excess — 2 extra bags" : undefined,
        timezone: TZ, scheduledTime: time, timeConfidence: a.status === "requested" ? "tentative" : "scheduled",
        estimatedTime: a.status === "in_transit" ? time + 5 * 60000 : undefined,
        actualTime: a.status === "completed" ? time : undefined,
        status: a.status, flightId: a.flight ?? undefined, modeDetail: a.modeDetail,
        createdBy: "property", claimedByAirline: false, reconfirmRequested: false,
        escalationDeadline: deadline, acknowledgedAt: acked ? time - 4 * HOUR : undefined,
        correlationId, sourceSystem: "reservations", externalRef: "RES-" + Math.abs(time % 1000000),
      });
      nArrivals++;
      await recordEvent(ctx, {
        correlationId, propertyId: a.property.property, airlineId: a.airline ? mara : undefined,
        type: "arrival_created", summary: `${a.mode} ${a.dir} for ${a.guest}`, arrivalId: id,
      });
      if (acked) {
        await ctx.db.insert("acknowledgments", { arrivalId: id, propertyId: a.property.property, byUserId: a.property.duty, at: time - 4 * HOUR, channel: "mock", type: "initial" });
        await ctx.db.insert("notifications", { at: time - 4 * HOUR, channel: "sms", status: "sent", toPhone: "+254700000001", arrivalId: id, propertyId: a.property.property, airlineId: a.airline ? mara : undefined, kind: "arrival_posted", body: `New ${a.mode} ${a.dir}: ${a.guest} (${a.pax} pax)`, delivered: false, attempts: 1, correlationId });
      }
      for (const g of a.guests ?? []) {
        await ctx.db.insert("arrivalGuests", { arrivalId: id, propertyId: a.property.property, fullName: g.replace(" (child)", ""), type: g.includes("(child)") ? "child" : "adult", nationality: a.nationality });
        nGuests++;
      }
      for (let vi = 0; vi < (a.assignVehicleIdx?.length ?? 0); vi++) {
        const vIdx = a.assignVehicleIdx![vi]!;
        const staffIdx = vi % a.property.staffIds.length;
        await ctx.db.insert("dutyAssignments", {
          arrivalId: id, propertyId: a.property.property, staffId: a.property.staffIds[staffIdx]!,
          vehicleId: a.property.vehicleIds[vIdx], dutyType: a.dir === "arrival" ? "airstrip_pickup" : "airstrip_dropoff",
          status: acked ? "accepted" : "assigned", seatsCovered: 7, assignedAt: time - 5 * HOUR,
          confirmedAt: acked ? time - 4 * HOUR : undefined,
        });
      }
      if (a.roomIdx !== undefined && a.dir === "arrival") {
        await ctx.db.insert("roomAssignments", { arrivalId: id, propertyId: a.property.property, roomId: a.property.roomIds[a.roomIdx]!, guest: a.guest, checkInDate: time });
      }
      return id;
    };

    // ── Riverbend: today (rich) ───────────────────────────────────────────────
    // F-101 — mixed arr+dep across Riverbend + Acacia, shared Ol Kiombo strip.
    await mk({ mode: "charter", property: rb, operatorId: maraCollection, dir: "arrival", guest: "Hargreaves party", pax: 4, origin: "Wilson", dest: "Ol Kiombo", strip: "Ol Kiombo", flight: f101, off: 0, h: 13, m: 15, status: "scheduled", airline: true, escalateSoon: true, nationality: "United Kingdom", vip: true, special: ["Honeymoon"], guests: ["Oliver Hargreaves", "Sophie Hargreaves"], roomIdx: 5 });
    await mk({ mode: "charter", property: rb, operatorId: maraCollection, dir: "departure", guest: "Vanterpool party", pax: 2, origin: "Ol Kiombo", dest: "Wilson", strip: "Ol Kiombo", flight: f101, off: 0, h: 8, m: 0, status: "completed", airline: true, nationality: "Netherlands", assignVehicleIdx: [0] });
    await mk({ mode: "charter", property: ac, operatorId: maraCollection, dir: "arrival", guest: "Brandt party", pax: 3, origin: "Wilson", dest: "Ol Kiombo", strip: "Ol Kiombo", flight: f101, off: 0, h: 13, m: 20, status: "scheduled", airline: true, nationality: "Germany" });

    await mk({ mode: "charter", property: rb, operatorId: maraCollection, dir: "arrival", guest: "Lindqvist party", pax: 2, origin: "Wilson", dest: "Keekorok", strip: "Keekorok", flight: f102, off: 0, h: 13, m: 40, status: "scheduled", airline: true, nationality: "Sweden" });
    await mk({ mode: "charter", property: rb, operatorId: maraCollection, dir: "arrival", guest: "Okoth party", pax: 3, origin: "Wilson", dest: "Musiara", strip: "Musiara", flight: f103, off: 0, h: 10, m: 5, status: "in_transit", airline: true, nationality: "United States", assignVehicleIdx: [1], roomIdx: 3 });
    await mk({ mode: "charter", property: rb, operatorId: maraCollection, dir: "departure", guest: "Adeyemi party", pax: 6, origin: "Ol Kiombo", dest: "Wilson", strip: "Ol Kiombo", flight: f104, off: 0, h: 12, m: 15, status: "acknowledged", airline: true, nationality: "United States", special: ["Excess luggage"], assignVehicleIdx: [0, 1] });
    await mk({ mode: "charter", property: rb, operatorId: maraCollection, dir: "arrival", guest: "Chen party", pax: 2, origin: "Wilson", dest: "Ol Kiombo", strip: "Ol Kiombo", flight: null, off: 0, h: 16, m: 30, status: "requested", airline: true, nationality: "Singapore", special: ["Vegetarian"] });

    // Multi-mode today.
    await mk({ mode: "road", property: rb, operatorId: maraCollection, dir: "arrival", guest: "Okafor party", pax: 4, origin: "Nairobi", dest: "Main gate", off: 0, h: 17, m: 0, status: "scheduled", special: ["Child seat"], nationality: "Nigeria", modeDetail: { operator: "Mara Roadways", vehicle: "Land Cruiser KDA 221X", driverName: "Kibet", driverContact: "+254799112233", gateTime: dayAt(0, 17, 0) }, guests: ["Chidi Okafor", "Ada Okafor", "Zara Okafor (child)", "Emeka Okafor (child)"] });
    await mk({ mode: "scheduled", property: rb, operatorId: maraCollection, dir: "arrival", guest: "Müller party", pax: 2, origin: "Wilson (Nairobi)", dest: "Keekorok", strip: "Keekorok", off: 0, h: 14, m: 50, status: "scheduled", nationality: "Germany", modeDetail: { carrier: "Safarilink", flightNumber: "JS-120", connectionNotes: "Connects ex-KLM from Amsterdam" } });
    await mk({ mode: "self_drive", property: rb, operatorId: maraCollection, dir: "arrival", guest: "Bennett party", pax: 2, origin: "Nakuru", dest: "Main gate", off: 0, h: 15, m: 30, status: "scheduled", nationality: "Australia", modeDetail: { guestVehicle: "Toyota Prado KCX 884Y", routeNotes: "Via Sekenani gate" } });

    // Riverbend: yesterday (completed history).
    await mk({ mode: "charter", property: rb, operatorId: maraCollection, dir: "arrival", guest: "Whitman party", pax: 2, origin: "Wilson", dest: "Ol Kiombo", strip: "Ol Kiombo", flight: fY1, off: -1, h: 11, m: 0, status: "completed", airline: true, nationality: "Canada", assignVehicleIdx: [0], roomIdx: 0 });
    await mk({ mode: "scheduled", property: rb, operatorId: maraCollection, dir: "arrival", guest: "Rossi party", pax: 3, origin: "Wilson (Nairobi)", dest: "Keekorok", strip: "Keekorok", off: -1, h: 15, m: 30, status: "completed", nationality: "Italy", modeDetail: { carrier: "AirKenya", flightNumber: "P2-431" }, roomIdx: 1 });
    await mk({ mode: "road", property: rb, operatorId: maraCollection, dir: "arrival", guest: "Dupont party", pax: 2, origin: "Nairobi", dest: "Main gate", off: -2, h: 16, m: 0, status: "completed", nationality: "France", modeDetail: { operator: "Pollman's", vehicle: "Safari Van" } });

    // Riverbend: upcoming (tomorrow+).
    await mk({ mode: "charter", property: rb, operatorId: maraCollection, dir: "arrival", guest: "Yamamoto party", pax: 2, origin: "Wilson", dest: "Ol Kiombo", strip: "Ol Kiombo", flight: fT1, off: 1, h: 9, m: 30, status: "scheduled", airline: true, nationality: "Japan", special: ["Photographer — extra luggage"] });
    await mk({ mode: "helicopter", property: rb, operatorId: maraCollection, dir: "arrival", guest: "Al-Farsi party", pax: 4, origin: "Nairobi", dest: "Helipad", off: 1, h: 11, m: 0, status: "scheduled", vip: true, nationality: "UAE", modeDetail: { operator: "Tropic Air", landingPoint: "River helipad", pilotContact: "+254700556677" } });
    await mk({ mode: "charter", property: rb, operatorId: maraCollection, dir: "departure", guest: "Whitman party", pax: 2, origin: "Ol Kiombo", dest: "Wilson", strip: "Ol Kiombo", flight: fT1, off: 1, h: 12, m: 0, status: "scheduled", airline: true, nationality: "Canada" });
    await mk({ mode: "self_drive", property: rb, operatorId: maraCollection, dir: "arrival", guest: "Becker party", pax: 5, origin: "Nairobi", dest: "Main gate", off: 2, h: 14, m: 0, status: "scheduled", nationality: "Germany", modeDetail: { guestVehicle: "Land Rover Defender" } });
    await mk({ mode: "charter", property: rb, operatorId: maraCollection, dir: "arrival", guest: "Petersen party", pax: 2, origin: "Wilson", dest: "Ol Kiombo", strip: "Ol Kiombo", flight: fT2, off: 2, h: 10, m: 30, status: "scheduled", airline: true, nationality: "Denmark" });

    // ── other properties: awaiting-flight + a few arrivals (air requests + breadth) ──
    await mk({ mode: "charter", property: ac, operatorId: maraCollection, dir: "arrival", guest: "Sato party", pax: 2, origin: "Wilson", dest: "Keekorok", strip: "Keekorok", flight: null, off: 0, h: 15, m: 0, status: "requested", airline: true, nationality: "Japan" });
    await mk({ mode: "charter", property: tp, operatorId: maraCollection, dir: "arrival", guest: "Novak party", pax: 3, origin: "Wilson", dest: "Musiara", strip: "Musiara", flight: f105, off: 0, h: 15, m: 30, status: "scheduled", airline: true, nationality: "Czechia" });
    await mk({ mode: "helicopter", property: tp, operatorId: maraCollection, dir: "arrival", guest: "Petrova party", pax: 2, origin: "Loisaba", dest: "Helipad", off: 0, h: 12, m: 30, status: "scheduled", nationality: "Russia", modeDetail: { operator: "Tropic Air", landingPoint: "North helipad" } });
    await mk({ mode: "charter", property: sm, operatorId: sandRiver, dir: "arrival", guest: "Garcia party", pax: 4, origin: "Wilson", dest: "Keekorok", strip: "Keekorok", flight: null, off: 0, h: 16, m: 0, status: "requested", airline: true, nationality: "Spain" });
    await mk({ mode: "road", property: lh, operatorId: laragai, dir: "arrival", guest: "Hendricks party", pax: 2, origin: "Nanyuki", dest: "Main gate", off: 0, h: 13, m: 0, status: "scheduled", nationality: "South Africa", modeDetail: { operator: "Laikipia Transfers", vehicle: "Land Cruiser" } });

    // activate subscriptions counts
    return { operators: 3, properties: 6, staff: nStaff, arrivals: nArrivals, flights: 9, guests: nGuests };
  },
});
