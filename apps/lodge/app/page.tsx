"use client";
import { Authenticated, Unauthenticated, AuthLoading } from "convex/react";
import { SignInButton } from "@clerk/nextjs";
import { EnsureAccount } from "@/components/EnsureAccount";

export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <>
      <AuthLoading>
        <Splash sub="Connecting…" />
      </AuthLoading>
      <Unauthenticated>
        <Landing />
      </Unauthenticated>
      <Authenticated>
        <EnsureAccount />
      </Authenticated>
    </>
  );
}

function Splash({ sub }: { sub: string }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        background: "var(--page)",
        color: "var(--text-2)",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <div className="sb-mono" style={{ width: 40, height: 40, margin: "0 auto 14px", fontSize: 18 }}>
          R
        </div>
        <div>{sub}</div>
      </div>
    </div>
  );
}

function Landing() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        background: "var(--page)",
        padding: 24,
      }}
    >
      <div
        style={{
          maxWidth: 420,
          width: "100%",
          background: "var(--card)",
          border: "1px solid var(--border)",
          borderRadius: 14,
          padding: 32,
          textAlign: "center",
          boxShadow: "var(--shadow)",
        }}
      >
        <div className="sb-mono" style={{ width: 44, height: 44, margin: "0 auto 16px", fontSize: 19 }}>
          R
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 600, letterSpacing: "-.02em", marginBottom: 6 }}>
          Kusini Lodge
        </h1>
        <p style={{ color: "var(--text-2)", fontSize: 14, marginBottom: 24 }}>
          Acknowledge inbound flights, assign ground staff, and never let a guest
          be stranded at an airstrip.
        </p>
        <SignInButton mode="modal">
          <button className="btn btn-primary" style={{ width: "100%", height: 40, justifyContent: "center" }}>
            <i className="ph ph-sign-in" /> Sign in to continue
          </button>
        </SignInButton>
      </div>
    </div>
  );
}
