import { ImageResponse } from "next/og";

// Root OG image — homepage hero design: concentric radar rings + logo +
// tagline on a dark background. Matches the visual of /app/page.tsx so
// shared links look like the actual product.
//
// Kept intentionally simple: nodejs runtime + system-ui fonts + no
// external fetches. The previous version with Geist Bold + Google Fonts
// edge fetch was returning HTTP 200 with 0 bytes (silent crash on
// Vercel's edge runtime). When in doubt, mirror the proven pattern from
// app/tracker/investors/[slug]/opengraph-image.tsx which has been
// reliably rendering.

export const runtime = "nodejs";
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
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background:
            "linear-gradient(135deg, #09090b 0%, #18181b 50%, #09090b 100%)",
          fontFamily: "system-ui, sans-serif",
          position: "relative",
        }}
      >
        {/* Concentric radar rings — match the HeroRings component on the homepage */}
        <svg
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
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

        {/* Logo */}
        <div
          style={{
            display: "flex",
            fontSize: 168,
            fontWeight: 800,
            letterSpacing: "-0.05em",
            lineHeight: 1,
          }}
        >
          <span style={{ color: "#f97316" }}>raise</span>
          <span style={{ color: "#2dd4bf" }}>(fn)</span>
        </div>

        {/* Tagline */}
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
    ),
    { ...size }
  );
}
