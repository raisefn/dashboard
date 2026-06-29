/**
 * Public brand-wrapped brief page.
 *
 * URL: raisefn.com/brief/<token>
 *
 * Server component. Fetches the persisted brief from brain by token,
 * renders the markdown inside a light branded shell. No auth — possession
 * of the token IS the access. Each view bumps view_count server-side.
 *
 * Nav is suppressed for this route (see components/nav.tsx). The page
 * paints its own full-viewport white container over the dashboard's dark
 * body so external investors see only the brand surface, not the app.
 */
import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Metadata } from "next";
import BriefEditorOverlay from "./editor-overlay";

// Hardcoded to the active brain Railway URL. The NEXT_PUBLIC_BRAIN_URL env
// var on Vercel points at a stale (-61da-less) alias; relying on it caused
// a silent 404 on first deploy.
const BRAIN_URL = "https://brain-production-61da.up.railway.app";

interface BriefData {
  token: string;
  markdown: string;
  founder_company: string | null;
  founder_name: string | null;
  investor_first_name: string | null;
  investor_full_name: string | null;
  generated_at: string | null;
  view_count: number;
  // Brand-gating (migration 031). When false, the page renders
  // without the raise(fn) wordmark + footer block. Older briefs that
  // predate the column fall back to true.
  show_raisefn_brand?: boolean;
}

async function fetchBrief(token: string): Promise<BriefData | null> {
  try {
    const res = await fetch(`${BRAIN_URL}/v1/brain/briefs/${token}`, {
      cache: "no-store",
    });
    if (res.status === 404) return null;
    if (!res.ok) {
      console.error(`Brief fetch failed: ${res.status}`);
      return null;
    }
    return (await res.json()) as BriefData;
  } catch (err) {
    console.error("Brief fetch error:", err);
    return null;
  }
}

export async function generateMetadata(
  { params }: { params: Promise<{ token: string }> },
): Promise<Metadata> {
  const { token } = await params;
  const brief = await fetchBrief(token);
  if (!brief) {
    return { title: "Brief not found — raise(fn)" };
  }
  const company = brief.founder_company || "a portfolio opportunity";
  const investor = brief.investor_first_name || "you";
  const showBrand = brief.show_raisefn_brand !== false;
  return {
    title: showBrand
      ? `${brief.founder_company || "Investor brief"} — raise(fn) Team`
      : `${brief.founder_company || "Investor brief"}`,
    description: showBrand
      ? `Prepared by raise(fn) Team for ${investor}. Confidential brief on ${company}.`
      : `Confidential brief on ${company} for ${investor}.`,
    robots: { index: false, follow: false },
  };
}

// Force dynamic rendering. The brief content can change (regenerations
// produce new tokens but view_count bumps on every fetch) and we never
// want a stale render.
export const dynamic = "force-dynamic";

export default async function BriefPage(
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  const brief = await fetchBrief(token);

  if (!brief) {
    notFound();
  }

  // Brand-gating (migration 031). When false, render without the
  // raise(fn) wordmark + footer. Default true for safety + back-compat.
  const showBrand = brief.show_raisefn_brand !== false;

  return (
    <main className="brief-root fixed inset-0 overflow-y-auto bg-white text-zinc-900 z-30">
      <style>{BRIEF_CSS}</style>

      <div className="mx-auto max-w-[720px] px-6 py-12 sm:py-16">
        {/* Header — branded version keeps the wordmark; unbranded keeps
            only the Confidential tag so the page still has a top rule. */}
        <header className="mb-10 flex items-center justify-between border-b border-zinc-200 pb-6">
          {showBrand ? (
            <Link
              href="https://www.raisefn.com"
              className="text-lg font-bold tracking-tight"
            >
              <span className="text-orange-500">raise</span>
              <span className="text-teal-500">(fn)</span>
            </Link>
          ) : (
            <span aria-hidden="true" />
          )}
          <span className="text-xs uppercase tracking-wider text-zinc-500">
            Confidential
          </span>
        </header>

        {/* Brief content */}
        <article className="brief-prose">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {brief.markdown}
          </ReactMarkdown>
        </article>

        {/* Footer — only rendered when branding is on. Unbranded briefs end
            cleanly at the markdown content. */}
        {showBrand && (
          <footer className="mt-16 border-t border-zinc-200 pt-6 text-xs text-zinc-500">
            <p>
              Prepared by{" "}
              <span className="font-medium text-zinc-700">raise(fn) Team</span>.
              Forwarded in confidence to{" "}
              <span className="font-medium text-zinc-700">
                {brief.investor_full_name || "the named recipient"}
              </span>
              .
            </p>
            <p className="mt-2">
              <Link
                href="https://www.raisefn.com"
                className="text-zinc-600 hover:text-zinc-900"
              >
                raisefn.com
              </Link>
              {" — The fundraising agent for founders."}
            </p>
          </footer>
        )}
      </div>

      {/* Owner-only edit surface. Renders nothing for public viewers. */}
      <BriefEditorOverlay token={token} />
    </main>
  );
}

