import { NextResponse } from "next/server";
import { getStripe, getCheckoutLineItems } from "@/lib/stripe";
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

    // Pricing v5 (2026-07-01):
    // - pro: single-line $199/mo subscription
    // - advisor: mixed-mode subscription ($199/mo Pro) + one-time ($1,798
    //   setup fee) = $1,997 due at checkout, then $199/mo Pro from day 31.
    //   Engagement letter accepted natively via consent_collection.
    //
    // Grandfathered v4 advisor customers (Matt/Taylor/Ralph/Alfredo) keep
    // their existing subscriptions — no code path forces migration.
    const isAdvisor = tier === "advisor";

    const session = await stripe.checkout.sessions.create(
      isAdvisor
        ? {
            // Mixed-mode: subscription (Pro) + one-time (Setup Fee).
            // Stripe supports both line item types in a single session
            // when mode='subscription'.
            mode: "subscription",
            line_items: lineItems,
            customer_email: user.email,
            consent_collection: {
              terms_of_service: "required",
            },
            custom_text: {
              terms_of_service_acceptance: {
                message:
                  "I agree to the **raise(fn) Advisor Engagement Letter**. $1,997 today = first month of Pro ($199) + setup and guidance ($1,798). Pro continues at $199/mo, cancel anytime. No success fees. Funds paid are funds paid.",
              },
            },
            metadata: {
              supabase_user_id: user.id,
              tier,
              pricing_version: "v5",
            },
            subscription_data: {
              metadata: {
                email: user.email,
                tier,
                pricing_version: "v5",
              },
            },
            success_url: `${baseUrl}/brain/deploy?checkout=success`,
            cancel_url: `${baseUrl}/pricing?checkout=cancelled`,
          }
        : {
            mode: "subscription",
            line_items: lineItems,
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
