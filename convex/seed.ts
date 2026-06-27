import { v } from "convex/values";
import { internalMutation } from "./_generated/server";
import { newCorrelationId, recordEvent } from "./lib/events";
import { escalationWindowMs } from "./lib/constants";
import type { Id } from "./_generated/dataModel";

const TABLES = [
  "transferEvents",
  "notifications",
  "acknowledgments",
  "dutyAssignments",
  "movements",
  "flights",
  "bookings",
  "staff",
  "pilots",
  "aircraft",
  "airstrips",
  "airlineLodgeLinks",
  "users",
  "organizations",
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

// Seed mirrors the prototypes. Idempotent: wipes then rebuilds. Crafted to
// contain the three demo shapes —
//   • Chen: a movement still "awaiting flight" (no flight_id)
//   • F-101: one flight carrying mixed arrivals + departures across TWO lodges
//   • Hargreaves: a scheduled, unacknowledged movement whose escalation deadline
//     lapses ~90s after seeding, so the sweep escalates it live during a demo.
export const run = internalMutation({
  args: {},
  returns: v.object({
    organizations: v.number(),
    movements: v.number(),
    flights: v.number(),
  }),
  handler: async (ctx) => {
    await clearAll(ctx);
    const now = Date.now();
    const midnight = new Date(now);
    midnight.setHours(0, 0, 0, 0);
    const at = (h: number, m: number) => midnight.getTime() + (h * 60 + m) * 60_000;
    const win = escalationWindowMs();

    // ── organizations ──────────────────────────────────────────────────────
    const mara = await ctx.db.insert("organizations", {
      type: "airline",
      name: "Mara Wings",
      shortCode: "MW",
      opsPhone: process.env.ESCALATION_AIRLINE_OPS_PHONE ?? "+254700000001",
    });
    const riverbend = await ctx.db.insert("organizations", {
      type: "lodge",
      name: "Riverbend",
      shortCode: "R",
    });
    const acacia = await ctx.db.insert("organizations", {
      type: "lodge",
      name: "Acacia",
      shortCode: "AC",
    });
    const topi = await ctx.db.insert("organizations", {
      type: "lodge",
      name: "Topi Plains",
      shortCode: "TP",
    });

    // ── users (contacts; phones drive escalation SMS) ──────────────────────
    // tokenIdentifier "seed|*" are placeholders; the real logged-in Clerk user
    // is linked at runtime by users.ensureForApp.
    const opsUser = await ctx.db.insert("users", {
      orgId: mara,
      tokenIdentifier: "seed|mara-ops",
      name: "James Mutua",
      role: "ops",
      phone: "+254700000001",
      email: "ops@marawings.example",
    });
    const rbDuty = await ctx.db.insert("users", {
      orgId: riverbend,
      tokenIdentifier: "seed|riverbend-duty",
      name: "Joseph Kipng'eno",
      role: "duty_contact",
      phone: "+254720551902",
      email: "duty@riverbend.example",
    });
    const rbBackup = await ctx.db.insert("users", {
      orgId: riverbend,
      tokenIdentifier: "seed|riverbend-backup",
      name: "Mary Wanjiru",
      role: "backup",
      phone: "+254701233880",
      email: "backup@riverbend.example",
    });
    const acDuty = await ctx.db.insert("users", {
      orgId: acacia,
      tokenIdentifier: "seed|acacia-duty",
      name: "Naserian Ole",
      role: "duty_contact",
      phone: "+254745119027",
      email: "duty@acacia.example",
    });
    await ctx.db.patch(riverbend, { dutyContactId: rbDuty, backupContactId: rbBackup });
    await ctx.db.patch(acacia, { dutyContactId: acDuty, backupContactId: acDuty });

    // ── links ──────────────────────────────────────────────────────────────
    for (const lodge of [riverbend, acacia, topi]) {
      await ctx.db.insert("airlineLodgeLinks", { airlineId: mara, lodgeId: lodge });
    }

    // ── reference data ─────────────────────────────────────────────────────
    for (const [name, region] of [
      ["Ol Kiombo", "Central Mara"],
      ["Keekorok", "Southern Mara"],
      ["Musiara", "Northern Mara"],
      ["Wilson", "Nairobi"],
      ["Mara North", "Northern Mara"],
    ] as const) {
      await ctx.db.insert("airstrips", { name, region });
    }
    const fleet: Array<[string, string, number, string]> = [
      ["5Y-BMF", "Cessna 208 Caravan", 12, "in_service"],
      ["5Y-CAC", "Cessna 208", 12, "in_service"],
      ["5H-TGT", "Pilatus PC-12", 9, "in_service"],
      ["5Y-KQA", "Cessna 208B", 13, "available"],
      ["5Y-AKA", "Cessna 206", 6, "maintenance"],
    ];
    for (const [reg, type, seats, status] of fleet) {
      await ctx.db.insert("aircraft", {
        airlineId: mara,
        reg,
        type,
        seats,
        base: "Wilson",
        status: status as any,
      });
    }
    const crew: Array<[string, string, number, string]> = [
      ["A. Mwangi", "CPL", 3200, "flying"],
      ["L. Korir", "ATPL", 5400, "available"],
      ["S. Otieno", "CPL", 2100, "flying"],
      ["J. Mutua", "ATPL", 6100, "available"],
      ["P. Njoroge", "CPL", 1800, "rest"],
    ];
    for (const [name, license, hours, status] of crew) {
      await ctx.db.insert("pilots", {
        airlineId: mara,
        name,
        license,
        hours,
        status: status as any,
      });
    }
    const team: Array<[string, string, string, string[]]> = [
      ["Daniel Saitoti", "Driver", "+254712004118", ["EN", "SW", "Maa"]],
      ["Joseph Kipng'eno", "Guide", "+254720551902", ["EN", "SW", "Maa"]],
      ["Peter Lemayian", "Guide", "+254733870145", ["EN", "SW", "Maa"]],
      ["Mary Wanjiru", "Front desk", "+254701233880", ["EN", "SW"]],
      ["Grace Naserian", "Housekeeping", "+254745119027", ["SW", "Maa"]],
      ["Samuel Otieno", "Porter", "+254718660431", ["EN", "SW"]],
    ];
    for (const [name, role, phone, languages] of team) {
      await ctx.db.insert("staff", {
        lodgeId: riverbend,
        name,
        role,
        phone,
        certifications: [],
        languages,
        entitlementDays: 21,
        leaveBalance: 10,
        available: true,
      });
    }

    // ── flights ──────────────────────────────────────────────────────────────
    const F = async (
      code: string,
      reg: string,
      pilot: string,
      h: number,
      m: number,
      status: string,
    ): Promise<Id<"flights">> =>
      await ctx.db.insert("flights", {
        airlineId: mara,
        code,
        aircraftReg: reg,
        pilotName: pilot,
        departTime: at(h, m),
        base: "Wilson",
        status: status as any,
      });
    const f101 = await F("F-101", "5Y-BMF", "A. Mwangi", 8, 40, "planned");
    const f102 = await F("F-102", "5Y-CAC", "L. Korir", 10, 30, "planned");
    const f103 = await F("F-103", "5H-TGT", "S. Otieno", 9, 0, "in_flight");
    const f104 = await F("F-104", "5Y-KQA", "J. Mutua", 11, 30, "planned");

    // ── bookings + movements ───────────────────────────────────────────────
    let movementCount = 0;
    const mkBooking = async (
      lodge: Id<"organizations">,
      guest: string,
      pax: number,
      ref: string,
      arrStrip: string,
      depStrip: string,
    ): Promise<Id<"bookings">> =>
      await ctx.db.insert("bookings", {
        lodgeId: lodge,
        guest,
        pax,
        externalRef: ref,
        arrivalDate: at(9, 0),
        departureDate: at(10, 0),
        arrivalAirstrip: arrStrip,
        departureAirstrip: depStrip,
      });

    type Mv = {
      lodge: Id<"organizations">;
      booking: Id<"bookings">;
      guest: string;
      pax: number;
      dir: "arrival" | "departure";
      strip: string;
      time: number;
      flight: Id<"flights"> | null;
      status: string;
      acked?: boolean;
      escalateSoon?: boolean;
    };
    const mkMovement = async (mv: Mv): Promise<Id<"movements">> => {
      const correlationId = newCorrelationId();
      // The escalator's deadline lapses ~90s from now so the sweep fires live.
      const deadline = mv.escalateSoon
        ? now + 90_000
        : mv.flight
          ? mv.time - win
          : undefined;
      const id = await ctx.db.insert("movements", {
        bookingId: mv.booking,
        direction: mv.dir,
        lodgeId: mv.lodge,
        airlineId: mara,
        airstrip: mv.strip,
        guestName: mv.guest,
        pax: mv.pax,
        special: [],
        scheduledTime: mv.time,
        status: mv.status as any,
        flightId: mv.flight ?? undefined,
        escalationDeadline: deadline,
        acknowledgedAt: mv.acked ? now - 3 * 3600_000 : undefined,
        reconfirmRequested: false,
        correlationId,
      });
      movementCount++;
      await recordEvent(ctx, {
        correlationId,
        lodgeId: mv.lodge,
        airlineId: mara,
        type: "movement_requested",
        summary: `${mv.dir} requested for ${mv.guest} at ${mv.strip}`,
        movementId: id,
      });
      if (mv.acked) {
        await ctx.db.insert("acknowledgments", {
          movementId: id,
          lodgeId: mv.lodge,
          byUserId: mv.lodge === riverbend ? rbDuty : acDuty,
          at: now - 3 * 3600_000,
          channel: "mock",
          type: "initial",
        });
      }
      return id;
    };

    // F-101 — mixed arrivals + departures across Riverbend AND Acacia.
    const bHar = await mkBooking(riverbend, "Hargreaves", 4, "RR-88231", "Ol Kiombo", "Ol Kiombo");
    await mkMovement({
      lodge: riverbend, booking: bHar, guest: "Hargreaves", pax: 4, dir: "arrival",
      strip: "Ol Kiombo", time: at(13, 15), flight: f101,
      status: "scheduled", escalateSoon: true,
    });
    const bVan = await mkBooking(riverbend, "Vanterpool", 2, "RR-88061", "Ol Kiombo", "Ol Kiombo");
    await mkMovement({
      lodge: riverbend, booking: bVan, guest: "Vanterpool", pax: 2, dir: "departure",
      strip: "Ol Kiombo", time: at(8, 0), flight: f101, status: "acknowledged", acked: true,
    });
    const bBra = await mkBooking(acacia, "Brandt", 3, "AC-55012", "Ol Kiombo", "Ol Kiombo");
    await mkMovement({
      lodge: acacia, booking: bBra, guest: "Brandt", pax: 3, dir: "arrival",
      strip: "Ol Kiombo", time: at(13, 20), flight: f101, status: "scheduled",
    });

    // F-102, F-103, F-104.
    const bLin = await mkBooking(riverbend, "Lindqvist", 2, "RR-88240", "Keekorok", "Keekorok");
    await mkMovement({
      lodge: riverbend, booking: bLin, guest: "Lindqvist", pax: 2, dir: "arrival",
      strip: "Keekorok", time: at(13, 40), flight: f102, status: "scheduled",
    });
    const bOko = await mkBooking(riverbend, "Okoth", 3, "RR-88199", "Musiara", "Musiara");
    await mkMovement({
      lodge: riverbend, booking: bOko, guest: "Okoth", pax: 3, dir: "arrival",
      strip: "Musiara", time: at(10, 5), flight: f103, status: "acknowledged", acked: true,
    });
    const bAde = await mkBooking(riverbend, "Adeyemi", 6, "RR-88102", "Wilson", "Wilson");
    await mkMovement({
      lodge: riverbend, booking: bAde, guest: "Adeyemi", pax: 6, dir: "departure",
      strip: "Wilson", time: at(12, 15), flight: f104, status: "acknowledged", acked: true,
    });

    // Chen — still AWAITING FLIGHT (the demo schedules this one).
    const bChen = await mkBooking(riverbend, "Chen", 2, "RR-88255", "Ol Kiombo", "Ol Kiombo");
    await mkMovement({
      lodge: riverbend, booking: bChen, guest: "Chen", pax: 2, dir: "arrival",
      strip: "Ol Kiombo", time: at(16, 30), flight: null, status: "requested",
    });
    const bSato = await mkBooking(acacia, "Sato", 2, "AC-55020", "Keekorok", "Keekorok");
    await mkMovement({
      lodge: acacia, booking: bSato, guest: "Sato", pax: 2, dir: "arrival",
      strip: "Keekorok", time: at(15, 0), flight: null, status: "requested",
    });

    return { organizations: 4, movements: movementCount, flights: 4 };
  },
});
