import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Dev-only: let the dev server accept asset requests when browsed via
  // 127.0.0.1 (Next allows only `localhost` out of the box).
  allowedDevOrigins: ["127.0.0.1"],
  devIndicators: false,
  // FIXTURE_DEMO=1 swaps "convex/react" for the read-only demo shim that
  // serves outputs captured from the real backend run in-memory. Never set in
  // production; without the env var the real package resolves as normal.
  turbopack: process.env.FIXTURE_DEMO
    ? {
        resolveAlias: {
          "convex/react": "./src/lib/demo/convex-react.tsx",
        },
      }
    : {},
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
