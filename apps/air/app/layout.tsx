import type { Metadata, Viewport } from "next";
import { ConvexClientProvider } from "./ConvexClientProvider";
import { ServiceWorker } from "@/components/ServiceWorker";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kusini Air — Operations",
  description:
    "Charter flight coordination. Build flights, schedule guest transfers, watch lodges acknowledge in real time.",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "Kusini Air", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  themeColor: "#1C3319",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="light" suppressHydrationWarning>
      <body>
        <ConvexClientProvider>{children}</ConvexClientProvider>
        <ServiceWorker />
      </body>
    </html>
  );
}
