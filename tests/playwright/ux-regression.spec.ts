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

test.describe("Next up pill states", () => {
  test("state: no-deck — pill prompts upload", async ({ page }) => {
    await mockSidebarState(page, { documents: [], matches: { total_unique: 0, batches_count: 0, latest_batch: null } });
    await page.goto("/brain/deploy");
    const pill = page.locator(".nextup");
    await expect(pill).toBeVisible({ timeout: 15_000 });
    await expect(pill).toContainText(/Upload your deck/i);
  });

  test("state: no-matches — pill prompts pull matches", async ({ page }) => {
    await mockSidebarState(page, {
      documents: [{ id: "d1", filename: "deck.pdf", doc_type: "deck", created_at: new Date().toISOString() }],
      matches: { total_unique: 0, batches_count: 0, latest_batch: null },
    });
    await page.goto("/brain/deploy");
    const pill = page.locator(".nextup");
    await expect(pill).toBeVisible({ timeout: 15_000 });
    await expect(pill).toContainText(/[Pp]ull matches/i);
  });

  test("state: no-briefs — pill prompts brief generation", async ({ page }) => {
    await mockSidebarState(page, {
      documents: [{ id: "d1", filename: "deck.pdf", doc_type: "deck", created_at: new Date().toISOString() }],
      matches: { total_unique: 5, batches_count: 1, latest_batch: null },
      briefs: [],
    });
    await page.goto("/brain/deploy");
    const pill = page.locator(".nextup");
    await expect(pill).toBeVisible({ timeout: 15_000 });
    await expect(pill).toContainText(/brief/i);
  });

  test("state: new-signal — pill has HIGHEST priority even with other work pending", async ({ page }) => {
    // Simulate a founder with NO deck (would normally be no-deck state)
    // + an unack signal. The pill must show new-signal, not no-deck.
    await mockSidebarState(page, {
      documents: [],
      matches: { total_unique: 0, batches_count: 0, latest_batch: null },
      signals_unack_count: 1,
    });
    await page.goto("/brain/deploy");
    const pill = page.locator(".nextup");
    await expect(pill).toBeVisible({ timeout: 15_000 });
    await expect(pill.locator(".nextup-label")).toContainText(/New signal/i);
    // Action button should read Open signals
    await expect(pill.locator(".nextup-action")).toContainText(/Open signals/i);
  });

  test("state: current — pill enters done state with no action button", async ({ page }) => {
    // Everything done: deck, matches, briefs, active pipeline, no stale, no meetings.
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
          days_since_update: 2, // recent
          meeting_scheduled_for: null,
        },
      ],
      signals_unack_count: 0,
    });
    await page.goto("/brain/deploy");
    const pill = page.locator(".nextup");
    await expect(pill).toBeVisible({ timeout: 15_000 });
    await expect(pill).toHaveClass(/nextup-done/);
    // No action button in done state
    await expect(pill.locator(".nextup-action")).toHaveCount(0);
  });
});

test.describe("empty state chips (try: '<command>')", () => {
  test("Matches panel empty state shows 'try: pull matches' chip", async ({ page }) => {
    await page.goto("/brain/deploy");
    await expect(page.getByRole("button", { name: /Open Matches/i })).toBeVisible({ timeout: 15_000 });
    await page.getByRole("button", { name: /Open Matches/i }).click();
    await expect(page.locator(".mp-empty-cmd")).toContainText(/pull matches/i);
  });

  test("Briefs panel empty state shows 'try: brief …' chip", async ({ page }) => {
    await page.goto("/brain/deploy");
    await expect(page.getByRole("button", { name: /Open Briefs/i })).toBeVisible({ timeout: 15_000 });
    await page.getByRole("button", { name: /Open Briefs/i }).click();
    await expect(page.locator(".bp-empty-cmd")).toContainText(/brief/i);
  });

  test("Pipeline panel empty state shows 'try: log a call' chip", async ({ page }) => {
    await page.goto("/brain/deploy");
    await expect(page.getByRole("button", { name: /Open Pipeline/i })).toBeVisible({ timeout: 15_000 });
    await page.getByRole("button", { name: /Open Pipeline/i }).click();
    await expect(page.locator(".pp-empty-cmd")).toContainText(/log a call/i);
  });

  test("Signals panel empty state shows 'nothing to do' chip", async ({ page }) => {
    await page.goto("/brain/deploy");
    await expect(page.getByRole("button", { name: /Open Signals/i })).toBeVisible({ timeout: 15_000 });
    await page.getByRole("button", { name: /Open Signals/i }).click();
    await expect(page.locator(".sig-panel-empty-cmd")).toContainText(/nothing to do/i);
  });

  test("Documents panel empty state shows Google Slides hint", async ({ page }) => {
    await page.goto("/brain/deploy");
    await expect(page.getByRole("button", { name: /Open Documents/i })).toBeVisible({ timeout: 15_000 });
    await page.getByRole("button", { name: /Open Documents/i }).click();
    await expect(page.locator(".docs-state-cmd")).toContainText(/Google Slides/i);
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
