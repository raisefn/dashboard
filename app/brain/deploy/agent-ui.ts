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

/**
 * Plan status strip mount point: the chat page exposes a container DIV
 * above the input area; agent-ui owns its contents. Empty when no
 * active plan, populated with "Plan: N of M done · ⏸ on X [Stop]" while
 * a plan is running.
 */
export type PlanStripMount = HTMLElement | null;

interface ExecutionState {
  planId: string;
  steps: AgentPlanStep[];
  controller: AbortController | null;
  appendBubble: AppendChatBubble;
  session: Session;
  /** DOM elements for in-flight approval bubbles, keyed by step.id, so we
   *  can swap "[Do it] / [Skip]" buttons for the result when execution moves on. */
  approvalBubbles: Map<string, HTMLElement>;
  /** Mount point for the persistent plan status strip above the chat input. */
  stripMount: PlanStripMount;
  /** id of the step currently paused awaiting approval, if any. */
  pendingApprovalStepId: string | null;
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
  stripMount?: PlanStripMount,
): void {
  if (!session || !appendBubble) return;
  void contentEl; // legacy param, unused in chat-turn surface

  // No-actionable-steps fallback: if planner returned only advice steps
  // (no work to execute, just a synthesis read), skip the executor
  // entirely. The brain's chat narration already rendered the synthesis
  // and the advice content. Don't write more.
  const actionable = data.steps.filter((s) => s.step_type !== "advice");
  if (actionable.length === 0) {
    clearActivePlan(); // no executor to track
    return;
  }

  setActivePlan(data.plan_id);
  const state: ExecutionState = {
    planId: data.plan_id,
    steps: [...data.steps],
    controller: null,
    appendBubble,
    session,
    approvalBubbles: new Map(),
    stripMount: stripMount ?? null,
    pendingApprovalStepId: null,
  };
  refreshPlanStrip(state);
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
  stripMount?: PlanStripMount,
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
    stripMount: stripMount ?? null,
    pendingApprovalStepId: null,
  };
  refreshPlanStrip(state);
  void startExecutionStream(state);
  return true;
}

/** Clear the plan strip — call from page.tsx if the page unmounts cleanly. */
export function clearPlanStrip(stripMount: PlanStripMount): void {
  if (stripMount) stripMount.innerHTML = "";
}

// ─────────────────────────────────────────────────────────────
// Internal: execution stream
// ─────────────────────────────────────────────────────────────

const MAX_RECONNECT_ATTEMPTS = 2;

async function startExecutionStream(state: ExecutionState): Promise<void> {
  if (state.controller) return;
  const controller = new AbortController();
  state.controller = controller;
  let receivedTerminalEvent = false;
  let receivedApprovalNeeded = false;

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
          const t = event.type as string;
          if (t === "plan_complete" || t === "plan_paused"
              || t === "plan_exhausted" || t === "plan_abandoned" || t === "error") {
            receivedTerminalEvent = true;
          }
          if (t === "approval_needed") {
            receivedApprovalNeeded = true;
          }
          handleExecutorEvent(event, state);
        } catch { /* ignore parse errors */ }
      }
    }
  } catch (err) {
    if ((err as Error).name === "AbortError") {
      // Founder-initiated stop — handled by the [Stop] button path
    } else {
      state.controller = null;
      void attemptReconnect(state, (err as Error).message, receivedApprovalNeeded);
      return;
    }
  } finally {
    state.controller = null;
  }

  // Stream closed. Only auto-reconnect when there's actual work for the
  // dashboard to do. If the last event was approval_needed, the executor
  // is paused on the founder's click — the bubble is already rendered;
  // a reconnect would just spam a duplicate. The next [Do it] click
  // submits approval via /approve; executor resumes; founder reloads if
  // they want a live stream of the next step.
  if (!receivedTerminalEvent && !receivedApprovalNeeded) {
    void attemptReconnect(state, "stream_closed_without_terminal_event", false);
  }
}

