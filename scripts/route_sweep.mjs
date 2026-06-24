#!/usr/bin/env node
// Dashboard route reachability sweep — verifies every public URL returns
// 200 (or 30x → expected destination), and every documented redirect
// lands where it's supposed to. Catches the /brain/briefs/<token> vs
// /brief/<token> class of bug at the link-target level.
//
// What this catches:
//   - Hard 404s on routes that should exist
//   - 500s from build/runtime errors on a page
//   - Redirects that point to the wrong place
//   - llms.txt / sitemap.xml / robots.txt regressions
//   - feed.xml RSS regressions
//
// What this does NOT catch:
//   - Inside-page broken links (the page renders, but a button leads to 404)
//   - Auth-gated route behavior (those need a real session)
//   - JavaScript runtime errors after the page loads
//
// Run:
//   node scripts/route_sweep.mjs                              # default www.raisefn.com
//   BASE_URL=http://localhost:3000 node scripts/route_sweep.mjs   # local dev
//
// IMPORTANT: use www.raisefn.com (not the apex). The apex 307s to www
// for all paths — a sweep against apex marks every redirect destination
// as "wrong" because it sees the apex→www hop instead of the real Next.js
// redirect rule.

const BASE_URL = (process.env.BASE_URL || "https://www.raisefn.com").replace(/\/$/, "");

const PASS = "\x1b[32m✓\x1b[0m";
const FAIL = "\x1b[31m✗\x1b[0m";
const SKIP = "\x1b[33m·\x1b[0m";
const DIM = "\x1b[2m";
const END = "\x1b[0m";
const BOLD = "\x1b[1m";

const results = [];

function report(name, ok, detail = "") {
  results.push({ name, ok, detail });
  console.log(`  ${ok ? PASS : FAIL} ${name}${detail ? ` ${DIM}— ${detail}${END}` : ""}`);
}

function section(title) {
  console.log(`\n${BOLD}${title}${END}`);
}

async function head(path, opts = {}) {
  const { redirect = "manual", expectStatus = 200 } = opts;
  const url = `${BASE_URL}${path}`;
  try {
    // Use GET (some platforms don't handle HEAD on redirects cleanly).
    const r = await fetch(url, { redirect, method: "GET" });
    return { url, status: r.status, location: r.headers.get("location"), ok: true };
  } catch (e) {
    return { url, status: 0, error: String(e), ok: false };
  }
}

async function expect200(path, name) {
  const r = await head(path, { redirect: "follow", expectStatus: 200 });
  if (!r.ok) {
    report(name, false, r.error);
    return;
  }
  report(name, r.status === 200, `${r.status} ${r.url}`);
}

async function expectRedirect(from, to, name) {
  // Use redirect: "manual" so we can inspect the Location header.
  const r = await head(from, { redirect: "manual" });
  if (!r.ok) {
    report(name, false, r.error);
    return;
  }
  const isRedirect = r.status >= 300 && r.status < 400;
  if (!isRedirect) {
    report(name, false, `expected 30x, got ${r.status}`);
    return;
  }
  // Normalize Location (some Next.js redirects use absolute URLs).
  const loc = r.location || "";
  const normalized = loc.startsWith("http") ? new URL(loc).pathname + new URL(loc).search : loc;
  const matches = normalized === to || normalized.startsWith(to);
  report(name, matches, `${r.status} → ${normalized}`);
}

async function expectContains(path, snippet, name) {
  const url = `${BASE_URL}${path}`;
  try {
    const r = await fetch(url, { redirect: "follow" });
    if (r.status !== 200) {
      report(name, false, `HTTP ${r.status}`);
      return;
    }
    const body = await r.text();
    report(name, body.includes(snippet), body.includes(snippet) ? "" : `missing "${snippet.slice(0, 40)}…"`);
  } catch (e) {
    report(name, false, String(e));
  }
}

