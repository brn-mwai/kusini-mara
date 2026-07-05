import { defineNavigationMenuItem } from "twenty-sdk/define";
import { NavigationMenuItemType } from "twenty-shared/types";

import { BOOKING_UNIVERSAL_IDENTIFIER } from "../objects/booking.object";
import { GUEST_UNIVERSAL_IDENTIFIER } from "../objects/guest.object";
import { MOVEMENT_UNIVERSAL_IDENTIFIER } from "../objects/movement.object";

const OBJECT_IDS = {
  movement: MOVEMENT_UNIVERSAL_IDENTIFIER,
  booking: BOOKING_UNIVERSAL_IDENTIFIER,
  guest: GUEST_UNIVERSAL_IDENTIFIER,
  stay: "6f1b3c5d-8e0a-4f2b-c24d-6e7f8a9b0c1d",
  staff: "4d9f1a3b-6c8e-4d0f-a02b-4c5d6e7f8a9b",
  room: "5e0a2b4c-7d9f-4e1a-b13c-5d6e7f8a9b0c",
  dutyAssignment: "7a2c4d6e-9f1b-4a3c-d35e-7f8a9b0c1d2e",
};

const FOLDERS = [
  { key: "operations", name: "Operations", id: "bf010001-0000-4000-8000-000000000001" },
  { key: "guests", name: "Guests", id: "bf010002-0000-4000-8000-000000000002" },
  { key: "workforce", name: "Workforce", id: "bf010003-0000-4000-8000-000000000003" },
  { key: "property", name: "Property", id: "bf010004-0000-4000-8000-000000000004" },
  { key: "insights", name: "Insights", id: "bf010005-0000-4000-8000-000000000005" },
  { key: "global", name: "Global", id: "bf010006-0000-4000-8000-000000000006" },
] as const;

const folderId = (key: (typeof FOLDERS)[number]["key"]) =>
  FOLDERS.find((f) => f.key === key)!.id;

export const kusiniFolders = FOLDERS.map((folder, index) =>
  defineNavigationMenuItem({
    universalIdentifier: folder.id,
    type: NavigationMenuItemType.FOLDER,
    name: folder.name,
    position: index,
  }),
);

type ItemDef = {
  id: string;
  name: string;
  icon: string;
  color?: string;
  folder: (typeof FOLDERS)[number]["key"];
  object?: keyof typeof OBJECT_IDS;
  link?: string;
};

const ITEMS: ItemDef[] = [
  { id: "bf020001-0000-4000-8000-000000000001", name: "Today", icon: "IconLayoutDashboard", color: "green", folder: "operations", object: "movement", link: "/today" },
  { id: "bf020002-0000-4000-8000-000000000002", name: "Arrivals", icon: "IconPlaneArrival", color: "blue", folder: "operations", object: "movement", link: "/arrivals" },
  { id: "bf020003-0000-4000-8000-000000000003", name: "Departures", icon: "IconPlaneDeparture", color: "purple", folder: "operations", object: "movement", link: "/departures" },
  { id: "bf020004-0000-4000-8000-000000000004", name: "Bookings", icon: "IconPlane", color: "pink", folder: "operations", object: "booking", link: "/bookings" },
  { id: "bf020005-0000-4000-8000-000000000005", name: "Guest directory", icon: "IconUsers", color: "sky", folder: "guests", object: "guest", link: "/guests" },
  { id: "bf020006-0000-4000-8000-000000000006", name: "Check-in", icon: "IconDoorEnter", color: "turquoise", folder: "guests", object: "stay", link: "/checkin" },
  { id: "bf020007-0000-4000-8000-000000000007", name: "Duties", icon: "IconClipboardList", color: "blue", folder: "workforce", object: "dutyAssignment", link: "/duties" },
  { id: "bf020008-0000-4000-8000-000000000008", name: "Leave planner", icon: "IconSunOff", color: "green", folder: "workforce", link: "/leave" },
  { id: "bf020009-0000-4000-8000-000000000009", name: "Staff", icon: "IconUsersGroup", color: "purple", folder: "workforce", object: "staff", link: "/staff" },
  { id: "bf02000a-0000-4000-8000-00000000000a", name: "Rooms", icon: "IconBed", color: "pink", folder: "property", object: "room", link: "/rooms" },
  { id: "bf02000b-0000-4000-8000-00000000000b", name: "Calendar", icon: "IconCalendarEvent", color: "yellow", folder: "property", link: "/calendar" },
  { id: "bf02000c-0000-4000-8000-00000000000c", name: "Reports", icon: "IconChartBar", color: "sky", folder: "insights", link: "/reports" },
  { id: "bf02000d-0000-4000-8000-00000000000d", name: "Notifications", icon: "IconBell", color: "orange", folder: "global", link: "/notifications" },
  { id: "bf02000e-0000-4000-8000-00000000000e", name: "Broadcasts", icon: "IconBroadcast", color: "red", folder: "global", link: "/broadcasts" },
  { id: "bf02000f-0000-4000-8000-00000000000f", name: "Print", icon: "IconPrinter", color: "gray", folder: "global", link: "/print" },
  { id: "bf020010-0000-4000-8000-000000000010", name: "Settings", icon: "IconSettings", color: "orange", folder: "global", link: "/settings" },
];

export const kusiniNavigationItems = ITEMS.map((item, index) =>
  item.object
    ? defineNavigationMenuItem({
        universalIdentifier: item.id,
        type: NavigationMenuItemType.OBJECT,
        name: item.name,
        icon: item.icon,
        color: item.color,
        position: index,
        folderUniversalIdentifier: folderId(item.folder),
        targetObjectUniversalIdentifier: OBJECT_IDS[item.object],
        link: item.link,
      })
    : defineNavigationMenuItem({
        universalIdentifier: item.id,
        type: NavigationMenuItemType.LINK,
        name: item.name,
        icon: item.icon,
        color: item.color,
        position: index,
        folderUniversalIdentifier: folderId(item.folder),
        link: item.link ?? "/",
      }),
);

export const KUSINI_NAVIGATION = { folders: kusiniFolders, items: kusiniNavigationItems };
