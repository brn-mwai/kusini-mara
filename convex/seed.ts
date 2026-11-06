import { mutation } from "./_generated/server";
import { ulid } from "./lib/ids";

const SEEDED_TABLES = [
  "organizations",
  "properties",
  "users",
  "airstrips",
  "airstripContacts",
  "propertyAirstrips",
  "staff",
  "vehicles",
  "rooms",
  "arrivalEvents",
  "acknowledgments",
  "transferEvents",
  "bookings",
  "guests",
  "guestRequirements",
  "stays",
  "dutyAssignments",
  "leaveRequests",
  "leavePlan",
  "coverageRules",
  "staffLists",
  "staffListMembers",
  "broadcasts",
  "messageThreads",
  "notifications",
  "messageOutbox",
  "inboundMessages",
  "webhookDedupe",
  "printJobs",
] as const;

export const reset = mutation({
  args: {},
  handler: async (ctx) => {
    for (const t of SEEDED_TABLES) {
      const docs = await ctx.db.query(t).collect();
      for (const d of docs) await ctx.db.delete(d._id);
    }
    return { cleared: SEEDED_TABLES.length };
  },
});

export const run = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const hour = 3600_000;

    const operatorId = ulid();
    await ctx.db.insert("organizations", {
      id: operatorId,
      kind: "lodge_operator",
      name: "Mara Collection",
      createdAt: now,
      updatedAt: now,
    });

    const propertyId = ulid();
    const propDocId = await ctx.db.insert("properties", {
      id: propertyId,
      operatorId,
      name: "Riverbend Camp",
      region: "maasai_mara",
      escalationWindowMinutes: 120,
      defaultReportOffsetMinutes: 30,
      carryoverPolicy: "carry_capped",
      timezone: "Africa/Nairobi",
      createdAt: now,
      updatedAt: now,
    });

    const userId = ulid();
    await ctx.db.insert("users", {
      id: userId,
      clerkUserId: `demo-${userId}`,
      organizationId: operatorId,
      propertyId,
      name: { firstName: "Grace", lastName: "Nkoitoi" },
      phones: { primaryPhoneNumber: "+254700000001" },
      role: "property_manager",
      active: true,
      createdAt: now,
      updatedAt: now,
    });
    const backupUserId = ulid();
    await ctx.db.insert("users", {
      id: backupUserId,
      clerkUserId: `demo-${backupUserId}`,
      organizationId: operatorId,
      propertyId,
      name: { firstName: "Samuel", lastName: "Ole Kina" },
      phones: { primaryPhoneNumber: "+254700000002" },
      telegramChatId: "demo-backup-chat",
      role: "duty_contact",
      active: true,
      createdAt: now,
      updatedAt: now,
    });
    await ctx.db.patch(propDocId, {
      dutyContactUserId: userId,
      backupContactUserId: backupUserId,
    });

    const airstripId = ulid();
    await ctx.db.insert("airstrips", {
      id: airstripId,
      name: "Ol Kiombo",
      code: "HKOK",
      region: "maasai_mara",
      surface: "murram",
      daylightOnly: true,
      fuelAvailable: false,
      condition: "open",
      createdAt: now,
      updatedAt: now,
    });
    await ctx.db.insert("airstripContacts", {
      id: ulid(),
      airstripId,
      name: { firstName: "David", lastName: "Kipeno" },
      role: "handler",
      phones: { primaryPhoneNumber: "+254700000020" },
      telegramChatId: "demo-handler-chat",
      isPrimary: true,
      active: true,
      createdAt: now,
      updatedAt: now,
    });
    await ctx.db.insert("propertyAirstrips", {
      id: ulid(),
      propertyId,
      airstripId,
      isPrimary: true,
      transferTimeMinutes: 25,
      notifyStripOnArrival: true,
    });

    const staff = [
      { first: "Joseph", last: "Sankale", role: "driver" as const, phone: "+254700000010" },
      { first: "Mary", last: "Wanjiru", role: "guide" as const, phone: "+254700000011" },
      { first: "Peter", last: "Kimani", role: "porter" as const, phone: "+254700000012" },
    ];
    for (const s of staff) {
      await ctx.db.insert("staff", {
        id: ulid(),
        propertyId,
        operatorId,
        name: { firstName: s.first, lastName: s.last },
        phones: { primaryPhoneNumber: s.phone },
        role: s.role,
        certifications: [],
        languages: ["EN", "SW"],
        dailyDutyCap: 3,
        allowedLeaveDays: 21,
        active: true,
        createdAt: now,
        updatedAt: now,
      });
    }

    for (const vObj of [
      { name: "Land Cruiser 1", seats: 6 },
      { name: "Safari Van 1", seats: 8 },
    ]) {
      await ctx.db.insert("vehicles", {
        id: ulid(),
        propertyId,
        name: vObj.name,
        seatCapacity: vObj.seats,
        status: "active",
        createdAt: now,
        updatedAt: now,
      });
    }

    for (const rObj of [
      { name: "Tent 1", type: "tented_suite" as const, cap: 2 },
      { name: "Tent 2", type: "tented_suite" as const, cap: 2 },
      { name: "Family Unit", type: "family_unit" as const, cap: 4 },
    ]) {
      await ctx.db.insert("rooms", {
        id: ulid(),
        propertyId,
        name: rObj.name,
        type: rObj.type,
        capacity: rObj.cap,
        maxAdults: rObj.cap,
        maxChildren: rObj.cap,
        bedConfig: "1 king",
        features: ["ensuite", "view"],
        accessible: false,
        housekeepingStatus: "clean",
        active: true,
        createdAt: now,
        updatedAt: now,
      });
    }

    // today's movements — mixed direction/mode/status
    const movements = [
      { guest: "Mombaerts", pax: 3, dir: "arrival" as const, mode: "charter" as const, carrier: "Safarilink", inHours: 2, status: "posted" as const },
      { guest: "Gross", pax: 1, dir: "arrival" as const, mode: "charter" as const, carrier: "Governors Aviation", inHours: 3, status: "posted" as const },
      { guest: "Lee", pax: 2, dir: "departure" as const, mode: "charter" as const, carrier: "Safarilink", inHours: 5, status: "scheduled" as const },
      { guest: "Hendricks", pax: 4, dir: "arrival" as const, mode: "road_transfer" as const, carrier: null, inHours: 6, status: "acknowledged" as const },
    ];
    for (const m of movements) {
      const scheduledTime = now + m.inHours * hour;
      const assignedToSide = m.dir === "arrival" ? ("airstrip" as const) : ("lodge" as const);
      const settled = m.status === "acknowledged";
      await ctx.db.insert("arrivalEvents", {
        id: ulid(),
        direction: m.dir,
        mode: m.mode,
        destinationPropertyId: propertyId,
        airstripId: m.mode === "charter" ? airstripId : undefined,
        carrierName: m.carrier ?? undefined,
        partySize: m.pax,
        guestNames: [m.guest],
        scheduledTime,
        guestReportOffsetMinutes: 30,
        postedBySide: "lodge",
        assignedToSide,
        proposedPickupTime: scheduledTime + 25 * 60_000,
        confirmedPickupTime: settled ? scheduledTime + 25 * 60_000 : undefined,
        escalationDeadline: settled ? undefined : scheduledTime - 120 * 60_000,
        status: m.status,
        correlationId: ulid(),
        createdByOrgId: operatorId,
        operatorId,
        reprotectCount: 0,
        createdAt: now,
        updatedAt: now,
      });
    }

    // booking with guests + requirements + a stay (the light-PMS spine)
    const today = new Date(now).toISOString().slice(0, 10);
    const inThree = new Date(now + 3 * 86_400_000).toISOString().slice(0, 10);
    const bookingId = ulid();
    await ctx.db.insert("bookings", {
      id: bookingId,
      propertyId,
      operatorId,
      guestName: "Mombaerts",
      partySize: 3,
      source: "manual",
      arrivalDate: today,
      departureDate: inThree,
      createdAt: now,
      updatedAt: now,
    });

    const guestDefs = [
      { first: "Luc", last: "Mombaerts", type: "adult" as const, lead: true },
      { first: "Anna", last: "Mombaerts", type: "adult" as const, lead: false },
      { first: "Elise", last: "Mombaerts", type: "child" as const, lead: false, age: 9 },
    ];
    let leadGuestId = "";
    for (const g of guestDefs) {
      const gid = ulid();
      if (g.lead) leadGuestId = gid;
      await ctx.db.insert("guests", {
        id: gid,
        bookingId,
        propertyId,
        name: { firstName: g.first, lastName: g.last },
        guestType: g.type,
        age: g.age,
        isLead: g.lead,
        createdAt: now,
        updatedAt: now,
      });
    }
    await ctx.db.insert("guestRequirements", {
      id: ulid(),
      guestId: leadGuestId,
      propertyId,
      category: "allergy",
      label: "nut_free",
      severity: "critical",
      notes: "carries EpiPen",
      carriesForward: true,
    });

    await ctx.db.insert("stays", {
      id: ulid(),
      bookingId,
      propertyId,
      plannedCheckIn: today,
      plannedCheckOut: inThree,
      status: "due_in",
      boardBasis: "full_board",
      adults: 2,
      children: 1,
      infants: 0,
      occasion: "none",
      createdAt: now,
      updatedAt: now,
    });

    // coverage rules + staff lists (dynamic by role)
    for (const r of [
      { role: "driver" as const, min: 1 },
      { role: "guide" as const, min: 1 },
    ]) {
      await ctx.db.insert("coverageRules", {
        id: ulid(),
        propertyId,
        role: r.role,
        minStaff: r.min,
        resilienceBuffer: 1,
      });
    }
    for (const l of [
      { name: "Drivers", role: "driver" as const },
      { name: "Guides", role: "guide" as const },
    ]) {
      await ctx.db.insert("staffLists", {
        id: ulid(),
        propertyId,
        name: l.name,
        dynamic: true,
        roleFilter: l.role,
        active: true,
        createdAt: now,
        updatedAt: now,
      });
    }

    return { operatorId, propertyId, staff: staff.length, movements: movements.length };
  },
});
