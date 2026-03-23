import FadeInSection from "@/components/fade-in-section";

type Status = "live" | "building" | "planned";

const audienceColors: Record<string, string> = {
  founders: "#2dd4bf",
  investors: "#f97316",
  developers: "#a78bfa",
  everyone: "#fbbf24",
};

const capabilities: { label: string; oneliner: string; status: Status; audience: string; color: string }[] = [
  // Live
  { label: "Investor Matching", oneliner: "Find who's actively deploying in your sector right now", status: "live", audience: "founders", color: "#2dd4bf" },
  { label: "Readiness Evaluation", oneliner: "Know if your metrics are strong enough before you pitch", status: "live", audience: "founders", color: "#34d399" },
  { label: "Narrative Analysis", oneliner: "Is your pitch landing? Find out before you send it", status: "live", audience: "founders", color: "#fbbf24" },
  { label: "Signal Reading", oneliner: "Decode what investor behavior actually means", status: "live", audience: "founders", color: "#fb923c" },
  { label: "Outreach Guidance", oneliner: "Per-investor strategy — specific, not generic", status: "live", audience: "founders", color: "#f87171" },
  { label: "Term Sheet Intelligence", oneliner: "Your terms in context against live market data", status: "live", audience: "founders", color: "#a78bfa" },
  { label: "Pipeline Memory", oneliner: "Your raise has a memory — no spreadsheet required", status: "live", audience: "everyone", color: "#2dd4bf" },
  { label: "Meeting Ingestion", oneliner: "Paste a transcript, brain captures everything", status: "live", audience: "everyone", color: "#34d399" },
  { label: "Conversation Memory", oneliner: "The brain remembers your entire history across sessions", status: "live", audience: "everyone", color: "#a78bfa" },
  { label: "Tracker — Rounds", oneliner: "Live funding rounds from SEC filings and 290+ sources", status: "live", audience: "everyone", color: "#2dd4bf" },
  { label: "Tracker — Investors", oneliner: "Investor profiles cross-referenced across data sources", status: "live", audience: "everyone", color: "#fb923c" },
  { label: "Tracker — Projects", oneliner: "Companies tracked with traction signals and team data", status: "live", audience: "everyone", color: "#34d399" },
  { label: "Deal CRM", oneliner: "Track every deal through conversation — no data entry", status: "live", audience: "everyone", color: "#fb923c" },
  { label: "Pitch Deck Analysis", oneliner: "Paste your deck, get calibrated feedback on narrative and positioning", status: "live", audience: "founders", color: "#fbbf24" },
  { label: "Email Notifications", oneliner: "Follow-up reminders and stale pipeline alerts via email", status: "live", audience: "everyone", color: "#34d399" },
  { label: "Outreach Drafting", oneliner: "Cold emails, warm intro requests, and follow-ups — tailored per investor", status: "live", audience: "founders", color: "#f87171" },
  // Building
  { label: "Deal Flow Matching", oneliner: "Companies matching your thesis, surfaced before they're public", status: "building", audience: "investors", color: "#f97316" },
  // Planned
  { label: "Valuation Calibration", oneliner: "What the data says your company is worth right now", status: "planned", audience: "founders", color: "#fbbf24" },
  { label: "Raise Timing", oneliner: "Should you raise now or wait?", status: "planned", audience: "founders", color: "#34d399" },
  { label: "Co-investor Sequencing", oneliner: "Who to bring in first to unlock the next investor", status: "planned", audience: "founders", color: "#a78bfa" },
  { label: "Competitive Raise Intel", oneliner: "Who else is raising in your space right now", status: "planned", audience: "founders", color: "#f87171" },
  { label: "Behavioral Intelligence", oneliner: "How investors actually behave — from real raise data", status: "planned", audience: "investors", color: "#f97316" },
  { label: "Portfolio Monitoring", oneliner: "Track portfolio company health from public signals", status: "planned", audience: "investors", color: "#fb923c" },
  { label: "Post-raise Intelligence", oneliner: "Prepare for your next round before you need it", status: "planned", audience: "founders", color: "#2dd4bf" },
  { label: "Sector Analysis", oneliner: "Market-level trends, activity, and momentum by sector", status: "planned", audience: "investors", color: "#fbbf24" },
  { label: "Developer SDK", oneliner: "REST API and native integrations for LangChain, CrewAI, Claude", status: "planned", audience: "developers", color: "#a78bfa" },
  { label: "x402 Payments", oneliner: "Agents discover and pay autonomously — no API key required", status: "planned", audience: "developers", color: "#a78bfa" },
];

const statusColor: Record<Status, string> = {
  live: "#2dd4bf",
  building: "#f97316",
  planned: "#52525b",
};

const statusLabel: Record<Status, string> = {
  live: "Live",
  building: "In progress",
  planned: "Planned",
};

