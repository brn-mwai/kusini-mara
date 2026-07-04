import { resolve } from "node:path";

import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";
import svgr from "vite-plugin-svgr";

const twentyUiSrc = resolve(__dirname, "../../packages/twenty-ui/src");

export default defineConfig({
  plugins: [react(), svgr()],
  resolve: {
    alias: {
      "@ui": twentyUiSrc,
      "@assets/": `${resolve(twentyUiSrc, "assets")}/`,
      "@styles/": `${resolve(twentyUiSrc, "styles")}/`,
      "@convex": resolve(__dirname, "../../convex/_generated"),
      "@": resolve(__dirname, "src"),
    },
  },
  css: {
    modules: {
      localsConvention: "camelCaseOnly",
    },
    preprocessorOptions: {
      scss: {
        api: "modern-compiler",
        loadPaths: [resolve(__dirname, "../../packages/twenty-ui/src/styles")],
        additionalData: [
          `@use 'abstracts/functions' as *;`,
          `@use 'abstracts/mixins' as *;`,
          `@use 'abstracts/breakpoints' as *;`,
          "",
        ].join("\n"),
      },
    },
  },
  server: { port: 3000 },
});
