import { useContext, useState } from "react";
import { useQuery } from "convex/react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

import { api } from "@convex/api";
import {
  IconBell,
  IconBroadcast,
  IconChartBar,
  IconPlaneArrival,
  IconPlaneDeparture,
  IconBed,
  IconCalendarEvent,
  IconChevronDown,
  IconClipboardList,
  IconDoorEnter,
  IconLayoutDashboard,
  IconLayoutSidebarLeftCollapse,
  IconLayoutSidebarLeftExpand,
  IconMoon,
  IconPlane,
  IconPrinter,
  IconSearch,
  IconSettings,
  IconSun,
  IconSunOff,
  IconUsers,
  IconUsersGroup,
} from "@tabler/icons-react";

import { Avatar } from "@ui/data-display/Avatar/Avatar";
import { TintedIconTile } from "@ui/data-display/TintedIconTile/TintedIconTile";
import { SearchInput } from "@ui/input/SearchInput/SearchInput";
import { LightIconButton } from "@ui/input/LightIconButton/LightIconButton";
import { MenuItem } from "@ui/navigation/MenuItem/MenuItem";

import { Dropdown } from "@/components/dropdown/Dropdown";
import { ErrorBoundary } from "@/components/ErrorBoundary";

import { colorForSeed, getObjectDef, OBJECT_BY_PATH } from "@/objects/registry";

import { ColorSchemeContext } from "./ColorSchemeContext";
import styles from "./Shell.module.scss";

const NAV_GROUPS = [
  {
    label: "Operations",
    items: [
      { path: "/today", label: "Today", Icon: IconLayoutDashboard },
      { path: "/arrivals", label: "Arrivals", Icon: IconPlaneArrival },
      { path: "/departures", label: "Departures", Icon: IconPlaneDeparture },
      { path: "/bookings", label: "Bookings", Icon: IconPlane },
    ],
  },
  {
    label: "Guests",
    items: [
      { path: "/guests", label: "Guest directory", Icon: IconUsers },
      { path: "/checkin", label: "Check-in", Icon: IconDoorEnter },
    ],
  },
  {
    label: "Workforce",
    items: [
      { path: "/duties", label: "Duties", Icon: IconClipboardList },
      { path: "/leave", label: "Leave planner", Icon: IconSunOff },
      { path: "/staff", label: "Staff", Icon: IconUsersGroup },
    ],
  },
  {
    label: "Property",
    items: [
      { path: "/rooms", label: "Rooms", Icon: IconBed },
      { path: "/calendar", label: "Calendar", Icon: IconCalendarEvent },
    ],
  },
  {
    label: "Insights",
    items: [{ path: "/reports", label: "Reports", Icon: IconChartBar }],
  },
  {
    label: "Global",
    items: [
      { path: "/notifications", label: "Notifications", Icon: IconBell },
      { path: "/broadcasts", label: "Broadcasts", Icon: IconBroadcast },
      { path: "/print", label: "Print", Icon: IconPrinter },
      { path: "/settings", label: "Settings", Icon: IconSettings },
    ],
  },
];

const NAV = NAV_GROUPS.flatMap((g) => g.items);

const navColor = (path: string) => {
  const objectName = OBJECT_BY_PATH[path];
  return objectName ? getObjectDef(objectName).color : colorForSeed(path);
};

const GlobalSearch = ({
  value,
  onChange,
  onNavigate,
}: {
  value: string;
  onChange: (v: string) => void;
  onNavigate: (path: string) => void;
}) => {
  const results = useQuery(api.searchq.global, { q: value });
  const pageHits = NAV.filter(
    (n) => value.length >= 2 && n.label.toLowerCase().includes(value.toLowerCase()),
  );

  return (
    <>
      <SearchInput value={value} onChange={onChange} placeholder="Search records…" />
      {pageHits.map(({ path, label, Icon }) => (
        <MenuItem key={path} text={label} LeftIcon={Icon} onClick={() => onNavigate(path)} />
      ))}
      {(results?.hits ?? []).map((hit) => (
        <MenuItem
          key={`${hit.kind}-${hit.id}`}
          text={hit.label}
          contextualText={`${hit.kind} · ${hit.sub.replace(/_/g, " ")}`}
          onClick={() => onNavigate(hit.path)}
        />
      ))}
      {value.length >= 2 && pageHits.length === 0 && (results?.hits ?? []).length === 0 && (
        <div className={styles.searchEmpty}>No matches.</div>
      )}
    </>
  );
};

