/**
 * Founder-only edit overlay for /brief/<token>.
 *
 * The brief page itself is a public, SEO-friendly server component that
 * renders the read-only markdown. This client component mounts alongside,
 * fetches /v1/brain/briefs/<token>/edit with the founder's Supabase token,
 * and surfaces an "Edit brief" button only if the caller owns the brief.
 *
 * In edit mode the overlay reveals a side panel for content_md, founder
 * notes (private — never on the public page), and outreach status.
 */
"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase-browser";

const STATUS_OPTIONS = ["draft", "sent", "replied", "met", "passed"] as const;
type Status = (typeof STATUS_OPTIONS)[number];

type EditFetchResult = {
  token: string;
  is_owner: boolean;
  status: Status;
  last_edited_at: string | null;
  markdown?: string;
  founder_notes?: string | null;
  investor_full_name?: string | null;
  founder_company?: string | null;
};

export default function BriefEditorOverlay({ token }: { token: string }) {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [ownerData, setOwnerData] = useState<EditFetchResult | null>(null);
  const [open, setOpen] = useState(false);
  const [markdown, setMarkdown] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<Status>("draft");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      if (s?.access_token) setAccessToken(s.access_token);
    });
  }, []);

  const loadOwnerData = useCallback(async (tok: string) => {
    try {
      const res = await fetch(`/v1/brain/briefs/${token}/edit`, {
        headers: { Authorization: `Bearer ${tok}` },
      });
      if (!res.ok) return;
      const data = (await res.json()) as EditFetchResult;
      setOwnerData(data);
      if (data.is_owner) {
        setMarkdown(data.markdown || "");
        setNotes(data.founder_notes || "");
        setStatus(data.status || "draft");
        setSavedAt(data.last_edited_at);
      }
    } catch {
      // Non-fatal — overlay just stays hidden.
    }
  }, [token]);

  useEffect(() => {
    if (accessToken) loadOwnerData(accessToken);
  }, [accessToken, loadOwnerData]);

  async function save() {
    if (!accessToken) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/v1/brain/briefs/${token}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          content_md: markdown,
          founder_notes: notes,
          status,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.detail || `Save failed (${res.status})`);
      }
      const data = await res.json();
      setSavedAt(data.last_edited_at);
      // Reload the page so the read-only render reflects the new content.
      window.location.reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  }

  if (!ownerData?.is_owner) return null;

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-40 rounded-full bg-zinc-900 hover:bg-zinc-800 text-white text-sm font-medium px-5 py-2.5 shadow-lg"
        >
          Edit brief
          {savedAt && (
            <span className="ml-2 text-[10px] text-zinc-400">
              edited {new Date(savedAt).toLocaleDateString()}
            </span>
          )}
        </button>
      )}

      {open && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="flex-1 bg-black/30 backdrop-blur-[2px]"
            onClick={() => !saving && setOpen(false)}
          />
          <div className="w-full max-w-2xl bg-zinc-950 text-zinc-200 overflow-y-auto border-l border-zinc-800 shadow-2xl">
            <div className="sticky top-0 bg-zinc-950 border-b border-zinc-900 px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-zinc-100">Edit brief</h3>
                <p className="text-[11px] text-zinc-500 mt-0.5">
                  {ownerData.investor_full_name ? `For ${ownerData.investor_full_name}` : "Private to you"}
                  {savedAt && ` · Last saved ${new Date(savedAt).toLocaleString()}`}
                </p>
              </div>
              <button
                onClick={() => !saving && setOpen(false)}
                className="text-zinc-500 hover:text-zinc-300 text-sm"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div className="px-6 py-5 space-y-4 text-sm">
              <label className="block">
                <span className="text-[11px] uppercase tracking-wide text-zinc-500">Outreach status</span>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as Status)}
                  className="mt-1 w-full rounded-md bg-zinc-900 border border-zinc-800 px-2.5 py-1.5 text-sm focus:border-zinc-600 outline-none"
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="text-[11px] uppercase tracking-wide text-zinc-500">Your private notes</span>
                <span className="block text-[11px] text-zinc-600 mb-1">
                  Never shown to the investor — only you see these.
                </span>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  placeholder="What you learned. Open questions. Things to watch for."
                  className="mt-1 w-full rounded-md bg-zinc-900 border border-zinc-800 px-2.5 py-1.5 text-sm focus:border-zinc-600 outline-none resize-y font-mono"
                />
              </label>

              <label className="block">
                <span className="text-[11px] uppercase tracking-wide text-zinc-500">Brief content (markdown)</span>
                <span className="block text-[11px] text-zinc-600 mb-1">
                  This is what the investor sees. Edit any line; keep the section structure.
                </span>
                <textarea
                  value={markdown}
                  onChange={(e) => setMarkdown(e.target.value)}
                  rows={24}
                  className="mt-1 w-full rounded-md bg-zinc-900 border border-zinc-800 px-2.5 py-2 text-xs focus:border-zinc-600 outline-none resize-y font-mono leading-relaxed"
                />
              </label>

              {error && (
                <div className="text-xs text-red-400 bg-red-950/40 border border-red-900/60 rounded-md px-3 py-2">
                  {error}
                </div>
              )}

              <div className="flex gap-2 pt-1 pb-6">
                <button
                  onClick={save}
                  disabled={saving}
                  className="rounded-md bg-teal-600 hover:bg-teal-500 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-1.5 text-sm font-medium text-white"
                >
                  {saving ? "Saving…" : "Save"}
                </button>
                <button
                  onClick={() => setOpen(false)}
                  disabled={saving}
                  className="rounded-md border border-zinc-700 hover:border-zinc-600 px-4 py-1.5 text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
