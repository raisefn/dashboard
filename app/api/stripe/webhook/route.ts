import { NextResponse } from "next/server";
import { getStripe, getTierFromPrice } from "@/lib/stripe";
import { getSupabase } from "@/lib/supabase";
import Stripe from "stripe";
import { notifySlack } from "@/lib/slack";

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

    // Fetch line items from Stripe to determine tier from price ID
    if (!tier) {
      try {
        const lineItems = await stripe.checkout.sessions.listLineItems(session.id, { limit: 1 });
        const priceId = lineItems.data[0]?.price?.id;
        if (priceId) {
          tier = getTierFromPrice(priceId);
        }
      } catch (err) {
        console.error("Could not fetch line items for session:", session.id, err);
      }
    }

    if (!tier) {
      console.error("Could not determine tier for session:", session.id);
      return NextResponse.json({ received: true });
    }

    try {
      const supabase = getSupabase();

      const customerEmail = session.customer_details?.email || session.customer_email;

      if (customerEmail) {
        const emailLower = customerEmail.toLowerCase();

        // Insert payment record
        await supabase.from("payments").insert({
          email: emailLower,
          stripe_session_id: session.id,
          stripe_customer_id: session.customer as string,
          stripe_subscription_id: session.subscription as string,
          tier,
          amount_cents: session.amount_total,
          currency: session.currency,
          status: "active",
        });

        // Update or create api_key in Railway Postgres
        const dbUrl = process.env.DATABASE_URL;
        if (dbUrl) {
          const { Pool } = await import("pg");
          const crypto = await import("crypto");
          const pool = new Pool({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });

          // Check if api_key exists for this email
          const existing = await pool.query(
            "SELECT id FROM api_keys WHERE email = $1 AND is_active = true LIMIT 1",
            [emailLower]
          );

          if (existing.rowCount && existing.rowCount > 0) {
            // Row exists — update tier
            await pool.query(
              "UPDATE api_keys SET tier = $1, stripe_customer_id = $2 WHERE email = $3",
              [tier, session.customer as string, emailLower]
            );
          } else {
            // Row doesn't exist — pre-create so brain finds it with correct tier
            const rawKey = `rfn_${crypto.randomBytes(32).toString("hex")}`;
            const keyHash = crypto.createHash("sha256").update(rawKey).digest("hex");
            await pool.query(
              `INSERT INTO api_keys (id, key_hash, key_prefix, owner, email, role, tier, stripe_customer_id, is_active)
               VALUES ($1, $2, $3, $4, $5, 'founder', $6, $7, true)`,
              [
                crypto.randomUUID(),
                keyHash,
                rawKey.slice(0, 8),
                session.customer_details?.name || emailLower.split("@")[0],
                emailLower,
                tier,
                session.customer as string,
              ]
            );
            console.log(`Pre-created api_key for ${emailLower} with tier ${tier}`);
          }

          await pool.end();
        }
      }

      console.log(`Payment completed: ${customerEmail} → ${tier}`);

      // Public display names — internal tier codes stay the same.
      // Pricing v2 (2026-05-25): single paid tier "advisor".
      const TIER_DISPLAY: Record<string, string> = {
        advisor: "Advisor",
      };
      const displayName = TIER_DISPLAY[tier] ?? tier;

      // amount_total is in minor units (cents).
      let amountText = "";
      if (session.amount_total != null) {
        const major = (session.amount_total / 100).toFixed(2);
        const currency = (session.currency ?? "usd").toUpperCase();
        amountText = ` — $${major} ${currency}`;
      }

      await notifySlack(
        "stripePayments",
        `💰 Payment completed: *${customerEmail}* → ${displayName}${amountText}`
      );
    } catch (err) {
      console.error("Error processing checkout webhook:", err);
    }
  }

  // Pricing v2 (2026-05-25): one-time payments don't fire
  // customer.subscription.deleted. Refunds (the only "downgrade" path now)
  // fire charge.refunded — handle that to flip tier back to free.
  if (event.type === "charge.refunded") {
    const charge = event.data.object as Stripe.Charge;
    // Only flip on FULL refunds. Partial refunds keep advisor access.
    const fullyRefunded =
      charge.refunded === true && charge.amount_refunded === charge.amount;
    if (!fullyRefunded) {
      return NextResponse.json({ received: true });
    }

    let customerEmail = charge.billing_details?.email || charge.receipt_email;
    if (!customerEmail && charge.customer) {
      try {
        const customer = await stripe.customers.retrieve(charge.customer as string);
        if ("email" in customer && customer.email) {
          customerEmail = customer.email;
        }
      } catch (err) {
        console.error("Could not fetch customer for refund:", err);
      }
    }

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
          .update({ status: "refunded" })
          .eq("stripe_session_id", charge.metadata?.session_id || "");

        await notifySlack(
          "stripePayments",
          `↩️ Refund processed: *${customerEmail}* → free`
        );
        console.log(`Refund processed: ${customerEmail} → free`);
      } catch (err) {
        console.error("Error processing refund:", err);
      }
    }
  }

  return NextResponse.json({ received: true });
}
