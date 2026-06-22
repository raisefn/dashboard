/**
 * Agent UI — plan card + execution panel + approval gates + per-step retry.
 *
 * Phase 2 dashboard surface for the brain agent loop (commit `8aec579`).
 * Pure imperative DOM construction in the style of renderMatchesPanel
 * (page.tsx:221) — no React, integrates cleanly with the existing chat
 * content rendering.
 *
 * Locked design decisions are in brain-1/.claude/plans/agent_ui_dashboard.md.
 * Backend deltas this depends on:
 *   - SSE event `agent_plan` after plan_my_raise tool result
 *   - POST /v1/brain/agent/execute (SSE)
 *   - POST /v1/brain/agent/approve
 *   - POST /v1/brain/agent/plans/{id}/retry-step
 *   - GET  /v1/brain/agent/plans/{id}/status
 */

const ACTIVE_PLAN_LS_KEY = "raisefn_active_plan_id";
const TERMINAL_STATUSES = new Set(["complete", "abandoned"]);

interface Session {
  access_token: string;
  user: { email?: string | null };
}

export interface AgentPlanStep {
  id: string;
  step_type: string;
  target?: string | null;
  /** Brain-resolved display name for `target` (e.g. "Travis Lindsay (Titan Angels)" not "travis-lindsay-titan-angels"). Falls back to title-cased slug. */
  target_display?: string | null;
  description?: string;
  requires_approval?: boolean;
  est_minutes?: number;
  // Set during execution
  status?: "pending" | "executing" | "complete" | "skipped" | "failed";
  result?: { output_text?: string; metadata?: Record<string, unknown> } | null;
  error?: string | null;
  approval_status?: "approved" | "skipped" | null;
}

export interface AgentPlanData {
  plan_id: string;
  status: string;
  rationale?: string;
  step_count: number;
  approval_count: number;
  estimated_total_minutes: number;
  steps: AgentPlanStep[];
}

interface ExecutionState {
  planId: string;
  // Map from step.id → its DOM row, for live updates
  stepRows: Map<string, HTMLElement>;
  controller: AbortController | null;
  panelEl: HTMLElement;
  executeBtn: HTMLButtonElement | null;
  footerEl: HTMLElement;
  /** Steps as we know them; mutated live as SSE events arrive. */
  steps: AgentPlanStep[];
}

// ─────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────

/**
 * Render the agent plan card inline beneath an assistant message.
 * Wires Execute button to begin streaming execution into the same panel.
 *
 * Also bumps the parent .message.assistant max-width so the card has
 * room to breathe (default chat bubble caps at 65%, too cramped for
 * a structured 5-step plan with rationale + descriptions).
 */
export function renderAgentPlanPanel(
  data: AgentPlanData,
  contentEl: HTMLElement,
  session: Session | null,
): void {
  if (!session) return;
  const panel = buildPlanPanel(data, session);
  const messageEl = contentEl.parentElement;
  messageEl?.appendChild(panel);
  // Override the default 65% cap so the plan card can use more horizontal
  // space. Targets the panel-carrying message bubble only.
  if (messageEl) {
    messageEl.style.maxWidth = "92%";
    messageEl.style.width = "92%";
  }
}

/**
 * On page load, check localStorage for an in-progress plan and resume
 * its execution panel from /plans/{id}/status. Called once when the
 * chat page mounts (when there's a known active plan).
 *
 * Returns true if a panel was rendered (resume happened).
 */
export async function maybeResumeActivePlan(
  appendContentEl: () => HTMLElement,
  session: Session | null,
): Promise<boolean> {
  if (!session) return false;
  let planId: string | null = null;
  try {
    planId = localStorage.getItem(ACTIVE_PLAN_LS_KEY);
  } catch {
    return false;
  }
  if (!planId) return false;

  const status = await fetchPlanStatus(planId, session);
  if (!status) {
    clearActivePlan();
    return false;
  }
  if (TERMINAL_STATUSES.has(status.status)) {
    clearActivePlan();
    return false;
  }

  // Rehydrate a panel + drop into the chat.
  const contentEl = appendContentEl();
  const planData: AgentPlanData = {
    plan_id: status.plan_id,
    status: status.status,
    rationale: status.rationale,
    step_count: status.step_summaries.length,
    approval_count: status.step_summaries.filter((s: AgentPlanStep) => s.requires_approval).length,
    estimated_total_minutes: 0,
    steps: status.step_summaries,
  };
  const panel = buildPlanPanel(planData, session);
  contentEl.parentElement?.appendChild(panel);

  // If brain says still executing/paused, re-open SSE stream — executor
  // will replay from where it left off (status='paused' is resumable).
  if (status.status === "executing" || status.status === "paused" || status.status === "approved") {
    const state = (panel as HTMLElement & { __agentState?: ExecutionState }).__agentState;
    if (state) {
      void startExecution(state, session);
    }
  }
  return true;
}

