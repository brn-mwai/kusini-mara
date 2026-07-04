import { createContext } from "react";

export const ColorSchemeContext = createContext<{
  colorScheme: "light" | "dark";
  setColorScheme: (scheme: "light" | "dark") => void;
}>({ colorScheme: "dark", setColorScheme: () => undefined });
