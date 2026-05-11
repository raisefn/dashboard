import { NextResponse } from "next/server";

/**
 * Cloudflare Turnstile server-side token verification.
 *
 * Client submits a Turnstile token from the widget on /signup. We forward
 * it to Cloudflare's siteverify endpoint with our secret key. Cloudflare
 * returns `{ success: bool, ... }`. We just pass `success` back to the
 * client — the client then proceeds with Supabase signUp only on success.
 *
 * No PII handled here; just bot defense at the perimeter.
 */
const TURNSTILE_VERIFY_URL =
  "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export async function POST(req: Request) {
  const secret = process.env.TURNSTILE_SECRET_KEY;

  // Local-dev fallback: if no secret configured, treat as pass so dev
  // signup flows aren't broken when developers don't have Cloudflare set
  // up locally. Production deploys always have the secret (Vercel env).
  if (!secret) {
    return NextResponse.json({ success: true, dev_bypass: true });
  }

  try {
    const { token } = await req.json();
    if (!token || typeof token !== "string") {
      return NextResponse.json(
        { success: false, error: "missing-token" },
        { status: 400 }
      );
    }

    const body = new URLSearchParams();
    body.append("secret", secret);
    body.append("response", token);

    const cfRes = await fetch(TURNSTILE_VERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    });
    const data = (await cfRes.json()) as {
      success: boolean;
      "error-codes"?: string[];
      hostname?: string;
    };

    if (!data.success) {
      console.warn("Turnstile verify failed:", data["error-codes"]);
      return NextResponse.json(
        { success: false, errors: data["error-codes"] ?? [] },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Turnstile verify error:", e);
    // Fail open on unexpected server errors so a Cloudflare outage doesn't
    // brick signups. Real bot traffic gets blocked when Cloudflare is up;
    // a service failure is a degraded mode, not a hard fail.
    return NextResponse.json({ success: true, fail_open: true });
  }
}
