import { listArticles } from "@/lib/raise-intel";

// RSS 2.0 feed for Raise Intel articles. Discoverable at
// raisefn.com/raise-intel/feed.xml. AI search engines (ChatGPT,
// Perplexity, Claude, Gemini) crawl RSS as a freshness-discovery
// signal — adding new articles to their indexes faster than waiting
// for crawler revisits. Power readers (Feedly, Reeder, NetNewsWire)
// can subscribe too, though that traffic will be small.
//
// Cached for 1 hour at the edge so the feed reflects new publishes
// quickly without re-reading the markdown files on every request.

export const revalidate = 3600;

const SITE = "https://www.raisefn.com";

function escape(text: string): string {
  // Minimal XML escaping for text fields. Doesn't escape characters
  // already inside CDATA wrappers — we use CDATA for descriptions to
  // sidestep most escaping needs there.
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function rfc822Date(iso: string): string {
  // RSS 2.0 requires RFC 822 date format. Date.prototype.toUTCString
  // returns exactly this format ("Wed, 18 Jun 2026 12:00:00 GMT").
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return new Date().toUTCString();
  return d.toUTCString();
}

export async function GET() {
  const articles = await listArticles();

  const channelTitle = "Raise Intel — raise(fn)";
  const channelDescription =
    "Field research on how fundraising actually works in 2026 — what investors fund, how rounds close, and where founders waste cycles. Sourced from real round data, not Twitter advice.";
  const channelUrl = `${SITE}/raise-intel`;
  const feedUrl = `${SITE}/raise-intel/feed.xml`;
  const lastBuildDate =
    articles.length > 0
      ? rfc822Date(articles[0].updated_at || articles[0].published_at)
      : new Date().toUTCString();

  const items = articles
    .map((a) => {
      const link = `${SITE}/raise-intel/${a.slug}`;
      const pubDate = rfc822Date(a.published_at);
      // Wrap title and description in CDATA so embedded punctuation,
      // em-dashes, and quotes don't require manual XML escaping. Slug
      // serves as a stable guid (isPermaLink=false because slug isn't
      // a URL on its own).
      return `    <item>
      <title><![CDATA[${a.title}]]></title>
      <link>${link}</link>
      <guid isPermaLink="false">${escape(a.slug)}</guid>
      <pubDate>${pubDate}</pubDate>
      <description><![CDATA[${a.description}]]></description>
      <category>${escape(a.category)}</category>
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escape(channelTitle)}</title>
    <link>${channelUrl}</link>
    <atom:link href="${feedUrl}" rel="self" type="application/rss+xml" />
    <description>${escape(channelDescription)}</description>
    <language>en-us</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
