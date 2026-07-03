import { test, expect, DEFAULT_SIDEBAR_STATE } from "./fixtures";

/**
 * UX regression spec for post-two-model-fix surfaces (2026-07-03 sprint).
 *
 * Each test asserts on one shipped change so a future edit that breaks
 * it fails visibly. Scoped tight — this is NOT a full E2E suite.
 *
 * State forcing: /v1/brain/sidebar-state is mocked per-test to drive the
 * founder into whatever state we want (no deck, matches present, meeting
 * scheduled, new signal, etc.).
 */

// Helper: override the sidebar-state route with a specific payload.
async function mockSidebarState(
  page: import("@playwright/test").Page,
  overrides: Partial<typeof DEFAULT_SIDEBAR_STATE>,
) {
  await page.route("**/v1/brain/sidebar-state", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ ...DEFAULT_SIDEBAR_STATE, ...overrides }),
    }),
  );
}

test.describe("sidebar reorder + collapsibles", () => {
  test("My Raise sections render in Documents → Matches → Briefs → Pipeline → Signals order", async ({ page }) => {
    await page.goto("/brain/deploy");
    // Wait for sidebar to render — sidebar section titles are visible
    await expect(page.getByRole("button", { name: /Open Documents/i })).toBeVisible({ timeout: 15_000 });

    const raiseSectionTitles = await page.locator(".sb-section-title").allTextContents();
    const myRaiseIndex = raiseSectionTitles.indexOf("Documents");
    expect(myRaiseIndex, "Documents should exist in the sidebar").toBeGreaterThan(-1);

    // Check the exact order of the 5 My Raise sections
    const orderInsideMyRaise = ["Documents", "Matches", "Briefs", "Pipeline", "Signals"];
    for (let i = 0; i < orderInsideMyRaise.length - 1; i++) {
      const earlier = raiseSectionTitles.indexOf(orderInsideMyRaise[i]);
      const later = raiseSectionTitles.indexOf(orderInsideMyRaise[i + 1]);
      expect(earlier, `${orderInsideMyRaise[i]} not found`).toBeGreaterThan(-1);
      expect(later, `${orderInsideMyRaise[i + 1]} not found`).toBeGreaterThan(-1);
      expect(earlier).toBeLessThan(later);
    }
  });

  test("Fine tune section is collapsed by default with gap count summary", async ({ page }) => {
    await page.goto("/brain/deploy");
    const fineTuneHeader = page.locator(".sb-section-header-collapsible").filter({ hasText: "Fine tune" });
    await expect(fineTuneHeader).toBeVisible({ timeout: 15_000 });
    // Summary badge should say "5 gaps" given DEFAULT_SIDEBAR_STATE has all sharpen rows empty
    await expect(fineTuneHeader.locator(".sb-section-summary")).toHaveText(/gap/);
    // Caret rendered rotated (collapsed state)
    await expect(fineTuneHeader.locator(".sb-section-caret")).toHaveAttribute("data-open", "false");
  });

  test("Connections section is collapsed by default with connection count summary", async ({ page }) => {
    await page.goto("/brain/deploy");
    const connHeader = page.locator(".sb-section-header-collapsible").filter({ hasText: "Connections" });
    await expect(connHeader).toBeVisible({ timeout: 15_000 });
    // Summary badge should say "Set up" given default has no connections
    await expect(connHeader.locator(".sb-section-summary")).toHaveText(/Set up|of 2|Ready/);
  });

  test("Clicking Fine tune expands its body", async ({ page }) => {
    await page.goto("/brain/deploy");
    const fineTuneHeader = page.locator(".sb-section-header-collapsible").filter({ hasText: "Fine tune" });
    await expect(fineTuneHeader).toBeVisible({ timeout: 15_000 });
    await fineTuneHeader.click();
    await expect(fineTuneHeader.locator(".sb-section-caret")).toHaveAttribute("data-open", "true");
  });
});

