import { ImageResponse } from "next/og";

export const alt = "Petal & Papers — Handmade & Personalized Gifts";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Default social-share card (WhatsApp, Facebook, LinkedIn, X, iMessage…) for
// every page that doesn't supply its own image. Brand palette from globals.css.
export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #1e2a4a 0%, #34456b 100%)",
          color: "#faf6ee",
          padding: 64,
          textAlign: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 28,
            letterSpacing: 8,
            textTransform: "uppercase",
            color: "#c79a5d",
          }}
        >
          Handcrafted · Personalized · Made with Love
        </div>
        <div style={{ display: "flex", fontSize: 108, marginTop: 28, fontFamily: "serif" }}>
          Petal &amp; Papers
        </div>
        <div style={{ display: "flex", width: 160, height: 3, background: "#c79a5d", marginTop: 32 }} />
        <div style={{ display: "flex", fontSize: 40, marginTop: 32, color: "#f3d9de" }}>
          Handmade &amp; customized gifts, delivered across India
        </div>
        <div style={{ display: "flex", fontSize: 30, marginTop: 20, color: "#aab8a7" }}>
          Scrapbooks · Explosion Boxes · Crochet Bouquets · Hampers
        </div>
      </div>
    ),
    { ...size },
  );
}
