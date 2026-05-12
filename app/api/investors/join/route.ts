import { NextResponse } from "next/server";

/**
 * Public investor self-serve signup proxy.
 *
 * Flow:
 *   1. Client (`/investors/join`) submits the form payload + Turnstile token.
 *   2. We verify the Turnstile token server-side (same pattern as
 *      `/api/turnstile/verify`).
 *   3. On success, forward the payload to the brain's public investor
 *      endpoint via the Next.js rewrite (`/v1/brain/public/investors` →
 *      Railway brain).
 *
 * Turnstile verification lives here, NOT in the brain — keeps the brain
 * stack provider-agnostic and avoids piping a Cloudflare secret to the
 * Railway backend. Same pattern as the signup form's bot defense.
 */
const TURNSTILE_VERIFY_URL =
  "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON" },
      { status: 400 }
    );
  }

  // Extract Turnstile token before forwarding (brain shouldn't see it).
  const { turnstile_token, ...brainPayload } = body;

  // Verify Turnstile — same pattern as /api/turnstile/verify. Skipped if
  // no secret configured (local dev) or if Cloudflare itself errors out
  // (degraded mode preferred over hard fail).
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (secret) {
    if (!turnstile_token || typeof turnstile_token !== "string") {
      return NextResponse.json(
        { error: "Bot verification required" },
        { status: 400 }
      );
    }
    try {
      const params = new URLSearchParams();
      params.append("secret", secret);
      params.append("response", turnstile_token);
      const cfRes = await fetch(TURNSTILE_VERIFY_URL, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params.toString(),
      });
      const cfData = (await cfRes.json()) as { success: boolean };
      if (!cfData.success) {
        return NextResponse.json(
          { error: "Bot verification failed" },
          { status: 400 }
        );
      }
    } catch (e) {
      // Fail open on Cloudflare outage — same as /api/turnstile/verify.
      // Real bot traffic gets blocked when CF is up; a service failure
      // shouldn't brick legitimate signups.
      console.error("Turnstile verify error (failing open):", e);
    }
  }

  // Forward to brain via the Next.js rewrite. Using same-origin call so
  // it works in any environment (preview deploys, prod, local) without
  // an explicit BRAIN_URL env var — the rewrite in next.config.ts does
  // the actual proxying to Railway.
  const origin =
    req.headers.get("origin") ||
    `https://${req.headers.get("host") || "raisefn.com"}`;

  try {
    const brainRes = await fetch(`${origin}/v1/brain/public/investors`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(brainPayload),
    });
    const data = await brainRes.json();
    return NextResponse.json(data, { status: brainRes.status });
  } catch (e) {
    console.error("Brain forward error:", e);
    return NextResponse.json(
      { error: "Couldn't reach the network. Try again or email team@raisefn.com." },
      { status: 502 }
    );
  }
}
