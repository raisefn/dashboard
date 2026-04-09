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

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://raisefn.com";

    // Try to get user email from JWT if authenticated (optional)
    let userEmail: string | undefined;
    let userId: string | undefined;
    const authHeader = req.headers.get("authorization");

    if (authHeader?.startsWith("Bearer ")) {
      try {
        const supabase = createClient(
          process.env.SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!
        );
        const { data: { user } } = await supabase.auth.getUser(
          authHeader.replace("Bearer ", "")
        );
        if (user?.email) {
          userEmail = user.email;
          userId = user.id;
        }
      } catch {}
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      ...(userEmail ? { customer_email: userEmail } : {}),
      metadata: {
        tier,
        ...(userId ? { supabase_user_id: userId } : {}),
      },
      subscription_data: {
        metadata: {
          tier,
          ...(userEmail ? { email: userEmail } : {}),
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
