"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

// /how-we-learn — full-viewport cinematic. The brain as a living neural map
// with five signal streams flowing in. No counters, no demos, no walls of
// text. The visual IS the page.

// Five signal categories — each becomes a flowing stream of particles.
// Labels reference what's actually captured in the code.
const STREAMS = [
  {
    label: "Founder artifacts",
    sub: "Emails. Decks. Diligence Q&A. Narrative.",
    color: "#2dd4bf",
    angle: -90,
  },
  {
    label: "Investor behavior",
    sub: "Commitment rate. Objections. Resonance. Checks.",
    color: "#a78bfa",
    angle: -18,
  },
  {
    label: "Outcomes",
    sub: "Met. Passed. Term sheet. Closed.",
    color: "#fbbf24",
    angle: 54,
  },
  {
    label: "Network paths",
    sub: "Warm intros. Co-investors. Backed-by.",
    color: "#22d3ee",
    angle: 126,
  },
  {
    label: "Market signal",
    sub: "Cohort timing. Sector benchmarks. Pass reasons.",
    color: "#fb923c",
    angle: 198,
  },
];

// Brain "neurons" — randomly distributed in the center cluster. Drawn once,
// pulse subtly. Connection lines between neighbors. Layered for depth.
const NEURONS = (() => {
  const seed = 12345;
  let rng = seed;
  const rand = () => {
    rng = (rng * 9301 + 49297) % 233280;
    return rng / 233280;
  };
  const arr: { x: number; y: number; r: number; layer: number }[] = [];
  for (let i = 0; i < 90; i++) {
    const angle = rand() * Math.PI * 2;
    const dist = 30 + rand() * 110;
    arr.push({
      x: Math.cos(angle) * dist,
      y: Math.sin(angle) * dist,
      r: 1.4 + rand() * 2.4,
      layer: rand() < 0.4 ? 0 : rand() < 0.7 ? 1 : 2,
    });
  }
  return arr;
})();

// Pre-compute neuron-to-neuron connections for the inner mesh
const CONNECTIONS = (() => {
  const conns: { a: number; b: number; opacity: number }[] = [];
  for (let i = 0; i < NEURONS.length; i++) {
    for (let j = i + 1; j < NEURONS.length; j++) {
      const dx = NEURONS[i].x - NEURONS[j].x;
      const dy = NEURONS[i].y - NEURONS[j].y;
      const d = Math.sqrt(dx * dx + dy * dy);
      if (d < 55 && Math.random() < 0.4) {
        conns.push({ a: i, b: j, opacity: Math.max(0.05, 0.35 - d / 200) });
      }
    }
  }
  return conns;
})();

