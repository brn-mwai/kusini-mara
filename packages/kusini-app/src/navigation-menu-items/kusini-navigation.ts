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
  { key: "workspace", name: "Workspace", id: "bf010001-0000-4000-8000-000000000001" },
  { key: "planning", name: "Planning", id: "bf010003-0000-4000-8000-000000000003" },
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
  { id: "bf020001-0000-4000-8000-000000000001", name: "Movements", icon: "IconPlaneTilt", color: "green", folder: "workspace", object: "movement", link: "/movements" },
  { id: "bf020004-0000-4000-8000-000000000004", name: "Bookings", icon: "IconPlane", color: "pink", folder: "workspace", object: "booking", link: "/bookings" },
  { id: "bf020005-0000-4000-8000-000000000005", name: "Guests", icon: "IconUsers", color: "sky", folder: "workspace", object: "guest", link: "/guests" },
  { id: "bf020007-0000-4000-8000-000000000007", name: "Duties", icon: "IconClipboardList", color: "blue", folder: "workspace", object: "dutyAssignment", link: "/duties" },
  { id: "bf02000a-0000-4000-8000-00000000000a", name: "Rooms", icon: "IconBed", color: "pink", folder: "workspace", object: "room", link: "/rooms" },
  { id: "bf020009-0000-4000-8000-000000000009", name: "Staff", icon: "IconUsersGroup", color: "purple", folder: "workspace", object: "staff", link: "/staff" },
  { id: "bf020008-0000-4000-8000-000000000008", name: "Leave planner", icon: "IconSunOff", color: "green", folder: "planning", link: "/leave" },
  { id: "bf02000c-0000-4000-8000-00000000000c", name: "Dashboards", icon: "IconChartBar", color: "sky", folder: "planning", link: "/dashboards" },
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
