// Portable ULID — sortable, app-generated primary key (§1 of KUSINI-SCHEMA.md).
// Convex mutations may use Date.now()/Math.random() (snapshotted for replay).
const ENCODING = "0123456789ABCDEFGHJKMNPQRSTVWXYZ"; // Crockford base32

export function ulid(now: number = Date.now()): string {
  let ts = now;
  let time = "";
  for (let i = 0; i < 10; i++) {
    time = ENCODING[ts % 32] + time;
    ts = Math.floor(ts / 32);
  }
  let rand = "";
  for (let i = 0; i < 16; i++) {
    rand += ENCODING[Math.floor(Math.random() * 32)];
  }
  return time + rand;
}
