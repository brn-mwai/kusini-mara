import type { Metadata, Viewport } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { ConvexClientProvider } from "./ConvexClientProvider";
import { ServiceWorker } from "@/components/ServiceWorker";
import { SetupRequired } from "@/components/SetupRequired";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kusini Lodge — Operations",
  description:
    "Guest transfer coordination for safari lodges. Acknowledge flights, assign ground staff, never strand a guest.",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "Kusini Lodge", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  themeColor: "#1C3319",
  width: "device-width",
  initialScale: 1,
};

// Build-safe: render a setup notice (no Clerk/Convex) until real keys exist, so
// the app deploys before credentials are wired and activates the moment they are.
const pk = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
const clerkEnabled = !!pk && pk.startsWith("pk_") && !pk.includes("placeholder");

export default function RootLayout({ children }: { children: React.ReactNode }) {
  if (!clerkEnabled) {
    return (
      <html lang="en" data-theme="light">
        <body>
          <SetupRequired app="Lodge" />
        </body>
      </html>
    );
  }
  return (
    <ClerkProvider>
      <html lang="en" data-theme="light" suppressHydrationWarning>
        <body>
          <ConvexClientProvider>{children}</ConvexClientProvider>
          <ServiceWorker />
        </body>
      </html>
    </ClerkProvider>
  );
}