// ─────────────────────────────────────────────────────────────
// DOM construction
// ─────────────────────────────────────────────────────────────

function buildPlanPanel(data: AgentPlanData, session: Session): HTMLElement {
  const panel = document.createElement("div");
  panel.className = "agent-plan-panel";
  panel.style.cssText = [
    "margin: 20px 0 4px 0",
    "padding: 16px 18px",
    "background: rgba(24, 24, 27, 0.6)",
    "border: 1px solid #3f3f46",
    "border-radius: 8px",
    "font-family: inherit",
  ].join("; ");

  // Header: title + meta
  const header = document.createElement("div");
  header.style.cssText = "display: flex; align-items: baseline; justify-content: space-between; gap: 12px; margin-bottom: 10px;";

  const title = document.createElement("div");
  title.innerHTML = `<span style="font-size: 13px; font-weight: 600; color: #f4f4f5;">Plan</span>`;
  header.appendChild(title);

  const meta = document.createElement("div");
  meta.style.cssText = "font-size: 11px; color: #71717a; letter-spacing: 0.02em;";
  meta.textContent = formatPlanMeta(data);
  header.appendChild(meta);
  panel.appendChild(header);

  // Rationale (if present)
  if (data.rationale) {
    const rationale = document.createElement("div");
    rationale.style.cssText = "font-size: 13px; color: #d4d4d8; line-height: 1.5; margin-bottom: 14px; padding: 10px 12px; background: rgba(9, 9, 11, 0.5); border-left: 2px solid #52525b; border-radius: 4px;";
    rationale.textContent = data.rationale;
    panel.appendChild(rationale);
  }

  // Split into action steps (numbered + executed) and advice steps
  // (rendered separately as a "Discussion" callout). Advice steps are
  // strategic questions the planner surfaces — same shape as action
  // steps in the DB and executor, but visually distinct so the founder
  // doesn't read them as "checkbox to tick" alongside actions.
  const actionSteps = data.steps.filter((s) => s.step_type !== "advice");
  const adviceSteps = data.steps.filter((s) => s.step_type === "advice");

  const stepsList = document.createElement("div");
  stepsList.style.cssText = "display: flex; flex-direction: column; gap: 6px;";
  const stepRows = new Map<string, HTMLElement>();
  actionSteps.forEach((step, idx) => {
    const row = buildStepRow(step, idx + 1);
    stepRows.set(step.id, row);
    stepsList.appendChild(row);
  });
  panel.appendChild(stepsList);

  // Advice callout — only renders if planner included any advice steps.
  if (adviceSteps.length > 0) {
    const adviceSection = document.createElement("div");
    adviceSection.style.cssText = "margin-top: 16px; padding-top: 14px; border-top: 1px dashed #3f3f46;";
    const heading = document.createElement("div");
    heading.textContent = adviceSteps.length === 1 ? "Strategic question to think through" : "Strategic questions to think through";
    heading.style.cssText = "font-size: 11px; font-weight: 600; color: #a1a1aa; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 8px;";
    adviceSection.appendChild(heading);
    adviceSteps.forEach((step) => {
      const row = buildAdviceCallout(step);
      stepRows.set(step.id, row);
      adviceSection.appendChild(row);
    });
    panel.appendChild(adviceSection);
  }

  // Footer: action buttons (Execute + Discard) — replaced by execution footer once running
  const footer = document.createElement("div");
  footer.className = "agent-plan-footer";
  footer.style.cssText = "display: flex; align-items: center; gap: 8px; margin-top: 14px; padding-top: 12px; border-top: 1px solid #27272a;";
  panel.appendChild(footer);

  const state: ExecutionState = {
    planId: data.plan_id,
    stepRows,
    controller: null,
    panelEl: panel,
    executeBtn: null,
    footerEl: footer,
    steps: [...data.steps],
  };
  // Attach state to DOM so resume can grab it
  (panel as HTMLElement & { __agentState?: ExecutionState }).__agentState = state;

  renderInitialFooter(state, session, data);
  return panel;
}