function Brain() {
  const CX = 500;
  const CY = 400;
  const STREAM_DIST = 320;

  // Animate particles along each stream
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTick((x) => x + 1), 80);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="relative w-full">
      <svg
        viewBox="0 0 1000 800"
        className="w-full h-auto"
        style={{ maxHeight: "85vh" }}
      >
        <defs>
          <radialGradient id="brainCore" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.5" />
            <stop offset="40%" stopColor="#0d9488" stopOpacity="0.18" />
            <stop offset="80%" stopColor="#0d9488" stopOpacity="0.04" />
            <stop offset="100%" stopColor="#0d9488" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="brainGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#0d9488" stopOpacity="0" />
          </radialGradient>
          <filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" />
          </filter>
          {STREAMS.map((s, i) => (
            <linearGradient key={`sg-${i}`} id={`stream-${i}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={s.color} stopOpacity="0" />
              <stop offset="40%" stopColor={s.color} stopOpacity="0.5" />
              <stop offset="100%" stopColor={s.color} stopOpacity="0.05" />
            </linearGradient>
          ))}
        </defs>

        {/* outer atmospheric glow */}
        <circle cx={CX} cy={CY} r="320" fill="url(#brainCore)" />
        <circle cx={CX} cy={CY} r="180" fill="url(#brainGlow)" />

        {/* stream lines + flowing particles */}
        {STREAMS.map((s, i) => {
          const sx = CX + STREAM_DIST * Math.cos((s.angle * Math.PI) / 180);
          const sy = CY + STREAM_DIST * Math.sin((s.angle * Math.PI) / 180);
          const dx = CX + 100 * Math.cos((s.angle * Math.PI) / 180);
          const dy = CY + 100 * Math.sin((s.angle * Math.PI) / 180);
          return (
            <g key={`s-${i}`}>
              <line
                x1={sx}
                y1={sy}
                x2={CX}
                y2={CY}
                stroke={s.color}
                strokeOpacity="0.18"
                strokeWidth="1"
                strokeDasharray="2 6"
              />
              {/* particles flowing INTO brain */}
              {[0, 1, 2, 3, 4].map((p) => {
                const phase = ((tick + p * 20) % 100) / 100;
                const px = sx + (dx - sx) * phase;
                const py = sy + (dy - sy) * phase;
                return (
                  <circle
                    key={p}
                    cx={px}
                    cy={py}
                    r={2.2}
                    fill={s.color}
                    opacity={0.85 * (1 - Math.abs(phase - 0.5) * 2 + 0.3)}
                  />
                );
              })}
              {/* stream source — node + label */}
              <circle cx={sx} cy={sy} r="36" fill={s.color} fillOpacity="0.07" stroke={s.color} strokeOpacity="0.5" strokeWidth="1.2" />
              <circle cx={sx} cy={sy} r="6" fill={s.color} fillOpacity="0.95" />
            </g>
          );
        })}

        {/* neuron mesh — connections drawn first so they sit under the nodes */}
        <g transform={`translate(${CX} ${CY})`}>
          {CONNECTIONS.map((c, i) => (
            <line
              key={`c-${i}`}
              x1={NEURONS[c.a].x}
              y1={NEURONS[c.a].y}
              x2={NEURONS[c.b].x}
              y2={NEURONS[c.b].y}
              stroke="#10b981"
              strokeOpacity={c.opacity}
              strokeWidth="0.8"
            />
          ))}
          {NEURONS.map((n, i) => {
            const phase = ((tick + i * 7) % 60) / 60;
            const pulse = Math.sin(phase * Math.PI * 2) * 0.5 + 0.5;
            return (
              <circle
                key={`n-${i}`}
                cx={n.x}
                cy={n.y}
                r={n.r + pulse * 0.6}
                fill={n.layer === 0 ? "#10b981" : n.layer === 1 ? "#5eead4" : "#ffffff"}
                opacity={(n.layer === 2 ? 0.9 : 0.65) * (0.6 + pulse * 0.4)}
              />
            );
          })}
        </g>

        {/* stream LABELS — placed AFTER the circles so they overlay properly */}
        {STREAMS.map((s, i) => {
          const sx = CX + STREAM_DIST * Math.cos((s.angle * Math.PI) / 180);
          const sy = CY + STREAM_DIST * Math.sin((s.angle * Math.PI) / 180);
          // Label position offset OUTWARD from brain
          const offsetX = 70 * Math.cos((s.angle * Math.PI) / 180);
          const offsetY = 70 * Math.sin((s.angle * Math.PI) / 180);
          const isLeft = sx + offsetX < CX;
          return (
            <g key={`l-${i}`}>
              <text
                x={sx + offsetX}
                y={sy + offsetY - 6}
                fontSize="14"
                fill="#fafafa"
                fontFamily="sans-serif"
                fontWeight="700"
                textAnchor={isLeft ? "end" : "start"}
              >
                {s.label}
              </text>
              <text
                x={sx + offsetX}
                y={sy + offsetY + 10}
                fontSize="11"
                fill="#71717a"
                fontFamily="sans-serif"
                textAnchor={isLeft ? "end" : "start"}
              >
                {s.sub}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export default function HowWeLearnPage() {
  return (
    <div className="relative">
      <div className="grid-bg" />

      {/* The brain IS the hero. */}
      <section className="relative pt-12 pb-8 px-4">
        <div className="mx-auto max-w-7xl">
          <Brain />
        </div>
      </section>

      {/* Single statement under the brain — punchy, no walls of text */}
      <section className="relative py-16 px-4">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-5xl sm:text-6xl font-bold text-white leading-[1.05] tracking-tight mb-8">
            Every signal feeds back.{" "}
            <span className="text-teal-300">Every raise sharpens the next.</span>
          </h1>
          <p className="text-xl text-zinc-400 leading-relaxed max-w-3xl mx-auto">
            Five categories of signal. Every email sent, every meeting taken, every term sheet
            signed, every soft pass — all of it. The lattice gets denser. The matches get sharper.
            The next founder benefits from yours.
          </p>
        </div>
      </section>

      {/* Three statements — what compounds, why it matters, what stays private */}
      <section className="relative py-16 px-4">
        <div className="mx-auto max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-10">
          <div>
            <div className="text-[10px] uppercase tracking-[0.3em] text-teal-400/80 font-bold mb-4">
              The flywheel
            </div>
            <h3 className="text-2xl font-bold text-white leading-tight mb-4">
              22 feedback loops.
            </h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Outreach patterns. Pitch iteration. Diligence topics. Investor objections. Cohort
              benchmarks. Recommendation accuracy. The system learns from every interaction.
            </p>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-[0.3em] text-amber-400/80 font-bold mb-4">
              Ground truth
            </div>
            <h3 className="text-2xl font-bold text-white leading-tight mb-4">
              Behavior, not promises.
            </h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              We track what investors actually do — checks written, ghosts logged, meetings
              taken — not what their website says. Real behavior reshapes future matches.
            </p>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-[0.3em] text-violet-300/80 font-bold mb-4">
              Privacy by design
            </div>
            <h3 className="text-2xl font-bold text-white leading-tight mb-4">
              Aggregates only.
            </h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              No founder can identify another founder&apos;s pipeline. Investor behavioral
              profiles cross N&nbsp;≥&nbsp;2 thresholds before surfacing. The network gets
              smarter without exposing anyone.
            </p>
          </div>
        </div>
      </section>

      {/* CTA — minimal */}
      <section className="relative pt-16 pb-32 px-4">
        <div className="mx-auto max-w-2xl text-center">
          <Link
            href="/signup"
            className="inline-flex items-center justify-center rounded-full bg-orange-600 px-10 py-4 text-sm font-bold tracking-wide text-white transition-all hover:bg-orange-500 hover:scale-105 shadow-2xl shadow-orange-900/40"
          >
            Set up your raise
          </Link>
          <div className="mt-10">
            <Link
              href="/how-we-match"
              className="text-sm font-medium text-zinc-400 hover:text-teal-300 transition-colors"
            >
              ← See the lattice
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
