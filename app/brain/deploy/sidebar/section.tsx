"use client";

import { useState, type ReactNode } from "react";

/**
 * Generic collapsible section shell for the founder sidebar.
 * Per phase_2_design_language.md:
 *   - Section header: text-muted, size-xs, uppercase, letterspaced
 *   - Count chip: text-default, size-sm, pill with bg #27272a
 *   - Chevron: text-faint, rotates on collapse
 *   - Items: text-default, 13px, two-line by default
 *   - Empty state: muted sentence + optional inject-prompt button
 */

interface SectionProps {
  title: string;
  count?: number | null;
  defaultOpen?: boolean;
  emptyMessage?: string;
  emptyAction?: { label: string; injectPrompt: string };
  onInjectPrompt?: (prompt: string) => void;
  children?: ReactNode;
}

export function SidebarSection({
  title,
  count,
  defaultOpen = true,
  emptyMessage,
  emptyAction,
  onInjectPrompt,
  children,
}: SectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  const hasChildren = !!children && (!Array.isArray(children) || children.length > 0);

  return (
    <div className="sb-section">
      <button
        type="button"
        className="sb-section-header"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        <span className={`sb-section-chevron${open ? " open" : ""}`}>▸</span>
        <span className="sb-section-title">{title}</span>
        {typeof count === "number" && count > 0 && (
          <span className="sb-section-count">{count}</span>
        )}
      </button>
      {open && (
        <div className="sb-section-body">
          {hasChildren ? (
            children
          ) : (
            <div className="sb-section-empty">
              {emptyMessage && <p className="sb-section-empty-msg">{emptyMessage}</p>}
              {emptyAction && onInjectPrompt && (
                <button
                  type="button"
                  className="sb-section-empty-btn"
                  onClick={() => onInjectPrompt(emptyAction.injectPrompt)}
                >
                  {emptyAction.label}
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
