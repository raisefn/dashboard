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
            Give your agent a{" "}
            <span className="text-teal-400">fundraising brain</span>
          </h1>
          <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
            One API call — investor matching, readiness scoring, narrative
            analysis, signal reading, outreach strategy, and term sheet comps.
          </p>
        </div>
      </section>

      {/* ── What Agents Can Do ── */}
      <section className="relative py-24 px-4">
        <FadeInSection>
          <div className="mx-auto max-w-2xl space-y-10">
            {[
              {
                action: "Match investors for a DeFi project raising Series A",
                result: "50 ranked investors with fit scores, recent investments, and preferred intro paths.",
                color: "#2dd4bf",
              },
              {
                action: "Evaluate if a project is ready to raise",
                result: "Readiness score with metric comparisons against successful comparable rounds.",
                color: "#34d399",
              },
              {
                action: "Analyze a pitch narrative for target investors",
                result: "Per-investor positioning feedback and suggested rewrites.",
                color: "#fbbf24",
              },
              {
                action: "Read signals from an investor interaction",
                result: "Behavioral pattern match with probability and recommended next steps.",
                color: "#fb923c",
              },
              {
                action: "Generate outreach strategy for a specific investor",
                result: "Best contact, preferred approach, and what's worked for similar projects.",
                color: "#f87171",
              },
              {
                action: "Compare a term sheet against market rates",
                result: "Median terms, flagged non-standard provisions, and leverage points.",
                color: "#a78bfa",
              },
            ].map((item) => (
              <div key={item.action} className="border-l-2 pl-6" style={{ borderColor: `${item.color}40` }}>
                <p className="text-sm text-white font-medium mb-1">
                  &ldquo;{item.action}&rdquo;
                </p>
                <p className="text-sm text-zinc-500">{item.result}</p>
              </div>
            ))}
          </div>
        </FadeInSection>
      </section>

      {/* ── Frameworks ── */}
      <section className="relative py-24 px-4">
        <FadeInSection>
          <div className="mx-auto max-w-2xl text-center mb-10">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-400 mb-4">
              Integrations
            </p>
            <h2 className="text-3xl font-bold text-white sm:text-4xl">
              Works with your stack
            </h2>
          </div>
          <div className="mx-auto max-w-md space-y-2">
            {[
              { name: "LangChain", color: "#2dd4bf" },
              { name: "CrewAI", color: "#f97316" },
              { name: "Claude / MCP", color: "#a78bfa" },
              { name: "REST API", color: "#71717a" },
            ].map((fw) => (
              <div key={fw.name} className="flex items-center gap-4 py-3">
                <span
                  className="h-2 w-2 rounded-full shrink-0"
                  style={{ backgroundColor: fw.color }}
                />
                <span className="text-sm font-medium text-zinc-300">
                  {fw.name}
                </span>
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
            <div className="flex flex-wrap justify-center gap-4 mt-8">
              <a
                href="https://github.com/raisefn"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-violet-700/50 bg-violet-950/20 px-8 py-3 text-sm font-medium text-violet-300 transition-all hover:border-violet-500 hover:bg-violet-900/30"
              >
                View on GitHub
              </a>
              <a
                href="mailto:justinpetsche@gmail.com?subject=raise(fn) Brain — API Key Request"
                className="rounded-full border border-zinc-700 px-8 py-3 text-sm font-medium text-zinc-300 transition-all hover:border-zinc-500 hover:text-white"
              >
                Request API Key
              </a>
            </div>
          </div>
        </FadeInSection>
      </section>
    </div>
  );
}
