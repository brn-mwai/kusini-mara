import { convexTest } from "convex-test";
import { describe, expect, test } from "vitest";
import schema from "../convex/schema";
import { api, internal } from "../convex/_generated/api";

const modules = import.meta.glob("../convex/**/*.ts");

// Demo posture: the Lodge app acts as the first seed lodge (Riverbend), the Air
// app as the first seed airline (Mara Wings). A second lodge (Acacia) lets us
// prove the cross-tenant guard still holds.
async function world(t: ReturnType<typeof convexTest>) {
  return await t.run(async (ctx) => {
    const airline = await ctx.db.insert("organizations", {
      type: "airline", name: "Mara Wings", shortCode: "MW", opsPhone: "+254700000001",
    });
    const riverbend = await ctx.db.insert("organizations", {
      type: "lodge", name: "Riverbend", shortCode: "R",
    });
    const acacia = await ctx.db.insert("organizations", {
      type: "lodge", name: "Acacia", shortCode: "AC",
    });
    const backup = await ctx.db.insert("users", {
      orgId: riverbend, tokenIdentifier: "seed|backup", name: "Backup", role: "backup", phone: "+254701233880",
    });
    await ctx.db.patch(riverbend, { backupContactId: backup });
    await ctx.db.insert("users", { orgId: airline, tokenIdentifier: "seed|ops", name: "Ops", role: "ops" });
    await ctx.db.insert("users", { orgId: riverbend, tokenIdentifier: "seed|duty", name: "Duty", role: "duty_contact" });
    await ctx.db.insert("users", { orgId: acacia, tokenIdentifier: "seed|ac", name: "AcDuty", role: "duty_contact" });
    for (const l of [riverbend, acacia]) {
      await ctx.db.insert("airlineLodgeLinks", { airlineId: airline, lodgeId: l });
    }
    const mk = async (lodge: typeof riverbend, guest: string) => {
      const booking = await ctx.db.insert("bookings", {
        lodgeId: lodge, guest, pax: 2, externalRef: "RR-" + guest, arrivalDate: Date.now(),
        departureDate: Date.now(), arrivalAirstrip: "Ol Kiombo", departureAirstrip: "Ol Kiombo",
      });
      return await ctx.db.insert("movements", {
        bookingId: booking, direction: "arrival", lodgeId: lodge, airlineId: airline,
        airstrip: "Ol Kiombo", guestName: guest, pax: 2, special: [],
        scheduledTime: Date.now() + 3 * 3600_000, status: "requested",
        reconfirmRequested: false, correlationId: "corr-" + guest,
      });
    };
    const chen = await mk(riverbend, "Chen");
    const brandt = await mk(acacia, "Brandt"); // belongs to the OTHER lodge
    const flight = await ctx.db.insert("flights", {
      airlineId: airline, code: "F-101", aircraftReg: "5Y-BMF", pilotName: "A. Mwangi",
      departTime: Date.now() + 2 * 3600_000, base: "Wilson", status: "planned",
    });
    return { airline, riverbend, acacia, chen, brandt, flight };
  });
}

describe("schedule → acknowledge → escalate loop (demo, no auth)", () => {
  test("air schedules, lodge sees it, lodge acks, air sees the ack", async () => {
    const t = convexTest(schema, modules);
    const w = await world(t);

    await t.mutation(api.flights.scheduleMovement, { movementId: w.chen, flightId: w.flight });

    const board = await t.query(api.movements.board, {});
    const seen = board.find((m: any) => m._id === w.chen);
    expect(seen?.status).toBe("scheduled");
    expect(seen?.flight?.code).toBe("F-101");

    await t.mutation(api.movements.acknowledge, { movementId: w.chen });

    const flights = await t.query(api.flights.board, {});
    const f = flights.find((x: any) => x._id === w.flight);
    expect(f?.ackCount).toBe(1);
  });

  test("escalation fires for a scheduled, unacknowledged movement past deadline", async () => {
    const t = convexTest(schema, modules);
    const w = await world(t);
    await t.mutation(api.flights.scheduleMovement, { movementId: w.chen, flightId: w.flight });
    await t.run(async (ctx) => ctx.db.patch(w.chen, { escalationDeadline: Date.now() - 1000 }));

    const res = await t.mutation(internal.escalation.sweep, {});
    expect(res.escalated).toBe(1);
    const m = await t.run((ctx) => ctx.db.get(w.chen));
    expect(m?.status).toBe("escalated");

    await t.finishInProgressScheduledFunctions();
    const notifs = await t.query(api.notifications.list, { app: "lodge" });
    expect(notifs.some((n: any) => n.kind === "escalation")).toBe(true);
  });

  test("acknowledged movement is NOT escalated", async () => {
    const t = convexTest(schema, modules);
    const w = await world(t);
    await t.mutation(api.flights.scheduleMovement, { movementId: w.chen, flightId: w.flight });
    await t.mutation(api.movements.acknowledge, { movementId: w.chen });
    await t.run(async (ctx) => ctx.db.patch(w.chen, { escalationDeadline: Date.now() - 1000 }));
    const res = await t.mutation(internal.escalation.sweep, {});
    expect(res.escalated).toBe(0);
  });
});

describe("tenant isolation (the Lodge app cannot touch another lodge's movement)", () => {
  test("acknowledging the other lodge's movement is rejected", async () => {
    const t = convexTest(schema, modules);
    const w = await world(t);
    await t.mutation(api.flights.scheduleMovement, { movementId: w.brandt, flightId: w.flight });
    // The Lodge app resolves to Riverbend; Brandt's movement belongs to Acacia.
    await expect(
      t.mutation(api.movements.acknowledge, { movementId: w.brandt }),
    ).rejects.toThrow();
    // And it never appears on Riverbend's board.
    const board = await t.query(api.movements.board, {});
    expect(board.find((m: any) => m._id === w.brandt)).toBeUndefined();
  });
});
