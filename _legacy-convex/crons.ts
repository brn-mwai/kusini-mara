import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Sweep for unacknowledged movements crossing their escalation window. Low
// domain volume — once a minute is ample and cheap.
crons.interval(
  "escalation sweep",
  { minutes: 1 },
  internal.escalation.sweep,
  {},
);

export default crons;
