import { StrictMode, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ConvexProvider, ConvexReactClient } from "convex/react";

import "@ui/theme-constants/theme-light.css";
import "@ui/theme-constants/theme-dark.css";
import { ThemeProvider } from "@ui/theme-constants/ThemeProvider";

import { App } from "./App";
import { ColorSchemeContext } from "./shell/ColorSchemeContext";

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string);

const Root = () => {
  const [colorScheme, setColorScheme] = useState<"light" | "dark">(
    () => (localStorage.getItem("kusini-color-scheme") as "light" | "dark") ?? "dark",
  );

  useEffect(() => {
    localStorage.setItem("kusini-color-scheme", colorScheme);
  }, [colorScheme]);

  return (
    <ConvexProvider client={convex}>
      <ColorSchemeContext.Provider value={{ colorScheme, setColorScheme }}>
        <ThemeProvider colorScheme={colorScheme}>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </ThemeProvider>
      </ColorSchemeContext.Provider>
    </ConvexProvider>
  );
};

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
);
