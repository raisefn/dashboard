/**
 * Founder-internal brief preview.
 *
 * URL: raisefn.com/preview/brief/<token>
 *
 * Mirrors the public /brief/<token> render exactly, but fetches client-side
 * with the founder's Supabase JWT in the Authorization header. The brain
 * endpoint (admin.py:4273 GET /v1/brain/briefs/{token}) sees the JWT,
 * matches the caller to brief.founder_api_key_id, and returns the brief
 * WITHOUT bumping view_count or firing the doc_view_crossing signal.
 *
 * Why a separate route from /brief/<token>:
 *   - /brief/<token> is server-rendered and public — investors get it,
 *     view counts fire, signals land. Don't break that.
 *   - The old self-view suppression used cookies (next/headers) to forward
 *     the JWT. But dashboard auth uses @supabase/supabase-js with the default
 *     localStorage backend — there are no sb-*-auth-token cookies, so the
 *     forward silently failed and founders' own QA views landed as signals.
 *   - A client component CAN read localStorage (where the JWT lives) and
 *     attach Bearer to the brain call. So all internal "preview your own
 *     brief" buttons in the dashboard point here; the public share link
 *     stays /brief/<token>.
 */
"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { supabase } from "@/lib/supabase-browser";

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
  show_raisefn_brand?: boolean;
  _founder_preview?: boolean;
}

export default function BriefPreviewPage(
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = use(params);
  const [brief, setBrief] = useState<BriefData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const accessToken = sessionData.session?.access_token;
        if (!accessToken) {
          setError("You need to be signed in to preview your brief.");
          setLoading(false);
          return;
        }
        const res = await fetch(`${BRAIN_URL}/v1/brain/briefs/${token}`, {
          cache: "no-store",
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (cancelled) return;
        if (res.status === 404) {
          setError("Brief not found.");
          setLoading(false);
          return;
        }
        if (!res.ok) {
          setError(`Brief fetch failed (${res.status})`);
          setLoading(false);
          return;
        }
        const json = (await res.json()) as BriefData;
        if (cancelled) return;
        setBrief(json);
        setLoading(false);
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Brief fetch error");
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [token]);

  if (loading) {
    return (
      <main className="brief-root fixed inset-0 flex items-center justify-center bg-white text-zinc-500 z-30">
        <style>{BRIEF_CSS}</style>
        <p className="text-sm">Loading brief…</p>
      </main>
    );
  }

  if (error || !brief) {
    return (
      <main className="brief-root fixed inset-0 flex flex-col items-center justify-center gap-3 bg-white text-zinc-700 z-30">
        <style>{BRIEF_CSS}</style>
        <p className="text-base">{error || "Brief unavailable."}</p>
        <Link
          href="/brain/deploy"
          className="text-sm text-zinc-500 underline hover:text-zinc-900"
        >
          Back to raise(fn)
        </Link>
      </main>
    );
  }

  const showBrand = brief.show_raisefn_brand !== false;

  return (
    <main className="brief-root fixed inset-0 overflow-y-auto bg-white text-zinc-900 z-30">
      <style>{BRIEF_CSS}</style>

      {/* Preview-mode banner — only visible to the founder, never on the
          public /brief/<token> page. Subtle cue that this view does NOT
          count against the brief's view_count signal. */}
      <div className="mx-auto max-w-[720px] px-6 pt-6">
        <div className="rounded-md border border-zinc-200 bg-zinc-50 px-4 py-2 text-xs text-zinc-600">
          Preview mode — this view doesn't count as a signal. Use the share
          link from the Briefs panel for the investor-facing URL.
        </div>
      </div>

      <div className="mx-auto max-w-[720px] px-6 py-12 sm:py-16">
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

        <article className="brief-prose">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {brief.markdown}
          </ReactMarkdown>
        </article>

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
    </main>
  );
}

// Same CSS as the public brief page. Kept inline rather than extracted to
// a shared file because (a) only two routes share it and (b) the public
// route is server-rendered while this one is client — exporting a const
// from a "use client" file into a server component is allowed but reads
// confusing. Duplication acceptable at this scale.
const BRIEF_CSS = `
  .brief-prose {
    font-feature-settings: "tnum" 1, "ss01" 1;
    line-height: 1.65;
    color: rgb(24, 24, 27);
  }
  .brief-prose h1 {
    font-size: 2rem; font-weight: 700; line-height: 1.2;
    letter-spacing: -0.02em; margin-top: 0.5rem; margin-bottom: 0.5rem;
    color: rgb(24, 24, 27);
  }
  .brief-prose h2 {
    font-size: 1.125rem; font-weight: 500; line-height: 1.4;
    color: rgb(82, 82, 91); margin-bottom: 2rem; margin-top: 0;
  }
  .brief-prose h3 {
    font-size: 1.0625rem; font-weight: 600; color: rgb(24, 24, 27);
    margin-top: 2.5rem; margin-bottom: 0.75rem; letter-spacing: -0.005em;
  }
  .brief-prose p { margin-bottom: 1rem; color: rgb(39, 39, 42); }
  .brief-prose strong { font-weight: 600; color: rgb(24, 24, 27); }
  .brief-prose hr {
    border: none; border-top: 1px solid rgb(228, 228, 231); margin: 2.25rem 0;
  }
  .brief-prose ul {
    margin: 0.5rem 0 1.25rem 0; padding-left: 1.25rem; list-style-type: disc;
  }
  .brief-prose li {
    margin-bottom: 0.5rem; padding-left: 0.25rem; color: rgb(39, 39, 42);
  }
  .brief-prose li::marker { color: rgb(249, 115, 22); }
  .brief-prose blockquote {
    border-left: 3px solid rgb(249, 115, 22);
    padding: 0.5rem 0 0.5rem 1.25rem; margin: 1.5rem 0;
    color: rgb(63, 63, 70); font-style: italic;
    font-size: 1.0625rem; line-height: 1.55;
  }
  .brief-prose blockquote p { margin-bottom: 0; }
  .brief-prose a {
    color: rgb(249, 115, 22); text-decoration: underline;
    text-decoration-thickness: 1px; text-underline-offset: 2px;
  }
  .brief-prose a:hover { color: rgb(234, 88, 12); }
  .brief-prose table {
    width: 100%; border-collapse: collapse;
    margin: 1.5rem 0 0.5rem 0; font-size: 0.9375rem;
  }
  .brief-prose table thead { display: none; }
  .brief-prose table th, .brief-prose table td {
    text-align: left; padding: 0.55rem 0.75rem;
    border-top: 1px solid rgb(228, 228, 231); vertical-align: top;
  }
  .brief-prose table tr:last-child td {
    border-bottom: 1px solid rgb(228, 228, 231);
  }
  .brief-prose table td:first-child {
    font-weight: 600; color: rgb(82, 82, 91);
    width: 30%; white-space: nowrap;
  }
  .brief-prose table td:nth-child(2) { color: rgb(24, 24, 27); }
  .brief-prose > p:first-of-type strong:first-child {
    display: inline-block; font-size: 0.75rem;
    text-transform: uppercase; letter-spacing: 0.05em;
    color: rgb(113, 113, 122); font-weight: 500;
  }
  @media (max-width: 640px) {
    .brief-prose h1 { font-size: 1.625rem; }
    .brief-prose h2 { font-size: 1rem; }
    .brief-prose table td { padding: 0.5rem; }
    .brief-prose table td:first-child { width: 35%; }
  }
`;
