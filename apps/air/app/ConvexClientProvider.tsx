"use client";
import { ReactNode, useState } from "react";
import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { useAuth } from "@clerk/nextjs";
import { ThemeProvider, ToastProvider } from "@kusini/ui";

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  // Construct lazily inside the component so importing this module never throws
  // when the env var is absent (e.g. a pre-credentials build).
  const [convex] = useState(
    () => new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!),
  );
  return (
    <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
      <ThemeProvider>
        <ToastProvider>{children}</ToastProvider>
      </ThemeProvider>
    </ConvexProviderWithClerk>
  );
}
