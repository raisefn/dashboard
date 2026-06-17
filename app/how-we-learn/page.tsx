"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

// /how-we-learn — full-viewport cinematic. The brain as a living neural map
// with five signal streams flowing in. No counters, no demos, no walls of
// text. The visual IS the page.

// Five input streams flowing INTO the brain — what the system learns from.
const INPUTS = [
  {
    label: "Founder artifacts",
    sub: "Emails. Decks. Diligence Q&A. Narrative iteration.",
    color: "#2dd4bf",
    angle: -90,
  },
  {
    label: "Investor behavior",
    sub: "Commitment rate. Objections. Resonance. Checks.",
    color: "#a78bfa",
    angle: -54,
  },
  {
    label: "Outcomes",
    sub: "Met. Passed. Term sheet. Closed.",
    color: "#fbbf24",
    angle: -18,
  },
  {
    label: "Network paths",
    sub: "Warm intros. Co-investors. Backed-by signals.",
    color: "#22d3ee",
    angle: 162,
  },
  {
    label: "Market signal",
    sub: "Cohort timing. Sector benchmarks. Pass reasons.",
    color: "#fb923c",
    angle: 198,
  },
];

// Three output streams flowing OUT of the brain — what gets sharper.
const OUTPUTS = [
  {
    label: "Sharper matches",
    sub: "Right investors, right time, right fit.",
    color: "#f472b6",
    angle: 18,
  },
  {
    label: "Smarter briefs",
    sub: "Tailored to each investor's pattern.",
    color: "#fda4af",
    angle: 54,
  },
  {
    label: "Tighter intros",
    sub: "Higher conviction. Faster closes.",
    color: "#fcd34d",
    angle: 90,
  },
];

// Brain "neurons" — three depth layers, varied sizes. Outer layer is denser
// to make the mesh look ALIVE all the way to the perimeter.
const NEURONS = (() => {
  let rng = 12345;
  const rand = () => {
    rng = (rng * 9301 + 49297) % 233280;
    return rng / 233280;
  };
  const arr: { x: number; y: number; r: number; layer: number }[] = [];
  for (let i = 0; i < 260; i++) {
    const angle = rand() * Math.PI * 2;
    // Bias half the neurons to the outer ring for visible mesh density at edges
    const distRand = rand();
    const dist = i % 2 === 0
      ? 60 + distRand * 160      // outer band
      : 20 + distRand * 110;      // inner cluster
    arr.push({
      x: Math.cos(angle) * dist,
      y: Math.sin(angle) * dist,
      r: 1.1 + rand() * 2.4,
      layer: rand() < 0.35 ? 0 : rand() < 0.7 ? 1 : 2,
    });
  }
  return arr;
})();

// Two-tier connection mesh — close visible + long-range faint webbing.
const CONNECTIONS = (() => {
  const conns: { a: number; b: number; opacity: number }[] = [];
  for (let i = 0; i < NEURONS.length; i++) {
    for (let j = i + 1; j < NEURONS.length; j++) {
      const dx = NEURONS[i].x - NEURONS[j].x;
      const dy = NEURONS[i].y - NEURONS[j].y;
      const d = Math.sqrt(dx * dx + dy * dy);
      if (d < 48 && Math.random() < 0.45) {
        conns.push({ a: i, b: j, opacity: Math.max(0.1, 0.45 - d / 160) });
      } else if (d < 130 && Math.random() < 0.05) {
        conns.push({ a: i, b: j, opacity: 0.07 });
      }
    }
  }
  return conns;
})();

// Activation epicenters — pre-computed neuron indices that act as "thinking
// origin points." Every few seconds, a wave of brightness propagates from one
// of these outward through the mesh, creating the sense the brain is alive.
const EPICENTERS = [10, 47, 88, 132, 175, 220].map((i) => i % NEURONS.length);

