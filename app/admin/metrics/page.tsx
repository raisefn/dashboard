"use client";

import { useCallback, useEffect, useState } from "react";
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

type AuditResponse = {
  metric: string;
  month: string;
  count: number;
  limit: number;
  rows: Record<string, unknown>[];
  note?: string;
  error?: string;
};

interface Metrics {
  months: string[];
  new_founders: number[];
  new_proprietary_investors: number[];
  matches_fired: number[];
  active_founders: number[];
  // Distinct founders across the entire window (NOT sum of monthly).
  // Optional for back-compat with older brain releases.
  active_founders_total?: number;
  meeting_debriefs: number[];
  pipeline_outcomes: {
    committed: number[];
    soft_pass: number[];
    hard_pass: number[];
  };
  revenue_usd: number[] | null;
  revenue_stripe_usd?: number[] | null;
  revenue_adjustments_usd?: number[];
  free_to_paid_conversions: number[] | null;
  stripe_status: string;
  generated_at: string;
}

interface RevenueAdjustment {
  id: string;
  source_label: string;
  amount_usd: number;
  currency: string;
  occurred_at: string | null;
  recorded_by: string;
  customer_email: string | null;
  notes: string | null;
  voided_at: string | null;
  created_at: string | null;
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
    metricKey?: string;
    // When set, the card's header total uses this value instead of summing
    // the per-month data. Used for metrics where the same entity (founder)
    // can appear in multiple months — sum would double-count.
    totalOverride?: number;
  }[] = [
    { title: "New founders", data: metrics.new_founders, color: "#2dd4bf", metricKey: "new_founders" },
    {
      title: "New proprietary investors",
      data: metrics.new_proprietary_investors,
      color: "#f97316",
      note: "Admin-added + self-signup. OpenVC catalog excluded.",
      metricKey: "new_proprietary_investors",
    },
    {
      title: "Matches fired",
      data: metrics.matches_fired,
      color: "#fbbf24",
      note: "Slack/email notifications to Justin from proprietary network.",
      metricKey: "matches_fired",
    },
    {
      title: "Active founders",
      data: metrics.active_founders,
      color: "#34d399",
      // Override the badge sum with distinct-across-window so the same
      // founder active in 2-3 months doesn't get triple-counted in the
      // header total. Falls back to sum if the field is missing (older
      // brain versions).
      totalOverride: metrics.active_founders_total,
      note: "Distinct founders with any raise event in the month.",
      metricKey: "active_founders",
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
            totalOverride={c.totalOverride}
            metricKey={c.metricKey}
            months={metrics.months}
          />
        ))}
        {stripeReady ? (
          <>
            <MetricCard
              title="Revenue (one-time)"
              data={dataFor(metrics.revenue_usd!)}
              color="#22c55e"
              prefix="$"
              note="Sum of succeeded Stripe charges in each month."
              metricKey="revenue"
              months={metrics.months}
            />
            <MetricCard
              title="Free → Paid conversions"
              data={dataFor(metrics.free_to_paid_conversions!)}
              color="#facc15"
              note="Real conversions only: Stripe checkouts + admin tier-change upgrades. Backfilled historical advisor onboards excluded — we can't tell if those were ever free."
              metricKey="free_to_paid"
              months={metrics.months}
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

      <RevenueAdjustmentsSection />
    </div>
  );
}


