import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    const stripe = getStripe();

    // Verify the user's JWT to get their email
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

    // Find the Stripe customer by email
    const customers = await stripe.customers.list({
      email: user.email.toLowerCase(),
      limit: 1,
    });

    if (customers.data.length === 0) {
      return NextResponse.json(
        { error: "No subscription found." },
        { status: 404 }
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://raisefn.com";

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customers.data[0].id,
      return_url: `${baseUrl}/brain/deploy`,
    });

    return NextResponse.json({ url: portalSession.url });
  } catch (err) {
    console.error("Stripe portal error:", err);
    return NextResponse.json(
      { error: "Could not create portal session." },
      { status: 500 }
    );
  }
}
