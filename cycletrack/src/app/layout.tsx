import type { Metadata } from "next";
import "@fontsource-variable/inter";
import "@fontsource/dm-mono/400.css";
import "@fontsource/dm-mono/500.css";
import "./console.css";

export const metadata: Metadata = {
  title: { default: "CycleTrack", template: "%s · CycleTrack" },
  description:
    "CycleTrack by Revlog — battery traceability from first registration to final disposition.",
};

// The root layout mounts no provider. Each console layout mounts its own
// Clerk application and Convex client; public pages mount Convex only.
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
