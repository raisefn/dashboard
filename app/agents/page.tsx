"use client";

import { useState } from "react";
import Link from "next/link";
import FadeInSection from "@/components/fade-in-section";

// Marketing v3 — /agents landing.
// Audience: investors and founders who want to plug their personal AI
// assistants (ChatGPT, Claude, custom GPTs) into their raise(fn) data.
// NOT third-party developers building products on top.
//
// Status: Coming Soon. Email collection captures interest until the
// MCP-compatible endpoint ships.

/* ── Visual: chat snippet showing a founder asking ChatGPT about their pipeline ── */
function FounderAssistantCard() {
  return (
    <div className="rounded-2xl border border-zinc-800 overflow-hidden" style={{ background: "linear-gradient(180deg, rgba(24,24,27,0.95), rgba(9,9,11,0.98))" }}>
      <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-800/80">
        <span className="text-[11px] text-zinc-500 font-medium tracking-wide">Your ChatGPT · connected to raise(fn)</span>
        <span className="text-[10px] text-orange-400/70 font-semibold tracking-widest uppercase">Founder</span>
      </div>
      <div className="p-5 space-y-3 text-sm">
        <div className="flex justify-end">
          <div className="rounded-2xl bg-orange-950/40 border border-orange-900/40 px-4 py-2.5 max-w-[85%]">
            <p className="text-zinc-200">Who from my raise(fn) pipeline did I last meet with?</p>
          </div>
        </div>
        <div className="flex justify-start">
          <div className="rounded-2xl bg-zinc-900/60 border border-zinc-800 px-4 py-2.5 max-w-[85%]">
            <p className="text-zinc-300 leading-relaxed">
              Your most recent meeting was with <span className="font-semibold text-white">Bill Trenchard (First Round)</span> on Monday. He requested a second meeting and asked for your customer reference deck. You haven&apos;t followed up yet — want me to draft an email?
            </p>
          </div>
        </div>
        <div className="flex justify-end">
          <div className="rounded-2xl bg-orange-950/40 border border-orange-900/40 px-4 py-2.5 max-w-[85%]">
            <p className="text-zinc-200">Yes, draft it.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Visual: investor asking Claude about deal flow ── */
function InvestorAssistantCard() {
  return (
    <div className="rounded-2xl border border-zinc-800 overflow-hidden" style={{ background: "linear-gradient(180deg, rgba(24,24,27,0.95), rgba(9,9,11,0.98))" }}>
      <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-800/80">
        <span className="text-[11px] text-zinc-500 font-medium tracking-wide">Your Claude · connected to raise(fn)</span>
        <span className="text-[10px] text-teal-500/60 font-semibold tracking-widest uppercase">Investor</span>
      </div>
      <div className="p-5 space-y-3 text-sm">
        <div className="flex justify-end">
          <div className="rounded-2xl bg-teal-950/40 border border-teal-900/40 px-4 py-2.5 max-w-[85%]">
            <p className="text-zinc-200">Show me the 3 founders that hit my thesis this week.</p>
          </div>
        </div>
        <div className="flex justify-start">
          <div className="rounded-2xl bg-zinc-900/60 border border-zinc-800 px-4 py-2.5 max-w-[85%]">
            <p className="text-zinc-300 leading-relaxed mb-2">Three founders matched 90%+ this week:</p>
            <ol className="text-zinc-400 space-y-1.5 ml-2">
              <li><span className="text-white font-semibold">OpenBooks AI</span> — B2B SaaS, $18K MRR, 22% MoM, seed raising $2.5M</li>
              <li><span className="text-white font-semibold">Meerkat Security</span> — secops, post-revenue, raising $3M led</li>
              <li><span className="text-white font-semibold">Decodering</span> — devtools, $40K MRR, raising $1.5M seed</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}

function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [audience, setAudience] = useState<"founder" | "investor" | "">("");
  const [state, setState] = useState<"idle" | "submitting" | "done" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !audience) return;
    setState("submitting");
    setErrorMsg("");
    try {
      const res = await fetch("/api/agents-waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, audience }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Could not save — please try again.");
      }
      setState("done");
    } catch (e) {
      setState("error");
      setErrorMsg(e instanceof Error ? e.message : "Something went wrong.");
    }
  }

  if (state === "done") {
    return (
      <div className="mx-auto max-w-xl text-center rounded-2xl border border-teal-800/40 bg-teal-950/20 px-8 py-10">
        <p className="text-2xl font-bold text-white mb-2">You&apos;re on the list.</p>
        <p className="text-sm text-zinc-400">
          We&apos;ll email <span className="text-teal-400">{email}</span> the moment
          this ships. No spam in the meantime.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="mx-auto max-w-xl">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
        <button
          type="button"
          onClick={() => setAudience("founder")}
          className={`rounded-lg border px-4 py-3 text-sm font-medium transition-all ${
            audience === "founder"
              ? "border-orange-600 bg-orange-950/40 text-orange-100"
              : "border-zinc-800 bg-zinc-900/40 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700"
          }`}
        >
          I&apos;m a founder
        </button>
        <button
          type="button"
          onClick={() => setAudience("investor")}
          className={`rounded-lg border px-4 py-3 text-sm font-medium transition-all ${
            audience === "investor"
              ? "border-teal-600 bg-teal-950/40 text-teal-100"
              : "border-zinc-800 bg-zinc-900/40 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700"
          }`}
        >
          I&apos;m an investor
        </button>
      </div>
      <div className="flex gap-2">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@yourcompany.com"
          className="flex-1 rounded-lg border border-zinc-800 bg-zinc-900/60 px-4 py-3 text-sm text-white placeholder-zinc-600 focus:border-zinc-600 focus:outline-none"
        />
        <button
          type="submit"
          disabled={!email || !audience || state === "submitting"}
          className="rounded-lg bg-orange-600 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-orange-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-orange-900/30"
        >
          {state === "submitting" ? "Saving…" : "Notify me"}
        </button>
      </div>
      {state === "error" && (
        <p className="mt-3 text-xs text-red-400">{errorMsg}</p>
      )}
      <p className="mt-4 text-xs text-zinc-500 text-center">
        No spam. We email once when this ships, then leave you alone.
      </p>
    </form>
  );
}

