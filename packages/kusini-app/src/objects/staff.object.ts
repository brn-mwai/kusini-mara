import { defineObject, FieldType } from "twenty-sdk/define";

export const STAFF_UNIVERSAL_IDENTIFIER =
  "4d9f1a3b-6c8e-4d0f-a02b-4c5d6e7f8a9b";

export default defineObject({
  universalIdentifier: STAFF_UNIVERSAL_IDENTIFIER,
  nameSingular: "staff",
  namePlural: "staff",
  labelSingular: "Staff",
  labelPlural: "Staff",
  description: "Lodge people — duty and leave roster.",
  icon: "IconUsersGroup",
  labelIdentifierFieldMetadataUniversalIdentifier: "4d9f1a3b-0001-4d0f-a02b-4c5d6e7f8a9b",
  fields: [
    {
      universalIdentifier: "4d9f1a3b-0001-4d0f-a02b-4c5d6e7f8a9b",
      type: FieldType.FULL_NAME,
      name: "name",
      label: "Name",
      icon: "IconUser",
      isNullable: true,
      defaultValue: null,
    },
    {
      universalIdentifier: "4d9f1a3b-0002-4d0f-a02b-4c5d6e7f8a9b",
      type: FieldType.SELECT,
      name: "role",
      label: "Role",
      icon: "IconBriefcase",
      defaultValue: "'guide'",
      options: [
        { id: "4d9f1a3b-0102-4d0f-a02b-4c5d6e7f8a9b", value: "guide", label: "Guide", position: 0, color: "blue" },
        { id: "4d9f1a3b-0202-4d0f-a02b-4c5d6e7f8a9b", value: "driver", label: "Driver", position: 1, color: "green" },
        { id: "4d9f1a3b-0302-4d0f-a02b-4c5d6e7f8a9b", value: "porter", label: "Porter", position: 2, color: "yellow" },
        { id: "4d9f1a3b-0402-4d0f-a02b-4c5d6e7f8a9b", value: "front_desk", label: "Front desk", position: 3, color: "purple" },
        { id: "4d9f1a3b-0502-4d0f-a02b-4c5d6e7f8a9b", value: "housekeeping", label: "Housekeeping", position: 4, color: "pink" },
      ],
    },
    {
      universalIdentifier: "4d9f1a3b-0003-4d0f-a02b-4c5d6e7f8a9b",
      type: FieldType.PHONES,
      name: "phones",
      label: "Phone",
      icon: "IconPhone",
      isNullable: true,
      defaultValue: null,
    },
    {
      universalIdentifier: "4d9f1a3b-0004-4d0f-a02b-4c5d6e7f8a9b",
      type: FieldType.NUMBER,
      name: "allowedLeaveDays",
      label: "Leave days",
      icon: "IconSunOff",
      isNullable: true,
      defaultValue: null,
    },
    {
      universalIdentifier: "4d9f1a3b-0005-4d0f-a02b-4c5d6e7f8a9b",
      type: FieldType.BOOLEAN,
      name: "active",
      label: "Active",
      icon: "IconToggleRight",
      isNullable: false,
      defaultValue: false,
    },
  ],
});
