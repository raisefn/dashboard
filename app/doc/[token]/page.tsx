/**
 * Public docshare passthrough.
 *
 * URL: raisefn.com/doc/<token>
 *
 * The actual viewer is brain's GET /v1/brain/docs/<token> which 302
 * redirects to the underlying file URL (Google Drive / DocSend / etc.)
 * after bumping the view count + emitting a doc_view_crossing event at
 * thresholds 1/3/7. This Next page is the public-facing wrapper that
 * lives on raisefn.com so investors see the branded domain.
 *
 * Why a passthrough instead of just routing /doc/<token> to brain at the
 * Vercel rewrite layer: rewrites would mask the redirect chain and break
 * Google's link unfurl preview. Doing it server-side here gives us a
 * place to fall back gracefully if brain is unreachable.
 *
 * Nav is suppressed for this route (see components/nav.tsx).
 */
import { redirect, notFound } from "next/navigation";

const BRAIN_URL = "https://brain-production-61da.up.railway.app";

export const dynamic = "force-dynamic";

export default async function DocSharePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  if (!token || token.length > 32) {
    notFound();
  }

  // Brain's endpoint is a redirect — we follow it server-side so the view
  // count bumps even if the client doesn't follow redirects automatically.
  let targetUrl: string | null = null;
  try {
    const res = await fetch(`${BRAIN_URL}/v1/brain/docs/${token}`, {
      redirect: "manual",
      cache: "no-store",
    });
    if (res.status === 302 || res.status === 301) {
      targetUrl = res.headers.get("location");
    } else if (res.status === 404) {
      notFound();
    } else {
      console.error(`Docshare fetch failed: ${res.status}`);
    }
  } catch (e) {
    console.error("Docshare fetch error", e);
  }

  if (!targetUrl) {
    notFound();
  }

  // Server-side redirect to the underlying file. Next.js's redirect()
  // throws to short-circuit rendering — must be the last thing called.
  redirect(targetUrl);
}
