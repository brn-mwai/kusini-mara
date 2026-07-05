import { useContext, useState } from "react";
import { useQuery } from "convex/react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

import { api } from "@convex/api";
import {
  IconBroadcast,
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
import { SearchInput } from "@ui/input/SearchInput/SearchInput";
import { LightIconButton } from "@ui/input/LightIconButton/LightIconButton";
import { MenuItem } from "@ui/navigation/MenuItem/MenuItem";

import { Dropdown } from "@/components/dropdown/Dropdown";
import { ErrorBoundary } from "@/components/ErrorBoundary";

import { ColorSchemeContext } from "./ColorSchemeContext";
import styles from "./Shell.module.scss";

const NAV = [
  { path: "/board", label: "Board", Icon: IconLayoutDashboard },
  { path: "/bookings", label: "Bookings", Icon: IconPlane },
  { path: "/guests", label: "Guests", Icon: IconUsers },
  { path: "/rooms", label: "Rooms", Icon: IconBed },
  { path: "/checkin", label: "Check-in", Icon: IconDoorEnter },
  { path: "/duties", label: "Duties", Icon: IconClipboardList },
  { path: "/staff", label: "Staff", Icon: IconUsersGroup },
  { path: "/leave", label: "Leave", Icon: IconSunOff },
  { path: "/calendar", label: "Calendar", Icon: IconCalendarEvent },
  { path: "/broadcasts", label: "Broadcasts", Icon: IconBroadcast },
  { path: "/print", label: "Print", Icon: IconPrinter },
  { path: "/settings", label: "Settings", Icon: IconSettings },
];

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
          <LightIconButton
            Icon={IconLayoutSidebarLeftExpand}
            size="small"
            accent="tertiary"
            onClick={() => setCollapsed(false)}
          />
        </div>
      ) : (
        <aside className={styles.drawer}>
          <div className={styles.workspaceRow}>
            <Dropdown
              width={220}
              trigger={
                <button type="button" className={styles.workspaceChip}>
                  <Avatar placeholder="Kusini" size="sm" type="squared" />
                  <span className={styles.workspaceName}>Kusini Lodge</span>
                  <IconChevronDown size={14} className={styles.workspaceChevron} />
                </button>
              }
            >
              {(close) => (
                <>
                  <div className={styles.workspaceMenuHeader}>
                    <Avatar placeholder="Kusini" size="md" type="squared" />
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

          <div className={styles.sectionLabel}>Workspace</div>
          <nav className={styles.nav}>
            {NAV.map(({ path, label, Icon }) => (
              <MenuItem
                key={path}
                text={label}
                LeftIcon={Icon}
                selected={pathname.startsWith(path)}
                onClick={() => navigate(path)}
              />
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
