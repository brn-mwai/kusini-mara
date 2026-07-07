import { convexTest } from "convex-test";
import { describe, expect, test } from "vitest";
import schema from "../convex/schema";
import { api, internal } from "../convex/_generated/api";

const modules = import.meta.glob("../convex/**/*.ts");

// Demo posture: the Lodge app acts as the first property (Riverbend), the Air
// app as the first airline/airstrip side (Mara Wings). Acacia is a second
// property to prove the cross-tenant guard.
//
// The handshake under test is symmetric: whoever posts a movement assigns the
// other side; the assigned side acknowledges and sets the pickup time.
// Arrival → the airstrip side acknowledges; departure → the lodge does.
async function world(t: ReturnType<typeof convexTest>) {
  return await t.run(async (ctx) => {
    const operator = await ctx.db.insert("operators", { name: "Mara Collection", shortCode: "MC" });
    const airline = await ctx.db.insert("airlines", { name: "Mara Wings", shortCode: "MW", base: "Wilson", opsPhone: "+254700000001" });
    const riverbend = await ctx.db.insert("properties", { operatorId: operator, name: "Riverbend", region: "Mara", shortCode: "RB", timezone: "Africa/Nairobi", opsPhone: "+254700000010", defaultReportOffsetMinutes: 30 });
    const acacia = await ctx.db.insert("properties", { operatorId: operator, name: "Acacia", region: "Mara", shortCode: "AC", timezone: "Africa/Nairobi" });
    const backup = await ctx.db.insert("users", { scope: "property", propertyId: riverbend, tokenIdentifier: "seed|backup", name: "Backup", role: "backup_contact", phoneE164: "+254701233880" });
    await ctx.db.patch(riverbend, { backupContactId: backup });
    await ctx.db.insert("users", { scope: "airline", airlineId: airline, tokenIdentifier: "seed|ops", name: "Ops", role: "airline_ops" });
    await ctx.db.insert("users", { scope: "property", propertyId: riverbend, tokenIdentifier: "seed|duty", name: "Duty", role: "duty_contact" });
    await ctx.db.insert("users", { scope: "property", propertyId: acacia, tokenIdentifier: "seed|ac", name: "AcDuty", role: "duty_contact" });
    const strip = await ctx.db.insert("airstrips", { name: "Ol Kiombo", region: "Mara" });
    const loisaba = await ctx.db.insert("airstrips", { name: "Loisaba", region: "Laikipia" });
    for (const p of [riverbend, acacia]) {
      await ctx.db.insert("airlinePropertyLinks", { airlineId: airline, propertyId: p });
    }
    const mkArrival = async (property: typeof riverbend, guest: string, dir: "arrival" | "departure" = "arrival") =>
      ctx.db.insert("arrivalEvents", {
        mode: "charter", direction: dir, propertyId: property, operatorId: operator,
        airlineId: airline, airstripId: strip, origin: dir === "arrival" ? "Wilson" : "Ol Kiombo",
        destinationLabel: dir === "arrival" ? "Ol Kiombo" : "Wilson",
        guestName: guest, pax: 2, special: [], scheduledTime: Date.now() + 3 * 3600_000,
        status: "requested", createdBy: "property", claimedByAirline: false, reconfirmRequested: false,
        postedBySide: "lodge", assignedToSide: dir === "arrival" ? "airstrip" : "lodge",
        proposedPickupTime: Date.now() + 3 * 3600_000, guestReportOffsetMinutes: 30,
        correlationId: "corr-" + guest,
      });
    const chen = await mkArrival(riverbend, "Chen"); // arrival → airstrip acks
    const okaforOut = await mkArrival(riverbend, "OkaforOut", "departure"); // departure → lodge acks
    const brandt = await mkArrival(acacia, "Brandt"); // OTHER property
    const flight = await ctx.db.insert("flights", { airlineId: airline, code: "F-101", aircraftReg: "5Y-BMF", pilotName: "A. Mwangi", departTime: Date.now() + 2 * 3600_000, base: "Wilson", status: "planned" });
    return { operator, airline, riverbend, acacia, chen, okaforOut, brandt, flight, loisaba };
  });
}

