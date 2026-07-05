import { defineView, ViewKey } from "twenty-sdk/define";

import bookingObject from "../objects/booking.object";
import dutyAssignmentObject from "../objects/duty-assignment.object";
import guestObject from "../objects/guest.object";
import movementObject from "../objects/movement.object";
import roomObject from "../objects/room.object";
import staffObject from "../objects/staff.object";
import stayObject from "../objects/stay.object";

type ObjectResult =
  | typeof movementObject
  | typeof bookingObject
  | typeof guestObject
  | typeof stayObject
  | typeof staffObject
  | typeof roomObject
  | typeof dutyAssignmentObject;

const fieldId = (object: ObjectResult, name: string): string => {
  const field = object.config.fields.find((f) => f.name === name);
  if (!field) throw new Error(`${object.config.nameSingular} has no field ${name}`);
  return field.universalIdentifier;
};

const indexView = (
  object: ObjectResult,
  viewUniversalIdentifier: string,
  icon: string,
  columns: { name: string; size: number }[],
) =>
  defineView({
    universalIdentifier: viewUniversalIdentifier,
    name: `All ${object.config.labelPlural}`,
    objectUniversalIdentifier: object.config.universalIdentifier,
    key: ViewKey.INDEX,
    icon,
    position: 0,
    fields: columns.map((column, index) => ({
      universalIdentifier: `${viewUniversalIdentifier.slice(0, 9)}f${String(index).padStart(2, "0")}${viewUniversalIdentifier.slice(12)}`,
      fieldMetadataUniversalIdentifier: fieldId(object, column.name),
      position: index,
      isVisible: true,
      size: column.size,
    })),
  });

export const MOVEMENT_INDEX_VIEW_ID = "af1e2d3c-4b5a-4c6d-8e7f-0a1b2c3d4e5f";
export const movementIndexView = indexView(
  movementObject,
  MOVEMENT_INDEX_VIEW_ID,
  "IconPlaneTilt",
  [
    { name: "guestName", size: 200 },
    { name: "partySize", size: 60 },
    { name: "direction", size: 120 },
    { name: "mode", size: 130 },
    { name: "carrierName", size: 180 },
    { name: "scheduledTime", size: 120 },
    { name: "status", size: 150 },
  ],
);

export const BOOKING_INDEX_VIEW_ID = "af2e3d4c-5b6a-4d7e-9f80-1b2c3d4e5f6a";
export const bookingIndexView = indexView(
  bookingObject,
  BOOKING_INDEX_VIEW_ID,
  "IconPlane",
  [
    { name: "guestName", size: 200 },
    { name: "partySize", size: 60 },
    { name: "arrivalDate", size: 110 },
    { name: "departureDate", size: 110 },
    { name: "source", size: 120 },
  ],
);

export const GUEST_INDEX_VIEW_ID = "af3e4d5c-6b7a-4e8f-a091-2c3d4e5f6a7b";
export const guestIndexView = indexView(guestObject, GUEST_INDEX_VIEW_ID, "IconUsers", [
  { name: "name", size: 200 },
  { name: "guestType", size: 100 },
  { name: "age", size: 70 },
  { name: "isLead", size: 80 },
]);

export const STAY_INDEX_VIEW_ID = "af4e5d6c-7b8a-4f90-b1a2-3d4e5f6a7b8c";
export const stayIndexView = indexView(stayObject, STAY_INDEX_VIEW_ID, "IconDoorEnter", [
  { name: "plannedCheckIn", size: 120 },
  { name: "plannedCheckOut", size: 120 },
  { name: "status", size: 130 },
  { name: "boardBasis", size: 130 },
]);

export const STAFF_INDEX_VIEW_ID = "af5e6d7c-8b9a-4a01-c2b3-4e5f6a7b8c9d";
export const staffIndexView = indexView(staffObject, STAFF_INDEX_VIEW_ID, "IconUsersGroup", [
  { name: "name", size: 200 },
  { name: "role", size: 120 },
  { name: "phones", size: 150 },
  { name: "allowedLeaveDays", size: 100 },
  { name: "active", size: 80 },
]);

export const ROOM_INDEX_VIEW_ID = "af6e7d8c-9b0a-4b12-d3c4-5f6a7b8c9d0e";
export const roomIndexView = indexView(roomObject, ROOM_INDEX_VIEW_ID, "IconBed", [
  { name: "name", size: 160 },
  { name: "type", size: 130 },
  { name: "capacity", size: 80 },
  { name: "housekeepingStatus", size: 160 },
]);

export const DUTY_INDEX_VIEW_ID = "af7e8d9c-0b1a-4c23-e4d5-6a7b8c9d0e1f";
export const dutyIndexView = indexView(
  dutyAssignmentObject,
  DUTY_INDEX_VIEW_ID,
  "IconClipboardList",
  [
    { name: "dutyType", size: 160 },
    { name: "status", size: 130 },
  ],
);

export const KUSINI_VIEWS = [
  movementIndexView,
  bookingIndexView,
  guestIndexView,
  stayIndexView,
  staffIndexView,
  roomIndexView,
  dutyIndexView,
];
