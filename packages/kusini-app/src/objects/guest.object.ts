import { defineObject, FieldType } from "twenty-sdk/define";

export const GUEST_UNIVERSAL_IDENTIFIER =
  "3c8e0f2a-5b7d-4c9e-9f1a-3b4c5d6e7f8a";
export const GUEST_NAME_FIELD_ID = "3c8e0f2a-0001-4c9e-9f1a-3b4c5d6e7f8a";

export default defineObject({
  universalIdentifier: GUEST_UNIVERSAL_IDENTIFIER,
  nameSingular: "guest",
  namePlural: "guests",
  labelSingular: "Guest",
  labelPlural: "Guests",
  description: "An individual traveller on a booking — types, dietaries and requirements.",
  icon: "IconUsers",
  labelIdentifierFieldMetadataUniversalIdentifier: GUEST_NAME_FIELD_ID,
  fields: [
    {
      universalIdentifier: GUEST_NAME_FIELD_ID,
      type: FieldType.FULL_NAME,
      name: "name",
      label: "Name",
      icon: "IconUser",
      isNullable: false,
      defaultValue: null,
    },
    {
      universalIdentifier: "3c8e0f2a-0002-4c9e-9f1a-3b4c5d6e7f8a",
      type: FieldType.SELECT,
      name: "guestType",
      label: "Type",
      icon: "IconUserCircle",
      defaultValue: "'adult'",
      options: [
        { id: "3c8e0f2a-0102-4c9e-9f1a-3b4c5d6e7f8a", value: "adult", label: "Adult", position: 0, color: "blue" },
        { id: "3c8e0f2a-0202-4c9e-9f1a-3b4c5d6e7f8a", value: "teen", label: "Teen", position: 1, color: "sky" },
        { id: "3c8e0f2a-0302-4c9e-9f1a-3b4c5d6e7f8a", value: "child", label: "Child", position: 2, color: "turquoise" },
        { id: "3c8e0f2a-0402-4c9e-9f1a-3b4c5d6e7f8a", value: "infant", label: "Infant", position: 3, color: "green" },
      ],
    },
    {
      universalIdentifier: "3c8e0f2a-0003-4c9e-9f1a-3b4c5d6e7f8a",
      type: FieldType.NUMBER,
      name: "age",
      label: "Age",
      icon: "IconNumber",
      isNullable: true,
      defaultValue: null,
    },
    {
      universalIdentifier: "3c8e0f2a-0004-4c9e-9f1a-3b4c5d6e7f8a",
      type: FieldType.BOOLEAN,
      name: "isLead",
      label: "Party lead",
      icon: "IconStar",
      isNullable: false,
      defaultValue: false,
    },
  ],
});