function Brain() {
  // Bigger canvas. Inputs go to LEFT half, outputs exit RIGHT half. Center
  // pushed slightly low so top labels never crop.
  const CX = 700;
  const CY = 600;
  const INPUT_DIST = 460;
  const OUTPUT_DIST = 460;

  const [tick, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTick((x) => x + 1), 55);
    return () => clearInterval(t);
  }, []);

  // Activation wave — every ~3.5s a different epicenter fires; brightness
  // ripples outward through the mesh based on distance from that point.
  const waveEpoch = Math.floor(tick / 64);
  const wavePhase = (tick % 64) / 64; // 0 → 1 across the wave
  const epicenterIdx = EPICENTERS[waveEpoch % EPICENTERS.length];
  const epi = NEURONS[epicenterIdx];

  return (
    <div className="relative w-full">
      <svg
        viewBox="0 0 1400 1200"
        className="w-full h-auto"
        style={{ maxHeight: "92vh" }}
      >
        <defs>
          <radialGradient id="brainCore" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.55" />
            <stop offset="35%" stopColor="#0d9488" stopOpacity="0.22" />
            <stop offset="75%" stopColor="#0d9488" stopOpacity="0.05" />
            <stop offset="100%" stopColor="#0d9488" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="brainGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.85" />
            <stop offset="50%" stopColor="#0d9488" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#0d9488" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="brainAtmos" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#0d9488" stopOpacity="0" />
            <stop offset="70%" stopColor="#0d9488" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#0d9488" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="hotspot" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
            <stop offset="40%" stopColor="#5eead4" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Layered atmosphere — three concentric soft gradients for depth */}
        <circle cx={CX} cy={CY} r="540" fill="url(#brainAtmos)" />
        <circle cx={CX} cy={CY} r="420" fill="url(#brainCore)" />
        <circle cx={CX} cy={CY} r="230" fill="url(#brainGlow)" />

        {/* Slow-rotating outer ring of decoration — makes the brain feel ALIVE */}
        <g transform={`rotate(${(tick * 0.4) % 360} ${CX} ${CY})`}>
          <circle cx={CX} cy={CY} r="380" fill="none" stroke="#10b981" strokeOpacity="0.12" strokeWidth="0.8" strokeDasharray="2 12" />
          <circle cx={CX} cy={CY} r="320" fill="none" stroke="#5eead4" strokeOpacity="0.08" strokeWidth="0.6" strokeDasharray="3 18" />
        </g>

        {/* INPUT streams — particles flowing INTO the brain */}
        {INPUTS.map((s, i) => {
          const sx = CX + INPUT_DIST * Math.cos((s.angle * Math.PI) / 180);
          const sy = CY + INPUT_DIST * Math.sin((s.angle * Math.PI) / 180);
          const dx = CX + 120 * Math.cos((s.angle * Math.PI) / 180);
          const dy = CY + 120 * Math.sin((s.angle * Math.PI) / 180);
          return (
            <g key={`in-${i}`}>
              <line x1={sx} y1={sy} x2={dx} y2={dy} stroke={s.color} strokeOpacity="0.22" strokeWidth="1" strokeDasharray="2 6" />
              {/* 12 staggered particles per input — dense flow */}
              {Array.from({ length: 12 }).map((_, p) => {
                const phase = ((tick + p * 11) % 100) / 100;
                const px = sx + (dx - sx) * phase;
                const py = sy + (dy - sy) * phase;
                const sz = (p % 4) === 0 ? 3 : (p % 2) === 0 ? 2 : 1.4;
                // Trail effect — each particle leaves a faint streak behind
                return (
                  <g key={p}>
                    <circle cx={px} cy={py} r={sz} fill={s.color} opacity={0.95 * (1 - Math.abs(phase - 0.5) * 1.6)} />
                  </g>
                );
              })}
              {/* Stream source — bigger, dramatic */}
              <circle cx={sx} cy={sy} r="60" fill={s.color} fillOpacity="0.04" stroke={s.color} strokeOpacity="0.18" strokeWidth="0.8" strokeDasharray="2 5" />
              <circle cx={sx} cy={sy} r="42" fill={s.color} fillOpacity="0.08" stroke={s.color} strokeOpacity="0.55" strokeWidth="1.4" />
              <circle cx={sx} cy={sy} r="8" fill={s.color} fillOpacity="0.98">
                <animate attributeName="r" values="8;13;8" dur={`${1.4 + i * 0.2}s`} repeatCount="indefinite" />
              </circle>
            </g>
          );
        })}

        {/* OUTPUT streams — particles flowing OUT of the brain to labeled
            destinations. Different palette (warm pink/gold) signals OUTFLOW. */}
        {OUTPUTS.map((s, i) => {
          const sx = CX + OUTPUT_DIST * Math.cos((s.angle * Math.PI) / 180);
          const sy = CY + OUTPUT_DIST * Math.sin((s.angle * Math.PI) / 180);
          const dx = CX + 120 * Math.cos((s.angle * Math.PI) / 180);
          const dy = CY + 120 * Math.sin((s.angle * Math.PI) / 180);
          return (
            <g key={`out-${i}`}>
              <line x1={dx} y1={dy} x2={sx} y2={sy} stroke={s.color} strokeOpacity="0.22" strokeWidth="1" strokeDasharray="2 6" />
              {/* 10 particles flowing OUTWARD (brain → dest) */}
              {Array.from({ length: 10 }).map((_, p) => {
                const phase = ((tick + p * 13) % 100) / 100;
                const px = dx + (sx - dx) * phase;
                const py = dy + (sy - dy) * phase;
                const sz = (p % 3) === 0 ? 2.8 : 1.8;
                return (
                  <circle key={p} cx={px} cy={py} r={sz} fill={s.color} opacity={0.95 * (1 - Math.abs(phase - 0.5) * 1.6)} />
                );
              })}
              {/* Destination source — warmer styling */}
              <circle cx={sx} cy={sy} r="60" fill={s.color} fillOpacity="0.04" stroke={s.color} strokeOpacity="0.18" strokeWidth="0.8" strokeDasharray="2 5" />
              <circle cx={sx} cy={sy} r="42" fill={s.color} fillOpacity="0.08" stroke={s.color} strokeOpacity="0.55" strokeWidth="1.4" />
              <circle cx={sx} cy={sy} r="8" fill={s.color} fillOpacity="0.98">
                <animate attributeName="r" values="8;13;8" dur={`${1.5 + i * 0.15}s`} repeatCount="indefinite" />
              </circle>
            </g>
          );
        })}

        {/* Neuron mesh — connections under nodes */}
        <g transform={`translate(${CX} ${CY})`}>
          {CONNECTIONS.map((c, i) => {
            // Connections light up briefly when they're near the active epicenter
            const midX = (NEURONS[c.a].x + NEURONS[c.b].x) / 2;
            const midY = (NEURONS[c.a].y + NEURONS[c.b].y) / 2;
            const distFromEpi = Math.sqrt((midX - epi.x) ** 2 + (midY - epi.y) ** 2);
            const waveRadius = wavePhase * 240;
            const inWave = Math.abs(distFromEpi - waveRadius) < 25;
            const opacity = inWave ? Math.min(0.9, c.opacity + 0.5) : c.opacity;
            const stroke = inWave ? "#ffffff" : "#10b981";
            return (
              <line key={`c-${i}`}
                x1={NEURONS[c.a].x} y1={NEURONS[c.a].y}
                x2={NEURONS[c.b].x} y2={NEURONS[c.b].y}
                stroke={stroke}
                strokeOpacity={opacity}
                strokeWidth={inWave ? 1.3 : 0.7}
              />
            );
          })}
          {NEURONS.map((n, i) => {
            // Base pulse — every neuron breathes on its own slow rhythm
            const phase = ((tick + i * 7) % 60) / 60;
            const pulse = Math.sin(phase * Math.PI * 2) * 0.5 + 0.5;
            // Wave brightness — when the activation wavefront passes this neuron
            const distFromEpi = Math.sqrt((n.x - epi.x) ** 2 + (n.y - epi.y) ** 2);
            const waveRadius = wavePhase * 240;
            const waveProximity = Math.max(0, 1 - Math.abs(distFromEpi - waveRadius) / 30);
            const totalGlow = Math.min(1, pulse * 0.6 + waveProximity * 1.2);
            const fill = waveProximity > 0.4 ? "#ffffff" :
                         n.layer === 0 ? "#10b981" :
                         n.layer === 1 ? "#5eead4" : "#ffffff";
            return (
              <circle key={`n-${i}`}
                cx={n.x} cy={n.y}
                r={n.r + totalGlow * 1.4}
                fill={fill}
                opacity={(n.layer === 2 ? 0.9 : 0.7) * (0.55 + totalGlow * 0.45)}
              />
            );
          })}
          {/* Hotspot at active epicenter — bright fading flash */}
          <circle cx={epi.x} cy={epi.y} r={14} fill="url(#hotspot)" opacity={Math.max(0, 1 - wavePhase * 1.4)} />
        </g>

        {/* LABELS — inputs (left-leaning), outputs (right-leaning), placed
            AFTER the mesh so they sit on top */}
        {[
          ...INPUTS.map((s) => ({ ...s, kind: "in" as const, dist: INPUT_DIST })),
          ...OUTPUTS.map((s) => ({ ...s, kind: "out" as const, dist: OUTPUT_DIST })),
        ].map((s, i) => {
          const sx = CX + s.dist * Math.cos((s.angle * Math.PI) / 180);
          const sy = CY + s.dist * Math.sin((s.angle * Math.PI) / 180);
          const offsetMag = 90;
          const offsetX = offsetMag * Math.cos((s.angle * Math.PI) / 180);
          const offsetY = offsetMag * Math.sin((s.angle * Math.PI) / 180);
          const isLeft = sx + offsetX < CX;
          const tag = s.kind === "in" ? "← INPUT" : "OUTPUT →";
          return (
            <g key={`l-${i}`}>
              <text
                x={sx + offsetX}
                y={sy + offsetY - 22}
                fontSize="10"
                fill={s.color}
                fontFamily="sans-serif"
                fontWeight="700"
                letterSpacing="0.2em"
                textAnchor={isLeft ? "end" : "start"}
                opacity="0.8"
              >
                {tag}
              </text>
              <text
                x={sx + offsetX}
                y={sy + offsetY - 4}
                fontSize="17"
                fill="#fafafa"
                fontFamily="sans-serif"
                fontWeight="700"
                textAnchor={isLeft ? "end" : "start"}
              >
                {s.label}
              </text>
              <text
                x={sx + offsetX}
                y={sy + offsetY + 14}
                fontSize="11"
                fill="#a1a1aa"
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
