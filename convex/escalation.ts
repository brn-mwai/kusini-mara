import { v } from "convex/values";
import { internalMutation } from "./_generated/server";
import { recordEvent } from "./lib/events";
import { queueSms } from "./lib/notify";
import { assignedSide, hhmm, effectivePickupTime } from "./lib/handshake";
import type { Doc } from "./_generated/dataModel";

// Sweep: any movement still awaiting the assigned side's acknowledgment
// (posted, or re-opened by a retime/re-protection) past its escalation deadline
// is escalated. Silence on either side triggers action: SMS goes to the
// assigned side's backup AND the poster, per the spec's symmetric handshake.
// Runs every minute via crons; idempotent.
export const sweep = internalMutation({
  args: {},
  returns: v.object({ escalated: v.number() }),
  handler: async (ctx) => {
    const now = Date.now();
    const due: Doc<"arrivalEvents">[] = [];
    for (const status of ["scheduled", "reconfirm_required"] as const) {
      const rows = await ctx.db
        .query("arrivalEvents")
        .withIndex("by_status_deadline", (q) =>
          q.eq("status", status).lte("escalationDeadline", now),
        )
        .collect();
      due.push(...rows.filter((a) => a.escalationDeadline !== undefined));
    }

    let escalated = 0;
    for (const a of due) {
      const side = assignedSide(a);
      await ctx.db.patch(a._id, { status: "escalated", escalatedAt: now });
      await recordEvent(ctx, {
        correlationId: a.correlationId,
        propertyId: a.propertyId,
        airlineId: a.airlineId,
        type: "escalation_fired",
        summary: `Unacknowledged by the ${side} side within window — escalated for ${a.guestName} (${a.mode} ${a.direction}) at ${a.destinationLabel}`,
        arrivalId: a._id,
      });

      const property = await ctx.db.get(a.propertyId);
      const airline = a.airlineId ? await ctx.db.get(a.airlineId) : null;
      const body = `KUSINI ESCALATION: ${a.guestName} (${a.pax} pax) ${a.direction} at ${a.destinationLabel}, pickup ${hhmm(effectivePickupTime(a))}, is unacknowledged by the ${side} side inside the transfer window. Please confirm now.`;

      const send = async (
        toPhone: string | undefined,
        toUserId?: Doc<"users">["_id"],
      ) => {
        if (!toPhone) return;
        await queueSms(ctx, {
          toPhone,
          toUserId,
          arrivalId: a._id,
          propertyId: a.propertyId,
          airlineId: a.airlineId,
          kind: "escalation",
          body,
          correlationId: a.correlationId,
        });
      };

      const backupId = property?.backupContactId;
      const backup = backupId ? await ctx.db.get(backupId) : null;
      const dutyId = property?.dutyContactId;
      const duty = dutyId ? await ctx.db.get(dutyId) : null;
      const stripPhone =
        airline?.opsPhone ?? process.env.ESCALATION_AIRLINE_OPS_PHONE;

      const lodgeContact = duty?.phoneE164 ? duty : backup;
      if (side === "airstrip") {
        // The strip side went silent: alert its ops desk (demo proxy for the
        // handler's backup) and the posting lodge.
        await send(stripPhone);
        await send(lodgeContact?.phoneE164, lodgeContact?._id);
      } else {
        // The lodge side went silent: alert its backup contact and the poster's
        // side (air ops, or the property's own ops line for ground modes).
        await send(backup?.phoneE164 ?? property?.opsPhone, backup?._id);
        await send(stripPhone ?? property?.opsPhone);
      }
      escalated++;
    }
    return { escalated };
  },
});