function renderInitialFooter(state: ExecutionState, session: Session, data: AgentPlanData): void {
  state.footerEl.innerHTML = "";

  const executeBtn = document.createElement("button");
  executeBtn.type = "button";
  executeBtn.textContent = data.approval_count > 0
    ? `Execute (${data.approval_count} approval${data.approval_count === 1 ? "" : "s"} along the way)`
    : "Execute plan";
  executeBtn.style.cssText = primaryBtnStyle();
  executeBtn.onmouseenter = () => { executeBtn.style.backgroundColor = "#3f3f46"; };
  executeBtn.onmouseleave = () => { executeBtn.style.backgroundColor = "#27272a"; };
  executeBtn.onclick = () => { void startExecution(state, session); };
  state.executeBtn = executeBtn;
  state.footerEl.appendChild(executeBtn);

  const discardBtn = document.createElement("button");
  discardBtn.type = "button";
  discardBtn.textContent = "Dismiss";
  discardBtn.style.cssText = secondaryBtnStyle();
  discardBtn.onmouseenter = () => { discardBtn.style.color = "#e4e4e7"; };
  discardBtn.onmouseleave = () => { discardBtn.style.color = "#71717a"; };
  discardBtn.onclick = () => {
    // V1: client-side dismiss only — plan stays in 'draft' status in DB.
    state.panelEl.style.opacity = "0.5";
    state.panelEl.style.pointerEvents = "none";
  };
  state.footerEl.appendChild(discardBtn);
}

function buildStepRow(step: AgentPlanStep, n: number): HTMLElement {
  const row = document.createElement("div");
  row.dataset.stepId = step.id;
  // Approval-gated rows get a distinct tint + amber left border so the
  // founder can see at a glance which steps will pause for their review.
  const baseBg = step.requires_approval ? "rgba(202, 138, 4, 0.06)" : "rgba(9, 9, 11, 0.4)";
  const baseBorder = step.requires_approval ? "1px solid rgba(202, 138, 4, 0.35)" : "1px solid #27272a";
  const leftAccent = step.requires_approval ? "border-left: 3px solid #facc15;" : "";
  row.style.cssText = `display: flex; align-items: flex-start; gap: 10px; padding: 10px 12px; background: ${baseBg}; border: ${baseBorder}; ${leftAccent} border-radius: 6px; font-size: 13px;`;

  // Status icon column
  const icon = document.createElement("div");
  icon.className = "step-icon";
  icon.style.cssText = "flex: 0 0 18px; height: 18px; display: flex; align-items: center; justify-content: center; margin-top: 1px; color: #71717a; font-size: 12px;";
  row.appendChild(icon);
  renderStatusIcon(icon, step.status);

  // Number + content
  const main = document.createElement("div");
  main.style.cssText = "flex: 1; min-width: 0;";

  const head = document.createElement("div");
  head.style.cssText = "display: flex; align-items: baseline; gap: 10px; flex-wrap: wrap;";
  const num = document.createElement("span");
  num.textContent = `${n}.`;
  num.style.cssText = "color: #71717a; font-weight: 500; flex: 0 0 auto;";
  head.appendChild(num);
  // step_type badge intentionally dropped — internal taxonomy that adds
  // visual noise without informing the founder. The description carries
  // the verb; the row's left-accent + tint signal "needs approval."
  const displayName = step.target_display ?? step.target;
  if (displayName) {
    const target = document.createElement("span");
    target.textContent = displayName;
    target.style.cssText = "color: #e4e4e7; font-size: 13px; font-weight: 500;";
    head.appendChild(target);
  }
  if (step.requires_approval) {
    const badge = document.createElement("span");
    badge.textContent = "you'll review before this fires";
    badge.style.cssText = "font-size: 11px; color: #facc15; font-weight: 500;";
    head.appendChild(badge);
  }
  if (step.est_minutes) {
    const est = document.createElement("span");
    est.textContent = `~${step.est_minutes}m`;
    est.style.cssText = "color: #52525b; font-size: 11px; margin-left: auto;";
    head.appendChild(est);
  }
  main.appendChild(head);

  const desc = document.createElement("div");
  desc.style.cssText = "color: #d4d4d8; margin-top: 4px; line-height: 1.5;";
  desc.textContent = step.description ?? "";
  main.appendChild(desc);

  // Result block (hidden until step has output)
  const resultEl = document.createElement("div");
  resultEl.className = "step-result";
  resultEl.style.cssText = "display: none; margin-top: 8px; padding: 8px 10px; background: rgba(9, 9, 11, 0.6); border-radius: 4px; font-size: 12px; color: #d4d4d8; white-space: pre-wrap; line-height: 1.5;";
  main.appendChild(resultEl);
  if (step.result?.output_text) {
    resultEl.textContent = step.result.output_text;
    resultEl.style.display = "block";
  }

  // Inline action area (approval buttons / retry button injected here)
  const actionEl = document.createElement("div");
  actionEl.className = "step-action";
  actionEl.style.cssText = "margin-top: 8px; display: flex; gap: 6px;";
  main.appendChild(actionEl);
  if (step.status === "failed" && step.error) {
    const err = document.createElement("div");
    err.style.cssText = "margin-top: 6px; padding: 6px 8px; background: rgba(220, 38, 38, 0.1); color: #fca5a5; border-radius: 4px; font-size: 11px;";
    err.textContent = step.error;
    main.appendChild(err);
  }

  row.appendChild(main);
  return row;
}