export default function AgentsPage() {
  return (
    <div className="relative">
      <div className="grid-bg" />

      {/* ── Hero ── */}
      <section className="relative py-24 px-4">
        <div className="mx-auto max-w-3xl text-center animate-fade-in">
          <div className="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/60 px-3 py-1 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
            <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-300">
              Coming soon
            </span>
          </div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-400 mb-4">
            For Agents
          </p>
          <h1 className="text-4xl font-bold text-white sm:text-5xl mb-6 leading-tight">
            Bring your AI to your raise.
          </h1>
          <p className="text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            Connect your personal ChatGPT, Claude, or any AI assistant
            directly to your raise(fn) data. Ask anything. Work anywhere.
            Your assistant becomes a co-pilot for your raise.
          </p>
        </div>
      </section>

      {/* ── Founder use case ── */}
      <section className="relative py-20 px-4">
        <FadeInSection>
          <div className="mx-auto max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-orange-400 mb-3">
                For Founders
              </p>
              <h2 className="text-3xl font-bold text-white mb-5 leading-tight">
                Ask your assistant about your pipeline.
              </h2>
              <p className="text-zinc-400 leading-relaxed mb-4">
                You already work with an AI assistant. Connect it to raise(fn)
                and it gains full context on your pipeline — every investor,
                every meeting, every commitment, every brief you&apos;ve
                generated.
              </p>
              <ul className="text-sm text-zinc-300 space-y-2.5 mt-6">
                {[
                  "\"Who do I owe a reply to?\"",
                  "\"Draft outreach to the 5 investors I haven't followed up with.\"",
                  "\"Which pipeline meetings are this week?\"",
                  "\"Summarize where I am with First Round.\"",
                ].map((q) => (
                  <li key={q} className="flex items-start gap-3 leading-relaxed">
                    <span className="text-orange-400 text-lg leading-snug shrink-0">›</span>
                    <span className="text-zinc-400 italic">{q}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <FounderAssistantCard />
            </div>
          </div>
        </FadeInSection>
      </section>

      {/* ── Investor use case ── */}
      <section className="relative py-20 px-4 bg-zinc-950/40">
        <FadeInSection>
          <div className="mx-auto max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="md:order-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-teal-400 mb-3">
                For Investors
              </p>
              <h2 className="text-3xl font-bold text-white mb-5 leading-tight">
                Query your deal flow from anywhere.
              </h2>
              <p className="text-zinc-400 leading-relaxed mb-4">
                Your assistant gets read-access to the founders matched to
                your thesis, your pipeline, your meeting notes. Ask in
                natural language; the data flows directly from raise(fn).
              </p>
              <ul className="text-sm text-zinc-300 space-y-2.5 mt-6">
                {[
                  "\"Show me the 3 founders that hit my thesis this week.\"",
                  "\"Summarize the founders I've met that haven't moved to second meeting.\"",
                  "\"Which of my passes still match the thesis a quarter later?\"",
                  "\"Draft a follow-up to the OpenBooks founder.\"",
                ].map((q) => (
                  <li key={q} className="flex items-start gap-3 leading-relaxed">
                    <span className="text-teal-400 text-lg leading-snug shrink-0">›</span>
                    <span className="text-zinc-400 italic">{q}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="md:order-1">
              <InvestorAssistantCard />
            </div>
          </div>
        </FadeInSection>
      </section>

      {/* ── How it works ── */}
      <section className="relative py-20 px-4">
        <FadeInSection>
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-3">
              How it works
            </p>
            <h2 className="text-3xl font-bold text-white sm:text-4xl mb-6 leading-tight">
              Secure connection. Your data, your control.
            </h2>
            <p className="text-zinc-400 leading-relaxed max-w-2xl mx-auto mb-4">
              raise(fn) will expose an MCP-compatible endpoint your AI
              assistant connects to once. From then on, your assistant
              can query your own raise(fn) data on demand.
            </p>
            <p className="text-zinc-400 leading-relaxed max-w-2xl mx-auto">
              No LLM training on your data. No data shared with any third
              party. Revoke access from your raise(fn) settings at any time.
            </p>
          </div>
        </FadeInSection>
      </section>

      {/* ── Waitlist ── */}
      <section className="relative py-24 px-4 bg-zinc-950/60">
        <FadeInSection>
          <div className="mx-auto max-w-4xl">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-white sm:text-4xl mb-4">
                Be first when this ships.
              </h2>
              <p className="text-zinc-400 max-w-xl mx-auto">
                We&apos;ll email you the moment your assistant can connect.
                Tell us whether you&apos;re a founder or an investor — we
                build the right things first.
              </p>
            </div>
            <WaitlistForm />
          </div>
        </FadeInSection>
      </section>

      {/* ── While you wait ── */}
      <section className="relative py-20 px-4">
        <FadeInSection>
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm text-zinc-500 mb-4">While you wait</p>
            <p className="text-zinc-300 mb-6">
              raise(fn)&apos;s own brain is already live for founders and
              investors. Start there — your assistant will plug in when it&apos;s
              ready.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link
                href="/founders"
                className="text-sm font-medium text-orange-400 hover:text-orange-300 transition-colors"
              >
                For founders →
              </Link>
              <span className="text-zinc-700">·</span>
              <Link
                href="/investors"
                className="text-sm font-medium text-teal-400 hover:text-teal-300 transition-colors"
              >
                For investors →
              </Link>
            </div>
          </div>
        </FadeInSection>
      </section>
    </div>
  );
}
