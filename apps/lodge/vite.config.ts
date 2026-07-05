import { resolve } from "node:path";

import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";
import svgr from "vite-plugin-svgr";

const twentyUiSrc = resolve(__dirname, "../../packages/twenty-ui/src");

export default defineConfig({
  plugins: [react(), svgr()],
  resolve: {
    alias: {
      "twenty-sdk/define": resolve(__dirname, "../../packages/twenty-sdk/src/sdk/define"),
      "twenty-shared": resolve(__dirname, "../../packages/twenty-shared/src"),
      "kusini-app": resolve(__dirname, "../../packages/kusini-app/src"),
      "@/ai": resolve(__dirname, "../../packages/twenty-shared/src/ai"),
      "@/application": resolve(__dirname, "../../packages/twenty-shared/src/application"),
      "@/constants": resolve(__dirname, "../../packages/twenty-shared/src/constants"),
      "@/database-events": resolve(__dirname, "../../packages/twenty-shared/src/database-events"),
      "@/i18n": resolve(__dirname, "../../packages/twenty-shared/src/i18n"),
      "@/logic-function": resolve(__dirname, "../../packages/twenty-shared/src/logic-function"),
      "@/metadata": resolve(__dirname, "../../packages/twenty-shared/src/metadata"),
      "@/testing": resolve(__dirname, "../../packages/twenty-shared/src/testing"),
      "@/timeline": resolve(__dirname, "../../packages/twenty-shared/src/timeline"),
      "@/translations": resolve(__dirname, "../../packages/twenty-shared/src/translations"),
      "@/types": resolve(__dirname, "../../packages/twenty-shared/src/types"),
      "@/utils": resolve(__dirname, "../../packages/twenty-shared/src/utils"),
      "@/vite": resolve(__dirname, "../../packages/twenty-shared/src/vite"),
      "@/workflow": resolve(__dirname, "../../packages/twenty-shared/src/workflow"),
      "@/workspace": resolve(__dirname, "../../packages/twenty-shared/src/workspace"),
      "@/sdk": resolve(__dirname, "../../packages/twenty-sdk/src/sdk"),
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
