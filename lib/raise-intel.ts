import { promises as fs } from "node:fs";
import path from "node:path";

// Raise Intel article reading utilities. Articles live as .md files in
// content/raise-intel/. Each file is one article, frontmatter at top,
// markdown body below. No CMS, no DB — git is the source of truth.
//
// The frontmatter parser is intentionally minimal (no gray-matter dep).
// Supports strings, ISO dates, and bracketed string arrays. If we ever
// need richer types we can add gray-matter, but for the article schema
// we control this is enough.

const CONTENT_DIR = path.join(process.cwd(), "content", "raise-intel");

export interface RaiseIntelArticle {
  slug: string;
  title: string;
  description: string;
  published_at: string;
  updated_at?: string;
  status: "published" | "draft";
  category: string;
  tags: string[];
  fund_slugs: string[];
  sector_slugs: string[];
  hero_stat?: string;
  cta_text?: string;
  cta_href?: string;
  // AI search optimization: a direct, quotable answer to the article's
  // headline question. Surfaced both in the page UI and in the JSON-LD
  // so AI crawlers can lift it as the canonical answer.
  tldr?: string;
  body: string;
}

// Extract FAQ pairs from a `## FAQ` or `## Frequently asked questions`
// section in the body. Each `### Question` H3 within that section
// becomes a question; the paragraph(s) after become the answer until
// the next H3 or H2. Used for FAQPage JSON-LD — AI search engines
// preferentially cite structured Q&A.
//
// We detect rather than schema-encode because the markdown already
// represents the structure naturally, and the AI generator writes the
// FAQ section as part of the body anyway. One source of truth.
export function extractFaqs(body: string): Array<{ q: string; a: string }> {
  const faqSectionMatch = body.match(
    /^##\s+(FAQ|Frequently asked questions|Common questions)\s*$([\s\S]*?)(?=^##\s|\Z)/im,
  );
  if (!faqSectionMatch) return [];
  const section = faqSectionMatch[2];
  const out: Array<{ q: string; a: string }> = [];
  const h3Pattern = /^###\s+(.+?)\s*$/gm;
  const matches = [...section.matchAll(h3Pattern)];
  for (let i = 0; i < matches.length; i++) {
    const q = matches[i][1].trim();
    const start = matches[i].index! + matches[i][0].length;
    const end = i + 1 < matches.length ? matches[i + 1].index! : section.length;
    const answer = section
      .slice(start, end)
      .replace(/^\s+|\s+$/g, "")
      .replace(/\n{2,}/g, " ")
      .replace(/\n/g, " ")
      .trim();
    if (q && answer) out.push({ q, a: answer });
  }
  return out;
}

// Parse a single article from disk. Returns null if the file doesn't
// exist — callers decide how to handle 404 (article detail page renders
// notFound(), index just skips it).
//
// Underscore- and dot-prefixed slugs are reserved for editorial-only
// files (voice spec, templates, etc) and are never publicly readable
// even if someone guesses the URL. Returning null here makes the route
// 404, which is what we want.
export async function getArticleBySlug(
  slug: string,
): Promise<RaiseIntelArticle | null> {
  if (slug.startsWith("_") || slug.startsWith(".")) return null;
  const file = path.join(CONTENT_DIR, `${slug}.md`);
  let raw: string;
  try {
    raw = await fs.readFile(file, "utf-8");
  } catch {
    return null;
  }
  return parseArticle(slug, raw);
}

// List all published articles, newest first. Drafts are skipped so a
// half-finished article in the repo never appears on the index or in
// the sitemap. To preview a draft, set status: "published" locally.
export async function listArticles(): Promise<RaiseIntelArticle[]> {
  let files: string[];
  try {
    files = await fs.readdir(CONTENT_DIR);
  } catch {
    return [];
  }
  const articles: RaiseIntelArticle[] = [];
  for (const name of files) {
    // Skip editorial-only files (voice spec, templates) prefixed with
    // _ or . — they live alongside articles but never publish.
    if (name.startsWith("_") || name.startsWith(".")) continue;
    if (!name.endsWith(".md")) continue;
    const slug = name.replace(/\.md$/, "");
    const article = await getArticleBySlug(slug);
    if (!article) continue;
    if (article.status !== "published") continue;
    articles.push(article);
  }
  articles.sort((a, b) => b.published_at.localeCompare(a.published_at));
  return articles;
}

function parseArticle(slug: string, raw: string): RaiseIntelArticle | null {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return null;
  const [, frontmatter, body] = match;
  const fm = parseFrontmatter(frontmatter);

  const required = ["title", "description", "published_at", "status", "category"] as const;
  for (const key of required) {
    if (!fm[key]) return null;
  }

  return {
    slug,
    title: String(fm.title),
    description: String(fm.description),
    published_at: String(fm.published_at),
    updated_at: fm.updated_at ? String(fm.updated_at) : undefined,
    status: fm.status === "draft" ? "draft" : "published",
    category: String(fm.category),
    tags: Array.isArray(fm.tags) ? fm.tags.map(String) : [],
    fund_slugs: Array.isArray(fm.fund_slugs) ? fm.fund_slugs.map(String) : [],
    sector_slugs: Array.isArray(fm.sector_slugs) ? fm.sector_slugs.map(String) : [],
    hero_stat: fm.hero_stat ? String(fm.hero_stat) : undefined,
    cta_text: fm.cta_text ? String(fm.cta_text) : undefined,
    cta_href: fm.cta_href ? String(fm.cta_href) : undefined,
    tldr: fm.tldr ? String(fm.tldr) : undefined,
    body: body.trim(),
  };
}

// Minimal YAML-ish frontmatter parser. Supports:
//   key: "string value"
//   key: 'string value'
//   key: bare-string
//   key: ["a", "b", "c"]
//   key: ['a', 'b']
// Comments and nested maps are not supported — we don't use them.
function parseFrontmatter(text: string): Record<string, string | string[]> {
  const out: Record<string, string | string[]> = {};
  for (const line of text.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const colon = trimmed.indexOf(":");
    if (colon === -1) continue;
    const key = trimmed.slice(0, colon).trim();
    const value = trimmed.slice(colon + 1).trim();
    if (value.startsWith("[") && value.endsWith("]")) {
      const inner = value.slice(1, -1).trim();
      if (!inner) {
        out[key] = [];
        continue;
      }
      out[key] = inner
        .split(",")
        .map((s) => s.trim().replace(/^["']|["']$/g, ""))
        .filter(Boolean);
    } else {
      out[key] = value.replace(/^["']|["']$/g, "");
    }
  }
  return out;
}
