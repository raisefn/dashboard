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
    { name: "Avery Tanaka · Pacific Bridge", tag: "Solo angel", color: "#34d399", note: "SEA + thesis fit; fast mover" },
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
    { name: "Avery Tanaka", status: "Replied — wants intro deck", color: "#34d399", last: "2h ago" },
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

/* ── Visual: full brief preview — the actual artifact raise(fn) generates
   and sends to an investor about a matched founder. Structure matches
   the real BRIEF_SYSTEM_PROMPT in brain/admin.py: founder-centric,
   addressed to the investor by first name, voice rules per system prompt
   (contractions, fragments, no em-dashes, no hype words). All names
   fictional. ── */
function BriefPreviewCard() {
  return (
    <div className="rounded-2xl border border-zinc-800 overflow-hidden" style={{ background: "linear-gradient(180deg, rgba(24,24,27,0.95), rgba(9,9,11,0.98))" }}>
      <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-800/80">
        <span className="text-[11px] text-zinc-500 font-medium tracking-wide">Prepared for Avery Tanaka · Confidential</span>
        <span className="text-[10px] text-teal-400/70 font-semibold tracking-widest uppercase">Brief</span>
      </div>
      <div className="p-5 space-y-4 text-sm">
        {/* Title block — company + one-line positioning */}
        <div>
          <h3 className="text-base font-bold text-white">Halcyon Mail</h3>
          <p className="text-zinc-400 text-xs mt-1 leading-snug">
            B2B email reputation engine for high-volume senders.
          </p>
        </div>

        {/* Stat table — stage / sector / HQ / round info */}
        <div className="grid grid-cols-3 gap-x-4 gap-y-3 rounded-lg border border-zinc-800/60 bg-zinc-900/30 p-3 text-[11px]">
          <div>
            <span className="text-zinc-500 block uppercase tracking-wider text-[9px] mb-0.5">Stage</span>
            <span className="text-zinc-200 font-medium">Seed</span>
          </div>
          <div>
            <span className="text-zinc-500 block uppercase tracking-wider text-[9px] mb-0.5">Sector</span>
            <span className="text-zinc-200 font-medium">B2B SaaS</span>
          </div>
          <div>
            <span className="text-zinc-500 block uppercase tracking-wider text-[9px] mb-0.5">HQ</span>
            <span className="text-zinc-200 font-medium">Singapore</span>
          </div>
          <div>
            <span className="text-zinc-500 block uppercase tracking-wider text-[9px] mb-0.5">Round</span>
            <span className="text-zinc-200 font-medium">$1.8M / $14M cap</span>
          </div>
          <div>
            <span className="text-zinc-500 block uppercase tracking-wider text-[9px] mb-0.5">Committed</span>
            <span className="text-zinc-200 font-medium">$1.2M (67%)</span>
          </div>
          <div>
            <span className="text-zinc-500 block uppercase tracking-wider text-[9px] mb-0.5">Close</span>
            <span className="text-zinc-200 font-medium">4 weeks</span>
          </div>
        </div>

        {/* Why we think this fits Avery */}
        <div className="border-t border-zinc-800/60 pt-4">
          <p className="text-[10px] uppercase tracking-wider text-teal-400/80 mb-1.5">Why we think this fits Avery</p>
          <p className="text-zinc-300 leading-relaxed text-[13px]">
            Avery, you&apos;ve backed three SEA-headquartered B2B SaaS founders in the last 12 months at the $25-75K solo-angel band. Halcyon&apos;s at $22K MRR, 28% MoM for three months straight, Singapore-based but selling US-first. Fits your geo and stage band cleanly. Round&apos;s 67% committed already, closing in 4 weeks.
          </p>
        </div>

        {/* Where they are */}
        <div className="border-t border-zinc-800/60 pt-4">
          <p className="text-[10px] uppercase tracking-wider text-zinc-500 mb-1.5">Where they are</p>
          <p className="text-zinc-300 leading-relaxed text-[13px]">
            $22K MRR. 28% MoM growth, three months running. 14 paying customers, two of them Fortune 500 (Maersk, a top-10 US bank). The other 12 split US enterprise (8) and APAC (4). No churn in the last 90 days. Pipeline shows 31 active conversations, 11 in late-stage trials.
          </p>
        </div>

        {/* The team */}
        <div className="border-t border-zinc-800/60 pt-4">
          <p className="text-[10px] uppercase tracking-wider text-zinc-500 mb-2">The team</p>
          <ul className="space-y-1.5 text-zinc-300 text-[13px]">
            <li className="flex gap-2">
              <span className="text-zinc-600">›</span>
              <span><span className="text-white font-semibold">Lena Park</span> (CEO). 4 years at SendGrid running the deliverability platform team. Then Twilio infra.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-zinc-600">›</span>
              <span><span className="text-white font-semibold">Marcus Rhee</span> (CTO). 3 years at Mailgun building their reputation-scoring engine. Then Stripe.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-zinc-600">›</span>
              <span>Both have personally shipped the infrastructure they&apos;re now selling.</span>
            </li>
          </ul>
        </div>

        {/* What's working */}
        <div className="border-t border-zinc-800/60 pt-4">
          <p className="text-[10px] uppercase tracking-wider text-zinc-500 mb-2">What&apos;s working</p>
          <ul className="space-y-1.5 text-zinc-300 text-[13px]">
            <li className="flex gap-2">
              <span className="text-teal-400/80">·</span>
              <span>28% MoM growth for three months straight. No anomalous spikes.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-teal-400/80">·</span>
              <span>Two Fortune 500 contracts signed in the last 90 days.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-teal-400/80">·</span>
              <span>Anti-spam algorithm patent filed last month. Two incumbents have already replicated parts of it.</span>
            </li>
          </ul>
        </div>

        {/* What to watch */}
        <div className="border-t border-zinc-800/60 pt-4">
          <p className="text-[10px] uppercase tracking-wider text-orange-400/80 mb-2">What to watch</p>
          <ul className="space-y-1.5 text-zinc-300 text-[13px]">
            <li className="flex gap-2">
              <span className="text-orange-400/60">·</span>
              <span>14 customers is concentrated. Top 3 are 41% of MRR. Worth asking about expansion inside those accounts.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-orange-400/60">·</span>
              <span>Singapore HQ, mostly remote team. Worth asking how they&apos;re handling org growth at this distribution.</span>
            </li>
          </ul>
        </div>

        {/* Founder quote */}
        <div className="border-t border-zinc-800/60 pt-4">
          <p className="text-[10px] uppercase tracking-wider text-zinc-500 mb-2">Lena, in her own words</p>
          <blockquote className="border-l-2 border-teal-400/50 pl-3 italic text-zinc-300 text-[13px] leading-relaxed">
            &ldquo;Email deliverability hasn&apos;t been re-architected in fifteen years. We&apos;ve been quietly fixing it for two.&rdquo;
          </blockquote>
        </div>

        {/* What they're asking for */}
        <div className="border-t border-zinc-800/60 pt-4">
          <p className="text-[10px] uppercase tracking-wider text-zinc-500 mb-1.5">What they&apos;re asking for</p>
          <p className="text-zinc-300 leading-relaxed text-[13px]">
            $25-100K check on the SAFE. Decision by week 3 if possible. Internal lead identified, room for two more named angels.
          </p>
        </div>

        {/* Closing */}
        <div className="border-t border-zinc-800/60 pt-4">
          <p className="text-zinc-400 text-[13px] italic">
            Let us know if you&apos;d like an intro.
          </p>
        </div>

        {/* Action buttons */}
        <div className="pt-2 flex gap-2 border-t border-zinc-800/60">
          <button className="text-xs font-semibold px-3 py-1.5 rounded-md border border-teal-700/40 bg-teal-950/40 text-teal-300 mt-3">
            Send intro
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

      {/* ── FAQ (cherry-picked from /faq — no FAQPage JSON-LD here; the
           canonical schema lives on /faq) ── */}
      <section className="relative py-20 px-4 bg-zinc-950/40">
        <FadeInSection>
          <div className="mx-auto max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-wider text-teal-400/80 mb-2">
              Common questions
            </p>
            <h2 className="text-3xl font-bold text-white sm:text-4xl mb-8">
              For founders.
            </h2>
            <div className="space-y-8">
              {[
                {
                  q: "What does my raise look like with raise(fn)?",
                  a: "You talk to it. No forms. No dashboard. You tell it what you're building, where you are, what you're trying to do — it captures the company, the team, the metrics, the wedge, the round shape. Then it runs your raise: builds the investor list ranked by who actually deploys into your space, critiques your deck slide-by-slide, writes briefs for every match, preps you for every meeting, tracks the pipeline, debriefs after each conversation, brokers warm intros where there's a relationship in the network, and walks you through the term sheet when one lands. One conversation. Replaces the database, the CRM, the spreadsheet, the slide-critique service, and the strategy session — all of it.",
                },
                {
                  q: "Can raise(fn) help if I'm not raising yet?",
                  a: "Yes. It runs a readiness check — six signals across story, ask, motion, wedge, target list, post-close plan. Tells you which ones are weak. Helps you sharpen them. Premature outreach burns the best investors first. Getting to 'ready' before opening conversations is half the game.",
                },
                {
                  q: "How is raise(fn) different from a fundraising coach?",
                  a: "Coaches charge retainer or hourly to give advice — the advice is generic, the work is still yours. raise(fn) doesn't give advice. It does the work — builds the list, writes the briefs, preps the meetings, tracks the pipeline, brokers the intros, walks you through the term sheet. Fixed-fee, fixed-scope, no success fee, no equity.",
                },
                {
                  q: "If I'm on the free plan, why would I pay?",
                  a: "Free gives you the matching engine with a use cap. Paid removes the cap and unlocks the full system across your raise — deeper meeting prep, debrief support, pipeline tracking, deck critique, pitch refinement, term sheet walkthrough, warm intros. If your round is small and the cap covers it, free is enough. If you're running an active raise with 20+ parallel investor conversations, paid is built for that.",
                },
              ].map((qa) => (
                <div key={qa.q}>
                  <h3 className="text-lg font-semibold text-white leading-snug mb-2">
                    {qa.q}
                  </h3>
                  <p className="text-zinc-300 leading-relaxed text-sm sm:text-base">
                    {qa.a}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-8">
              <Link
                href="/faq"
                className="text-sm font-medium text-teal-400 hover:text-teal-300 transition-colors"
              >
                Read the full FAQ →
              </Link>
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
