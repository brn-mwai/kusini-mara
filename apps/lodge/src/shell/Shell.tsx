import { useContext, useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
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
  IconHelp,
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
  IconUserPlus,
  IconUsers,
  IconUsersGroup,
} from "@tabler/icons-react";

import { TintedIconTile } from "@ui/data-display/TintedIconTile/TintedIconTile";
import { LightIconButton } from "@ui/input/LightIconButton/LightIconButton";
import { MenuItem } from "@ui/navigation/MenuItem/MenuItem";

import { Dropdown } from "@/components/dropdown/Dropdown";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { SearchPanel } from "@/components/search/SearchPanel";

import { NAV_ENTRIES, NAV_GROUPS } from "@/objects/registry";

import { ColorSchemeContext } from "./ColorSchemeContext";
import styles from "./Shell.module.scss";

export const Shell = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { colorScheme, setColorScheme } = useContext(ColorSchemeContext);
  const [collapsed, setCollapsed] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const toggleScheme = () =>
    setColorScheme(colorScheme === "dark" ? "light" : "dark");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen((v) => !v);
      }
      if (e.key === "Escape") setSearchOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

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
          <LightIconButton
            Icon={IconSearch}
            size="small"
            accent="tertiary"
            onClick={() => setSearchOpen((v) => !v)}
          />
          <div className={styles.railTiles}>
            {NAV_ENTRIES.map(({ path, label, Icon, color }) => {
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
                    text="Invite user"
                    LeftIcon={IconUserPlus}
                    onClick={() => {
                      navigate("/settings?tab=team");
                      close();
                    }}
                  />
                  <MenuItem
                    text="Support"
                    LeftIcon={IconHelp}
                    onClick={() => {
                      window.open("mailto:support@kusini.app");
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
              <LightIconButton
                Icon={IconSearch}
                size="small"
                accent="tertiary"
                onClick={() => setSearchOpen((v) => !v)}
              />
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
                {group.items.map(({ path, label, Icon, color }) => (
                  <button
                    key={path}
                    type="button"
                    className={styles.navItem}
                    data-active={pathname.startsWith(path) || undefined}
                    onClick={() => navigate(path)}
                  >
                    <TintedIconTile Icon={Icon} color={color} size={14} />
                    <span className={styles.navItemLabel}>{label}</span>
                  </button>
                ))}
              </div>
            ))}
          </nav>

        </aside>
      )}

      <main className={styles.main}>
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </main>
      {searchOpen && <SearchPanel onClose={() => setSearchOpen(false)} />}
    </div>
  );
};
