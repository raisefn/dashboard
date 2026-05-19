import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const alt = "Sector funding activity on raise(fn)";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

interface Props {
  params: Promise<{ sector: string }>;
}

export default async function Image({ params }: Props) {
  const { sector } = await params;
  const sectorName = decodeURIComponent(sector).replace(/_/g, " ");
  const display = sectorName.charAt(0).toUpperCase() + sectorName.slice(1);

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
            Tracker · Sector
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", flex: 1, justifyContent: "center" }}>
          <div
            style={{
              fontSize: 28,
              color: "#71717a",
              marginBottom: 16,
              textTransform: "uppercase",
              letterSpacing: "0.15em",
            }}
          >
            Active Funding In
          </div>
          <div
            style={{
              fontSize: 100,
              fontWeight: 700,
              color: "#ffffff",
              lineHeight: 1.0,
              textTransform: "capitalize",
            }}
          >
            {display}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ fontSize: 20, color: "#52525b" }}>
            Recent rounds, top investors, and capital flowing into the sector.
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
