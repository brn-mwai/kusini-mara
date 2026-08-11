"use client";

import type { ReactNode } from "react";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { ConsoleProviders } from "@/lib/providers";
import { Shell } from "@/app/components/shell";

function AdminChrome({ children }: { children: ReactNode }) {
  const queue = useQuery(api.permits.reviewQueue, {});
  const pending = queue?.filter((p) => p.status === "pending").length;
  return (
    <Shell
      consoleKey="admin"
      badges={pending ? { "/admin/verification": pending } : undefined}
    >
      {children}
    </Shell>
  );
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <ConsoleProviders consoleKey="admin">
      <AdminChrome>{children}</AdminChrome>
    </ConsoleProviders>
  );
}
