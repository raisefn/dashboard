"use client";

import Link from "next/link";
import FadeInSection from "@/components/fade-in-section";
import { useEffect, useRef, useState } from "react";

/* ── SDK ecosystem nodes ── */
const nodes = [
  // Frameworks (active)
  { label: "LangChain", desc: "Python SDK", color: "#2dd4bf", active: true },
  { label: "CrewAI", desc: "Orchestration", color: "#fb923c", active: true },
  { label: "Claude / MCP", desc: "Native tools", color: "#a78bfa", active: true },
  { label: "REST API", desc: "Any language", color: "#94a3b8", active: true },
  // Brain capabilities exposed via SDK
  { label: "match_investors", desc: "Ranked by fit", color: "#2dd4bf", active: true },
  { label: "evaluate_readiness", desc: "Metric scoring", color: "#34d399", active: true },
  { label: "analyze_narrative", desc: "Pitch testing", color: "#fbbf24", active: true },
  { label: "read_signals", desc: "Behavior decode", color: "#fb923c", active: true },
  { label: "guide_outreach", desc: "Per-investor", color: "#f87171", active: true },
  { label: "analyze_terms", desc: "Market comps", color: "#a78bfa", active: true },
  // Ecosystem / planned integrations
  { label: "AutoGPT", desc: "Autonomous", color: "#60a5fa", active: false },
  { label: "OpenAI Agents", desc: "Function calling", color: "#34d399", active: false },
  { label: "Semantic Kernel", desc: ".NET SDK", color: "#c084fc", active: false },
  { label: "Haystack", desc: "Retrieval", color: "#38bdf8", active: false },
  { label: "LlamaIndex", desc: "Data framework", color: "#f472b6", active: false },
  { label: "Vercel AI SDK", desc: "Edge runtime", color: "#fca5a1", active: false },
  { label: "Webhooks", desc: "Event-driven", color: "#86efac", active: false },
  { label: "Zapier", desc: "No-code", color: "#fde68a", active: false },
  { label: "n8n", desc: "Workflow", color: "#67e8f9", active: false },
  { label: "Custom Integration", desc: "Your stack", color: "#d946ef", active: false },
];

function seededRandom(seed: number) {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return x - Math.floor(x);
}

function generatePositions(count: number) {
  const positions: {
    x: number; y: number; depth: number;
    size: number; opacity: number; speed: number;
  }[] = [];

  for (let i = 0; i < count; i++) {
    const seed = i * 11 + 17; // different seed than brain/tracker
    const angle = seededRandom(seed) * Math.PI * 2;
    const dist = 160 + seededRandom(seed + 1) * 240;
    const depth = seededRandom(seed + 2);
    const depthScale = 0.3 + depth * 0.7;

    positions.push({
      x: 400 + Math.cos(angle) * dist * (0.7 + depth * 0.3),
      y: 400 + Math.sin(angle) * dist * (0.7 + depth * 0.3),
      depth,
      size: depthScale,
      opacity: 0.25 + depth * 0.75,
      speed: 3 + (1 - depth) * 4,
    });
  }
  return positions;
}

const positions = generatePositions(nodes.length);
const CX = 400;
const CY = 400;

