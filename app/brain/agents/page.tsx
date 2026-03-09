import Link from "next/link";
import FadeInSection from "@/components/fade-in-section";

export default function AgentsPage() {
  return (
    <div className="relative">
      <div className="grid-bg" />

      {/* ── Hero ── */}
      <section className="relative py-24 px-4">
        <div className="mx-auto max-w-3xl text-center animate-fade-in">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-400 mb-4">
            Brain for AI Agents
          </p>
          <h1 className="text-4xl font-bold text-white sm:text-5xl mb-6">
            Fundraising intelligence{" "}
            <span className="text-violet-400">as an API</span>
          </h1>
          <p className="text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            Your agent can match investors, score readiness, analyze narratives,
            decode signals, and benchmark terms — in a single call. No scraping.
            No training. Just intelligence.
          </p>
        </div>
      </section>

      {/* ── Code Example ── */}
      <section className="relative py-16 px-4">
        <FadeInSection>
          <div className="mx-auto max-w-2xl">
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-zinc-800">
                <div className="h-3 w-3 rounded-full bg-zinc-700" />
                <div className="h-3 w-3 rounded-full bg-zinc-700" />
                <div className="h-3 w-3 rounded-full bg-zinc-700" />
                <span className="ml-2 text-xs text-zinc-600">match-investors.py</span>
              </div>
              <pre className="p-6 text-sm leading-relaxed overflow-x-auto">
                <code>
                  <span className="text-violet-400">import</span>{" "}
                  <span className="text-zinc-300">raisefn</span>{"\n\n"}
                  <span className="text-zinc-500"># One call. Ranked investors with reasoning.</span>{"\n"}
                  <span className="text-zinc-300">matches</span>{" "}
                  <span className="text-zinc-500">=</span>{" "}
                  <span className="text-zinc-300">raisefn</span>
                  <span className="text-zinc-500">.</span>
                  <span className="text-teal-400">brain</span>
                  <span className="text-zinc-500">.</span>
                  <span className="text-teal-400">match_investors</span>
                  <span className="text-zinc-500">(</span>{"\n"}
                  {"    "}
                  <span className="text-orange-400">sector</span>
                  <span className="text-zinc-500">=</span>
                  <span className="text-green-400">&quot;defi&quot;</span>
                  <span className="text-zinc-500">,</span>{"\n"}
                  {"    "}
                  <span className="text-orange-400">stage</span>
                  <span className="text-zinc-500">=</span>
                  <span className="text-green-400">&quot;series_a&quot;</span>
                  <span className="text-zinc-500">,</span>{"\n"}
                  {"    "}
                  <span className="text-orange-400">raising</span>
                  <span className="text-zinc-500">=</span>
                  <span className="text-green-400">&quot;8M&quot;</span>
                  <span className="text-zinc-500">,</span>{"\n"}
                  {"    "}
                  <span className="text-orange-400">metrics</span>
                  <span className="text-zinc-500">=</span>
                  <span className="text-zinc-500">{"{"}</span>
                  <span className="text-green-400">&quot;tvl&quot;</span>
                  <span className="text-zinc-500">:</span>{" "}
                  <span className="text-green-400">&quot;45M&quot;</span>
                  <span className="text-zinc-500">,</span>{" "}
                  <span className="text-green-400">&quot;mau&quot;</span>
                  <span className="text-zinc-500">:</span>{" "}
                  <span className="text-violet-300">12000</span>
                  <span className="text-zinc-500">{"}"}</span>{"\n"}
                  <span className="text-zinc-500">)</span>{"\n\n"}
                  <span className="text-zinc-500"># Returns ranked investors with fit scores,</span>{"\n"}
                  <span className="text-zinc-500"># recent activity, and intro paths</span>{"\n"}
                  <span className="text-violet-400">for</span>{" "}
                  <span className="text-zinc-300">inv</span>{" "}
                  <span className="text-violet-400">in</span>{" "}
                  <span className="text-zinc-300">matches</span>
                  <span className="text-zinc-500">.</span>
                  <span className="text-zinc-300">top</span>
                  <span className="text-zinc-500">(</span>
                  <span className="text-violet-300">10</span>
                  <span className="text-zinc-500">):</span>{"\n"}
                  {"    "}
                  <span className="text-zinc-300">print</span>
                  <span className="text-zinc-500">(</span>
                  <span className="text-zinc-300">inv</span>
                  <span className="text-zinc-500">.</span>
                  <span className="text-zinc-300">name</span>
                  <span className="text-zinc-500">,</span>{" "}
                  <span className="text-zinc-300">inv</span>
                  <span className="text-zinc-500">.</span>
                  <span className="text-zinc-300">fit_score</span>
                  <span className="text-zinc-500">,</span>{" "}
                  <span className="text-zinc-300">inv</span>
                  <span className="text-zinc-500">.</span>
                  <span className="text-zinc-300">reasoning</span>
                  <span className="text-zinc-500">)</span>
                </code>
              </pre>
            </div>
          </div>
        </FadeInSection>
      </section>

      {/* ── What Agents Can Do ── */}
      <section className="relative py-24 px-4">
        <FadeInSection>
          <div className="mx-auto max-w-3xl text-center mb-12">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-400 mb-4">
              Capabilities
            </p>
            <h2 className="text-2xl font-bold text-white sm:text-3xl">
              Six endpoints. Full raise coverage.
            </h2>
          </div>
          <div className="mx-auto max-w-2xl space-y-10">
            {[
              {
                endpoint: "brain.match_investors()",
                desc: "Ranked investors with fit scores, recent activity, portfolio gaps, and intro paths. Filtered by sector, stage, round size, and deployment pace.",
                color: "#2dd4bf",
              },
              {
                endpoint: "brain.evaluate_readiness()",
                desc: "Readiness score with metric benchmarks against successful comparable rounds. Identifies gaps and strengths before investors do.",
                color: "#34d399",
              },
              {
                endpoint: "brain.analyze_narrative()",
                desc: "Per-investor positioning feedback. What's resonating in the market, what comparable raises said, and suggested framing adjustments.",
                color: "#fbbf24",
              },
              {
                endpoint: "brain.read_signals()",
                desc: "Behavioral pattern matching on investor interactions. Probability assessments and recommended next steps based on real outcome data.",
                color: "#fb923c",
              },
              {
                endpoint: "brain.plan_outreach()",
                desc: "Per-investor outreach strategy — recent investments, public statements, preferred approach, mutual connections, and what angle will land.",
                color: "#f87171",
              },
              {
                endpoint: "brain.benchmark_terms()",
                desc: "Term sheet compared against current market rates for stage and sector. Flags non-standard provisions and identifies leverage points.",
                color: "#a78bfa",
              },
            ].map((item) => (
              <div key={item.endpoint} className="border-l-2 pl-6" style={{ borderColor: `${item.color}40` }}>
                <p className="text-sm font-mono font-semibold mb-1" style={{ color: item.color }}>
                  {item.endpoint}
                </p>
                <p className="text-sm text-zinc-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </FadeInSection>
      </section>

      {/* ── Integrations ── */}
      <section className="relative py-24 px-4">
        <FadeInSection>
          <div className="mx-auto max-w-3xl text-center mb-10">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-400 mb-4">
              Integrations
            </p>
            <h2 className="text-2xl font-bold text-white sm:text-3xl">
              Works with your stack
            </h2>
            <p className="text-sm text-zinc-500 mt-4 max-w-lg mx-auto">
              Native integrations for the frameworks AI agents actually use.
              Or hit the REST API directly.
            </p>
          </div>
          <div className="mx-auto max-w-md grid grid-cols-2 gap-4">
            {[
              { name: "LangChain", desc: "Tool & retriever", color: "#2dd4bf" },
              { name: "CrewAI", desc: "Agent tool", color: "#f97316" },
              { name: "Claude / MCP", desc: "Native server", color: "#a78bfa" },
              { name: "REST API", desc: "Any language", color: "#71717a" },
            ].map((fw) => (
              <div key={fw.name} className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
                <p className="text-sm font-semibold" style={{ color: fw.color }}>{fw.name}</p>
                <p className="text-xs text-zinc-600 mt-0.5">{fw.desc}</p>
              </div>
            ))}
          </div>
        </FadeInSection>
      </section>

      {/* ── Why Not Just Use an LLM ── */}
      <section className="relative py-24 px-4">
        <FadeInSection>
          <div className="mx-auto max-w-3xl text-center mb-12">
            <h2 className="text-2xl font-bold text-white sm:text-3xl">
              Why not just prompt an LLM?
            </h2>
          </div>
          <div className="mx-auto max-w-2xl space-y-6">
            {[
              {
                point: "LLMs don't know who's actively deploying right now.",
                detail: "The brain does. Live tracker data, updated continuously.",
              },
              {
                point: "LLMs can't score investor fit against real portfolio data.",
                detail: "The brain cross-references 500K+ investor profiles with current deployment patterns.",
              },
              {
                point: "LLMs hallucinate fundraising advice.",
                detail: "The brain is calibrated on real raise outcomes. Every recommendation has data behind it.",
              },
              {
                point: "LLMs forget everything between calls.",
                detail: "The brain maintains persistent context across your entire raise.",
              },
            ].map((item) => (
              <div key={item.point}>
                <p className="text-sm text-white font-medium">{item.point}</p>
                <p className="text-sm text-zinc-500 mt-1">{item.detail}</p>
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
              Build with raise(fn)
            </h2>
            <p className="text-zinc-500 mb-8">
              API access is in early access. Get in before it opens.
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
