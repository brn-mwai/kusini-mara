import bookingObject from "./objects/booking.object";
import dutyAssignmentObject from "./objects/duty-assignment.object";
import guestObject from "./objects/guest.object";
import movementObject from "./objects/movement.object";
import roomObject from "./objects/room.object";
import staffObject from "./objects/staff.object";
import stayObject from "./objects/stay.object";

export const KUSINI_OBJECTS = [
  movementObject,
  bookingObject,
  guestObject,
  stayObject,
  staffObject,
  roomObject,
  dutyAssignmentObject,
];

export {
  bookingObject,
  dutyAssignmentObject,
  guestObject,
  movementObject,
  roomObject,
  staffObject,
  stayObject,
};

export { default as kusiniApplication } from "./application-config";
export { KUSINI_VIEWS } from "./views/index-views";
export { KUSINI_NAVIGATION } from "./navigation-menu-items/kusini-navigation";
