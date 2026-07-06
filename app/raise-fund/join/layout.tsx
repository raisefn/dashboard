import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign up — raise a fund with raise(fn)",
  description:
    "5-minute signup. Tell us about your fund or deal — the agent starts running as soon as you finish. For venture GPs, real estate deal sponsors, angel syndicate leads.",
  alternates: { canonical: "/raise-fund/join" },
  robots: { index: false, follow: true },
};

export default function RaiseFundJoinLayout({ children }: { children: React.ReactNode }) {
  return children;
}
