import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { FieldChrome } from "./field-chrome";

export const metadata: Metadata = {
  title: "Field",
  manifest: "/field-manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "CT Field",
  },
  icons: { icon: "/field-icon.svg", apple: "/field-icon.svg" },
};

export const viewport: Viewport = {
  themeColor: "#FF6200",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function FieldLayout({ children }: { children: ReactNode }) {
  return <FieldChrome>{children}</FieldChrome>;
}
