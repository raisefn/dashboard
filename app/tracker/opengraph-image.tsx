import { ImageResponse } from "next/og";

// Tracker-section OG image — identical to root. See /app/opengraph-image.tsx
// for design rationale.

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
            display: "flex",
            backgroundImage:
              "linear-gradient(rgba(63,63,70,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(63,63,70,0.2) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        <svg
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
          width={1000}
          height={1000}
          viewBox="0 0 1000 1000"
        >
          {[
            { r: 110, color: "rgba(249,115,22,0.35)" },
            { r: 190, color: "rgba(45,212,191,0.28)" },
            { r: 280, color: "rgba(249,115,22,0.20)" },
            { r: 380, color: "rgba(45,212,191,0.14)" },
            { r: 490, color: "rgba(249,115,22,0.10)" },
          ].map((ring, i) => (
            <circle
              key={i}
              cx={500}
              cy={500}
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
              fontSize: 180,
              fontWeight: 900,
              letterSpacing: "-0.06em",
              lineHeight: 1,
            }}
          >
            <span style={{ color: "#f97316" }}>raise</span>
            <span style={{ color: "#2dd4bf" }}>(fn)</span>
          </div>
          <div
            style={{
              marginTop: 32,
              fontSize: 30,
              color: "#d4d4d8",
              textAlign: "center",
              whiteSpace: "nowrap",
            }}
          >
            Fundraising intelligence that gets smarter with every raise.
          </div>
        </div>

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
