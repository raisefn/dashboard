/**
 * Agent UI v2 — CHAT-TURN SURFACE.
 *
 * Replaces the prior plan-card panel. Plan execution renders as a
 * sequence of assistant chat bubbles. Each step's approval gate becomes
 * an inline chat turn with [Do it] / [Skip] buttons. Step results
 * render as new assistant messages.
 *
 * The card is gone. raise(fn) IS the conversation.
 *
 * Decisions (locked):
 *   - No card. The brain narrates the synthesis as its own chat turn
 *     (via PAID_SYSTEM_PROMPT rule 20). This module never renders a
 *     plan summary panel.
 *   - No Execute button. /execute auto-fires when the agent_plan event
 *     arrives. Founder doesn't have a "start" step — opening raise(fn)
 *     IS the start.
 *   - Per-step confirmation, not batch approval. Every step requires
 *     approval (planner update); each renders as a chat turn with
 *     inline action buttons.
 *
 * Backend (unchanged):
 *   - POST /v1/brain/agent/execute (SSE) — driven from this module
 *   - POST /v1/brain/agent/approve
 *   - POST /v1/brain/agent/plans/{id}/retry-step
 *   - GET  /v1/brain/agent/plans/{id}/status
 */
import { formatMarkdown } from "@/lib/format-markdown";

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
  target_display?: string | null;
  description?: string;
  requires_approval?: boolean;
  est_minutes?: number;
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

/**
 * Callback shape the chat page passes in. Creates a new assistant chat
 * bubble in the messages container and returns its `.content` element
 * for us to mutate. Required so this module never imports page.tsx
 * (circular dependency risk) or owns the chat DOM layout.
 */
export type AppendChatBubble = () => HTMLElement;

interface ExecutionState {
  planId: string;
  steps: AgentPlanStep[];
  controller: AbortController | null;
  appendBubble: AppendChatBubble;
  session: Session;
  /** DOM elements for in-flight approval bubbles, keyed by step.id, so we
   *  can swap "[Do it] / [Skip]" buttons for the result when execution moves on. */
  approvalBubbles: Map<string, HTMLElement>;
}

// ─────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────

/**
 * Called by the chat page when an `agent_plan` SSE event arrives.
 * Stores the active plan id and auto-fires execution. The brain's
 * synthesis chat turn has already rendered above this in the chat.
 */
export function renderAgentPlanPanel(
  data: AgentPlanData,
  contentEl: HTMLElement,
  session: Session | null,
  appendBubble?: AppendChatBubble,
): void {
  if (!session || !appendBubble) return;
  void contentEl; // legacy param, unused in chat-turn surface
  setActivePlan(data.plan_id);
  const state: ExecutionState = {
    planId: data.plan_id,
    steps: [...data.steps],
    controller: null,
    appendBubble,
    session,
    approvalBubbles: new Map(),
  };
  void startExecutionStream(state);
}

/**
 * On chat page mount, check for an in-progress plan and resume it.
 * Renders prior completed steps as chat bubbles + reopens the SSE
 * stream so the next pending step's approval gate appears in chat.
 */
export async function maybeResumeActivePlan(
  appendBubble: AppendChatBubble,
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
  if (!status) { clearActivePlan(); return false; }
  if (TERMINAL_STATUSES.has(status.status)) { clearActivePlan(); return false; }

  // Render prior completed steps as chat turns so the founder sees what
  // already happened. Then reopen SSE for the next pending step.
  for (const step of status.step_summaries) {
    if (step.status === "complete" && step.result?.output_text) {
      appendChatText(appendBubble, step.result.output_text);
    }
    if (step.status === "skipped") {
      appendChatText(appendBubble, `*Skipped: ${step.description ?? step.target_display ?? "step"}*`);
    }
    if (step.status === "failed") {
      appendChatText(appendBubble, `*Failed: ${step.error ?? "unknown error"}*`);
    }
  }

  // Append a "picking up where we left off" notice and reopen the stream
  appendChatText(appendBubble, "_Picking up where we left off..._");
  const state: ExecutionState = {
    planId,
    steps: status.step_summaries,
    controller: null,
    appendBubble,
    session,
    approvalBubbles: new Map(),
  };
  void startExecutionStream(state);
  return true;
}

// ─────────────────────────────────────────────────────────────
// Internal: execution stream
// ─────────────────────────────────────────────────────────────

