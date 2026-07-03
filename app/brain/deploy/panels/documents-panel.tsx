"use client";

import { useCallback, useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import type { Panel } from "./use-panel-state";

/**
 * Documents list panel — every document the founder has uploaded.
 * Grouped by doc_type (decks, term sheets, contracts, general).
 * Click a row → opens the Document detail panel.
 *
 * Source: /v1/brain/sidebar-state — already returns the documents
 * array (id, filename, doc_type, created_at).
 */

type SidebarDocument = {
  id: string;
  filename: string;
  doc_type: string;
  created_at: string | null;
};

interface DocumentsPanelProps {
  session: Session | null;
  impersonating: string;
  onOpenPanel: (p: Panel) => void;
}

const TYPE_LABEL: Record<string, string> = {
  deck: "Pitch decks",
  term_sheet: "Term sheets",
  contract: "Contracts",
  general: "Other documents",
};

const TYPE_ORDER: Record<string, number> = {
  deck: 1,
  term_sheet: 2,
  contract: 3,
  general: 4,
};

function formatDate(iso: string | null): string {
  if (!iso) return "";
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function DocumentsPanel({ session, impersonating, onOpenPanel }: DocumentsPanelProps) {
  const [documents, setDocuments] = useState<SidebarDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!session) return;
    setLoading(true);
    setError(null);
    try {
      const headers: Record<string, string> = {
        Authorization: `Bearer ${session.access_token}`,
      };
      if (impersonating) headers["X-Impersonate"] = impersonating;
      const res = await fetch("/v1/brain/sidebar-state", { headers });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.detail || `Failed to load documents (${res.status})`);
      }
      const json = await res.json();
      setDocuments(json.documents || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load documents.");
    } finally {
      setLoading(false);
    }
  }, [session, impersonating]);

  useEffect(() => { void load(); }, [load]);

  useEffect(() => {
    const onUpdate = () => { void load(); };
    window.addEventListener("raisefn:documents_updated", onUpdate);
    return () => window.removeEventListener("raisefn:documents_updated", onUpdate);
  }, [load]);

  if (loading) {
    return (
      <div className="docs-state">
        <style>{DOCS_PANEL_CSS}</style>
        <p className="docs-state-text">Loading documents…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="docs-state">
        <style>{DOCS_PANEL_CSS}</style>
        <p className="docs-state-error">{error}</p>
      </div>
    );
  }

  if (!documents.length) {
    return (
      <div className="docs-state">
        <style>{DOCS_PANEL_CSS}</style>
        <p className="docs-state-title">No deck loaded.</p>
        <p className="docs-state-sub">
          Drop your deck anywhere in the chat area — PDF, PPT, Keynote,
          or a Google Slides link. I&apos;ll parse it.
        </p>
      </div>
    );
  }

  const groups = new Map<string, SidebarDocument[]>();
  documents.forEach(d => {
    const type = d.doc_type || "general";
    if (!groups.has(type)) groups.set(type, []);
    groups.get(type)!.push(d);
  });
  const orderedGroups = Array.from(groups.entries()).sort(
    ([a], [b]) => (TYPE_ORDER[a] ?? 99) - (TYPE_ORDER[b] ?? 99),
  );

  return (
    <div className="documents-panel">
      <style>{DOCS_PANEL_CSS}</style>
      {orderedGroups.map(([type, docs]) => (
        <div key={type} className="docs-group">
          <div className="docs-group-label">{TYPE_LABEL[type] || type}</div>
          {docs.map(d => (
            <button
              key={d.id}
              type="button"
              className="docs-row"
              onClick={() => onOpenPanel({
                kind: "document",
                id: d.id,
                from: { kind: "documents" },
              })}
            >
              <div className="docs-row-name">{d.filename}</div>
              {d.created_at && (
                <div className="docs-row-meta">Uploaded {formatDate(d.created_at)}</div>
              )}
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}

const DOCS_PANEL_CSS = `
  .documents-panel { color: #d4d4d8; }

  .docs-state { padding: 32px 8px; }
  .docs-state-text { font-size: 13px; color: #71717a; margin: 0; }
  .docs-state-title { font-size: 14px; color: #d4d4d8; margin: 0 0 6px; }
  .docs-state-sub { font-size: 12px; color: #71717a; margin: 0; line-height: 1.5; max-width: 420px; }
  .docs-state-error { font-size: 13px; color: #fca5a5; margin: 0; }

  .docs-group { margin-bottom: 28px; }
  .docs-group-label {
    font-size: 10px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.15em;
    color: #71717a;
    margin-bottom: 8px;
    padding: 0 4px;
  }

  .docs-row {
    display: block;
    width: 100%;
    text-align: left;
    background: none;
    border: 1px solid transparent;
    border-radius: 6px;
    padding: 10px 12px;
    margin-bottom: 4px;
    cursor: pointer;
    font-family: inherit;
    transition: all 150ms ease;
  }
  .docs-row:hover {
    background: rgba(63, 63, 70, 0.4);
    border-color: rgba(82, 82, 91, 0.5);
  }
  .docs-row-name {
    color: #e4e4e7;
    font-size: 14px;
    font-weight: 500;
    margin-bottom: 2px;
    word-break: break-word;
  }
  .docs-row-meta {
    font-size: 11px;
    color: #71717a;
  }
`;
