import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright config for raise(fn) dashboard UX regression tests.
 *
 * Scope: tests do NOT hit a real backend. All /v1/brain/* responses are
 * intercepted and mocked in each spec. This is deliberate:
 *   - No test-account setup required
 *   - Tests can force any founder state (mock the sidebar-state response)
 *   - No API keys / secrets needed in CI
 *
 * To run:
 *   npx playwright test               # headless, all specs
 *   npx playwright test --headed      # see the browser
 *   npx playwright test --ui          # interactive UI mode
 *   npx playwright show-report        # after a run, view HTML report
 */
export default defineConfig({
  testDir: "./tests/playwright",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [["html", { open: "never" }], ["list"]],
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
  ],
  webServer: process.env.PLAYWRIGHT_BASE_URL
    ? undefined
    : {
        command: "npm run dev",
        url: "http://localhost:3000",
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      },
});
