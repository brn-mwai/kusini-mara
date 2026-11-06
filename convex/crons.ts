import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

// Two heartbeat-monitored jobs (SYSTEM-DESIGN §9): a silent scanner recreates the
// exact problem Kusini solves, so both run every minute and are watched externally.
const crons = cronJobs();

crons.interval(
  "escalation-sweep",
  { minutes: 1 },
  internal.escalation.sweep,
);

crons.interval(
  "outbox-drain",
  { minutes: 1 },
  internal.outbox.drain,
);

crons.interval(
  "outbox-requeue-stuck",
  { minutes: 5 },
  internal.outbox.requeueStuck,
);

export default crons;
