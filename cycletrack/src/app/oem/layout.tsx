"use client";

import type { ReactNode } from "react";
import { ConsoleProviders } from "@/lib/providers";
import { Shell } from "@/app/components/shell";

export default function OemLayout({ children }: { children: ReactNode }) {
  return (
    <ConsoleProviders consoleKey="oem">
      <Shell consoleKey="oem">{children}</Shell>
    </ConsoleProviders>
  );
}
