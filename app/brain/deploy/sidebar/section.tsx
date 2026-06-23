"use client";

import { useState, type ReactNode } from "react";

/**
 * Sidebar section. Two states by design:
 *
 *   - EMPTY (no content): renders a dim, non-clickable label only.
 *     The sidebar is a state mirror; tutoring lives in chat. No
 *     empty-state copy, no inline CTAs.
 *
 *   - FILLED (has content): renders an interactive header. If
 *     onTitleClick is set, the title is a button that opens a
 *     slide-over panel. Chevron always toggles collapse.
 */

interface SectionProps {
  title: string;
  count?: number | null;
  defaultOpen?: boolean;
  /** When set AND the section has content, clicking the title opens
   *  a slide-over panel. Ignored when empty. */
  onTitleClick?: () => void;
  children?: ReactNode;
}

export function SidebarSection({
  title,
  count,
  defaultOpen = true,
  onTitleClick,
  children,
}: SectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  const hasChildren = !!children && (!Array.isArray(children) || children.length > 0);
  const hasContent = hasChildren || (typeof count === "number" && count > 0);

  // Empty state: dim, non-interactive label only.
  if (!hasContent) {
    return (
      <div className="sb-section sb-section-empty-state">
        <div className="sb-section-header sb-section-header-static">
          <span className="sb-section-title sb-section-title-dim">{title}</span>
        </div>
      </div>
    );
  }

  // Filled state with split-control (chevron collapse, title opens panel).
  if (onTitleClick) {
    return (
      <div className="sb-section">
        <div className="sb-section-header sb-section-header-split">
          <button
            type="button"
            className="sb-section-chevron-btn"
            onClick={() => setOpen(!open)}
            aria-expanded={open}
            aria-label={open ? `Collapse ${title}` : `Expand ${title}`}
          >
            <span className={`sb-section-chevron${open ? " open" : ""}`}>▸</span>
          </button>
          <button
            type="button"
            className="sb-section-title-btn sb-section-title-btn-active"
            onClick={onTitleClick}
            aria-label={`Open ${title}`}
          >
            <span className="sb-section-title">{title}</span>
            {typeof count === "number" && count > 0 && (
              <span className="sb-section-count">{count}</span>
            )}
            <span className="sb-section-open-hint">→</span>
          </button>
        </div>
        {open && hasChildren && (
          <div className="sb-section-body">{children}</div>
        )}
      </div>
    );
  }

  // Filled state without onTitleClick (e.g. MY RAISE, CONNECTIONS):
  // whole header toggles collapse.
  return (
    <div className="sb-section">
      <button
        type="button"
        className="sb-section-header"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        <div className="sb-section-header-text">
          <div className="sb-section-header-title-row">
            <span className={`sb-section-chevron${open ? " open" : ""}`}>▸</span>
            <span className="sb-section-title">{title}</span>
            {typeof count === "number" && count > 0 && (
              <span className="sb-section-count">{count}</span>
            )}
          </div>
        </div>
      </button>
      {open && hasChildren && (
        <div className="sb-section-body">{children}</div>
      )}
    </div>
  );
}
