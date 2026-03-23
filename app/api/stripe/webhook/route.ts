import { NextResponse } from "next/server";
import { getStripe, TIER_FROM_PRICE } from "@/lib/stripe";
import { getSupabase } from "@/lib/supabase";
import Stripe from "stripe";

export async function POST(req: Request) {
  const stripe = getStripe();
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "Missing signature." }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    // Derive tier from metadata or from the price ID
    let tier = session.metadata?.tier;
    console.log("Webhook: metadata tier =", tier);
    console.log("Webhook: TIER_FROM_PRICE map =", JSON.stringify(TIER_FROM_PRICE));

    // Line items aren't included in webhook payload — fetch them
    if (!tier) {
      try {
        const lineItems = await stripe.checkout.sessions.listLineItems(session.id, { limit: 1 });
        const priceId = lineItems.data[0]?.price?.id;
        console.log("Webhook: price ID from line items =", priceId);
        if (priceId) {
          tier = TIER_FROM_PRICE[priceId];
        }
      } catch (err) {
        console.error("Could not fetch line items for session:", session.id, err);
      }
    }

    if (!tier) {
      console.error("Could not determine tier for session:", session.id);
      return NextResponse.json({ received: true });
    }

    console.log("Webhook: resolved tier =", tier);

    try {
      const supabase = getSupabase();

      const customerEmail = session.customer_details?.email || session.customer_email;

      if (customerEmail) {
        // Insert payment record
        await supabase.from("payments").insert({
          email: customerEmail.toLowerCase(),
          stripe_session_id: session.id,
          stripe_customer_id: session.customer as string,
          stripe_subscription_id: session.subscription as string,
          tier,
          amount_cents: session.amount_total,
          currency: session.currency,
          status: "active",
        });
      }

      // Update the api_keys table in Railway Postgres
      const dbUrl = process.env.DATABASE_URL;
      console.log("Webhook: DATABASE_URL set =", !!dbUrl);
      console.log("Webhook: updating email =", customerEmail?.toLowerCase(), "to tier =", tier);

      if (dbUrl) {
        const { Pool } = await import("pg");
        const pool = new Pool({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });
        const result = await pool.query(
          "UPDATE api_keys SET tier = $1, stripe_customer_id = $2 WHERE email = $3",
          [tier, session.customer as string, customerEmail?.toLowerCase()]
        );
        console.log("Webhook: DB update rows affected =", result.rowCount);
        await pool.end();
      }

      console.log(`Payment completed: ${customerEmail} → ${tier}`);
    } catch (err) {
      console.error("Error processing checkout webhook:", err);
    }
  }

  if (event.type === "customer.subscription.deleted") {
    const subscription = event.data.object as Stripe.Subscription;
    const customerEmail = subscription.metadata?.email;

    if (customerEmail) {
      try {
        const dbUrl = process.env.DATABASE_URL;
        if (dbUrl) {
          const { Pool } = await import("pg");
          const pool = new Pool({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });
          await pool.query(
            "UPDATE api_keys SET tier = 'free' WHERE email = $1",
            [customerEmail.toLowerCase()]
          );
          await pool.end();
        }

        const supabase = getSupabase();
        await supabase
          .from("payments")
          .update({ status: "cancelled" })
          .eq("stripe_subscription_id", subscription.id);

        console.log(`Subscription cancelled: ${customerEmail} → free`);
      } catch (err) {
        console.error("Error processing subscription cancellation:", err);
      }
    }
  }

  return NextResponse.json({ received: true });
}
