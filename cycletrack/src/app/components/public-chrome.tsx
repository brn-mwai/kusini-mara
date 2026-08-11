"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { Recycle } from "@phosphor-icons/react";
import { PublicProviders } from "@/lib/providers";

export function PublicChrome({ children }: { children: ReactNode }) {
  return (
    <PublicProviders>
      <div className="min-h-screen bg-page">
        <header className="sticky top-0 z-20 border-b border-line bg-card">
          <div className="mx-auto flex h-14 max-w-[1440px] items-center justify-between px-6 max-md:px-4">
            <Link href="/" className="flex items-center gap-2.5">
              <span className="flex size-7 items-center justify-center rounded-ctl bg-brand text-white">
                <Recycle size={16} weight="bold" aria-hidden />
              </span>
              <span className="text-[14px] font-semibold text-ink">
                CycleTrack{" "}
                <span className="font-normal text-ink-tertiary">by Revlog</span>
              </span>
            </Link>
            <nav className="flex items-center gap-1 text-[13px] font-medium">
              <Link
                href="/impact"
                className="rounded-ctl px-3 py-2 text-ink-secondary hover:bg-raised hover:text-ink"
              >
                Impact
              </Link>
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-[1440px] p-6 max-md:p-4">{children}</main>
      </div>
    </PublicProviders>
  );
}
