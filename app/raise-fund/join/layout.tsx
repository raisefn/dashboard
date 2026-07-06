import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign up — raise a fund with raise(fn)",
  description:
    "30-second signup. Set up your agent to run your fund, deal, or SPV raise. For venture GPs, real estate deal sponsors, angel syndicate leads.",
  alternates: { canonical: "/raise-fund/join" },
  robots: { index: false, follow: true },
};

export default function RaiseFundJoinLayout({ children }: { children: React.ReactNode }) {
  return children;
}
