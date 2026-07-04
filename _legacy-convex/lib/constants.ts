// Escalation window: minutes before scheduled_time that an unacknowledged
// movement escalates. Sourced from env (Convex dashboard), default 120 min per
// the locked decision in claude-brain.
export function escalationWindowMs(): number {
  const minutes = Number(process.env.ESCALATION_WINDOW_MINUTES ?? "120");
  const safe = Number.isFinite(minutes) && minutes > 0 ? minutes : 120;
  return safe * 60 * 1000;
}
