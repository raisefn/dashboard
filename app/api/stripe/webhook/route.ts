import { NextResponse } from "next/server";
import { getStripe, getTierFromPrice, parseTierVariant } from "@/lib/stripe";
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

    // Pricing v6 (2026-07-06): Explorer + Founder + Investor. All paid
    // variants collapse to internal tier="pro" downstream. Audience
    // (founder/investor) is preserved separately in session metadata for
    // reporting.
    const tierVariant = session.metadata?.tier;
    const { audience, cadence } = parseTierVariant(tierVariant);
    let tier: string | undefined = undefined;

    // The four v6 checkout variants all resolve to "pro".
    if (
      tierVariant === "founder_monthly" ||
      tierVariant === "founder_annual" ||
      tierVariant === "investor_monthly" ||
      tierVariant === "investor_annual"
    ) {
      tier = "pro";
    }

    // Fallback: derive from the price ID. Handles legacy subs (v5 pro at
    // $199, v4/v5 advisor variants) that predate v6 metadata.
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

          let apiKeyId: string;
          if (existing.rowCount && existing.rowCount > 0) {
            // Row exists — update tier
            apiKeyId = existing.rows[0].id;
            await pool.query(
              "UPDATE api_keys SET tier = $1, stripe_customer_id = $2 WHERE email = $3",
              [tier, session.customer as string, emailLower]
            );
          } else {
            // Row doesn't exist — pre-create so brain finds it with correct tier
            apiKeyId = crypto.randomUUID();
            const rawKey = `rfn_${crypto.randomBytes(32).toString("hex")}`;
            const keyHash = crypto.createHash("sha256").update(rawKey).digest("hex");
            await pool.query(
              `INSERT INTO api_keys (id, key_hash, key_prefix, owner, email, role, tier, stripe_customer_id, is_active)
               VALUES ($1, $2, $3, $4, $5, 'founder', $6, $7, true)`,
              [
                apiKeyId,
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

          // Record first-paid-at for the metrics dashboard's free→paid
          // conversion chart. ON CONFLICT DO NOTHING so a repeat checkout
          // doesn't overwrite the original first-paid timestamp.
          await pool.query(
            `INSERT INTO api_key_billing_state (api_key_id, first_paid_at, first_paid_source)
             VALUES ($1, NOW(), 'stripe')
             ON CONFLICT (api_key_id) DO NOTHING`,
            [apiKeyId]
          );

          await pool.end();
        }
      }

      console.log(`Payment completed: ${customerEmail} → ${tier}`);

      // amount_total is in minor units (cents).
      let amountText = "";
      if (session.amount_total != null) {
        const major = (session.amount_total / 100).toFixed(2);
        const currency = (session.currency ?? "usd").toUpperCase();
        amountText = ` — $${major} ${currency}`;
      }

      // Audience-named tier label in the Slack message so we can tell
      // Founder revenue from Investor revenue at a glance. Legacy subs
      // (pre-v6) surface as just "Pro" with no audience label.
      const tierLabel =
        audience === "founder" ? "Founder"
        : audience === "investor" ? "Investor"
        : "Pro";
      const cadenceLabel = cadence ? ` (${cadence})` : "";

      await notifySlack(
        "stripePayments",
        `💰 Payment completed: *${customerEmail}* → ${tierLabel}${cadenceLabel}${amountText}`
      );
    } catch (err) {
      console.error("Error processing checkout webhook:", err);
    }
  }

  // Pro (monthly or annual) subscription ended → flip tier back to free.
  // Fired when a subscription is fully terminated (cancelled + period
  // ended, or payment failed past retry window). customer.subscription
  // .updated fires on renewals + user-initiated cancel-at-period-end;
  // we do NOT downgrade on updated — only on deleted, which is the
  // actual end-of-access signal.
  if (event.type === "customer.subscription.deleted") {
    const sub = event.data.object as Stripe.Subscription;
    let customerEmail: string | null = null;
    try {
      const customer = await stripe.customers.retrieve(sub.customer as string);
      if ("email" in customer && customer.email) {
        customerEmail = customer.email;
      }
    } catch (err) {
      console.error("Could not fetch customer for subscription:", sub.id, err);
    }

    if (customerEmail) {
      try {
        const dbUrl = process.env.DATABASE_URL;
        if (dbUrl) {
          const { Pool } = await import("pg");
          const pool = new Pool({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });
          // Only downgrade a currently-pro row. Defense against stale
          // events firing after tier has already been managed elsewhere.
          await pool.query(
            "UPDATE api_keys SET tier = 'free' WHERE email = $1 AND tier = 'pro'",
            [customerEmail.toLowerCase()]
          );
          await pool.end();
        }

        const supabase = getSupabase();
        await supabase
          .from("payments")
          .update({ status: "cancelled" })
          .eq("stripe_subscription_id", sub.id);

        await notifySlack(
          "stripePayments",
          `❌ Pro subscription ended: *${customerEmail}* → free`
        );
        console.log(`Subscription ended: ${customerEmail} → free`);
      } catch (err) {
        console.error("Error processing subscription deletion:", err);
      }
    }
  }

  // invoice.paid fires on every renewal; no DB writes needed — the
  // subscription stays active, the api_keys.tier row stays as set.
  // Only customer.subscription.deleted triggers downgrade.

  // Full refund → flip tier back to free. Terms of service says "all
  // purchases final," but if Stripe processes a refund anyway
  // (chargeback, manual support refund) we shouldn't keep the user on
  // a paid tier. Partial refunds keep access.
  if (event.type === "charge.refunded") {
    const charge = event.data.object as Stripe.Charge;
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
