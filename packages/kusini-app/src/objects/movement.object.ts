import { defineObject, FieldType } from "twenty-sdk/define";

export const MOVEMENT_UNIVERSAL_IDENTIFIER =
  "8f4c1a2b-3d5e-4f6a-9b8c-1d2e3f4a5b6c";
export const MOVEMENT_GUEST_NAME_FIELD_ID =
  "8f4c1a2b-0001-4f6a-9b8c-1d2e3f4a5b6c";

export default defineObject({
  universalIdentifier: MOVEMENT_UNIVERSAL_IDENTIFIER,
  nameSingular: "movement",
  namePlural: "movements",
  labelSingular: "Movement",
  labelPlural: "Movements",
  description:
    "A guest transfer (arrival or departure) — the unit the lodge acknowledges and the airline schedules.",
  icon: "IconPlaneTilt",
  labelIdentifierFieldMetadataUniversalIdentifier: MOVEMENT_GUEST_NAME_FIELD_ID,
  fields: [
    {
      universalIdentifier: MOVEMENT_GUEST_NAME_FIELD_ID,
      type: FieldType.TEXT,
      name: "guestName",
      label: "Guest",
      icon: "IconUser",
      isNullable: false,
      defaultValue: "''",
    },
    {
      universalIdentifier: "8f4c1a2b-0002-4f6a-9b8c-1d2e3f4a5b6c",
      type: FieldType.NUMBER,
      name: "partySize",
      label: "Pax",
      icon: "IconUsers",
      isNullable: false,
      defaultValue: 1,
    },
    {
      universalIdentifier: "8f4c1a2b-0003-4f6a-9b8c-1d2e3f4a5b6c",
      type: FieldType.SELECT,
      name: "direction",
      label: "Direction",
      icon: "IconArrowsUpDown",
      defaultValue: "'arrival'",
      options: [
        { id: "8f4c1a2b-0103-4f6a-9b8c-1d2e3f4a5b6c", value: "arrival", label: "Arrival (dropping)", position: 0, color: "blue" },
        { id: "8f4c1a2b-0203-4f6a-9b8c-1d2e3f4a5b6c", value: "departure", label: "Departure (picking)", position: 1, color: "purple" },
      ],
    },
    {
      universalIdentifier: "8f4c1a2b-0004-4f6a-9b8c-1d2e3f4a5b6c",
      type: FieldType.SELECT,
      name: "mode",
      label: "Mode",
      icon: "IconPlaneTilt",
      defaultValue: "'charter'",
      options: [
        { id: "8f4c1a2b-0104-4f6a-9b8c-1d2e3f4a5b6c", value: "charter", label: "Charter", position: 0, color: "blue" },
        { id: "8f4c1a2b-0204-4f6a-9b8c-1d2e3f4a5b6c", value: "scheduled_flight", label: "Scheduled flight", position: 1, color: "sky" },
        { id: "8f4c1a2b-0304-4f6a-9b8c-1d2e3f4a5b6c", value: "helicopter", label: "Helicopter", position: 2, color: "turquoise" },
        { id: "8f4c1a2b-0404-4f6a-9b8c-1d2e3f4a5b6c", value: "road_transfer", label: "Road transfer", position: 3, color: "green" },
        { id: "8f4c1a2b-0504-4f6a-9b8c-1d2e3f4a5b6c", value: "self_drive", label: "Self drive", position: 4, color: "yellow" },
        { id: "8f4c1a2b-0604-4f6a-9b8c-1d2e3f4a5b6c", value: "self_fly", label: "Self fly", position: 5, color: "orange" },
      ],
    },
    {
      universalIdentifier: "8f4c1a2b-0005-4f6a-9b8c-1d2e3f4a5b6c",
      type: FieldType.TEXT,
      name: "carrierName",
      label: "Carrier",
      icon: "IconBuildingSkyscraper",
      isNullable: true,
      defaultValue: null,
    },
    {
      universalIdentifier: "8f4c1a2b-0006-4f6a-9b8c-1d2e3f4a5b6c",
      type: FieldType.DATE_TIME,
      name: "scheduledTime",
      label: "Time",
      icon: "IconCalendarTime",
      isNullable: true,
      defaultValue: null,
    },
    {
      universalIdentifier: "8f4c1a2b-0007-4f6a-9b8c-1d2e3f4a5b6c",
      type: FieldType.SELECT,
      name: "status",
      label: "Status",
      icon: "IconProgressCheck",
      defaultValue: "'posted'",
      options: [
        { id: "8f4c1a2b-0107-4f6a-9b8c-1d2e3f4a5b6c", value: "posted", label: "Needs ack", position: 0, color: "red" },
        { id: "8f4c1a2b-0207-4f6a-9b8c-1d2e3f4a5b6c", value: "scheduled", label: "Needs ack", position: 1, color: "orange" },
        { id: "8f4c1a2b-0307-4f6a-9b8c-1d2e3f4a5b6c", value: "reconfirm_required", label: "Re-confirm", position: 2, color: "red" },
        { id: "8f4c1a2b-0407-4f6a-9b8c-1d2e3f4a5b6c", value: "acknowledged", label: "Acknowledged", position: 3, color: "green" },
        { id: "8f4c1a2b-0507-4f6a-9b8c-1d2e3f4a5b6c", value: "in_transit", label: "In transit", position: 4, color: "blue" },
        { id: "8f4c1a2b-0607-4f6a-9b8c-1d2e3f4a5b6c", value: "arrived", label: "Arrived", position: 5, color: "blue" },
        { id: "8f4c1a2b-0707-4f6a-9b8c-1d2e3f4a5b6c", value: "completed", label: "Completed", position: 6, color: "gray" },
        { id: "8f4c1a2b-0807-4f6a-9b8c-1d2e3f4a5b6c", value: "escalated", label: "Escalated", position: 7, color: "red" },
      ],
    },
    {
      universalIdentifier: "8f4c1a2b-0008-4f6a-9b8c-1d2e3f4a5b6c",
      type: FieldType.TEXT,
      name: "specialNeeds",
      label: "Special needs",
      icon: "IconHeartHandshake",
      isNullable: true,
      defaultValue: null,
    },
  ],
});