function buildAdviceCallout(step: AgentPlanStep): HTMLElement {
  const callout = document.createElement("div");
  callout.dataset.stepId = step.id;
  callout.style.cssText = "padding: 12px 14px; background: rgba(45, 212, 191, 0.04); border: 1px solid rgba(45, 212, 191, 0.2); border-left: 3px solid #2dd4bf; border-radius: 6px; font-size: 13px; margin-bottom: 6px;";

  const desc = document.createElement("div");
  desc.style.cssText = "color: #d4d4d8; line-height: 1.55;";
  desc.textContent = step.description ?? "";
  callout.appendChild(desc);

  // Result block (hidden until step has output). Advice "executes" by
  // returning the planner-authored description as output_text, so this
  // typically only fills in for short descriptions that needed expansion.
  const resultEl = document.createElement("div");
  resultEl.className = "step-result";
  resultEl.style.cssText = "display: none; margin-top: 8px; padding: 8px 10px; background: rgba(9, 9, 11, 0.4); border-radius: 4px; font-size: 12px; color: #d4d4d8; white-space: pre-wrap; line-height: 1.5;";
  callout.appendChild(resultEl);
  if (step.result?.output_text && step.result.output_text !== step.description) {
    resultEl.textContent = step.result.output_text;
    resultEl.style.display = "block";
  }

  // step-icon stub so handleExecutorEvent's selectors don't error on advice
  // steps. We don't render the icon for advice — the callout styling is
  // its visual treatment — but the slot needs to exist.
  const iconStub = document.createElement("span");
  iconStub.className = "step-icon";
  iconStub.style.display = "none";
  callout.appendChild(iconStub);

  // Same with step-action: retry on failure should still work for advice.
  const actionEl = document.createElement("div");
  actionEl.className = "step-action";
  actionEl.style.cssText = "margin-top: 8px; display: flex; gap: 6px;";
  callout.appendChild(actionEl);

  return callout;
}

function renderStatusIcon(iconEl: HTMLElement, status?: AgentPlanStep["status"]): void {
  if (status === "complete") {
    iconEl.innerHTML = `<span style="color: #4ade80;">✓</span>`;
  } else if (status === "skipped") {
    iconEl.innerHTML = `<span style="color: #71717a;">⤳</span>`;
  } else if (status === "failed") {
    iconEl.innerHTML = `<span style="color: #f87171;">✗</span>`;
  } else if (status === "executing") {
    iconEl.innerHTML = `<span class="agent-spinner" style="display: inline-block; width: 10px; height: 10px; border: 1.5px solid #52525b; border-top-color: #d4d4d8; border-radius: 50%; animation: agent-spin 0.8s linear infinite;"></span>`;
  } else {
    iconEl.innerHTML = `<span style="color: #52525b;">○</span>`;
  }
}

