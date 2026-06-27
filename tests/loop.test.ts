import { convexTest } from "convex-test";
import { describe, expect, test } from "vitest";
import schema from "../convex/schema";
import { api, internal } from "../convex/_generated/api";
import type { Id } from "../convex/_generated/dataModel";

// Discover all Convex modules for the in-memory test backend.
const modules = import.meta.glob("../convex/**/*.ts");

const AIR = { tokenIdentifier: "air|ops", subject: "air|ops", issuer: "https://test", name: "Ops" };
const LODGE = { tokenIdentifier: "lodge|duty", subject: "lodge|duty", issuer: "https://test", name: "Duty" };
const LODGE2 = { tokenIdentifier: "lodge2|duty", subject: "lodge2|duty", issuer: "https://test", name: "Other" };

// Build a minimal two-tenant world directly in the DB.
async function world(t: ReturnType<typeof convexTest>) {
  return await t.run(async (ctx) => {
    const airline = await ctx.db.insert("organizations", {
      type: "airline", name: "Mara Wings", shortCode: "MW", opsPhone: "+254700000001",
    });
    const lodge = await ctx.db.insert("organizations", {
      type: "lodge", name: "Riverbend", shortCode: "R",
    });
    const lodge2 = await ctx.db.insert("organizations", {
      type: "lodge", name: "Acacia", shortCode: "AC",
    });
    const backup = await ctx.db.insert("users", {
      orgId: lodge, tokenIdentifier: "lodge|backup", name: "Backup", role: "backup", phone: "+254701233880",
    });
    await ctx.db.patch(lodge, { backupContactId: backup });

    const airUser = await ctx.db.insert("users", {
      orgId: airline, tokenIdentifier: AIR.tokenIdentifier, name: "Ops", role: "ops",
    });
    const lodgeUser = await ctx.db.insert("users", {
      orgId: lodge, tokenIdentifier: LODGE.tokenIdentifier, name: "Duty", role: "duty_contact",
    });
    const lodge2User = await ctx.db.insert("users", {
      orgId: lodge2, tokenIdentifier: LODGE2.tokenIdentifier, name: "Other", role: "duty_contact",
    });
    for (const l of [lodge, lodge2]) {
      await ctx.db.insert("airlineLodgeLinks", { airlineId: airline, lodgeId: l });
    }
    const booking = await ctx.db.insert("bookings", {
      lodgeId: lodge, guest: "Chen", pax: 2, externalRef: "RR-1", arrivalDate: Date.now(),
      departureDate: Date.now(), arrivalAirstrip: "Ol Kiombo", departureAirstrip: "Ol Kiombo",
    });
    const movement = await ctx.db.insert("movements", {
      bookingId: booking, direction: "arrival", lodgeId: lodge, airlineId: airline,
      airstrip: "Ol Kiombo", guestName: "Chen", pax: 2, special: [],
      scheduledTime: Date.now() + 3 * 3600_000, status: "requested",
      reconfirmRequested: false, correlationId: "corr-chen",
    });
    const flight = await ctx.db.insert("flights", {
      airlineId: airline, code: "F-101", aircraftReg: "5Y-BMF", pilotName: "A. Mwangi",
      departTime: Date.now() + 2 * 3600_000, base: "Wilson", status: "planned",
    });
    return { airline, lodge, lodge2, movement, flight, lodgeUser, lodge2User };
  });
}