async function startExecutionStream(state: ExecutionState): Promise<void> {
  if (state.controller) return;
  const controller = new AbortController();
  state.controller = controller;

  try {
    const res = await fetch("/v1/brain/agent/execute", {
      method: "POST",
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${state.session.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ plan_id: state.planId }),
    });
    if (!res.ok || !res.body) {
      appendChatText(state.appendBubble, `_I couldn't start execution — HTTP ${res.status}. Want me to try again?_`);
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
          handleExecutorEvent(event, state);
        } catch { /* ignore parse errors */ }
      }
    }
  } catch (err) {
    if ((err as Error).name === "AbortError") {
      appendChatText(state.appendBubble, "_Stopped._");
    } else {
      appendChatText(state.appendBubble, `_Stream error: ${(err as Error).message}_`);
    }
  } finally {
    state.controller = null;
  }
}

function handleExecutorEvent(event: Record<string, unknown>, state: ExecutionState): void {
  const type = event.type as string;

  if (type === "plan_start" || type === "step_start") {
    // No chat turn for these — they're internal milestones. The
    // approval_needed event (for steps that have it) handles user-facing
    // surface. step_complete handles the result.
    return;
  }

  if (type === "approval_needed") {
    const stepId = event.step_id as string;
    const description = (event.description as string) ?? "this step";
    const localStep = state.steps.find((s) => s.id === stepId);
    const targetName = localStep?.target_display || localStep?.target;
    const prompt = buildApprovalPromptText(description, targetName ?? null);
    const bubble = renderApprovalBubble(state, stepId, prompt);
    state.approvalBubbles.set(stepId, bubble);
    return;
  }

  if (type === "step_complete") {
    const stepId = event.step_id as string;
    const output = event.output_text as string | undefined;
    const skipped = event.skipped as boolean | undefined;
    const localStep = state.steps.find((s) => s.id === stepId);
    if (localStep) localStep.status = skipped ? "skipped" : "complete";

    // Lock the approval bubble's buttons (replace with confirmed state)
    const approvalBubble = state.approvalBubbles.get(stepId);
    if (approvalBubble) {
      finalizeApprovalBubble(approvalBubble, skipped ? "skipped" : "done");
      state.approvalBubbles.delete(stepId);
    }

    // Render the result as its own chat turn, unless it just echoes the description
    if (!skipped && output && (!localStep || output !== localStep.description)) {
      appendChatText(state.appendBubble, output);
    }
    return;
  }

  if (type === "step_failed") {
    const stepId = event.step_id as string;
    const error = (event.error as string) ?? "unknown error";
    const approvalBubble = state.approvalBubbles.get(stepId);
    if (approvalBubble) {
      finalizeApprovalBubble(approvalBubble, "failed");
      state.approvalBubbles.delete(stepId);
    }
    const bubble = state.appendBubble();
    bubble.innerHTML = `<div class="agent-md" style="font-size:13px;color:#fca5a5;">I hit an error on this step: <code class="inline-code">${escapeHtml(error)}</code></div>`;
    const retryRow = document.createElement("div");
    retryRow.style.cssText = "margin-top:8px;display:flex;gap:6px;";
    retryRow.appendChild(makeRetryButton(state, stepId));
    bubble.appendChild(retryRow);
    return;
  }

  if (type === "plan_complete") {
    clearActivePlan();
    appendChatText(state.appendBubble, "_All done. What's next?_");
    return;
  }
  if (type === "plan_paused") {
    appendChatText(state.appendBubble, "_Paused — I'll wait for your call._");
    return;
  }
  if (type === "plan_exhausted") {
    clearActivePlan();
    const reason = (event.reason as string) === "token_budget" ? "token" : "wall-clock";
    appendChatText(state.appendBubble, `_Hit the ${reason} budget for this plan. The work that ran is saved._`);
    return;
  }
  if (type === "plan_abandoned") {
    clearActivePlan();
    appendChatText(state.appendBubble, `_Plan abandoned: ${(event.reason as string) ?? "unknown"}_`);
    return;
  }
  if (type === "error") {
    appendChatText(state.appendBubble, `_Error: ${(event.message as string) ?? "unknown"}_`);
    return;
  }
}

// ─────────────────────────────────────────────────────────────
// Approval bubble rendering
// ─────────────────────────────────────────────────────────────

