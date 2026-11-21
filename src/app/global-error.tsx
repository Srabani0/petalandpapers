"use client";

/** Last-resort fallback when the root layout itself fails (no app styles are guaranteed here). */
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en-IN">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#faf6ee",
          color: "#1e2a4a",
          fontFamily: "Georgia, serif",
          textAlign: "center",
          padding: 24,
        }}
      >
        <div style={{ maxWidth: 420 }}>
          <p style={{ fontSize: 40, margin: 0 }}>🌸</p>
          <h1 style={{ fontSize: 26, margin: "16px 0 8px" }}>Petal &amp; Papers will be right back</h1>
          <p style={{ color: "#7a756c", fontFamily: "system-ui, sans-serif", lineHeight: 1.5 }}>
            Something went wrong on our side. Please try again in a moment.
          </p>
          <button
            onClick={reset}
            style={{
              marginTop: 20,
              background: "#1e2a4a",
              color: "#faf6ee",
              border: 0,
              borderRadius: 999,
              padding: "12px 24px",
              fontSize: 15,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