// ─────────────────────────────────────────────────────────────
// SSE execution stream
// ─────────────────────────────────────────────────────────────

async function startExecution(state: ExecutionState, session: Session): Promise<void> {
  if (state.controller) {
    // Already streaming
    return;
  }
  setActivePlan(state.planId);

  // Footer → executing
  state.footerEl.innerHTML = "";
  const cancelBtn = document.createElement("button");
  cancelBtn.type = "button";
  cancelBtn.textContent = "Stop";
  cancelBtn.style.cssText = secondaryBtnStyle();
  cancelBtn.onclick = () => {
    state.controller?.abort();
  };
  state.footerEl.appendChild(cancelBtn);

  const liveStatus = document.createElement("div");
  liveStatus.style.cssText = "font-size: 11px; color: #71717a; margin-left: auto;";
  liveStatus.textContent = "Starting…";
  state.footerEl.appendChild(liveStatus);

  const controller = new AbortController();
  state.controller = controller;

  try {
    const res = await fetch("/v1/brain/agent/execute", {
      method: "POST",
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ plan_id: state.planId }),
    });
    if (!res.ok || !res.body) {
      liveStatus.textContent = `Error: HTTP ${res.status}`;
      liveStatus.style.color = "#f87171";
      return;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buf = "";
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += decoder.decode(value, { stream: true });
      const lines = buf.split("\n");
      buf = lines.pop() ?? "";
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith("data: ")) continue;
        try {
          const event = JSON.parse(trimmed.slice(6));
          handleExecutorEvent(event, state, session, liveStatus);
        } catch {
          /* ignore parse errors */
        }
      }
    }
  } catch (err) {
    if ((err as Error).name === "AbortError") {
      liveStatus.textContent = "Stopped";
    } else {
      liveStatus.textContent = `Stream error: ${(err as Error).message}`;
      liveStatus.style.color = "#f87171";
    }
  } finally {
    state.controller = null;
  }
}