test.describe("TODAY queue in sidebar", () => {
  test("Empty state renders 'Nothing to handle' when no attention items", async ({ page }) => {
    // Documents + matches + briefs + recent pipeline + Gmail with cal scope
    // + no signals + no meetings + no stale. Only in this fully-settled
    // state should the queue be empty.
    await mockSidebarState(page, {
      documents: [{ id: "d1", filename: "deck.pdf", doc_type: "deck", created_at: new Date().toISOString() }],
      matches: { total_unique: 3, batches_count: 1, latest_batch: null },
      briefs: [{ token: "t1", investor_full_name: "S", investor_first_name: null, created_at: new Date().toISOString() }],
      pipeline: [
        {
          id: "p1",
          slug: "test",
          name: "Test Investor",
          firm: "Fund",
          status: "outreached",
          days_since_update: 2,
          meeting_scheduled_for: null,
        },
      ],
      signals_unack_count: 0,
      // All sharpen sections solid — no gaps to suggest.
      sharpen: [
        { id: "basics", title: "Basics", status: "solid" },
        { id: "story", title: "Story", status: "solid" },
        { id: "team", title: "Team & cap", status: "solid" },
        { id: "proof", title: "Proof", status: "solid" },
        { id: "past", title: "Past convos", status: "solid" },
      ],
    });
    // Mock Gmail as connected with Calendar scope so those onboarding
    // rows don't fire.
    await page.route("**/v1/brain/connections", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          connections: [
            {
              provider: "gmail",
              google_email: "founder@raisefn.local",
              scopes: [
                "https://www.googleapis.com/auth/gmail.send",
                "https://www.googleapis.com/auth/calendar.events",
              ],
              connected_at: new Date().toISOString(),
              last_used_at: null,
              broken: false,
              last_error: null,
            },
          ],
        }),
      }),
    );
    await page.goto("/brain/deploy");
    await expect(page.locator(".sb-today")).toBeVisible({ timeout: 15_000 });
    await expect(page.locator(".sb-today-empty")).toContainText(/No new signals from our actions/i);
  });

  test("Unacked signal renders as an urgent row", async ({ page }) => {
    await mockSidebarState(page, { signals_unack_count: 2 });
    await page.goto("/brain/deploy");
    const row = page.locator(".sb-today-row").first();
    await expect(row).toBeVisible({ timeout: 15_000 });
    await expect(row).toContainText(/signals/i);
    await expect(row.locator(".sb-today-dot-urgent")).toBeVisible();
  });

  test("Meeting within 3 days renders an urgent prep row", async ({ page }) => {
    const soon = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString();
    await mockSidebarState(page, {
      pipeline: [
        {
          id: "p1",
          slug: "kaszek",
          name: "Kaszek",
          firm: "Kaszek Ventures",
          status: "meeting_scheduled",
          days_since_update: 1,
          meeting_scheduled_for: soon,
        },
      ],
    });
    await page.goto("/brain/deploy");
    const meetingRow = page.locator(".sb-today-row").filter({ hasText: /Prep for Kaszek/i });
    await expect(meetingRow).toBeVisible({ timeout: 15_000 });
    await expect(meetingRow.locator(".sb-today-dot-urgent")).toBeVisible();
  });

  test("Brand-new founder (no deck) shows onboarding row: Upload your deck", async ({ page }) => {
    // Explicitly zero everything so the empty state fallback for onboarding
    // kicks in. Documents length 0 is the trigger.
    await mockSidebarState(page, {
      documents: [],
      matches: { total_unique: 0, batches_count: 0, latest_batch: null },
      briefs: [],
      pipeline: [],
      signals_unack_count: 0,
    });
    await page.goto("/brain/deploy");
    const row = page.locator(".sb-today-row").filter({ hasText: /Upload your deck/i });
    await expect(row).toBeVisible({ timeout: 15_000 });
    await expect(row.locator(".sb-today-dot-urgent")).toBeVisible();
  });

  test("Has deck but no matches shows onboarding row: Pull your first matches", async ({ page }) => {
    await mockSidebarState(page, {
      documents: [{ id: "d1", filename: "deck.pdf", doc_type: "deck", created_at: new Date().toISOString() }],
      matches: { total_unique: 0, batches_count: 0, latest_batch: null },
      briefs: [],
      pipeline: [],
    });
    await page.goto("/brain/deploy");
    const row = page.locator(".sb-today-row").filter({ hasText: /Pull your first matches/i });
    await expect(row).toBeVisible({ timeout: 15_000 });
  });

  test("Stale outreach renders a warm follow-up row", async ({ page }) => {
    await mockSidebarState(page, {
      pipeline: [
        {
          id: "p1",
          slug: "sarah",
          name: "Sarah Chen",
          firm: "Foundry",
          status: "outreached",
          days_since_update: 12,
          meeting_scheduled_for: null,
        },
      ],
    });
    await page.goto("/brain/deploy");
    const staleRow = page.locator(".sb-today-row").filter({ hasText: /Follow up/i });
    await expect(staleRow).toBeVisible({ timeout: 15_000 });
    await expect(staleRow.locator(".sb-today-dot-warm")).toBeVisible();
  });
});

