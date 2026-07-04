import { Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  IconBroadcast,
  IconBed,
  IconCalendarEvent,
  IconClipboardList,
  IconDoorEnter,
  IconLayoutDashboard,
  IconPlane,
  IconPrinter,
  IconSettings,
  IconSunOff,
  IconUsers,
  IconUsersGroup,
} from "@tabler/icons-react";

import { MenuItem } from "@ui/navigation/MenuItem/MenuItem";
import { H3Title } from "@ui/typography/H3Title/H3Title";

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

  return (
    <div className={styles.layout}>
      <aside className={styles.drawer}>
        <div className={styles.brand}>
          <H3Title title="Kusini Lodge" />
        </div>
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
      </aside>
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
};
