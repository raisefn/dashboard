import { NextResponse } from "next/server";

// Server-side proxy for the tracker search endpoint.
//
// The tracker API requires X-API-Key auth on every route, including
// /v1/search. The dashboard's <TrackerSearch> component runs in the
// browser and can't safely hold the API key (anything NEXT_PUBLIC_* is
// visible to anyone with devtools). So instead the client calls THIS
// same-origin route, which runs on the server, attaches the API key
// from process.env, and forwards to tracker.
//
// Why this didn't work before today: the search component called the
// tracker URL directly. Without an API key it got 401; with the API
// key publicly exposed it would have been a security hole.

const TRACKER_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const API_KEY = process.env.API_KEY || "";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";
  const limit = searchParams.get("limit") || "8";
  const type = searchParams.get("type") || "all";

  if (q.length < 2) {
    return NextResponse.json({ results: [] });
  }

  if (!API_KEY) {
    return NextResponse.json(
      { error: "Search unavailable" },
      { status: 500 }
    );
  }

  const url = new URL("/v1/search", TRACKER_URL);
  url.searchParams.set("q", q);
  url.searchParams.set("limit", limit);
  url.searchParams.set("type", type);

  try {
    const resp = await fetch(url.toString(), {
      headers: { "X-API-Key": API_KEY },
      // Cache nothing — search is dynamic
      cache: "no-store",
    });

    if (!resp.ok) {
      return NextResponse.json(
        { error: `Tracker search failed: ${resp.status}` },
        { status: resp.status }
      );
    }

    const data = await resp.json();
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Unknown error" },
      { status: 500 }
    );
  }
}
