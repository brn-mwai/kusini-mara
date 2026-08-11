"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode, useEffect } from "react";
import { Recycle } from "@phosphor-icons/react";
import { CONSOLES } from "@/lib/console-routes";
import { ConsoleProviders } from "@/lib/providers";
import { useFieldQueue } from "@/lib/field-queue";
import { Mono } from "@/app/components/ui";

function BottomNav() {
  const pathname = usePathname();
  const queue = useFieldQueue();
  const items = CONSOLES.field.groups[0]!.items;
  return (
    <nav
      aria-label="Field navigation"
      className="fixed inset-x-0 bottom-0 z-30 flex h-14 border-t border-line bg-card pb-[env(safe-area-inset-bottom)]"
    >
      {items.map((item) => {
        const active =
          pathname === item.href ||
          (item.href !== "/field" && pathname.startsWith(`${item.href}/`));
        const badge = item.href === "/field/queue" ? queue.length : 0;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`relative flex min-h-12 flex-1 flex-col items-center justify-center gap-0.5 ${
              active ? "text-brand" : "text-ink-secondary"
            }`}
          >
            <span className="relative">
              <item.icon size={20} aria-hidden />
              {badge > 0 ? (
                <Mono
                  aria-label={`${badge} unsynced events`}
                  className="absolute -right-2.5 -top-1.5 flex size-4 items-center justify-center rounded-full bg-brand text-[9px] font-medium text-white"
                >
                  {badge > 9 ? "9+" : badge}
                </Mono>
              ) : null}
            </span>
            <span className="text-[10px] font-medium">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export function FieldChrome({ children }: { children: ReactNode }) {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      void navigator.serviceWorker
        .register("/field-sw.js", { scope: "/field" })
        .catch(() => {
          // Offline shell is a progressive enhancement; the app works without it.
        });
    }
  }, []);

  return (
    <ConsoleProviders consoleKey="field">
      <div className="min-h-screen bg-page pb-20">
        <header className="sticky top-0 z-20 flex h-12 items-center gap-2 border-b border-line bg-card px-4">
          <span className="flex size-6 items-center justify-center rounded-[6px] bg-brand text-white">
            <Recycle size={14} weight="bold" aria-hidden />
          </span>
          <span className="text-[14px] font-semibold text-ink">
            CycleTrack Field
          </span>
        </header>
        <main className="mx-auto max-w-xl p-4">{children}</main>
        <BottomNav />
      </div>
    </ConsoleProviders>
  );
}
