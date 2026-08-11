"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect, useMemo, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import {
  Bell,
  CaretUpDown,
  Gear,
  List,
  MagnifyingGlass,
  Question,
  Recycle,
  ShareNetwork,
  X,
} from "@phosphor-icons/react";
import { UserButton } from "@clerk/nextjs";
import {
  breadcrumbFor,
  CONSOLES,
  type ConsoleKey,
} from "@/lib/console-routes";
import { clerkEnabled } from "@/lib/providers";
import { Mono } from "./ui";

function initials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0] ?? "")
    .join("")
    .toUpperCase();
}

export function Shell({
  consoleKey,
  children,
  badges,
}: {
  consoleKey: ConsoleKey;
  children: ReactNode;
  badges?: Record<string, number>;
}) {
  const def = CONSOLES[consoleKey];
  const pathname = usePathname();
  const router = useRouter();
  const whoami = useQuery(api.orgs.whoami, { surface: consoleKey });
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Close the mobile drawer whenever navigation changes the path.
  const [drawerPath, setDrawerPath] = useState(pathname);
  if (drawerPath !== pathname) {
    setDrawerPath(pathname);
    setDrawerOpen(false);
  }

  const crumb = breadcrumbFor(consoleKey, pathname);
  const clerk = clerkEnabled(consoleKey);

  const sidebar = (
    <div className="flex h-full flex-col bg-sidebar">
      {/* logo row */}
      <div className="flex h-14 shrink-0 items-center gap-2.5 border-b border-line px-4">
        <span className="flex size-7 items-center justify-center rounded-ctl bg-brand text-white">
          <Recycle size={16} weight="bold" aria-hidden />
        </span>
        <span className="truncate text-[14px] font-semibold text-ink max-lg:hidden">
          Revlog <span className="text-ink-tertiary">·</span> {def.name}
        </span>
      </div>

      {/* workspace switcher */}
      <button
        type="button"
        className="mx-3 mt-3 flex h-10 items-center gap-2 rounded-ctl border border-line bg-card px-2.5 text-left hover:bg-raised max-lg:mx-2 max-lg:justify-center max-lg:px-0"
        aria-label="Workspace"
      >
        <span className="flex size-6 shrink-0 items-center justify-center rounded-[6px] bg-navy text-[10px] font-semibold text-white">
          {whoami ? initials(whoami.org) : "…"}
        </span>
        <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-ink max-lg:hidden">
          {whoami ? whoami.org : "Loading…"}
        </span>
        <CaretUpDown
          size={14}
          className="shrink-0 text-ink-tertiary max-lg:hidden"
          aria-hidden
        />
      </button>

      {/* search */}
      <button
        type="button"
        onClick={() => setPaletteOpen(true)}
        className="mx-3 mt-3 flex h-9 items-center gap-2 rounded-ctl border border-line bg-card px-2.5 text-ink-tertiary hover:bg-raised max-lg:mx-2 max-lg:justify-center max-lg:px-0"
      >
        <MagnifyingGlass size={16} aria-hidden />
        <span className="flex-1 text-left text-[13px] max-lg:hidden">
          Search
        </span>
        <span className="mono rounded border border-line bg-raised px-1.5 py-0.5 text-[10px] max-lg:hidden">
          ⌘K
        </span>
      </button>

      {/* nav groups */}
      <nav className="mt-4 min-h-0 flex-1 overflow-y-auto px-3 max-lg:px-2">
        {def.groups.map((group) => (
          <div key={group.label} className="mb-5">
            <div className="text-group-label pb-2 pl-2 max-lg:hidden">
              {group.label}
            </div>
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const active =
                  pathname === item.href ||
                  (item.href !== def.basePath &&
                    pathname.startsWith(`${item.href}/`));
                const badge = badges?.[item.href];
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={`relative flex h-9 items-center gap-2.5 rounded-ctl px-2.5 text-[13px] font-medium transition-colors max-lg:justify-center max-lg:px-0 ${
                        active
                          ? "bg-brand-subtle text-brand"
                          : "text-ink-secondary hover:bg-raised hover:text-ink"
                      }`}
                    >
                      {active ? (
                        <span
                          aria-hidden
                          className="absolute inset-y-1.5 left-0 w-[3px] rounded-full bg-brand"
                        />
                      ) : null}
                      <item.icon size={16} aria-hidden />
                      <span className="min-w-0 flex-1 truncate max-lg:hidden">
                        {item.label}
                      </span>
                      {badge !== undefined && badge > 0 ? (
                        <Mono className="rounded-full bg-raised px-1.5 py-0.5 text-[11px] text-ink-secondary max-lg:hidden">
                          {badge}
                        </Mono>
                      ) : null}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* pinned bottom */}
      <div className="shrink-0 border-t border-line px-3 py-3 max-lg:px-2">
        <ul className="space-y-0.5">
          <li>
            <button
              type="button"
              className="flex h-9 w-full items-center gap-2.5 rounded-ctl px-2.5 text-[13px] font-medium text-ink-secondary hover:bg-raised hover:text-ink max-lg:justify-center max-lg:px-0"
            >
              <Question size={16} aria-hidden />
              <span className="max-lg:hidden">Help</span>
            </button>
          </li>
          <li>
            <button
              type="button"
              className="flex h-9 w-full items-center gap-2.5 rounded-ctl px-2.5 text-[13px] font-medium text-ink-secondary hover:bg-raised hover:text-ink max-lg:justify-center max-lg:px-0"
            >
              <Gear size={16} aria-hidden />
              <span className="max-lg:hidden">Settings</span>
            </button>
          </li>
        </ul>
        <div className="mt-2 flex items-center gap-2.5 rounded-ctl px-2.5 py-2 max-lg:justify-center max-lg:px-0">
          <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-brand-subtle text-[11px] font-semibold text-brand">
            {whoami ? initials(whoami.member) : "…"}
          </span>
          <div className="min-w-0 max-lg:hidden">
            <div className="truncate text-[13px] font-medium text-ink">
              {whoami ? whoami.member : "Loading…"}
            </div>
            <div className="truncate text-[11px] capitalize text-ink-tertiary">
              {whoami ? whoami.role : ""}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-page">
      {/* sidebar: fixed 264px, icons-only at ≤1024px, drawer at ≤768px */}
      <aside className="fixed inset-y-0 left-0 z-30 w-[264px] border-r border-line max-lg:w-16 max-md:hidden">
        {sidebar}
      </aside>
      {drawerOpen ? (
        <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal>
          <div
            className="absolute inset-0 bg-scrim"
            onClick={() => setDrawerOpen(false)}
            aria-hidden
          />
          <div className="panel-enter absolute inset-y-0 left-0 w-[264px] border-r border-line bg-sidebar shadow-md">
            <button
              type="button"
              onClick={() => setDrawerOpen(false)}
              aria-label="Close menu"
              className="absolute right-2 top-3.5 z-10 flex size-8 items-center justify-center rounded-ctl text-ink-secondary hover:bg-raised"
            >
              <X size={16} />
            </button>
            {sidebar}
          </div>
        </div>
      ) : null}

      <div className="pl-[264px] max-lg:pl-16 max-md:pl-0">
        {/* top bar */}
        <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-line bg-card px-6 max-md:px-4">
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open menu"
            className="hidden size-9 items-center justify-center rounded-ctl text-ink-secondary hover:bg-raised max-md:flex"
          >
            <List size={18} />
          </button>
          <nav aria-label="Breadcrumb" className="min-w-0 flex-1">
            <ol className="flex items-center gap-1.5 text-[13px]">
              <li className="truncate text-ink-tertiary">{crumb.section}</li>
              <li aria-hidden className="text-ink-tertiary">
                ›
              </li>
              <li className="truncate font-medium text-ink">{crumb.page}</li>
            </ol>
          </nav>
          <button
            type="button"
            aria-label="Notifications"
            className="flex size-9 items-center justify-center rounded-ctl text-ink-secondary hover:bg-raised"
          >
            <Bell size={18} />
          </button>
          <button
            type="button"
            aria-label="Share this view"
            onClick={() => {
              void navigator.clipboard?.writeText(window.location.href);
              setCopied(true);
              setTimeout(() => setCopied(false), 1500);
            }}
            className="flex h-9 items-center gap-1.5 rounded-ctl px-2.5 text-[13px] text-ink-secondary hover:bg-raised"
          >
            <ShareNetwork size={18} aria-hidden />
            {copied ? "Copied" : null}
          </button>
          {clerk ? (
            <UserButton />
          ) : (
            <span
              className="flex size-8 items-center justify-center rounded-full bg-navy text-[11px] font-semibold text-white"
              title={whoami ? `${whoami.member} (demo)` : "demo"}
            >
              {whoami ? initials(whoami.member) : "…"}
            </span>
          )}
        </header>

        <main className="mx-auto max-w-[1440px] p-6 max-md:p-4">{children}</main>
      </div>

      {paletteOpen ? (
        <CommandPalette
          consoleKey={consoleKey}
          onClose={() => setPaletteOpen(false)}
          onNavigate={(href) => {
            setPaletteOpen(false);
            router.push(href);
          }}
        />
      ) : null}
    </div>
  );
}

function CommandPalette({
  consoleKey,
  onClose,
  onNavigate,
}: {
  consoleKey: ConsoleKey;
  onClose: () => void;
  onNavigate: (href: string) => void;
}) {
  const [q, setQ] = useState("");
  const [cursor, setCursor] = useState(0);
  const def = CONSOLES[consoleKey];
  const items = useMemo(() => {
    const all = def.groups.flatMap((g) =>
      g.items.map((i) => ({ ...i, group: g.label })),
    );
    if (!q.trim()) return all;
    const needle = q.toLowerCase();
    return all.filter((i) => i.label.toLowerCase().includes(needle));
  }, [def, q]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
      <div className="absolute inset-0 bg-scrim" onClick={onClose} aria-hidden />
      <div className="panel-enter relative w-full max-w-lg rounded-card border border-line bg-card shadow-md">
        <div className="flex items-center gap-2 border-b border-line-light px-4">
          <MagnifyingGlass size={16} className="text-ink-tertiary" aria-hidden />
          <input
            autoFocus
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setCursor(0);
            }}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setCursor((c) => Math.min(c + 1, items.length - 1));
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setCursor((c) => Math.max(c - 1, 0));
              } else if (e.key === "Enter" && items[cursor]) {
                onNavigate(items[cursor].href);
              }
            }}
            placeholder="Go to…"
            aria-label="Search pages"
            className="h-12 flex-1 bg-transparent text-[14px] text-ink outline-none placeholder:text-ink-tertiary"
          />
          <span className="mono rounded border border-line bg-raised px-1.5 py-0.5 text-[10px] text-ink-tertiary">
            esc
          </span>
        </div>
        <ul className="max-h-72 overflow-y-auto p-1.5">
          {items.length === 0 ? (
            <li className="px-3 py-6 text-center text-[13px] text-ink-tertiary">
              No matches
            </li>
          ) : (
            items.map((item, i) => (
              <li key={item.href}>
                <button
                  type="button"
                  onClick={() => onNavigate(item.href)}
                  onMouseEnter={() => setCursor(i)}
                  className={`flex h-9 w-full items-center gap-2.5 rounded-ctl px-2.5 text-left text-[13px] ${
                    i === cursor
                      ? "bg-raised text-ink"
                      : "text-ink-secondary"
                  }`}
                >
                  <item.icon size={16} aria-hidden />
                  <span className="flex-1">{item.label}</span>
                  <span className="text-[11px] text-ink-tertiary">
                    {item.group}
                  </span>
                </button>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