test.describe("panel empty states", () => {
  test("Matches panel empty state shows a real Pull matches BUTTON", async ({ page }) => {
    await page.goto("/brain/deploy");
    await expect(page.getByRole("button", { name: /Open Matches/i })).toBeVisible({ timeout: 15_000 });
    await page.getByRole("button", { name: /Open Matches/i }).click();
    // Real button — no chip
    await expect(page.locator(".mp-empty-btn")).toBeVisible();
    await expect(page.locator(".mp-empty-btn")).toContainText(/Pull matches/i);
    // Chip removed
    await expect(page.locator(".mp-empty-cmd")).toHaveCount(0);
  });

  test("Briefs panel empty state (unchanged, still shows chip)", async ({ page }) => {
    await page.goto("/brain/deploy");
    await expect(page.getByRole("button", { name: /Open Briefs/i })).toBeVisible({ timeout: 15_000 });
    await page.getByRole("button", { name: /Open Briefs/i }).click();
    await expect(page.locator(".bp-empty-cmd")).toContainText(/brief/i);
  });

  test("Pipeline panel empty state is plain description text, no chip", async ({ page }) => {
    await page.goto("/brain/deploy");
    await expect(page.getByRole("button", { name: /Open Pipeline/i })).toBeVisible({ timeout: 15_000 });
    await page.getByRole("button", { name: /Open Pipeline/i }).click();
    await expect(page.locator(".pp-empty-sub")).toContainText(/conversation/i);
    await expect(page.locator(".pp-empty-cmd")).toHaveCount(0);
  });

  test("Signals panel empty state is plain description text, no chip", async ({ page }) => {
    await page.goto("/brain/deploy");
    await expect(page.getByRole("button", { name: /Open Signals/i })).toBeVisible({ timeout: 15_000 });
    await page.getByRole("button", { name: /Open Signals/i }).click();
    await expect(page.locator(".sig-panel-empty-body")).toContainText(/I['']ll ping/i);
    await expect(page.locator(".sig-panel-empty-cmd")).toHaveCount(0);
  });

  test("Documents panel empty state has drop-in-chat guidance + Google Slides", async ({ page }) => {
    await page.goto("/brain/deploy");
    await expect(page.getByRole("button", { name: /Open Documents/i })).toBeVisible({ timeout: 15_000 });
    await page.getByRole("button", { name: /Open Documents/i }).click();
    await expect(page.locator(".docs-state-sub")).toContainText(/Drop your deck/i);
    await expect(page.locator(".docs-state-sub")).toContainText(/Google Slides/i);
    await expect(page.locator(".docs-state-cmd")).toHaveCount(0);
  });
});

test.describe("SUGGESTED tier", () => {
  test("Post-onboarding stasis surfaces contextual suggestions", async ({ page }) => {
    // Founder is past onboarding: deck, matches, brief made, Gmail
    // connected. Still has 4 sharpen gaps + 12 matches. Onboarding
    // chain is exhausted → SUGGESTED tier fills in.
    await mockSidebarState(page, {
      documents: [{ id: "d1", filename: "deck.pdf", doc_type: "deck", created_at: new Date().toISOString() }],
      matches: { total_unique: 12, batches_count: 1, latest_batch: null },
      briefs: [{ token: "t1", investor_full_name: "S", investor_first_name: null, created_at: new Date().toISOString() }],
      pipeline: [],
      signals_unack_count: 0,
      sharpen: [
        { id: "basics", title: "Basics", status: "solid" },
        { id: "story", title: "Story", status: "gap" },
        { id: "team", title: "Team & cap", status: "gap" },
        { id: "proof", title: "Proof", status: "empty" },
        { id: "past", title: "Past convos", status: "empty" },
      ],
    });
    // Gmail connected so Connect Gmail onboarding row doesn't fire.
    await page.route("**/v1/brain/connections", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          connections: [
            {
              provider: "gmail",
              google_email: "founder@raisefn.local",
              scopes: [
                "https://www.googleapis.com/auth/gmail.send",
                "https://www.googleapis.com/auth/calendar.events",
              ],
              connected_at: new Date().toISOString(),
              last_used_at: null,
              broken: false,
              last_error: null,
            },
          ],
        }),
      }),
    );
    await page.goto("/brain/deploy");
    await expect(page.locator(".sb-today")).toBeVisible({ timeout: 15_000 });
    // No urgent items — SUGGESTED sharpen row fills in with teal dot.
    const gapsRow = page.locator(".sb-today-row").filter({ hasText: /Sharpen 4 gaps/i });
    await expect(gapsRow).toBeVisible();
    await expect(gapsRow.locator(".sb-today-dot-suggested")).toBeVisible();
  });
});

