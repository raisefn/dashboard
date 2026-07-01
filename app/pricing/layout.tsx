import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing — raise(fn)",
  description:
    "Three tiers built for founders raising. Free to try. Pro at $199/mo, uncapped, cancel anytime. Advisor at $1,997 today — one month of hands-on setup and guidance from raise(fn) Team, then Pro ongoing at $199/mo. No success fees. No equity.",
  alternates: { canonical: "/pricing" },
  openGraph: {
    title: "Pricing — raise(fn)",
    description:
      "Free · Pro $199/mo · Advisor $1,997 today + $199/mo after month 1. No success fees, no equity.",
    type: "website",
  },
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
