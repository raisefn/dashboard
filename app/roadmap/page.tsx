import FadeInSection from "@/components/fade-in-section";

type Status = "live" | "building" | "planned";
type Audience = "founders" | "investors" | "everyone";

const audienceColors: Record<Audience, string> = {
  founders: "#2dd4bf",
  investors: "#f97316",
  everyone: "#fbbf24",
};

const audienceLabel: Record<Audience, string> = {
  founders: "Founders",
  investors: "Investors",
  everyone: "Everyone",
};

// Roadmap v3 (2026-07-06): rewritten to reflect actual current state.
// Killed aspirational content items (Grant Discovery, Crowdfunding
// Strategy, Revenue-Based Financing), marketplace framing (Fit Scores,
// LP Context), data-first items (Data Freshness Layer, Privacy &
// Aggregation), and "capabilities" that were really just "the agent
// can talk about this" (Signal Reading, Term Sheet Read, Outreach
// Guidance, Valuation Calibration, Raise Timing, Competitive Raise
// Intel, Co-investor Sequencing).
//
// What's here: the founder-side product that actually ships today,
// the investor-side product that's in progress, and the near-term
// planned work. Honest. If you can't demo it in a chat session, it's
// not "live."
const capabilities: {
  label: string;
  oneliner: string;
  status: Status;
  audience: Audience;
}[] = [
  // ── LIVE for founders (the shipped product) ──
  { label: "Agent chat", oneliner: "Captures your raise from conversation — company, team, metrics, story, ask", status: "live", audience: "founders" },
  { label: "Deck critique", oneliner: "Slide-by-slide analysis — narrative gaps, weak asks, comp rounds at your stage", status: "live", audience: "founders" },
  { label: "Investor sourcing", oneliner: "Ranked by real check behavior — sector, stage, geo, cadence, active-deployment filtering", status: "live", audience: "founders" },
  { label: "Investor briefs", oneliner: "One-page per-investor research — thesis, recent bets, decision process, key contacts", status: "live", audience: "founders" },
  { label: "Outreach drafting", oneliner: "Personalized per investor — approve, edit, send", status: "live", audience: "founders" },
  { label: "Gmail send", oneliner: "Draft in-app, send from your own inbox — every reply captured", status: "live", audience: "founders" },
  { label: "Meeting prep", oneliner: "Six-section briefing per meeting — angles, risks, hard questions, asks", status: "live", audience: "founders" },
  { label: "Meeting debriefs", oneliner: "Captured after each call — what landed, what to change, next steps", status: "live", audience: "founders" },
  { label: "Pipeline memory", oneliner: "Auto-updated as you work — no CRM to keep clean", status: "live", audience: "founders" },
  { label: "Persistent memory", oneliner: "Across sessions, across raises — pick up exactly where you left off", status: "live", audience: "founders" },
  { label: "Term sheet walkthrough", oneliner: "Plain English every clause — flags the founder-hostile ones", status: "live", audience: "founders" },

  // ── LIVE for everyone (public resources) ──
  { label: "Public tracker", oneliner: "Funding rounds, investors, projects — sourced from SEC filings and public records", status: "live", audience: "everyone" },
  { label: "Raise Intel", oneliner: "Published fundraising research — updated on a daily cadence", status: "live", audience: "everyone" },

  // ── IN PROGRESS ──
  { label: "Fund Raise Plan V1", oneliner: "The investor agent — LP targeting, per-LP briefs, DDQ handling, pipeline through close", status: "building", audience: "investors" },
  { label: "Bring your agent (MCP)", oneliner: "Connect ChatGPT, Claude, or your own assistant to your raise(fn) data", status: "building", audience: "everyone" },

  // ── PLANNED (near-term) ──
  { label: "Reply detection", oneliner: "Agent reads investor replies, updates your pipeline automatically", status: "planned", audience: "founders" },
  { label: "Cross-raise memory", oneliner: "Your seed round teaches your Series A — emails, decks, positioning carry forward", status: "planned", audience: "founders" },
  { label: "Calendar integration", oneliner: "Google Calendar — meetings auto-captured, prep + debrief without manual logging", status: "planned", audience: "everyone" },
  { label: "Meeting transcript ingestion", oneliner: "Otter, Fireflies, Fathom — transcripts flow in automatically", status: "planned", audience: "everyone" },
];

export default function RoadmapPage() {
  const live = capabilities.filter((c) => c.status === "live");
  const building = capabilities.filter((c) => c.status === "building");
  const planned = capabilities.filter((c) => c.status === "planned");

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
            We&apos;re building in the open. Here&apos;s exactly where things
            stand — what&apos;s live, what we&apos;re actively working on, and
            what&apos;s coming next. If you can&apos;t use it in a chat session
            today, it&apos;s not marked live.
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
                  <div className="w-1 self-stretch rounded-full shrink-0" style={{ backgroundColor: audienceColors[cap.audience] }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold" style={{ color: audienceColors[cap.audience] }}>{cap.label}</p>
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