describe("schedule → acknowledge → escalate loop", () => {
  test("air schedules, lodge sees it, lodge acks, air sees the ack", async () => {
    const t = convexTest(schema, modules);
    const w = await world(t);

    // 1. Air schedules the queued movement onto the flight.
    await t.withIdentity(AIR).mutation(api.flights.scheduleMovement, {
      movementId: w.movement, flightId: w.flight,
    });

    // 2. Lodge sees it as a scheduled (awaiting-ack) movement.
    const board = await t.withIdentity(LODGE).query(api.movements.board, {});
    const seen = board.find((m: any) => m._id === w.movement);
    expect(seen?.status).toBe("scheduled");
    expect(seen?.flight?.code).toBe("F-101");

    // 3. Lodge acknowledges.
    await t.withIdentity(LODGE).mutation(api.movements.acknowledge, { movementId: w.movement });

    // 4. Air's flight board ack count ticks up.
    const flights = await t.withIdentity(AIR).query(api.flights.board, {});
    const f = flights.find((x: any) => x._id === w.flight);
    expect(f?.ackCount).toBe(1);
    expect(f?.legCount).toBe(1);

    // An acknowledgment row + events exist.
    const acks = await t.run((ctx) =>
      ctx.db.query("acknowledgments").withIndex("by_movement", (q) => q.eq("movementId", w.movement)).collect(),
    );
    expect(acks.length).toBe(1);
  });

  test("escalation fires for a scheduled, unacknowledged movement past its deadline", async () => {
    const t = convexTest(schema, modules);
    const w = await world(t);

    // Schedule, then force the deadline into the past without acking.
    await t.withIdentity(AIR).mutation(api.flights.scheduleMovement, {
      movementId: w.movement, flightId: w.flight,
    });
    await t.run(async (ctx) => {
      await ctx.db.patch(w.movement, { escalationDeadline: Date.now() - 1000 });
    });

    const res = await t.mutation(internal.escalation.sweep, {});
    expect(res.escalated).toBe(1);

    const m = await t.run((ctx) => ctx.db.get(w.movement));
    expect(m?.status).toBe("escalated");

    // Deliver scheduled notifications; an SMS entry lands in the log.
    await t.finishInProgressScheduledFunctions();
    const notifs = await t.run((ctx) =>
      ctx.db.query("notifications").withIndex("by_movement", (q) => q.eq("movementId", w.movement)).collect(),
    );
    expect(notifs.length).toBeGreaterThanOrEqual(1);
    expect(notifs.some((n) => n.kind === "escalation")).toBe(true);
  });

  test("acknowledged movement is NOT escalated", async () => {
    const t = convexTest(schema, modules);
    const w = await world(t);
    await t.withIdentity(AIR).mutation(api.flights.scheduleMovement, {
      movementId: w.movement, flightId: w.flight,
    });
    await t.withIdentity(LODGE).mutation(api.movements.acknowledge, { movementId: w.movement });
    await t.run(async (ctx) => {
      await ctx.db.patch(w.movement, { escalationDeadline: Date.now() - 1000 });
    });
    const res = await t.mutation(internal.escalation.sweep, {});
    expect(res.escalated).toBe(0);
    const m = await t.run((ctx) => ctx.db.get(w.movement));
    expect(m?.status).toBe("acknowledged");
  });
});

describe("tenant isolation (enforced in code, no row-level security)", () => {
  test("a lodge cannot read another lodge's movements", async () => {
    const t = convexTest(schema, modules);
    const w = await world(t);
    await t.withIdentity(AIR).mutation(api.flights.scheduleMovement, {
      movementId: w.movement, flightId: w.flight,
    });

    // Lodge2's board never contains Lodge1's movement.
    const board2 = await t.withIdentity(LODGE2).query(api.movements.board, {});
    expect(board2.find((m: any) => m._id === w.movement)).toBeUndefined();

    // Direct get returns null across tenants.
    const got = await t.withIdentity(LODGE2).query(api.movements.get, { movementId: w.movement });
    expect(got).toBeNull();
  });

  test("a lodge cannot acknowledge another lodge's movement", async () => {
    const t = convexTest(schema, modules);
    const w = await world(t);
    await t.withIdentity(AIR).mutation(api.flights.scheduleMovement, {
      movementId: w.movement, flightId: w.flight,
    });
    await expect(
      t.withIdentity(LODGE2).mutation(api.movements.acknowledge, { movementId: w.movement }),
    ).rejects.toThrow();
  });

  test("an airline account cannot use lodge-only mutations", async () => {
    const t = convexTest(schema, modules);
    const w = await world(t);
    await expect(
      t.withIdentity(AIR).mutation(api.movements.acknowledge, { movementId: w.movement }),
    ).rejects.toThrow();
  });
});
