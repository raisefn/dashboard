import FadeInSection from "@/components/fade-in-section";

type Status = "live" | "building" | "planned";

const statusPill: Record<Status, { label: string; className: string }> = {
  live: {
    label: "Live",
    className: "border-teal-700/50 bg-teal-950/40 text-teal-300",
  },
  building: {
    label: "In progress",
    className: "border-orange-700/50 bg-orange-950/40 text-orange-300",
  },
  planned: {
    label: "Planned",
    className: "border-zinc-700/50 bg-zinc-900/60 text-zinc-500",
  },
};

// Roadmap v4 (2026-07-06): restructured around the six moves from the
// homepage. Each move shows founder + investor status side-by-side so
// audience parity is visible. Beyond-the-six items live at the bottom.
//
// Guiding rule: if you can't use it in a chat session today, it's not
// marked live.

interface MoveStatus {
  founder: { status: Status; note: string };
  investor: { status: Status; note: string };
}

interface Move {
  num: string;
  verb: string;
  desc: string;
  color: string;
  status: MoveStatus;
}

const moves: Move[] = [
  {
    num: "01",
    verb: "Understand",
    desc: "Captures the raise from conversation. Company or fund, metrics or thesis, team, story, ask.",
    color: "#2dd4bf",
    status: {
      founder: {
        status: "live",
        note: "Agent chat captures your raise as you talk — no forms.",
      },
      investor: {
        status: "building",
        note: "Fund thesis, portfolio construction, ticket band captured in chat.",
      },
    },
  },
  {
    num: "02",
    verb: "Sharpen",
    desc: "Flags weak points before you go out — where the pitch leaks, where materials break.",
    color: "#34d399",
    status: {
      founder: {
        status: "live",
        note: "Slide-by-slide deck critique. Narrative gaps. Weak asks.",
      },
      investor: {
        status: "building",
        note: "Fund deck critique. Track-record framing. LP-question readiness.",
      },
    },
  },
  {
    num: "03",
    verb: "Identify",
    desc: "Ranks the right targets by real check behavior, not website copy.",
    color: "#fbbf24",
    status: {
      founder: {
        status: "live",
        note: "Investor sourcing — sector, stage, geo, cadence, historical fit.",
      },
      investor: {
        status: "building",
        note: "LP targeting — family offices, endowments, HNWs, FoFs by ticket + geo + cadence.",
      },
    },
  },
  {
    num: "04",
    verb: "Outreach",
    desc: "Drafts personalized outreach per target. Approve and send from your Gmail.",
    color: "#fb923c",
    status: {
      founder: {
        status: "live",
        note: "Cold emails + follow-ups per investor. Sent from your inbox.",
      },
      investor: {
        status: "building",
        note: "Per-LP archetype outreach — family office vs endowment vs FoF each get a different angle.",
      },
    },
  },
  {
    num: "05",
    verb: "Run",
    desc: "Preps every meeting, captures every debrief, keeps every follow-up on time.",
    color: "#f87171",
    status: {
      founder: {
        status: "live",
        note: "Meeting prep, debrief capture, pipeline memory, persistent context.",
      },
      investor: {
        status: "building",
        note: "LP meeting prep, DDQ handling, LP pipeline through close.",
      },
    },
  },
  {
    num: "06",
    verb: "Close",
    desc: "Walkthrough of every clause. Structural flags. Close-day coordination.",
    color: "#a78bfa",
    status: {
      founder: {
        status: "live",
        note: "Term sheet walkthrough — plain English every clause, founder-hostile flags.",
      },
      investor: {
        status: "building",
        note: "Side letter walkthrough, closing timeline, wire coordination.",
      },
    },
  },
];

interface OtherItem {
  label: string;
  oneliner: string;
  status: Status;
  audience: "everyone" | "founders" | "investors";
}

const beyondTheSix: OtherItem[] = [
  // Live open resources
  {
    label: "Public tracker",
    oneliner: "Funding rounds, investors, projects — sourced from SEC filings and public records.",
    status: "live",
    audience: "everyone",
  },
  {
    label: "Raise Intel",
    oneliner: "Published fundraising research — updated on a daily cadence.",
    status: "live",
    audience: "everyone",
  },
  // Building
  {
    label: "Bring your agent (MCP)",
    oneliner: "Connect ChatGPT, Claude, or your own assistant to your raise(fn) data.",
    status: "building",
    audience: "everyone",
  },
  // Planned
  {
    label: "Reply detection",
    oneliner: "Agent reads investor replies, updates your pipeline automatically.",
    status: "planned",
    audience: "founders",
  },
  {
    label: "Cross-raise memory",
    oneliner: "Your seed round teaches your Series A — emails, decks, positioning carry forward.",
    status: "planned",
    audience: "founders",
  },
  {
    label: "Calendar integration",
    oneliner: "Google Calendar — meetings auto-captured, prep + debrief without manual logging.",
    status: "planned",
    audience: "everyone",
  },
  {
    label: "Meeting transcript ingestion",
    oneliner: "Otter, Fireflies, Fathom — transcripts flow in automatically.",
    status: "planned",
    audience: "everyone",
  },
];

