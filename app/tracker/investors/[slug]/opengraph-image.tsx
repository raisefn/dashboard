import { ImageResponse } from "next/og";
import { getInvestor } from "@/lib/api";

export const runtime = "nodejs";
export const alt = "Investor profile on raise(fn)";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

interface Props {
  params: Promise<{ slug: string }>;
}

function nameFromSlug(slug: string): string {
  return slug
    .split("-")
    .map((p) => (p.length > 0 ? p[0].toUpperCase() + p.slice(1) : p))
    .join(" ");
}

export default async function Image({ params }: Props) {
  const { slug } = await params;

  let name = nameFromSlug(slug);
  let subtitle = "Investor Profile";

  try {
    const inv = await getInvestor(slug);
    if (inv.name) name = inv.name;
    const parts: string[] = [];
    if (inv.type) parts.push(inv.type);
    if (inv.hq_location) parts.push(inv.hq_location);
    if (parts.length) subtitle = parts.join(" · ");
  } catch {
    // Slug fallback applies.
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "60px 80px",
          background: "linear-gradient(135deg, #09090b 0%, #18181b 60%, #09090b 100%)",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Top: brand + section label */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", fontSize: 36, fontWeight: 700 }}>
            <span style={{ color: "#f97316" }}>raise</span>
            <span style={{ color: "#2dd4bf" }}>(fn)</span>
          </div>
          <div
            style={{
              fontSize: 18,
              color: "#71717a",
              textTransform: "uppercase",
              letterSpacing: "0.2em",
            }}
          >
            Tracker · Investor
          </div>
        </div>

        {/* Middle: investor name */}
        <div style={{ display: "flex", flexDirection: "column", flex: 1, justifyContent: "center" }}>
          <div
            style={{
              fontSize: name.length > 24 ? 64 : 84,
              fontWeight: 700,
              color: "#ffffff",
              lineHeight: 1.05,
              maxWidth: 1040,
              textWrap: "balance",
            }}
          >
            {name}
          </div>
          <div
            style={{
              marginTop: 24,
              fontSize: 28,
              color: "#a1a1aa",
              maxWidth: 1040,
            }}
          >
            {subtitle}
          </div>
        </div>

        {/* Bottom: data source attribution + accent line */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ fontSize: 20, color: "#52525b" }}>
            Tracked from SEC filings, 13F holdings, and public records.
          </div>
          <div
            style={{
              height: 4,
              background: "linear-gradient(90deg, #f97316, #2dd4bf)",
            }}
          />
        </div>
      </div>
    ),
    { ...size }
  );
}
