import Link from "next/link";
import FadeInSection from "@/components/fade-in-section";

export default function InvestorsPage() {
  return (
    <div className="relative">
      <div className="grid-bg" />

      {/* ── Hero ── */}
      <section className="relative py-24 px-4">
        <div className="mx-auto max-w-3xl text-center animate-fade-in">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-500 mb-4">
            Brain for Investors
          </p>
          <h1 className="text-4xl font-bold text-white sm:text-5xl mb-6">
            See the market{" "}
            <span className="text-teal-400">before it moves</span>
          </h1>
          <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
            Live deal flow, market signals, and competitive intelligence —
            from the same data layer that powers 2M+ tracked rounds.
          </p>
        </div>
      </section>

      {/* ── Capabilities ── */}
      <section className="relative py-24 px-4">
        <FadeInSection>
          <div className="mx-auto max-w-2xl space-y-12">
            {[
              {
                title: "Deal Flow Intelligence",
                desc: "Surface projects matching your thesis before they hit your inbox. Filtered by sector, stage, traction, and team signals.",
                color: "#2dd4bf",
              },
              {
                title: "Market Signals",
                desc: "Where is capital concentrating? Which sectors are heating up? What narratives are gaining traction? Live, not quarterly.",
                color: "#fbbf24",
              },
              {
                title: "Competitive Intelligence",
                desc: "Deployment pace, sector shifts, and co-investment patterns across the investor landscape.",
                color: "#fb923c",
              },
              {
                title: "Due Diligence Support",
                desc: "Instant comparables for any deal — how it stacks up against others at the same stage, same sector.",
                color: "#a78bfa",
              },
              {
                title: "Portfolio Support",
                desc: "Help portfolio companies raise their next round. Readiness evaluation, investor matching, and outreach guidance — built in.",
                color: "#f87171",
              },
            ].map((item) => (
              <div key={item.title} className="border-l-2 pl-6" style={{ borderColor: `${item.color}40` }}>
                <p className="text-sm font-semibold mb-1" style={{ color: item.color }}>
                  {item.title}
                </p>
                <p className="text-sm text-zinc-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </FadeInSection>
      </section>

      {/* ── CTA ── */}
      <section className="relative py-24 px-4">
        <FadeInSection>
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold text-white sm:text-4xl mb-4">
              Better sourcing. Faster decisions.
            </h2>
            <div className="flex flex-wrap justify-center gap-4 mt-8">
              <a
                href="mailto:justinpetsche@gmail.com?subject=raise(fn) Brain — Investor Access"
                className="rounded-full border border-orange-700/50 bg-orange-950/20 px-8 py-3 text-sm font-medium text-orange-300 transition-all hover:border-orange-500 hover:bg-orange-900/30"
              >
                Request Early Access
              </a>
              <Link
                href="/brain"
                className="rounded-full border border-zinc-700 px-8 py-3 text-sm font-medium text-zinc-300 transition-all hover:border-zinc-500 hover:text-white"
              >
                Back to the Brain
              </Link>
            </div>
          </div>
        </FadeInSection>
      </section>
    </div>
  );
}
