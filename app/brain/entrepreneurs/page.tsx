import Link from "next/link";
import FadeInSection from "@/components/fade-in-section";

/* ── Investor Match Card ── */
function InvestorMatchOutput() {
  const investors = [
    { name: "Ribbit Capital", fit: 94, status: "Deployed 3x in fintech this quarter", speed: "Fast mover", color: "#2dd4bf" },
    { name: "First Round Capital", fit: 87, status: "Active in your ARR range", speed: "Partner engaged", color: "#34d399" },
    { name: "Bessemer Venture Partners", fit: 82, status: "Portfolio gap in payments", speed: "Moderate", color: "#fbbf24" },
    { name: "Index Ventures", fit: 76, status: "New fund, actively deploying", speed: "Fast mover", color: "#fb923c" },
  ];

  return (
    <div className="rounded-2xl border border-zinc-800 overflow-hidden" style={{ background: "linear-gradient(180deg, rgba(24,24,27,0.95), rgba(9,9,11,0.98))" }}>
      <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-800/80">
        <span className="text-[11px] text-zinc-500 font-medium tracking-wide">Investor Match — Series A Fintech</span>
        <span className="text-[10px] text-teal-500/60 font-semibold tracking-widest uppercase">Live data</span>
      </div>
      <div className="p-4 space-y-3">
        {investors.map((inv, i) => (
          <div key={i} className="flex items-center gap-4 rounded-lg border border-zinc-800/50 bg-zinc-900/30 px-4 py-3">
            <div className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold" style={{ backgroundColor: `${inv.color}15`, color: inv.color, border: `1px solid ${inv.color}30` }}>
              {inv.fit}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-white">{inv.name}</p>
                <span className="text-[9px] px-1.5 py-0.5 rounded font-semibold bg-emerald-950/50 text-emerald-400 border border-emerald-800/30">{inv.speed}</span>
              </div>
              <p className="text-xs text-zinc-500 mt-0.5">{inv.status}</p>
            </div>
            <div className="shrink-0">
              <div className="w-16 h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${inv.fit}%`, backgroundColor: inv.color }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Readiness Benchmark ── */
function ReadinessOutput() {
  const metrics = [
    { label: "ARR", yours: "$1.2M", benchmark: "$1.5M", pct: 80, status: "close", color: "#fbbf24" },
    { label: "MoM Growth", yours: "25%", benchmark: "15%", pct: 100, status: "strong", color: "#34d399" },
    { label: "Net Retention", yours: "115%", benchmark: "120%", pct: 85, status: "close", color: "#fbbf24" },
    { label: "Burn Multiple", yours: "1.8x", benchmark: "2.0x", pct: 100, status: "strong", color: "#34d399" },
    { label: "CAC Payback", yours: "14mo", benchmark: "10mo", pct: 55, status: "flag", color: "#f87171" },
  ];

  return (
    <div className="rounded-2xl border border-zinc-800 overflow-hidden" style={{ background: "linear-gradient(180deg, rgba(24,24,27,0.95), rgba(9,9,11,0.98))" }}>
      <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-800/80">
        <span className="text-[11px] text-zinc-500 font-medium tracking-wide">Readiness — Series A B2B SaaS</span>
        <span className="text-[10px] px-1.5 py-0.5 rounded font-semibold bg-amber-950/50 text-amber-400 border border-amber-800/30">READY — WITH FLAGS</span>
      </div>
      <div className="p-4 space-y-3">
        {metrics.map((m, i) => (
          <div key={i} className="flex items-center gap-4">
            <span className="text-[10px] text-zinc-500 uppercase tracking-wider w-20 shrink-0">{m.label}</span>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-semibold text-zinc-200">{m.yours}</span>
                <span className="text-[10px] text-zinc-600">median: {m.benchmark}</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                <div className="h-full rounded-full transition-all" style={{ width: `${m.pct}%`, backgroundColor: m.color }} />
              </div>
            </div>
            <span className={`shrink-0 text-[9px] px-1.5 py-0.5 rounded font-semibold border ${
              m.status === "strong" ? "bg-emerald-950/50 text-emerald-400 border-emerald-800/30" :
              m.status === "flag" ? "bg-red-950/50 text-red-400 border-red-800/30" :
              "bg-amber-950/50 text-amber-400 border-amber-800/30"
            }`}>
              {m.status === "strong" ? "STRONG" : m.status === "flag" ? "FLAG" : "CLOSE"}
            </span>
          </div>
        ))}
      </div>
      <div className="px-5 py-3 border-t border-zinc-800/50">
        <p className="text-xs text-zinc-500 leading-relaxed">
          <span className="text-amber-400 font-medium">Bottom line:</span> Your growth is exceptional but CAC payback is above benchmark. Lead with cohort analysis showing newer cohorts at 9-month payback. Wait 60 days to go out at ~$1.5M ARR with a proven curve.
        </p>
      </div>
    </div>
  );
}

/* ── Signal Timeline ── */
function SignalOutput() {
  const events = [
    { day: "Day 1", event: "Cold email sent to partner", signal: null, color: "#52525b" },
    { day: "Day 1", event: "Partner responds in 2 hours", signal: "High interest — fast responses at Sequoia mean they've flagged it internally", color: "#34d399" },
    { day: "Day 3", event: "Routed to sector lead", signal: "Good sign — sector routing means thesis alignment, not a polite pass", color: "#34d399" },
    { day: "Day 8", event: "Silence", signal: "Normal — their IC process takes 7-12 days. This isn't ghosting, it's process.", color: "#fbbf24" },
    { day: "Day 10", event: "→ Send brief follow-up", signal: "One new data point — a customer win or metric update. Don't chase.", color: "#2dd4bf" },
    { day: "Day 14", event: "Partner meeting requested", signal: "Confirmed: they're moving you through the funnel. Prep for deep diligence.", color: "#34d399" },
  ];

  return (
    <div className="rounded-2xl border border-zinc-800 overflow-hidden" style={{ background: "linear-gradient(180deg, rgba(24,24,27,0.95), rgba(9,9,11,0.98))" }}>
      <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-800/80">
        <span className="text-[11px] text-zinc-500 font-medium tracking-wide">Signal Timeline — Sequoia Capital</span>
        <span className="text-[10px] text-emerald-500/60 font-semibold tracking-widest uppercase">Progressing</span>
      </div>
      <div className="p-4">
        <div className="relative pl-6">
          <div className="absolute left-2 top-2 bottom-2 w-px bg-zinc-800" />
          <div className="space-y-4">
            {events.map((ev, i) => (
              <div key={i} className="relative">
                <div className="absolute -left-4 top-1.5 h-2.5 w-2.5 rounded-full border-2 border-zinc-900" style={{ backgroundColor: ev.color }} />
                <div className="ml-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-zinc-600 font-medium uppercase tracking-wider">{ev.day}</span>
                    <span className="text-sm text-zinc-300">{ev.event}</span>
                  </div>
                  {ev.signal && (
                    <p className="text-xs mt-1 leading-relaxed" style={{ color: ev.color }}>
                      {ev.signal}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Pipeline Memory ── */
function PipelineOutput() {
  const investors = [
    { name: "Accel", status: "Follow-up", lastNote: "Concerned about CAC payback — show cohort data", daysAgo: 3, color: "#fbbf24" },
    { name: "Sequoia", status: "Partner meeting", lastNote: "Sector lead engaged, prep deep diligence deck", daysAgo: 1, color: "#34d399" },
    { name: "a16z", status: "Passed", lastNote: "Too early for their fund size — revisit at Series B", daysAgo: 12, color: "#f87171" },
    { name: "Ribbit Capital", status: "First meeting", lastNote: "Strong thesis alignment, send product demo", daysAgo: 0, color: "#2dd4bf" },
    { name: "Index Ventures", status: "Outreach", lastNote: "Warm intro through portfolio founder confirmed", daysAgo: 5, color: "#a78bfa" },
  ];

  return (
    <div className="rounded-2xl border border-zinc-800 overflow-hidden" style={{ background: "linear-gradient(180deg, rgba(24,24,27,0.95), rgba(9,9,11,0.98))" }}>
      <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-800/80">
        <span className="text-[11px] text-zinc-500 font-medium tracking-wide">Pipeline — Your Raise</span>
        <span className="text-[10px] text-zinc-500">5 active &middot; 1 passed</span>
      </div>
      <div className="divide-y divide-zinc-800/50">
        {investors.map((inv, i) => (
          <div key={i} className="flex items-center gap-4 px-5 py-3">
            <div className="w-1 h-8 rounded-full shrink-0" style={{ backgroundColor: inv.color }} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-white">{inv.name}</p>
                <span className="text-[9px] px-1.5 py-0.5 rounded font-medium border" style={{ color: inv.color, borderColor: `${inv.color}40`, backgroundColor: `${inv.color}10` }}>
                  {inv.status}
                </span>
              </div>
              <p className="text-xs text-zinc-500 mt-0.5">{inv.lastNote}</p>
            </div>
            <span className="shrink-0 text-[10px] text-zinc-600">
              {inv.daysAgo === 0 ? "today" : `${inv.daysAgo}d ago`}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

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
            You have AI for everything.{" "}
            <span className="text-teal-400">Except your raise.</span>
          </h1>
          <p className="text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            Your engineers have Copilot. Your designers have Figma AI. Your sales
            team has Gong. But the single most consequential thing you do as a
            founder — raising capital — you still do with a spreadsheet and gut feel.
          </p>
        </div>
      </section>

      {/* ── Problem 1: Who to pitch ── */}
      <section className="relative py-20 px-4">
        <FadeInSection>
          <div className="mx-auto max-w-4xl">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 items-start">
              <div className="lg:col-span-2">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500 mb-3">
                  The problem
                </p>
                <h2 className="text-2xl font-bold text-white mb-4">
                  You don&apos;t know who to pitch.
                </h2>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  You build a spreadsheet from Google and Crunchbase. Half aren&apos;t deploying. The other half don&apos;t invest in your sector. You find out after you&apos;ve burned the intro.
                </p>
              </div>
              <div className="lg:col-span-3">
                <InvestorMatchOutput />
              </div>
            </div>
          </div>
        </FadeInSection>
      </section>

      {/* ── Problem 2: Not ready ── */}
      <section className="relative py-20 px-4">
        <FadeInSection>
          <div className="mx-auto max-w-4xl">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 items-start">
              <div className="lg:col-span-3 lg:order-1">
                <ReadinessOutput />
              </div>
              <div className="lg:col-span-2 lg:order-2">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500 mb-3">
                  The problem
                </p>
                <h2 className="text-2xl font-bold text-white mb-4">
                  You don&apos;t know if you&apos;re ready.
                </h2>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  You go out too early, pitch your dream investors before the metrics are there, and they pass. You can&apos;t go back. Six months wasted because nobody told you the truth.
                </p>
              </div>
            </div>
          </div>
        </FadeInSection>
      </section>

      {/* ── Problem 3: Flying blind ── */}
      <section className="relative py-20 px-4">
        <FadeInSection>
          <div className="mx-auto max-w-4xl">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 items-start">
              <div className="lg:col-span-2">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500 mb-3">
                  The problem
                </p>
                <h2 className="text-2xl font-bold text-white mb-4">
                  You&apos;re flying blind.
                </h2>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  An investor responded fast, then went silent. Is that a pass? Are they in IC? Should you follow up or wait? You have no idea. Your advisor who raised 5 years ago guesses.
                </p>
              </div>
              <div className="lg:col-span-3">
                <SignalOutput />
              </div>
            </div>
          </div>
        </FadeInSection>
      </section>

      {/* ── Problem 4: Scattered ── */}
      <section className="relative py-20 px-4">
        <FadeInSection>
          <div className="mx-auto max-w-4xl">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 items-start">
              <div className="lg:col-span-3 lg:order-1">
                <PipelineOutput />
              </div>
              <div className="lg:col-span-2 lg:order-2">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500 mb-3">
                  The problem
                </p>
                <h2 className="text-2xl font-bold text-white mb-4">
                  Your raise lives in 10 different tools.
                </h2>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  Notes in Notion. Pipeline in a spreadsheet. Follow-ups in email. Meeting notes somewhere. You spend more time managing the process than actually raising. The brain remembers everything — just ask.
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
            <div className="rounded-2xl border border-teal-800/40 px-8 py-12 sm:px-12 sm:py-16" style={{ background: "linear-gradient(180deg, rgba(45,212,191,0.04), rgba(9,9,11,0.98))" }}>
              <h2 className="text-2xl font-bold text-white sm:text-3xl leading-tight mb-6">
                Fundraising used to be the one thing you couldn&apos;t automate.
              </h2>
              <p className="text-lg text-zinc-400 leading-relaxed">
                Now it has intelligence behind it. Not a chatbot with opinions — a system connected to live data, calibrated on real outcomes, that gets smarter with every raise.
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
              Your raise deserves better than a spreadsheet.
            </h2>
            <p className="text-zinc-500 mb-8">
              We&apos;re working closely with our first founders.
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