function RevenueAdjustmentsSection() {
  const [rows, setRows] = useState<RevenueAdjustment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Form state
  const [sourceLabel, setSourceLabel] = useState("");
  const [amountUsd, setAmountUsd] = useState("");
  const [occurredAt, setOccurredAt] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [customerEmail, setCustomerEmail] = useState("");
  const [notes, setNotes] = useState("");

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const session = sessionData.session;
      if (!session) return;
      const res = await fetch(
        "/v1/brain/admin/revenue-adjustments?months=24",
        { headers: { Authorization: `Bearer ${session.access_token}` } },
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setRows(data.adjustments || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Fetch failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const session = sessionData.session;
      if (!session) throw new Error("Not signed in");

      // Convert date input to ISO with UTC midnight — we don't have
      // per-payment timezone resolution in the form. Operator can edit
      // notes if a specific time matters.
      const occurredIso = new Date(occurredAt + "T12:00:00Z").toISOString();

      const res = await fetch("/v1/brain/admin/revenue-adjustment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          source_label: sourceLabel.trim(),
          amount_usd: Number(amountUsd),
          currency: "USD",
          occurred_at: occurredIso,
          customer_email: customerEmail.trim() || null,
          notes: notes.trim() || null,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.detail || `HTTP ${res.status}`);
      }
      // Reset form + reload list
      setSourceLabel("");
      setAmountUsd("");
      setCustomerEmail("");
      setNotes("");
      await load();
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : "Submit failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleVoid = async (id: string) => {
    if (!window.confirm("Void this revenue entry? It will be excluded from charts.")) {
      return;
    }
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const session = sessionData.session;
      if (!session) return;
      await fetch(`/v1/brain/admin/revenue-adjustment/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      await load();
    } catch (e) {
      console.error(e);
    }
  };

  const activeTotal = rows
    .filter((r) => !r.voided_at)
    .reduce((sum, r) => sum + r.amount_usd, 0);

  return (
    <div className="mt-10 rounded-lg border border-zinc-800 bg-zinc-900/40 p-5">
      <div className="flex items-baseline justify-between mb-4">
        <h2 className="text-lg font-semibold text-white">
          Off-Stripe revenue
        </h2>
        <div className="text-xs text-zinc-500">
          ACH / wire / check payments — NOT processed through Stripe.
          Counted alongside Stripe charges in the Revenue chart above.
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-6 gap-3 items-end mb-5"
      >
        <div className="md:col-span-2">
          <label className="block text-xs text-zinc-400 mb-1">Source</label>
          <input
            type="text"
            value={sourceLabel}
            onChange={(e) => setSourceLabel(e.target.value)}
            placeholder="Bunny Studio - ACH"
            required
            className="w-full bg-zinc-950 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 focus:border-teal-500 outline-none"
          />
        </div>
        <div>
          <label className="block text-xs text-zinc-400 mb-1">Amount (USD)</label>
          <input
            type="number"
            step="0.01"
            min="0.01"
            value={amountUsd}
            onChange={(e) => setAmountUsd(e.target.value)}
            placeholder="2333.33"
            required
            className="w-full bg-zinc-950 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 focus:border-teal-500 outline-none"
          />
        </div>
        <div>
          <label className="block text-xs text-zinc-400 mb-1">Date</label>
          <input
            type="date"
            value={occurredAt}
            onChange={(e) => setOccurredAt(e.target.value)}
            required
            className="w-full bg-zinc-950 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 focus:border-teal-500 outline-none"
          />
        </div>
        <div>
          <label className="block text-xs text-zinc-400 mb-1">Customer email (opt)</label>
          <input
            type="email"
            value={customerEmail}
            onChange={(e) => setCustomerEmail(e.target.value)}
            placeholder="ops@bunnystudio.com"
            className="w-full bg-zinc-950 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 focus:border-teal-500 outline-none"
          />
        </div>
        <div>
          <button
            type="submit"
            disabled={submitting || !sourceLabel || !amountUsd}
            className="w-full bg-teal-500 hover:bg-teal-400 disabled:opacity-50 disabled:cursor-not-allowed text-zinc-950 font-medium rounded px-4 py-2 text-sm"
          >
            {submitting ? "Adding…" : "Add entry"}
          </button>
        </div>
        <div className="md:col-span-6">
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Notes (optional)"
            className="w-full bg-zinc-950 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 focus:border-teal-500 outline-none"
          />
        </div>
      </form>

      {submitError && (
        <div className="mb-3 text-xs text-red-400">{submitError}</div>
      )}

      {loading ? (
        <div className="text-xs text-zinc-500">Loading entries…</div>
      ) : error ? (
        <div className="text-xs text-red-400">{error}</div>
      ) : rows.length === 0 ? (
        <div className="text-xs text-zinc-500">
          No off-Stripe entries yet. Use the form above to add the first one.
        </div>
      ) : (
        <>
          <div className="text-xs text-zinc-500 mb-2">
            {rows.length} {rows.length === 1 ? "entry" : "entries"} · Active total: ${activeTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-zinc-500 border-b border-zinc-800">
                  <th className="text-left py-2 font-normal">Date</th>
                  <th className="text-left py-2 font-normal">Source</th>
                  <th className="text-right py-2 font-normal">Amount</th>
                  <th className="text-left py-2 font-normal">Customer</th>
                  <th className="text-left py-2 font-normal">Notes</th>
                  <th className="text-right py-2 font-normal">By</th>
                  <th className="text-right py-2 font-normal"></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr
                    key={r.id}
                    className={`border-b border-zinc-900 ${
                      r.voided_at ? "opacity-40 line-through" : ""
                    }`}
                  >
                    <td className="py-2 text-zinc-400">
                      {r.occurred_at?.split("T")[0]}
                    </td>
                    <td className="py-2 text-zinc-200">{r.source_label}</td>
                    <td className="py-2 text-right text-zinc-100 font-medium">
                      ${r.amount_usd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="py-2 text-zinc-500 text-xs">
                      {r.customer_email || "—"}
                    </td>
                    <td className="py-2 text-zinc-500 text-xs">
                      {r.notes || "—"}
                    </td>
                    <td className="py-2 text-right text-zinc-600 text-xs">
                      {r.recorded_by.split("@")[0]}
                    </td>
                    <td className="py-2 text-right">
                      {!r.voided_at && (
                        <button
                          onClick={() => void handleVoid(r.id)}
                          className="text-xs text-zinc-500 hover:text-red-400"
                          title="Void this entry (soft-delete; preserved for audit)"
                        >
                          Void
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

function MetricCard({
  title,
  data,
  color,
  prefix,
  note,
  totalOverride,
  metricKey,
  months,
}: {
  title: string;
  data: { month: string; value: number }[];
  color: string;
  prefix?: string;
  note?: string;
  totalOverride?: number;
  metricKey?: string;
  months?: string[];
}) {
  // When totalOverride is set, use it for the badge instead of summing the
  // per-month series. Used for metrics where the same entity can appear in
  // multiple months (e.g. active_founders). Otherwise sum (the right
  // behavior for cumulative metrics like new_founders, revenue, etc.).
  const total = totalOverride !== undefined
    ? totalOverride
    : data.reduce((acc, d) => acc + d.value, 0);
  const totalDisplay = prefix === "$"
    ? `$${Math.round(total).toLocaleString()}`
    : `${total.toLocaleString()}`;
  const [expanded, setExpanded] = useState(false);
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
      {metricKey && months && months.length > 0 && (
        <div className="mt-3 border-t border-zinc-800/80 pt-2">
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            {expanded ? "Hide rows ▴" : "Show rows ▾"}
          </button>
          {expanded && (
            <AuditPanel
              metricKey={metricKey}
              months={months}
              data={data}
            />
          )}
        </div>
      )}
    </div>
  );
}

function AuditPanel({
  metricKey,
  months,
  data,
}: {
  metricKey: string;
  months: string[];
  data: { month: string; value: number }[];
}) {
  const [selectedMonth, setSelectedMonth] = useState(months[months.length - 1]);
  const [audit, setAudit] = useState<AuditResponse | null>(null);
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditError, setAuditError] = useState<string | null>(null);

  const expectedCount =
    data.find((d) => d.month === selectedMonth)?.value ?? 0;

  const fetchAudit = useCallback(async () => {
    setAuditLoading(true);
    setAuditError(null);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const session = sessionData.session;
      if (!session) {
        setAuditError("Not signed in");
        return;
      }
      const res = await fetch(
        `/v1/brain/admin/metrics/audit?metric=${encodeURIComponent(metricKey)}&month=${encodeURIComponent(selectedMonth)}`,
        { headers: { Authorization: `Bearer ${session.access_token}` } },
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
      const payload = (await res.json()) as AuditResponse;
      setAudit(payload);
    } catch (e) {
      setAuditError(e instanceof Error ? e.message : "Audit fetch failed");
    } finally {
      setAuditLoading(false);
    }
  }, [metricKey, selectedMonth]);

  useEffect(() => {
    fetchAudit();
  }, [fetchAudit]);

  const cols =
    audit && audit.rows.length > 0 ? Object.keys(audit.rows[0]) : [];

  // For revenue, validate the sum of audit row amounts against the chart bar
  // height — if they disagree, the audit and metric have drifted.
  let driftWarning: string | null = null;
  if (audit) {
    if (metricKey === "revenue") {
      const auditSum = audit.rows.reduce((acc, r) => {
        const a = r["amount_usd"];
        return acc + (typeof a === "number" ? a : 0);
      }, 0);
      const chartVal = expectedCount;
      if (Math.abs(auditSum - chartVal) > 0.5) {
        driftWarning = `Drift: chart $${Math.round(chartVal).toLocaleString()} vs audit sum $${Math.round(auditSum).toLocaleString()}`;
      }
    } else if (audit.count !== expectedCount) {
      driftWarning = `Drift: chart ${expectedCount} vs audit ${audit.count}`;
    }
  }

  return (
    <div className="mt-2 text-xs">
      <div className="flex items-center gap-2 mb-2">
        <label className="text-zinc-500">Month:</label>
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="bg-zinc-900 border border-zinc-700 rounded px-2 py-0.5 text-xs text-zinc-200"
        >
          {months.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
        {audit && !auditLoading && (
          <span className="text-zinc-500">
            {audit.count} row{audit.count === 1 ? "" : "s"}
            {audit.count >= audit.limit && ` (capped at ${audit.limit})`}
          </span>
        )}
      </div>
      {driftWarning && (
        <div className="mb-2 rounded border border-yellow-900/60 bg-yellow-950/30 px-2 py-1 text-yellow-300">
          {driftWarning}
        </div>
      )}
      {auditLoading && <div className="text-zinc-600">Loading rows…</div>}
      {auditError && (
        <div className="rounded border border-red-900/60 bg-red-950/30 px-2 py-1 text-red-300">
          {auditError}
        </div>
      )}
      {audit && audit.note && (
        <div className="rounded border border-zinc-700 bg-zinc-900 px-2 py-1 text-zinc-400">
          {audit.note}
        </div>
      )}
      {audit && audit.error && (
        <div className="rounded border border-red-900/60 bg-red-950/30 px-2 py-1 text-red-300">
          {audit.error}
        </div>
      )}
      {audit && !auditError && audit.rows.length === 0 && !audit.error && (
        <div className="text-zinc-600">No rows in this month.</div>
      )}
      {audit && audit.rows.length > 0 && (
        <div className="overflow-x-auto rounded border border-zinc-800">
          <table className="w-full text-[11px]">
            <thead className="bg-zinc-900/80">
              <tr>
                {cols.map((c) => (
                  <th
                    key={c}
                    className="text-left font-medium text-zinc-400 px-2 py-1 border-b border-zinc-800 whitespace-nowrap"
                  >
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {audit.rows.map((row, i) => (
                <tr key={i} className="border-b border-zinc-800/60 last:border-b-0">
                  {cols.map((c) => {
                    const v = row[c];
                    let display: string;
                    if (v === null || v === undefined) display = "—";
                    else if (typeof v === "number") {
                      if (c.includes("amount_usd")) display = `$${v.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
                      else display = String(v);
                    } else if (typeof v === "string") {
                      // Format ISO timestamps to local short form for readability
                      if (/^\d{4}-\d{2}-\d{2}T/.test(v)) {
                        try { display = new Date(v).toLocaleString(); } catch { display = v; }
                      } else display = v;
                    } else display = JSON.stringify(v);
                    return (
                      <td
                        key={c}
                        className="text-zinc-300 px-2 py-1 align-top whitespace-nowrap"
                      >
                        {display}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
