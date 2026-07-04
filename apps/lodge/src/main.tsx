import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ConvexProvider, ConvexReactClient } from "convex/react";

import "@ui/theme-constants/theme-light.css";
import "@ui/theme-constants/theme-dark.css";
import { ThemeProvider } from "@ui/theme-constants/ThemeProvider";

import { App } from "./App";

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ConvexProvider client={convex}>
      <ThemeProvider colorScheme="light">
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ThemeProvider>
    </ConvexProvider>
  </StrictMode>,
);
