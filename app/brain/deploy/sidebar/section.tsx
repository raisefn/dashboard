"use client";

import { useState, type ReactNode } from "react";

/**
 * Sidebar section. Status-mirror philosophy:
 *   - EMPTY (no content, no count): dim label + arrow, STILL clickable
 *     when onTitleClick is set. Opens the panel which shows helper text.
 *   - FILLED: bright label + count + "→" — entire header is the click target.
 *   - COLLAPSIBLE: caret + optional summary in header, toggles body visibility.
 *     Mutually exclusive with onTitleClick (a collapsible section is a
 *     container, not a panel opener).
 */

interface SectionProps {
  title: string;
  count?: number | null;
  onTitleClick?: () => void;
  /** When true, header shows a caret and clicking it toggles the body. */
  collapsible?: boolean;
  /** Initial collapsed state for collapsible sections. */
  defaultCollapsed?: boolean;
  /** Small text shown in the header (e.g., "3 gaps", "Connected"). */
  summary?: string;
  children?: ReactNode;
}

export function SidebarSection({
  title,
  count,
  onTitleClick,
  collapsible = false,
  defaultCollapsed = false,
  summary,
  children,
}: SectionProps) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);

  const hasChildren = !!children && (!Array.isArray(children) || children.length > 0);
  const hasContent = hasChildren || (typeof count === "number" && count > 0);

  if (collapsible) {
    const bodyHidden = collapsed;
    return (
      <div className="sb-section">
        <button
          type="button"
          className="sb-section-header sb-section-header-clickable sb-section-header-collapsible"
          onClick={() => setCollapsed((v) => !v)}
          aria-expanded={!collapsed}
          aria-label={collapsed ? `Expand ${title}` : `Collapse ${title}`}
        >
          <span
            className="sb-section-caret"
            data-open={collapsed ? "false" : "true"}
            aria-hidden="true"
          >
            ▾
          </span>
          <span className="sb-section-title">{title}</span>
          {summary && <span className="sb-section-summary">{summary}</span>}
        </button>
        {hasChildren && !bodyHidden && (
          <div className="sb-section-body">{children}</div>
        )}
      </div>
    );
  }

  if (onTitleClick) {
    return (
      <div className="sb-section">
        <button
          type="button"
          className={`sb-section-header sb-section-header-clickable${hasContent ? "" : " sb-section-header-empty"}`}
          onClick={onTitleClick}
          aria-label={`Open ${title}`}
        >
          <span className="sb-section-title">{title}</span>
          <span className="sb-section-right">
            {typeof count === "number" && count > 0 && (
              <span className="sb-section-count">{count}</span>
            )}
            <span className="sb-section-arrow">→</span>
          </span>
        </button>
        {hasChildren && <div className="sb-section-body">{children}</div>}
      </div>
    );
  }

  return (
    <div className="sb-section">
      <div className={`sb-section-header${hasContent ? "" : " sb-section-header-empty"}`}>
        <span className="sb-section-title">{title}</span>
        {typeof count === "number" && count > 0 && (
          <span className="sb-section-count">{count}</span>
        )}
      </div>
      {hasChildren && <div className="sb-section-body">{children}</div>}
    </div>
  );
}