const audienceLabel: Record<OtherItem["audience"], string> = {
  founders: "Founders",
  investors: "Investors",
  everyone: "Everyone",
};

const audienceLabelColor: Record<OtherItem["audience"], string> = {
  founders: "text-teal-400",
  investors: "text-orange-400",
  everyone: "text-amber-400",
};

export default function RoadmapPage() {
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
            Six moves. Two audiences. Here&apos;s where each one stands for
            founders and investors. If you can&apos;t use it in a chat session
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

      {/* ── The Six Moves — founder + investor side by side ── */}
      <section className="relative py-8 px-4">
        <FadeInSection>
          <div className="mx-auto max-w-5xl">
            {moves.map((move, i) => (
              <div
                key={move.num}
                className={`py-12 sm:py-14 ${
                  i > 0 ? "border-t border-zinc-800/60" : ""
                }`}
              >
                {/* Move header — number + verb + desc */}
                <div className="grid grid-cols-12 gap-6 sm:gap-10 items-start mb-8">
                  <div className="col-span-4 sm:col-span-3">
                    <span
                      className="block text-5xl sm:text-7xl lg:text-8xl font-black leading-none tracking-tight"
                      style={{ color: move.color, opacity: 0.9 }}
                    >
                      {move.num}
                    </span>
                  </div>
                  <div className="col-span-8 sm:col-span-9">
                    <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2 sm:mb-3 tracking-tight">
                      {move.verb}
                    </h3>
                    <p className="text-sm sm:text-base text-zinc-400 leading-relaxed max-w-2xl">
                      {move.desc}
                    </p>
                  </div>
                </div>

                {/* Founder + Investor status side-by-side */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 sm:pl-[calc(25%+2.5rem)] lg:pl-[calc(25%+2.5rem)]">
                  {/* Founder */}
                  <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-5">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-semibold uppercase tracking-wider text-teal-400">
                        Founders
                      </p>
                      <span
                        className={`inline-block rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                          statusPill[move.status.founder.status].className
                        }`}
                      >
                        {statusPill[move.status.founder.status].label}
                      </span>
                    </div>
                    <p className="text-sm text-zinc-400 leading-relaxed">
                      {move.status.founder.note}
                    </p>
                  </div>

                  {/* Investor */}
                  <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-5">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-semibold uppercase tracking-wider text-orange-400">
                        Investors
                      </p>
                      <span
                        className={`inline-block rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                          statusPill[move.status.investor.status].className
                        }`}
                      >
                        {statusPill[move.status.investor.status].label}
                      </span>
                    </div>
                    <p className="text-sm text-zinc-400 leading-relaxed">
                      {move.status.investor.note}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </FadeInSection>
      </section>

      {/* ── Beyond the six ── */}
      <section className="relative py-16 px-4 mt-12 border-t border-zinc-800/60">
        <FadeInSection>
          <div className="mx-auto max-w-3xl">
            <div className="mb-10 text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500 mb-3">
                Beyond the six
              </p>
              <h2 className="text-2xl sm:text-3xl font-bold text-white">
                Everything else on our list.
              </h2>
            </div>
            <div className="space-y-0">
              {beyondTheSix.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 py-4 border-b border-zinc-800/40 last:border-b-0"
                >
                  <span
                    className={`shrink-0 inline-block rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                      statusPill[item.status].className
                    }`}
                  >
                    {statusPill[item.status].label}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white">
                      {item.label}
                    </p>
                    <p className="text-sm text-zinc-500 leading-relaxed">
                      {item.oneliner}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 text-[10px] font-medium uppercase tracking-wider ${audienceLabelColor[item.audience]}`}
                  >
                    {audienceLabel[item.audience]}
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
            If something here matters to you,{" "}
            <a
              href="mailto:team@raisefn.com"
              className="text-zinc-400 hover:text-white transition-colors"
            >
              let us know
            </a>{" "}
            — it helps us decide what to build next.
          </p>
        </div>
      </section>
    </div>
  );
}
