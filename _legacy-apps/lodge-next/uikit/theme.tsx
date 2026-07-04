"use client";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

export type ThemePref = "light" | "dark" | "system";

type ThemeCtx = {
  pref: ThemePref;
  setPref: (p: ThemePref) => void;
  resolved: "light" | "dark";
};

const Ctx = createContext<ThemeCtx | null>(null);

function systemDark(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  );
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [pref, setPrefState] = useState<ThemePref>("system");
  const [resolved, setResolved] = useState<"light" | "dark">("light");

  // Load saved preference once.
  useEffect(() => {
    const saved = (typeof localStorage !== "undefined" &&
      localStorage.getItem("kusini-theme")) as ThemePref | null;
    if (saved) setPrefState(saved);
  }, []);

  // Apply to <html data-theme> and track system changes.
  useEffect(() => {
    const apply = () => {
      const dark = pref === "dark" || (pref === "system" && systemDark());
      const next = dark ? "dark" : "light";
      setResolved(next);
      document.documentElement.setAttribute("data-theme", next);
    };
    apply();
    if (pref === "system") {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      mq.addEventListener("change", apply);
      return () => mq.removeEventListener("change", apply);
    }
  }, [pref]);

  const setPref = (p: ThemePref) => {
    setPrefState(p);
    try {
      localStorage.setItem("kusini-theme", p);
    } catch {}
  };

  return <Ctx.Provider value={{ pref, setPref, resolved }}>{children}</Ctx.Provider>;
}

export function useTheme(): ThemeCtx {
  const v = useContext(Ctx);
  if (!v) throw new Error("useTheme must be used within ThemeProvider");
  return v;
}
