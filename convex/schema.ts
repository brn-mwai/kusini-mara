import { defineSchema } from "convex/server";

import { foundationTables } from "./schema.master.foundation";
import { opsTables } from "./schema.master.ops";

// Kusini master schema — composed from the two authored groups.
// Foundation (A-D): identity, lodge hierarchy, fleet, coordination spine.
// Ops (E-K + Calendar + Group L): duty, PMS, leave, messaging, security/DPA,
// plumbing, read-models, notes/broadcasts/workflows. See KUSINI-SCHEMA.md.
export default defineSchema({
  ...foundationTables,
  ...opsTables,
});
