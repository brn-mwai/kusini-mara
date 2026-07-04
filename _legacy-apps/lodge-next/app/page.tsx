"use client";
import { useEffect, useState } from "react";
import { Dashboard } from "@/components/Dashboard";

export const dynamic = "force-dynamic";

// Demo account (fake auth — no Clerk). The Lodge app always acts as Riverbend.
const ME = {
  name: "Mary Wanjiru",
  role: "Duty contact",
  org: { name: "Riverbend", type: "lodge" as const, shortCode: "R" },
};

export default function Home() {
  const [authed, setAuthed] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setAuthed(localStorage.getItem("kusini-demo-lodge") === "1");
    setReady(true);
  }, []);

  if (!ready) return null;
  if (!authed)
    return <Login onEnter={() => { localStorage.setItem("kusini-demo-lodge", "1"); setAuthed(true); }} />;
  return <Dashboard me={ME} />;
}

function Login({ onEnter }: { onEnter: () => void }) {
  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "var(--page)", padding: 24 }}>
      <form
        onSubmit={(e) => { e.preventDefault(); onEnter(); }}
        style={{ maxWidth: 380, width: "100%", background: "var(--card)", border: "1px solid var(--border)", borderRadius: 14, padding: 32, textAlign: "center", boxShadow: "var(--shadow)" }}
      >
        <div className="sb-mono" style={{ width: 44, height: 44, margin: "0 auto 16px", fontSize: 19 }}>R</div>
        <h1 style={{ fontSize: 22, fontWeight: 600, letterSpacing: "-.02em", marginBottom: 4 }}>Kusini Lodge</h1>
        <p style={{ color: "var(--text-2)", fontSize: 13.5, marginBottom: 20 }}>Riverbend · duty operations</p>
        <div className="field" style={{ textAlign: "left" }}>
          <label>Email</label>
          <input defaultValue="mary@riverbend.demo" />
        </div>
        <div className="field" style={{ textAlign: "left" }}>
          <label>Password</label>
          <input type="password" defaultValue="demo" />
        </div>
        <button className="btn btn-primary" type="submit" style={{ width: "100%", height: 40, justifyContent: "center", marginTop: 4 }}>
          <i className="ph ph-sign-in" /> Enter demo
        </button>
        <p style={{ color: "var(--text-3)", fontSize: 11.5, marginTop: 14 }}>Demo - any credentials work</p>
      </form>
    </div>
  );
}
