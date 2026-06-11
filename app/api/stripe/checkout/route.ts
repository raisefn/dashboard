import { NextResponse } from "next/server";
import { getStripe, getPriceIdFor, type AdvisorBilling } from "@/lib/stripe";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    const stripe = getStripe();
    const body = await req.json();
    const tier: string = body.tier;
    const billing: AdvisorBilling | undefined = body.billing;

    // Default Advisor billing to monthly. Upfront option requires explicit
    // billing='upfront' in the request body.
    const advisorBilling: AdvisorBilling = billing === "upfront" ? "upfront" : "monthly";

    const priceId = getPriceIdFor(tier, advisorBilling);
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

    // Pricing v4 (2026-06-11) checkout flows:
    // - pro: $199/mo subscription, no engagement letter, pure SaaS
    // - advisor (monthly): $999/mo recurring subscription. Engagement
    //   letter consent required. Founder can stop future charges by
    //   emailing team@raisefn.com. No auto-cancel; if they want to
    //   continue past 3 months, they can.
    // - advisor (upfront): $1,999 one-time payment. Engagement letter
    //   consent required. Same scope as monthly, ~33% off the total.
    //
    // Consent collection wording reflects v4 letter — no 3%, no success
    // fee, no equity. Founder accepts the engagement letter natively on
    // Stripe's hosted page (terms_of_service URL configured in Stripe
    // Dashboard → Business settings → Terms of service URL = /legal/engagement).
    const isAdvisor = tier === "advisor";
    const isAdvisorUpfront = isAdvisor && advisorBilling === "upfront";

    const session = await stripe.checkout.sessions.create(
      isAdvisorUpfront
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
                  "I agree to the **raise(fn) Advisor Engagement Letter**. Three months of hands-on support. No success fees. All purchases final — funds paid are funds paid.",
              },
            },
            metadata: {
              supabase_user_id: user.id,
              tier,
              advisor_billing: "upfront",
            },
            payment_intent_data: {
              metadata: {
                email: user.email,
                tier,
                advisor_billing: "upfront",
              },
            },
            success_url: `${baseUrl}/brain/deploy?checkout=success`,
            cancel_url: `${baseUrl}/pricing?checkout=cancelled`,
          }
        : isAdvisor
        ? {
            mode: "subscription",
            line_items: [{ price: priceId, quantity: 1 }],
            customer_email: user.email,
            consent_collection: {
              terms_of_service: "required",
            },
            custom_text: {
              terms_of_service_acceptance: {
                message:
                  "I agree to the **raise(fn) Advisor Engagement Letter**. $999/month for 3 months of hands-on support. No success fees. Stop future charges anytime by emailing team@raisefn.com. Funds paid are funds paid.",
              },
            },
            metadata: {
              supabase_user_id: user.id,
              tier,
              advisor_billing: "monthly",
            },
            subscription_data: {
              metadata: {
                email: user.email,
                tier,
                advisor_billing: "monthly",
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
