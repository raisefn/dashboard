import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "For Investors — raise(fn)",
  description:
    "Founders matched to your thesis, not your inbox. raise(fn) does the deep thesis-matching work for you — sector, stage, check size, geography, edge cases. Warm intros brokered by raise(fn) Team. No cold inbound, no scattershot — only the founders worth your time.",
  alternates: { canonical: "/investors" },
  openGraph: {
    title: "For Investors — raise(fn)",
    description:
      "Thesis-matched founders. Warm intros from raise(fn) Team. No scattershot.",
    type: "website",
  },
};

export default function InvestorsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