function SDKDiagram() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const update = () => {
      if (containerRef.current) {
        setScale(Math.min(1, containerRef.current.offsetWidth / 800));
      }
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const sorted = nodes
    .map((s, i) => ({ ...s, ...positions[i], index: i }))
    .sort((a, b) => a.depth - b.depth);

  return (
    <div
      ref={containerRef}
      className="relative mx-auto w-full max-w-[800px] overflow-hidden"
      style={{ height: 800 * scale }}
    >
      <div
        style={{
          transform: `scale(${scale})`,
          transformOrigin: "top center",
          width: 800,
          height: 800,
          position: "absolute",
          left: "50%",
          marginLeft: -400,
        }}
      >
        <svg className="absolute inset-0" width={800} height={800} viewBox="0 0 800 800">
          {sorted.map((node) => (
            <g key={node.index}>
              <line
                x1={node.x} y1={node.y} x2={CX} y2={CY}
                stroke={node.color}
                strokeWidth={node.active ? 1.5 * node.size : 0.8 * node.size}
                strokeOpacity={node.active ? 0.2 * node.opacity : 0.08 * node.opacity}
                strokeDasharray={node.active ? "6 4" : "3 6"}
                className="animate-dash"
                style={{ animationDelay: `${node.index * 0.15}s` }}
              />
              <circle
                r={node.active ? 3.5 * node.size : 2 * node.size}
                fill={node.color}
                opacity={node.active ? 0.6 * node.opacity : 0.25 * node.opacity}
              >
                <animateMotion
                  dur={`${2.5 + node.index * 0.2}s`}
                  repeatCount="indefinite"
                  path={`M${node.x},${node.y} L${CX},${CY}`}
                />
              </circle>
            </g>
          ))}
        </svg>

        {/* Central node */}
        <div
          className="absolute flex flex-col items-center justify-center rounded-full animate-glow"
          style={{
            width: 180, height: 180,
            left: CX - 90, top: CY - 90,
            background: "radial-gradient(circle, #27272a 0%, #18181b 100%)",
            border: "2px solid #3f3f46",
            zIndex: 50,
          }}
        >
          <span className="text-4xl font-bold">
            <span style={{ color: "#F97316" }}>raise</span>
            <span style={{ color: "#2DD4BF" }}>(fn)</span>
          </span>
          <span className="mt-1 text-xs text-zinc-500">developer sdk</span>
        </div>

        {/* Nodes */}
        {sorted.map((node) => {
          const w = Math.round(70 + 60 * node.size);
          const h = Math.round(40 + 40 * node.size);
          const fontSize = node.size > 0.7 ? "text-sm" : node.size > 0.4 ? "text-xs" : "text-[10px]";
          const descSize = node.size > 0.7 ? "text-xs" : "text-[10px]";

          return (
            <div
              key={node.index}
              className={`absolute flex flex-col items-center justify-center rounded-xl border animate-float ${
                node.active ? "border-zinc-600/50" : "border-zinc-800/30"
              }`}
              style={{
                width: w, height: h,
                left: node.x - w / 2, top: node.y - h / 2,
                background: `rgba(24,24,27,${0.5 + node.depth * 0.4})`,
                backdropFilter: node.depth > 0.5 ? "blur(8px)" : undefined,
                opacity: node.opacity,
                zIndex: Math.round(node.depth * 40),
                animationDuration: `${node.speed}s`,
                animationDelay: `${node.index * 0.3}s`,
              }}
            >
              <span className={`${fontSize} font-semibold leading-tight`} style={{ color: node.color }}>
                {node.label}
              </span>
              {node.size > 0.4 && (
                <span className={`${descSize} mt-0.5 text-zinc-500 leading-tight`}>
                  {node.desc}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function SDKPage() {
  return (
    <div className="relative">
      <div className="grid-bg" />

      {/* ── Hero ── */}
      <section className="relative pt-16 pb-4 px-4">
        <div className="mx-auto max-w-3xl text-center animate-fade-in">
          <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
            Native integrations for LangChain, CrewAI, Claude, and REST.
            Build fundraising intelligence into your product — investor matching,
            readiness scoring, signal reading — through a single function call.
          </p>
        </div>
      </section>

      {/* ── 3D Network Diagram ── */}
      <section className="relative py-8 px-4 overflow-hidden">
        <SDKDiagram />
        <p
          className="mx-auto max-w-lg text-center text-base text-zinc-400 animate-fade-in"
          style={{ animationDelay: "0.3s", marginTop: -20 }}
        >
          Frameworks, capabilities, and integrations — all connected through one SDK.
        </p>
      </section>

      {/* ── What Agents Can Do ── */}
      <section className="relative py-24 px-4">
        <FadeInSection>
          <div className="mx-auto max-w-3xl text-center mb-12">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-400 mb-4">
              Capabilities
            </p>
            <h2 className="text-3xl font-bold text-white sm:text-4xl">
              What you can build with raise(fn)
            </h2>
          </div>
          <div className="mx-auto max-w-4xl grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { title: "match_investors", desc: "Find and rank best-fit investors by sector, stage, traction, and deployment patterns.", color: "#2dd4bf" },
              { title: "evaluate_readiness", desc: "Assess raise readiness by comparing metrics against successful comparable rounds.", color: "#34d399" },
              { title: "analyze_narrative", desc: "Evaluate pitch positioning against investor preferences and market narratives.", color: "#fbbf24" },
              { title: "read_signals", desc: "Interpret investor behavior patterns into actionable signals.", color: "#fb923c" },
              { title: "guide_outreach", desc: "Generate personalized outreach strategies for specific investors.", color: "#f87171" },
              { title: "analyze_terms", desc: "Compare term sheets against market-rate data for the relevant stage and sector.", color: "#a78bfa" },
            ].map((tool) => (
              <div key={tool.title} className="text-center">
                <h3 className="font-mono text-sm font-semibold mb-1" style={{ color: tool.color }}>
                  {tool.title}
                </h3>
                <p className="text-sm text-zinc-500">{tool.desc}</p>
              </div>
            ))}
          </div>
        </FadeInSection>
      </section>

      {/* ── CTA ── */}
      <section className="relative py-24 px-4">
        <FadeInSection>
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold text-white sm:text-4xl mb-4">
              Build with raise(fn)
            </h2>
            <p className="text-zinc-500 mb-8">
              The SDK is open source. The intelligence is not.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
            </div>
          </div>
        </FadeInSection>
      </section>
    </div>
  );
}