const audienceLabel: Record<string, string> = {
  founders: "Founders",
  investors: "Investors",
  developers: "Developers",
  everyone: "Everyone",
};

export default function RoadmapPage() {
  const live = capabilities.filter(c => c.status === "live");
  const building = capabilities.filter(c => c.status === "building");
  const planned = capabilities.filter(c => c.status === "planned");

  return (
    <div className="relative">
      <div className="grid-bg" />

      {/* ── Hero ── */}
      <section className="relative py-24 px-4">
        <div className="mx-auto max-w-3xl text-center animate-fade-in">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-400 mb-4">
            Roadmap
          </p>
          <h1 className="text-4xl font-bold text-white sm:text-5xl mb-6">
            What we&apos;ve built. What&apos;s next.
          </h1>
          <p className="text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            We&apos;re building in the open. Here&apos;s exactly where things stand — what&apos;s live, what we&apos;re actively working on, and what&apos;s coming.
          </p>
          <div className="flex justify-center gap-8 mt-10">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-teal-400" />
              <span className="text-sm text-zinc-400">Live</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-orange-500" />
              <span className="text-sm text-zinc-400">In progress</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-zinc-600" />
              <span className="text-sm text-zinc-400">Planned</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Live ── */}
      <section className="relative py-12 px-4">
        <FadeInSection>
          <div className="mx-auto max-w-2xl">
            <div className="flex items-center gap-3 mb-8">
              <span className="h-3 w-3 rounded-full bg-teal-400" />
              <h2 className="text-xl font-bold text-white">Live now</h2>
              <span className="text-sm text-zinc-500">{live.length} capabilities</span>
            </div>
            <div className="space-y-0">
              {live.map((cap, i) => (
                <div key={i} className="flex items-center gap-4 py-3.5 border-b border-zinc-800/40">
                  <div className="w-1 self-stretch rounded-full shrink-0" style={{ backgroundColor: cap.color }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold" style={{ color: cap.color }}>{cap.label}</p>
                    <p className="text-sm text-zinc-500">{cap.oneliner}</p>
                  </div>
                  <span className="shrink-0 text-[10px] font-medium uppercase tracking-wider" style={{ color: audienceColors[cap.audience] }}>
                    {audienceLabel[cap.audience]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </FadeInSection>
      </section>

      {/* ── Building ── */}
      <section className="relative py-12 px-4">
        <FadeInSection>
          <div className="mx-auto max-w-2xl">
            <div className="flex items-center gap-3 mb-8">
              <span className="h-3 w-3 rounded-full bg-orange-500" />
              <h2 className="text-xl font-bold text-white">In progress</h2>
              <span className="text-sm text-zinc-500">{building.length} capabilities</span>
            </div>
            <div className="space-y-0">
              {building.map((cap, i) => (
                <div key={i} className="flex items-center gap-4 py-3.5 border-b border-zinc-800/40">
                  <div className="w-1 self-stretch rounded-full shrink-0 bg-orange-500" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-orange-400">{cap.label}</p>
                    <p className="text-sm text-zinc-500">{cap.oneliner}</p>
                  </div>
                  <span className="shrink-0 text-[10px] font-medium uppercase tracking-wider text-orange-500/70">
                    {audienceLabel[cap.audience]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </FadeInSection>
      </section>

      {/* ── Planned ── */}
      <section className="relative py-12 px-4">
        <FadeInSection>
          <div className="mx-auto max-w-2xl">
            <div className="flex items-center gap-3 mb-8">
              <span className="h-3 w-3 rounded-full bg-zinc-600" />
              <h2 className="text-xl font-bold text-zinc-400">Planned</h2>
              <span className="text-sm text-zinc-600">{planned.length} capabilities</span>
            </div>
            <div className="space-y-0">
              {planned.map((cap, i) => (
                <div key={i} className="flex items-center gap-4 py-3.5 border-b border-zinc-800/20">
                  <div className="w-1 self-stretch rounded-full shrink-0 bg-zinc-700" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-zinc-500">{cap.label}</p>
                    <p className="text-sm text-zinc-600">{cap.oneliner}</p>
                  </div>
                  <span className="shrink-0 text-[10px] font-medium uppercase tracking-wider text-zinc-600">
                    {audienceLabel[cap.audience]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </FadeInSection>
      </section>

      {/* ── Bottom note ── */}
      <section className="relative py-16 px-4">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm text-zinc-600 leading-relaxed">
            This roadmap is a living document. Priorities shift as we learn from our users.
            If something here matters to you, <a href="mailto:team@raisefn.com" className="text-zinc-400 hover:text-white transition-colors">let us know</a> — it helps us decide what to build next.
          </p>
        </div>
      </section>
    </div>
  );
}