function handleExecutorEvent(
  event: Record<string, unknown>,
  state: ExecutionState,
  session: Session,
  liveStatus: HTMLElement,
): void {
  const type = event.type as string;

  if (type === "plan_start") {
    liveStatus.textContent = `Executing ${event.step_count ?? "?"} steps…`;
    return;
  }
  if (type === "step_start") {
    const row = state.stepRows.get(event.step_id as string);
    const localStep = state.steps.find((s) => s.id === event.step_id);
    if (localStep) localStep.status = "executing";
    if (row) {
      const icon = row.querySelector(".step-icon") as HTMLElement | null;
      if (icon) renderStatusIcon(icon, "executing");
    }
    liveStatus.textContent = `Step ${(event.step_index as number) + 1}: ${event.step_type as string}`;
    return;
  }
  if (type === "step_complete") {
    const row = state.stepRows.get(event.step_id as string);
    const localStep = state.steps.find((s) => s.id === event.step_id);
    if (localStep) localStep.status = event.skipped ? "skipped" : "complete";
    if (row) {
      const icon = row.querySelector(".step-icon") as HTMLElement | null;
      if (icon) renderStatusIcon(icon, event.skipped ? "skipped" : "complete");
      // For advice steps, output_text is usually a passthrough of the
      // description (planner-authored). Don't duplicate it in the result
      // block — the callout already shows the description.
      const output = event.output_text as string | undefined;
      if (output && (!localStep || output !== localStep.description)) {
        const resultEl = row.querySelector(".step-result") as HTMLElement | null;
        if (resultEl) {
          resultEl.textContent = output;
          resultEl.style.display = "block";
        }
      }
    }
    return;
  }
  if (type === "step_failed") {
    const row = state.stepRows.get(event.step_id as string);
    const localStep = state.steps.find((s) => s.id === event.step_id);
    if (localStep) {
      localStep.status = "failed";
      localStep.error = (event.error as string) ?? null;
    }
    if (row) {
      const icon = row.querySelector(".step-icon") as HTMLElement | null;
      if (icon) renderStatusIcon(icon, "failed");
      const actionEl = row.querySelector(".step-action") as HTMLElement | null;
      if (actionEl) {
        actionEl.innerHTML = "";
        const errMsg = document.createElement("div");
        errMsg.style.cssText = "font-size: 11px; color: #fca5a5; flex: 1;";
        errMsg.textContent = (event.error as string) ?? "Step failed";
        actionEl.appendChild(errMsg);
        actionEl.appendChild(buildRetryButton(event.step_id as string, state, session));
      }
    }
    return;
  }
  if (type === "approval_needed") {
    const row = state.stepRows.get(event.step_id as string);
    if (row) {
      const actionEl = row.querySelector(".step-action") as HTMLElement | null;
      if (actionEl) {
        actionEl.innerHTML = "";
        const approveBtn = document.createElement("button");
        approveBtn.textContent = "Approve";
        approveBtn.style.cssText = primaryBtnStyle();
        approveBtn.onclick = () => {
          void submitApproval(state.planId, event.step_id as string, "approved", session);
          actionEl.innerHTML = `<span style="font-size: 11px; color: #4ade80;">Approved — resuming…</span>`;
        };
        actionEl.appendChild(approveBtn);

        const skipBtn = document.createElement("button");
        skipBtn.textContent = "Skip";
        skipBtn.style.cssText = secondaryBtnStyle();
        skipBtn.onclick = () => {
          void submitApproval(state.planId, event.step_id as string, "skipped", session);
          actionEl.innerHTML = `<span style="font-size: 11px; color: #71717a;">Skipped — resuming…</span>`;
        };
        actionEl.appendChild(skipBtn);
      }
    }
    liveStatus.textContent = "Waiting for approval…";
    return;
  }
  if (type === "plan_complete") {
    liveStatus.textContent = `Done — ${event.tokens_spent ?? 0} tokens, ${event.elapsed_seconds ?? "?"}s`;
    liveStatus.style.color = "#4ade80";
    clearActivePlan();
    // Surface per-step retry on any failed step
    annotateRetryOnFailed(state, session);
    return;
  }
  if (type === "plan_paused") {
    liveStatus.textContent = `Paused: ${(event.reason as string) ?? "approval timeout"}`;
    liveStatus.style.color = "#facc15";
    // Plan still active — leave localStorage set so reload resumes
    return;
  }
  if (type === "plan_exhausted") {
    liveStatus.textContent = `Hit ${event.reason === "token_budget" ? "token" : "wall-clock"} budget — partial plan saved`;
    liveStatus.style.color = "#facc15";
    clearActivePlan();
    annotateRetryOnFailed(state, session);
    return;
  }
  if (type === "plan_abandoned") {
    liveStatus.textContent = `Abandoned: ${(event.reason as string) ?? "unknown"}`;
    liveStatus.style.color = "#f87171";
    clearActivePlan();
    return;
  }
  if (type === "error") {
    liveStatus.textContent = `Error: ${(event.message as string) ?? "unknown"}`;
    liveStatus.style.color = "#f87171";
    return;
  }
}

// ─────────────────────────────────────────────────────────────
// Approval + retry helpers
// ─────────────────────────────────────────────────────────────

async function submitApproval(
  planId: string,
  stepId: string,
  decision: "approved" | "skipped",
  session: Session,
): Promise<void> {
  try {
    await fetch("/v1/brain/agent/approve", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ plan_id: planId, step_id: stepId, decision }),
    });
  } catch {
    /* defensive; executor polls so a missed approval just times out */
  }
}

function buildRetryButton(stepId: string, state: ExecutionState, session: Session): HTMLButtonElement {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.textContent = "Retry this step";
  btn.style.cssText = secondaryBtnStyle();
  btn.onclick = async () => {
    btn.disabled = true;
    btn.textContent = "Retrying…";
    const res = await fetch(`/v1/brain/agent/plans/${state.planId}/retry-step`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ step_id: stepId }),
    });
    if (!res.ok) {
      btn.textContent = `Retry failed (HTTP ${res.status})`;
      btn.disabled = false;
      return;
    }
    // Re-render step row to pending state, then kick a new execute stream.
    const row = state.stepRows.get(stepId);
    const localStep = state.steps.find((s) => s.id === stepId);
    if (localStep) {
      localStep.status = "pending";
      localStep.error = null;
      localStep.result = null;
    }
    if (row) {
      const icon = row.querySelector(".step-icon") as HTMLElement | null;
      if (icon) renderStatusIcon(icon, "pending");
      const actionEl = row.querySelector(".step-action") as HTMLElement | null;
      if (actionEl) actionEl.innerHTML = "";
      const resultEl = row.querySelector(".step-result") as HTMLElement | null;
      if (resultEl) { resultEl.textContent = ""; resultEl.style.display = "none"; }
    }
    void startExecution(state, session);
  };
  return btn;
}

