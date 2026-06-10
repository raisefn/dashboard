import { NextResponse } from "next/server";
import { getStripe, getPriceMap } from "@/lib/stripe";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    const stripe = getStripe();
    const { tier } = await req.json();

    const priceId = getPriceMap()[tier];
    if (!priceId) {
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

    // Pricing v3 (2026-06-10) branches by tier:
    // - advisor: one-time $999 with Engagement Letter consent (3% success
    //   fee surface). Consent captured natively on Stripe's hosted page
    //   via consent_collection.terms_of_service. Terms URL configured at
    //   Stripe Dashboard → Business → Terms of service URL.
    // - pro: $199/mo recurring subscription. No engagement letter, no
    //   success fee — pure SaaS, cancel anytime.
    const isAdvisor = tier === "advisor";
    const session = await stripe.checkout.sessions.create(
      isAdvisor
        ? {
            mode: "payment",
            line_items: [{ price: priceId, quantity: 1 }],
            customer_email: user.email,
            consent_collection: {
              terms_of_service: "required",
            },
            custom_text: {
              terms_of_service_acceptance: {
                message:
                  "I agree to the **Advisor Engagement Letter**, including the 3% success fee on capital from raisefn-introduced investors. The $999 is non-refundable.",
              },
            },
            metadata: {
              supabase_user_id: user.id,
              tier,
            },
            payment_intent_data: {
              metadata: {
                email: user.email,
                tier,
              },
            },
            success_url: `${baseUrl}/brain/deploy?checkout=success`,
            cancel_url: `${baseUrl}/pricing?checkout=cancelled`,
          }
        : {
            mode: "subscription",
            line_items: [{ price: priceId, quantity: 1 }],
            customer_email: user.email,
            metadata: {
              supabase_user_id: user.id,
              tier,
            },
            subscription_data: {
              metadata: {
                email: user.email,
                tier,
              },
            },
            success_url: `${baseUrl}/brain/deploy?checkout=success`,
            cancel_url: `${baseUrl}/pricing?checkout=cancelled`,
          }
    );

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Stripe checkout error:", err);
    return NextResponse.json(
      { error: "Could not create checkout session." },
      { status: 500 }
    );
  }
}
