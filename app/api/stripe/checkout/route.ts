import { NextResponse } from "next/server";
import { getStripe, getPriceMap } from "@/lib/stripe";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    const stripe = getStripe();
    const { tier, engagement_accepted, engagement_version } = await req.json();

    const priceId = getPriceMap()[tier];
    if (!priceId) {
      return NextResponse.json(
        { error: "Invalid tier." },
        { status: 400 }
      );
    }

    // Engagement letter acceptance is required for Advisor. The terms
    // include a 2% success fee on raisefn-introduced capital — pre-purchase
    // acknowledgment is the core legal protection. See
    // /legal/engagement and .claude/plans/pricing_lifetime_simplification.md.
    if (!engagement_accepted) {
      return NextResponse.json(
        { error: "Advisor engagement terms must be accepted before checkout." },
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

    // Pricing v2 (2026-05-25): one-time payment, not recurring subscription.
    // Metadata records engagement acceptance for audit trail.
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{ price: priceId, quantity: 1 }],
      customer_email: user.email,
      metadata: {
        supabase_user_id: user.id,
        tier,
        engagement_accepted: "true",
        engagement_version: engagement_version || "v1",
        engagement_accepted_at: new Date().toISOString(),
        engagement_terms_url: `${baseUrl}/legal/engagement`,
      },
      payment_intent_data: {
        metadata: {
          email: user.email,
          tier,
          engagement_version: engagement_version || "v1",
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
