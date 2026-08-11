import type { Icon } from "@phosphor-icons/react";
import {
  Anchor,
  ArrowsLeftRight,
  BatteryHigh,
  Buildings,
  CalendarCheck,
  Certificate,
  CloudArrowUp,
  Gauge,
  MapPin,
  MapTrifold,
  Package,
  Scan,
  SealCheck,
  Siren,
  Stack,
  Tag,
  Truck,
  UploadSimple,
  Warning,
} from "@phosphor-icons/react";

// The single source of truth for console navigation. A nav link may only
// exist here if its route exists under src/app — enforced by tests.

export type ConsoleKey = "oem" | "partners" | "field" | "admin";

export type NavItem = {
  label: string;
  href: string;
  icon: Icon;
};

export type NavGroup = {
  label: string;
  items: NavItem[];
};

export type ConsoleDef = {
  key: ConsoleKey;
  name: string;
  basePath: string;
  groups: NavGroup[];
};

export const CONSOLES: Record<ConsoleKey, ConsoleDef> = {
  admin: {
    key: "admin",
    name: "Control Tower",
    basePath: "/admin",
    groups: [
      {
        label: "Overview",
        items: [{ label: "Dashboard", href: "/admin", icon: Gauge }],
      },
      {
        label: "Custody",
        items: [
          { label: "Batteries", href: "/admin/batteries", icon: BatteryHigh },
          { label: "Containers", href: "/admin/containers", icon: Package },
          {
            label: "Movements",
            href: "/admin/movements",
            icon: ArrowsLeftRight,
          },
        ],
      },
      {
        label: "Network",
        items: [
          { label: "Map", href: "/admin/map", icon: MapTrifold },
          { label: "Collection points", href: "/admin/points", icon: MapPin },
          { label: "Organisations", href: "/admin/orgs", icon: Buildings },
          {
            label: "Verification",
            href: "/admin/verification",
            icon: SealCheck,
          },
        ],
      },
      {
        label: "System",
        items: [
          { label: "Labels", href: "/admin/labels", icon: Tag },
          { label: "Anchors", href: "/admin/anchors", icon: Anchor },
          { label: "Emergency override", href: "/admin/emergency", icon: Siren },
        ],
      },
    ],
  },
  oem: {
    key: "oem",
    name: "Producer Console",
    basePath: "/oem",
    groups: [
      {
        label: "Overview",
        items: [{ label: "Dashboard", href: "/oem", icon: Gauge }],
      },
      {
        label: "Batteries",
        items: [
          { label: "My batteries", href: "/oem/batteries", icon: BatteryHigh },
          { label: "Onboard", href: "/oem/onboard", icon: UploadSimple },
        ],
      },
      {
        label: "Service",
        items: [{ label: "Service", href: "/oem/service", icon: Truck }],
      },
      {
        label: "Compliance",
        items: [{ label: "Records", href: "/oem/records", icon: Certificate }],
      },
    ],
  },
  partners: {
    key: "partners",
    name: "Partner Console",
    basePath: "/partners",
    groups: [
      {
        label: "Overview",
        items: [{ label: "Dashboard", href: "/partners", icon: Gauge }],
      },
      {
        label: "Stock",
        items: [{ label: "Stock", href: "/partners/stock", icon: Stack }],
      },
      {
        label: "Account",
        items: [
          { label: "Permits", href: "/partners/permits", icon: SealCheck },
        ],
      },
    ],
  },
  field: {
    key: "field",
    name: "Field",
    basePath: "/field",
    groups: [
      {
        label: "Field",
        items: [
          { label: "Today", href: "/field", icon: CalendarCheck },
          { label: "Scan", href: "/field/scan", icon: Scan },
          { label: "Triage", href: "/field/triage", icon: Warning },
          { label: "Queue", href: "/field/queue", icon: CloudArrowUp },
        ],
      },
    ],
  },
};

/** Flat list of every nav href — used by tests to assert routes exist. */
export function allNavHrefs(): string[] {
  return Object.values(CONSOLES).flatMap((c) =>
    c.groups.flatMap((g) => g.items.map((i) => i.href)),
  );
}

/** Breadcrumb: console name › group/page label for the active path. */
export function breadcrumbFor(
  consoleKey: ConsoleKey,
  pathname: string,
): { section: string; page: string } {
  const def = CONSOLES[consoleKey];
  for (const group of def.groups) {
    for (const item of group.items) {
      if (item.href === pathname)
        return { section: def.name, page: item.label };
    }
  }
  // Nested detail routes fall back to the longest matching nav item.
  const match = def.groups
    .flatMap((g) => g.items)
    .filter((i) => pathname.startsWith(i.href) && i.href !== def.basePath)
    .sort((a, b) => b.href.length - a.href.length)[0];
  return { section: def.name, page: match?.label ?? "Detail" };
}
