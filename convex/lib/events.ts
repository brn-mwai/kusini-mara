// ─────────────────────────────────────────────────────────────────────────────
// Audit spine. Every state change calls recordEvent, which appends one row to
// transferEvents carrying the movement's correlation_id. The event log — not
// any single mutable row — is the source of truth for what happened and when.
// ─────────────────────────────────────────────────────────────────────────────
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
    lodgeId: Id<"organizations">;
    airlineId: Id<"organizations">;
    type: EventType;
    summary: string;
    movementId?: Id<"movements">;
    byUserId?: Id<"users">;
    meta?: unknown;
  },
): Promise<void> {
  await ctx.db.insert("transferEvents", {
    correlationId: args.correlationId,
    movementId: args.movementId,
    lodgeId: args.lodgeId,
    airlineId: args.airlineId,
    type: args.type,
    at: Date.now(),
    byUserId: args.byUserId,
    summary: args.summary,
    meta: args.meta,
  });
}