export const Shell = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { colorScheme, setColorScheme } = useContext(ColorSchemeContext);
  const [collapsed, setCollapsed] = useState(false);
  const [navSearch, setNavSearch] = useState("");

  const toggleScheme = () =>
    setColorScheme(colorScheme === "dark" ? "light" : "dark");

  return (
    <div className={styles.layout}>
      {collapsed ? (
        <div className={styles.collapsedRail}>
          <button
            type="button"
            className={styles.railLogo}
            onClick={() => setCollapsed(false)}
            aria-label="Expand sidebar"
          >
            <img src="/kusini-mark.svg" alt="" className={styles.workspaceLogo} />
          </button>
          <LightIconButton
            Icon={IconLayoutSidebarLeftExpand}
            size="small"
            accent="tertiary"
            onClick={() => setCollapsed(false)}
          />
          <Dropdown
            align="left"
            width={260}
            trigger={<LightIconButton Icon={IconSearch} size="small" accent="tertiary" />}
          >
            {(close) => (
              <GlobalSearch
                value={navSearch}
                onChange={setNavSearch}
                onNavigate={(path) => {
                  navigate(path);
                  setNavSearch("");
                  close();
                }}
              />
            )}
          </Dropdown>
          <div className={styles.railTiles}>
            {NAV.map(({ path, label, Icon }) => {
              const color = navColor(path);
              return (
                <button
                  key={path}
                  type="button"
                  className={styles.railTile}
                  data-active={pathname.startsWith(path) || undefined}
                  aria-label={label}
                  onClick={() => navigate(path)}
                >
                  <TintedIconTile Icon={Icon} color={color} size={16} />
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <aside className={styles.drawer}>
          <div className={styles.workspaceRow}>
            <Dropdown
              width={220}
              trigger={
                <button type="button" className={styles.workspaceChip}>
                  <img src="/kusini-mark.svg" alt="" className={styles.workspaceLogo} />
                  <span className={styles.workspaceName}>Kusini Lodge</span>
                  <IconChevronDown size={14} className={styles.workspaceChevron} />
                </button>
              }
            >
              {(close) => (
                <>
                  <div className={styles.workspaceMenuHeader}>
                    <img src="/kusini-mark.svg" alt="" className={styles.workspaceLogoLg} />
                    <div>
                      <div className={styles.workspaceMenuName}>Kusini Lodge</div>
                      <div className={styles.workspaceMenuSub}>lodge.kusini.app</div>
                    </div>
                  </div>
                  <MenuItem
                    text={colorScheme === "dark" ? "Light mode" : "Dark mode"}
                    LeftIcon={colorScheme === "dark" ? IconSun : IconMoon}
                    onClick={() => {
                      toggleScheme();
                      close();
                    }}
                  />
                  <MenuItem
                    text="Settings"
                    LeftIcon={IconSettings}
                    onClick={() => {
                      navigate("/settings");
                      close();
                    }}
                  />
                </>
              )}
            </Dropdown>
            <div className={styles.workspaceActions}>
              <Dropdown
                align="left"
                width={260}
                trigger={
                  <LightIconButton Icon={IconSearch} size="small" accent="tertiary" />
                }
              >
                {(close) => (
                  <GlobalSearch
                    value={navSearch}
                    onChange={setNavSearch}
                    onNavigate={(path) => {
                      navigate(path);
                      setNavSearch("");
                      close();
                    }}
                  />
                )}
              </Dropdown>
              <LightIconButton
                Icon={IconLayoutSidebarLeftCollapse}
                size="small"
                accent="tertiary"
                onClick={() => setCollapsed(true)}
              />
            </div>
          </div>

          <nav className={styles.nav}>
            {NAV_GROUPS.map((group) => (
              <div key={group.label} className={styles.navGroup}>
                <div className={styles.sectionLabel}>{group.label}</div>
                {group.items.map(({ path, label, Icon }) => (
                  <button
                    key={path}
                    type="button"
                    className={styles.navItem}
                    data-active={pathname.startsWith(path) || undefined}
                    onClick={() => navigate(path)}
                  >
                    <TintedIconTile Icon={Icon} color={navColor(path)} size={14} />
                    <span className={styles.navItemLabel}>{label}</span>
                  </button>
                ))}
              </div>
            ))}
          </nav>

          <div className={styles.drawerFooter}>
            <MenuItem
              text={colorScheme === "dark" ? "Light mode" : "Dark mode"}
              LeftIcon={colorScheme === "dark" ? IconSun : IconMoon}
              onClick={toggleScheme}
            />
          </div>
        </aside>
      )}

      <main className={styles.main}>
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </main>
    </div>
  );
};
