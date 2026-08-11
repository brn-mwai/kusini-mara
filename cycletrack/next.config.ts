import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Host-based rewrites: each console subdomain maps onto its path prefix.
  // The paths themselves are the build target; rewrites are transparent.
  async rewrites() {
    const consoles = [
      { host: "oem", prefix: "/oem" },
      { host: "partners", prefix: "/partners" },
      { host: "field", prefix: "/field" },
      { host: "admin", prefix: "/admin" },
    ];
    return consoles.map(({ host, prefix }) => ({
      source: "/:path*",
      has: [{ type: "host" as const, value: `${host}.cycletrack.revlog.io` }],
      destination: `${prefix}/:path*`,
    }));
  },
  async headers() {
    return [
      {
        source: "/field-sw.js",
        headers: [
          { key: "Service-Worker-Allowed", value: "/field" },
          { key: "Cache-Control", value: "no-cache" },
        ],
      },
    ];
  },
};

export default nextConfig;
