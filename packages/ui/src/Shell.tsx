"use client";
import { useEffect, useState, type ReactNode } from "react";
import { useTheme } from "./theme";
import { CommandPalette, type CmdItem } from "./CommandPalette";

export type NavItem = {
  key: string;
  label: string;
  icon: string; // phosphor name, rendered duotone
  badge?: number;
};
export type NavSection = { sec: string; items: NavItem[] };
export type Recent = { code: string; label: string };

export function Shell({
  appName,
  shortCode,
  navSections,
  recents,
  activePage,
  crumbPage,
  onNavigate,
  user,
  pilot,
  bellBadge,
  paletteItems,
  onPrint,
  children,
}: {
  appName: string;
  shortCode: string;
  navSections: NavSection[];
  recents?: Recent[];
  activePage: string;
  crumbPage: string;
  onNavigate: (key: string) => void;
  user: { name: string; sub: string; initials: string };
  pilot?: { icon: string; label: string; fill: number; meta: string };
  bellBadge?: number;
  paletteItems: CmdItem[];
  onPrint?: () => void;
  children: ReactNode;
}) {
  const { pref, setPref } = useTheme();
  const [collapsed, setCollapsed] = useState(false);
  const [popup, setPopup] = useState(false);
  const [palette, setPalette] = useState(false);
  const [navOpen, setNavOpen] = useState(false);

  // ⌘K / Ctrl-K opens the command palette.
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPalette((p) => !p);
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  const nav = (key: string) => {
    onNavigate(key);
    setNavOpen(false);
  };

  return (
    <div className={`dashboard${collapsed ? " collapsed" : ""}`}>
      <aside className="sidebar">
        <div className="sb-top">
          <div className="sb-switch">
            <span className="sb-mono">{shortCode}</span>
            <span className="nm">{appName}</span>
            <i className="ph ph-caret-up-down ca" />
          </div>
          <button
            className="sb-srch"
            aria-label="Search"
            onClick={() => setPalette(true)}
          >
            <i className="ph ph-magnifying-glass" />
          </button>
        </div>

        <button className="sb-create" onClick={() => (onPrint ? onPrint() : window.print())}>
          <i className="ph ph-printer" />
          <span className="t">Print today’s sheet</span>
        </button>

        <nav className="sb-nav">
          {navSections.map((g) => (
            <div className="nav-sec" key={g.sec}>
              <div className="nav-sec-label">{g.sec}</div>
              {g.items.map((it) => (
                <a
                  key={it.key}
                  className={`nav-item${activePage === it.key ? " active" : ""}`}
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    nav(it.key);
                  }}
                >
                  <i className={`ph-duotone ${it.icon}`} />
                  <span className="nav-text">{it.label}</span>
                  {it.badge ? (
                    <span className="nav-badge">{it.badge}</span>
                  ) : (
                    <i className="ph ph-caret-right nav-chev" />
                  )}
                </a>
              ))}
            </div>
          ))}
          {recents && recents.length > 0 && (
            <div className="nav-sec">
              <div className="nav-sec-label">Recents</div>
              {recents.map((r) => (
                <a className="nav-item recent" href="#" key={r.code} onClick={(e) => e.preventDefault()}>
                  <i className="ph ph-airplane-tilt" />
                  <span className="nav-text">
                    <b>{r.code}</b> {r.label}
                  </span>
                </a>
              ))}
            </div>
          )}
        </nav>

        {pilot && (
          <div className="sb-pilot">
            <div className="ph-row">
              <i className={`ph-duotone ${pilot.icon}`} /> {pilot.label}
            </div>
            <div className="track">
              <div className="fill" style={{ width: `${pilot.fill}%` }} />
            </div>
            <div className="meta">{pilot.meta}</div>
          </div>
        )}

        <div className="sb-foot-wrap">
          <div className={`sb-popup${popup ? " open" : ""}`}>
            <div className="theme-row">
              {(["light", "system", "dark"] as const).map((t) => (
                <button
                  key={t}
                  className={`theme-opt${pref === t ? " active" : ""}`}
                  onClick={() => setPref(t)}
                  aria-label={t}
                >
                  <i
                    className={`ph ${
                      t === "light" ? "ph-sun-dim" : t === "system" ? "ph-monitor" : "ph-moon"
                    }`}
                  />
                </button>
              ))}
            </div>
            <div className="sb-popup-sep" />
            <button className="sb-popup-item">
              <i className="ph ph-user" /> Profile
            </button>
            <button className="sb-popup-item" onClick={() => nav("settings")}>
              <i className="ph ph-gear-six" /> Settings
            </button>
            <div className="sb-popup-sep" />
            <button className="sb-popup-item danger">
              <i className="ph ph-sign-out" /> Log out
            </button>
          </div>
          <div className="sb-foot" onClick={() => setPopup((p) => !p)}>
            <span className="sb-av">{user.initials}</span>
            <div className="info">
              <div className="nm">{user.name}</div>
              <div className="em">{user.sub}</div>
            </div>
            <i className="ph ph-caret-up tg" />
          </div>
        </div>
      </aside>

      <div className="main">
        <div className="topbar">
          <button
            className="collapse-btn"
            aria-label="Toggle sidebar"
            onClick={() => setCollapsed((c) => !c)}
          >
            <i className="ph ph-sidebar-simple" />
          </button>
          <div className="crumb">
            <span className="live-dot" /> {appName}{" "}
            <span style={{ color: "var(--text-3)" }}>/</span> <b>{crumbPage}</b>
          </div>
          <div className="tb-spacer" />
          <div className="tb-actions">
            <button className="tb-search" onClick={() => setPalette(true)}>
              <i className="ph ph-magnifying-glass" />
              <span className="lbl">Search…</span>
              <span className="kbd">⌘K</span>
            </button>
            <button
              className="tb-icon"
              aria-label="Notifications"
              onClick={() => nav("notifications")}
            >
              <i className="ph ph-bell" />
              {bellBadge ? <span className="badge">{bellBadge}</span> : null}
            </button>
            <button
              className="tb-icon"
              aria-label="Toggle theme"
              onClick={() => setPref(pref === "dark" ? "light" : "dark")}
            >
              <i className="ph ph-moon" />
            </button>
          </div>
        </div>
        <div className="page-content">{children}</div>
      </div>

      <CommandPalette open={palette} onClose={() => setPalette(false)} items={paletteItems} />
    </div>
  );
}