async function attemptReconnect(
  state: ExecutionState,
  reason: string,
  followedApprovalNeeded: boolean,
): Promise<void> {
  // Hard guard: never reconnect if we just emitted approval_needed.
  // The bubble is on screen; reconnecting would render a duplicate AND
  // hit the same approval-wait timeout in a loop.
  if (followedApprovalNeeded) return;

  state.reconnectAttempts = (state.reconnectAttempts ?? 0) + 1;
  if (state.reconnectAttempts > MAX_RECONNECT_ATTEMPTS) {
    appendChatText(state.appendBubble, `_I lost the connection (${reason}). Refresh to pick up where we left off._`);
    return;
  }

  await new Promise((r) => setTimeout(r, 2000));
  const status = await fetchPlanStatus(state.planId, state.session);
  if (!status) {
    appendChatText(state.appendBubble, `_I lost the connection (${reason}). Refresh to pick up where we left off._`);
    return;
  }
  if (TERMINAL_STATUSES.has(status.status)) {
    clearActivePlan();
    if (state.stripMount) state.stripMount.innerHTML = "";
    appendChatText(state.appendBubble, `_Plan ended (${status.status}) while we were disconnected._`);
    return;
  }
  if (status.status === "exhausted") {
    clearActivePlan();
    if (state.stripMount) state.stripMount.innerHTML = "";
    appendChatText(state.appendBubble, "_We hit the budget while we were disconnected. The work that ran is saved._");
    return;
  }
  // Paused = waiting for founder's [Do it] click. There's already an
  // approval bubble on screen. Do NOT reconnect; the next /approve POST
  // wakes the executor up.
  if (status.status === "paused") return;
  // Plan is still alive AND running — reopen the stream silently.
  appendChatText(state.appendBubble, "_Reconnecting..._");
  void startExecutionStream(state);
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
    const workingText = workingOnItText(localStep?.step_type, targetName);
    const bubble = renderApprovalBubble(state, stepId, prompt, workingText);
    state.approvalBubbles.set(stepId, bubble);
    state.pendingApprovalStepId = stepId;
    refreshPlanStrip(state);
    return;
  }

  if (type === "step_complete") {
    const stepId = event.step_id as string;
    const output = event.output_text as string | undefined;
    const skipped = event.skipped as boolean | undefined;
    const localStep = state.steps.find((s) => s.id === stepId);
    if (localStep) localStep.status = skipped ? "skipped" : "complete";
    if (state.pendingApprovalStepId === stepId) state.pendingApprovalStepId = null;
    refreshPlanStrip(state);

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
    const localStep = state.steps.find((s) => s.id === stepId);
    if (localStep) localStep.status = "failed";
    if (state.pendingApprovalStepId === stepId) state.pendingApprovalStepId = null;
    refreshPlanStrip(state);
    const bubble = state.appendBubble();
    bubble.innerHTML = `<div class="agent-md" style="font-size:13px;color:#fca5a5;">I hit an error on this step: <code class="inline-code">${escapeHtml(error)}</code></div>`;
    const retryRow = document.createElement("div");
    retryRow.style.cssText = "margin-top:8px;display:flex;gap:6px;";
    retryRow.appendChild(makeRetryButton(state, stepId));
    retryRow.appendChild(makeSkipAndContinueButton(state, stepId, retryRow));
    bubble.appendChild(retryRow);
    return;
  }

  if (type === "plan_complete") {
    clearActivePlan();
    if (state.stripMount) state.stripMount.innerHTML = "";
    void renderClosingSummary(state);
    return;
  }
  if (type === "plan_paused") {
    appendChatText(state.appendBubble, "_Paused — I'll wait for your call._");
    refreshPlanStrip(state);
    return;
  }
  if (type === "plan_exhausted") {
    clearActivePlan();
    if (state.stripMount) state.stripMount.innerHTML = "";
    renderExhaustedRecovery(state, event);
    return;
  }
  if (type === "plan_abandoned") {
    clearActivePlan();
    if (state.stripMount) state.stripMount.innerHTML = "";
    const reason = (event.reason as string) ?? "unknown";
    if (reason === "founder_stopped") {
      appendChatText(state.appendBubble, "_Stopped. What do you want to do instead?_");
    } else {
      appendChatText(state.appendBubble, `_Plan abandoned: ${reason}_`);
    }
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

function renderApprovalBubble(
  state: ExecutionState,
  stepId: string,
  promptText: string,
  workingText: string,
): HTMLElement {
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
    lockApprovalRow(row, workingText);
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

function workingOnItText(stepType?: string, target?: string | null): string {
  const t = target ? ` ${target}` : "";
  switch (stepType) {
    case "match": return "Pulling matches for you…";
    case "brief": return `Pulling a brief on${t}…`;
    case "meeting_prep": return `Prepping you for${t}…`;
    case "research": return `Researching${t}…`;
    case "deck_analysis": return "Reading your deck…";
    case "term_analysis": return "Reading the terms…";
    case "signal_read": return `Reading the signals on${t}…`;
    case "pipeline_update": return `Updating your pipeline${target ? ` for${t}` : ""}…`;
    case "followup_check": return `Checking status on${t}…`;
    case "draft_email": return `Drafting the email${target ? ` to${t}` : ""}…`;
    case "draft_message": return `Drafting the message${target ? ` to${t}` : ""}…`;
    case "advice": return "Thinking this through with you…";
    default: return "Working on it…";
  }
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

function makeSkipAndContinueButton(state: ExecutionState, stepId: string, row: HTMLElement): HTMLButtonElement {
  const btn = makeButton("Skip and continue", secondaryBtnStyle());
  btn.onclick = async () => {
    btn.disabled = true;
    btn.textContent = "Skipping…";
    // Mark the step skipped via the retry-step + immediate-skip-approval pattern:
    // retry-step resets the step to 'pending', then we submit a skip approval,
    // then resume execution which will hit the skipped step's approval (already
    // set) and move on.
    const reset = await fetch(`/v1/brain/agent/plans/${state.planId}/retry-step`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${state.session.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ step_id: stepId }),
    });
    if (!reset.ok) {
      btn.textContent = `Skip failed (HTTP ${reset.status})`;
      btn.disabled = false;
      return;
    }
    await submitApproval(state.planId, stepId, "skipped", state.session);
    row.remove();
    void startExecutionStream(state);
  };
  return btn;
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

/**
 * Render the persistent plan status strip above the chat input.
 * "Plan: 2 of 5 done · ⏸ on Travis follow-up · [Stop]"
 * Hidden when no plan or plan terminal.
 */
function refreshPlanStrip(state: ExecutionState): void {
  if (!state.stripMount) return;
  const total = state.steps.length;
  const done = state.steps.filter((s) => s.status === "complete" || s.status === "skipped").length;
  const pendingStep = state.pendingApprovalStepId
    ? state.steps.find((s) => s.id === state.pendingApprovalStepId)
    : null;
  const onLabel = pendingStep
    ? `⏸ on ${pendingStep.target_display ?? pendingStep.target ?? pendingStep.step_type}`
    : "running";

  state.stripMount.style.cssText = [
    "display:flex",
    "align-items:center",
    "gap:8px",
    "padding:4px 0 6px 0",
    "font-size:11px",
    "color:#52525b",
    "border:none",
    "background:transparent",
  ].join(";");
  state.stripMount.innerHTML = "";

  const status = document.createElement("div");
  status.style.cssText = "flex:1;letter-spacing:0.02em;";
  status.innerHTML = `${done}/${total} done &nbsp;·&nbsp; ${onLabel}`;
  state.stripMount.appendChild(status);

  const stopBtn = document.createElement("button");
  stopBtn.type = "button";
  stopBtn.textContent = "Stop plan";
  stopBtn.style.cssText = [
    "background:transparent",
    "color:#52525b",
    "border:none",
    "padding:0",
    "font-family:inherit",
    "font-size:11px",
    "cursor:pointer",
    "text-decoration:underline",
    "text-underline-offset:2px",
  ].join(";");
  stopBtn.onmouseenter = () => { stopBtn.style.color = "#fca5a5"; };
  stopBtn.onmouseleave = () => { stopBtn.style.color = "#52525b"; };
  stopBtn.onclick = async () => {
    if (!window.confirm("Stop this plan? Any completed steps stay saved.")) return;
    stopBtn.disabled = true;
    stopBtn.textContent = "Stopping…";
    state.controller?.abort();
    await submitAbandon(state.planId, state.session);
  };
  state.stripMount.appendChild(stopBtn);
}

async function submitAbandon(planId: string, session: Session): Promise<void> {
  try {
    await fetch(`/v1/brain/agent/plans/${planId}/abandon`, {
      method: "POST",
      headers: { Authorization: `Bearer ${session.access_token}` },
    });
  } catch { /* executor sees status next budget check */ }
}

function renderExhaustedRecovery(state: ExecutionState, event: Record<string, unknown>): void {
  const reason = event.reason as string;
  const reasonText = reason === "token_budget"
    ? "We've used the token budget for this plan"
    : "We've been at this a while";
  const nextStep = event.next_step as { target_display?: string; description?: string } | undefined;
  const nextLine = nextStep ? `\n\n⏸ Paused at: ${nextStep.target_display ?? "next step"}` : "";

  const bubble = state.appendBubble();
  bubble.classList.add("agent-md");
  bubble.innerHTML = formatMarkdown(
    `${reasonText} — I'm pausing the plan here so we don't waste tokens. The work that ran is saved.${nextLine}`
  );

  const row = document.createElement("div");
  row.style.cssText = "margin-top:10px;display:flex;gap:8px;align-items:center;";
  const keepBtn = makeButton("Keep going", primaryBtnStyle());
  keepBtn.onclick = () => {
    row.remove();
    void startExecutionStream({
      ...state,
      controller: null,
    });
    refreshPlanStrip(state);
  };
  row.appendChild(keepBtn);

  const laterBtn = makeButton("Save and continue later", secondaryBtnStyle());
  laterBtn.onclick = () => {
    row.remove();
    appendChatText(state.appendBubble, "_Saved. We can pick this up next time._");
  };
  row.appendChild(laterBtn);
  bubble.appendChild(row);
}

async function renderClosingSummary(state: ExecutionState): Promise<void> {
  // Drop a "thinking" placeholder bubble while raise(fn) writes the summary
  const bubble = state.appendBubble();
  bubble.classList.add("agent-md");
  bubble.innerHTML = `<div style="font-size:12px;color:#71717a;">_Wrapping up..._</div>`;
  try {
    const res = await fetch(`/v1/brain/agent/plans/${state.planId}/closing-summary`, {
      method: "POST",
      headers: { Authorization: `Bearer ${state.session.access_token}` },
    });
    if (!res.ok) {
      bubble.innerHTML = formatMarkdown(`_All done. What's next?_`);
      return;
    }
    const data = await res.json();
    bubble.innerHTML = formatMarkdown(data.summary || "_All done. What's next?_");
  } catch {
    bubble.innerHTML = formatMarkdown(`_All done. What's next?_`);
  }
}

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
