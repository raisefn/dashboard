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

        // Check if Supabase user exists — if not, create one
        const { data: existingUsers } = await supabase.auth.admin.listUsers();
        const userExists = existingUsers?.users?.some(
          (u) => u.email?.toLowerCase() === emailLower
        );

        if (!userExists) {
          // Create Supabase account — user will set password via email
          const { error: createError } = await supabase.auth.admin.createUser({
            email: emailLower,
            email_confirm: true,
            user_metadata: {
              name: session.customer_details?.name || emailLower.split("@")[0],
              role: "founder",
              raising_status: "active",
              paid_signup: true,
            },
          });

          if (createError) {
            console.error("Failed to create Supabase user:", createError);
          } else {
            console.log(`Created Supabase user for paid signup: ${emailLower}`);

            // Send password setup email
            await supabase.auth.admin.generateLink({
              type: "recovery",
              email: emailLower,
              options: { redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || "https://raisefn.com"}/auth/confirm` },
            });
          }
        }
      }

      // Update or create api_key in Railway Postgres
      const dbUrl = process.env.DATABASE_URL;
      if (dbUrl && customerEmail) {
        const { Pool } = await import("pg");
        const pool = new Pool({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });

        // Try update first
        const updateResult = await pool.query(
          "UPDATE api_keys SET tier = $1, stripe_customer_id = $2 WHERE email = $3",
          [tier, session.customer as string, customerEmail.toLowerCase()]
        );

        // If no row updated, user signed up via Stripe without going through brain first
        // The api_key will be auto-created on their first brain request via JWT auth
        if (updateResult.rowCount === 0) {
          console.log(`No api_key found for ${customerEmail} — will be created on first login`);
        }

        await pool.end();
      }

      console.log(`Payment completed: ${customerEmail} → ${tier}`);

      await notifySlack(
        "stripePayments",
        `💰 Payment completed: *${customerEmail}* → ${tier}`
      );
    } catch (err) {
      console.error("Error processing checkout webhook:", err);
    }
  }

  if (event.type === "customer.subscription.deleted") {
    const subscription = event.data.object as Stripe.Subscription;
    let customerEmail = subscription.metadata?.email;

    // Fallback: look up email from Stripe customer if not in metadata
    if (!customerEmail && subscription.customer) {
      try {
        const customer = await stripe.customers.retrieve(subscription.customer as string);
        if ("email" in customer && customer.email) {
          customerEmail = customer.email;
        }
      } catch (err) {
        console.error("Could not fetch customer for cancellation:", err);
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
