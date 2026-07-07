// Queue an SMS onto the notifications log and hand it to the async deliverer.
// State changes never call a provider inline — this is the (pilot-scale) outbox.
import { internal } from "../_generated/api";
import type { MutationCtx } from "../_generated/server";
import type { Id } from "../_generated/dataModel";
import type { Infer } from "convex/values";
import { notifyKind } from "../schema";

export async function queueSms(
  ctx: MutationCtx,
  args: {
    toPhone: string;
    toUserId?: Id<"users">;
    arrivalId?: Id<"arrivalEvents">;
    propertyId?: Id<"properties">;
    airlineId?: Id<"airlines">;
    kind: Infer<typeof notifyKind>;
    body: string;
    correlationId?: string;
  },
): Promise<void> {
  const id = await ctx.db.insert("notifications", {
    at: Date.now(),
    channel: "sms",
    status: "pending",
    toPhone: args.toPhone,
    toUserId: args.toUserId,
    arrivalId: args.arrivalId,
    propertyId: args.propertyId,
    airlineId: args.airlineId,
    kind: args.kind,
    body: args.body,
    delivered: false,
    attempts: 0,
    correlationId: args.correlationId,
  });
  await ctx.scheduler.runAfter(0, internal.notifications.deliver, { id });
}
