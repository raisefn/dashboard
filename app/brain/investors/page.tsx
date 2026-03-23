import Link from "next/link";
import FadeInSection from "@/components/fade-in-section";

/* ── Deal Flow Matching Output ── */
function DealFlowOutput() {
  const deals = [
    { company: "Luminos AI", sector: "AI Infrastructure", stage: "Seed", signal: "Form D filed 3 days ago", traction: "12K GitHub stars, 8K npm/wk", match: 96, color: "#2dd4bf" },
    { company: "PayStack Pro", sector: "Payments", stage: "Pre-seed", signal: "YC W26 batch, demo day next week", traction: "$40K MRR, 180% MoM", match: 91, color: "#34d399" },
    { company: "CarbonLedger", sector: "Climate Tech", stage: "Seed", signal: "SBIR Phase II grant awarded", traction: "3 enterprise pilots", match: 84, color: "#fbbf24" },
    { company: "Vaultik", sector: "Security", stage: "Seed", signal: "Traction spike on Product Hunt", traction: "2.1K upvotes, #1 of day", match: 79, color: "#fb923c" },
  ];

  return (
    <div className="rounded-2xl border border-zinc-800 overflow-hidden" style={{ background: "linear-gradient(180deg, rgba(24,24,27,0.95), rgba(9,9,11,0.98))" }}>
      <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-800/80">
        <span className="text-[11px] text-zinc-500 font-medium tracking-wide">Deal Flow — Matching Your Thesis</span>
        <span className="text-[10px] text-teal-500/60 font-semibold tracking-widest uppercase">4 new this week</span>
      </div>
      <div className="p-4 space-y-3">
        {deals.map((deal, i) => (
          <div key={i} className="rounded-lg border border-zinc-800/50 bg-zinc-900/30 px-4 py-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-white">{deal.company}</p>
                <span className="text-[9px] px-1.5 py-0.5 rounded font-medium border" style={{ color: deal.color, borderColor: `${deal.color}40`, backgroundColor: `${deal.color}10` }}>
                  {deal.stage}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-zinc-600">{deal.sector}</span>
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold" style={{ backgroundColor: `${deal.color}15`, color: deal.color, border: `1px solid ${deal.color}30` }}>
                  {deal.match}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <p className="text-xs text-teal-400">{deal.signal}</p>
              <span className="text-xs text-zinc-600">&middot;</span>
              <p className="text-xs text-zinc-500">{deal.traction}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Instant Diligence Output ── */
function DiligenceOutput() {
  const sections = [
    {
      label: "Traction",
      items: [
        { metric: "GitHub Stars", value: "12,400", trend: "+340 this week", status: "strong" },
        { metric: "npm Downloads", value: "8.2K/wk", trend: "+62% MoM", status: "strong" },
        { metric: "HN Mentions", value: "7 in 30d", trend: "2 front page", status: "strong" },
      ],
    },
    {
      label: "Signals",
      items: [
        { metric: "Form D", value: "Filed Mar 18", trend: "$2.5M target", status: "confirmed" },
        { metric: "Team", value: "4 engineers", trend: "Ex-Stripe, ex-Google", status: "strong" },
        { metric: "Competitors", value: "3 funded", trend: "Largest at $8M seed", status: "flag" },
      ],
    },
  ];

  const statusStyles: Record<string, string> = {
    strong: "bg-emerald-950/50 text-emerald-400 border-emerald-800/30",
    confirmed: "bg-teal-950/50 text-teal-400 border-teal-800/30",
    flag: "bg-amber-950/50 text-amber-400 border-amber-800/30",
  };

  return (
    <div className="rounded-2xl border border-zinc-800 overflow-hidden" style={{ background: "linear-gradient(180deg, rgba(24,24,27,0.95), rgba(9,9,11,0.98))" }}>
      <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-800/80">
        <span className="text-[11px] text-zinc-500 font-medium tracking-wide">Diligence — Luminos AI</span>
        <span className="text-[10px] text-zinc-500">Compiled in 8 seconds</span>
      </div>
      <div className="p-4 space-y-4">
        {sections.map((section, i) => (
          <div key={i}>
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">{section.label}</p>
            <div className="space-y-2">
              {section.items.map((item, j) => (
                <div key={j} className="flex items-center gap-3 rounded border border-zinc-800/50 bg-zinc-900/20 px-3 py-2">
                  <span className="text-[10px] text-zinc-500 uppercase tracking-wider w-24 shrink-0">{item.metric}</span>
                  <span className="text-sm font-semibold text-zinc-200 flex-1">{item.value}</span>
                  <span className="text-xs text-zinc-500">{item.trend}</span>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded font-semibold border ${statusStyles[item.status]}`}>
                    {item.status.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="px-5 py-3 border-t border-zinc-800/50">
        <p className="text-xs text-zinc-500 leading-relaxed">
          <span className="text-teal-400 font-medium">Summary:</span> Strong developer traction with credible team. Competitive landscape is getting crowded — speed matters if you want in on this round. Form D confirms they&apos;re actively raising.
        </p>
      </div>
    </div>
  );
}

/* ── Deal Pipeline CRM ── */
function DealPipelineOutput() {
  const deals = [
    { company: "Luminos AI", status: "Deep diligence", lastNote: "Strong traction, checking references this week", daysAgo: 1, color: "#34d399" },
    { company: "PayStack Pro", status: "First call scheduled", lastNote: "Demo day pitch was solid, want to see product", daysAgo: 0, color: "#2dd4bf" },
    { company: "Meridian Health", status: "Monitoring", lastNote: "Too early — revisit after FDA pilot results in Q3", daysAgo: 8, color: "#fbbf24" },
    { company: "CarbonLedger", status: "Passed", lastNote: "Unit economics don't work at current scale", daysAgo: 14, color: "#f87171" },
    { company: "NovaPay", status: "Term sheet sent", lastNote: "$3M at $15M pre, waiting for founder response", daysAgo: 2, color: "#a78bfa" },
  ];

  return (
    <div className="rounded-2xl border border-zinc-800 overflow-hidden" style={{ background: "linear-gradient(180deg, rgba(24,24,27,0.95), rgba(9,9,11,0.98))" }}>
      <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-800/80">
        <span className="text-[11px] text-zinc-500 font-medium tracking-wide">Your Deal Pipeline</span>
        <span className="text-[10px] text-zinc-500">5 active &middot; 1 term sheet out</span>
      </div>
      <div className="divide-y divide-zinc-800/50">
        {deals.map((deal, i) => (
          <div key={i} className="flex items-center gap-4 px-5 py-3">
            <div className="w-1 h-8 rounded-full shrink-0" style={{ backgroundColor: deal.color }} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-white">{deal.company}</p>
                <span className="text-[9px] px-1.5 py-0.5 rounded font-medium border" style={{ color: deal.color, borderColor: `${deal.color}40`, backgroundColor: `${deal.color}10` }}>
                  {deal.status}
                </span>
              </div>
              <p className="text-xs text-zinc-500 mt-0.5">{deal.lastNote}</p>
            </div>
            <span className="shrink-0 text-[10px] text-zinc-600">
              {deal.daysAgo === 0 ? "today" : `${deal.daysAgo}d ago`}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Market Intelligence Output ── */
function MarketIntelOutput() {
  const sectors = [
    { name: "AI Infrastructure", deals: 47, avgSize: "$4.2M", trend: "up", heat: 94, color: "#2dd4bf" },
    { name: "Fintech / Payments", deals: 31, avgSize: "$3.8M", trend: "up", heat: 82, color: "#34d399" },
    { name: "Climate Tech", deals: 22, avgSize: "$5.1M", trend: "stable", heat: 68, color: "#fbbf24" },
    { name: "Consumer Social", deals: 12, avgSize: "$2.9M", trend: "down", heat: 35, color: "#f87171" },
  ];

  const trendIcon: Record<string, string> = { up: "↑", down: "↓", stable: "→" };
  const trendColor: Record<string, string> = { up: "#34d399", down: "#f87171", stable: "#fbbf24" };

  return (
    <div className="rounded-2xl border border-zinc-800 overflow-hidden" style={{ background: "linear-gradient(180deg, rgba(24,24,27,0.95), rgba(9,9,11,0.98))" }}>
      <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-800/80">
        <span className="text-[11px] text-zinc-500 font-medium tracking-wide">Market Intelligence — Seed Stage, Q1 2026</span>
        <span className="text-[10px] text-teal-500/60 font-semibold tracking-widest uppercase">Live</span>
      </div>
      <div className="p-4 space-y-3">
        {sectors.map((sector, i) => (
          <div key={i} className="flex items-center gap-4">
            <span className="text-sm text-zinc-300 w-36 shrink-0">{sector.name}</span>
            <div className="flex-1">
              <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${sector.heat}%`, backgroundColor: sector.color }} />
              </div>
            </div>
            <span className="text-xs font-semibold" style={{ color: trendColor[sector.trend] }}>
              {trendIcon[sector.trend]}
            </span>
            <span className="text-xs text-zinc-500 w-16 text-right">{sector.deals} deals</span>
            <span className="text-xs text-zinc-600 w-14 text-right">{sector.avgSize}</span>
          </div>
        ))}
      </div>
      <div className="px-5 py-3 border-t border-zinc-800/50">
        <p className="text-xs text-zinc-500 leading-relaxed">
          <span className="text-teal-400 font-medium">Insight:</span> AI infrastructure is running hot — 47 seed deals this quarter, up 60% from Q4. Consumer social is cooling fast. If you&apos;re deploying in AI infra, move quickly — competition for the best deals is intensifying.
        </p>
      </div>
    </div>
  );
}

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
            The best deals close{" "}
            <span className="text-orange-500">before you hear about them.</span>
          </h1>
          <p className="text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            You&apos;re sourcing from your network and reacting to inbound.
            Meanwhile, the best rounds are closing with investors who saw
            the signals first. That&apos;s what changes.
          </p>
        </div>
      </section>

      {/* ── Problem 1: Late to deals ── */}
      <section className="relative py-20 px-4">
        <FadeInSection>
          <div className="mx-auto max-w-4xl">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 items-start">
              <div className="lg:col-span-2">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500 mb-3">
                  The problem
                </p>
                <h2 className="text-2xl font-bold text-white mb-4">
                  You see deals after everyone else.
                </h2>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  By the time a deal hits your inbox, three other funds have already set terms. The best companies don&apos;t need to come to you — they get found by investors who saw the signals early.
                </p>
              </div>
              <div className="lg:col-span-3">
                <DealFlowOutput />
              </div>
            </div>
          </div>
        </FadeInSection>
      </section>

      {/* ── Problem 2: Diligence takes forever ── */}
      <section className="relative py-20 px-4">
        <FadeInSection>
          <div className="mx-auto max-w-4xl">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 items-start">
              <div className="lg:col-span-3 lg:order-1">
                <DiligenceOutput />
              </div>
              <div className="lg:col-span-2 lg:order-2">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500 mb-3">
                  The problem
                </p>
                <h2 className="text-2xl font-bold text-white mb-4">
                  Diligence takes days. It should take seconds.
                </h2>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  You spend hours Googling a company, checking GitHub, reading Crunchbase, asking your network. Thirty seconds of cross-referenced signal data would have told you everything you needed to know.
                </p>
              </div>
            </div>
          </div>
        </FadeInSection>
      </section>

      {/* ── Problem 3: Deal flow black hole ── */}
      <section className="relative py-20 px-4">
        <FadeInSection>
          <div className="mx-auto max-w-4xl">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 items-start">
              <div className="lg:col-span-2">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500 mb-3">
                  The problem
                </p>
                <h2 className="text-2xl font-bold text-white mb-4">
                  Your pipeline is a black hole.
                </h2>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  You talk to 200 founders a year. Who was the climate tech company from February? What did they say about their ARR? When did you tell them to check back? It&apos;s scattered across email, notes, and your memory. Just ask the brain.
                </p>
              </div>
              <div className="lg:col-span-3">
                <DealPipelineOutput />
              </div>
            </div>
          </div>
        </FadeInSection>
      </section>

      {/* ── Problem 4: Market blind spots ── */}
      <section className="relative py-20 px-4">
        <FadeInSection>
          <div className="mx-auto max-w-4xl">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 items-start">
              <div className="lg:col-span-3 lg:order-1">
                <MarketIntelOutput />
              </div>
              <div className="lg:col-span-2 lg:order-2">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500 mb-3">
                  The problem
                </p>
                <h2 className="text-2xl font-bold text-white mb-4">
                  Your market read is based on vibes.
                </h2>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  You get your market intelligence from conferences, Twitter, and partner meetings. By the time a trend is obvious, the best deals in that sector are already priced. Live data shows you what&apos;s actually happening — this quarter, not last year.
                </p>
              </div>
            </div>
          </div>
        </FadeInSection>
      </section>

      {/* ── The shift ── */}
      <section className="relative py-24 px-4">
        <FadeInSection>
          <div className="mx-auto max-w-3xl text-center">
            <div className="rounded-2xl border border-orange-800/40 px-8 py-12 sm:px-12 sm:py-16" style={{ background: "linear-gradient(180deg, rgba(249,115,22,0.04), rgba(9,9,11,0.98))" }}>
              <h2 className="text-2xl font-bold text-white sm:text-3xl leading-tight mb-6">
                The edge isn&apos;t more deals. It&apos;s better signal.
              </h2>
              <p className="text-lg text-zinc-400 leading-relaxed">
                Every investor sees deals. The ones who win see them first, evaluate them fastest, and know what the market is actually doing — not what it was doing last quarter. That&apos;s what the brain gives you.
              </p>
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
              We&apos;re working with a small group of investors to get this right.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/pricing"
                className="rounded-full border border-orange-700/50 bg-orange-950/30 px-8 py-3 text-sm font-medium text-orange-300 transition-all hover:border-orange-500 hover:bg-orange-900/40 hover:text-orange-200"
              >
                See pricing
              </Link>
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