describe("the symmetric handshake: post → assign → acknowledge → set pickup time", () => {
  test("arrival: lodge cannot ack; the airstrip side acknowledges and sets the pickup time", async () => {
    const t = convexTest(schema, modules);
    const w = await world(t);
    await t.mutation(api.flights.scheduleArrival, { arrivalId: w.chen, flightId: w.flight });

    // Visible on the lodge board, awaiting the STRIP side.
    const board = await t.query(api.arrivals.board, {});
    const seen = board.find((a: any) => a._id === w.chen);
    expect(seen?.status).toBe("scheduled");
    expect(seen?.assignedToSide).toBe("airstrip");
    expect(seen?.flight?.code).toBe("F-101");

    // The lodge is not the assigned side — its ack is rejected.
    await expect(
      t.mutation(api.arrivals.acknowledge, { arrivalId: w.chen }),
    ).rejects.toThrow(/assigned to the airstrip/);

    // The airstrip side acknowledges, adjusting the proposed time by 15 min.
    const pickup = (seen!.proposedPickupTime as number) + 15 * 60_000;
    await t.mutation(api.airstrip.acknowledge, { arrivalId: w.chen, pickupTime: pickup });

    const after = await t.run((ctx) => ctx.db.get(w.chen));
    expect(after?.status).toBe("acknowledged");
    expect(after?.confirmedPickupTime).toBe(pickup);

    const acks = await t.run((ctx) =>
      ctx.db.query("acknowledgments").withIndex("by_arrival", (q) => q.eq("arrivalId", w.chen)).collect(),
    );
    expect(acks).toHaveLength(1);
    expect(acks[0]?.bySide).toBe("airstrip");
    expect(acks[0]?.pickupTimeSet).toBe(pickup);

    // The air board's ack counter ticks.
    const flights = await t.query(api.flights.board, {});
    const f = flights.find((x: any) => x._id === w.flight);
    expect(f?.ackCount).toBe(1);
  });

  test("departure: assigned to the lodge — the lodge acknowledges (and the strip side cannot)", async () => {
    const t = convexTest(schema, modules);
    const w = await world(t);
    await t.mutation(api.flights.scheduleArrival, { arrivalId: w.okaforOut, flightId: w.flight });

    await expect(
      t.mutation(api.airstrip.acknowledge, { arrivalId: w.okaforOut }),
    ).rejects.toThrow(/assigned to the lodge/);

    await t.mutation(api.arrivals.acknowledge, { arrivalId: w.okaforOut });
    const after = await t.run((ctx) => ctx.db.get(w.okaforOut));
    expect(after?.status).toBe("acknowledged");
    // Accepting the proposal confirms it.
    expect(after?.confirmedPickupTime).toBe(after?.proposedPickupTime);

    const acks = await t.run((ctx) =>
      ctx.db.query("acknowledgments").withIndex("by_arrival", (q) => q.eq("arrivalId", w.okaforOut)).collect(),
    );
    expect(acks[0]?.bySide).toBe("lodge");
  });

  test("ground mode: lodge posts a road arrival, self-assigned, lodge acknowledges", async () => {
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
    expect(road?.assignedToSide).toBe("lodge");
    await t.mutation(api.arrivals.acknowledge, { arrivalId });
    const after = await t.run((ctx) => ctx.db.get(arrivalId));
    expect(after?.status).toBe("acknowledged");
  });

  test("guest report time derives from the confirmed pickup time minus the offset", async () => {
    const t = convexTest(schema, modules);
    const w = await world(t);
    await t.mutation(api.flights.scheduleArrival, { arrivalId: w.chen, flightId: w.flight });
    const pickup = Date.now() + 4 * 3600_000;
    await t.mutation(api.airstrip.acknowledge, { arrivalId: w.chen, pickupTime: pickup });
    const board = await t.query(api.arrivals.board, {});
    const seen = board.find((a: any) => a._id === w.chen);
    expect(seen?.pickupTime).toBe(pickup);
    expect(seen?.guestReportTime).toBe(pickup - 30 * 60_000);
  });
});

describe("re-protection voids the acknowledgment", () => {
  test("carrier change → reconfirm_required, pickup time void, flight detached; strip side re-acks", async () => {
    const t = convexTest(schema, modules);
    const w = await world(t);
    await t.mutation(api.flights.scheduleArrival, { arrivalId: w.chen, flightId: w.flight });
    await t.mutation(api.airstrip.acknowledge, { arrivalId: w.chen });

    const newTime = Date.now() + 5 * 3600_000;
    await t.mutation(api.airstrip.reprotect, {
      arrivalId: w.chen, carrierName: "Safarilink", carrierOpsContact: "+254709786000",
      airstripName: "Loisaba", scheduledTime: newTime, reason: "5Y-BMF tech stop",
    });

    const a = await t.run((ctx) => ctx.db.get(w.chen));
    expect(a?.status).toBe("reconfirm_required");
    expect(a?.confirmedPickupTime).toBeUndefined();
    expect(a?.carrierName).toBe("Safarilink");
    expect(a?.reprotectCount).toBe(1);
    expect(a?.flightId).toBeUndefined(); // left the org's aircraft
    expect(a?.destinationLabel).toBe("Loisaba");

    // Both sides were re-notified.
    await t.finishInProgressScheduledFunctions();
    const notifs = await t.query(api.notifications.list, { app: "air" });
    expect(notifs.some((n: any) => n.kind === "reprotect")).toBe(true);

    // The strip side re-acknowledges → a `reconfirm` acknowledgment.
    await t.mutation(api.airstrip.acknowledge, { arrivalId: w.chen, pickupTime: newTime });
    const acks = await t.run((ctx) =>
      ctx.db.query("acknowledgments").withIndex("by_arrival", (q) => q.eq("arrivalId", w.chen)).collect(),
    );
    expect(acks).toHaveLength(2);
    expect(acks[1]?.type).toBe("reconfirm");
    const after = await t.run((ctx) => ctx.db.get(w.chen));
    expect(after?.status).toBe("acknowledged");
  });
});

