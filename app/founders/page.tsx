"use client";

import Link from "next/link";
import FadeInSection from "@/components/fade-in-section";

// Marketing v3 — /founders landing.
// Audience: founders actively raising or about to. Pitch: raise(fn) is
// the brain that does the hard parts (targeting, briefs, memory) so you
// can spend time on the parts that actually move a raise (calls, deck,
// product).

/* ── Visual: match output mock card (founder POV) ── */
function FounderMatchCard() {
  const investors = [
    { name: "First Round Capital", tag: "Sector + stage fit", color: "#2dd4bf", note: "Active in your ARR range — partner engaged" },
    { name: "Vinnie Lauria · Golden Gate", tag: "Solo angel", color: "#34d399", note: "SEA + thesis fit; fast mover" },
    { name: "Bessemer Venture Partners", tag: "Portfolio gap", color: "#fbbf24", note: "B2B payments thesis, no current portco overlap" },
    { name: "Manny Medina (angel)", tag: "Operator empathy", color: "#fb923c", note: "Built Outreach; angel-checks in your range" },
  ];

  return (
    <div className="rounded-2xl border border-zinc-800 overflow-hidden" style={{ background: "linear-gradient(180deg, rgba(24,24,27,0.95), rgba(9,9,11,0.98))" }}>
      <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-800/80">
        <span className="text-[11px] text-zinc-500 font-medium tracking-wide">Top matches — Series A B2B SaaS, $4M target</span>
        <span className="text-[10px] text-teal-500/60 font-semibold tracking-widest uppercase">Live</span>
      </div>
      <div className="p-4 space-y-2.5">
        {investors.map((inv, i) => (
          <div key={i} className="flex items-start gap-3 rounded-lg border border-zinc-800/50 bg-zinc-900/30 px-4 py-3">
            <div className="shrink-0 w-2 h-2 mt-2 rounded-full" style={{ backgroundColor: inv.color }} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm font-semibold text-white">{inv.name}</p>
                <span className="text-[10px] px-1.5 py-0.5 rounded font-semibold border" style={{ color: inv.color, backgroundColor: `${inv.color}10`, borderColor: `${inv.color}30` }}>
                  {inv.tag}
                </span>
              </div>
              <p className="text-xs text-zinc-500 mt-0.5">{inv.note}</p>
            </div>
            <button className="shrink-0 text-[10px] font-semibold px-2.5 py-1 rounded-md border border-teal-700/40 bg-teal-950/40 text-teal-300">
              Generate brief
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Visual: pipeline memory snippet ── */
function PipelineMemoryCard() {
  const items = [
    { name: "Vinnie Lauria", status: "Replied — wants intro deck", color: "#34d399", last: "2h ago" },
    { name: "First Round (Bill Trenchard)", status: "Met Mon — second meeting requested", color: "#2dd4bf", last: "1d ago" },
    { name: "Manny Medina", status: "Soft committed $50K — needs SAFE", color: "#fb923c", last: "3d ago" },
    { name: "Bessemer (Byron Deeter)", status: "Passed — portfolio overlap", color: "#71717a", last: "1w ago" },
  ];
  return (
    <div className="rounded-2xl border border-zinc-800 overflow-hidden" style={{ background: "linear-gradient(180deg, rgba(24,24,27,0.95), rgba(9,9,11,0.98))" }}>
      <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-800/80">
        <span className="text-[11px] text-zinc-500 font-medium tracking-wide">Pipeline — Auto-tracked from chat</span>
        <span className="text-[10px] text-teal-500/60 font-semibold tracking-widest uppercase">4 open</span>
      </div>
      <div className="p-4 space-y-2.5">
        {items.map((it, i) => (
          <div key={i} className="flex items-center gap-3 rounded-lg border border-zinc-800/50 bg-zinc-900/30 px-4 py-2.5">
            <div className="shrink-0 w-1.5 h-1.5 rounded-full" style={{ backgroundColor: it.color }} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white">{it.name}</p>
              <p className="text-xs text-zinc-500 mt-0.5">{it.status}</p>
            </div>
            <span className="shrink-0 text-[10px] text-zinc-600">{it.last}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Visual: full brief preview — the actual artifact you'd send ── */
function BriefPreviewCard() {
  return (
    <div className="rounded-2xl border border-zinc-800 overflow-hidden" style={{ background: "linear-gradient(180deg, rgba(24,24,27,0.95), rgba(9,9,11,0.98))" }}>
      <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-800/80">
        <span className="text-[11px] text-zinc-500 font-medium tracking-wide">Brief — Vinnie Lauria, Golden Gate Ventures</span>
        <span className="text-[10px] text-orange-400/70 font-semibold tracking-widest uppercase">Tailored</span>
      </div>
      <div className="p-5 space-y-4 text-sm">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-zinc-500 mb-1.5">What they fund</p>
          <p className="text-zinc-300 leading-relaxed">
            Solo angel checks of <span className="text-white font-semibold">$25-100K</span> across SEA
            B2B SaaS. Sweet spot is post-revenue seed, $500K-$2M rounds.
            Doesn&apos;t lead. Strong preference for technical founders.
          </p>
        </div>
        <div className="border-t border-zinc-800/60 pt-4">
          <p className="text-[10px] uppercase tracking-wider text-teal-400/80 mb-1.5">Why this fits</p>
          <p className="text-zinc-300 leading-relaxed">
            Two of his last four publicly-announced checks were
            US-headquartered founders raising their A — pattern fits your
            geography + stage. Your MRR ($18K) and growth rate (22% MoM)
            land in his preferred traction band.
          </p>
        </div>
        <div className="border-t border-zinc-800/60 pt-4">
          <p className="text-[10px] uppercase tracking-wider text-orange-400/80 mb-1.5">What to watch</p>
          <p className="text-zinc-300 leading-relaxed">
            He typically passes if there&apos;s no clear path to APAC
            expansion within 18 months. Worth surfacing your SEA
            partnership pipeline up front. Also passes on founders who
            can&apos;t articulate post-seed milestones in the first 10 minutes.
          </p>
        </div>
        <div className="border-t border-zinc-800/60 pt-4">
          <p className="text-[10px] uppercase tracking-wider text-zinc-500 mb-2">Recent moves</p>
          <ul className="space-y-1.5 text-zinc-400 text-[13px]">
            <li className="flex gap-2">
              <span className="text-zinc-600">›</span>
              <span><span className="text-zinc-300">Nimble Edge</span> — $75K, Mar 2026 (B2B AI ops, US/SG)</span>
            </li>
            <li className="flex gap-2">
              <span className="text-zinc-600">›</span>
              <span><span className="text-zinc-300">Kestrel Health</span> — $50K, Feb 2026 (B2B SaaS, US/PH)</span>
            </li>
            <li className="flex gap-2">
              <span className="text-zinc-600">›</span>
              <span><span className="text-zinc-300">Tapestry Books</span> — $40K, Jan 2026 (B2B SaaS, US)</span>
            </li>
          </ul>
        </div>
        <div className="border-t border-zinc-800/60 pt-4">
          <p className="text-[10px] uppercase tracking-wider text-zinc-500 mb-2">Talking points</p>
          <ul className="space-y-1.5 text-zinc-400 text-[13px]">
            <li className="flex gap-2">
              <span className="text-teal-400/80">·</span>
              <span>Lead with the 22% MoM growth — that&apos;s in his sweet spot.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-teal-400/80">·</span>
              <span>Mention your existing Manila design-partner pipeline.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-teal-400/80">·</span>
              <span>Don&apos;t pitch lead-investor status — he co-invests.</span>
            </li>
          </ul>
        </div>
        <div className="pt-2 flex gap-2 border-t border-zinc-800/60">
          <button className="text-xs font-semibold px-3 py-1.5 rounded-md border border-teal-700/40 bg-teal-950/40 text-teal-300 mt-3">
            Draft outreach
          </button>
          <button className="text-xs font-semibold px-3 py-1.5 rounded-md border border-zinc-700/60 bg-zinc-900/40 text-zinc-300 mt-3">
            Share link
          </button>
          <button className="text-xs font-semibold px-3 py-1.5 rounded-md border border-zinc-700/60 bg-zinc-900/40 text-zinc-300 mt-3">
            Edit
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Capability grid — everything else the brain handles ── */
const CAPABILITIES = [
  { icon: "📑", name: "Deck extraction", desc: "Drop a PDF — sector, stage, MRR, team, raise size auto-populated." },
  { icon: "🔎", name: "Investor research", desc: "GP-level detail — recent checks, sweet spots, what they pass on." },
  { icon: "✉️", name: "Outreach drafting", desc: "Cold and warm intros, tailored per investor and round context." },
  { icon: "🎤", name: "Meeting prep", desc: "Six-section briefing per meeting: angles, risks, hard questions, asks." },
  { icon: "🗒️", name: "Meeting debrief", desc: "Capture next steps, commitments, status changes — no notes lost." },
  { icon: "📜", name: "Term sheet analysis", desc: "Plain-English read of every clause, flagged for the founder-hostile ones." },
  { icon: "🧭", name: "Narrative review", desc: "Where the pitch lands and where it leaks — before you go out wide." },
  { icon: "📈", name: "Signal reading", desc: "Is the investor moving fast or slow-rolling? Pattern read across replies." },
];

function CapabilityGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {CAPABILITIES.map((c) => (
        <div
          key={c.name}
          className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-5 hover:border-zinc-700 transition-colors"
        >
          <div className="text-xl mb-3">{c.icon}</div>
          <p className="text-sm font-semibold text-white mb-1.5">{c.name}</p>
          <p className="text-xs text-zinc-500 leading-relaxed">{c.desc}</p>
        </div>
      ))}
    </div>
  );
}

export default function FoundersPage() {
  return (
    <div className="relative">
      <div className="grid-bg" />

      {/* ── Hero ── */}
      <section className="relative py-24 px-4">
        <div className="mx-auto max-w-3xl text-center animate-fade-in">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-400 mb-4">
            For Founders
          </p>
          <h1 className="text-4xl font-bold text-white sm:text-5xl mb-6 leading-tight">
            Run your raise like the operators do.
          </h1>
          <p className="text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            raise(fn) is the brain that remembers every investor, drafts
            every email, scores every fit, and tells you what to do next.
            You stay on the calls and the product. We handle the rest.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Link
              href="/signup"
              className="rounded-full bg-orange-600 px-8 py-3 text-sm font-semibold text-white transition-all hover:bg-orange-500 shadow-lg shadow-orange-900/30"
            >
              Set Up Your Raise
            </Link>
            <Link
              href="/pricing"
              className="text-sm font-medium text-zinc-300 hover:text-white transition-colors"
            >
              See pricing →
            </Link>
          </div>
        </div>
      </section>

      {/* ── Pillar 1: Targeting that fits ── */}
      <section className="relative py-20 px-4">
        <FadeInSection>
          <div className="mx-auto max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-teal-400 mb-3">
                01 — Targeting
              </p>
              <h2 className="text-3xl font-bold text-white mb-5 leading-tight">
                Investors who actually write your check.
              </h2>
              <p className="text-zinc-400 leading-relaxed mb-4">
                Not an alphabetical list of every VC on the internet. The
                brain knows your sector, stage, check size, geography, and
                cap table — and surfaces investors whose thesis,
                deployment cadence, and history actually fit.
              </p>
              <p className="text-zinc-400 leading-relaxed">
                Including the angels and family offices nobody else
                surfaces, the firms that haven&apos;t posted in a year but
                are quietly writing checks, and the warm-intro candidates
                in our proprietary network.
              </p>
              <p className="text-sm text-zinc-500 mt-5">
                See{" "}
                <Link href="/how-we-match" className="text-teal-400 hover:text-teal-300 underline underline-offset-2">
                  how we match
                </Link>
                {" "}across five dimensions, or{" "}
                <Link href="/how-we-learn" className="text-teal-400 hover:text-teal-300 underline underline-offset-2">
                  how we learn
                </Link>
                {" "}from every raise.
              </p>
            </div>
            <div>
              <FounderMatchCard />
            </div>
          </div>
        </FadeInSection>
      </section>

      {/* ── Pillar 2: Pipeline + memory ── */}
      <section className="relative py-20 px-4 bg-zinc-950/40">
        <FadeInSection>
          <div className="mx-auto max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="md:order-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-teal-400 mb-3">
                02 — Memory
              </p>
              <h2 className="text-3xl font-bold text-white mb-5 leading-tight">
                A brain that doesn&apos;t forget.
              </h2>
              <p className="text-zinc-400 leading-relaxed mb-4">
                Every conversation, meeting note, commitment, and decision
                — captured automatically as you work. No CRM to fill in. No
                investor questions to re-read at midnight before the second
                meeting.
              </p>
              <p className="text-zinc-400 leading-relaxed">
                When you come back tomorrow, the brain knows where you
                left off. When you come back next month, it still knows.
              </p>
            </div>
            <div className="md:order-1">
              <PipelineMemoryCard />
            </div>
          </div>
        </FadeInSection>
      </section>

      {/* ── Pillar 3: Briefs ── */}
      <section className="relative py-20 px-4">
        <FadeInSection>
          <div className="mx-auto max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-teal-400 mb-3">
                03 — Briefs
              </p>
              <h2 className="text-3xl font-bold text-white mb-5 leading-tight">
                Investor briefs in seconds, not Saturdays.
              </h2>
              <p className="text-zinc-400 leading-relaxed mb-4">
                One-page tailored summaries for any investor — what they
                fund, what they pass on, why this could fit, and what to
                surface up front. Use them to prep meetings, draft cold
                outreach, or send to your advisors.
              </p>
              <p className="text-zinc-400 leading-relaxed">
                Works for investors the brain matched you with — and for
                anyone you already know. Drop in a name, get a brief.
              </p>
            </div>
            <div>
              <BriefPreviewCard />
            </div>
          </div>
        </FadeInSection>
      </section>

      {/* ── Capability grid — everything else the brain does ── */}
      <section className="relative py-24 px-4 bg-zinc-950/40">
        <FadeInSection>
          <div className="mx-auto max-w-6xl">
            <div className="text-center mb-12">
              <p className="text-xs font-semibold uppercase tracking-wider text-teal-400 mb-3">
                Everything else
              </p>
              <h2 className="text-3xl font-bold text-white sm:text-4xl mb-4 leading-tight">
                The full brain, not a feature wedge.
              </h2>
              <p className="text-zinc-400 max-w-2xl mx-auto">
                Targeting, briefs, and memory are the headline acts.
                Every other part of running a raise is in the same brain.
              </p>
            </div>
            <CapabilityGrid />
          </div>
        </FadeInSection>
      </section>

      {/* ── Differentiation row ── */}
      <section className="relative py-24 px-4">
        <FadeInSection>
          <div className="mx-auto max-w-4xl text-center mb-14">
            <h2 className="text-3xl font-bold text-white sm:text-4xl mb-4">
              The difference
            </h2>
            <p className="text-zinc-400 max-w-2xl mx-auto">
              Other tools point at investors. raise(fn) does the work.
            </p>
          </div>
          <div className="mx-auto max-w-5xl grid grid-cols-1 sm:grid-cols-2 gap-10">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-5">
                Most VC databases
              </p>
              <div className="space-y-3.5">
                {[
                  "List of 50,000 VCs with no signal on who's active",
                  "Generic templates you rewrite anyway",
                  "Notes scattered across docs, your inbox, and your head",
                  "Re-explain your raise to every advisor",
                  "No memory of what worked last time",
                ].map((text) => (
                  <p key={text} className="text-sm text-zinc-500 flex items-start gap-3 leading-relaxed">
                    <span className="text-zinc-600 text-lg leading-snug shrink-0">•</span>
                    <span>{text}</span>
                  </p>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-teal-400 mb-5">
                raise(fn)
              </p>
              <div className="space-y-3.5">
                {[
                  "Investors ranked by actual fit — sector, stage, check, geo",
                  "Briefs and outreach tailored to your specific raise",
                  "Pipeline captured automatically as you talk to the brain",
                  "Memory across sessions — pick up exactly where you left off",
                  "Gets sharper as more founders raise on raise(fn)",
                ].map((text) => (
                  <p key={text} className="text-sm text-zinc-300 flex items-start gap-3 leading-relaxed">
                    <span className="text-teal-400 text-lg leading-snug shrink-0">•</span>
                    <span>{text}</span>
                  </p>
                ))}
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
              Ready to raise smarter?
            </h2>
            <p className="text-zinc-400 mb-8 max-w-xl mx-auto">
              Sign up free. Drop your deck or just describe your raise.
              The brain takes it from there.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link
                href="/signup"
                className="rounded-full bg-orange-600 px-8 py-3 text-sm font-semibold text-white transition-all hover:bg-orange-500 shadow-lg shadow-orange-900/30"
              >
                Set Up Your Raise
              </Link>
              <Link
                href="/pricing"
                className="text-sm font-medium text-zinc-300 hover:text-white transition-colors"
              >
                See pricing →
              </Link>
            </div>
          </div>
        </FadeInSection>
      </section>
    </div>
  );
}
