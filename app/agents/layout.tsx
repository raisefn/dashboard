import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "For Agents — raise(fn)",
  description:
    "Bring your AI to your raise. Connect your personal ChatGPT, Claude, or any AI assistant directly to your raise(fn) data. Founders query their pipeline. Investors query their deal flow. Coming soon — join the waitlist.",
  alternates: { canonical: "/agents" },
  openGraph: {
    title: "For Agents — raise(fn)",
    description:
      "Connect your AI assistant to your raise(fn) data. Coming soon.",
    type: "website",
  },
};

export default function AgentsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
