import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { createClient } from "@supabase/supabase-js";

// Server-side OAuth code exchange. Stripe's `code → access_token` step
// requires our STRIPE_SECRET_KEY, which must never touch the browser.
// We do the exchange here, then forward {access_token, stripe_user_id}
// to brain along with the founder's Supabase JWT.

const BRAIN_URL =
  process.env.NEXT_PUBLIC_BRAIN_URL ||
  "https://brain-production-61da.up.railway.app";

export async function POST(req: Request) {
  try {
    // Auth: brain identifies the founder by Supabase JWT
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
    }
    const jwt = authHeader.replace("Bearer ", "");

    // Verify the JWT is valid before doing anything expensive
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    const { data: { user }, error: authError } = await supabase.auth.getUser(jwt);
    if (authError || !user?.email) {
      return NextResponse.json({ error: "Invalid session." }, { status: 401 });
    }

    const { code } = await req.json();
    if (!code) {
      return NextResponse.json({ error: "Missing code." }, { status: 400 });
    }

    // Exchange code for access_token. Stripe Connect Standard returns
    // {access_token, stripe_user_id, scope, livemode, refresh_token, ...}
    // The access_token is the connected account's "user key" — read-only
    // because we requested scope=read_only at /oauth/authorize time.
    const stripe = getStripe();
    const tokenResp = await stripe.oauth.token({
      grant_type: "authorization_code",
      code,
    });

    const access_token = tokenResp.access_token;
    const stripe_user_id = tokenResp.stripe_user_id;
    if (!access_token || !stripe_user_id) {
      return NextResponse.json(
        { error: "Stripe did not return account credentials." },
        { status: 502 }
      );
    }

    // Forward to brain. Brain encrypts the token, persists, kicks off
    // the initial MRR fetch, and returns acknowledgment.
    const brainResp = await fetch(`${BRAIN_URL}/v1/brain/integrations/stripe/connect`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwt}`,
      },
      body: JSON.stringify({ access_token, stripe_user_id }),
    });

    if (!brainResp.ok) {
      const text = await brainResp.text();
      console.error("Brain rejected Stripe connect:", brainResp.status, text);
      return NextResponse.json(
        { error: "Failed to register connection." },
        { status: 502 }
      );
    }

    const brainData = await brainResp.json();
    return NextResponse.json({ ok: true, ...brainData });
  } catch (err) {
    console.error("Stripe OAuth exchange error:", err);
    return NextResponse.json(
      { error: "Could not complete Stripe connection." },
      { status: 500 }
    );
  }
}
