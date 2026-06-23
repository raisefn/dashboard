"use client";

import { useCallback, useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { formatMarkdown } from "@/lib/format-markdown";

/**
 * Document preview panel — renders an uploaded document's extracted text.
 *
 * Decks/term sheets/contracts are stored as already-parsed text content
 * (the analyze_deck pipeline turns a PDF upload into structured markdown).
 * So this panel just renders text — no PDF binary, no react-pdf needed.
 *
 * Actions inject chat prompts; we never call destructive tools directly.
 * "Delete" routes through chat so the LLM can confirm with the founder.
 */

interface DocumentData {
  id: string;
  filename: string;
  doc_type: string;
  content: string;
  created_at: string | null;
  updated_at: string | null;
}

interface DocumentPanelProps {
  id: string;
  session: Session | null;
  impersonating: string;
  injectChatPrompt: (prompt: string) => void;
}

const TYPE_LABEL: Record<string, string> = {
  deck: "Pitch deck",
  term_sheet: "Term sheet",
  contract: "Contract",
  general: "Document",
};

function formatDateLong(iso: string | null): string {
  if (!iso) return "";
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function DocumentPanel({ id, session, impersonating, injectChatPrompt }: DocumentPanelProps) {
  const [data, setData] = useState<DocumentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!session || !id) return;
    setLoading(true);
    setError(null);
    try {
      const headers: Record<string, string> = {
        Authorization: `Bearer ${session.access_token}`,
      };
      if (impersonating) headers["X-Impersonate"] = impersonating;
      const res = await fetch(`/v1/brain/documents/${encodeURIComponent(id)}`, { headers });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.detail || `Failed to load document (${res.status})`);
      }
      const json: DocumentData = await res.json();
      setData(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load document.");
    } finally {
      setLoading(false);
    }
  }, [session, id, impersonating]);

  useEffect(() => { void load(); }, [load]);

  if (loading) {
    return (
      <div className="dp-state">
        <style>{DOCUMENT_PANEL_CSS}</style>
        <p className="dp-state-text">Loading document…</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="dp-state">
        <style>{DOCUMENT_PANEL_CSS}</style>
        <p className="dp-state-error">{error || "Document unavailable."}</p>
      </div>
    );
  }

  const typeLabel = TYPE_LABEL[data.doc_type] || "Document";
  const isDeck = data.doc_type === "deck";

  return (
    <div className="document-panel">
      <style>{DOCUMENT_PANEL_CSS}</style>

      <header className="dp-header">
        <div className="dp-meta">
          <div className="dp-filename">{data.filename}</div>
          <div className="dp-meta-line">
            <span className="dp-type">{typeLabel}</span>
            <span className="dp-sep">·</span>
            <span>Uploaded {formatDateLong(data.created_at)}</span>
          </div>
        </div>
        <div className="dp-actions">
          {isDeck && (
            <button
              type="button"
              className="dp-action"
              onClick={() => injectChatPrompt(`Take another look at my deck — anything new jump out?`)}
            >
              Re-analyze
            </button>
          )}
          <button
            type="button"
            className="dp-action dp-action-secondary"
            onClick={() => injectChatPrompt(
              isDeck
                ? `I want to replace my deck with a newer version — what should I do?`
                : `I want to replace ${data.filename} with a newer version — what should I do?`
            )}
          >
            Replace
          </button>
          <button
            type="button"
            className="dp-action dp-action-secondary"
            onClick={() => injectChatPrompt(`Delete ${data.filename} from my documents`)}
          >
            Delete
          </button>
        </div>
      </header>

      {data.content.trim().length === 0 ? (
        <div className="dp-empty">
          <p>No extracted text yet.</p>
          <p className="dp-empty-hint">
            {isDeck
              ? "Ask raise(fn) to analyze the deck — it'll parse slides into structured notes."
              : "This document hasn't been processed yet."}
          </p>
        </div>
      ) : (
        <article
          className="dp-content"
          dangerouslySetInnerHTML={{ __html: formatMarkdown(data.content) }}
        />
      )}
    </div>
  );
}

