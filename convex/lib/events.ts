import type { MutationCtx } from "../_generated/server";
import type { Id } from "../_generated/dataModel";
import type { Infer } from "convex/values";
import { eventType } from "../schema";

type EventType = Infer<typeof eventType>;

export function newCorrelationId(): string {
  return crypto.randomUUID();
}

export async function recordEvent(
  ctx: MutationCtx,
  args: {
    correlationId: string;
    propertyId: Id<"properties">;
    airlineId?: Id<"airlines">;
    type: EventType;
    summary: string;
    arrivalId?: Id<"arrivalEvents">;
    byUserId?: Id<"users">;
    meta?: unknown;
  },
): Promise<void> {
  await ctx.db.insert("transferEvents", {
    correlationId: args.correlationId,
    arrivalId: args.arrivalId,
    propertyId: args.propertyId,
    airlineId: args.airlineId,
    type: args.type,
    at: Date.now(),
    byUserId: args.byUserId,
    summary: args.summary,
    meta: args.meta,
  });
}
