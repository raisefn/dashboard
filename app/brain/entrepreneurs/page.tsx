import Link from "next/link";
import FadeInSection from "@/components/fade-in-section";

export default function EntrepreneursPage() {
  return (
    <div className="relative">
      <div className="grid-bg" />

      {/* ── Hero ── */}
      <section className="relative py-24 px-4">
        <div className="mx-auto max-w-3xl text-center animate-fade-in">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-400 mb-4">
            Brain for Founders
          </p>
          <h1 className="text-4xl font-bold text-white sm:text-5xl mb-6">
            Your raise is too important{" "}
            <span className="text-teal-400">for guesswork</span>
          </h1>
          <p className="text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            Most founders raise blind. They pitch the wrong investors, at the wrong
            time, with the wrong narrative — and burn months figuring it out. The
            brain changes that.
          </p>
        </div>
      </section>

      {/* ── The Raise Journey ── */}
      <section className="relative py-24 px-4">
        <FadeInSection>
          <div className="mx-auto max-w-3xl">
            {/* Phase 1 */}
            <div className="mb-20">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-400 mb-3">
                Phase 1
              </p>
              <h2 className="text-2xl font-bold text-white mb-3">
                Before you pitch a single investor
              </h2>
              <p className="text-sm text-zinc-500 mb-8 max-w-2xl leading-relaxed">
                The worst thing a founder can do is go out before they&apos;re ready.
                You get one shot with each investor. The brain makes sure you don&apos;t
                waste it.
              </p>
              <div className="space-y-6">
                {[
                  {
                    title: "Readiness evaluation",
                    desc: "Your metrics benchmarked against projects that actually closed at your stage and sector. Not what a blog post says you need — what the data shows. Gaps identified before investors find them.",
                    color: "#34d399",
                  },
                  {
                    title: "Narrative calibration",
                    desc: "Is your pitch framed for the investors you're targeting? What's resonating in the market right now? What positioning worked for comparable raises this quarter? Get it right before you send a single deck.",
                    color: "#fbbf24",
                  },
                  {
                    title: "Investor matching",
                    desc: "A ranked list of investors who are actively deploying in your sector, at your stage, at your check size. Not a static database — live deployment data. Who moved on a deal like yours last month.",
                    color: "#2dd4bf",
                  },
                  {
                    title: "Valuation calibration",
                    desc: "Given your metrics, sector, stage, and market conditions — what is a defensible valuation? Not what you want, not what you heard — what the data actually supports right now.",
                    color: "#fbbf24",
                  },
                  {
                    title: "Raise timing",
                    desc: "Is now actually a good time to raise? Market cycle data, sector momentum, recent comparable closes, and macro signals — the kind of judgment that saves founders from dead windows.",
                    color: "#34d399",
                  },
                  {
                    title: "Pitch deck analysis",
                    desc: "Upload your deck, get calibrated feedback against what works for your target investor list and current market conditions. Not generic — specific.",
                    color: "#2dd4bf",
                  },
                  {
                    title: "Investor relationship scoring",
                    desc: "Score every investor on your target list — portfolio fit, fund cycle timing, relationship distance, recent activity, likelihood to move fast.",
                    color: "#fb923c",
                  },
                ].map((item) => (
                  <div key={item.title} className="border-l-2 pl-6" style={{ borderColor: `${item.color}40` }}>
                    <p className="text-sm font-semibold mb-1" style={{ color: item.color }}>{item.title}</p>
                    <p className="text-sm text-zinc-500 leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Phase 2 */}
            <div className="mb-20">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-500 mb-3">
                Phase 2
              </p>
              <h2 className="text-2xl font-bold text-white mb-3">
                During the raise
              </h2>
              <p className="text-sm text-zinc-500 mb-8 max-w-2xl leading-relaxed">
                You&apos;re in conversations. Things are moving. Every interaction carries
                signal — if you know how to read it. The brain decodes what&apos;s
                actually happening.
              </p>
              <div className="space-y-6">
                {[
                  {
                    title: "Signal reading",
                    desc: "A fast first reply followed by a slow second one means something. Getting routed to an associate in week one is different than week three. The brain decodes investor behavior in real time — what it means and what to do next.",
                    color: "#fb923c",
                  },
                  {
                    title: "Outreach guidance",
                    desc: "Per-investor strategy. What they've funded, what they've said publicly, who can introduce you, what angle will land. Not generic advice — specific intelligence updated from live behavioral data.",
                    color: "#f87171",
                  },
                  {
                    title: "Competitive raise intel",
                    desc: "Who else in your sector is raising right now, at what valuation, with what traction. Information that changes your strategy in real time.",
                    color: "#fbbf24",
                  },
                  {
                    title: "Co-investor sequencing",
                    desc: "Who to bring in first to create social proof that unlocks the next investor. Map relationships and sequence cap table construction strategically.",
                    color: "#a78bfa",
                  },
                  {
                    title: "Reference check intel",
                    desc: "When investors ask for references — help prepare the list strategically. Who to put forward, what narrative each should reinforce.",
                    color: "#34d399",
                  },
                ].map((item) => (
                  <div key={item.title} className="border-l-2 pl-6" style={{ borderColor: `${item.color}40` }}>
                    <p className="text-sm font-semibold mb-1" style={{ color: item.color }}>{item.title}</p>
                    <p className="text-sm text-zinc-500 leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Phase 3 */}
            <div className="mb-20">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-400 mb-3">
                Phase 3
              </p>
              <h2 className="text-2xl font-bold text-white mb-3">
                At the close
              </h2>
              <p className="text-sm text-zinc-500 mb-8 max-w-2xl leading-relaxed">
                A term sheet lands. The clock starts. You need to know if the terms
                are fair — and where you have leverage — before the momentum shifts.
              </p>
              <div className="space-y-6">
                {[
                  {
                    title: "Term sheet intelligence",
                    desc: "Your term sheet compared against current market data — not what was standard last year, what's closing right now. What's aggressive, what's a red flag, where you have room to negotiate. Intelligence that normally costs $500/hour from a lawyer who may not have current comp data anyway.",
                    color: "#a78bfa",
                  },
                  {
                    title: "LP intelligence",
                    desc: "Who backs which VCs? Understanding LP composition tells you about mandate, timeline, risk tolerance, and reporting requirements. Context that changes how you negotiate.",
                    color: "#2dd4bf",
                  },
                ].map((item) => (
                  <div key={item.title} className="border-l-2 pl-6" style={{ borderColor: `${item.color}40` }}>
                    <p className="text-sm font-semibold mb-1" style={{ color: item.color }}>{item.title}</p>
                    <p className="text-sm text-zinc-500 leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Phase 4 */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500 mb-3">
                Phase 4
              </p>
              <h2 className="text-2xl font-bold text-white mb-3">
                After the close
              </h2>
              <p className="text-sm text-zinc-500 mb-8 max-w-2xl leading-relaxed">
                The raise is done but the relationships aren&apos;t. The brain keeps
                working — monitoring your investors, flagging opportunities, and
                preparing you for the next round before you need it.
              </p>
              <div className="space-y-6">
                <div className="border-l-2 pl-6" style={{ borderColor: "#fb923c40" }}>
                  <p className="text-sm font-semibold mb-1" style={{ color: "#fb923c" }}>Post-raise intelligence</p>
                  <p className="text-sm text-zinc-500 leading-relaxed">
                    Monitor investor portfolio activity, flag when investors raise new funds,
                    identify when follow-on conversations should start based on milestones.
                    Stay ahead of your next raise before it begins.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </FadeInSection>
      </section>

      {/* ── The Alternative ── */}
      <section className="relative py-24 px-4">
        <FadeInSection>
          <div className="mx-auto max-w-3xl text-center mb-12">
            <h2 className="text-3xl font-bold text-white sm:text-4xl">
              What the raise looks like without this
            </h2>
          </div>
          <div className="mx-auto max-w-2xl space-y-6">
            {[
              "You pitch 40 investors. 30 were never going to invest in your sector.",
              "You go out in Q4 when your target investors just closed their fund.",
              "You accept terms that look standard but cost you millions at the next round.",
              "You spend 6 months raising when it should have taken 3.",
              "You burn your best relationships before your metrics were ready.",
            ].map((text, i) => (
              <p key={i} className="text-sm text-zinc-400 flex items-start gap-3">
                <span className="text-zinc-500 mt-0.5 shrink-0">—</span>
                {text}
              </p>
            ))}
          </div>
        </FadeInSection>
      </section>

      {/* ── CTA ── */}
      <section className="relative py-24 px-4">
        <FadeInSection>
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold text-white sm:text-4xl mb-4">
              Raise with intelligence
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
