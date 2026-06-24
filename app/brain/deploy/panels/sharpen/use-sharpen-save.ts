"use client";

import { useState } from "react";
import type { Session } from "@supabase/supabase-js";

export function useSharpenSave(session: Session | null, impersonating: string) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save(sectionId: string, fields: Record<string, unknown>) {
    if (!session) return false;
    setSaving(true);
    setError(null);
    try {
      const headers: Record<string, string> = {
        Authorization: `Bearer ${session.access_token}`,
        "Content-Type": "application/json",
      };
      if (impersonating) headers["X-Impersonate"] = impersonating;
      const res = await fetch(`/v1/brain/sharpen/section/${sectionId}`, {
        method: "PUT",
        headers,
        body: JSON.stringify(fields),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.detail || `Save failed (${res.status})`);
      }
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed.");
      return false;
    } finally {
      setSaving(false);
    }
  }

  return { save, saving, error };
}

export interface SuggestResult {
  suggestions: Record<string, string>;
  message?: string;
  doc_count?: number;
}

export function useSharpenSuggest(session: Session | null, impersonating: string) {
  const [suggesting, setSuggesting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function suggest(sectionId: string): Promise<SuggestResult | null> {
    if (!session) return null;
    setSuggesting(true);
    setError(null);
    try {
      const headers: Record<string, string> = {
        Authorization: `Bearer ${session.access_token}`,
        "Content-Type": "application/json",
      };
      if (impersonating) headers["X-Impersonate"] = impersonating;
      const res = await fetch(`/v1/brain/sharpen/section/${sectionId}/suggest`, {
        method: "POST",
        headers,
        body: JSON.stringify({}),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.detail || `Suggest failed (${res.status})`);
      }
      const data = await res.json();
      return {
        suggestions: data.suggestions || {},
        message: data.message,
        doc_count: data.doc_count,
      };
    } catch (e) {
      setError(e instanceof Error ? e.message : "Suggest failed.");
      return null;
    } finally {
      setSuggesting(false);
    }
  }

  return { suggest, suggesting, error };
}

export const FORM_LABEL_CSS = `
  .sf-label {
    display: block;
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: #a1a1aa;
    margin-bottom: 6px;
  }
  .sf-input, .sf-textarea, .sf-select {
    width: 100%;
    background: rgba(24, 24, 27, 0.6);
    border: 1px solid #3f3f46;
    border-radius: 8px;
    color: #e4e4e7;
    font-family: inherit;
    font-size: 14px;
    padding: 10px 12px;
    transition: border-color 150ms ease, background 150ms ease;
  }
  .sf-textarea { min-height: 80px; resize: vertical; line-height: 1.5; }
  .sf-input:focus, .sf-textarea:focus, .sf-select:focus {
    outline: none;
    border-color: #2dd4bf;
    background: rgba(24, 24, 27, 0.9);
  }
  .sf-field { margin-bottom: 18px; }
  .sf-hint { font-size: 12px; color: #71717a; margin-top: 4px; }
  .sf-row { display: grid; gap: 18px; }
  @media (min-width: 640px) { .sf-row-2 { grid-template-columns: 1fr 1fr; } }
  .sf-actions {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-top: 8px;
    padding-top: 16px;
    border-top: 1px solid #27272a;
  }
  .sf-save {
    background: #14b8a6;
    color: #f4f4f5;
    border: 1px solid transparent;
    border-radius: 8px;
    font-family: inherit;
    font-size: 13px;
    font-weight: 600;
    padding: 8px 18px;
    cursor: pointer;
    transition: background 150ms ease;
  }
  .sf-save:hover { background: #0d9488; }
  .sf-save:disabled { opacity: 0.5; cursor: not-allowed; }
  .sf-status { font-size: 12px; color: #71717a; }
  .sf-status-saved { color: #2dd4bf; }
  .sf-status-error { color: #fca5a5; }
  .sf-current {
    background: rgba(24, 24, 27, 0.4);
    border: 1px solid #27272a;
    border-radius: 8px;
    padding: 12px 14px;
    margin-bottom: 18px;
  }
  .sf-current-label {
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.15em;
    color: #71717a;
    margin-bottom: 4px;
  }
  .sf-current-value {
    color: #e4e4e7;
    font-size: 14px;
    line-height: 1.5;
  }
  .sf-current-empty {
    color: #52525b;
    font-style: italic;
    font-size: 13px;
  }
  .sf-chat-prompt-btn {
    background: rgba(45, 212, 191, 0.08);
    border: 1px solid rgba(45, 212, 191, 0.3);
    color: #2dd4bf;
    font-family: inherit;
    font-size: 13px;
    font-weight: 500;
    padding: 8px 14px;
    border-radius: 8px;
    cursor: pointer;
    transition: all 150ms ease;
  }
  .sf-chat-prompt-btn:hover {
    background: rgba(45, 212, 191, 0.15);
    border-color: rgba(45, 212, 191, 0.5);
  }
  .sf-suggest {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 18px;
    padding: 12px 14px;
    border: 1px dashed rgba(45, 212, 191, 0.3);
    background: rgba(45, 212, 191, 0.04);
    border-radius: 8px;
  }
  .sf-suggest-btn {
    background: rgba(45, 212, 191, 0.1);
    border: 1px solid rgba(45, 212, 191, 0.4);
    color: #2dd4bf;
    font-family: inherit;
    font-size: 13px;
    font-weight: 500;
    padding: 7px 14px;
    border-radius: 6px;
    cursor: pointer;
    transition: all 150ms ease;
    white-space: nowrap;
  }
  .sf-suggest-btn:hover {
    background: rgba(45, 212, 191, 0.18);
    border-color: rgba(45, 212, 191, 0.6);
  }
  .sf-suggest-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  .sf-suggest-text {
    flex: 1;
    font-size: 12px;
    color: #a1a1aa;
    line-height: 1.4;
  }
  .sf-suggest-status {
    font-size: 12px;
    color: #71717a;
  }
  .sf-suggest-status-ok { color: #2dd4bf; }
  .sf-suggest-status-error { color: #fca5a5; }
`;
