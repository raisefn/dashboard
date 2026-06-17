import type { MetadataRoute } from "next";
import { getInvestors, getProjects } from "@/lib/api";

const SITE = "https://www.raisefn.com";

// Regenerate the sitemap once per day. Tracker data changes frequently, but
// daily resolution is sufficient for SEO crawl-budget purposes.
export const revalidate = 86400;

const NOW = new Date();

// Static marketing + content pages. Per-page priority weights skew toward
// pages with the most editorial value / inbound search intent.
//
// Marketing v3 (2026-06-10): top nav audience pages (/founders /investors
// /agents) added as P0.8. /sdk removed — 301s to /agents per next.config.
// /brain landing demoted but kept indexed (footer access).
const STATIC_PAGES: MetadataRoute.Sitemap = [
  { url: `${SITE}/`, lastModified: NOW, changeFrequency: "weekly", priority: 1.0 },
  // Audience landing pages — primary CTA surfaces for organic + paid
  { url: `${SITE}/founders`, lastModified: NOW, changeFrequency: "weekly", priority: 0.9 },
  { url: `${SITE}/investors`, lastModified: NOW, changeFrequency: "weekly", priority: 0.9 },
  { url: `${SITE}/agents`, lastModified: NOW, changeFrequency: "weekly", priority: 0.8 },
  // Tracker — public catalog drives the biggest share of organic traffic
  { url: `${SITE}/tracker`, lastModified: NOW, changeFrequency: "daily", priority: 0.9 },
  { url: `${SITE}/tracker/investors`, lastModified: NOW, changeFrequency: "daily", priority: 0.9 },
  { url: `${SITE}/tracker/projects`, lastModified: NOW, changeFrequency: "daily", priority: 0.9 },
  { url: `${SITE}/tracker/rounds`, lastModified: NOW, changeFrequency: "daily", priority: 0.9 },
  { url: `${SITE}/tracker/feed`, lastModified: NOW, changeFrequency: "daily", priority: 0.8 },
  { url: `${SITE}/tracker/pulse`, lastModified: NOW, changeFrequency: "daily", priority: 0.8 },
  // Brain landing kept indexed; surfaced via footer post-revamp
  { url: `${SITE}/brain`, lastModified: NOW, changeFrequency: "weekly", priority: 0.7 },
  { url: `${SITE}/pricing`, lastModified: NOW, changeFrequency: "monthly", priority: 0.8 },
  { url: `${SITE}/thesis`, lastModified: NOW, changeFrequency: "monthly", priority: 0.6 },
  // Trust pages — describe matching + learning. Strong inbound search intent
  // ("how does X match investors?", "AI investor matching") + internal SEO
  // backlinks from /founders, /investors, and footer Company section.
  { url: `${SITE}/how-we-match`, lastModified: NOW, changeFrequency: "monthly", priority: 0.7 },
  { url: `${SITE}/how-we-learn`, lastModified: NOW, changeFrequency: "monthly", priority: 0.7 },
  { url: `${SITE}/roadmap`, lastModified: NOW, changeFrequency: "weekly", priority: 0.5 },
  { url: `${SITE}/investors/join`, lastModified: NOW, changeFrequency: "monthly", priority: 0.7 },
  { url: `${SITE}/privacy`, lastModified: NOW, changeFrequency: "yearly", priority: 0.3 },
  { url: `${SITE}/terms`, lastModified: NOW, changeFrequency: "yearly", priority: 0.3 },
];

// Google's per-sitemap limit. We're well under for now (14K investors + N
// projects), but the safety cap protects against silent overflow if the
// catalog grows past 50K. If we ever cross it, switch to a sitemap index.
const MAX_URLS_PER_SITEMAP = 49000;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const investors = await fetchAllInvestors();
  const projects = await fetchAllProjects();
  return [...STATIC_PAGES, ...investors, ...projects];
}

async function fetchAllInvestors(): Promise<MetadataRoute.Sitemap> {
  const out: MetadataRoute.Sitemap = [];
  const limit = 100;
  let offset = 0;
  // Cap to 10 pages = 1000 investor URLs. Local builds hit 401 fast and
  // never even loop; Vercel builds have a working API key and previously
  // walked the full 14K-row catalog, exceeding the 60s static-gen budget
  // and crashing the build. 1000 URLs is plenty for SEO crawl-budget at
  // this stage; we'll switch to a sitemap index once dynamic content
  // scales past a few thousand entries.
  const MAX_PAGES = 10;
  for (let i = 0; i < MAX_PAGES; i++) {
    try {
      const res = await getInvestors({ limit, offset });
      for (const inv of res.data) {
        if (!inv.slug) continue;
        out.push({
          url: `${SITE}/tracker/investors/${inv.slug}`,
          lastModified: NOW,
          changeFrequency: "weekly",
          priority: 0.5,
        });
      }
      if (!res.meta.has_more) break;
      offset += limit;
      if (out.length >= MAX_URLS_PER_SITEMAP - STATIC_PAGES.length - 5000) {
        // Reserve room for projects + buffer
        break;
      }
    } catch (e) {
      // Tracker API down or rate-limiting — don't blow up the whole sitemap,
      // just return whatever we got. Static pages still appear.
      console.error("[sitemap] investor fetch failed at offset", offset, e);
      break;
    }
  }
  return out;
}

async function fetchAllProjects(): Promise<MetadataRoute.Sitemap> {
  const out: MetadataRoute.Sitemap = [];
  const limit = 100;
  let offset = 0;
  // Same cap as fetchAllInvestors — 10 pages = 1000 URLs to stay under
  // Vercel's 60s static-gen budget. See note there for details.
  const MAX_PAGES = 10;
  for (let i = 0; i < MAX_PAGES; i++) {
    try {
      const res = await getProjects({ limit, offset });
      for (const p of res.data) {
        if (!p.slug) continue;
        const lastModified = p.last_enriched_at
          ? new Date(p.last_enriched_at)
          : NOW;
        out.push({
          url: `${SITE}/tracker/projects/${p.slug}`,
          lastModified,
          changeFrequency: "weekly",
          priority: 0.5,
        });
      }
      if (!res.meta.has_more) break;
      offset += limit;
      if (out.length >= MAX_URLS_PER_SITEMAP) break;
    } catch (e) {
      console.error("[sitemap] project fetch failed at offset", offset, e);
      break;
    }
  }
  return out;
}