const DOCUMENT_PANEL_CSS = `
  .document-panel { color: #d4d4d8; }

  .dp-state { padding: 32px 8px; }
  .dp-state-text { font-size: 13px; color: #71717a; margin: 0; }
  .dp-state-error { font-size: 13px; color: #fca5a5; margin: 0; }

  .dp-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 24px;
    padding-bottom: 16px;
    border-bottom: 1px solid #27272a;
  }
  .dp-meta { flex: 1; min-width: 0; }
  .dp-filename {
    font-size: 18px;
    font-weight: 600;
    color: #f4f4f5;
    margin-bottom: 4px;
    word-break: break-word;
  }
  .dp-meta-line {
    display: flex;
    align-items: center;
    gap: 6px;
    flex-wrap: wrap;
    font-size: 11px;
    color: #71717a;
  }
  .dp-type {
    text-transform: uppercase;
    letter-spacing: 0.08em;
    padding: 2px 7px;
    border-radius: 999px;
    background: rgba(45, 212, 191, 0.1);
    color: #2dd4bf;
    font-size: 10px;
  }
  .dp-sep { color: #3f3f46; }

  .dp-actions {
    display: flex;
    gap: 6px;
    flex-shrink: 0;
    flex-wrap: wrap;
    justify-content: flex-end;
  }
  .dp-action {
    background: #14b8a6;
    color: #f4f4f5;
    border: 1px solid transparent;
    border-radius: 6px;
    font-family: inherit;
    font-size: 12px;
    font-weight: 500;
    padding: 6px 12px;
    cursor: pointer;
    text-decoration: none;
    transition: all 150ms ease;
  }
  .dp-action:hover { background: #0d9488; }
  .dp-action-secondary {
    background: transparent;
    color: #d4d4d8;
    border-color: #3f3f46;
  }
  .dp-action-secondary:hover {
    background: rgba(63, 63, 70, 0.4);
    border-color: #52525b;
  }

  .dp-empty {
    padding: 32px 0;
    color: #71717a;
  }
  .dp-empty p { margin: 0 0 6px; font-size: 13px; }
  .dp-empty-hint { color: #52525b; font-size: 12px; }

  .dp-content {
    color: #e4e4e7;
    font-size: 14px;
    line-height: 1.65;
  }
  .dp-content h1, .dp-content h2, .dp-content h3 {
    color: #f4f4f5;
    font-weight: 600;
    margin: 24px 0 12px;
  }
  .dp-content h1 { font-size: 22px; }
  .dp-content h2 { font-size: 18px; }
  .dp-content h3 { font-size: 15px; }
  .dp-content p { margin: 0 0 14px; }
  .dp-content strong { color: #f4f4f5; font-weight: 600; }
  .dp-content em { color: #a1a1aa; }
  .dp-content a {
    color: #2dd4bf;
    text-decoration: none;
  }
  .dp-content a:hover { text-decoration: underline; }
  .dp-content ul, .dp-content ol {
    margin: 0 0 14px;
    padding-left: 22px;
  }
  .dp-content li { margin-bottom: 4px; }
  .dp-content blockquote {
    margin: 14px 0;
    padding: 8px 16px;
    border-left: 3px solid #2dd4bf;
    color: #a1a1aa;
    font-style: italic;
  }
  .dp-content code {
    background: rgba(39, 39, 42, 0.6);
    color: #e4e4e7;
    padding: 1px 6px;
    border-radius: 4px;
    font-size: 13px;
  }
  .dp-content pre {
    background: rgba(39, 39, 42, 0.6);
    color: #e4e4e7;
    padding: 12px;
    border-radius: 6px;
    overflow-x: auto;
    font-size: 12px;
    line-height: 1.5;
  }
  .dp-content hr {
    border: 0;
    border-top: 1px solid #27272a;
    margin: 24px 0;
  }
`;
