"use client";

// Last-resort boundary: replaces the root layout, so it carries its own html
// shell and inline styling only.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          fontFamily: "system-ui, sans-serif",
          display: "flex",
          minHeight: "100vh",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ textAlign: "center", maxWidth: 420, padding: 24 }}>
          <h1 style={{ fontSize: 18, fontWeight: 600 }}>
            CycleTrack hit an unexpected error
          </h1>
          <p style={{ fontSize: 13, opacity: 0.7, marginTop: 8 }}>
            {error.digest ? `Reference: ${error.digest}` : error.message}
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: 16,
              height: 36,
              padding: "0 16px",
              borderRadius: 8,
              border: "1px solid #ccc",
              background: "#fff",
              cursor: "pointer",
            }}
          >
            Retry
          </button>
        </div>
      </body>
    </html>
  );
}
