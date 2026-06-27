// Shared formatters ported from the prototypes. Times are ms epoch; the board
// renders clock times + countdowns in IBM Plex Mono.
export const fmt = {
  hhmm(ms: number): string {
    const d = new Date(ms);
    const h = d.getHours();
    const m = d.getMinutes();
    return `${h < 10 ? "0" : ""}${h}:${m < 10 ? "0" : ""}${m}`;
  },

  // "by 1h 20m" / "1h 20m overdue" relative to now.
  countdown(targetMs: number, nowMs: number = Date.now()): { text: string; overdue: boolean } {
    let s = Math.round((targetMs - nowMs) / 1000);
    const overdue = s < 0;
    s = Math.abs(s);
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const t = `${h > 0 ? h + "h " : ""}${m}m`;
    return { text: overdue ? `${t} overdue` : `in ${t}`, overdue };
  },

  initials(name: string): string {
    return name
      .replace(/[^A-Za-z. ]/g, "")
      .split(/[ .]+/)
      .filter(Boolean)
      .map((w) => w[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  },

  dayLabel(targetMs: number, nowMs: number = Date.now()): string {
    const a = new Date(targetMs);
    a.setHours(0, 0, 0, 0);
    const b = new Date(nowMs);
    b.setHours(0, 0, 0, 0);
    const d = Math.round((a.getTime() - b.getTime()) / 86400000);
    return d === 0 ? "Today" : d < 0 ? `${-d}d ago` : `in ${d}d`;
  },

  isToday(targetMs: number, nowMs: number = Date.now()): boolean {
    const a = new Date(targetMs);
    const b = new Date(nowMs);
    return (
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate()
    );
  },
};