const BRIEF_CSS = `
  /* Scoped typography for the brief prose. Tailwind's typography plugin
     isn't installed; this is the smallest hand-rolled style sheet that
     gives the brief the right visual rhythm.

     Design intent: business-document feel. Light, generous whitespace,
     scannable hierarchy, no decoration. Lives inside a max-w-[720px]
     container set above.

     Brand accents: orange-500 (#f97316) on H1, teal-500 (#14b8a6) used
     sparingly in the wordmark. Body stays slate-zinc for legibility. */

  .brief-prose {
    font-feature-settings: "tnum" 1, "ss01" 1;
    line-height: 1.65;
    color: rgb(24, 24, 27);
  }

  .brief-prose h1 {
    font-size: 2rem;
    font-weight: 700;
    line-height: 1.2;
    letter-spacing: -0.02em;
    margin-top: 0.5rem;
    margin-bottom: 0.5rem;
    color: rgb(24, 24, 27);
  }

  .brief-prose h2 {
    font-size: 1.125rem;
    font-weight: 500;
    line-height: 1.4;
    color: rgb(82, 82, 91);
    margin-bottom: 2rem;
    margin-top: 0;
  }

  .brief-prose h3 {
    font-size: 1.0625rem;
    font-weight: 600;
    color: rgb(24, 24, 27);
    margin-top: 2.5rem;
    margin-bottom: 0.75rem;
    letter-spacing: -0.005em;
  }

  .brief-prose p {
    margin-bottom: 1rem;
    color: rgb(39, 39, 42);
  }

  .brief-prose strong {
    font-weight: 600;
    color: rgb(24, 24, 27);
  }

  .brief-prose hr {
    border: none;
    border-top: 1px solid rgb(228, 228, 231);
    margin: 2.25rem 0;
  }

  .brief-prose ul {
    margin: 0.5rem 0 1.25rem 0;
    padding-left: 1.25rem;
    list-style-type: disc;
  }

  .brief-prose li {
    margin-bottom: 0.5rem;
    padding-left: 0.25rem;
    color: rgb(39, 39, 42);
  }

  .brief-prose li::marker {
    color: rgb(249, 115, 22);
  }

  .brief-prose blockquote {
    border-left: 3px solid rgb(249, 115, 22);
    padding: 0.5rem 0 0.5rem 1.25rem;
    margin: 1.5rem 0;
    color: rgb(63, 63, 70);
    font-style: italic;
    font-size: 1.0625rem;
    line-height: 1.55;
  }

  .brief-prose blockquote p {
    margin-bottom: 0;
  }

  .brief-prose a {
    color: rgb(249, 115, 22);
    text-decoration: underline;
    text-decoration-thickness: 1px;
    text-underline-offset: 2px;
  }

  .brief-prose a:hover {
    color: rgb(234, 88, 12);
  }

  /* Facts table at the top of every brief */
  .brief-prose table {
    width: 100%;
    border-collapse: collapse;
    margin: 1.5rem 0 0.5rem 0;
    font-size: 0.9375rem;
  }

  .brief-prose table thead {
    display: none; /* prompt structure uses an empty header row */
  }

  .brief-prose table th,
  .brief-prose table td {
    text-align: left;
    padding: 0.55rem 0.75rem;
    border-top: 1px solid rgb(228, 228, 231);
    vertical-align: top;
  }

  .brief-prose table tr:last-child td {
    border-bottom: 1px solid rgb(228, 228, 231);
  }

  .brief-prose table td:first-child {
    font-weight: 600;
    color: rgb(82, 82, 91);
    width: 30%;
    white-space: nowrap;
  }

  .brief-prose table td:nth-child(2) {
    color: rgb(24, 24, 27);
  }

  /* The "Prepared by raise(fn) Team for X | Confidential" line is the
     first <strong> after H2. Make it read as a chip, not a body line. */
  .brief-prose > p:first-of-type strong:first-child {
    display: inline-block;
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: rgb(113, 113, 122);
    font-weight: 500;
  }

  @media (max-width: 640px) {
    .brief-prose h1 { font-size: 1.625rem; }
    .brief-prose h2 { font-size: 1rem; }
    .brief-prose table td { padding: 0.5rem; }
    .brief-prose table td:first-child { width: 35%; }
  }
`;
