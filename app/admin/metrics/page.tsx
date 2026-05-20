"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase-browser";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const ADMIN_EMAILS = ["justin@raisefn.com", "justinpetsche@gmail.com"];

interface Metrics {
  months: string[];
  new_founders: number[];
  new_proprietary_investors: number[];
  matches_fired: number[];
  active_founders: number[];
  meeting_debriefs: number[];
  pipeline_outcomes: {
    committed: number[];
    soft_pass: number[];
    hard_pass: number[];
  };
  revenue_usd: number[] | null;
  free_to_paid_conversions: number[] | null;
  stripe_status: string;
  generated_at: string;
}

export default function AdminMetricsPage() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [months, setMonths] = useState(6);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      const { data: sessionData } = await supabase.auth.getSession();
      const session = sessionData.session;
      if (!session) {
        router.push("/login");
        return;
      }
      const email = session.user.email ?? "";
      if (!ADMIN_EMAILS.includes(email)) {
        if (!cancelled) {
          setIsAdmin(false);
          setLoading(false);
        }
        return;
      }
      if (!cancelled) setIsAdmin(true);

      try {
        const res = await fetch(`/v1/brain/admin/metrics?months=${months}`, {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
        const data = (await res.json()) as Metrics;
        if (!cancelled) setMetrics(data);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Fetch failed");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [months, router]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-8 text-sm text-zinc-500">
        Loading metrics…
      </div>
    );
  }
  if (isAdmin === false) {
    return (
      <div className="max-w-7xl mx-auto p-8 text-sm text-red-400">
        Not authorized. Admin emails only.
      </div>
    );
  }
  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-8">
        <h1 className="text-xl font-bold text-white mb-2">Admin Metrics</h1>
        <div className="rounded border border-red-700/40 bg-red-950/20 p-4 text-sm text-red-300">
          {error}
        </div>
      </div>
    );
  }
  if (!metrics) return null;

  const dataFor = (series: number[]) =>
    metrics.months.map((m, i) => ({ month: m, value: series[i] }));

  const charts: {
    title: string;
    data: number[];
    color: string;
    prefix?: string;
    note?: string;
  }[] = [
    { title: "New founders", data: metrics.new_founders, color: "#2dd4bf" },
    {
      title: "New proprietary investors",
      data: metrics.new_proprietary_investors,
      color: "#f97316",
      note: "Admin-added + self-signup. OpenVC catalog excluded.",
    },
    {
      title: "Matches fired",
      data: metrics.matches_fired,
      color: "#fbbf24",
      note: "Slack/email notifications to Justin from proprietary network.",
    },
    {
      title: "Active founders",
      data: metrics.active_founders,
      color: "#34d399",
      note: "Distinct founders with any raise event in the month.",
    },
  ];

  const stripeReady =
    metrics.stripe_status === "ok" &&
    metrics.revenue_usd &&
    metrics.free_to_paid_conversions;

  return (
    <div className="max-w-7xl mx-auto p-8 text-zinc-200">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Admin Metrics</h1>
        <div className="flex items-center gap-3">
          <span className="text-xs text-zinc-500">Range:</span>
          <select
            value={months}
            onChange={(e) => setMonths(Number(e.target.value))}
            className="bg-zinc-900 border border-zinc-700 rounded px-3 py-1 text-sm text-zinc-200"
          >
            <option value={3}>Last 3 months</option>
            <option value={6}>Last 6 months</option>
            <option value={12}>Last 12 months</option>
            <option value={24}>Last 24 months</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {charts.map((c) => (
          <MetricCard
            key={c.title}
            title={c.title}
            data={dataFor(c.data)}
            color={c.color}
            note={c.note}
            prefix={c.prefix}
          />
        ))}
        {stripeReady ? (
          <>
            <MetricCard
              title="Revenue"
              data={dataFor(metrics.revenue_usd!)}
              color="#22c55e"
              prefix="$"
              note="Sum of active subscription plan amounts each month."
            />
            <MetricCard
              title="Free → Paid conversions"
              data={dataFor(metrics.free_to_paid_conversions!)}
              color="#facc15"
              note="New subscriptions per month."
            />
          </>
        ) : (
          <div className="col-span-1 md:col-span-2 rounded-lg border border-zinc-800 bg-zinc-900/40 p-4 text-sm">
            <div className="font-medium text-zinc-200 mb-1">
              Revenue + conversions
            </div>
            <div className="text-xs text-zinc-400">
              Stripe status:{" "}
              <code className="text-zinc-300">{metrics.stripe_status}</code>
            </div>
            <div className="text-xs text-zinc-500 mt-2">
              Add <code>STRIPE_SECRET_KEY</code> to the brain&apos;s Railway env
              vars to populate.
            </div>
          </div>
        )}
      </div>

      <p className="text-xs text-zinc-600 mt-6">
        Generated: {new Date(metrics.generated_at).toLocaleString()}
      </p>
    </div>
  );
}

function MetricCard({
  title,
  data,
  color,
  prefix,
  note,
}: {
  title: string;
  data: { month: string; value: number }[];
  color: string;
  prefix?: string;
  note?: string;
}) {
  const total = data.reduce((acc, d) => acc + d.value, 0);
  const totalDisplay = prefix === "$"
    ? `$${Math.round(total).toLocaleString()}`
    : `${total.toLocaleString()}`;
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-4">
      <div className="flex justify-between items-baseline mb-3">
        <h3 className="text-sm font-medium text-zinc-300">{title}</h3>
        <span className="text-xs font-mono text-zinc-500">{totalDisplay}</span>
      </div>
      <div className="h-32">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
            <XAxis
              dataKey="month"
              tick={{ fontSize: 10, fill: "#71717a" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 10, fill: "#71717a" }}
              axisLine={false}
              tickLine={false}
              width={32}
            />
            <Tooltip
              contentStyle={{
                background: "#18181b",
                border: "1px solid #3f3f46",
                borderRadius: 4,
                fontSize: 12,
              }}
              labelStyle={{ color: "#a1a1aa" }}
              formatter={(value) => {
                const n = typeof value === "number" ? value : Number(value) || 0;
                return prefix === "$"
                  ? [`$${Math.round(n).toLocaleString()}`, ""]
                  : [String(n), ""];
              }}
            />
            <Bar dataKey="value" fill={color} radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      {note && <p className="text-xs text-zinc-600 mt-2">{note}</p>}
    </div>
  );
}