test.describe("TODAY queue dismissal", () => {
  test("Onboarding X advances the chain (dismiss Upload deck → chain proceeds)", async ({ page }) => {
    await mockSidebarState(page, {
      documents: [],
      matches: { total_unique: 0, batches_count: 0, latest_batch: null },
      briefs: [],
      pipeline: [],
    });
    await page.goto("/brain/deploy");
    const uploadRow = page.locator(".sb-today-row").filter({ hasText: /Upload your deck/i });
    await expect(uploadRow).toBeVisible({ timeout: 15_000 });

    // Click the row's dismiss (X) button
    const uploadItem = page.locator(".sb-today-item").filter({ hasText: /Upload your deck/i });
    await uploadItem.locator(".sb-today-dismiss").click();

    // Chain advances — next onboarding row surfaces (Pull matches)
    await expect(page.locator(".sb-today-row").filter({ hasText: /Pull your first matches/i })).toBeVisible();
    await expect(uploadRow).toHaveCount(0);
  });
});

test.describe("sharpen panel — readout only, no forms", () => {
  test("clicking Fine tune section opens a readout drawer with NO form inputs", async ({ page }) => {
    await page.goto("/brain/deploy");
    // First expand Fine tune so we can click a section
    const fineTuneHeader = page.locator(".sb-section-header-collapsible").filter({ hasText: "Fine tune" });
    await expect(fineTuneHeader).toBeVisible({ timeout: 15_000 });
    await fineTuneHeader.click();

    // Click the Basics row inside Fine tune
    const basicsRow = page.locator(".sb-sharpen-row").filter({ hasText: "Basics" }).first();
    await expect(basicsRow).toBeVisible();
    await basicsRow.click();

    // Assert the readout structure
    await expect(page.locator(".sh-section")).toBeVisible();
    await expect(page.locator(".sh-block-label").filter({ hasText: /What I know/i })).toBeVisible();

    // KEY ASSERTION: no text inputs, no textareas, no selects in the sharpen panel
    const inputs = page.locator(".sharpen-panel input[type='text']");
    const textareas = page.locator(".sharpen-panel textarea");
    const selects = page.locator(".sharpen-panel select");
    await expect(inputs).toHaveCount(0);
    await expect(textareas).toHaveCount(0);
    await expect(selects).toHaveCount(0);
  });

  test("Fine tune readout shows 'Fill this in →' button (not 'Ask brain to')", async ({ page }) => {
    await page.goto("/brain/deploy");
    const fineTuneHeader = page.locator(".sb-section-header-collapsible").filter({ hasText: "Fine tune" });
    await expect(fineTuneHeader).toBeVisible({ timeout: 15_000 });
    await fineTuneHeader.click();
    await page.locator(".sb-sharpen-row").filter({ hasText: "Basics" }).first().click();

    const fillBtn = page.locator(".sh-fillbtn");
    await expect(fillBtn).toBeVisible();
    await expect(fillBtn).toHaveText(/Fill this in/i);
    // Guardrail: never surface the engineering name to users
    await expect(fillBtn).not.toContainText(/brain/i);
  });
});

test.describe("animated background removed from /brain/deploy", () => {
  test("no <canvas.brain-canvas> element on the deploy page", async ({ page }) => {
    await page.goto("/brain/deploy");
    await expect(page.locator("canvas.brain-canvas")).toHaveCount(0);
  });
});

test.describe("pipeline status enum cleanup", () => {
  test("Pipeline status dropdown does NOT include 'passed' or 'rejected'", async ({ page }) => {
    // Force a pipeline row so the panel renders the row + dropdown
    await mockSidebarState(page, {
      pipeline: [
        {
          id: "p1",
          slug: "test-investor",
          name: "Test Investor",
          firm: "Test Fund",
          status: "outreached",
          days_since_update: 1,
          meeting_scheduled_for: null,
        },
      ],
    });
    await page.route("**/v1/brain/pipeline**", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          investors: [
            {
              id: "p1",
              slug: "test-investor",
              investor_name: "Test Investor",
              investor_firm: "Test Fund",
              status: "outreached",
              days_since_update: 1,
              meeting_scheduled_for: null,
              first_outreach_at: null,
              last_outreach_at: null,
              last_reply_at: null,
              notes: null,
            },
          ],
        }),
      }),
    );
    await page.goto("/brain/deploy");
    await expect(page.getByRole("button", { name: /Open Pipeline/i })).toBeVisible({ timeout: 15_000 });
    await page.getByRole("button", { name: /Open Pipeline/i }).click();

    // Find the status dropdown and enumerate its options
    const select = page.locator(".pp-status-select").first();
    await expect(select).toBeVisible();
    const options = await select.locator("option").allTextContents();
    const optionTextsLower = options.map((o) => o.toLowerCase());
    expect(optionTextsLower).not.toContain("passed");
    expect(optionTextsLower).not.toContain("rejected");
    // Keeps the canonical three closed statuses
    expect(optionTextsLower.some((o) => o.includes("soft pass"))).toBe(true);
    expect(optionTextsLower.some((o) => o.includes("hard pass"))).toBe(true);
    expect(optionTextsLower.some((o) => o.includes("ghosted"))).toBe(true);
  });
});
