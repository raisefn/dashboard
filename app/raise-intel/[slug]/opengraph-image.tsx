import { ImageResponse } from "next/og";
import { getArticleBySlug } from "@/lib/raise-intel";

export const runtime = "nodejs";
export const alt = "Raise Intel article on raise(fn)";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function Image({ params }: Props) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  const title = article?.title ?? "Raise Intel";
  const subtitle = article?.hero_stat ?? article?.description ?? "Investor research from raise(fn)";

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
            Raise Intel
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", flex: 1, justifyContent: "center" }}>
          <div
            style={{
              fontSize: title.length > 60 ? 52 : title.length > 36 ? 64 : 76,
              fontWeight: 700,
              color: "#ffffff",
              lineHeight: 1.1,
              maxWidth: 1040,
              textWrap: "balance",
            }}
          >
            {title}
          </div>
          {subtitle && (
            <div
              style={{
                marginTop: 28,
                fontSize: 24,
                color: "#a1a1aa",
                maxWidth: 1040,
                lineHeight: 1.35,
              }}
            >
              {subtitle.length > 180 ? subtitle.slice(0, 177) + "…" : subtitle}
            </div>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ fontSize: 20, color: "#52525b" }}>
            What investors actually fund. From raise(fn).
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
    { ...size },
  );
}
