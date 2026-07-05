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

import { NAV_ENTRIES, NAV_GROUPS } from "@/objects/registry";

import { ColorSchemeContext } from "./ColorSchemeContext";
import styles from "./Shell.module.scss";

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
  const pageHits = NAV_ENTRIES.filter(
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
