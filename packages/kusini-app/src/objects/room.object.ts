import { defineObject, FieldType } from "twenty-sdk/define";

export const ROOM_UNIVERSAL_IDENTIFIER =
  "5e0a2b4c-7d9f-4e1a-b13c-5d6e7f8a9b0c";

export default defineObject({
  universalIdentifier: ROOM_UNIVERSAL_IDENTIFIER,
  nameSingular: "room",
  namePlural: "rooms",
  labelSingular: "Room",
  labelPlural: "Rooms",
  description: "Property inventory with housekeeping readiness.",
  icon: "IconBed",
  labelIdentifierFieldMetadataUniversalIdentifier: "5e0a2b4c-0001-4e1a-b13c-5d6e7f8a9b0c",
  fields: [
    {
      universalIdentifier: "5e0a2b4c-0001-4e1a-b13c-5d6e7f8a9b0c",
      type: FieldType.TEXT,
      name: "name",
      label: "Room",
      icon: "IconBed",
      isNullable: true,
      defaultValue: null,
    },
    {
      universalIdentifier: "5e0a2b4c-0002-4e1a-b13c-5d6e7f8a9b0c",
      type: FieldType.SELECT,
      name: "type",
      label: "Type",
      icon: "IconCategory",
      defaultValue: "'tented_suite'",
      options: [
        { id: "5e0a2b4c-0102-4e1a-b13c-5d6e7f8a9b0c", value: "tented_suite", label: "Tented suite", position: 0, color: "green" },
        { id: "5e0a2b4c-0202-4e1a-b13c-5d6e7f8a9b0c", value: "family_unit", label: "Family unit", position: 1, color: "blue" },
        { id: "5e0a2b4c-0302-4e1a-b13c-5d6e7f8a9b0c", value: "honeymoon", label: "Honeymoon", position: 2, color: "pink" },
        { id: "5e0a2b4c-0402-4e1a-b13c-5d6e7f8a9b0c", value: "standard", label: "Standard", position: 3, color: "gray" },
        { id: "5e0a2b4c-0502-4e1a-b13c-5d6e7f8a9b0c", value: "suite", label: "Suite", position: 4, color: "purple" },
        { id: "5e0a2b4c-0602-4e1a-b13c-5d6e7f8a9b0c", value: "villa", label: "Villa", position: 5, color: "orange" },
      ],
    },
    {
      universalIdentifier: "5e0a2b4c-0003-4e1a-b13c-5d6e7f8a9b0c",
      type: FieldType.NUMBER,
      name: "capacity",
      label: "Sleeps",
      icon: "IconUsers",
      isNullable: true,
      defaultValue: null,
    },
    {
      universalIdentifier: "5e0a2b4c-0004-4e1a-b13c-5d6e7f8a9b0c",
      type: FieldType.SELECT,
      name: "housekeepingStatus",
      label: "Housekeeping",
      icon: "IconSparkles",
      defaultValue: "'clean'",
      options: [
        { id: "5e0a2b4c-0104-4e1a-b13c-5d6e7f8a9b0c", value: "clean", label: "Clean", position: 0, color: "green" },
        { id: "5e0a2b4c-0204-4e1a-b13c-5d6e7f8a9b0c", value: "dirty", label: "Dirty", position: 1, color: "red" },
        { id: "5e0a2b4c-0304-4e1a-b13c-5d6e7f8a9b0c", value: "being_serviced", label: "Being serviced", position: 2, color: "orange" },
        { id: "5e0a2b4c-0404-4e1a-b13c-5d6e7f8a9b0c", value: "inspected", label: "Inspected", position: 3, color: "green" },
        { id: "5e0a2b4c-0504-4e1a-b13c-5d6e7f8a9b0c", value: "out_of_order", label: "Out of order", position: 4, color: "gray" },
      ],
    },
  ],
});
