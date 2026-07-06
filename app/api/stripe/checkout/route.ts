import { NextResponse } from "next/server";
import { getStripe, getCheckoutLineItems, parseTierVariant } from "@/lib/stripe";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    const stripe = getStripe();
    const body = await req.json();
    const tier: string = body.tier;

    const lineItems = getCheckoutLineItems(tier);
    if (!lineItems) {
      return NextResponse.json(
        { error: "Invalid tier." },
        { status: 400 }
      );
    }

    // Auth required — user must have an account
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Not authenticated." },
        { status: 401 }
      );
    }

    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace("Bearer ", "")
    );

    if (authError || !user?.email) {
      return NextResponse.json(
        { error: "Invalid session." },
        { status: 401 }
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://raisefn.com";
    const { audience, cadence } = parseTierVariant(tier);

    // Pricing v6 (2026-07-06): Explorer (Free) + Founder + Investor.
    // Audience-named tiers, both cadences (monthly/annual). Single-line
    // subscription for all four variants — no mixed-mode, no consent
    // collection. Success routes back to /brain/deploy for founders and
    // /raise-fund/deploy for investors (once Phase 2 lands); today both
    // resolve to /brain/deploy but auth callback role-routes on next
    // page load if the investor surface isn't ready.
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: lineItems,
      customer_email: user.email,
      metadata: {
        supabase_user_id: user.id,
        tier,
        audience: audience || "",
        cadence: cadence || "",
        pricing_version: "v6",
      },
      subscription_data: {
        metadata: {
          email: user.email,
          tier,
          audience: audience || "",
          cadence: cadence || "",
          pricing_version: "v6",
        },
      },
      success_url: `${baseUrl}/brain/deploy?checkout=success`,
      cancel_url: `${baseUrl}/pricing?checkout=cancelled`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Stripe checkout error:", err);
    return NextResponse.json(
      { error: "Could not create checkout session." },
      { status: 500 }
    );
  }
}
