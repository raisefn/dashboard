import Stripe from "stripe";

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (_stripe) return _stripe;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY is not configured.");
  }
  _stripe = new Stripe(key);
  return _stripe;
}

// Pricing v6 (2026-07-06): Explorer (Free) + Founder + Investor.
// Advisor retired. "Pro" retired as a name — tiers are audience-named.
//
// Founder:
//   founder_monthly  — $199/mo  — STRIPE_FOUNDER_MONTHLY_PRICE_ID
//   founder_annual   — $999/yr  — STRIPE_FOUNDER_ANNUAL_PRICE_ID
//
// Investor:
//   investor_monthly — $399/mo  — STRIPE_INVESTOR_MONTHLY_PRICE_ID
//   investor_annual  — $1,999/yr — STRIPE_INVESTOR_ANNUAL_PRICE_ID
//
// Both variants map to internal tier="pro" downstream (single paid state).
// Role determines which pricing a user sees. All legacy price IDs
// (pro at $199, advisor variants) still resolve to "pro" so historical
// subscriptions keep working — archive them in Stripe Dashboard so no
// NEW checkout can hit them.
export function getPriceMap(): Record<string, string | undefined> {
  return {
    founder_monthly: process.env.STRIPE_FOUNDER_MONTHLY_PRICE_ID,
    founder_annual: process.env.STRIPE_FOUNDER_ANNUAL_PRICE_ID,
    investor_monthly: process.env.STRIPE_INVESTOR_MONTHLY_PRICE_ID,
    investor_annual: process.env.STRIPE_INVESTOR_ANNUAL_PRICE_ID,
    // Legacy price IDs — still recognized by webhooks, not offered for
    // new checkouts. Kept to avoid breaking any historical subscription.
    pro_legacy: process.env.STRIPE_PRO_PRICE_ID,
    advisor_setup_legacy: process.env.STRIPE_ADVISOR_SETUP_PRICE_ID,
    advisor_monthly_legacy: process.env.STRIPE_ADVISOR_MONTHLY_PRICE_ID,
    advisor_upfront_legacy: process.env.STRIPE_ADVISOR_UPFRONT_PRICE_ID,
  };
}

export type CheckoutTier =
  | "founder_monthly"
  | "founder_annual"
  | "investor_monthly"
  | "investor_annual";

/** Returns the line_items array for a Stripe Checkout Session.
 *  Accepts one of four checkout variants. */
export function getCheckoutLineItems(
  tier: string,
): { price: string; quantity: number }[] | undefined {
  const map = getPriceMap();
  if (tier === "founder_monthly" && map.founder_monthly) {
    return [{ price: map.founder_monthly, quantity: 1 }];
  }
  if (tier === "founder_annual" && map.founder_annual) {
    return [{ price: map.founder_annual, quantity: 1 }];
  }
  if (tier === "investor_monthly" && map.investor_monthly) {
    return [{ price: map.investor_monthly, quantity: 1 }];
  }
  if (tier === "investor_annual" && map.investor_annual) {
    return [{ price: map.investor_annual, quantity: 1 }];
  }
  return undefined;
}

/** Map a Stripe price ID back to an internal tier. All four new
 *  variants (founder monthly/annual, investor monthly/annual) plus
 *  every legacy price resolve to "pro" so downstream tier gates
 *  (PAID_TIERS, etc.) treat all paid subscribers uniformly. Role
 *  (founder vs investor) is stored separately on api_keys.role. */
export function getTierFromPrice(priceId: string): string | undefined {
  const map = getPriceMap();
  if (priceId === map.founder_monthly) return "pro";
  if (priceId === map.founder_annual) return "pro";
  if (priceId === map.investor_monthly) return "pro";
  if (priceId === map.investor_annual) return "pro";
  if (priceId === map.pro_legacy) return "pro";
  if (
    priceId === map.advisor_setup_legacy ||
    priceId === map.advisor_monthly_legacy ||
    priceId === map.advisor_upfront_legacy
  ) {
    return "pro";
  }
  return undefined;
}

/** Extract the audience (founder / investor) and cadence (monthly /
 *  annual) from a checkout tier key. Used for reporting + Slack ping
 *  labels. Legacy prices return null audience since they predate the
 *  audience-named tiers. */
export function parseTierVariant(
  variant: string | undefined,
): { audience: "founder" | "investor" | null; cadence: "monthly" | "annual" | null } {
  switch (variant) {
    case "founder_monthly":
      return { audience: "founder", cadence: "monthly" };
    case "founder_annual":
      return { audience: "founder", cadence: "annual" };
    case "investor_monthly":
      return { audience: "investor", cadence: "monthly" };
    case "investor_annual":
      return { audience: "investor", cadence: "annual" };
    default:
      return { audience: null, cadence: null };
  }
}