function annotateRetryOnFailed(state: ExecutionState, session: Session): void {
  for (const step of state.steps) {
    if (step.status !== "failed") continue;
    const row = state.stepRows.get(step.id);
    if (!row) continue;
    const actionEl = row.querySelector(".step-action") as HTMLElement | null;
    if (!actionEl || actionEl.querySelector("button")) continue;
    actionEl.appendChild(buildRetryButton(step.id, state, session));
  }
}

// ─────────────────────────────────────────────────────────────
// Status fetch (for resume)
// ─────────────────────────────────────────────────────────────

interface PlanStatusResponse {
  plan_id: string;
  status: string;
  tokens_spent: number;
  token_budget: number;
  elapsed_seconds: number | null;
  wall_clock_budget_seconds: number;
  rationale?: string;
  step_summaries: AgentPlanStep[];
}

async function fetchPlanStatus(planId: string, session: Session): Promise<PlanStatusResponse | null> {
  try {
    const res = await fetch(`/v1/brain/agent/plans/${planId}/status`, {
      headers: { Authorization: `Bearer ${session.access_token}` },
    });
    if (!res.ok) return null;
    return (await res.json()) as PlanStatusResponse;
  } catch {
    return null;
  }
}

// ─────────────────────────────────────────────────────────────
// Styling helpers
// ─────────────────────────────────────────────────────────────

function primaryBtnStyle(): string {
  return [
    "background: #27272a",
    "color: #f4f4f5",
    "border: 1px solid #52525b",
    "padding: 7px 14px",
    "border-radius: 6px",
    "font-family: inherit",
    "font-size: 12px",
    "font-weight: 500",
    "cursor: pointer",
    "transition: background-color 0.15s ease",
  ].join("; ");
}

function secondaryBtnStyle(): string {
  return [
    "background: transparent",
    "color: #71717a",
    "border: none",
    "padding: 7px 12px",
    "font-family: inherit",
    "font-size: 12px",
    "cursor: pointer",
    "transition: color 0.15s ease",
  ].join("; ");
}

function formatPlanMeta(data: AgentPlanData): string {
  const actionCount = data.steps.filter((s) => s.step_type !== "advice").length;
  const adviceCount = data.steps.filter((s) => s.step_type === "advice").length;
  const parts: string[] = [];
  if (actionCount > 0) parts.push(`${actionCount} action${actionCount === 1 ? "" : "s"}`);
  if (adviceCount > 0) parts.push(`${adviceCount} question${adviceCount === 1 ? "" : "s"}`);
  if (data.approval_count > 0) parts.push(`${data.approval_count} approval${data.approval_count === 1 ? "" : "s"}`);
  if (data.estimated_total_minutes > 0) parts.push(`~${data.estimated_total_minutes}m`);
  return parts.join(" · ");
}

// ─────────────────────────────────────────────────────────────
// localStorage helpers
// ─────────────────────────────────────────────────────────────

function setActivePlan(planId: string): void {
  try { localStorage.setItem(ACTIVE_PLAN_LS_KEY, planId); } catch { /* private browsing */ }
}

function clearActivePlan(): void {
  try { localStorage.removeItem(ACTIVE_PLAN_LS_KEY); } catch { /* private browsing */ }
}

// ─────────────────────────────────────────────────────────────
// Inject spinner keyframes once (lives in the parent stylesheet's CSS budget)
// ─────────────────────────────────────────────────────────────

if (typeof window !== "undefined") {
  const STYLE_ID = "agent-spinner-keyframes";
  if (!document.getElementById(STYLE_ID)) {
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = "@keyframes agent-spin { to { transform: rotate(360deg); } }";
    document.head.appendChild(style);
  }
}
