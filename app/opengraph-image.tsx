import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "raise(fn) — Fundraising Intelligence for Startups";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
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
          background: "linear-gradient(135deg, #09090b 0%, #18181b 50%, #09090b 100%)",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Logo */}
        <div style={{ display: "flex", fontSize: 96, fontWeight: 700 }}>
          <span style={{ color: "#f97316" }}>raise</span>
          <span style={{ color: "#2dd4bf" }}>(fn)</span>
        </div>

        {/* Tagline */}
        <div
          style={{
            marginTop: 24,
            fontSize: 28,
            color: "#a1a1aa",
            textAlign: "center",
            maxWidth: 700,
          }}
        >
          The intelligence layer for startup fundraising.
        </div>

        {/* Subtle border line */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 4,
            background: "linear-gradient(90deg, #f97316, #2dd4bf)",
          }}
        />
      </div>
    ),
    { ...size }
  );
}
