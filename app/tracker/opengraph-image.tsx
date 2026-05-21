import { ImageResponse } from "next/og";

// Tracker-section OG image. Inherited by all /tracker/* pages that don't
// define their own opengraph-image.tsx (per-investor / per-project /
// per-sector pages have section-specific ones already).
//
// Matches the root /app/opengraph-image.tsx design language so the brand
// reads consistently across all shared links.

export const runtime = "edge";
export const alt = "raise(fn) Tracker — Live Fundraising Intelligence";
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
          background:
            "linear-gradient(135deg, #09090b 0%, #18181b 50%, #09090b 100%)",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Logo */}
        <div style={{ display: "flex", fontSize: 84, fontWeight: 700 }}>
          <span style={{ color: "#f97316" }}>raise</span>
          <span style={{ color: "#2dd4bf" }}>(fn)</span>
        </div>

        {/* Section label */}
        <div
          style={{
            marginTop: 8,
            fontSize: 56,
            fontWeight: 600,
            color: "#fafafa",
          }}
        >
          Tracker
        </div>

        {/* Tagline */}
        <div
          style={{
            marginTop: 24,
            fontSize: 26,
            color: "#a1a1aa",
            textAlign: "center",
            maxWidth: 800,
          }}
        >
          Live fundraising intelligence from SEC filings, 13F holdings,
          and traction signals.
        </div>

        {/* Brand accent line */}
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
