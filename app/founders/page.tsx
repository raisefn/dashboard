"use client";

import Link from "next/link";
import FadeInSection from "@/components/fade-in-section";

// Marketing v3 — /founders landing.
// Audience: founders actively raising or about to. Pitch: raise(fn) is
// the AI fundraising agent that does the hard parts (matching, briefs,
// outreach, follow-ups, closing) so the founder can stay on the calls
// and the product. All investor names FICTIONAL per the marketing rule.

/* ── Visual: match output mock card (founder POV) ── */
function FounderMatchCard() {
  const investors = [
    { name: "Compass Partners", tag: "Sector + stage fit", color: "#2dd4bf", note: "Active in your ARR range — partner engaged" },
    { name: "Avery Tanaka · Northstar Angels", tag: "Solo angel", color: "#34d399", note: "SEA + thesis fit; fast mover" },
    { name: "Aperture Capital", tag: "Portfolio gap", color: "#fbbf24", note: "B2B payments thesis, no current portco overlap" },
    { name: "James Park (angel)", tag: "Operator empathy", color: "#fb923c", note: "Ex-CEO sales-tech exit; angel-checks in your range" },
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
    { name: "Compass (Maya Okonkwo)", status: "Met Mon — second meeting requested", color: "#2dd4bf", last: "1d ago" },
    { name: "James Park", status: "Soft committed $50K — needs SAFE", color: "#fb923c", last: "3d ago" },
    { name: "Aperture (David Liu)", status: "Passed — portfolio overlap", color: "#71717a", last: "1w ago" },
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

/* ── Visual: brief preview — clipped/excerpt of the artifact raise(fn)
   generates and sends to a matched investor. Real structure per
   BRIEF_SYSTEM_PROMPT in brain/admin.py: founder-centric, voice rules
   from system prompt (contractions, fragments, no em-dashes). We render
   header → table → why fits → where they are → team, then fade to imply
   more. No buttons, no closing line — automation handles the next step.
   Fictional names. ── */
function BriefPreviewCard() {
  return (
    <div className="rounded-2xl border border-zinc-800 overflow-hidden" style={{ background: "linear-gradient(180deg, rgba(24,24,27,0.95), rgba(9,9,11,0.98))" }}>
      <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-800/80">
        <span className="text-[11px] text-zinc-500 font-medium tracking-wide">Confidential brief</span>
        <span className="text-[10px] text-teal-400/70 font-semibold tracking-widest uppercase">Tailored</span>
      </div>
      <div className="relative">
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

          {/* Why we think this fits */}
          <div className="border-t border-zinc-800/60 pt-4">
            <p className="text-[10px] uppercase tracking-wider text-teal-400/80 mb-1.5">Why we think this fits</p>
            <p className="text-zinc-300 leading-relaxed text-[13px]">
              Three SEA-headquartered B2B SaaS bets in your last 12 months sit in the solo-angel band. Halcyon&apos;s an enterprise email infrastructure play, Singapore HQ, US-first GTM. Sits cleanly inside your geo and stage. Round&apos;s well underway.
            </p>
          </div>

          {/* Where they are */}
          <div className="border-t border-zinc-800/60 pt-4">
            <p className="text-[10px] uppercase tracking-wider text-zinc-500 mb-1.5">Where they are</p>
            <p className="text-zinc-300 leading-relaxed text-[13px]">
              $22K MRR, averaging ~24% MoM over the last three months. 14 paying customers, two of them Fortune 500. No churn this quarter. Pipeline&apos;s healthy with several late-stage trials.
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
                <span>Real growth without anomalous spikes. Repeatable inbound from a couple of channels.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-teal-400/80">·</span>
                <span>Two Fortune 500 contracts signed in the last quarter.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-teal-400/80">·</span>
                <span>Anti-spam algorithm patent filed recently. Two incumbents have already replicated parts.</span>
              </li>
            </ul>
          </div>

          {/* What to watch — faded, implies more below */}
          <div className="border-t border-zinc-800/60 pt-4 pb-2 opacity-60">
            <p className="text-[10px] uppercase tracking-wider text-orange-400/80 mb-2">What to watch</p>
            <p className="text-zinc-300 leading-relaxed text-[13px]">
              Customer base is concentrated in the top accounts. Worth asking how they&apos;re thinking about expansion inside those before pushing for net-new logos.
            </p>
          </div>
        </div>

        {/* Fade-out — implies the brief continues with Founder quote /
           What they're asking for below */}
        <div
          className="pointer-events-none absolute bottom-0 left-0 right-0 h-20"
          style={{
            background:
              "linear-gradient(180deg, rgba(9,9,11,0) 0%, rgba(9,9,11,0.95) 80%, rgba(9,9,11,1) 100%)",
          }}
        />
      </div>
    </div>
  );
}

/* ── Capability grid — everything else the agent handles ── */
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
            The agent that runs your raise alongside you.
          </h1>
          <p className="text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            raise(fn) matches you to the right investors, drafts the briefs,
            drafts the outreach, preps every meeting, captures every debrief,
            and tracks your pipeline. You stay on the calls and the product.
            The agent does the rest.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Link
              href="/signup"
              className="rounded-full bg-orange-600 px-8 py-3 text-sm font-semibold text-white transition-all hover:bg-orange-500 shadow-lg shadow-orange-900/30"
            >
              Drop your deck →
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
                agent reads your sector, stage, check size, geography, and
                cap table, then ranks investors whose thesis, deployment
                cadence, and history actually fit.
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
                Tracks every conversation. Forgets nothing.
              </h2>
              <p className="text-zinc-400 leading-relaxed mb-4">
                Every conversation, meeting note, commitment, and decision
                — captured automatically as you work. No CRM to fill in. No
                investor questions to re-read at midnight before the second
                meeting.
              </p>
              <p className="text-zinc-400 leading-relaxed">
                When you come back tomorrow, the agent knows where you
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
                Works for investors the agent matched you with — and for
                anyone you already know. Drop in a name, get a brief.
              </p>
            </div>
            <div>
              <BriefPreviewCard />
            </div>
          </div>
        </FadeInSection>
      </section>

      {/* ── Capability grid — everything else the agent does ── */}
      <section className="relative py-24 px-4 bg-zinc-950/40">
        <FadeInSection>
          <div className="mx-auto max-w-6xl">
            <div className="text-center mb-12">
              <p className="text-xs font-semibold uppercase tracking-wider text-teal-400 mb-3">
                Everything else
              </p>
              <h2 className="text-3xl font-bold text-white sm:text-4xl mb-4 leading-tight">
                The whole raise. In one agent.
              </h2>
              <p className="text-zinc-400 max-w-2xl mx-auto">
                Matching, briefs, and memory are the headline acts.
                Every other part of running a raise lives in the same agent.
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
                  "Pipeline captured automatically as you talk to the agent",
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
                  q: "How is raise(fn) different from other fundraising SaaS tools?",
                  a: "Most fundraising SaaS is a database (PitchBook, Crunchbase), a CRM (Affinity, DealCloud), or generic outreach automation (Apollo, Lemlist) — built for general sales, not for raising a round. They give you tools; you still do the work. raise(fn) is the agent. It does the matching, drafts the briefs, drafts the outreach, preps your meetings, debriefs them, and tracks your pipeline automatically. One product for the whole raise. And it's calibrated on real fundraising outcomes, not generic CRM patterns — every raise that runs through it makes the next one sharper.",
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
              Drop your deck. The agent takes it from there.
            </h2>
            <p className="text-zinc-400 mb-2 max-w-xl mx-auto">
              Free to start. No credit card. The agent gets to work the second you upload.
            </p>
            <p className="text-zinc-500 text-sm mb-8 max-w-xl mx-auto">
              Your deck stays private. Never shared. Never used to train.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link
                href="/signup"
                className="rounded-full bg-orange-600 px-8 py-3 text-sm font-semibold text-white transition-all hover:bg-orange-500 shadow-lg shadow-orange-900/30"
              >
                Drop your deck →
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