async function main() {
  console.log(`\nDashboard route sweep against ${BOLD}${BASE_URL}${END}`);

  section("1. Public marketing routes");
  await expect200("/", "GET /");
  await expect200("/founders", "GET /founders");
  await expect200("/investors", "GET /investors");
  await expect200("/agents", "GET /agents");
  await expect200("/faq", "GET /faq");
  await expect200("/raise-intel", "GET /raise-intel");

  section("2. SEO / discovery files");
  await expect200("/robots.txt", "GET /robots.txt");
  await expect200("/sitemap.xml", "GET /sitemap.xml");
  await expect200("/raise-intel/feed.xml", "GET /raise-intel/feed.xml");
  await expect200("/llms.txt", "GET /llms.txt");

  section("3. Investor signup (V2)");
  await expect200("/investors/join", "GET /investors/join");

  section("4. Legacy → v3 panel redirects");
  await expectRedirect("/brain/matches", "/brain/deploy?panel=matches", "GET /brain/matches → ?panel=matches");
  await expectRedirect("/brain/briefs", "/brain/deploy?panel=briefs", "GET /brain/briefs → ?panel=briefs");

  section("5. Marketing v3 audience-page redirects (301 permanent)");
  await expectRedirect("/brain/entrepreneurs", "/founders", "GET /brain/entrepreneurs → /founders");
  await expectRedirect("/brain/investors", "/investors", "GET /brain/investors → /investors");
  await expectRedirect("/brain/agents", "/agents", "GET /brain/agents → /agents");
  await expectRedirect("/sdk", "/agents", "GET /sdk → /agents");

  section("6. Brain product entry (auth-gated, but must NOT 500)");
  // /brain/deploy is the founder workspace. Unauthenticated it should
  // redirect to login or render the auth wall — either is fine. What
  // we want to catch is a 500.
  const deploy = await head("/brain/deploy", { redirect: "manual" });
  if (deploy.ok) {
    const acceptable = deploy.status === 200 || (deploy.status >= 300 && deploy.status < 400);
    report("GET /brain/deploy returns 200 or 30x (no 500)", acceptable, `HTTP ${deploy.status}`);
  } else {
    report("GET /brain/deploy returns 200 or 30x (no 500)", false, deploy.error);
  }

  section("7. Public brief route (404 for unknown token expected)");
  // The shape that matters: /brief/<token> is the public read URL,
  // /brain/briefs/<token> is the bug we already fixed. Verify a bogus
  // token under the WRONG path 404s and under the RIGHT path also 404s
  // (proves both endpoints exist).
  const wrongPath = await head("/brain/briefs/some-fake-token-xyz", { redirect: "manual" });
  // /brain/briefs (no trailing /token) hits the legacy redirect now.
  // We're testing whether /brain/briefs/<bogus> still 404s. It might
  // also redirect (since the prefix matches). Either way it should not
  // 500.
  report(
    "GET /brain/briefs/<token> does not 500 (legacy path)",
    wrongPath.ok && wrongPath.status !== 500,
    `HTTP ${wrongPath.status}`,
  );
  const rightPath = await head("/brief/some-fake-token-xyz", { redirect: "manual" });
  report(
    "GET /brief/<token> returns 404 or graceful page for unknown token",
    rightPath.ok && rightPath.status !== 500,
    `HTTP ${rightPath.status}`,
  );

  section("8. Content sanity checks");
  await expectContains("/llms.txt", "raise(fn)", "/llms.txt mentions raise(fn)");
  await expectContains("/robots.txt", "Sitemap", "/robots.txt declares Sitemap");
  await expectContains("/raise-intel/feed.xml", "<rss", "/raise-intel/feed.xml is RSS");

  // Summary
  const pass = results.filter(r => r.ok).length;
  const fail = results.filter(r => !r.ok).length;
  console.log(
    `\n${BOLD}Summary${END}: \x1b[32m${pass} pass\x1b[0m` +
    (fail ? `, \x1b[31m${fail} fail\x1b[0m` : ""),
  );
  if (fail) {
    console.log("\nFailures:");
    results.filter(r => !r.ok).forEach(r => {
      console.log(`  ${FAIL} ${r.name}: ${r.detail}`);
    });
    process.exit(1);
  }
}

main().catch(e => {
  console.error("\nUncaught error:", e);
  process.exit(2);
});