function buildApprovalPromptText(description: string, target: string | null): string {
  const lead = target ? `**${target}** — ${description}` : description;
  return lead;
}

function renderApprovalBubble(state: ExecutionState, stepId: string, promptText: string): HTMLElement {
  const bubble = state.appendBubble();
  bubble.classList.add("agent-md");

  const promptEl = document.createElement("div");
  promptEl.style.cssText = "font-size:13px;color:#e4e4e7;line-height:1.55;";
  promptEl.innerHTML = formatMarkdown(promptText);
  bubble.appendChild(promptEl);

  const row = document.createElement("div");
  row.style.cssText = "margin-top:10px;display:flex;gap:8px;align-items:center;";

  const doBtn = makeButton("Do it", primaryBtnStyle());
  doBtn.onclick = async () => {
    lockApprovalRow(row, "Working on it…");
    void submitApproval(state.planId, stepId, "approved", state.session);
  };
  row.appendChild(doBtn);

  const skipBtn = makeButton("Skip", secondaryBtnStyle());
  skipBtn.onclick = async () => {
    lockApprovalRow(row, "Skipped.");
    void submitApproval(state.planId, stepId, "skipped", state.session);
  };
  row.appendChild(skipBtn);

  bubble.appendChild(row);
  return bubble;
}

function finalizeApprovalBubble(bubble: HTMLElement, status: "done" | "skipped" | "failed"): void {
  // After the executor finishes (or fails) a step, swap the action row
  // with a static confirmation so the bubble reads as a closed turn.
  const row = bubble.querySelector("[data-approval-row]") as HTMLElement | null;
  const label = status === "done" ? "✓ Done" : status === "skipped" ? "Skipped" : "Failed";
  if (row) {
    row.textContent = label;
    row.style.cssText = "margin-top:8px;font-size:11px;color:#71717a;";
  }
}

function lockApprovalRow(row: HTMLElement, label: string): void {
  row.dataset.approvalRow = "1";
  row.textContent = label;
  row.style.cssText = "margin-top:8px;font-size:11px;color:#71717a;";
}

function makeRetryButton(state: ExecutionState, stepId: string): HTMLButtonElement {
  const btn = makeButton("Retry this step", secondaryBtnStyle());
  btn.onclick = async () => {
    btn.disabled = true;
    btn.textContent = "Retrying…";
    const res = await fetch(`/v1/brain/agent/plans/${state.planId}/retry-step`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${state.session.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ step_id: stepId }),
    });
    if (!res.ok) {
      btn.textContent = `Retry failed (HTTP ${res.status})`;
      btn.disabled = false;
      return;
    }
    btn.remove();
    void startExecutionStream(state);
  };
  return btn;
}

// ─────────────────────────────────────────────────────────────
// Approval submission
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
  } catch { /* executor polls so a missed approval just times out */ }
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
// Chat-bubble helpers
// ─────────────────────────────────────────────────────────────

function appendChatText(appendBubble: AppendChatBubble, markdown: string): void {
  const el = appendBubble();
  el.classList.add("agent-md");
  el.innerHTML = formatMarkdown(markdown);
}

// ─────────────────────────────────────────────────────────────
// Misc helpers
// ─────────────────────────────────────────────────────────────

function makeButton(label: string, style: string): HTMLButtonElement {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.textContent = label;
  btn.style.cssText = style;
  return btn;
}

function primaryBtnStyle(): string {
  return [
    "background:#27272a",
    "color:#f4f4f5",
    "border:1px solid #52525b",
    "padding:7px 14px",
    "border-radius:6px",
    "font-family:inherit",
    "font-size:12px",
    "font-weight:500",
    "cursor:pointer",
    "transition:background-color 0.15s ease",
  ].join(";");
}

function secondaryBtnStyle(): string {
  return [
    "background:transparent",
    "color:#71717a",
    "border:none",
    "padding:7px 12px",
    "font-family:inherit",
    "font-size:12px",
    "cursor:pointer",
    "transition:color 0.15s ease",
  ].join(";");
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function setActivePlan(planId: string): void {
  try { localStorage.setItem(ACTIVE_PLAN_LS_KEY, planId); } catch { /* private browsing */ }
}

function clearActivePlan(): void {
  try { localStorage.removeItem(ACTIVE_PLAN_LS_KEY); } catch { /* private browsing */ }
}
