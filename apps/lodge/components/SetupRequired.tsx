export function SetupRequired({ app }: { app: string }) {
  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "#FAFCF1", padding: 24, fontFamily: "system-ui, sans-serif" }}>
      <div style={{ maxWidth: 460, background: "#fff", border: "1px solid #DBDED4", borderRadius: 14, padding: 32 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: "#1C3319", marginBottom: 10 }}>
          Kusini {app} — setup required
        </h1>
        <p style={{ color: "#5C6356", fontSize: 14, lineHeight: 1.6 }}>
          Set <code>NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY</code> and{" "}
          <code>CLERK_SECRET_KEY</code> (and point <code>NEXT_PUBLIC_CONVEX_URL</code>{" "}
          at the shared Convex deployment) to activate authentication. See the
          README “Deploy” section.
        </p>
      </div>
    </div>
  );
}
