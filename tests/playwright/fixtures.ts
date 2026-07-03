import { test as base, type Page } from "@playwright/test";

/**
 * Route interceptors + auth stub for raise(fn) UX regression tests.
 *
 * Every /v1/brain/* API call gets mocked. No real backend. No real auth.
 * A fake Supabase session is written to localStorage so the deploy page
 * skips its auth redirect and mounts.
 *
 * Each spec calls `installDefaults()` in beforeEach, then can override
 * specific routes via `mockRoute()` before navigating.
 */

// ─── Default mocked API state ─────────────────────────────────────

// Loose typing on purpose — specs override slices via a plain spread
// (`{ ...DEFAULT_SIDEBAR_STATE, documents: [...] }`). Narrow types on
// empty arrays would infer never[] and reject valid overrides.
type SidebarStateMock = {
  campaign: Record<string, unknown> | null;
  pipeline: Array<Record<string, unknown>>;
  matches: Record<string, unknown>;
  briefs: Array<Record<string, unknown>>;
  documents: Array<Record<string, unknown>>;
  activity: Array<Record<string, unknown>>;
  sharpen: Array<Record<string, unknown>>;
  signals_unack_count: number;
  acting_as_email: string | null;
};

export const DEFAULT_SIDEBAR_STATE: SidebarStateMock = {
  campaign: {
    id: "test-campaign",
    status: "active",
    target_amount_usd: 500000,
    stage: "seed",
    sector: "AI infrastructure",
    sectors: ["AI infrastructure"],
    description: "Test raise",
    days_in: 5,
    started_at: new Date().toISOString(),
  },
  pipeline: [],
  matches: { total_unique: 0, batches_count: 0, latest_batch: null },
  briefs: [],
  documents: [],
  activity: [],
  sharpen: [
    { id: "basics", title: "Basics", status: "empty" },
    { id: "story", title: "Story", status: "empty" },
    { id: "team", title: "Team & cap", status: "empty" },
    { id: "proof", title: "Proof", status: "empty" },
    { id: "past", title: "Past convos", status: "empty" },
  ],
  signals_unack_count: 0,
  acting_as_email: null,
};

export const EMPTY_SIGNALS_RESPONSE = { signals: [], total_unacknowledged: 0 };

export const EMPTY_CONNECTIONS_RESPONSE = { connections: [] };

// ─── Test helpers ─────────────────────────────────────────────────

export async function stubSupabaseSession(page: Page) {
  // supabase-js v2 stores the session flat (not wrapped in currentSession
  // like v1). Key format is `sb-<project-ref>-auth-token`.
  await page.addInitScript(() => {
    const nowSec = Math.floor(Date.now() / 1000);
    const fakeSession = {
      access_token: "test-access-token",
      refresh_token: "test-refresh-token",
      expires_at: nowSec + 3600,
      expires_in: 3600,
      token_type: "bearer",
      user: {
        id: "00000000-0000-0000-0000-000000000000",
        aud: "authenticated",
        role: "authenticated",
        email: "test@raisefn.local",
        email_confirmed_at: new Date().toISOString(),
        phone: "",
        confirmed_at: new Date().toISOString(),
        last_sign_in_at: new Date().toISOString(),
        app_metadata: { provider: "email", providers: ["email"] },
        user_metadata: { name: "Test Founder" },
        identities: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    };
    const supaKey = "sb-kvjhdubbcwvebfmncqot-auth-token";
    // v2 stores the raw session JSON, not wrapped.
    localStorage.setItem(supaKey, JSON.stringify(fakeSession));
  });

  // Intercept Supabase auth API calls so the client thinks the session
  // is valid. Without these, supabase-js tries to refresh on load, gets
  // a 401 from real Supabase for our fake refresh_token, wipes the
  // session, and redirects to /login.
  await page.route("**/auth/v1/user**", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        id: "00000000-0000-0000-0000-000000000000",
        email: "test@raisefn.local",
        aud: "authenticated",
        role: "authenticated",
        user_metadata: { name: "Test Founder" },
        app_metadata: { provider: "email" },
      }),
    }),
  );
  await page.route("**/auth/v1/token**", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        access_token: "test-access-token",
        refresh_token: "test-refresh-token",
        expires_at: Math.floor(Date.now() / 1000) + 3600,
        expires_in: 3600,
        token_type: "bearer",
        user: {
          id: "00000000-0000-0000-0000-000000000000",
          email: "test@raisefn.local",
        },
      }),
    }),
  );
}

export async function installDefaultRoutes(page: Page) {
  // Playwright route matching is REVERSE ORDER — last registered fires
  // first. So the catch-all MUST be registered FIRST (so it fires LAST),
  // then specific routes registered AFTER (so they fire FIRST). Specific
  // routes shadow the catch-all for their patterns.
  await page.route("**/v1/brain/**", (route) => {
    route.fulfill({ status: 200, contentType: "application/json", body: "{}" });
  });
  await page.route("**/v1/brain/sidebar-state", (route) =>
    route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(DEFAULT_SIDEBAR_STATE) }),
  );
  await page.route("**/v1/brain/signals", (route) =>
    route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(EMPTY_SIGNALS_RESPONSE) }),
  );
  await page.route("**/v1/brain/connections", (route) =>
    route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(EMPTY_CONNECTIONS_RESPONSE) }),
  );
  await page.route("**/v1/brain/matches**", (route) =>
    route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ batches: [] }) }),
  );
  await page.route("**/v1/brain/briefs**", (route) =>
    route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ briefs: [] }) }),
  );
  await page.route("**/v1/brain/pipeline**", (route) =>
    route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ investors: [] }) }),
  );
  await page.route("**/v1/brain/documents**", (route) =>
    route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ documents: [] }) }),
  );
  await page.route("**/v1/brain/sharpen-state**", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        summary: "",
        sections: DEFAULT_SIDEBAR_STATE.sharpen.map((s) => ({
          ...s,
          why_it_matters: "Test description",
          fields_filled: [],
          fields_missing: ["timeline", "instrument"],
          data: {},
        })),
        acting_as_email: null,
      }),
    }),
  );
  await page.route("**/v1/brain/me**", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        email: "test@raisefn.local",
        role: "founder",
        tier: "pro",
        is_admin: false,
      }),
    }),
  );
}

// ─── Extended test with auth + route stubs pre-installed ──────────

export const test = base.extend({
  page: async ({ page }, use) => {
    await stubSupabaseSession(page);
    await installDefaultRoutes(page);
    await use(page);
  },
});

export { expect } from "@playwright/test";
