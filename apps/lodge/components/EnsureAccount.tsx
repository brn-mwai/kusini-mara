"use client";
import { useEffect, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Dashboard } from "./Dashboard";

// On first sign-in, link the Clerk identity to the lodge org, then render the
// dashboard. `me` is the gate: once it resolves, the account exists.
export function EnsureAccount() {
  const me = useQuery(api.users.me);
  const ensure = useMutation(api.users.ensureForApp);
  const [tried, setTried] = useState(false);

  useEffect(() => {
    if (me === null && !tried) {
      setTried(true);
      ensure({ app: "lodge" }).catch(() => {});
    }
  }, [me, tried, ensure]);

  if (me === undefined || me === null) {
    return (
      <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", color: "var(--text-2)" }}>
        Linking your account…
      </div>
    );
  }
  return <Dashboard me={me} />;
}
