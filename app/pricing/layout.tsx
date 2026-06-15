import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing — raise(fn)",
  description:
    "Three tiers built for founders raising. Free to try. Pro at $199/mo, uncapped, cancel anytime. Advisor by request — 3 months of hands-on support with the raise(fn) Team in the loop the whole way. No success fees. No equity.",
  alternates: { canonical: "/pricing" },
  openGraph: {
    title: "Pricing — raise(fn)",
    description:
      "Free · Pro $199/mo · Advisor by request. No success fees, no equity.",
    type: "website",
  },
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
