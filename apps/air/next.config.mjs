import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@kusini/ui"],
  eslint: { ignoreDuringBuilds: true },
  // Monorepo: trace from the repo root, not the inferred parent lockfile dir.
  outputFileTracingRoot: path.join(__dirname, "../../"),
};

export default nextConfig;
