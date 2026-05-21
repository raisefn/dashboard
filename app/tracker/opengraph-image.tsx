import { ImageResponse } from "next/og";

// Tracker-section OG image — same hero design as root, no section label.
// Per Justin's call: every shared link should look like the homepage hero
// (radar rings + grid + raise(fn) logo + tagline). Section-specific labels
// were dropped because they made the card look like fragmented marketing
// rather than the actual product.
//
// Kept as a separate file (vs deleting and inheriting) because the tracker
// layout.tsx references /tracker/opengraph-image explicitly. Eventually
// can be deduped; for now identical content with separate URLs is clear
// and predictable.

export const runtime = "edge";
export const alt =
  "raise(fn) — Fundraising intelligence that gets smarter with every raise";
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
          alignItems: "center",
          justifyContent: "center",
          background: "#09090b",
          fontFamily: "system-ui, sans-serif",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage:
              "linear-gradient(rgba(63,63,70,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(63,63,70,0.15) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        <svg
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
          }}
          width={900}
          height={900}
          viewBox="0 0 900 900"
        >
          {[
            { r: 90, color: "rgba(249,115,22,0.18)" },
            { r: 160, color: "rgba(45,212,191,0.15)" },
            { r: 240, color: "rgba(249,115,22,0.11)" },
            { r: 330, color: "rgba(45,212,191,0.08)" },
            { r: 430, color: "rgba(249,115,22,0.05)" },
          ].map((ring, i) => (
            <circle
              key={i}
              cx={450}
              cy={450}
              r={ring.r}
              fill="none"
              stroke={ring.color}
              strokeWidth={1.5}
              strokeDasharray="8 6"
            />
          ))}
        </svg>

        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 156,
              fontWeight: 700,
              letterSpacing: "-0.04em",
              lineHeight: 1,
            }}
          >
            <span style={{ color: "#f97316" }}>raise</span>
            <span style={{ color: "#2dd4bf" }}>(fn)</span>
          </div>
          <div
            style={{
              marginTop: 28,
              fontSize: 32,
              color: "#a1a1aa",
              textAlign: "center",
              maxWidth: 800,
            }}
          >
            Fundraising intelligence that gets smarter with every raise.
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
