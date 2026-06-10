import type { Metadata } from "next";

// Per-page metadata so search engines + LLM crawlers (GEO) can
// differentiate this page from the rest of the site. Lives in a layout
// because the page itself is "use client" (FadeInSection animations).

export const metadata: Metadata = {
  title: "For Founders — raise(fn)",
  description:
    "Run your raise like the operators do. raise(fn) is the brain that remembers every investor, drafts every email, scores every fit, and tells you what to do next. Targeting, pipeline memory, tailored briefs, meeting prep — built for founders raising right now.",
  alternates: { canonical: "/founders" },
  openGraph: {
    title: "For Founders — raise(fn)",
    description:
      "Targeting, pipeline memory, tailored investor briefs. The brain that helps you run your raise.",
    type: "website",
  },
};

export default function FoundersLayout({ children }: { children: React.ReactNode }) {
  return children;
}
