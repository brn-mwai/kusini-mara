import { defineObject, FieldType } from "twenty-sdk/define";

export const BOOKING_UNIVERSAL_IDENTIFIER =
  "2b7d9e1f-4a6c-4b8d-8e0f-2a3b4c5d6e7f";
export const BOOKING_GUEST_NAME_FIELD_ID =
  "2b7d9e1f-0001-4b8d-8e0f-2a3b4c5d6e7f";

export default defineObject({
  universalIdentifier: BOOKING_UNIVERSAL_IDENTIFIER,
  nameSingular: "booking",
  namePlural: "bookings",
  labelSingular: "Booking",
  labelPlural: "Bookings",
  description: "The demand feed — each booking spawns its two movements and guests.",
  icon: "IconPlane",
  labelIdentifierFieldMetadataUniversalIdentifier: BOOKING_GUEST_NAME_FIELD_ID,
  fields: [
    {
      universalIdentifier: BOOKING_GUEST_NAME_FIELD_ID,
      type: FieldType.TEXT,
      name: "guestName",
      label: "Guest",
      icon: "IconUser",
      isNullable: false,
      defaultValue: "''",
    },
    {
      universalIdentifier: "2b7d9e1f-0002-4b8d-8e0f-2a3b4c5d6e7f",
      type: FieldType.NUMBER,
      name: "partySize",
      label: "Pax",
      icon: "IconUsers",
      isNullable: false,
      defaultValue: 1,
    },
    {
      universalIdentifier: "2b7d9e1f-0003-4b8d-8e0f-2a3b4c5d6e7f",
      type: FieldType.DATE,
      name: "arrivalDate",
      label: "Arrival",
      icon: "IconCalendar",
      isNullable: false,
      defaultValue: null,
    },
    {
      universalIdentifier: "2b7d9e1f-0004-4b8d-8e0f-2a3b4c5d6e7f",
      type: FieldType.DATE,
      name: "departureDate",
      label: "Departure",
      icon: "IconCalendar",
      isNullable: false,
      defaultValue: null,
    },
    {
      universalIdentifier: "2b7d9e1f-0005-4b8d-8e0f-2a3b4c5d6e7f",
      type: FieldType.SELECT,
      name: "source",
      label: "Source",
      icon: "IconPlugConnected",
      defaultValue: "'manual'",
      options: [
        { id: "2b7d9e1f-0105-4b8d-8e0f-2a3b4c5d6e7f", value: "manual", label: "Manual", position: 0, color: "gray" },
        { id: "2b7d9e1f-0205-4b8d-8e0f-2a3b4c5d6e7f", value: "pms_resrequest", label: "ResRequest", position: 1, color: "blue" },
        { id: "2b7d9e1f-0305-4b8d-8e0f-2a3b4c5d6e7f", value: "pms_karibukit", label: "KaribuKit", position: 2, color: "sky" },
        { id: "2b7d9e1f-0405-4b8d-8e0f-2a3b4c5d6e7f", value: "agent", label: "Agent", position: 3, color: "purple" },
      ],
    },
  ],
});
