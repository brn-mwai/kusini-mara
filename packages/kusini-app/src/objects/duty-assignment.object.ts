import { defineObject, FieldType } from "twenty-sdk/define";

export const DUTY_ASSIGNMENT_UNIVERSAL_IDENTIFIER =
  "7a2c4d6e-9f1b-4a3c-d35e-7f8a9b0c1d2e";

export default defineObject({
  universalIdentifier: DUTY_ASSIGNMENT_UNIVERSAL_IDENTIFIER,
  nameSingular: "dutyAssignment",
  namePlural: "duties",
  labelSingular: "Duty",
  labelPlural: "Duties",
  description: "A ground job for a movement — pickup or dropoff with staff and vehicle.",
  icon: "IconClipboardList",
  labelIdentifierFieldMetadataUniversalIdentifier: "7a2c4d6e-0001-4a3c-d35e-7f8a9b0c1d2e",
  fields: [
    {
      universalIdentifier: "7a2c4d6e-0001-4a3c-d35e-7f8a9b0c1d2e",
      type: FieldType.SELECT,
      name: "dutyType",
      label: "Duty",
      icon: "IconClipboardList",
      defaultValue: "'airstrip_pickup'",
      options: [
        { id: "7a2c4d6e-0101-4a3c-d35e-7f8a9b0c1d2e", value: "airstrip_pickup", label: "Airstrip pickup", position: 0, color: "blue" },
        { id: "7a2c4d6e-0201-4a3c-d35e-7f8a9b0c1d2e", value: "airstrip_dropoff", label: "Airstrip dropoff", position: 1, color: "purple" },
        { id: "7a2c4d6e-0301-4a3c-d35e-7f8a9b0c1d2e", value: "welcome_drive", label: "Welcome drive", position: 2, color: "green" },
        { id: "7a2c4d6e-0401-4a3c-d35e-7f8a9b0c1d2e", value: "luggage", label: "Luggage", position: 3, color: "yellow" },
        { id: "7a2c4d6e-0501-4a3c-d35e-7f8a9b0c1d2e", value: "guiding", label: "Guiding", position: 4, color: "turquoise" },
      ],
    },
    {
      universalIdentifier: "7a2c4d6e-0002-4a3c-d35e-7f8a9b0c1d2e",
      type: FieldType.SELECT,
      name: "status",
      label: "Status",
      icon: "IconProgressCheck",
      defaultValue: "'unassigned'",
      options: [
        { id: "7a2c4d6e-0102-4a3c-d35e-7f8a9b0c1d2e", value: "unassigned", label: "Unassigned", position: 0, color: "gray" },
        { id: "7a2c4d6e-0202-4a3c-d35e-7f8a9b0c1d2e", value: "assigned", label: "Assigned", position: 1, color: "blue" },
        { id: "7a2c4d6e-0302-4a3c-d35e-7f8a9b0c1d2e", value: "notified", label: "Notified", position: 2, color: "orange" },
        { id: "7a2c4d6e-0402-4a3c-d35e-7f8a9b0c1d2e", value: "accepted", label: "Accepted", position: 3, color: "green" },
        { id: "7a2c4d6e-0502-4a3c-d35e-7f8a9b0c1d2e", value: "declined", label: "Declined", position: 4, color: "red" },
        { id: "7a2c4d6e-0602-4a3c-d35e-7f8a9b0c1d2e", value: "completed", label: "Completed", position: 5, color: "green" },
        { id: "7a2c4d6e-0702-4a3c-d35e-7f8a9b0c1d2e", value: "reassigned", label: "Reassigned", position: 6, color: "orange" },
      ],
    },
  ],
});
