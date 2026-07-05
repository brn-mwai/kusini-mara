import { defineObject, FieldType } from "twenty-sdk/define";

export const STAY_UNIVERSAL_IDENTIFIER =
  "6f1b3c5d-8e0a-4f2b-c24d-6e7f8a9b0c1d";

export default defineObject({
  universalIdentifier: STAY_UNIVERSAL_IDENTIFIER,
  nameSingular: "stay",
  namePlural: "stays",
  labelSingular: "Stay",
  labelPlural: "Stays",
  description: "The occupancy record — reservation to check-out.",
  icon: "IconDoorEnter",
  labelIdentifierFieldMetadataUniversalIdentifier: "6f1b3c5d-0001-4f2b-c24d-6e7f8a9b0c1d",
  fields: [
    {
      universalIdentifier: "6f1b3c5d-0001-4f2b-c24d-6e7f8a9b0c1d",
      type: FieldType.DATE,
      name: "plannedCheckIn",
      label: "Check-in",
      icon: "IconCalendar",
      isNullable: true,
      defaultValue: null,
    },
    {
      universalIdentifier: "6f1b3c5d-0002-4f2b-c24d-6e7f8a9b0c1d",
      type: FieldType.DATE,
      name: "plannedCheckOut",
      label: "Check-out",
      icon: "IconCalendar",
      isNullable: true,
      defaultValue: null,
    },
    {
      universalIdentifier: "6f1b3c5d-0003-4f2b-c24d-6e7f8a9b0c1d",
      type: FieldType.SELECT,
      name: "status",
      label: "Status",
      icon: "IconProgressCheck",
      defaultValue: "'reserved'",
      options: [
        { id: "6f1b3c5d-0103-4f2b-c24d-6e7f8a9b0c1d", value: "reserved", label: "Reserved", position: 0, color: "gray" },
        { id: "6f1b3c5d-0203-4f2b-c24d-6e7f8a9b0c1d", value: "due_in", label: "Due in", position: 1, color: "orange" },
        { id: "6f1b3c5d-0303-4f2b-c24d-6e7f8a9b0c1d", value: "checked_in", label: "Checked in", position: 2, color: "green" },
        { id: "6f1b3c5d-0403-4f2b-c24d-6e7f8a9b0c1d", value: "in_house", label: "In house", position: 3, color: "green" },
        { id: "6f1b3c5d-0503-4f2b-c24d-6e7f8a9b0c1d", value: "due_out", label: "Due out", position: 4, color: "orange" },
        { id: "6f1b3c5d-0603-4f2b-c24d-6e7f8a9b0c1d", value: "checked_out", label: "Checked out", position: 5, color: "gray" },
        { id: "6f1b3c5d-0703-4f2b-c24d-6e7f8a9b0c1d", value: "no_show", label: "No show", position: 6, color: "red" },
        { id: "6f1b3c5d-0803-4f2b-c24d-6e7f8a9b0c1d", value: "cancelled", label: "Cancelled", position: 7, color: "gray" },
      ],
    },
    {
      universalIdentifier: "6f1b3c5d-0004-4f2b-c24d-6e7f8a9b0c1d",
      type: FieldType.SELECT,
      name: "boardBasis",
      label: "Board",
      icon: "IconToolsKitchen2",
      defaultValue: "'room_only'",
      options: [
        { id: "6f1b3c5d-0104-4f2b-c24d-6e7f8a9b0c1d", value: "room_only", label: "Room only", position: 0, color: "gray" },
        { id: "6f1b3c5d-0204-4f2b-c24d-6e7f8a9b0c1d", value: "bed_and_breakfast", label: "B&B", position: 1, color: "sky" },
        { id: "6f1b3c5d-0304-4f2b-c24d-6e7f8a9b0c1d", value: "half_board", label: "Half board", position: 2, color: "blue" },
        { id: "6f1b3c5d-0404-4f2b-c24d-6e7f8a9b0c1d", value: "full_board", label: "Full board", position: 3, color: "green" },
        { id: "6f1b3c5d-0504-4f2b-c24d-6e7f8a9b0c1d", value: "full_board_plus", label: "Full board+", position: 4, color: "turquoise" },
        { id: "6f1b3c5d-0604-4f2b-c24d-6e7f8a9b0c1d", value: "all_inclusive", label: "All inclusive", position: 5, color: "purple" },
      ],
    },
  ],
});
