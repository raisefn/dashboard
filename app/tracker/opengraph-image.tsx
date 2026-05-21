import { ImageResponse } from "next/og";

// Tracker-section OG image — same hero design as root, no section label.
// Identical to /app/opengraph-image.tsx; lives here because the tracker
// layout.tsx references /tracker/opengraph-image explicitly. Eventually
// can be deduped via a shared helper module; for now standalone files
// keep each route independent and easy to reason about.

export const runtime = "edge";
export const alt =
  "raise(fn) — Fundraising intelligence that gets smarter with every raise";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

async function loadGeistBold(): Promise<ArrayBuffer | null> {
  try {
    const cssResponse = await fetch(
      "https://fonts.googleapis.com/css2?family=Geist:wght@700&display=swap",
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
        },
      }
    );
    if (!cssResponse.ok) return null;
    const css = await cssResponse.text();
    const match = css.match(/src: url\((https:\/\/[^)]+\.woff2)\)/);
    if (!match) return null;
    const fontResponse = await fetch(match[1]);
    if (!fontResponse.ok) return null;
    return await fontResponse.arrayBuffer();
  } catch {
    return null;
  }
}

export default async function Image() {
  const geistBold = await loadGeistBold();

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
          fontFamily: "Geist, system-ui, sans-serif",
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
              fontSize: 168,
              fontWeight: 700,
              letterSpacing: "-0.05em",
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
              fontWeight: 400,
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
    {
      ...size,
      ...(geistBold
        ? {
            fonts: [
              {
                name: "Geist",
                data: geistBold,
                style: "normal" as const,
                weight: 700 as const,
              },
            ],
          }
        : {}),
    }
  );
}
