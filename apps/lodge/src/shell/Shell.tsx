import { useContext } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  IconBroadcast,
  IconBed,
  IconCalendarEvent,
  IconChevronDown,
  IconClipboardList,
  IconDoorEnter,
  IconLayoutDashboard,
  IconMoon,
  IconPlane,
  IconPrinter,
  IconSearch,
  IconSettings,
  IconLayoutSidebarLeftCollapse,
  IconSun,
  IconSunOff,
  IconUsers,
  IconUsersGroup,
} from "@tabler/icons-react";

import { Avatar } from "@ui/data-display/Avatar/Avatar";
import { LightIconButton } from "@ui/input/LightIconButton/LightIconButton";
import { MenuItem } from "@ui/navigation/MenuItem/MenuItem";

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

export const Shell = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { colorScheme, setColorScheme } = useContext(ColorSchemeContext);

  return (
    <div className={styles.layout}>
      <aside className={styles.drawer}>
        <div className={styles.workspaceRow}>
          <button type="button" className={styles.workspaceChip}>
            <Avatar placeholder="Kusini" size="sm" type="squared" />
            <span className={styles.workspaceName}>Kusini Lodge</span>
            <IconChevronDown size={14} className={styles.workspaceChevron} />
          </button>
          <div className={styles.workspaceActions}>
            <LightIconButton Icon={IconSearch} size="small" accent="tertiary" />
            <LightIconButton
              Icon={IconLayoutSidebarLeftCollapse}
              size="small"
              accent="tertiary"
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
            onClick={() =>
              setColorScheme(colorScheme === "dark" ? "light" : "dark")
            }
          />
        </div>
      </aside>

      <main className={styles.main}>
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </main>
    </div>
  );
};
