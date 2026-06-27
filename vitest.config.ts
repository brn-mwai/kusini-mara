import { defineConfig } from "vitest/config";

// convex-test runs functions in an edge-like runtime.
export default defineConfig({
  test: {
    environment: "edge-runtime",
    include: ["tests/**/*.test.ts"],
    server: { deps: { inline: ["convex-test"] } },
  },
});
