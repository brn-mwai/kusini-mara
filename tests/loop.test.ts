import { convexTest } from "convex-test";
import { describe, expect, test } from "vitest";
import schema from "../convex/schema";
import { api, internal } from "../convex/_generated/api";

const modules = import.meta.glob("../convex/**/*.ts");

// Demo posture: the Lodge app acts as the first property (Riverbend), the Air
// app as the first airline (Mara Wings). Acacia is a second property to prove
// the cross-tenant guard.
async function world(t: ReturnType<typeof convexTest>) {
  return await t.run(async (ctx) => {
    const operator = await ctx.db.insert("operators", { name: "Mara Collection", shortCode: "MC" });
    const airline = await ctx.db.insert("airlines", { name: "Mara Wings", shortCode: "MW", base: "Wilson", opsPhone: "+254700000001" });
    const riverbend = await ctx.db.insert("properties", { operatorId: operator, name: "Riverbend", region: "Mara", shortCode: "RB", timezone: "Africa/Nairobi", opsPhone: "+254700000010" });
    const acacia = await ctx.db.insert("properties", { operatorId: operator, name: "Acacia", region: "Mara", shortCode: "AC", timezone: "Africa/Nairobi" });
    const backup = await ctx.db.insert("users", { scope: "property", propertyId: riverbend, tokenIdentifier: "seed|backup", name: "Backup", role: "backup_contact", phoneE164: "+254701233880" });
    await ctx.db.patch(riverbend, { backupContactId: backup });
    await ctx.db.insert("users", { scope: "airline", airlineId: airline, tokenIdentifier: "seed|ops", name: "Ops", role: "airline_ops" });
    await ctx.db.insert("users", { scope: "property", propertyId: riverbend, tokenIdentifier: "seed|duty", name: "Duty", role: "duty_contact" });
    await ctx.db.insert("users", { scope: "property", propertyId: acacia, tokenIdentifier: "seed|ac", name: "AcDuty", role: "duty_contact" });
    const strip = await ctx.db.insert("airstrips", { name: "Ol Kiombo", region: "Mara" });
    for (const p of [riverbend, acacia]) {
      await ctx.db.insert("airlinePropertyLinks", { airlineId: airline, propertyId: p });
    }
    const mkArrival = async (property: typeof riverbend, guest: string) =>
      ctx.db.insert("arrivalEvents", {
        mode: "charter", direction: "arrival", propertyId: property, operatorId: operator,
        airlineId: airline, airstripId: strip, origin: "Wilson", destinationLabel: "Ol Kiombo",
        guestName: guest, pax: 2, special: [], scheduledTime: Date.now() + 3 * 3600_000,
        status: "requested", createdBy: "property", claimedByAirline: false, reconfirmRequested: false,
        correlationId: "corr-" + guest,
      });
    const chen = await mkArrival(riverbend, "Chen");
    const brandt = await mkArrival(acacia, "Brandt"); // OTHER property
    const flight = await ctx.db.insert("flights", { airlineId: airline, code: "F-101", aircraftReg: "5Y-BMF", pilotName: "A. Mwangi", departTime: Date.now() + 2 * 3600_000, base: "Wilson", status: "planned" });
    return { operator, airline, riverbend, acacia, chen, brandt, flight };
  });
}

describe("schedule → acknowledge → escalate loop (v2, demo)", () => {
  test("airline schedules, property sees it, property acks, airline sees the ack", async () => {
    const t = convexTest(schema, modules);
    const w = await world(t);
    await t.mutation(api.flights.scheduleArrival, { arrivalId: w.chen, flightId: w.flight });

    const board = await t.query(api.arrivals.board, {});
    const seen = board.find((a: any) => a._id === w.chen);
    expect(seen?.status).toBe("scheduled");
    expect(seen?.flight?.code).toBe("F-101");

    await t.mutation(api.arrivals.acknowledge, { arrivalId: w.chen });
    const flights = await t.query(api.flights.board, {});
    const f = flights.find((x: any) => x._id === w.flight);
    expect(f?.ackCount).toBe(1);
  });

  test("escalation fires for a scheduled, unacknowledged arrival past deadline", async () => {
    const t = convexTest(schema, modules);
    const w = await world(t);
    await t.mutation(api.flights.scheduleArrival, { arrivalId: w.chen, flightId: w.flight });
    await t.run(async (ctx) => ctx.db.patch(w.chen, { escalationDeadline: Date.now() - 1000 }));
    const res = await t.mutation(internal.escalation.sweep, {});
    expect(res.escalated).toBe(1);
    const a = await t.run((ctx) => ctx.db.get(w.chen));
    expect(a?.status).toBe("escalated");
    await t.finishInProgressScheduledFunctions();
    const notifs = await t.query(api.notifications.list, { app: "lodge" });
    expect(notifs.some((n: any) => n.kind === "escalation")).toBe(true);
  });

  test("acknowledged arrival is NOT escalated", async () => {
    const t = convexTest(schema, modules);
    const w = await world(t);
    await t.mutation(api.flights.scheduleArrival, { arrivalId: w.chen, flightId: w.flight });
    await t.mutation(api.arrivals.acknowledge, { arrivalId: w.chen });
    await t.run(async (ctx) => ctx.db.patch(w.chen, { escalationDeadline: Date.now() - 1000 }));
    const res = await t.mutation(internal.escalation.sweep, {});
    expect(res.escalated).toBe(0);
  });

  test("multi-mode: a road arrival can be created and acknowledged", async () => {
    const t = convexTest(schema, modules);
    await world(t);
    const { arrivalId } = await t.mutation(api.arrivals.create, {
      mode: "road", direction: "arrival", origin: "Nairobi", destinationLabel: "Main gate",
      guestName: "Okafor", pax: 4, scheduledTime: Date.now() + 2 * 3600_000,
    });
    const board = await t.query(api.arrivals.board, {});
    const road = board.find((a: any) => a._id === arrivalId);
    expect(road?.mode).toBe("road");
    expect(road?.status).toBe("scheduled");
    await t.mutation(api.arrivals.acknowledge, { arrivalId });
    const after = await t.run((ctx) => ctx.db.get(arrivalId));
    expect(after?.status).toBe("acknowledged");
  });
});

describe("tenant isolation", () => {
  test("the property app cannot acknowledge another property's arrival", async () => {
    const t = convexTest(schema, modules);
    const w = await world(t);
    await t.mutation(api.flights.scheduleArrival, { arrivalId: w.brandt, flightId: w.flight });
    await expect(
      t.mutation(api.arrivals.acknowledge, { arrivalId: w.brandt }),
    ).rejects.toThrow();
    const board = await t.query(api.arrivals.board, {});
    expect(board.find((a: any) => a._id === w.brandt)).toBeUndefined();
  });
});
