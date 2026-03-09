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
            You&apos;re missing deals{" "}
            <span className="text-orange-500">right now</span>
          </h1>
          <p className="text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            The best deals don&apos;t come through your inbox. They close before you
            hear about them. The brain surfaces what you&apos;d otherwise miss — and
            gives you context no cold deck ever will.
          </p>
        </div>
      </section>

      {/* ── The Problem ── */}
      <section className="relative py-24 px-4">
        <FadeInSection>
          <div className="mx-auto max-w-3xl text-center mb-12">
            <h2 className="text-2xl font-bold text-white sm:text-3xl">
              What deal sourcing actually looks like
            </h2>
          </div>
          <div className="mx-auto max-w-2xl space-y-6">
            {[
              "You see a deal after 3 other funds have already set terms.",
              "A founder in your sweet spot raised last month — you never knew they were out.",
              "You spend 4 hours on diligence for a deal that 30 seconds of comp data would have flagged.",
              "Your portfolio company is raising their next round and you find out from Twitter.",
              "A sector you've been watching heats up and you're the last to deploy.",
            ].map((text, i) => (
              <p key={i} className="text-sm text-zinc-400 flex items-start gap-3">
                <span className="text-zinc-500 mt-0.5 shrink-0">—</span>
                {text}
              </p>
            ))}
          </div>
        </FadeInSection>
      </section>

      {/* ── What the Brain Does ── */}
      <section className="relative py-24 px-4">
        <FadeInSection>
          <div className="mx-auto max-w-3xl text-center mb-12">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-400 mb-4">
              What changes
            </p>
            <h2 className="text-2xl font-bold text-white sm:text-3xl">
              Intelligence that keeps you ahead
            </h2>
          </div>
          <div className="mx-auto max-w-2xl space-y-12">
            {[
              {
                title: "Deal flow before it's public",
                desc: "Projects matching your thesis surfaced from SEC filings, accelerator data, traction signals, and on-chain activity — before they hit your inbox. Filtered by sector, stage, team signals, and momentum indicators.",
                color: "#2dd4bf",
              },
              {
                title: "Market intelligence in real time",
                desc: "Where is capital concentrating this month? Which sectors are heating up? What round sizes are closing? What narratives are gaining traction? Live signals, not quarterly reports that are stale before they're published.",
                color: "#fbbf24",
              },
              {
                title: "Competitive landscape",
                desc: "Deployment pace across the investor landscape. Who's writing checks in your sectors. Co-investment patterns shifting. New entrants competing for the same deals. Know what other funds are doing — not what they're saying.",
                color: "#fb923c",
              },
              {
                title: "Instant diligence context",
                desc: "Any deal that crosses your desk — how does it compare against every other project at the same stage, in the same sector? Traction benchmarks, team signals, market timing. Diligence that used to take days, compressed to seconds.",
                color: "#a78bfa",
              },
              {
                title: "Portfolio value-add",
                desc: "When your portfolio companies raise their next round, give them an unfair advantage. Investor matching, readiness evaluation, narrative calibration, and outreach strategy — built into the platform. The best value-add an investor can offer.",
                color: "#f87171",
              },
            ].map((item) => (
              <div key={item.title} className="border-l-2 pl-6" style={{ borderColor: `${item.color}40` }}>
                <p className="text-sm font-semibold mb-2" style={{ color: item.color }}>
                  {item.title}
                </p>
                <p className="text-sm text-zinc-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </FadeInSection>
      </section>

      {/* ── The Edge ── */}
      <section className="relative py-24 px-4">
        <FadeInSection>
          <div className="mx-auto max-w-3xl">
            <div className="grid grid-cols-2 gap-12">
              <div>
                <p className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-6">Without the brain</p>
                <div className="space-y-4">
                  {[
                    "Source from your network and hope it's enough",
                    "React to inbound instead of finding outliers early",
                    "Diligence based on the deck they send you",
                    "Portfolio support means intro emails",
                    "Market reads from conferences and Twitter",
                  ].map((text) => (
                    <p key={text} className="text-sm text-zinc-400 flex items-start gap-2">
                      <span className="text-zinc-500 mt-0.5">—</span>{text}
                    </p>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold text-orange-400 uppercase tracking-wider mb-6">With the brain</p>
                <div className="space-y-4">
                  {[
                    "Thesis-matched deals surfaced before they're in market",
                    "Traction signals and momentum data on every project",
                    "Instant comps against thousands of real rounds",
                    "Portfolio companies raise smarter with built-in intelligence",
                    "Live market data updated continuously",
                  ].map((text) => (
                    <p key={text} className="text-sm text-zinc-300 flex items-start gap-2">
                      <span className="text-orange-400 mt-0.5">—</span>{text}
                    </p>
                  ))}
                </div>
              </div>
            </div>
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
            <p className="text-zinc-500 mb-8">
              The brain is in early access. Get in before it opens.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
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
