"use client";

import type { ReactNode } from "react";
import { ConsoleProviders } from "@/lib/providers";
import { Shell } from "@/app/components/shell";

export default function PartnersLayout({ children }: { children: ReactNode }) {
  return (
    <ConsoleProviders consoleKey="partners">
      <Shell consoleKey="partners">{children}</Shell>
    </ConsoleProviders>
  );
}
