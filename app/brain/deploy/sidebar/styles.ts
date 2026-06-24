// Sidebar CSS — locked to phase_2_design_language.md tokens.
// Inlined so the sidebar renders the same in dev + prod without depending
// on Tailwind config OR risking class-name collisions with the chat surface.

export const SIDEBAR_CSS = `
.founder-sidebar {
  background: rgba(24, 24, 27, 0.6);
  border-right: 1px solid #27272a;
  width: 260px;
  flex-shrink: 0;
  overflow-y: auto;
  padding: 16px 0;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  color: #d4d4d8;
}

@media (max-width: 768px) {
  .founder-sidebar {
    position: fixed;
    top: 56px;
    left: 0;
    bottom: 0;
    z-index: 60;
    transform: translateX(-100%);
    transition: transform 300ms cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 0 24px rgba(0, 0, 0, 0.6);
  }
  .founder-sidebar.open {
    transform: translateX(0);
  }
}

.sb-section {
  padding: 0 8px;
  margin-bottom: 20px;
}

/* Header shared base — same shape regardless of empty/filled. */
.sb-section-header {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: none;
  border: none;
  font-family: inherit;
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  text-align: left;
  color: #71717a;
  transition: color 150ms ease, background 150ms ease;
  border-radius: 6px;
}

/* Empty: dim, not clickable. */
.sb-section-header-empty {
  color: #52525b;
  cursor: default;
}

/* Clickable (filled with onTitleClick): bright + hover + arrow. */
.sb-section-header-clickable {
  color: #e4e4e7;
  cursor: pointer;
}
.sb-section-header-clickable:hover {
  background: rgba(63, 63, 70, 0.4);
  color: #f4f4f5;
}
.sb-section-header-clickable:hover .sb-section-arrow {
  color: #5eead4;
  transform: translateX(2px);
}

.sb-section-title {
  flex: 1;
}

.sb-section-right {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.sb-section-arrow {
  font-size: 12px;
  color: #2dd4bf;
  transition: transform 150ms ease, color 150ms ease;
  display: inline-block;
}

.sb-section-count {
  font-size: 11px;
  font-weight: 500;
  color: #d4d4d8;
  background: #27272a;
  padding: 2px 8px;
  border-radius: 999px;
  text-transform: none;
  letter-spacing: 0;
}

.sb-section-body {
  padding: 6px 4px 0;
}

/* MY RAISE — single-line summary, hover-glow button */
.sb-my-raise {
  width: 100%;
  text-align: left;
  background: none;
  border: 1px solid transparent;
  border-radius: 6px;
  padding: 6px 12px;
  cursor: pointer;
  font-family: inherit;
  transition: all 150ms ease;
}
.sb-my-raise:hover {
  background: rgba(45, 212, 191, 0.04);
  border-color: rgba(45, 212, 191, 0.15);
}
.sb-my-raise-line {
  color: #e4e4e7;
  font-size: 13px;
  font-weight: 500;
  line-height: 1.4;
}
.sb-my-raise-status {
  color: #a1a1aa;
  font-weight: 400;
}

/* Generic row — used by pipeline, briefs, documents, activity */
.sb-row {
  display: block;
  width: 100%;
  text-align: left;
  background: none;
  border: none;
  border-radius: 6px;
  padding: 7px 12px;
  margin-bottom: 1px;
  cursor: pointer;
  font-family: inherit;
  transition: background 150ms ease;
  text-decoration: none;
}
.sb-row:hover {
  background: rgba(45, 212, 191, 0.04);
}
.sb-row-static {
  cursor: default;
}
.sb-row-static:hover {
  background: none;
}
.sb-row-link {
  display: block;
}
.sb-row-line1 {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 2px;
}
.sb-row-name {
  flex: 1;
  color: #d4d4d8;
  font-size: 13px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.sb-row:hover .sb-row-name {
  color: #f4f4f5;
}
.sb-row-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
  background: #52525b;
}
.sb-row-dot.status-warm { background: #2dd4bf; box-shadow: 0 0 6px rgba(45, 212, 191, 0.5); }
.sb-row-dot.status-active { background: #fdba74; }
.sb-row-dot.status-cool { background: #71717a; }
.sb-row-dot.status-cold { background: #52525b; }
.sb-row-age {
  font-size: 11px;
  color: #71717a;
  flex-shrink: 0;
}
.sb-row-line2 {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: #71717a;
  line-height: 1.4;
}
.sb-row-secondary {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.sb-row-sep {
  color: #3f3f46;
}

.sb-overflow {
  display: block;
  width: 100%;
  background: none;
  border: none;
  color: #71717a;
  font-family: inherit;
  font-size: 12px;
  padding: 8px 12px;
  cursor: pointer;
  text-align: left;
  text-decoration: none;
  transition: color 150ms ease;
}
.sb-overflow:hover {
  color: #a1a1aa;
}

/* MATCHES summary block */
.sb-matches-summary {
  padding: 4px 12px 8px;
}
.sb-matches-line1 {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #d4d4d8;
  margin-bottom: 6px;
}
.sb-matches-count {
  color: #f4f4f5;
  font-weight: 500;
}
.sb-matches-sep {
  color: #3f3f46;
}
.sb-matches-batches {
  color: #71717a;
  font-size: 11px;
}

/* Admin "Acting as" header */
.sb-admin-header {
  padding: 0 16px 16px;
  margin: 0 0 8px;
  border-bottom: 1px solid #27272a;
}
.sb-admin-label {
  display: block;
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  color: #f97316;
  margin-bottom: 6px;
}
.sb-admin-select {
  width: 100%;
  background: rgba(24, 24, 27, 0.6);
  border: 1px solid #3f3f46;
  color: #e4e4e7;
  padding: 6px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-family: inherit;
  outline: none;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%2352525b' viewBox='0 0 16 16'%3E%3Cpath d='M8 11L3 6h10z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 8px center;
  padding-right: 24px;
  cursor: pointer;
  transition: border-color 0.2s;
}
.sb-admin-select:focus {
  border-color: #f97316;
}
.sb-admin-select option {
  background: #18181b;
  color: #e4e4e7;
}
.sb-admin-clear {
  display: block;
  margin-top: 6px;
  background: none;
  border: none;
  color: #71717a;
  font-size: 11px;
  font-family: inherit;
  cursor: pointer;
  padding: 2px 0;
  transition: color 150ms ease;
}
.sb-admin-clear:hover {
  color: #a1a1aa;
}

/* PIPELINE filter pills */
.sb-pipeline-filters {
  display: flex;
  gap: 4px;
  padding: 4px 12px 10px;
  border-bottom: 1px solid rgba(39, 39, 42, 0.5);
  margin-bottom: 4px;
}
.sb-pipeline-filter {
  background: none;
  border: 1px solid transparent;
  color: #71717a;
  font-family: inherit;
  font-size: 11px;
  padding: 3px 9px;
  border-radius: 999px;
  cursor: pointer;
  transition: all 150ms ease;
}
.sb-pipeline-filter:hover {
  color: #d4d4d8;
  background: rgba(45, 212, 191, 0.04);
}
.sb-pipeline-filter.active {
  background: rgba(45, 212, 191, 0.1);
  border-color: rgba(45, 212, 191, 0.25);
  color: #2dd4bf;
}
.sb-pipeline-list {
  max-height: 480px;
  overflow-y: auto;
}

/* CONNECTIONS */
.sb-connections {
  padding: 4px 4px 0;
}
.sb-conn-row {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 7px 12px;
  background: none;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-family: inherit;
  transition: background 150ms ease;
}
.sb-conn-deck:hover {
  background: rgba(45, 212, 191, 0.04);
}
.sb-conn-disabled {
  cursor: not-allowed;
  opacity: 0.55;
}
.sb-conn-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #3f3f46;
  flex-shrink: 0;
}
.sb-conn-dot.on {
  background: #2dd4bf;
  box-shadow: 0 0 6px rgba(45, 212, 191, 0.5);
}
.sb-conn-label {
  flex: 1;
  text-align: left;
  font-size: 13px;
  color: #d4d4d8;
}
.sb-conn-status {
  font-size: 11px;
  color: #71717a;
}

/* Sharpen sidebar rows — same shape as connections rows but clickable */
.sb-sharpen-row {
  background: none;
  border: none;
  font-family: inherit;
  cursor: pointer;
  width: 100%;
  text-align: left;
  transition: background 150ms ease;
  border-radius: 6px;
}
.sb-sharpen-row:hover {
  background: rgba(63, 63, 70, 0.3);
}
.sb-sharpen-status {
  text-transform: uppercase;
  font-size: 10px;
  letter-spacing: 0.1em;
  font-weight: 600;
}
.sb-sharpen-status[data-status="strong"] { color: #2dd4bf; }
.sb-sharpen-status[data-status="solid"] { color: #34d399; }
.sb-sharpen-status[data-status="gap"] { color: #fbbf24; }
.sb-sharpen-status[data-status="empty"] { color: #52525b; }
`;