describe("escalation targets the assigned side", () => {
  test("an unacknowledged arrival escalates and alerts the strip side's desk + the lodge", async () => {
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
    const escalations = notifs.filter((n: any) => n.kind === "escalation");
    expect(escalations.length).toBeGreaterThan(0);
    // Chen is assigned to the airstrip side: its ops desk is alerted.
    expect(escalations.some((n: any) => n.toPhone === "+254700000001")).toBe(true);
  });

  test("an acknowledged movement is NOT escalated", async () => {
    const t = convexTest(schema, modules);
    const w = await world(t);
    await t.mutation(api.flights.scheduleArrival, { arrivalId: w.chen, flightId: w.flight });
    await t.mutation(api.airstrip.acknowledge, { arrivalId: w.chen });
    await t.run(async (ctx) => ctx.db.patch(w.chen, { escalationDeadline: Date.now() - 1000 }));
    const res = await t.mutation(internal.escalation.sweep, {});
    expect(res.escalated).toBe(0);
  });

  test("a re-protected movement left unconfirmed escalates too", async () => {
    const t = convexTest(schema, modules);
    const w = await world(t);
    await t.mutation(api.flights.scheduleArrival, { arrivalId: w.chen, flightId: w.flight });
    await t.mutation(api.airstrip.acknowledge, { arrivalId: w.chen });
    await t.mutation(api.airstrip.reprotect, { arrivalId: w.chen, scheduledTime: Date.now() + 3600_000 });
    await t.run(async (ctx) => ctx.db.patch(w.chen, { escalationDeadline: Date.now() - 1000 }));
    const res = await t.mutation(internal.escalation.sweep, {});
    expect(res.escalated).toBe(1);
  });
});

describe("execution signals on the shared record", () => {
  test("landed (airstrip) → dispatched → collected (lodge) completes the movement", async () => {
    const t = convexTest(schema, modules);
    const w = await world(t);
    await t.mutation(api.flights.scheduleArrival, { arrivalId: w.chen, flightId: w.flight });
    await t.mutation(api.airstrip.acknowledge, { arrivalId: w.chen });

    await t.mutation(api.airstrip.markLanded, { arrivalId: w.chen });
    let a = await t.run((ctx) => ctx.db.get(w.chen));
    expect(a?.landedAt).toBeDefined();
    expect(a?.status).toBe("in_transit");

    await t.mutation(api.arrivals.markDispatched, { arrivalId: w.chen });
    await t.mutation(api.arrivals.markCollected, { arrivalId: w.chen });
    a = await t.run((ctx) => ctx.db.get(w.chen));
    expect(a?.dispatchedAt).toBeDefined();
    expect(a?.collectedAt).toBeDefined();
    expect(a?.status).toBe("completed");
  });

  test("the strip condition flows onto the lodge board", async () => {
    const t = convexTest(schema, modules);
    const w = await world(t);
    const stripId = await t.run(async (ctx) =>
      (await ctx.db.query("airstrips").withIndex("by_name", (q) => q.eq("name", "Ol Kiombo")).first())!._id,
    );
    await t.mutation(api.airstrip.setCondition, { airstripId: stripId, condition: "waterlogged", note: "4x4 only" });
    const board = await t.query(api.arrivals.board, {});
    const chen = board.find((a: any) => a._id === w.chen);
    expect(chen?.stripCondition?.condition).toBe("waterlogged");
    // Lodges using the strip get a heads-up (none linked via propertyAirstrips
    // in this world, so just assert the strip record updated).
    const strip = await t.run((ctx) => ctx.db.get(stripId));
    expect(strip?.condition).toBe("waterlogged");
  });
});

describe("tenant isolation", () => {
  test("the property app cannot touch another property's movement", async () => {
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
