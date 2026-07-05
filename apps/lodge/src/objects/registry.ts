import {
  IconBed,
  IconBriefcase,
  IconBuildingSkyscraper,
  IconCalendar,
  IconCalendarTime,
  IconCategory,
  IconClipboardList,
  IconDoorEnter,
  IconHeartHandshake,
  IconNumber,
  IconPhone,
  IconPlane,
  IconPlaneTilt,
  IconPlugConnected,
  IconProgressCheck,
  IconSparkles,
  IconStar,
  IconSunOff,
  IconToggleRight,
  IconToolsKitchen2,
  IconUser,
  IconUserCircle,
  IconUsers,
  IconUsersGroup,
  IconArrowsUpDown,
} from "@tabler/icons-react";

import { KUSINI_OBJECTS } from "kusini-app";
import { MAIN_COLOR_NAMES, type ThemeColor } from "@ui/theme";
import { type IconComponent } from "@ui/icon/types/IconComponent";

// Transferred from twenty-front object-metadata/utils/getObjectColorWithFallback.ts:
// custom objects derive their color by hashing nameSingular into the main palette.
const CUSTOM_OBJECT_ICON_COLORS: ThemeColor[] = MAIN_COLOR_NAMES.filter(
  (color) => color !== "gray",
);

export const colorForSeed = (seed: string): ThemeColor => {
  let hash = 0;
  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash << 5) - hash + seed.charCodeAt(index);
    hash |= 0;
  }
  const colorIndex = Math.abs(hash) % CUSTOM_OBJECT_ICON_COLORS.length;
  return CUSTOM_OBJECT_ICON_COLORS[colorIndex];
};

const ICONS: Record<string, IconComponent> = {
  IconArrowsUpDown,
  IconBed,
  IconBriefcase,
  IconBuildingSkyscraper,
  IconCalendar,
  IconCalendarTime,
  IconCategory,
  IconClipboardList,
  IconDoorEnter,
  IconHeartHandshake,
  IconNumber,
  IconPhone,
  IconPlane,
  IconPlaneTilt,
  IconPlugConnected,
  IconProgressCheck,
  IconSparkles,
  IconStar,
  IconSunOff,
  IconToggleRight,
  IconToolsKitchen2,
  IconUser,
  IconUserCircle,
  IconUsers,
  IconUsersGroup,
};

export const iconByName = (name: string | undefined): IconComponent =>
  (name && ICONS[name]) || IconCategory;

export type ObjectFieldDef = {
  name: string;
  label: string;
  Icon: IconComponent;
  type: string;
  options?: { value: string; label: string; color: string }[];
};

export type ObjectDef = {
  nameSingular: string;
  labelSingular: string;
  labelPlural: string;
  description?: string;
  Icon: IconComponent;
  color: ThemeColor;
  fields: ObjectFieldDef[];
  field: (name: string) => ObjectFieldDef | undefined;
};

const defs = new Map<string, ObjectDef>(
  KUSINI_OBJECTS.map((result) => {
    const config = result.config;
    const fields: ObjectFieldDef[] = config.fields.map((field) => ({
      name: field.name,
      label: field.label,
      Icon: iconByName(field.icon),
      type: String(field.type),
      options: (field as { options?: { value: string; label: string; color: string }[] })
        .options,
    }));
    const def: ObjectDef = {
      nameSingular: config.nameSingular,
      labelSingular: config.labelSingular,
      labelPlural: config.labelPlural,
      description: config.description,
      Icon: iconByName(config.icon),
      color: colorForSeed(config.nameSingular),
      fields,
      field: (name) => fields.find((f) => f.name === name),
    };
    return [config.nameSingular, def];
  }),
);

export const getObjectDef = (nameSingular: string): ObjectDef => {
  const def = defs.get(nameSingular);
  if (!def) throw new Error(`Unknown object: ${nameSingular}`);
  return def;
};

export const OBJECT_BY_PATH: Record<string, string> = {
  "/today": "movement",
  "/arrivals": "movement",
  "/departures": "movement",
  "/bookings": "booking",
  "/guests": "guest",
  "/checkin": "stay",
  "/duties": "dutyAssignment",
  "/staff": "staff",
  "/rooms": "room",
};
