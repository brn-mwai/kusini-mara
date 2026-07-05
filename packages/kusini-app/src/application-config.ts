import { defineApplication } from "twenty-sdk/define";

export const KUSINI_APPLICATION_UNIVERSAL_IDENTIFIER =
  "9b3d5e7f-1a2c-4b6d-8e0f-9a1b2c3d4e5f";

export default defineApplication({
  universalIdentifier: KUSINI_APPLICATION_UNIVERSAL_IDENTIFIER,
  displayName: "Kusini Lodge",
  description:
    "Guest-transfer coordination and lodge operations for remote safari camps — the acknowledgment loop is the product.",
  author: "Kusini",
  websiteUrl: "https://lodge.kusini.app",
});
